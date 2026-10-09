import { db } from '../db/database';
export const workController = {
    // Lấy danh sách công việc của tôi
    getWorkItems(req, res) {
        const { column, departmentId, search } = req.query;
        const items = db.getWorkItems({
            column: column,
            departmentId: departmentId,
            search: search,
        });
        res.json({
            success: true,
            total: items.length,
            data: items,
        });
    },
    // Lấy chi tiết công việc
    getWorkItemById(req, res) {
        const { id } = req.params;
        const item = db.getWorkItemById(id);
        if (!item) {
            return res.status(404).json({ success: false, message: `Không tìm thấy công việc ${id}` });
        }
        res.json({ success: true, data: item });
    },
    // Cập nhật tiến độ công việc
    updateWorkItem(req, res) {
        const { id } = req.params;
        const updates = req.body;
        const updated = db.updateWorkItem(id, updates);
        if (!updated) {
            return res.status(404).json({ success: false, message: `Không tìm thấy công việc ${id} để cập nhật` });
        }
        res.json({ success: true, message: 'Cập nhật tiến độ công việc thành công', data: updated });
    },
    // Tạo công việc mới
    createWorkItem(req, res) {
        const data = req.body;
        const created = db.createWorkItem(data);
        res.status(201).json({ success: true, message: 'Tạo công việc thành công', data: created });
    },
};
