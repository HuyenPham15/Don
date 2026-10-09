import type { Request, Response } from 'express';
import { db } from '../db/database';

export const signingController = {
  // Lấy danh sách văn bản trình ký
  getSigningDocuments(req: Request, res: Response) {
    const { status } = req.query;
    const docs = db.getSigningDocuments(status as string);
    res.json({ success: true, count: docs.length, data: docs });
  },

  // Chi tiết văn bản trình ký
  getSigningDocumentById(req: Request, res: Response) {
    const id = String(req.params.id);
    const doc = db.getSigningDocumentById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: `Không tìm thấy văn bản trình ký ${id}` });
    }
    res.json({ success: true, data: doc });
  },

  // Ký số chứng thư số VGCA
  signDocument(req: Request, res: Response) {
    const id = String(req.params.id);
    const { signerName, note } = req.body;
    const signed = db.signDocument(id, signerName || 'Nguyễn Minh Anh', note);

    if (!signed) {
      return res.status(404).json({ success: false, message: `Không tìm thấy văn bản trình ký ${id} để ký số` });
    }

    res.json({
      success: true,
      message: 'Ký số văn bản thành công qua thiết bị chứng thư số VGCA',
      data: signed,
    });
  },
};
