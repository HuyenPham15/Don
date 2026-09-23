// src/components/chatReception/ReceptionDraftCard.tsx
import React, { useState } from 'react';
import { ReceptionDraft, ReceptionData, ExtractedField } from '../../types/receptionChat';

interface ReceptionDraftCardProps {
  draft: ReceptionDraft;
  onUpdateDraft: (updatedData: Partial<ReceptionData>) => void;
  onConfirmReception: (draft: ReceptionDraft) => void;
  isProcessingConfirm?: boolean;
}

export default function ReceptionDraftCard({
  draft,
  onUpdateDraft,
  onConfirmReception,
  isProcessingConfirm = false,
}: ReceptionDraftCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const data = draft.extractedData;

  // Local form state for inline editing
  const [editForm, setEditForm] = useState({
    loaiDon: data.loaiDon.value || 'Khiếu nại',
    nguoiDungDon: data.nguoiDungDon.value || '',
    nguoiNop: data.nguoiNop.value || '',
    cccd: data.cccd.value || '',
    soDienThoai: data.soDienThoai.value || '',
    email: data.email.value || '',
    diaChi: data.diaChi.value || '',
    ngayLamDon: data.ngayLamDon.value || '',
    ngayNhan: data.ngayNhan.value || '',
    doiTuongBiKhieuNai: data.doiTuongBiKhieuNai.value || '',
    noiDungTomTat: data.noiDungTomTat.value || '',
  });

  const handleStartEdit = () => {
    setEditForm({
      loaiDon: data.loaiDon.value || 'Khiếu nại',
      nguoiDungDon: data.nguoiDungDon.value || '',
      nguoiNop: data.nguoiNop.value || '',
      cccd: data.cccd.value || '',
      soDienThoai: data.soDienThoai.value || '',
      email: data.email.value || '',
      diaChi: data.diaChi.value || '',
      ngayLamDon: data.ngayLamDon.value || '',
      ngayNhan: data.ngayNhan.value || '',
      doiTuongBiKhieuNai: data.doiTuongBiKhieuNai.value || '',
      noiDungTomTat: data.noiDungTomTat.value || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: Partial<ReceptionData> = {
      loaiDon: { ...data.loaiDon, value: editForm.loaiDon, userEdited: true, status: 'ok' },
      nguoiDungDon: { ...data.nguoiDungDon, value: editForm.nguoiDungDon, userEdited: true, status: 'ok' },
      nguoiNop: { ...data.nguoiNop, value: editForm.nguoiNop, userEdited: true, status: 'ok' },
      cccd: { ...data.cccd, value: editForm.cccd, userEdited: true, status: editForm.cccd ? 'ok' : 'missing' },
      soDienThoai: { ...data.soDienThoai, value: editForm.soDienThoai, userEdited: true, status: 'ok' },
      email: { ...data.email, value: editForm.email, userEdited: true, status: 'ok' },
      diaChi: { ...data.diaChi, value: editForm.diaChi, userEdited: true, status: 'ok' },
      ngayLamDon: { ...data.ngayLamDon, value: editForm.ngayLamDon, userEdited: true, status: 'ok' },
      ngayNhan: { ...data.ngayNhan, value: editForm.ngayNhan, userEdited: true, status: 'ok' },
      doiTuongBiKhieuNai: { ...data.doiTuongBiKhieuNai, value: editForm.doiTuongBiKhieuNai, userEdited: true, status: 'ok' },
      noiDungTomTat: { ...data.noiDungTomTat, value: editForm.noiDungTomTat, userEdited: true, status: 'ok' },
    };

    onUpdateDraft(updatedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Helper render Confidence badge
  const renderConfidenceBadge = (field: ExtractedField<any>) => {
    if (field.userEdited) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          <span className="material-symbols-outlined text-[11px]">edit</span>
          Đã cập nhật bởi cán bộ
        </span>
      );
    }
    if (field.status === 'missing' || !field.value) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <span className="material-symbols-outlined text-[11px]">warning</span>
          Thiếu thông tin
        </span>
      );
    }
    if (field.status === 'needs_review' || (field.confidence && field.confidence < 75)) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          <span className="material-symbols-outlined text-[11px]">info</span>
          Cần kiểm tra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-mono">
        ✓ {field.confidence || 95}%
      </span>
    );
  };

  const isReceived = draft.status === 'RECEIVED';

  return (
    <div className="max-w-3xl w-full bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden animate-fade-in my-2">
      {/* Top Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">assignment</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Bản nháp tiếp nhận hồ sơ
              </h3>
              <span className="font-mono text-[10.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {draft.id}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500">
              Dữ liệu được AI tự động phân tích và trích xuất từ tài liệu đính kèm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isReceived ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Đã tiếp nhận chính thức
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">pending_actions</span>
              Chờ tiếp nhận
            </span>
          )}

          {!isReceived && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600">edit_square</span>
              <span>Chỉnh sửa thông tin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: VIEW MODE or EDIT MODE */}
      {isEditing ? (
        /* ======================== EDIT MODE ======================== */
        <form onSubmit={handleSaveEdit} className="p-5 space-y-4 bg-slate-50/50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              Chế độ chỉnh sửa trực tiếp thông tin tiếp nhận
            </span>
            <span className="text-[11px] text-slate-500">
              * Mọi chỉnh sửa của cán bộ sẽ ghi đè kết quả nhận diện của AI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Loại đơn */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Loại đơn *</label>
              <select
                value={editForm.loaiDon}
                onChange={(e) => setEditForm({ ...editForm, loaiDon: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Khiếu nại">Đơn khiếu nại</option>
                <option value="Tố cáo">Đơn tố cáo</option>
                <option value="Kiến nghị - Phản ánh">Đơn kiến nghị - Phản ánh</option>
                <option value="Tố giác về tội phạm">Đơn tố giác về tội phạm</option>
              </select>
            </div>

            {/* Người đứng đơn */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Người đứng đơn *</label>
              <input
                type="text"
                value={editForm.nguoiDungDon}
                onChange={(e) => setEditForm({ ...editForm, nguoiDungDon: e.target.value })}
                placeholder="Họ và tên người đứng đơn"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
            </div>

            {/* Người nộp đơn */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Người nộp đơn</label>
              <input
                type="text"
                value={editForm.nguoiNop}
                onChange={(e) => setEditForm({ ...editForm, nguoiNop: e.target.value })}
                placeholder="Người trực tiếp nộp hoặc ủy quyền"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Số CCCD / Định danh */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Số CCCD / Mã định danh</label>
              <input
                type="text"
                value={editForm.cccd}
                onChange={(e) => setEditForm({ ...editForm, cccd: e.target.value })}
                placeholder="Ví dụ: 001085012345"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Số điện thoại</label>
              <input
                type="text"
                value={editForm.soDienThoai}
                onChange={(e) => setEditForm({ ...editForm, soDienThoai: e.target.value })}
                placeholder="09..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Thư điện tử (Email)</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Ngày làm đơn */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Ngày làm đơn</label>
              <input
                type="text"
                value={editForm.ngayLamDon}
                onChange={(e) => setEditForm({ ...editForm, ngayLamDon: e.target.value })}
                placeholder="dd/mm/yyyy"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Ngày tiếp nhận */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Ngày tiếp nhận</label>
              <input
                type="text"
                value={editForm.ngayNhan}
                onChange={(e) => setEditForm({ ...editForm, ngayNhan: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Địa chỉ cư trú / liên hệ</label>
            <input
              type="text"
              value={editForm.diaChi}
              onChange={(e) => setEditForm({ ...editForm, diaChi: e.target.value })}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Cơ quan / cá nhân bị khiếu nại */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Cơ quan / Cá nhân bị khiếu nại hoặc tố cáo</label>
            <input
              type="text"
              value={editForm.doiTuongBiKhieuNai}
              onChange={(e) => setEditForm({ ...editForm, doiTuongBiKhieuNai: e.target.value })}
              placeholder="Ví dụ: UBND Quận Cầu Giấy..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Nội dung tóm tắt */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Nội dung tóm tắt *</label>
            <textarea
              rows={3}
              value={editForm.noiDungTomTat}
              onChange={(e) => setEditForm({ ...editForm, noiDungTomTat: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          {/* Action buttons in Edit Mode */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ba0] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      ) : (
        /* ======================== VIEW MODE ======================== */
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
            {/* 1. Loại đơn */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.loaiDon.label}</span>
                {renderConfidenceBadge(data.loaiDon)}
              </div>
              <div className="text-xs font-bold text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {data.loaiDon.value || 'Chưa xác định'}
              </div>
            </div>

            {/* 2. Người đứng đơn */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.nguoiDungDon.label}</span>
                {renderConfidenceBadge(data.nguoiDungDon)}
              </div>
              <div className="text-xs font-bold text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {data.nguoiDungDon.value || 'Chưa xác định'}
              </div>
            </div>

            {/* 3. Người nộp đơn */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.nguoiNop.label}</span>
                {renderConfidenceBadge(data.nguoiNop)}
              </div>
              <div className="text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {data.nguoiNop.value || 'Chưa xác định'}
              </div>
            </div>

            {/* 4. Số CCCD */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.cccd.label}</span>
                {renderConfidenceBadge(data.cccd)}
              </div>
              <div
                className={`text-xs font-mono px-2.5 py-1.5 rounded-lg border ${
                  data.cccd.status === 'needs_review'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-800'
                }`}
              >
                {data.cccd.value || 'Chưa có thông tin'}
              </div>
            </div>

            {/* 5. Số điện thoại */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.soDienThoai.label}</span>
                {renderConfidenceBadge(data.soDienThoai)}
              </div>
              <div className="text-xs font-mono text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {data.soDienThoai.value || 'Chưa có thông tin'}
              </div>
            </div>

            {/* 6. Email */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.email.label}</span>
                {renderConfidenceBadge(data.email)}
              </div>
              <div className="text-xs text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 truncate">
                {data.email.value || 'Chưa có thông tin'}
              </div>
            </div>

            {/* 7. Ngày làm đơn & Ngày nhận */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.ngayLamDon.label}</span>
                {renderConfidenceBadge(data.ngayLamDon)}
              </div>
              <div className="text-xs font-mono text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {data.ngayLamDon.value || 'Chưa xác định'}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">{data.ngayNhan.label}</span>
                {renderConfidenceBadge(data.ngayNhan)}
              </div>
              <div className="text-xs font-mono text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                {data.ngayNhan.value || 'Hôm nay'}
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">{data.diaChi.label}</span>
              {renderConfidenceBadge(data.diaChi)}
            </div>
            <div className="text-xs text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80">
              {data.diaChi.value || 'Chưa có thông tin địa chỉ'}
            </div>
          </div>

          {/* Cơ quan bị khiếu nại */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">{data.doiTuongBiKhieuNai.label}</span>
              {renderConfidenceBadge(data.doiTuongBiKhieuNai)}
            </div>
            <div className="text-xs font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/80">
              {data.doiTuongBiKhieuNai.value || 'Chưa xác định'}
            </div>
          </div>

          {/* Nội dung tóm tắt */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">{data.noiDungTomTat.label}</span>
              {renderConfidenceBadge(data.noiDungTomTat)}
            </div>
            <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed whitespace-pre-wrap">
              {data.noiDungTomTat.value || 'Chưa có nội dung tóm tắt'}
            </div>
          </div>

          {/* Tài liệu đính kèm */}
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[11px] font-bold text-slate-500">{data.taiLieuDinhKem.label}</span>
            <div className="space-y-1.5">
              {data.taiLieuDinhKem.value.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600">attach_file</span>
                  <span className="font-medium truncate">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions (Chỉnh sửa thông tin / Tiếp nhận đơn) */}
          {!isReceived && (
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-blue-600">verified_user</span>
                Cán bộ có thể chỉnh sửa trước hoặc xác nhận tiếp nhận trực tiếp vào hệ thống
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Chỉnh sửa thông tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => onConfirmReception(draft)}
                  disabled={isProcessingConfirm}
                  className="px-5 py-2 bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessingConfirm ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tiếp nhận...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[17px]">assignment_turned_in</span>
                      <span>Tiếp nhận đơn</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
