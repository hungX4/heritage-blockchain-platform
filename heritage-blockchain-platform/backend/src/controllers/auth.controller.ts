import { NextFunction, Request, Response } from "express";
import { CookieOptions } from "express";
import { JwtPayload } from "jsonwebtoken";
import { LoginDto, RegisterDto } from "../types/dto/auth.dto.js";
import { AuthServices } from "../services/auth.service.js";
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}
const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth/refresh',
  maxAge: 30 * 24 * 3600 * 1000,
}

const CLEAR_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth/refresh',
}
export class AuthController {

  static register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as RegisterDto;
      const { refreshToken, ...response } = await AuthServices.register(dto);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.status(201).json(response);
    } catch (error: any) {
      next(error);
    }
  }

  static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const deviceIdHeader = req.headers['x-device-id'];

      if (typeof deviceIdHeader === 'string') {
        dto.deviceId = deviceIdHeader;
      }
      const { refreshToken, ...response } = await AuthServices.login(dto);
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.json(response);
    } catch (error) {
      next(error) //chuyen loi sang middleware
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const deviceIdHeader = req.headers['x-device-id'];
      const deviceId = typeof deviceIdHeader === 'string' ? deviceIdHeader : 'default';
      if (!refreshToken) {
        res.status(401).json({ message: 'MISSING TOKEN' });
        return;
      }
      //    //so sanh rt tu cookie va rt tu req.body
      //    if(rt !== refreshToken){
      //     res.status(401).json({message: 'Token MISSMATCH - POTENTIAL CSRF ATTACK'});
      //    }

      const { refreshToken: newRt, ...response } = await AuthServices.refresh(deviceId, refreshToken);
      res.cookie('refreshToken', newRt, COOKIE_OPTIONS);

      res.json(response);
    } catch (error) {
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceId = req.headers['x-device-id'] as string ?? 'default'
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'UNAUTHORIZED' });
        return;
      }
      await AuthServices.logout(userId, deviceId);
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err)
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'UNAUTHORIZED' })
        return;
      }
      await AuthServices.logoutAll(userId);
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS)
      res.json({ message: 'All sessions revoked' });
    } catch (err) {
      next(err)
    }
  }

}
