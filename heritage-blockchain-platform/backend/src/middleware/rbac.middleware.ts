import type { NextFunction, Request, Response } from 'express';
import { UserRole } from '../types/enums/rbac.js';


export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication is required.' });
      return;
    }

    if (!roles.includes(req.user.roles)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions.' });
      return;
    }

    next();
  };
}

