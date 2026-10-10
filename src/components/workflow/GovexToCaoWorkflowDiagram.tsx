import React, { useState } from 'react';
import {
  GovexNodeDetail,
  GOVEX_NODES_DATA,
  DocumentInfo,
  SubmissionRound,
  ApprovalStepParticipant,
  ApprovalActionType,
  DocStatus,
  StepStatus,
} from './govexWorkflowData';

export type {
  GovexNodeDetail,
  DocumentInfo,
  SubmissionRound,
  ApprovalStepParticipant,
  ApprovalActionType,
  DocStatus,
  StepStatus,
};

const NODES_DATA = GOVEX_NODES_DATA;

export default function GovexToCaoWorkflowDiagram({
  donCode = 'Đ-2026-00125',
  donTitle = 'Tố giác sai phạm trật tự xây dựng & lấn chiếm lối đi chung tại ngõ 128 Đội Cấn',
  nguoiNop = 'Đại diện cư dân TDP số 3',
  onViewDocument,
  onOpenQuanLyTrinhKy,
}: {
  donCode?: string;
  donTitle?: string;
  nguoiNop?: string;
  onOpenQuanLyTrinhKy?: (luotTrinhId?: string) => void;
  onViewDocument?: (docInfo: {
    tenVanBan: string;
    soHieu?: string;
    loai?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
  }) => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tn-2');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);


  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  const handleSelectNode = (nodeId: string, toastText?: string) => {
    setSelectedNodeId(nodeId);
    setIsRightPanelOpen(true);
    setSelectedRoundIndex(0);
    if (toastText) {
      showToast(toastText);
    }
  };

  const selectedNode: GovexNodeDetail = NODES_DATA[selectedNodeId] || NODES_DATA['tn-2'];

  const handleViewDoc = () => {
    const doc = selectedNode.taiLieuVanBan;
    const tenVb = doc ? doc.tenVanBan : selectedNode.ketQuaCuoiCung.vanBanDauRa;
    const loai = doc ? doc.loaiVanBan : 'thong_bao';
    const soHieu = doc?.soKyHieu || '01/VB-TC';

    if (onViewDocument) {
      onViewDocument({
        tenVanBan: tenVb,
        soHieu,
        loai,
        trichYeu: doc?.noiDungTomTat || selectedNode.ketQuaCuoiCung.tieuDe || tenVb,
        noiDungChiTiet: doc?.noiDungChiTiet || `${selectedNode.ketQuaCuoiCung.tieuDe}\n\n${selectedNode.ketQuaCuoiCung.chiTietKetQua}\n\nCăn cứ pháp lý: ${selectedNode.legalBasis}\nThời hạn thực hiện: ${selectedNode.ketQuaCuoiCung.thoiHanThucHien}`,
      });
    } else {
      setIsDocModalOpen(true);
      showToast(`✓ Đang xem chi tiết: ${tenVb}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold animate-fade-in border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Tiêu đề - Chuẩn hóa Quy trình xử lý đơn */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-[#0047AB] tracking-tight uppercase font-headline-md">
                QUY TRÌNH XỬ LÝ ĐƠN
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0047AB] border border-blue-200">
                Nhấp bước hoặc điều kiện để xem Kết quả &amp; Người thực hiện
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hồ sơ: <strong className="text-slate-800">{donCode}</strong> • {donTitle} • Người nộp: <strong>{nguoiNop}</strong>
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.1, 0.75))}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="text-[11px] font-bold text-slate-700 px-2 font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.1, 1.4))}
            className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Phóng to"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg hover:bg-white text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
            title="Khôi phục kích thước 100%"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THÂN BẢNG: CANVAS QUY TRÌNH (BÊN TRÁI) + THÔNG TIN CHI TIẾT (BÊN PHẢI)    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-row overflow-hidden relative min-h-0">
        {/* VÙNG 1: SƠ ĐỒ LÀN BƠI QUY TRÌNH (CÓ SCROLL & ZOOM RIÊNG) */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50 relative">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', minWidth: '920px' }}
            className="transition-transform duration-150"
          >
            {/* ========================================================================= */}
            {/* PHẦN 1: BẢNG LÀN BƠI CHÍNH – QUY TRÌNH XỬ LÝ ĐƠN                          */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
              {/* Header 2 Giai đoạn chuẩn của Xử lý đơn */}
              <div className="grid grid-cols-12 bg-sky-100/70 border-b border-slate-300 text-center font-bold text-xs text-slate-800">
                <div className="col-span-2 p-2.5 border-r border-slate-300 flex items-center justify-center bg-slate-100 text-slate-700 uppercase tracking-tight text-[11px]">
                  TÁC NHÂN
                </div>
                <div className="col-span-5 p-2.5 border-r border-slate-300 text-[11px] uppercase bg-sky-50 text-blue-900 flex items-center justify-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">1</span>
                  <span>GĐ 1 – TIẾP NHẬN &amp; XÁC ĐỊNH HƯỚNG XỬ LÝ ĐƠN</span>
                </div>
                <div className="col-span-5 p-2.5 text-[11px] uppercase bg-sky-50 text-blue-900 flex items-center justify-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">2</span>
                  <span>GĐ 2 – PHÊ DUYỆT &amp; THỤ LÝ ĐƠN (HOÀN TẤT XỬ LÝ ĐƠN)</span>
                </div>
              </div>

              {/* 1. LÀN BƠI 1: CÁN BỘ CHUYÊN MÔN */}
              <div className="grid grid-cols-12 border-b border-slate-300 bg-sky-50/20 min-h-[220px]">
                <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-sky-100/40">
                  <span className="material-symbols-outlined text-blue-700 text-2xl">person</span>
                  <span className="text-xs font-bold text-blue-950 mt-1 uppercase tracking-tight">
                    CÁN BỘ CHUYÊN MÔN
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tiếp nhận &amp; Đề xuất xử lý</span>
                </div>

                {/* GĐ 1: Tiếp nhận -> Kiểm tra/Xác minh -> 4 nhánh kết quả */}
                <div className="col-span-5 p-3 border-r border-slate-300 flex flex-col justify-between gap-2.5">
                  {/* 2 Bước đầu: Tiếp nhận -> Kiểm tra ban đầu */}
                  <div className="flex items-center gap-2">
                    {/* Node 1: Tiếp nhận đơn */}
                    <div
                      onClick={() => handleSelectNode('tn-1', '● Đã chọn: Bước 1. Tiếp nhận đơn')}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tn-1'
                        ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-600 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-800 font-bold">Bước 1</span>
                        {selectedNodeId === 'tn-1' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        )}
                      </div>
                      <span className="text-[11px] text-blue-900 font-bold block leading-tight">1. Tiếp nhận đơn</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Vào sổ điện tử &amp; Phiếu nhận</span>
                    </div>

                    <span className="material-symbols-outlined text-blue-600 text-base shrink-0">arrow_forward</span>

                    {/* Node 2: Kiểm tra ban đầu & Xác minh */}
                    <div
                      onClick={() => handleSelectNode('tn-2', '● Đã chọn: Bước 2. Kiểm tra & Xác minh')}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tn-2'
                        ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-600 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-800 font-bold">Bước 2</span>
                        {selectedNodeId === 'tn-2' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        )}
                      </div>
                      <span className="text-[11px] text-blue-900 font-bold block leading-tight">2. Kiểm tra &amp; Xác minh</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Điều kiện thụ lý / Thẩm quyền</span>
                    </div>
                  </div>

                  {/* Khối quyết định Kết quả xử lý? & 4 nhánh kết quả */}
                  <div className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 px-1">
                      <span className="uppercase tracking-tight text-slate-500">Kết quả kiểm tra &amp; xác minh:</span>
                      <span className="text-blue-700">4 Hướng xử lý</span>
                    </div>

                    {/* 4 Nhánh kết quả: Không thụ lý, Yêu cầu bổ sung, Bàn giao, Trả lại */}
                    <div className="grid grid-cols-4 gap-1.5 text-[9px]">
                      {/* Nhánh 1: Không thụ lý */}
                      <button
                        type="button"
                        onClick={() => handleSelectNode('tn-kt-khong-thu-ly', '● Đã chọn điều kiện: Không thụ lý giải quyết')}
                        className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-khong-thu-ly'
                          ? 'ring-2 ring-rose-600 bg-rose-100 border-rose-500 font-bold shadow-md scale-[1.02]'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <span className="font-bold text-slate-800 leading-tight">Không thụ lý</span>
                        <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                          KẾT THÚC ĐƠN
                        </span>
                      </button>

                      {/* Nhánh 2: Yêu cầu bổ sung */}
                      <button
                        type="button"
                        onClick={() => handleSelectNode('tn-kt-yeu-cau-bo-sung', '● Đã chọn điều kiện: Yêu cầu bổ sung tài liệu (Hạn 10 ngày)')}
                        className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-yeu-cau-bo-sung'
                          ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <span className="font-bold text-blue-900 leading-tight">Y/C Bổ sung</span>
                        <span className="mt-1 px-1 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-bold text-[8px]">
                          HẠN 10 NGÀY
                        </span>
                      </button>

                      {/* Nhánh 3: Bàn giao */}
                      <button
                        type="button"
                        onClick={() => handleSelectNode('tn-kt-ban-giao', '● Đã chọn điều kiện: Bàn giao / Chuyển cơ quan khác')}
                        className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-ban-giao'
                          ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold shadow-md scale-[1.02]'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <span className="font-bold text-slate-800 leading-tight">Bàn giao</span>
                        <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                          KẾT THÚC ĐƠN
                        </span>
                      </button>

                      {/* Nhánh 4: Trả lại đơn */}
                      <button
                        type="button"
                        onClick={() => handleSelectNode('tn-kt-tra-lai', '● Đã chọn điều kiện: Trả lại đơn & Hướng dẫn')}
                        className={`p-1.5 rounded-lg border text-center cursor-pointer transition-all flex flex-col justify-between ${selectedNodeId === 'tn-kt-tra-lai'
                          ? 'ring-2 ring-rose-600 bg-rose-100 border-rose-500 font-bold shadow-md scale-[1.02]'
                          : 'bg-white border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <span className="font-bold text-slate-800 leading-tight">Trả lại đơn</span>
                        <span className="mt-1 px-1 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[8px]">
                          KẾT THÚC ĐƠN
                        </span>
                      </button>
                    </div>

                    {/* Nhánh 5: Đủ điều kiện thụ lý -> Chuyển sang GĐ 2 */}
                    <div
                      onClick={() => handleSelectNode('tn-du-dieu-kien', '● Đã chọn: Đủ điều kiện thụ lý (Chuyển GĐ 2)')}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${selectedNodeId === 'tn-du-dieu-kien'
                        ? 'ring-2 ring-blue-600 bg-blue-200 border-blue-600 font-bold shadow-md'
                        : 'bg-blue-100/70 border-blue-200 hover:bg-blue-200/80 text-blue-900 font-bold'
                        } text-[10px]`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-blue-700">check_circle</span>
                        <span>Đủ điều kiện thụ lý:</span>
                      </span>
                      <span className="flex items-center gap-1 text-[9.5px] text-blue-800 font-bold">
                        Chuyển GĐ 2 (Đề xuất thụ lý)
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* GĐ 2: Đề xuất thụ lý -> Trình lãnh đạo + Cán bộ thụ lý tố cáo -> KẾT THÚC ĐƠN */}
                <div className="col-span-5 p-3 flex flex-col justify-between gap-2.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleSelectNode('tl-1', '● Đã chọn: Đề xuất thụ lý')}
                        className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-1'
                          ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                          : 'bg-white border-blue-300 hover:border-blue-500'
                          }`}
                      >
                        <span className="text-[11px] text-blue-900 font-bold block leading-tight">Đề xuất thụ lý</span>
                        <span className="text-[9.5px] text-slate-500 block mt-0.5">Lập Báo cáo / Tờ trình Mẫu 01</span>
                      </div>

                      <span className="material-symbols-outlined text-blue-600 text-base shrink-0">arrow_forward</span>

                      <div
                        onClick={() => handleSelectNode('tl-2', '● Đã chọn: Trình Lãnh đạo')}
                        className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-2'
                          ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                          : 'bg-white border-blue-300 hover:border-blue-500'
                          }`}
                      >
                        <span className="text-[11px] text-blue-900 font-bold block leading-tight">Trình Lãnh đạo</span>
                        <span className="text-[9.5px] text-slate-500 block mt-0.5">Gửi hồ sơ vào mục Trình ký</span>
                      </div>
                    </div>

                    <div className="text-[9.5px] text-rose-600 font-semibold bg-rose-50/90 p-1.5 rounded-lg border border-rose-200 flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-[13px]">undo</span>
                      <span>Nhận lại nếu có yêu cầu chỉnh sửa, hoàn thiện từ Lãnh đạo</span>
                    </div>
                  </div>

                  {/* Kết quả sau duyệt: Cán bộ chuyên môn ban hành thông báo thụ lý tố cáo -> KẾT THÚC QUY TRÌNH XỬ LÝ ĐƠN */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div
                      onClick={() => handleSelectNode('tl-5', '● Đã chọn: Ban hành Quyết định & Thông báo thụ lý')}
                      className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-5'
                        ? 'ring-2 ring-blue-600 bg-blue-100 border-blue-500 font-bold shadow-md scale-[1.02]'
                        : 'bg-white border-blue-300 hover:border-blue-500'
                        }`}
                    >
                      <span className="text-[10.5px] text-blue-950 font-bold block leading-tight">
                        Ban hành Quyết định &amp; Thông báo thụ lý tố cáo
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Mẫu số 01 / Gửi người tố cáo</span>
                    </div>

                    <div className="px-2.5 py-2 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-800 font-black text-[10px] shrink-0 text-center leading-tight">
                      <div>✓ HOÀN TẤT</div>
                      <div className="text-[8.5px] font-bold text-emerald-700">XỬ LÝ ĐƠN</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. LÀN BƠI 2: LÃNH ĐẠO */}
              <div className="grid grid-cols-12 border-b border-slate-300 bg-amber-50/25 min-h-[110px]">
                <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-amber-100/50">
                  <span className="material-symbols-outlined text-amber-700 text-2xl">shield_person</span>
                  <span className="text-xs font-bold text-amber-950 mt-1 uppercase tracking-tight">
                    LÃNH ĐẠO
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Người có thẩm quyền</span>
                </div>

                {/* GĐ 1: Theo dõi chỉ đạo chung */}
                <div className="col-span-5 p-3 border-r border-slate-300 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50/30">
                  (Theo dõi tiến độ tiếp nhận &amp; phân loại đơn)
                </div>

                {/* GĐ 2: Lãnh đạo xem xét / phê duyệt đề xuất thụ lý */}
                <div className="col-span-5 p-3 flex items-center justify-between gap-3">
                  <div
                    onClick={() => handleSelectNode('tl-3', '● Đã chọn: Lãnh đạo xem xét & phê duyệt đề xuất')}
                    className={`flex-1 p-2.5 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-3'
                      ? 'ring-2 ring-amber-600 bg-amber-100 border-amber-500 font-bold shadow-md scale-[1.02]'
                      : 'bg-white border-amber-300 hover:border-amber-400'
                      }`}
                  >
                    <span className="text-[11px] text-amber-950 font-bold block leading-tight">
                      Lãnh đạo xem xét &amp; phê duyệt đề xuất thụ lý
                    </span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">
                      Ký số phê duyệt Tờ trình &amp; Dự thảo Quyết định thụ lý
                    </span>
                  </div>

                  {/* Khối hình thoi quyết định: Ký duyệt thụ lý? */}
                  <div
                    onClick={() => handleSelectNode('tl-duyet', '● Đã chọn quyết định: Ký duyệt thụ lý?')}
                    className={`w-20 h-16 rotate-45 flex items-center justify-center shrink-0 cursor-pointer transition-all ${selectedNodeId === 'tl-duyet'
                      ? 'ring-2 ring-purple-600 bg-purple-100 border-2 border-purple-600 shadow-md scale-105'
                      : 'bg-purple-50 border border-purple-300 hover:bg-purple-100 shadow-2xs'
                      }`}
                  >
                    <span className="-rotate-45 text-[9.5px] font-bold text-purple-900 text-center leading-tight">
                      Ký duyệt<br />thụ lý?
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. LÀN BƠI 3: HỆ THỐNG / VĂN THƯ */}
              <div className="grid grid-cols-12 border-b border-slate-300 bg-slate-50 min-h-[95px]">
                <div className="col-span-2 p-3 border-r border-slate-300 flex flex-col justify-center items-center text-center bg-slate-200/60">
                  <span className="material-symbols-outlined text-slate-700 text-2xl">database</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">
                    HỆ THỐNG / VĂN THƯ
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tự động hóa tác vụ</span>
                </div>

                {/* GĐ 1: Tự động cấp mã đơn & vào sổ điện tử */}
                <div className="col-span-5 p-3 border-r border-slate-300 flex items-center justify-center text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-300 text-[10.5px]">
                    <span className="material-symbols-outlined text-blue-600 text-base">pin</span>
                    <span>Tự động cấp mã đơn điện tử &amp; đồng bộ CSDL tiếp nhận</span>
                  </div>
                </div>

                {/* GĐ 2: Tự động cấp số thụ lý -> Hoàn tất đóng hồ sơ xử lý đơn */}
                <div className="col-span-5 p-3 flex items-center gap-2">
                  <div
                    onClick={() => handleSelectNode('tl-4', '● Đã chọn: Tự động cấp số thụ lý')}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-4'
                      ? 'ring-2 ring-slate-600 bg-slate-200 border-slate-500 font-bold shadow-md scale-[1.02]'
                      : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                  >
                    <span className="text-[10.5px] text-slate-800 font-bold block leading-tight">
                      Tự động cấp số thụ lý
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Số TLTC-2026/... vào sổ điện tử</span>
                  </div>

                  <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>

                  <div
                    onClick={() => handleSelectNode('tl-6', '● Đã chọn: Hoàn tất đóng hồ sơ xử lý đơn')}
                    className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${selectedNodeId === 'tl-6'
                      ? 'ring-2 ring-slate-600 bg-slate-200 border-slate-500 font-bold shadow-md scale-[1.02]'
                      : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                  >
                    <span className="text-[10.5px] text-slate-800 font-bold block leading-tight">
                      Hoàn tất đóng hồ sơ xử lý đơn
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Lưu trữ kết quả xử lý đơn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHẦN 2: THÔNG TIN CHI TIẾT BƯỚC (HIỂN THỊ CHỒNG LÊN NHƯ DRAWER)             */}
        {/* ========================================================================= */}
        {isRightPanelOpen && (
          <aside className="absolute top-0 right-0 bottom-0 w-[440px] xl:w-[480px] border-l border-slate-200 bg-white shadow-2xl z-30 flex flex-col overflow-hidden animate-drawer-slide-in">
            {/* 1. HEADER PANEL BÊN PHẢI (THÔNG TIN BƯỚC) */}
            <div className="p-3.5 bg-white text-slate-800 shrink-0 border-b border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">account_tree</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                        {selectedNode.code || 'BƯỚC QUY TRÌNH'}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-medium truncate" title={selectedNode.stageName}>
                        {selectedNode.stageName}
                      </span>
                    </div> */}
                    <div className="font-bold text-slate-900 text-xs truncate mt-0.5" title={selectedNode.name}>
                      {selectedNode.name}
                    </div>
                  </div>
                </div>

                {/* Các nút thao tác góc trên bên phải */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedNode.code || selectedNode.name);
                      showToast(`Đã sao chép: ${selectedNode.name}`);
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Sao chép tên bước"
                  >
                    <span className="material-symbols-outlined text-[17px]">content_copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRightPanelOpen(false)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                    title="Đóng bảng chi tiết"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. BODY SCROLLABLE CONTENT (HIỂN THỊ LIỀN MẠCH KHÔNG CHIA TAB) */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-50/60 font-body-md">

              {/* ========================================================================= */}
              {/* A. THÔNG TIN CHUNG BƯỚC XỬ LÝ                                             */}
              {/* ========================================================================= */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-black">A</span>
                    <span>THÔNG TIN CHUNG BƯỚC XỬ LÝ</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedNode.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedNode.status === 'active'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                  >
                    {selectedNode.trangThaiText}
                  </span>
                </div>

                {/* Banner nếu step đang xử lý */}
                {selectedNode.status === 'active' && (
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center gap-2 text-[11px] text-blue-900">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] animate-spin">sync</span>
                    <div>
                      <strong>Bước đang trong quá trình thực hiện:</strong> Cán bộ chuyên môn đang thụ lý và hoàn thiện hồ sơ.
                    </div>
                  </div>
                )}

                {/* 1. Người thực hiện & Vai trò, chức vụ */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-500">person</span>
                    <span>1. Người thực hiện &amp; Vai trò, chức vụ:</span>
                  </div>

                  {/* Cán bộ thực hiện chính */}
                  <div className="p-2.5 bg-gradient-to-r from-blue-50/40 to-white rounded-lg border border-blue-100 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {selectedNode.nguoiHanhDong.canBoThucHien.hoTen.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">
                            {selectedNode.nguoiHanhDong.canBoThucHien.hoTen}
                          </span>
                          <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-blue-100/70 text-blue-700 font-medium">
                            {selectedNode.roleName}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-600 truncate">
                          {selectedNode.nguoiHanhDong.canBoThucHien.chucVu} • {selectedNode.nguoiHanhDong.canBoThucHien.donVi}
                        </div>
                      </div>
                    </div>
                    {selectedNode.nguoiHanhDong.canBoThucHien.hanhDongCuThe && (
                      <div className="text-[10.5px] text-slate-600 bg-white/80 p-1.5 rounded border border-blue-50">
                        <span className="font-semibold text-slate-700">Hành động:</span> {selectedNode.nguoiHanhDong.canBoThucHien.hanhDongCuThe}
                      </div>
                    )}
                  </div>

                  {/* Lãnh đạo ký duyệt (nếu có) */}
                  {selectedNode.nguoiHanhDong.lanhDaoKyDuyet && (
                    <div className="p-2.5 bg-gradient-to-r from-amber-50/40 to-white rounded-lg border border-amber-100 space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">
                              {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen}
                            </span>
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-100/70 text-amber-800 font-medium">
                              Lãnh đạo phê duyệt
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-600 truncate">
                            {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.chucVu} • {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.donVi}
                          </div>
                        </div>
                      </div>
                      {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hanhDongCuThe && (
                        <div className="text-[10.5px] text-slate-600 bg-white/80 p-1.5 rounded border border-amber-50">
                          <span className="font-semibold text-slate-700">Chỉ đạo / Phê duyệt:</span> {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hanhDongCuThe}
                        </div>
                      )}
                      {/* Văn bản được ký duyệt */}
                      {(selectedNode.taiLieuVanBan || selectedNode.ketQuaCuoiCung.vanBanDauRa) && (
                        <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 flex items-center gap-2 text-[10.5px]">
                          <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">description</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-slate-500 text-[9.5px] block">Văn bản ký duyệt:</span>
                            <span className="font-bold text-slate-800 truncate block">
                              {selectedNode.taiLieuVanBan?.tenVanBan || selectedNode.ketQuaCuoiCung.vanBanDauRa}
                            </span>
                            {selectedNode.taiLieuVanBan?.soKyHieu && (
                              <span className="text-[9.5px] font-mono text-slate-500">
                                Số: {selectedNode.taiLieuVanBan.soKyHieu} • {selectedNode.taiLieuVanBan.loaiVanBan}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Thời gian bắt đầu, hoàn thành & chuyển tiếp */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-500">schedule</span>
                    <span>2. Thời gian bắt đầu &amp; hoàn thành:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[9.5px] text-slate-500 block uppercase font-medium">Bắt đầu:</span>
                      <span className="font-bold text-slate-800 block mt-0.5">{selectedNode.thoiGianBatDau}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[9.5px] text-slate-500 block uppercase font-medium">
                        {selectedNode.status === 'completed' ? 'Hoàn thành:' : 'Dự kiến hoàn thành:'}
                      </span>
                      <span className="font-bold text-slate-800 block mt-0.5">{selectedNode.thoiGianHoanThanh}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ========================================================================= */}
              {/* B. TÀI LIỆU VÀ VĂN BẢN XỬ LÝ TRONG STEP                                   */}
              {/* ========================================================================= */}
              {selectedNode.taiLieuVanBan && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-black">B</span>
                      <span>TÀI LIỆU LIÊN QUAN</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {selectedNode.taiLieuVanBan.trangThaiText}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="material-symbols-outlined text-rose-500 text-xl shrink-0 mt-0.5">
                          picture_as_pdf
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">
                            {selectedNode.taiLieuVanBan.tenVanBan}
                          </h4>
                          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-1 flex-wrap">
                            <span className="font-mono font-semibold text-slate-700">
                              {selectedNode.taiLieuVanBan.soKyHieu || 'Chưa cấp số'}
                            </span>
                            <span>•</span>
                            <span>{selectedNode.taiLieuVanBan.loaiVanBan}</span>
                            <span>•</span>
                            <span className="font-semibold text-blue-700">{selectedNode.taiLieuVanBan.phienBan}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chi tiết người tạo & thời gian */}
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 border-t border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">Người tạo:</span>
                        <strong className="text-slate-800">{selectedNode.taiLieuVanBan.nguoiTao}</strong>
                        <span className="text-[10px] text-slate-500 block truncate">{selectedNode.taiLieuVanBan.chucVuNguoiTao}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Thời gian tạo:</span>
                        <strong className="text-slate-800">{selectedNode.taiLieuVanBan.thoiGianTao}</strong>
                      </div>
                    </div>


                    {/* Tệp đính kèm */}
                    {selectedNode.taiLieuVanBan.fileDinhKem && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-slate-400 text-[16px]">attachment</span>
                          <span className="font-medium text-slate-700 truncate">
                            {selectedNode.taiLieuVanBan.fileDinhKem.tenFile}
                          </span>
                          <span className="text-slate-400 text-[10px] shrink-0">
                            ({selectedNode.taiLieuVanBan.fileDinhKem.dungLuong})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast(`✓ Đang tải ${selectedNode.taiLieuVanBan?.fileDinhKem?.tenFile}`)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded cursor-pointer"
                          title="Tải tệp đính kèm"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                      </div>
                    )}

                    {/* Nút hành động xem văn bản */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsDocModalOpen(true)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Xem chi tiết văn bản</span>
                      </button>

                      {onViewDocument && (
                        <button
                          type="button"
                          onClick={handleViewDoc}
                          className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Xem tại tab Hồ sơ & Văn bản"
                        >
                          <span className="material-symbols-outlined text-[15px]">folder_open</span>
                          <span>Mở tab Hồ sơ</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* C. LỊCH SỬ TRÌNH KÝ & PHÊ DUYỆT CỦA STEP                                   */}
              {/* ========================================================================= */}
              {selectedNode.lichSuTrinhKy && selectedNode.lichSuTrinhKy.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-[11px] font-black">C</span>
                      <span>LỊCH SỬ TRÌNH KÝ &amp; PHÊ DUYỆT ({selectedNode.lichSuTrinhKy.length} lượt)</span>
                    </div>
                    {onOpenQuanLyTrinhKy && (
                      <button
                        type="button"
                        onClick={() => onOpenQuanLyTrinhKy(selectedNode.lichSuTrinhKy?.[0]?.id)}
                        className="text-blue-600 hover:text-blue-800 text-[10.5px] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Quản lý trình ký</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {selectedNode.lichSuTrinhKy.map((round) => (
                      <div key={round.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-[11.5px]">{round.tieuDeLuot}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${round.ketQuaStatus === 'phe_duyet'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                            {round.ketQuaCuoiCung}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-600">
                          <div>
                            <span className="text-slate-400 block">Người gửi trình:</span>
                            <strong className="text-slate-800">{round.nguoiTrinh.hoTen}</strong> ({round.nguoiTrinh.chucVu})
                          </div>
                          <div>
                            <span className="text-slate-400 block">Thời gian:</span>
                            <span>{round.thoiGianBatDau}</span>
                          </div>
                        </div>

                        {/* Danh sách người tham gia phê duyệt */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/80">
                          {round.danhSachNguoiThamGia.map((p) => (
                            <div key={p.id} className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${p.hanhDong === 'phe_duyet' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                  <strong className="text-slate-800">{p.hoTen}</strong>
                                  <span className="text-slate-400 text-[10px]">({p.chucVu})</span>
                                </div>
                                <span className={`text-[10px] font-semibold ${p.hanhDong === 'phe_duyet' ? 'text-emerald-700' : 'text-blue-700'}`}>
                                  {p.hanhDongText}
                                </span>
                              </div>
                              {p.yKien && (
                                <p className="text-slate-600 italic bg-slate-50 p-1.5 rounded text-[10.5px]">
                                  &ldquo;{p.yKien}&rdquo;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL XEM CHI TIẾT VĂN BẢN (CHẾ ĐỘ XEM TOÀN VĂN THEO THỂ THỨC HÀNH CHÍNH)   */}
      {/* ========================================================================= */}
      {isDocModalOpen && selectedNode.taiLieuVanBan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsDocModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Toolbar */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-rose-400 text-2xl">picture_as_pdf</span>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {selectedNode.taiLieuVanBan.tenVanBan}
                  </h4>
                  <div className="flex items-center gap-2 text-[10.5px] text-slate-300">
                    <span>{selectedNode.taiLieuVanBan.soKyHieu || 'Chưa cấp số'}</span>
                    <span>•</span>
                    <span>Phiên bản {selectedNode.taiLieuVanBan.phienBan}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{selectedNode.taiLieuVanBan.trangThaiText}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onViewDocument) {
                      handleViewDoc();
                      setIsDocModalOpen(false);
                    } else {
                      showToast('✓ Đã chuẩn bị bản in / xuất file');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Chuyển đến tab Hồ sơ & Văn bản"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  <span>Mở tab Văn bản</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Đóng modal"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body - Thể thức văn bản */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 font-serif text-slate-800 bg-slate-50/50">
              {/* Trang văn bản giấy trắng mô phỏng A4 */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-6">
                {/* Tiêu ngữ */}
                <div className="grid grid-cols-2 gap-4 text-center font-sans border-b border-slate-200 pb-5">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold uppercase text-slate-700">CƠ QUAN CẢNH SÁT ĐIỀU TRA</div>
                    <div className="text-[11px] font-bold uppercase text-blue-900">TỔ XÁC MINH &amp; XỬ LÝ ĐƠN</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {selectedNode.taiLieuVanBan.soKyHieu || 'Số: .../VB-TC'}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold uppercase text-slate-900 tracking-tight">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 underline decoration-slate-400">
                      Độc lập - Tự do - Hạnh phúc
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-1">
                      Hà Nội, ngày 13 tháng 03 năm 2026
                    </div>
                  </div>
                </div>

                {/* Tiêu đề văn bản */}
                <div className="text-center space-y-1 font-sans">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {selectedNode.taiLieuVanBan.tenVanBan}
                  </h3>
                  <p className="text-xs text-slate-600 italic">
                    V/v: {selectedNode.ketQuaCuoiCung.tieuDe}
                  </p>
                </div>

                {/* Căn cứ pháp lý */}
                <div className="text-xs space-y-1 text-slate-700 font-sans italic border-l-2 border-blue-500 pl-3">
                  <div>- Căn cứ Luật Tố cáo số 25/2018/QH14 ngày 12 tháng 6 năm 2018;</div>
                  <div>- Căn cứ Thông tư số 05/2021/TT-TTCP quy định quy trình xử lý đơn khiếu nại, tố cáo;</div>
                  <div>- Xét hồ sơ vụ việc Đ-2026-00125 tại ngõ 128 Đội Cấn.</div>
                </div>

                {/* Toàn văn nội dung */}
                <div className="text-xs leading-relaxed text-slate-800 space-y-3 whitespace-pre-line font-sans">
                  {selectedNode.taiLieuVanBan.noiDungChiTiet}
                </div>

                {/* Khối chữ ký số điện tử & Xác thực */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs">
                  <div className="text-[10.5px] text-slate-500 space-y-1">
                    <div className="font-bold text-slate-700">Nơi nhận:</div>
                    <div>- Thủ trưởng cơ quan (để báo cáo);</div>
                    <div>- Người tố cáo (để thông báo);</div>
                    <div>- Lưu: Hồ sơ đơn thư Đ-2026-00125.</div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="font-bold uppercase text-slate-800 text-[11px]">
                      {selectedNode.nguoiHanhDong.lanhDaoKyDuyet ? 'LÃNH ĐẠO CÓ THẨM QUYỀN' : 'CÁN BỘ CHUYÊN MÔN'}
                    </div>
                    <div className="p-3 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50/50 space-y-1 inline-block text-left w-full">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                        <span>CHỮ KÝ SỐ CA HỢP LỆ</span>
                      </div>
                      <div className="text-[10px] text-slate-700">
                        Người ký: <strong>{selectedNode.nguoiHanhDong.lanhDaoKyDuyet ? selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen : selectedNode.nguoiHanhDong.canBoThucHien.hoTen}</strong>
                      </div>
                      <div className="text-[9.5px] text-slate-500">
                        Thời gian: 13/03/2026 • Ban Cơ yếu Chính phủ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Tệp đính kèm: <strong>{selectedNode.taiLieuVanBan.fileDinhKem?.tenFile || 'van_ban_goc.pdf'}</strong> ({selectedNode.taiLieuVanBan.fileDinhKem?.dungLuong || '2.4 MB'})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('✓ Đang tải file PDF xuống máy tính')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>Tải file</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
