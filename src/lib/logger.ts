/**
 * Structured Logging Utility
 *
 * Provides consistent, structured logging for the API.
 * Outputs JSON format suitable for log aggregation services.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  memberId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.formatEntry(level, message, context, error);
    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }

  /**
   * Log an HTTP request
   */
  request(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `${method} ${path} ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context));
  }
}

// Default logger instance
// In Workers, default to 'info' level - can be configured via env
export const logger = new Logger('info');

// Convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
  request: (method: string, path: string, statusCode: number, duration: number, context?: LogContext) =>
    logger.request(method, path, statusCode, duration, context),
};

/**
 * Request logging middleware for Hono
 */
export function requestLogger() {
  return async (c: any, next: () => Promise<void>) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    // Add request ID to context for correlation
    c.set('requestId', requestId);

    await next();

    const duration = Date.now() - start;
    const userId = c.get('user')?.id;

    logger.request(
      c.req.method,
      c.req.path,
      c.res.status,
      duration,
      {
        requestId,
        userId,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('cf-connecting-ip'),
      }
    );
  };
}

/**
 * Log helper for specific actions
 */
export const logAction = {
  userLogin: (userId: string, context?: LogContext) =>
    logger.info('User logged in', { ...context, userId, action: 'auth.login' }),

  userLogout: (userId: string, context?: LogContext) =>
    logger.info('User logged out', { ...context, userId, action: 'auth.logout' }),

  applicationSubmit: (applicationId: string, userId: string, context?: LogContext) =>
    logger.info('Application submitted', { ...context, userId, action: 'application.submit', resourceId: applicationId }),

  applicationApprove: (applicationId: string, adminId: string, context?: LogContext) =>
    logger.info('Application approved', { ...context, memberId: adminId, action: 'application.approve', resourceId: applicationId }),

  eventRegister: (eventId: string, memberId: string, context?: LogContext) =>
    logger.info('Event registration', { ...context, memberId, action: 'event.register', resourceId: eventId }),

  paymentSuccess: (memberId: string, amount: number, type: string, context?: LogContext) =>
    logger.info('Payment successful', { ...context, memberId, action: 'payment.success', amount, type }),

  paymentFailed: (memberId: string, error: string, context?: LogContext) =>
    logger.warn('Payment failed', { ...context, memberId, action: 'payment.failed', error }),

  rangeStatusChange: (rangeId: string, status: string, adminId: string, context?: LogContext) =>
    logger.info('Range status changed', { ...context, memberId: adminId, action: 'range.status_change', resourceId: rangeId, status }),
};
