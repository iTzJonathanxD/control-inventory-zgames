import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly limit = 100; // requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  use(req: Request, res: Response, next: NextFunction): void {
    const clientId = req.ip || 'unknown';
    const now = Date.now();

    const clientData = this.requests.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      this.requests.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return next();
    }

    if (clientData.count >= this.limit) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    clientData.count++;
    this.requests.set(clientId, clientData);

    next();
  }
}
