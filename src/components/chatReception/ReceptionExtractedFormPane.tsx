// src/components/chatReception/ReceptionExtractedFormPane.tsx
import React, { useState, useEffect } from 'react';
import { ReceptionDraft, ReceptionData, ExtractedField } from '../../types/receptionChat';
import { Screen } from '../../types';

interface ReceptionExtractedFormPaneProps {
  draft: ReceptionDraft | null;
  onUpdateDraft: (updatedData: Partial<ReceptionData>) => void;
  onConfirmReception: (draft: ReceptionDraft) => void;
  onSaveDraftToWork: (draft: ReceptionDraft, reason?: string) => void;
  isProcessing?: boolean;
  onNav?: (s: Screen) => void;
  onSelectSampleFile?: () => void;
}

export default function ReceptionExtractedFormPane({
  draft,
  onUpdateDraft,
  onConfirmReception,
  onSaveDraftToWork,
  isProcessing = false,
  onNav,
  onSelectSampleFile,
}: ReceptionExtractedFormPaneProps) {
  const isReceived = draft?.status === 'RECEIVED';
  const data = draft?.extractedData;

  // Local form state
  const [formValues, setFormValues] = useState({
    loaiDon: '',
    nguoiDungDon: '',
    nguoiNop: '',
    cccd: '',
    soDienThoai: '',
    email: '',
    diaChi: '',
    ngayLamDon: '',
    ngayNhan: '',
    doiTuongBiKhieuNai: '',
    noiDungTomTat: '',
  });

  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveNote, setSaveNote] = useState('Chờ công dân bổ sung bản sao CCCD có công chứng và giấy ủy quyền');

  // Sync form values when draft changes
  useEffect(() => {
    if (data) {
      setFormValues({
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
    }
  }, [data]);

  const handleChange = (fieldKey: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
    setDirtyFields((prev) => ({ ...prev, [fieldKey]: true }));

    // Cập nhật real-time vào draft
    if (data && draft) {
      const fieldObj = (data as any)[fieldKey] as ExtractedField<any>;
      const updatedField: ExtractedField<any> = {
        ...fieldObj,
        value,
        userEdited: true,
        status: value ? 'ok' : 'missing',
      };
      onUpdateDraft({ [fieldKey]: updatedField });
    }
  };

  const renderBadge = (fieldKey: keyof ReceptionData, field?: ExtractedField<any>) => {
    if (!field) return null;
    const isDirty = dirtyFields[fieldKey as string] || field.userEdited;

    if (isDirty) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          <span className="material-symbols-outlined text-[11px]">edit</span>
          Đã sửa
        </span>
      );
    }

    if (field.status === 'missing' || !field.value) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <span className="material-symbols-outlined text-[11px]">warning</span>
          Thiếu dữ liệu
        </span>
      );
    }

    if (field.status === 'needs_review' || (field.confidence && field.confidence < 75)) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          <span className="material-symbols-outlined text-[11px]">priority_high</span>
          Cần kiểm tra ({field.confidence}%)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-mono">
        ✓ AI {field.confidence || 95}%
      </span>
    );
  };

  // Tính số trường hợp lệ
  const totalFields = 11;
  const validFieldsCount = Object.values(formValues).filter((v) => Boolean(v && v.trim())).length;
  const progressPercent = Math.round((validFieldsCount / totalFields) * 100);

  // Khi chưa có file / draft
  if (!draft || !data) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white border-l border-slate-200/90 overflow-hidden items-center justify-center p-8 text-center select-none">
        <div className="max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[36px]">assignment</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Biểu mẫu tiếp nhận hồ sơ</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tải file đơn ở khung chat bên trái. AI sẽ tự động bóc tách và điền dữ liệu đầy đủ vào biểu mẫu này để bạn kiểm tra, chỉnh sửa và tiếp nhận.
            </p>
          </div>
          {onSelectSampleFile && (
            <button
              type="button"
              onClick={onSelectSampleFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#004ac6] hover:bg-[#003ba0] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              <span>Nạp file mẫu Don_khieu_nai.pdf</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-l border-slate-200/90 overflow-hidden relative">
      {/* 1. HEADER CỦA FORM TIẾP NHẬN */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[17px]">edit_document</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Biểu mẫu Tiếp nhận hồ sơ (AI bóc tách)
            </h2>
            <span className="font-mono text-[10.5px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {draft.id}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dữ liệu trích xuất từ <strong className="text-slate-700">{draft.fileMeta.name}</strong> ({draft.fileMeta.size})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isReceived ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>ĐÃ TIẾP NHẬN: <strong className="font-mono">{draft.receptionCode}</strong></span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[15px]">pending_actions</span>
              <span>Chờ tiếp nhận / Cần kiểm tra</span>
            </span>
          )}

          {/* Thanh tiến độ hoàn thành trường dữ liệu */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-[11px] font-bold font-mono text-slate-600">
              {validFieldsCount}/{totalFields} trường
            </span>
            <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BODY FORM (CUỘN ĐƯỢC) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#fafbfd]">
        {/* Banner cảnh báo nếu có trường CCCD hoặc trường khác cần kiểm tra */}
        {data.cccd.status === 'needs_review' && !isReceived && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
              notification_important
            </span>
            <div className="flex-1">
              <span className="font-bold">Lưu ý kiểm tra thông tin:</span> AI nhận diện số CCCD{' '}
              <strong className="font-mono text-slate-900">{formValues.cccd}</strong> với độ tin cậy thấp (68%). Cán bộ vui lòng đối chiếu bản scan và sửa trực tiếp nếu có sai khác.
            </div>
          </div>
        )}

        {/* NHÓM 1: PHÂN LOẠI & NGƯỜI ĐỨNG ĐƠN */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">person_search</span>
              <span>1. Phân loại đơn &amp; Người đứng đơn</span>
            </div>
            <span className="text-[10.5px] text-slate-400">Trường bắt buộc (*)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Loại đơn */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Loại đơn *</label>
                {renderBadge('loaiDon', data.loaiDon)}
              </div>
              <select
                disabled={isReceived}
                value={formValues.loaiDon}
                onChange={(e) => handleChange('loaiDon', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="Khiếu nại">Đơn khiếu nại</option>
                <option value="Tố cáo">Đơn tố cáo</option>
                <option value="Kiến nghị - Phản ánh">Đơn kiến nghị - Phản ánh</option>
                <option value="Tố giác về tội phạm">Đơn tố giác về tội phạm</option>
              </select>
            </div>

            {/* Người đứng đơn */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Người đứng đơn *</label>
                {renderBadge('nguoiDungDon', data.nguoiDungDon)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.nguoiDungDon}
                onChange={(e) => handleChange('nguoiDungDon', e.target.value)}
                placeholder="Họ tên người đứng đơn"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Người nộp đơn */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Người nộp đơn / Người đại diện theo ủy quyền</label>
                {renderBadge('nguoiNop', data.nguoiNop)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.nguoiNop}
                onChange={(e) => handleChange('nguoiNop', e.target.value)}
                placeholder="Người trực tiếp đến nộp hoặc người được ủy quyền"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* NHÓM 2: ĐỊNH DANH & THÔNG TIN LIÊN HỆ */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">badge</span>
              <span>2. Định danh &amp; Thông tin liên lạc</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Số CCCD / Mã định danh */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Số CCCD / Mã định danh cá nhân *</label>
                {renderBadge('cccd', data.cccd)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.cccd}
                onChange={(e) => handleChange('cccd', e.target.value)}
                placeholder="12 chữ số căn cước công dân"
                className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                  data.cccd.status === 'needs_review' && !dirtyFields.cccd
                    ? 'border-amber-400 bg-amber-50/30 text-amber-900 focus:border-amber-500 focus:ring-amber-500'
                    : 'border-slate-300 text-slate-900 focus:border-[#004ac6] focus:ring-blue-600'
                }`}
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Số điện thoại liên hệ *</label>
                {renderBadge('soDienThoai', data.soDienThoai)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.soDienThoai}
                onChange={(e) => handleChange('soDienThoai', e.target.value)}
                placeholder="Số điện thoại di động"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Địa chỉ Email</label>
                {renderBadge('email', data.email)}
              </div>
              <input
                type="email"
                disabled={isReceived}
                value={formValues.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Địa chỉ */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Địa chỉ cư trú / thường trú *</label>
                {renderBadge('diaChi', data.diaChi)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.diaChi}
                onChange={(e) => handleChange('diaChi', e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* NHÓM 3: THỜI GIAN & ĐỐI TƯỢNG BỊ KHIẾU NẠI */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">schedule</span>
              <span>3. Thời gian &amp; Cơ quan / Cá nhân bị khiếu nại, tố cáo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Ngày làm đơn */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Ngày ghi trên đơn</label>
                {renderBadge('ngayLamDon', data.ngayLamDon)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.ngayLamDon}
                onChange={(e) => handleChange('ngayLamDon', e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Ngày tiếp nhận */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Ngày tiếp nhận vào hệ thống</label>
                {renderBadge('ngayNhan', data.ngayNhan)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.ngayNhan}
                onChange={(e) => handleChange('ngayNhan', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Cơ quan bị khiếu nại */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Cơ quan / Cá nhân bị khiếu nại, tố cáo *</label>
                {renderBadge('doiTuongBiKhieuNai', data.doiTuongBiKhieuNai)}
              </div>
              <input
                type="text"
                disabled={isReceived}
                value={formValues.doiTuongBiKhieuNai}
                onChange={(e) => handleChange('doiTuongBiKhieuNai', e.target.value)}
                placeholder="Ví dụ: UBND Quận Cầu Giấy hoặc cá nhân cụ thể..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* NHÓM 4: NỘI DUNG SỰ VIỆC TÓM TẮT */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">notes</span>
              <span>4. Nội dung sự việc tóm tắt *</span>
            </div>
            {renderBadge('noiDungTomTat', data.noiDungTomTat)}
          </div>

          <textarea
            rows={4}
            disabled={isReceived}
            value={formValues.noiDungTomTat}
            onChange={(e) => handleChange('noiDungTomTat', e.target.value)}
            placeholder="Tóm tắt rõ: sự việc khiếu nại/tố cáo, các quyết định/hành vi hành chính liên quan, yêu cầu giải quyết cụ thể..."
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y"
          />
        </section>

        {/* NHÓM 5: TÀI LIỆU ĐÍNH KÈM */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">attach_file</span>
              <span>5. Hồ sơ &amp; Tài liệu kèm theo ({data.taiLieuDinhKem.value.length})</span>
            </div>
            {renderBadge('taiLieuDinhKem', data.taiLieuDinhKem)}
          </div>

          <div className="space-y-1.5">
            {data.taiLieuDinhKem.value.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">description</span>
                  <span className="font-medium truncate">{doc}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">Đính kèm</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. FOOTER ACTIONS TOOLBAR CỐ ĐỊNH */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-lg shrink-0 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">shield_check</span>
          <span className="hidden md:inline">
            Tự động lưu thay đổi vào bản nháp. Cán bộ có thể lưu nháp vào việc cần xử lý hoặc tiếp nhận ngay.
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* NÚT LƯU NHÁP / CHUYỂN VÀO CẦN XỬ LÝ (Khi chưa thể tiếp nhận ngay) */}
          {!isReceived && (
            <button
              type="button"
              onClick={() => setShowSaveDialog(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Lưu hồ sơ vào danh sách 'Cần xử lý' của màn Công việc của tôi khi chưa đủ điều kiện tiếp nhận ngay"
            >
              <span className="material-symbols-outlined text-[17px] text-amber-700">pending_actions</span>
              <span>Lưu nháp / Cần xử lý</span>
            </button>
          )}

          {/* NÚT TIẾP NHẬN ĐƠN (Chính thức) */}
          {!isReceived ? (
            <button
              type="button"
              onClick={() => onConfirmReception(draft)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                  <span>Tiếp nhận đơn</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {onNav && (
                <button
                  type="button"
                  onClick={() => onNav('cong-viec')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#003ba0] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">task_alt</span>
                  <span>Mở tại Công việc của tôi</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* POPUP XÁC NHẬN LƯU NHÁP VÀO CÔNG VIỆC CỦA TÔI */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <span className="material-symbols-outlined text-[24px]">assignment_late</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lưu nháp vào &quot;Công việc của tôi&quot;
                </h3>
                <p className="text-[11px] text-slate-500">
                  Chuyển hồ sơ vào Cột 1 &quot;Cần xử lý&quot; để tiếp tục thẩm tra hoặc bổ sung sau
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">Lý do chưa tiếp nhận ngay / Ghi chú xử lý:</label>
              <textarea
                rows={3}
                value={saveNote}
                onChange={(e) => setSaveNote(e.target.value)}
                placeholder="Nhập lý do chưa tiếp nhận (VD: Chờ công dân nộp bổ sung giấy tờ, cần xác minh địa bàn...)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#004ac6]"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11.5px] text-slate-600 space-y-1">
              <div>• <strong>Hồ sơ:</strong> {formValues.loaiDon} - {formValues.nguoiDungDon}</div>
              <div>• <strong>Vị trí sau khi lưu:</strong> Cột &quot;Cần xử lý&quot; trên màn hình <em>Công việc của tôi</em>.</div>
              <div>• <strong>Thao tác tiếp theo:</strong> Bất cứ lúc nào bạn có thể bấm vào thẻ để mở lại màn tiếp nhận này.</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveDraftToWork(draft, saveNote);
                  setShowSaveDialog(false);
                }}
                className="px-4 py-2 bg-[#004ac6] hover:bg-[#003ba0] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Xác nhận lưu vào Công việc của tôi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
