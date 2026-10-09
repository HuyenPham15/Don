import type { Request, Response } from 'express';
import { db } from '../db/database';

export const donController = {
  // Lấy danh sách lượt nhận / đơn
  getDonList(req: Request, res: Response) {
    const { status, search } = req.query;
    const list = db.getLuotNhanList({
      status: status as string,
      search: search as string,
    });
    res.json({ success: true, count: list.length, data: list });
  },

  // Lấy chi tiết một lượt nhận / đơn theo id
  getDonById(req: Request, res: Response) {
    const id = String(req.params.id);
    const item = db.getLuotNhanById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: `Không tìm thấy đơn có mã ${id}` });
    }
    res.json({ success: true, data: item });
  },

  // Tiếp nhận / Tạo mới lượt nhận đơn
  createDon(req: Request, res: Response) {
    try {
      const data = req.body;
      const created = db.createLuotNhan(data);
      res.status(201).json({
        success: true,
        message: 'Tiếp nhận hồ sơ thành công',
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Lỗi tạo đơn' });
    }
  },

  // Cập nhật thông tin đơn
  updateDon(req: Request, res: Response) {
    const id = String(req.params.id);
    const updates = req.body;
    const updated = db.updateLuotNhan(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Không tìm thấy đơn ${id} để cập nhật` });
    }
    res.json({ success: true, message: 'Cập nhật thành công', data: updated });
  },

  // Ghép lượt nhận vào hồ sơ đơn đã có
  ghepDon(req: Request, res: Response) {
    const id = String(req.params.id);
    const { targetDonCode, lyDo, ghiChu } = req.body;

    if (!targetDonCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã hồ sơ đơn đích (targetDonCode)' });
    }

    const result = db.ghepLuotNhanVaoDon(id, targetDonCode, lyDo, ghiChu);
    if (!result.success) {
      return res.status(404).json({ success: false, message: `Không tìm thấy lượt nhận ${id}` });
    }

    res.json({
      success: true,
      message: `Đã ghép thành công lượt nhận ${id} vào hồ sơ ${targetDonCode}`,
      data: result,
    });
  },

  // Bàn giao đơn
  banGiaoDon(req: Request, res: Response) {
    const id = String(req.params.id);
    const { donViNhan, canBoNhan, lyDoBanGiao } = req.body;

    const updated = db.updateLuotNhan(id, {
      status: 'da_ban_giao',
      donVi: donViNhan || undefined,
      ghiChu: `Bàn giao cho ${canBoNhan || donViNhan}: ${lyDoBanGiao || ''}`,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: `Không tìm thấy đơn ${id}` });
    }

    res.json({
      success: true,
      message: `Bàn giao đơn ${id} thành công`,
      data: updated,
    });
  },

  // Lấy danh sách hồ sơ đơn trùng / tương đồng để đối soát
  getDonTrungList(req: Request, res: Response) {
    const list = db.getDonTrungList();
    res.json({ success: true, data: list });
  },
};
