import React, { useState, useEffect } from 'react';

export type NguonTraCuuTabType = 'nguoi-gui' | 'don-tuong-tu' | 'vu-viec';

interface NguonTraCuuModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: NguonTraCuuTabType;
  currentDonCode?: string;
  currentNguoiGui?: string;
  currentCccd?: string;
  onApplyRecommendation?: (text: string) => void;
}

export default function NguonTraCuuModal({
  isOpen,
  onClose,
  initialTab = 'nguoi-gui',
  currentDonCode = 'Đ-2026-00125',
  currentNguoiGui = 'Nguyễn Văn A',
  currentCccd = '001088012345',
  onApplyRecommendation,
}: NguonTraCuuModalProps) {
  const [activeTab, setActiveTab] = useState<NguonTraCuuTabType>(initialTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 animate-fade-in">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* 1. ADMINISTRATIVE HEADER */}
        <div className="px-6 py-4 border-b border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-2xl">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight font-headline-md">
                  Nguồn dữ liệu gốc trong hệ thống
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Khớp CSDL Tiếp dân &amp; QLHC
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Đang đối soát cho đơn: <strong className="text-slate-800 font-mono">{currentDonCode}</strong> • Người gửi: <strong className="text-slate-800">{currentNguoiGui}</strong> (CCCD: <span className="font-mono text-slate-700">{currentCccd}</span>)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 2. NAVIGATION TABS */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-2 shrink-0 overflow-x-auto">
          {/* Tab 1: Lịch sử người gửi */}
          <button
            type="button"
            onClick={() => setActiveTab('nguoi-gui')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'nguoi-gui'
                ? 'border-[#004ac6] text-[#004ac6]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">badge</span>
            <span>1. Lịch sử người gửi</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'nguoi-gui' ? 'bg-blue-100 text-[#004ac6]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              03 đơn gốc
            </span>
          </button>

          {/* Tab 2: Đơn tương tự */}
          <button
            type="button"
            onClick={() => setActiveTab('don-tuong-tu')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'don-tuong-tu'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">compare_arrows</span>
            <span>2. Đơn tương tự gốc (Đ-2025-00341)</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              Trùng 86%
            </span>
          </button>

          {/* Tab 3: Vụ việc liên quan */}
          <button
            type="button"
            onClick={() => setActiveTab('vu-viec')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'vu-viec'
                ? 'border-purple-600 text-purple-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">folder_shared</span>
            <span>3. Hồ sơ vụ việc gốc (VV-2026-0042)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'vu-viec' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Đang thụ lý PC03
            </span>
          </button>
        </div>

        {/* 3. TAB CONTENTS (SCROLLABLE BODY) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f8fafc]">
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* TAB 1: LỊCH SỬ NGƯỜI GỬI (3 ĐƠN GỐC)                              */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'nguoi-gui' && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-[#004ac6] font-bold text-sm flex items-center justify-center shrink-0">
                      NA
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {currentNguoiGui}
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Xác thực CCCD gắn chip
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Số CCCD: <strong className="text-slate-800">{currentCccd}</strong> • Năm sinh: 1988
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    Tổng 03 lần gửi đơn
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Số điện thoại liên hệ:</span>
                    <span className="font-semibold text-slate-800 font-mono">0983 123 456</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Địa chỉ thường trú đăng ký:</span>
                    <span className="font-semibold text-slate-800">Số 12, ngõ 45, Cầu Giấy, Hà Nội</span>
                  </div>
                </div>
              </div>

              {/* Danh sách 3 đơn gốc được lưu trữ trong kho hệ thống */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#004ac6]">history</span>
                    Danh sách các đơn gốc trước đây trong kho dữ liệu:
                  </span>
                  <span className="text-[11px] text-slate-400">Nguồn: Hệ thống Tiếp công dân &amp; Xử lý đơn TP. Hà Nội</span>
                </div>

                {/* Đơn gốc 1 */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-2xs space-y-2 hover:border-amber-400 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                          Đ-2025-00341
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Tố giác hành vi huy động vốn trái phép tại Dự án Khu đô thị Y
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 flex items-center gap-2">
                        <span>Tiếp nhận ngày: <strong className="text-slate-700">15/06/2026 14:20</strong></span>
                        <span>•</span>
                        <span>Loại đơn: <strong className="text-slate-700">Tố giác tội phạm</strong></span>
                        <span>•</span>
                        <span>Hình thức nộp: <strong className="text-slate-700">Trực tiếp tại Bộ phận Một cửa</strong></span>
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 shrink-0">
                      Đang thụ lý PC03
                    </span>
                  </div>

                  {/* Trích đoạn nguyên văn bản gốc */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-sans">
                    <span className="text-slate-400 block font-semibold text-[10.5px] uppercase mb-1">Trích lục nội dung văn bản gốc lưu trữ:</span>
                    <p className="italic">
                      "Tôi đã nộp số tiền 1.800.000.000 VNĐ theo Hợp đồng hợp tác đầu tư số 08/2024 ký ngày 15/03/2024 với Công ty Cổ phần Bất động sản X. Đến nay công ty không thực hiện dự án và có dấu hiệu tẩu tán tài sản..."
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-2">
                    <span className="text-slate-500">
                      Đơn vị đang thụ lý: <strong className="text-slate-800">Cơ quan CSĐT (PC03) - Công an TP. Hà Nội</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('don-tuong-tu')}
                      className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Xem so sánh chi tiết với đơn hiện tại</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Đơn gốc 2 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          KN-2025-0089
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Khiếu nại về tiến độ giải quyết tranh chấp đất đai tại Phường Dịch Vọng
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 flex items-center gap-2">
                        <span>Tiếp nhận ngày: <strong className="text-slate-700">20/12/2025 09:15</strong></span>
                        <span>•</span>
                        <span>Loại đơn: <strong className="text-slate-700">Đơn khiếu nại</strong></span>
                        <span>•</span>
                        <span>Hình thức nộp: <strong className="text-slate-700">Dịch vụ bưu chính</strong></span>
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 shrink-0">
                      Đã giải quyết xong
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-sans">
                    <span className="text-slate-400 block font-semibold text-[10.5px] uppercase mb-1">Kết quả xử lý lưu trữ:</span>
                    <p>
                      Đã ban hành <strong>Thông báo số 89/TB-UBND</strong> ngày 15/01/2026 hướng dẫn công dân gửi đơn đúng thẩm quyền tới UBND Phường để tiến hành hòa giải cơ sở theo Luật Đất đai.
                    </p>
                  </div>
                </div>

                {/* Đơn gốc 3 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          PA-2024-0012
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Phản ánh về trật tự xây dựng và lấn chiếm hành lang công cộng
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 flex items-center gap-2">
                        <span>Tiếp nhận ngày: <strong className="text-slate-700">10/05/2024 10:30</strong></span>
                        <span>•</span>
                        <span>Loại đơn: <strong className="text-slate-700">Phản ánh, kiến nghị</strong></span>
                        <span>•</span>
                        <span>Hình thức nộp: <strong className="text-slate-700">Cổng Dịch vụ công Quốc gia</strong></span>
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                      Đã xử lý dứt điểm
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-sans">
                    <span className="text-slate-400 block font-semibold text-[10.5px] uppercase mb-1">Kết quả xử lý lưu trữ:</span>
                    <p>
                      UBND Phường đã lập biên bản xử phạt vi phạm hành chính, tháo dỡ công trình lấn chiếm và trả lời công dân bằng văn bản số <strong>412/UBND-VP</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* TAB 2: ĐƠN TƯƠNG TỰ GỐC (Đ-2025-00341 - TRÙNG 86%)                */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'don-tuong-tu' && (
            <div className="space-y-4">
              {/* Alert Callout */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5 shrink-0">warning</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-tight">
                      CẢNH BÁO PHÁT HIỆN ĐƠN TƯƠNG TỰ CAO (86%) VỚI ĐƠN ĐÃ THỤ LÝ
                    </h4>
                    <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                      Hệ thống AI đối soát phát hiện đơn hiện tại có cùng <strong>Người gửi</strong>, cùng <strong>Đối tượng tố giác (Công ty X)</strong> và cùng <strong>Dự án Khu đô thị Y</strong> so với đơn <strong>Đ-2025-00341</strong> đã thụ lý ngày 15/06/2026. Đơn hiện tại bổ sung thêm tài liệu đợt nộp tiền mới (3.5 tỷ VNĐ).
                    </p>
                  </div>
                </div>

                {onApplyRecommendation && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11.5px] font-semibold text-amber-900">
                      Đề xuất: Nhập đơn này dưới dạng bổ sung tài liệu vào hồ sơ Đ-2025-00341.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyRecommendation(
                          'Qua đối soát phát hiện đơn Đ-2026-00125 trùng đối tượng và nội dung với đơn Đ-2025-00341 (ngày 15/06/2026). Đề xuất tiếp nhận dưới dạng tài liệu bổ sung và chuyển gộp về Đội CSĐT kinh tế (PC03) để giải quyết chung.'
                        );
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Áp dụng đề xuất này vào Ý kiến cán bộ
                    </button>
                  </div>
                )}
              </div>

              {/* Side-by-side comparison table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">compare</span>
                    BẢNG ĐỐI CHIẾU SONG SONG HỒ SƠ ĐƠN
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Độ trùng khớp tổng thể: <strong className="text-red-600 font-mono">86%</strong></span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="p-3 w-1/4">Trường thông tin</th>
                        <th className="p-3 w-1/3 bg-blue-50/50 text-[#004ac6]">Đơn hiện tại (Đ-2026-00125)</th>
                        <th className="p-3 w-1/3 bg-amber-50/50 text-amber-900">Đơn gốc trong CSDL (Đ-2025-00341)</th>
                        <th className="p-3 text-center">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-semibold text-slate-600">Người nộp đơn</td>
                        <td className="p-3 font-bold text-slate-900 bg-blue-50/20">Nguyễn Văn A (CCCD: 001088012345)</td>
                        <td className="p-3 font-bold text-slate-900 bg-amber-50/20">Nguyễn Văn A (CCCD: 001088012345)</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Trùng 100%</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600">Bên bị tố giác</td>
                        <td className="p-3 text-slate-800 bg-blue-50/20">Công ty CP Đầu tư Bất động sản X</td>
                        <td className="p-3 text-slate-800 bg-amber-50/20">Công ty CP Đầu tư Bất động sản X</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Trùng 100%</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600">Địa bàn / Dự án</td>
                        <td className="p-3 text-slate-800 bg-blue-50/20">Dự án Khu đô thị Y (Phân khu River Park)</td>
                        <td className="p-3 text-slate-800 bg-amber-50/20">Dự án Khu đô thị Y</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Trùng 100%</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600">Số tiền &amp; Hợp đồng</td>
                        <td className="p-3 text-slate-800 bg-blue-50/20 font-medium text-blue-950">
                          Hợp đồng số 14/2024 • <strong>3.500.000.000 VNĐ</strong>
                        </td>
                        <td className="p-3 text-slate-800 bg-amber-50/20 font-medium text-amber-950">
                          Hợp đồng số 08/2024 • <strong>1.800.000.000 VNĐ</strong>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Khoản nộp mới</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-600">Yêu cầu giải quyết</td>
                        <td className="p-3 text-slate-800 bg-blue-50/20">Khởi tố vụ án lừa đảo, phong tỏa tài khoản ngân hàng</td>
                        <td className="p-3 text-slate-800 bg-amber-50/20">Điều tra làm rõ hành vi chiếm giữ tiền, yêu cầu hoàn trả</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Tương đồng 89%</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nguyên văn đoạn trích đơn gốc Đ-2025-00341 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">document_scanner</span>
                    Trích lục toàn văn văn bản lưu trữ của đơn Đ-2025-00341:
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM...', 'copy-don-goc')}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedId === 'copy-don-goc' ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedId === 'copy-don-goc' ? 'Đã sao chép' : 'Sao chép trích lục'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800 space-y-2 leading-relaxed max-h-52 overflow-y-auto">
                  <p className="font-bold text-center">ĐƠN TỐ GIÁC VỀ HÀNH VI LỪA ĐẢO CHIẾM ĐOẠT TÀI SẢN</p>
                  <p className="text-slate-500 italic text-center text-[11px]">(Lưu tại Hồ sơ lưu trữ số 341/2026/CSĐT - PC03 Công an TP. Hà Nội)</p>
                  <p>Kính gửi: Cơ quan Cảnh sát điều tra - Công an Thành phố Hà Nội</p>
                  <p>Tôi tên là: <strong>Nguyễn Văn A</strong>, sinh năm 1988, CCCD số: 001088012345 cấp ngày 12/04/2021.</p>
                  <p className="bg-amber-100/70 p-1.5 rounded border border-amber-200">
                    <strong className="text-amber-900">[ĐOẠN TRÙNG KHỚP VỚI ĐƠN MỚI]:</strong> Vào tháng 03/2024, qua tìm hiểu thông tin quảng cáo dự án Khu đô thị Y tại quận Hà Đông do Công ty Cổ phần Đầu tư Bất động sản X làm chủ đầu tư, tôi đã ký hợp đồng hợp tác và nộp tiền vào tài khoản công ty. Tuy nhiên đến nay dự án vẫn là bãi đất trống, công ty không triển khai thi công và né tránh tiếp công dân...
                  </p>
                  <p>Kính đề nghị Quý Cơ quan tiến hành khởi tố điều tra hành vi của Ban Lãnh đạo Công ty CP X để bảo vệ quyền lợi hợp pháp cho người dân.</p>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* TAB 3: HỒ SƠ VỤ VIỆC GỐC (VV-2026-0042)                           */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'vu-viec' && (
            <div className="space-y-4">
              {/* Header Box Vụ việc */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/90 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-2xl">folder</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                          MÃ VỤ VIỆC: VV-2026-0042
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Giai đoạn Điều tra xác minh
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        Vụ án Lừa đảo chiếm đoạt tài sản tại Công ty CP Đầu tư Bất động sản X (Dự án Khu đô thị Y)
                      </h4>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block">Thời hạn điều tra:</span>
                    <strong className="text-xs text-purple-900 font-mono">Còn 72 ngày</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs border-t border-purple-200/60">
                  <div>
                    <span className="text-slate-500 block font-medium">Cơ quan thụ lý chính:</span>
                    <strong className="text-slate-800">Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Điều tra viên phụ trách:</span>
                    <strong className="text-slate-800">Trung tá Lê Hồng Phong (Đội 3)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Quyết định thụ lý:</span>
                    <strong className="text-slate-800 font-mono">142/QĐ-PC03 (02/07/2026)</strong>
                  </div>
                </div>
              </div>

              {/* Tiến độ điều tra & Các đơn thư liên kết */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004ac6]">playlist_add_check</span>
                  Tiến độ điều tra &amp; Danh sách các đơn đã gộp vào vụ việc này:
                </h4>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 space-y-1 leading-relaxed">
                  <p className="font-semibold text-slate-800">Cập nhật hiện trạng từ Cơ quan CSĐT:</p>
                  <p>
                    • Cơ quan CSĐT đã ra quyết định khởi tố vụ án hình sự; đã phong tỏa 02 tài khoản của Công ty CP Đầu tư X tại Ngân hàng Vietcombank và BIDV.
                  </p>
                  <p>
                    • Đang triệu tập 05 cá nhân giữ chức vụ chủ chốt để ghi lời khai và đối soát sổ sách kế toán các đợt phát hành hợp đồng góp vốn.
                  </p>
                </div>

                {/* Danh sách các đơn khác cùng vụ */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Các đơn của công dân khác đã gộp vào vụ việc VV-2026-0042:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">Đ-2026-00098</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-semibold">08/09/2026</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 font-medium">Trần Thị Mai (Đại diện 12 hộ) • 14.2 tỷ VNĐ</p>
                      <span className="text-[10.5px] text-emerald-700 font-semibold block">✓ Đã lấy lời khai người tố giác</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">Đ-2026-00104</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-semibold">11/09/2026</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 font-medium">Lê Quốc Bảo • 2.8 tỷ VNĐ</p>
                      <span className="text-[10.5px] text-blue-700 font-semibold block">✓ Đã đối chiếu sao kê ngân hàng</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-900">Đ-2025-00341</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold">15/06/2026</span>
                      </div>
                      <p className="text-slate-800 line-clamp-1 font-medium">Nguyễn Văn A • 1.8 tỷ VNĐ</p>
                      <span className="text-[10.5px] text-amber-800 font-bold block">⚠️ Cùng người gửi với đơn hiện tại</span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">Đ-2025-00289</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-semibold">28/05/2026</span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 font-medium">Hoàng Thị Lan • 900 triệu VNĐ</p>
                      <span className="text-[10.5px] text-emerald-700 font-semibold block">✓ Đã chuyển hồ sơ tài liệu</span>
                    </div>
                  </div>
                </div>

                {onApplyRecommendation && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-purple-950">
                      Đề xuất: Chuyển nhập đơn Đ-2026-00125 vào Vụ án VV-2026-0042 do PC03 thụ lý.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyRecommendation(
                          'Đề xuất tiếp nhận đơn và chuyển hồ sơ gộp vào Vụ việc VV-2026-0042 (QĐ số 142/QĐ-PC03) đang do Đội 3 - PC03 thụ lý điều tra hành vi lừa đảo của Công ty CP Bất động sản X.'
                        );
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Áp dụng vào Ý kiến đề xuất cán bộ
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
            <span>Dữ liệu được trích xuất trực tiếp từ hệ thống lưu trữ Quốc gia &amp; Nội bộ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                window.print?.();
              }}
              className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>In phiếu tra cứu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
