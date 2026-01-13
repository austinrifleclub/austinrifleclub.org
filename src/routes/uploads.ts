/**
 * File Upload API Routes
 *
 * Handles file uploads to Cloudflare R2 for applications and documents.
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { Env } from "../lib/auth";
import { requireAuth, requireAdmin, optionalAuth, AuthContext } from "../middleware/auth";
import { createDb } from "../db";
import { applications, documents } from "../db/schema";
import { generateId } from "../lib/utils";
import { logAudit } from "../lib/audit";
import { ValidationError, NotFoundError } from "../lib/errors";

const app = new Hono<{ Bindings: Env & { R2: R2Bucket } }>();

// Allowed file types and max sizes
const ALLOWED_TYPES: Record<string, { mimes: string[]; maxSize: number }> = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  document: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  any: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 25 * 1024 * 1024, // 25MB
  },
};

/**
 * Generate a unique filename for R2
 */
function generateR2Key(folder: string, originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${folder}/${timestamp}-${random}.${ext}`;
}

/**
 * POST /api/uploads/application/:id/government-id
 * Upload government ID for application
 */
app.post("/application/:id/government-id", requireAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");
  const applicationId = c.req.param("id");

  // Verify the application belongs to the user
  const application = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });

  if (!application || application.userId !== user.id) {
    throw new NotFoundError("Application", applicationId);
  }

  if (!["draft", "documents_pending"].includes(application.status)) {
    throw new ValidationError("Application is not accepting documents");
  }

  // Parse multipart form data
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ValidationError("No file provided");
  }

  // Validate file type and size
  const config = ALLOWED_TYPES.document;
  if (!config.mimes.includes(file.type)) {
    throw new ValidationError(`Invalid file type. Allowed: ${config.mimes.join(", ")}`);
  }

  if (file.size > config.maxSize) {
    throw new ValidationError(`File too large. Max size: ${config.maxSize / 1024 / 1024}MB`);
  }

  // Upload to R2
  const key = generateR2Key(`applications/${applicationId}`, `government-id-${file.name}`);
  const arrayBuffer = await file.arrayBuffer();

  await c.env.R2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      applicationId,
      uploadedBy: user.id,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Update application with file URL
  const fileUrl = `r2://${key}`;
  await db
    .update(applications)
    .set({
      governmentIdUrl: fileUrl,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId));

  return c.json({
    success: true,
    key,
    url: fileUrl,
    filename: file.name,
    size: file.size,
    type: file.type,
  });
});

/**
 * POST /api/uploads/application/:id/background-consent
 * Upload background consent form for application
 */
app.post("/application/:id/background-consent", requireAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");
  const applicationId = c.req.param("id");

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });

  if (!application || application.userId !== user.id) {
    throw new NotFoundError("Application", applicationId);
  }

  if (!["draft", "documents_pending"].includes(application.status)) {
    throw new ValidationError("Application is not accepting documents");
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ValidationError("No file provided");
  }

  const config = ALLOWED_TYPES.document;
  if (!config.mimes.includes(file.type)) {
    throw new ValidationError(`Invalid file type. Allowed: ${config.mimes.join(", ")}`);
  }

  if (file.size > config.maxSize) {
    throw new ValidationError(`File too large. Max size: ${config.maxSize / 1024 / 1024}MB`);
  }

  const key = generateR2Key(`applications/${applicationId}`, `background-consent-${file.name}`);
  const arrayBuffer = await file.arrayBuffer();

  await c.env.R2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      applicationId,
      uploadedBy: user.id,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  const fileUrl = `r2://${key}`;
  await db
    .update(applications)
    .set({
      backgroundConsentUrl: fileUrl,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, applicationId));

  return c.json({
    success: true,
    key,
    url: fileUrl,
    filename: file.name,
    size: file.size,
    type: file.type,
  });
});

/**
 * POST /api/uploads/document
 * Upload a general document (admin only)
 */
app.post("/document", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string || file?.name || "Untitled";
  const category = formData.get("category") as string || "general";
  const description = formData.get("description") as string || "";
  const accessLevel = (formData.get("accessLevel") as string) || "member";

  if (!file) {
    throw new ValidationError("No file provided");
  }

  const config = ALLOWED_TYPES.any;
  if (!config.mimes.includes(file.type)) {
    throw new ValidationError(`Invalid file type. Allowed: ${config.mimes.join(", ")}`);
  }

  if (file.size > config.maxSize) {
    throw new ValidationError(`File too large. Max size: ${config.maxSize / 1024 / 1024}MB`);
  }

  const key = generateR2Key(`documents/${category}`, file.name);
  const arrayBuffer = await file.arrayBuffer();

  await c.env.R2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      uploadedBy: admin.id,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  // Create document record
  const documentId = generateId();
  const [document] = await db
    .insert(documents)
    .values({
      id: documentId,
      title,
      description,
      category,
      fileUrl: `r2://${key}`,
      fileType: file.type,
      fileSize: file.size,
      accessLevel,
      createdBy: admin.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Log to audit
  await logAudit(db, {
    action: 'document.upload',
    targetType: 'document',
    targetId: documentId,
    actorId: admin.id,
    details: { title, category, accessLevel },
  });

  return c.json({
    success: true,
    document,
    key,
  }, 201);
});

/**
 * GET /api/uploads/document/:id
 * Get a document file (generates signed URL or streams)
 */
app.get("/document/:id", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const id = c.req.param("id");
  const user = c.get("user");

  const document = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });

  if (!document) {
    throw new NotFoundError("Document", id);
  }

  // Check access based on accessLevel
  if (document.accessLevel !== 'public' && !user) {
    throw new NotFoundError("Document", id);
  }

  // Extract R2 key from URL
  const key = document.fileUrl.replace("r2://", "");
  const object = await c.env.R2.get(key);

  if (!object) {
    throw new NotFoundError("File in storage");
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": document.fileType,
      "Content-Length": (document.fileSize || 0).toString(),
      "Content-Disposition": `inline; filename="${document.title}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
});

/**
 * DELETE /api/uploads/document/:id
 * Delete a document (admin only)
 */
app.delete("/document/:id", requireAdmin, async (c) => {
  const db = c.get("db");
  const admin = c.get("member");
  const id = c.req.param("id");

  const document = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });

  if (!document) {
    throw new NotFoundError("Document", id);
  }

  // Delete from R2
  const key = document.fileUrl.replace("r2://", "");
  await c.env.R2.delete(key);

  // Delete record
  await db.delete(documents).where(eq(documents.id, id));

  // Log to audit
  await logAudit(db, {
    action: 'document.delete',
    targetType: 'document',
    targetId: id,
    actorId: admin.id,
    actorType: 'admin',
    details: { title: document.title },
    ipAddress: c.req.header('cf-connecting-ip'),
  });

  return c.json({ success: true });
});

/**
 * GET /api/uploads/documents
 * List documents (public docs for all, all docs for members)
 */
app.get("/documents", optionalAuth, async (c) => {
  const db = c.get("db")!;
  const user = c.get("user");
  const category = c.req.query("category");

  let documentList;

  if (user) {
    // Authenticated user can see all documents
    documentList = await db.query.documents.findMany({
      where: category ? eq(documents.category, category) : undefined,
      orderBy: (d, { desc }) => [desc(d.createdAt)],
    });
  } else {
    // Public user only sees public documents
    documentList = await db.query.documents.findMany({
      where: category
        ? and(eq(documents.accessLevel, 'public'), eq(documents.category, category))
        : eq(documents.accessLevel, 'public'),
      orderBy: (d, { desc }) => [desc(d.createdAt)],
    });
  }

  return c.json(documentList);
});

export default app;
