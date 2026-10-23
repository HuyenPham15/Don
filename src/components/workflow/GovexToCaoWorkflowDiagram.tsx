import React, { useState } from 'react';
import GovexStepDetailPanel from './GovexStepDetailPanel';
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
            {/* Biểu tượng tâm điểm / crosshair ở góc trên bên trái */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Định vị trung tâm / Khôi phục góc nhìn"
              >
                <span className="material-symbols-outlined text-[17px]">filter_center_focus</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* BẢNG LÀN BƠI CHÍNH – QUY TRÌNH XỬ LÝ ĐƠN CHUẨN THEO HÌNH ẢNH             */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Header các cột / Giai đoạn */}
              <div className="flex border-b border-slate-200 bg-white text-slate-800 text-[11px] font-semibold select-none">
                {/* Cột 0: Nhóm trách nhiệm */}
                <div className="w-[140px] shrink-0 p-2.5 border-r border-slate-200 flex items-center text-slate-600 font-medium">
                  Nhóm trách nhiệm
                </div>

                {/* Cột 1: 1 Phân loại và kiểm tra ban đầu */}
                <div className="w-[430px] shrink-0 p-2.5 border-r border-slate-200 flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-600 inline-flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  <span>Phân loại và kiểm tra ban đầu</span>
                </div>

                {/* Cột 2: 2 Văn bản theo hướng xử lý */}
                <div className="flex-1 min-w-[430px] p-2.5 flex items-center gap-1.5 font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-600 inline-flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  <span>Văn bản theo hướng xử lý</span>
                </div>
              </div>

              {/* Thân bảng: Cột Tác nhân bên trái + Canvas có lưới chấm & đường kết nối bên phải */}
              <div className="flex min-h-[530px] bg-white relative">
                {/* Cột Tác nhân bên trái: Chuyên môn / Hàng 1 */}
                <div className="w-[140px] shrink-0 border-r border-slate-200 bg-white p-3 flex flex-col justify-between select-none">
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 inline-block"></span>
                      <span>Chuyên môn</span>
                    </div>
                    <div className="text-[10.5px] text-slate-400 mt-0.5 pl-3.5">
                      6 bước - 2 vai trò
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    Hàng 1
                  </div>
                </div>

                {/* Canvas sơ đồ với nền lưới chấm (Dot Grid) */}
                <div
                  className="flex-1 relative overflow-hidden"
                  style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.25px, transparent 1.25px)',
                    backgroundSize: '24px 24px',
                    backgroundColor: '#ffffff',
                    minWidth: '860px',
                    height: '530px',
                  }}
                >
                  {/* Đường phân chia dọc giữa Cột 1 và Cột 2 */}
                  <div className="absolute top-0 bottom-0 left-[430px] w-px bg-slate-200 pointer-events-none" />

                  {/* SVG Canvas chứa các đường cong kết nối (Bézier Curves) */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-0"
                    style={{ overflow: 'visible' }}
                  >
                    <defs>
                      <marker
                        id="wf-arrow-head"
                        viewBox="0 0 10 10"
                        refX="7"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 2 L 7 5 L 0 8 z" fill="#2b5282" />
                      </marker>
                    </defs>

                    {/* Đường 1: Tiếp nhận đơn (right: 198, 62) -> Tạo báo cáo đề xuất (left: 176, 280) */}
                    <path
                      d="M 198 62 C 235 62, 135 280, 174 280"
                      fill="none"
                      stroke="#2b5282"
                      strokeWidth="1.75"
                      markerEnd="url(#wf-arrow-head)"
                    />

                    {/* Đường 2: Tạo báo cáo đề xuất (right: 356, 280) -> Chuyển xử lý (left: 490, 62) */}
                    <path
                      d="M 356 280 C 425 280, 420 62, 488 62"
                      fill="none"
                      stroke="#2b5282"
                      strokeWidth="1.75"
                      markerEnd="url(#wf-arrow-head)"
                    />

                    {/* Đường 3: Tạo báo cáo đề xuất (right: 356, 280) -> Trả lại đơn (left: 490, 192) */}
                    <path
                      d="M 356 280 C 425 280, 420 192, 488 192"
                      fill="none"
                      stroke="#2b5282"
                      strokeWidth="1.75"
                      markerEnd="url(#wf-arrow-head)"
                    />

                    {/* Đường 4: Tạo báo cáo đề xuất (right: 356, 280) -> Xử lý đơn (left: 490, 322) */}
                    <path
                      d="M 356 280 C 425 280, 420 322, 488 322"
                      fill="none"
                      stroke="#2b5282"
                      strokeWidth="1.75"
                      markerEnd="url(#wf-arrow-head)"
                    />

                    {/* Đường 5: Tạo báo cáo đề xuất (right: 356, 280) -> Không xử lý (left: 490, 452) */}
                    <path
                      d="M 356 280 C 425 280, 420 452, 488 452"
                      fill="none"
                      stroke="#2b5282"
                      strokeWidth="1.75"
                      markerEnd="url(#wf-arrow-head)"
                    />
                  </svg>

                  {/* ========================================================================= */}
                  {/* CÁC THẺ BƯỚC QUY TRÌNH (HTML CARDS TRÊN CANVAS)                           */}
                  {/* ========================================================================= */}

                  {/* 1. NODE 1: TIẾP NHẬN ĐƠN (Cột 1 - Hàng trên) */}
                  <div
                    onClick={() => handleSelectNode('tn-1', '● Đã chọn: Bước 1. Tiếp nhận đơn')}
                    style={{ left: '26px', top: '24px', width: '172px', height: '76px' }}
                    className={`absolute z-10 p-2.5 rounded-xl border bg-white flex flex-col justify-between transition-all cursor-pointer ${selectedNodeId === 'tn-1'
                      ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-50/20 shadow-sm scale-[1.02]'
                      : 'border-slate-300 hover:border-blue-400 hover:shadow-xs shadow-2xs'
                      }`}
                  >
                    <div>
                      <span className="inline-block text-[9.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded w-fit">
                        BẮT ĐẦU
                      </span>
                      <div className="font-bold text-[12px] text-slate-900 mt-1 leading-tight">
                        Tiếp nhận đơn
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Không hạn</span>
                    </div>
                  </div>

                  {/* 2. NODE 2: TẠO BÁO CÁO ĐỀ XUẤT (Cột 1 - Hàng dưới) */}
                  <div
                    onClick={() => handleSelectNode('tn-2', '● Đã chọn: Bước 2. Tạo báo cáo đề xuất')}
                    style={{ left: '176px', top: '240px', width: '180px', height: '80px' }}
                    className={`absolute z-10 p-2.5 rounded-xl border bg-white flex flex-col justify-between transition-all cursor-pointer ${selectedNodeId === 'tn-2'
                      ? 'ring-2 ring-blue-600 border-blue-500 bg-blue-50/20 shadow-sm scale-[1.02]'
                      : 'border-slate-300 hover:border-blue-400 hover:shadow-xs shadow-2xs'
                      }`}
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        BUOC_2 Bước 2
                      </span>
                      <div className="font-bold text-[12px] text-slate-900 mt-0.5 leading-tight">
                        Tạo báo cáo đề xuất
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>4 giờ</span>
                      <span>1 BM</span>
                    </div>
                  </div>

                  {/* 3. NODE 3: CHUYỂN XỬ LÝ (Cột 2 - Vị trí 1) */}
                  <div
                    onClick={() => handleSelectNode('tn-kt-ban-giao', '● Đã chọn: Chuyển xử lý')}
                    style={{ left: '490px', top: '24px', width: '172px', height: '76px' }}
                    className={`absolute z-10 p-2.5 rounded-xl border bg-white flex flex-col justify-between transition-all cursor-pointer ${selectedNodeId === 'tn-kt-ban-giao'
                      ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/20 shadow-sm scale-[1.02]'
                      : 'border-slate-300 hover:border-emerald-400 hover:shadow-xs shadow-2xs'
                      }`}
                  >
                    <div>
                      <span className="inline-block text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit">
                        KẾT THÚC
                      </span>
                      <div className="font-bold text-[12px] text-slate-900 mt-1 leading-tight">
                        Chuyển xử lý
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Không hạn</span>
                      <span>1 BM</span>
                    </div>
                  </div>

                  {/* 4. NODE 4: TRẢ LẠI ĐƠN (Cột 2 - Vị trí 2) */}
                  <div
                    onClick={() => handleSelectNode('tn-kt-tra-lai', '● Đã chọn: Trả lại đơn')}
                    style={{ left: '490px', top: '154px', width: '172px', height: '76px' }}
                    className={`absolute z-10 p-2.5 rounded-xl border bg-white flex flex-col justify-between transition-all cursor-pointer ${selectedNodeId === 'tn-kt-tra-lai'
                      ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/20 shadow-sm scale-[1.02]'
                      : 'border-slate-300 hover:border-emerald-400 hover:shadow-xs shadow-2xs'
                      }`}
                  >
                    <div>
                      <span className="inline-block text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit">
                        KẾT THÚC
                      </span>
                      <div className="font-bold text-[12px] text-slate-900 mt-1 leading-tight">
                        Trả lại đơn
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Không hạn</span>
                      <span>1 BM</span>
                    </div>
                  </div>

                  {/* 5. NODE 5: XỬ LÝ ĐƠN (Cột 2 - Vị trí 3) */}
                  <div
                    onClick={() => handleSelectNode('tl-5', '● Đã chọn: Xử lý đơn')}
                    style={{ left: '490px', top: '284px', width: '172px', height: '76px' }}
                    className={`absolute z-10 p-2.5 rounded-xl border bg-white flex flex-col justify-between transition-all cursor-pointer ${selectedNodeId === 'tl-5'
                      ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/20 shadow-sm scale-[1.02]'
                      : 'border-slate-300 hover:border-emerald-400 hover:shadow-xs shadow-2xs'
                      }`}
                  >
                    <div>
                      <span className="inline-block text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit">
                        KẾT THÚC
                      </span>
                      <div className="font-bold text-[12px] text-slate-900 mt-1 leading-tight">
                        Xử lý đơn
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Không hạn</span>
                      <span>1 BM</span>
                    </div>
                  </div>

                  {/* 6. NODE 6: KHÔNG XỬ LÝ (Cột 2 - Vị trí 4) */}
                  <div
                    onClick={() => handleSelectNode('tn-kt-khong-thu-ly', '● Đã chọn: Không xử lý')}
                    style={{ left: '490px', top: '414px', width: '172px', height: '76px' }}
                    className={`absolute z-10 p-2.5 rounded-xl border bg-white flex flex-col justify-between transition-all cursor-pointer ${selectedNodeId === 'tn-kt-khong-thu-ly'
                      ? 'ring-2 ring-emerald-600 border-emerald-500 bg-emerald-50/20 shadow-sm scale-[1.02]'
                      : 'border-slate-300 hover:border-emerald-400 hover:shadow-xs shadow-2xs'
                      }`}
                  >
                    <div>
                      <span className="inline-block text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded w-fit">
                        KẾT THÚC
                      </span>
                      <div className="font-bold text-[12px] text-slate-900 mt-1 leading-tight">
                        Không xử lý
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Không hạn</span>
                      <span>1 BM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chú giải ở chân bảng quy trình (Legend) */}
              <div className="flex items-center gap-6 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-600 bg-white select-none">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-[2px] bg-[#2b5282] inline-block"></span>
                  <span>Chuyển tiếp bình thường</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-[2px] border-b-2 border-dashed border-slate-400 inline-block"></span>
                  <span>Quay lại / trả hồ sơ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  <span>Nhóm trách nhiệm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isRightPanelOpen && (
          <aside className="absolute top-0 right-0 bottom-0 w-[420px] xl:w-[460px] border-l border-slate-200 bg-white shadow-xl z-30 flex flex-col overflow-hidden animate-drawer-slide-in">
            {/* 1. HEADER BẢNG THÔNG TIN: TINH GỌN, KHÔNG LẠM DỤNG ICON & CARD */}
            <div className="p-3.5 bg-white text-slate-800 shrink-0 border-b border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      LỊCH SỬ XỬ LÝ BƯỚC
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {donCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-[13px] mt-1 leading-snug">
                    {selectedNode.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={donTitle}>
                    Đơn: {donTitle}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRightPanelOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Đóng bảng chi tiết"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* 2. BODY CONTENT: PHẲNG, TINH GỌN, TẬP TRUNG VÀO LỊCH XỬ LÝ CỦA ĐƠN */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white text-slate-800 text-xs">

              {/* A. TIẾN ĐỘ & PHÂN CÔNG TẠI BƯỚC (DẠNG DANH SÁCH BẢNG PHẲNG) */}
              <div className="border-b border-slate-100 pb-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Trạng thái bước:</span>
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${selectedNode.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : selectedNode.status === 'active'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                    }`}>
                    {selectedNode.trangThaiText}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Thời gian bắt đầu:</span>
                    <span className="font-medium text-slate-800">{selectedNode.thoiGianBatDau}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {selectedNode.status === 'completed' ? 'Thời gian hoàn thành:' : 'Dự kiến hoàn thành:'}
                    </span>
                    <span className="font-medium text-slate-800">{selectedNode.thoiGianHoanThanh}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1.5 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <span className="text-slate-400 shrink-0 text-[10.5px]">Cán bộ thực hiện:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedNode.nguoiHanhDong.canBoThucHien.hoTen} ({selectedNode.nguoiHanhDong.canBoThucHien.chucVu})
                    </span>
                  </div>
                  {selectedNode.nguoiHanhDong.lanhDaoKyDuyet && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-slate-400 shrink-0 text-[10.5px]">Lãnh đạo phê duyệt:</span>
                      <span className="text-slate-800 font-medium">
                        {selectedNode.nguoiHanhDong.lanhDaoKyDuyet.hoTen} ({selectedNode.nguoiHanhDong.lanhDaoKyDuyet.chucVu})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* B. LỊCH SỬ XỬ LÝ CỦA ĐƠN NÀY TẠI BƯỚC NÀY (TIMELINE CHÍNH THỨC) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    LỊCH SỬ XỬ LÝ TẠI BƯỚC NÀY
                  </h4>
                  {selectedNode.lichSuTrinhKy && selectedNode.lichSuTrinhKy.length > 0 && onOpenQuanLyTrinhKy && (
                    <button
                      type="button"
                      onClick={() => onOpenQuanLyTrinhKy(selectedNode.lichSuTrinhKy?.[0]?.id)}
                      className="text-blue-600 hover:text-blue-800 text-[10.5px] font-semibold hover:underline cursor-pointer"
                    >
                      Quản lý trình ký →
                    </button>
                  )}
                </div>

                {/* Dòng thời gian các sự kiện xử lý thực tế */}
                <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                  {/* Mốc 1: Tiếp nhận vào bước */}
                  <div className="relative group">
                    <span className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {selectedNode.thoiGianBatDau}
                    </div>
                    <div className="font-semibold text-slate-800 text-[11.5px] mt-0.5">
                      Tiếp nhận hồ sơ vụ việc
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Cán bộ <strong className="text-slate-700">{selectedNode.nguoiHanhDong.canBoThucHien.hoTen}</strong> tiếp nhận xử lý hồ sơ đơn <strong className="font-mono text-slate-700">{donCode}</strong> theo quy trình chuyên môn.
                    </div>
                  </div>

                  {/* Các mốc trình ký & chỉ đạo nghiệp vụ nếu có */}
                  {selectedNode.lichSuTrinhKy && selectedNode.lichSuTrinhKy.length > 0 ? (
                    selectedNode.lichSuTrinhKy.map((round) => (
                      <div key={round.id} className="space-y-3">
                        {/* Header của lượt trình */}
                        <div className="relative">
                          <span className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {round.thoiGianBatDau}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-purple-900 text-[11.5px]">
                              {round.tieuDeLuot}
                            </span>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${round.ketQuaStatus === 'phe_duyet'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                              }`}>
                              {round.ketQuaStatus === 'phe_duyet' ? 'Đã duyệt' : 'Yêu cầu sửa'}
                            </span>
                          </div>
                        </div>

                        {/* Chi tiết từng người tham gia trong lượt */}
                        {round.danhSachNguoiThamGia.map((p) => (
                          <div key={p.id} className="relative pl-2.5">
                            <span className={`absolute -left-[12px] top-1.5 w-1.5 h-1.5 rounded-full ${p.hanhDong === 'phe_duyet'
                              ? 'bg-emerald-500'
                              : p.hanhDong === 'yeu_cau_chinh_sua'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                              }`}></span>
                            <div className="text-[10px] text-slate-400">
                              {p.thoiGian} • {p.hanhDongText}
                            </div>
                            <div className="font-medium text-slate-800 text-[11px] mt-0.5">
                              {p.hoTen} <span className="text-slate-400 font-normal">({p.chucVu})</span>
                            </div>
                            {p.yKien && (
                              <div className="text-[10.5px] text-slate-600 mt-1 pl-2 border-l-2 border-slate-200 italic leading-snug">
                                &ldquo;{p.yKien}&rdquo;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    /* Nếu không có lịch trình ký: Hiển thị nhật ký thực hiện tác vụ nghiệp vụ */
                    <div className="relative">
                      <span className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-slate-500 ring-2 ring-white"></span>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {selectedNode.thoiGianBatDau}
                      </div>
                      <div className="font-semibold text-slate-800 text-[11.5px] mt-0.5">
                        Thực hiện tác vụ chuyên môn
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {selectedNode.noiDungCongViec}
                      </div>
                    </div>
                  )}

                  {/* Mốc cuối: Kết quả hoặc Hoàn tất bước */}
                  <div className="relative">
                    <span className={`absolute -left-[14px] top-1.5 w-2 h-2 rounded-full ${selectedNode.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
                      } ring-2 ring-white`}></span>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {selectedNode.thoiGianHoanThanh}
                    </div>
                    <div className="font-semibold text-slate-800 text-[11.5px] mt-0.5">
                      {selectedNode.status === 'completed' ? 'Hoàn thành bước xử lý' : 'Kết quả xử lý hiện tại'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {selectedNode.ketQuaCuoiCung.tieuDe}
                    </div>
                    {selectedNode.thoiDiemChuyenTiep && (
                      <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
                        → {selectedNode.thoiDiemChuyenTiep}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* C. DANH SÁCH VĂN BẢN / TÀI LIỆU TẠI BƯỚC NÀY (DẠNG LIST TINH GỌN) */}
              {/* C. DANH SÁCH VĂN BẢN / TÀI LIỆU TẠI BƯỚC NÀY (DẠNG LIST TINH GỌN, 2 ICON XEM & TẢI) */}
              {(selectedNode.taiLieuVanBan || selectedNode.ketQuaCuoiCung.vanBanDauRa) && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      DANH SÁCH VĂN BẢN TẠI BƯỚC
                    </span>
                    <span className="text-[10.5px] text-slate-400">
                      {selectedNode.taiLieuVanBan && selectedNode.ketQuaCuoiCung.vanBanDauRa && selectedNode.ketQuaCuoiCung.vanBanDauRa !== selectedNode.taiLieuVanBan?.tenVanBan && !selectedNode.ketQuaCuoiCung.vanBanDauRa.includes(selectedNode.taiLieuVanBan?.soKyHieu || '___')
                        ? '2 văn bản'
                        : selectedNode.taiLieuVanBan || selectedNode.ketQuaCuoiCung.vanBanDauRa
                        ? '1 văn bản'
                        : ''}
                    </span>
                  </div>

                  <ul className="divide-y divide-slate-100 overflow-hidden bg-white rounded-lg border border-slate-100">
                    {selectedNode.taiLieuVanBan && (
                      <li className="py-2.5 px-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-rose-500 text-[18px] shrink-0 mt-0.5">
                            picture_as_pdf
                          </span>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (onViewDocument) {
                                  handleViewDoc();
                                } else {
                                  setIsDocModalOpen(true);
                                }
                              }}
                              className="font-medium text-slate-900 hover:text-blue-700 text-[12px] text-left leading-snug truncate block transition-colors cursor-pointer max-w-full"
                              title="Nhấn để xem toàn văn văn bản"
                            >
                              {selectedNode.taiLieuVanBan.tenVanBan}
                            </button>
                            <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                              <span>Số: {selectedNode.taiLieuVanBan.soKyHieu || 'Chưa cấp số'}</span>
                              <span>•</span>
                              <span>{selectedNode.taiLieuVanBan.fileDinhKem?.dungLuong || '2.4 MB'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 2 icon: Mở xem hồ sơ & Tải về */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewDocument) {
                                handleViewDoc();
                              } else {
                                setIsDocModalOpen(true);
                              }
                            }}
                            className="w-7 h-7 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Mở xem hồ sơ"
                          >
                            <span className="material-symbols-outlined text-[17px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const fileName = selectedNode.taiLieuVanBan?.fileDinhKem?.tenFile || `${selectedNode.taiLieuVanBan?.tenVanBan || 'van_ban'}.pdf`;
                              showToast(`✓ Đang tải ${fileName}`);
                            }}
                            className="w-7 h-7 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Tải về"
                          >
                            <span className="material-symbols-outlined text-[17px]">download</span>
                          </button>
                        </div>
                      </li>
                    )}

                    {/* Văn bản kết quả xử lý nếu có tên riêng biệt */}
                    {selectedNode.ketQuaCuoiCung.vanBanDauRa &&
                      selectedNode.ketQuaCuoiCung.vanBanDauRa !== selectedNode.taiLieuVanBan?.tenVanBan &&
                      !selectedNode.ketQuaCuoiCung.vanBanDauRa.includes(selectedNode.taiLieuVanBan?.soKyHieu || '___') && (
                        <li className="py-2.5 px-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1 flex items-start gap-2.5">
                            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
                              description
                            </span>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onViewDocument) {
                                    onViewDocument({
                                      tenVanBan: selectedNode.ketQuaCuoiCung.vanBanDauRa,
                                      soHieu: '01/KQ-TC',
                                      loai: 'quyet_dinh',
                                      trichYeu: selectedNode.ketQuaCuoiCung.tieuDe || selectedNode.ketQuaCuoiCung.vanBanDauRa,
                                      noiDungChiTiet: `${selectedNode.ketQuaCuoiCung.tieuDe}\n\n${selectedNode.ketQuaCuoiCung.chiTietKetQua}\n\nCăn cứ pháp lý: ${selectedNode.legalBasis}\nThời hạn: ${selectedNode.ketQuaCuoiCung.thoiHanThucHien}`,
                                    });
                                  } else {
                                    showToast(`✓ Mở hồ sơ: ${selectedNode.ketQuaCuoiCung.vanBanDauRa}`);
                                  }
                                }}
                                className="font-medium text-slate-900 hover:text-blue-700 text-[12px] text-left leading-snug truncate block transition-colors cursor-pointer max-w-full"
                                title="Nhấn để xem văn bản kết quả"
                              >
                                {selectedNode.ketQuaCuoiCung.vanBanDauRa}
                              </button>
                              <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                                <span>Văn bản kết quả xử lý</span>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">Kết quả</span>
                              </div>
                            </div>
                          </div>

                          {/* 2 icon: Mở xem hồ sơ & Tải về */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (onViewDocument) {
                                  onViewDocument({
                                    tenVanBan: selectedNode.ketQuaCuoiCung.vanBanDauRa,
                                    soHieu: '01/KQ-TC',
                                    loai: 'quyet_dinh',
                                    trichYeu: selectedNode.ketQuaCuoiCung.tieuDe || selectedNode.ketQuaCuoiCung.vanBanDauRa,
                                    noiDungChiTiet: `${selectedNode.ketQuaCuoiCung.tieuDe}\n\n${selectedNode.ketQuaCuoiCung.chiTietKetQua}\n\nCăn cứ pháp lý: ${selectedNode.legalBasis}\nThời hạn: ${selectedNode.ketQuaCuoiCung.thoiHanThucHien}`,
                                  });
                                } else {
                                  showToast(`✓ Mở hồ sơ: ${selectedNode.ketQuaCuoiCung.vanBanDauRa}`);
                                }
                              }}
                              className="w-7 h-7 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="Mở xem hồ sơ"
                            >
                              <span className="material-symbols-outlined text-[17px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`✓ Đang tải ${selectedNode.ketQuaCuoiCung.vanBanDauRa}.pdf`)}
                              className="w-7 h-7 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="Tải về"
                            >
                              <span className="material-symbols-outlined text-[17px]">download</span>
                            </button>
                          </div>
                        </li>
                      )}
                  </ul>
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
