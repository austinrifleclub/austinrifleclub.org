/**
 * Email Service
 *
 * Handles sending transactional emails via Resend.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ResendResponse {
  id?: string;
  error?: string;
}

const FROM_EMAIL = 'Austin Rifle Club <noreply@austinrifleclub.org>';

export async function sendEmail(
  apiKey: string,
  options: EmailOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!apiKey) {
    console.log('[Email] No API key, logging email instead:');
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    return { success: true, id: 'dev-mode' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const data: ResendResponse = await response.json();

    if (!response.ok) {
      console.error('[Email] Failed to send:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('[Email] Error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Email Templates

export function passwordResetEmail(resetUrl: string): { subject: string; html: string; text: string } {
  return {
    subject: 'Reset Your Password - Austin Rifle Club',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">Reset Your Password</h2>
        <p>You requested a password reset for your Austin Rifle Club account.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Reset Your Password - Austin Rifle Club

You requested a password reset for your Austin Rifle Club account.

Click the link below to set a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, you can safely ignore this email.

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function welcomeEmail(firstName: string): { subject: string; html: string; text: string } {
  return {
    subject: 'Welcome to Austin Rifle Club!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">Welcome, ${firstName}!</h2>
        <p>Your membership application has been approved. Welcome to the Austin Rifle Club family!</p>
        <h3>What's Next?</h3>
        <ul>
          <li>Check <a href="https://austinrifleclub.org/range-status" style="color: #166534;">Range Status</a> before visiting</li>
          <li>Review our <a href="https://austinrifleclub.org/range-rules" style="color: #166534;">Range Rules</a></li>
          <li>Browse upcoming <a href="https://austinrifleclub.org/calendar" style="color: #166534;">Events</a></li>
          <li>Sign in to your <a href="https://austinrifleclub.org/dashboard" style="color: #166534;">Member Dashboard</a></li>
        </ul>
        <p>Your member badge will be available at the clubhouse. Please bring a valid ID on your first visit.</p>
        <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">Club Hours</h4>
          <p style="margin-bottom: 0;"><strong>All Ranges:</strong> Sunrise to Sunset, 7 Days a Week</p>
        </div>
        <p>Questions? Reply to this email or contact us at info@austinrifleclub.org</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Welcome to Austin Rifle Club, ${firstName}!

Your membership application has been approved. Welcome to the Austin Rifle Club family!

What's Next?
- Check Range Status before visiting: https://austinrifleclub.org/range-status
- Review our Range Rules: https://austinrifleclub.org/range-rules
- Browse upcoming Events: https://austinrifleclub.org/calendar
- Sign in to your Member Dashboard: https://austinrifleclub.org/dashboard

Your member badge will be available at the clubhouse. Please bring a valid ID on your first visit.

Club Hours: Sunrise to Sunset, 7 Days a Week

Questions? Reply to this email or contact us at info@austinrifleclub.org

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function eventRegistrationEmail(
  firstName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  isWaitlisted: boolean = false
): { subject: string; html: string; text: string } {
  const status = isWaitlisted ? 'Waitlist Confirmation' : 'Registration Confirmed';
  return {
    subject: `${status}: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">${status}</h2>
        <p>Hi ${firstName},</p>
        <p>${isWaitlisted ? "You've been added to the waitlist for:" : "You're registered for:"}</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #166534; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">${eventTitle}</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${eventLocation}</p>
        </div>
        ${isWaitlisted ? '<p>We\'ll notify you if a spot opens up.</p>' : '<p>See you there!</p>'}
        <p>
          <a href="https://austinrifleclub.org/dashboard" style="color: #166534;">View your registrations</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
${status} - Austin Rifle Club

Hi ${firstName},

${isWaitlisted ? "You've been added to the waitlist for:" : "You're registered for:"}

${eventTitle}
Date: ${eventDate}
Location: ${eventLocation}

${isWaitlisted ? "We'll notify you if a spot opens up." : "See you there!"}

View your registrations: https://austinrifleclub.org/dashboard

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function applicationReceivedEmail(firstName: string): { subject: string; html: string; text: string } {
  return {
    subject: 'Application Received - Austin Rifle Club',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">Application Received</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for applying to join Austin Rifle Club! We've received your membership application.</p>
        <h3>What happens next?</h3>
        <ol>
          <li>Our membership committee will review your application</li>
          <li>You'll receive an email within 5-7 business days with our decision</li>
          <li>If approved, you'll receive payment instructions and orientation details</li>
        </ol>
        <p>Questions about your application? Contact us at info@austinrifleclub.org</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Application Received - Austin Rifle Club

Hi ${firstName},

Thank you for applying to join Austin Rifle Club! We've received your membership application.

What happens next?
1. Our membership committee will review your application
2. You'll receive an email within 5-7 business days with our decision
3. If approved, you'll receive payment instructions and orientation details

Questions about your application? Contact us at info@austinrifleclub.org

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function applicationStatusUpdateEmail(
  firstName: string,
  status: string,
  message?: string
): { subject: string; html: string; text: string } {
  const statusMessages: Record<string, { title: string; body: string }> = {
    documents_approved: {
      title: 'Documents Approved',
      body: 'Your documents have been reviewed and approved. You can now proceed with payment.',
    },
    paid: {
      title: 'Payment Received',
      body: 'We\'ve received your payment. Your application will be scheduled for the next safety orientation.',
    },
    safety_scheduled: {
      title: 'Safety Orientation Scheduled',
      body: 'Your safety orientation has been scheduled. Please check your dashboard for the date and time.',
    },
    safety_complete: {
      title: 'Safety Orientation Complete',
      body: 'You\'ve completed the safety orientation. Your application will now be presented to the Board of Directors for approval.',
    },
    pending_vote: {
      title: 'Application Under Review',
      body: 'Your application is being reviewed by the Board of Directors. You\'ll be notified of the decision shortly.',
    },
  };

  const statusInfo = statusMessages[status] || {
    title: 'Application Update',
    body: message || 'There has been an update to your application.',
  };

  return {
    subject: `${statusInfo.title} - Austin Rifle Club`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">${statusInfo.title}</h2>
        <p>Hi ${firstName},</p>
        <p>${statusInfo.body}</p>
        ${message ? `<p><strong>Note:</strong> ${message}</p>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://austinrifleclub.org/apply/status" style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Application</a>
        </div>
        <p>Questions? Contact us at info@austinrifleclub.org</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
${statusInfo.title} - Austin Rifle Club

Hi ${firstName},

${statusInfo.body}

${message ? `Note: ${message}` : ''}

View your application: https://austinrifleclub.org/apply/status

Questions? Contact us at info@austinrifleclub.org

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function applicationRejectedEmail(
  firstName: string,
  reason: string
): { subject: string; html: string; text: string } {
  return {
    subject: 'Application Update - Austin Rifle Club',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">Application Update</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for your interest in joining Austin Rifle Club. After careful consideration, we regret to inform you that we are unable to approve your membership application at this time.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>If you have any questions or believe this decision was made in error, please contact us at info@austinrifleclub.org.</p>
        <p>If applicable, any payments made will be refunded within 5-10 business days.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Application Update - Austin Rifle Club

Hi ${firstName},

Thank you for your interest in joining Austin Rifle Club. After careful consideration, we regret to inform you that we are unable to approve your membership application at this time.

Reason: ${reason}

If you have any questions or believe this decision was made in error, please contact us at info@austinrifleclub.org.

If applicable, any payments made will be refunded within 5-10 business days.

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function eventCancellationEmail(
  firstName: string,
  eventTitle: string,
  eventDate: string,
  reason?: string,
  refundAmount?: number
): { subject: string; html: string; text: string } {
  return {
    subject: `Event Cancelled: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #dc2626;">Event Cancelled</h2>
        <p>Hi ${firstName},</p>
        <p>We regret to inform you that the following event has been cancelled:</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${eventTitle}</h3>
          <p style="margin: 5px 0;"><strong>Originally scheduled:</strong> ${eventDate}</p>
          ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        ${refundAmount ? `<p><strong>Refund:</strong> $${(refundAmount / 100).toFixed(2)} will be credited to your original payment method within 5-10 business days.</p>` : ''}
        <p>We apologize for any inconvenience. Please check our calendar for other upcoming events.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://austinrifleclub.org/calendar" style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Calendar</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Event Cancelled - Austin Rifle Club

Hi ${firstName},

We regret to inform you that the following event has been cancelled:

${eventTitle}
Originally scheduled: ${eventDate}
${reason ? `Reason: ${reason}` : ''}

${refundAmount ? `Refund: $${(refundAmount / 100).toFixed(2)} will be credited to your original payment method within 5-10 business days.` : ''}

We apologize for any inconvenience. Please check our calendar for other upcoming events:
https://austinrifleclub.org/calendar

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function registrationCancelledEmail(
  firstName: string,
  eventTitle: string,
  refundPercent: number,
  refundAmount: number
): { subject: string; html: string; text: string } {
  return {
    subject: `Registration Cancelled: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">Registration Cancelled</h2>
        <p>Hi ${firstName},</p>
        <p>Your registration for <strong>${eventTitle}</strong> has been cancelled.</p>
        ${refundAmount > 0 ? `
        <div style="background-color: #f0fdf4; border-left: 4px solid #166534; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Refund:</strong> $${(refundAmount / 100).toFixed(2)} (${refundPercent}% of registration fee)</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Will be credited within 5-10 business days.</p>
        </div>
        ` : '<p>Per our cancellation policy, no refund is available for cancellations made less than 2 days before the event.</p>'}
        <p>
          <a href="https://austinrifleclub.org/calendar" style="color: #166534;">Browse other events</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Registration Cancelled - Austin Rifle Club

Hi ${firstName},

Your registration for ${eventTitle} has been cancelled.

${refundAmount > 0 ? `Refund: $${(refundAmount / 100).toFixed(2)} (${refundPercent}% of registration fee)
Will be credited within 5-10 business days.` : 'Per our cancellation policy, no refund is available for cancellations made less than 2 days before the event.'}

Browse other events: https://austinrifleclub.org/calendar

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function waitlistPromotionEmail(
  firstName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
): { subject: string; html: string; text: string } {
  return {
    subject: `Spot Available: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">You're In!</h2>
        <p>Hi ${firstName},</p>
        <p>Great news! A spot has opened up and you've been moved from the waitlist to confirmed registration for:</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #166534; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">${eventTitle}</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>See you there!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://austinrifleclub.org/dashboard" style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Registration</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
You're In! - Austin Rifle Club

Hi ${firstName},

Great news! A spot has opened up and you've been moved from the waitlist to confirmed registration for:

${eventTitle}
Date: ${eventDate}
Location: ${eventLocation}

See you there!

View your registration: https://austinrifleclub.org/dashboard

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}

export function adminNotificationEmail(
  subject: string,
  body: string,
  actionUrl?: string,
  actionText?: string
): { subject: string; html: string; text: string } {
  return {
    subject: `[Admin] ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #166534; color: white; padding: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 18px;">Austin Rifle Club - Admin Notification</h1>
        </div>
        <h2 style="color: #333;">${subject}</h2>
        <p>${body}</p>
        ${actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionUrl}" style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">${actionText || 'View Details'}</a>
        </div>
        ` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated admin notification from Austin Rifle Club.
        </p>
      </body>
      </html>
    `,
    text: `
[Admin] ${subject}

${body}

${actionUrl ? `${actionText || 'View Details'}: ${actionUrl}` : ''}

---
This is an automated admin notification from Austin Rifle Club.
    `.trim(),
  };
}

export function duesReminderEmail(
  firstName: string,
  expirationDate: string,
  daysRemaining: number,
  renewalUrl: string
): { subject: string; html: string; text: string } {
  const urgency = daysRemaining <= 7 ? 'urgent' : daysRemaining <= 30 ? 'soon' : 'upcoming';
  const urgencyColors = {
    urgent: { bg: '#fef2f2', border: '#dc2626', text: 'Expires in ' + daysRemaining + ' days!' },
    soon: { bg: '#fefce8', border: '#ca8a04', text: 'Expires in ' + daysRemaining + ' days' },
    upcoming: { bg: '#f0fdf4', border: '#166534', text: 'Expires on ' + expirationDate },
  };
  const colors = urgencyColors[urgency];

  return {
    subject: daysRemaining <= 7
      ? `URGENT: Membership Expires in ${daysRemaining} Days`
      : `Membership Renewal Reminder - Austin Rifle Club`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">Austin Rifle Club</h1>
        </div>
        <h2 style="color: #166534;">Membership Renewal Reminder</h2>
        <p>Hi ${firstName},</p>
        <p>This is a friendly reminder that your Austin Rifle Club membership is coming up for renewal.</p>
        <div style="background-color: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">${colors.text}</p>
        </div>
        <p>Renew now to maintain uninterrupted access to all club facilities and events.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${renewalUrl}" style="background-color: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Renew Membership</a>
        </div>
        <p style="color: #666; font-size: 14px;">Questions about renewal? Contact us at info@austinrifleclub.org</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
        </p>
      </body>
      </html>
    `,
    text: `
Membership Renewal Reminder - Austin Rifle Club

Hi ${firstName},

This is a friendly reminder that your Austin Rifle Club membership is coming up for renewal.

${colors.text}

Renew now to maintain uninterrupted access to all club facilities and events.

Renew your membership: ${renewalUrl}

Questions about renewal? Contact us at info@austinrifleclub.org

---
Austin Rifle Club · 16312 Littig Rd, Manor, TX 78653
    `.trim(),
  };
}
