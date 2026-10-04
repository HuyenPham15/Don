import React, { useState } from 'react';
import { Screen } from '../../types';

export type TrangThaiXacMinh = 'dang_xac_minh' | 'xac_minh_thanh_cong' | 'co_canh_bao';

export type HuongGiaiQuyetType = 'thu_ly' | 'yeu_cau_bo_sung' | 'khong_thu_ly' | 'ban_giao' | 'tra_lai';

export interface XacMinhVaDeXuatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHuongXuLy: (huong: HuongGiaiQuyetType | 'quy_trinh') => void;
  onNav?: (screen: Screen) => void;
  donInfo?: {
    code?: string;
    luotNhanId?: string;
    nguoiNop?: string;
    cccd?: string;
    sdt?: string;
    diaChi?: string;
    loaiDon?: string;
    noiDung?: string;
    ngayNhan?: string;
  };
}

export default function XacMinhVaDeXuatModal({
  isOpen,
  onClose,
  onSelectHuongXuLy,
  onNav,
  donInfo = {
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2026-0819',
    nguoiNop: 'Nguyễn Văn A',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn tố cáo cán bộ vi phạm công vụ',
    noiDung: 'Tố cáo hành vi sách nhiễu, cố ý kéo dài thời gian giải quyết hồ sơ cấp GCNQSDĐ',
    ngayNhan: '16/09/2026',
  },
}: XacMinhVaDeXuatModalProps) {
  // Trạng thái tiến trình xác minh: 'dang_xac_minh' -> 'xac_minh_thanh_cong' -> 'co_canh_bao'
  const [trangThaiXacMinh, setTrangThaiXacMinh] = useState<TrangThaiXacMinh>('dang_xac_minh');
  const [isAutoChecking, setIsAutoChecking] = useState<boolean>(false);

  // 4 Tiêu chí xác minh luật định (theo Điều 24, 29 Luật Tố cáo 2018 & TT 05/2021/TT-TTCP)
  const [chkNhanThan, setChkNhanThan] = useState<boolean>(true);
  const [chkThamQuyen, setChkThamQuyen] = useState<boolean>(true);
  const [chkCoSoChungCu, setChkCoSoChungCu] = useState<boolean>(true);
  const [chkKhongTrungLap, setChkKhongTrungLap] = useState<boolean>(
    trangThaiXacMinh === 'xac_minh_thanh_cong'
  );

  // Ý kiến nhận xét đánh giá kết quả xác minh
  const [ghiChuXacMinh, setGhiChuXacMinh] = useState<string>(
    'Đã kiểm tra đối chiếu CSDL dân cư VNeID: người nộp đủ năng lực hành vi dân sự. Nội dung vụ việc thuộc thẩm quyền xem xét xử lý của đơn vị. Có tài liệu chứng cứ kèm theo, không có dấu hiệu nặc danh hay trùng lặp.'
  );

  // Đề xuất hướng xử lý / hướng giải quyết: 5 hướng luật định
  const [selectedHuong, setSelectedHuong] = useState<HuongGiaiQuyetType>('thu_ly');

  if (!isOpen) return null;

  // Mô phỏng AI / CSDL chạy đối soát tự động hoàn tất xác minh
  const handleRunAutoVerify = () => {
    setIsAutoChecking(true);
    setTimeout(() => {
      setIsAutoChecking(false);
      setChkNhanThan(true);
      setChkThamQuyen(true);
      setChkCoSoChungCu(true);
      setChkKhongTrungLap(true);
      setTrangThaiXacMinh('xac_minh_thanh_cong');
      setSelectedHuong('thu_ly');
      setGhiChuXacMinh(
        `✓ ĐÃ XÁC MINH HOÀN TẤT THÀNH CÔNG: Hồ sơ đơn ${donInfo.code || 'Đ-2026-00125'} của công dân ${donInfo.nguoiNop} đáp ứng đủ 3 điều kiện luật định theo Điều 29 Luật Tố cáo 2018. Đề xuất ban hành Quyết định thụ lý giải quyết theo Mẫu số 01/TT-TTCP.`
      );
    }, 700);
  };

  const handleConfirm = () => {
    onSelectHuongXuLy(selectedHuong);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-body-md">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white px-6 py-3.5 border-b border-blue-100 flex items-center justify-between gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md ${trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-[#004ac6] shadow-blue-200'
              }`}>
              <span className="material-symbols-outlined text-[24px]">
                {trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'verified' : 'fact_check'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#004ac6] border border-blue-300">
                  Bước 2 theo Quy trình cấu hình
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Giai đoạn Tiếp nhận &amp; Xác định hướng xử lý (Điều 24 Luật Tố cáo)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Xác minh thông tin &amp; Đề xuất hướng giải quyết đơn
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ===================== TIẾN TRÌNH 3 GIAI ĐOẠN RÕ RÀNG (STEPPER) ===================== */}
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between gap-4 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Step 1: Đã tiếp nhận */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px] font-bold">✓</span>
              <span>1. Tiếp nhận đơn</span>
            </div>

            <span className="text-slate-600 font-bold">➔</span>

            {/* Step 2: Quá trình xác minh */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold ${trangThaiXacMinh === 'xac_minh_thanh_cong'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
              }`}>
              <span className="material-symbols-outlined text-[15px]">
                {trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'verified' : 'sync'}
              </span>
              <span>
                2. {trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'Đã xác minh thành công' : 'Đang xác minh thông tin'}
              </span>
            </div>

            <span className="text-slate-600 font-bold">➔</span>

            {/* Step 3: Đề xuất hướng giải quyết */}
            <div className={`flex items-center gap-1.5 font-semibold ${trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'text-amber-300' : 'text-slate-400'
              }`}>
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>
                3. Đề xuất:{' '}
                {selectedHuong === 'thu_ly'
                  ? 'Thụ lý đơn ➔ Lập Tờ trình trình ký'
                  : selectedHuong === 'yeu_cau_bo_sung'
                    ? 'Yêu cầu bổ sung tài liệu'
                    : selectedHuong === 'khong_thu_ly'
                      ? 'Không thụ lý giải quyết'
                      : selectedHuong === 'ban_giao'
                        ? 'Bàn giao chuyển đơn'
                        : 'Trả lại đơn & Hướng dẫn'}
              </span>
            </div>
          </div>

          {/* Công tắc chuyển đổi trạng thái demo nhanh */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setTrangThaiXacMinh('dang_xac_minh');
                setChkKhongTrungLap(false);
              }}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${trangThaiXacMinh === 'dang_xac_minh' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
            >
              Đang xác minh (3/4)
            </button>
            <button
              type="button"
              onClick={() => {
                setTrangThaiXacMinh('xac_minh_thanh_cong');
                setChkKhongTrungLap(true);
                setSelectedHuong('thu_ly');
              }}
              className={`px-2 py-1 rounded cursor-pointer transition-colors ${trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
            >
              Xác minh thành công (4/4)
            </button>
          </div>
        </div>


        {/* ===================== BODY CHÍNH ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* KHỐI 2: CHI TIẾT 4 TIÊU CHÍ XÁC MINH THÔNG TIN */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">checklist</span>
                1. Tiến trình kiểm tra &amp; Xác minh thông tin ban đầu:
              </h3>
              <span className="text-[11px] text-slate-500 italic">
                {trangThaiXacMinh === 'xac_minh_thanh_cong'
                  ? '✓ 4/4 tiêu chí đã kiểm tra hợp lệ'
                  : '⏳ 3/4 tiêu chí đã kiểm tra • 1 tiêu chí đang quét'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tiêu chí 1: Nhân thân */}
              <div className="p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-xs font-bold text-slate-900">Xác minh chủ thể nộp đơn</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Khớp CSDL VNeID
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Công dân {donInfo.nguoiNop}, CCCD: {donInfo.cccd || '001065009182'}. Đủ năng lực hành vi dân sự, không phải đơn nặc danh hay mạo danh.
                </p>
              </div>

              {/* Tiêu chí 2: Thẩm quyền */}
              <div className="p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-xs font-bold text-slate-900">Kiểm tra thẩm quyền xử lý</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Đúng thẩm quyền
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Địa bàn quản lý Quận Cầu Giấy, thuộc thẩm quyền giải quyết của Chủ tịch UBND quận theo Điều 12 Luật Tố cáo / Luật Khiếu nại.
                </p>
              </div>

              {/* Tiêu chí 3: Căn cứ, chứng cứ */}
              <div className="p-3.5 rounded-xl border bg-emerald-50/50 border-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-xs font-bold text-slate-900">Đối soát tài liệu chứng cứ</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tài liệu chứng cứ
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Đã bóc tách tài liệu đính kèm: Bản sao GCNQSDĐ, văn bản liên quan. Nếu thiếu chứng từ cần chọn hướng yêu cầu bổ sung.
                </p>
              </div>

              {/* Tiêu chí 4: Trùng lặp */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${chkKhongTrungLap || trangThaiXacMinh === 'xac_minh_thanh_cong'
                ? 'bg-emerald-50/50 border-emerald-300'
                : 'bg-amber-50/50 border-amber-300'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {chkKhongTrungLap || trangThaiXacMinh === 'xac_minh_thanh_cong' ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">⏳</span>
                    )}
                    <span className="text-xs font-bold text-slate-900">Rà soát trùng lặp &amp; tiền sử</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chkKhongTrungLap || trangThaiXacMinh === 'xac_minh_thanh_cong'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                    }`}>
                    {chkKhongTrungLap || trangThaiXacMinh === 'xac_minh_thanh_cong' ? 'Không phát hiện trùng' : 'Đang quét kho CSDL...'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Quét dữ liệu đơn toàn ngành giai đoạn 2024–2026: hồ sơ mới, chưa có quyết định giải quyết có hiệu lực pháp luật.
                </p>
              </div>
            </div>
          </div>

          {/* KHỐI 3: KẾT LUẬN XÁC MINH */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Nhận xét &amp; Kết luận xác minh thông tin ban đầu:
              </label>
              {trangThaiXacMinh === 'xac_minh_thanh_cong' && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  Đã đủ điều kiện để đề xuất hướng giải quyết
                </span>
              )}
            </div>
            <textarea
              value={ghiChuXacMinh}
              onChange={(e) => setGhiChuXacMinh(e.target.value)}
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 leading-relaxed bg-slate-50/50"
              placeholder="Nhập nội dung kết luận xác minh..."
            />
          </div>

          {/* KHỐI 4: ĐỀ XUẤT HƯỚNG GIẢI QUYẾT (5 HƯỚNG CHUẨN THEO LUẬT) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">alt_route</span>
                <span>2. Chọn hướng giải quyết đơn theo kết quả xác minh (5 hướng xử lý):</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Căn cứ Luật Tố cáo 2018 &amp; Thông tư 05/2021/TT-TTCP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Hướng 1: Thụ lý đơn */}
              <div
                onClick={() => setSelectedHuong('thu_ly')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedHuong === 'thu_ly'
                  ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-200 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      1
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Đủ ĐK thụ lý &amp; Trình ký
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">
                    Đề xuất Thụ lý đơn ➔ Lập Tờ trình
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Lập Tờ trình đề xuất thụ lý (Mẫu số 01/TT-TTCP) trình tới Lãnh đạo và đi theo Luồng trình ký.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center justify-between border-t border-emerald-100 mt-2">
                  <span>TỜ TRÌNH ➔ LUỒNG TRÌNH KÝ</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 2: YÊU CẦU BỔ SUNG */}
              <div
                onClick={() => setSelectedHuong('yeu_cau_bo_sung')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedHuong === 'yeu_cau_bo_sung'
                  ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-200 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      2
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Thiếu tài liệu / Căn cứ
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">
                    Yêu cầu bổ sung tài liệu, thông tin
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Hồ sơ chưa đủ căn cứ; ban hành Thông báo yêu cầu công dân bổ sung hồ sơ chứng minh (thời hạn 10 ngày).
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-blue-700 flex items-center justify-between border-t border-blue-100 mt-2">
                  <span>THÔNG BÁO BỔ SUNG</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 3: KHÔNG THỤ LÝ */}
              <div
                onClick={() => setSelectedHuong('khong_thu_ly')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedHuong === 'khong_thu_ly'
                  ? 'border-red-600 bg-red-50/90 ring-2 ring-red-200 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-red-300'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      3
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">
                    Không thụ lý giải quyết [Điều 29]
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Không đủ điều kiện (nặc danh, đã giải quyết đúng PL không có tình tiết mới); ban hành Thông báo không thụ lý.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-red-700 flex items-center justify-between border-t border-red-100 mt-2">
                  <span>THÔNG BÁO KHÔNG THỤ LÝ</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 4: Bàn giao / Chuyển đơn */}
              <div
                onClick={() => setSelectedHuong('ban_giao')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedHuong === 'ban_giao'
                  ? 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-200 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      4
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Khác thẩm quyền
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">
                    Bàn giao / Chuyển đơn [STEP-03C]
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Chuyển sang đơn vị chức năng hoặc cơ quan có thẩm quyền khác giải quyết theo Điều 26 Luật Tố cáo.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-amber-700 flex items-center justify-between border-t border-amber-100 mt-2">
                  <span>STEP-03C</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>

              {/* Hướng 5: Trả lại đơn & Hướng dẫn */}
              <div
                onClick={() => setSelectedHuong('tra_lai')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedHuong === 'tra_lai'
                  ? 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-200 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-rose-300'
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      5
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      KẾT THÚC ĐƠN
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">
                    Trả lại đơn &amp; Hướng dẫn [STEP-03D]
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Trả lại đơn do không đủ điều kiện theo luật và lập phiếu hướng dẫn công dân gửi đúng cơ quan thẩm quyền.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-rose-700 flex items-center justify-between border-t border-rose-100 mt-2">
                  <span>STEP-03D</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== FOOTER ACTIONS ===================== */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNav?.('quy-trinh-xu-ly');
              }}
              className="px-4 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Mở Sơ đồ Quy trình</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all active:scale-95 ${selectedHuong === 'thu_ly'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : selectedHuong === 'yeu_cau_bo_sung'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                  : selectedHuong === 'khong_thu_ly'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    : selectedHuong === 'ban_giao'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {selectedHuong === 'thu_ly'
                  ? 'verified'
                  : selectedHuong === 'yeu_cau_bo_sung'
                    ? 'note_add'
                    : selectedHuong === 'khong_thu_ly'
                      ? 'block'
                      : selectedHuong === 'ban_giao'
                        ? 'swap_horiz'
                        : 'assignment_return'}
              </span>
              <span>
                {selectedHuong === 'thu_ly'
                  ? 'Xác nhận ➔ Lập Tờ trình & Trình ký Lãnh đạo'
                  : selectedHuong === 'yeu_cau_bo_sung'
                    ? 'Xác nhận ➔ Lập Thông báo yêu cầu bổ sung hồ sơ'
                    : selectedHuong === 'khong_thu_ly'
                      ? 'Xác nhận ➔ Ban hành Thông báo Không thụ lý'
                      : selectedHuong === 'ban_giao'
                        ? 'Xác nhận ➔ Tiến hành Bàn giao đơn'
                        : 'Xác nhận ➔ Tiến hành Trả lại đơn'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
