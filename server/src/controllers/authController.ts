import type { Request, Response } from 'express';
import { db } from '../db/database';

export const authController = {
  getCurrentUser(req: Request, res: Response) {
    const user = db.getCurrentUser();
    res.json({ success: true, data: user });
  },

  login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.',
      });
    }

    const user = db.updateCurrentUser({
      username,
      fullName: username === 'admin' ? 'Quản trị viên hệ thống' : 'Nguyễn Minh Anh',
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user,
        token: `mock-jwt-token-${Date.now()}`,
      },
    });
  },

  logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Đăng xuất thành công' });
  },
};
