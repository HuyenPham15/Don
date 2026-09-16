import React, { useState, useEffect } from 'react';
import { LuotNhan, Screen } from '../types';
import KhoiTaoQuyTrinhModal from '../components/workflow/KhoiTaoQuyTrinhModal';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import { WorkflowDefinition, ActiveWorkflowState } from '../types/workflow';

interface BanPhanTichProps {
  luotNhan: LuotNhan;
  onNav: (s: Screen) => void;
  onAcceptAndProcess?: (don: any, wfState?: ActiveWorkflowState) => void;
}

export default function BanPhanTich({ luotNhan, onNav, onAcceptAndProcess }: BanPhanTichProps) {
  // ─── 1. TRẠNG THÁI AI: "reading" (Đang đọc) vs "done" (Đã đọc xong) ───────
  const [aiState, setAiState] = useState<'reading' | 'done'>('done');
  const [readingProgress, setReadingProgress] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState(false);


  // PDF Viewer Controls
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedFileId, setSelectedFileId] = useState<'f1' | 'f2'>('f1');
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);

  // Officer inputs
  const [officerNote, setOfficerNote] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showKhoiTaoModal, setShowKhoiTaoModal] = useState<boolean>(false);
  const [showTraLaiModal, setShowTraLaiModal] = useState<boolean>(false);
  const [showBanGiaoModal, setShowBanGiaoModal] = useState<boolean>(false);
  const [traLaiReason, setTraLaiReason] = useState<string>('Không thuộc thẩm quyền giải quyết');
  const [showCanCuModal, setShowCanCuModal] = useState<boolean>(false);

  // Chỉnh sửa trực tiếp dạng text cho Khối 2: Thông tin trích xuất từ đơn
  const [isEditingExtract, setIsEditingExtract] = useState<boolean>(false);
  const [extractData, setExtractData] = useState({
    nguoiGui: 'Nguyễn Văn A',
    namSinh: '1988',
    cccd: '001088019482',
    sdt: '0912 345 678',
    diaChi: 'Số 12, ngõ 45, Cầu Giấy, Hà Nội',
    dongNguoiGui: 'Trần Thị C (Đồng đứng đơn)',
    cccdDongNguoiGui: '001190028391',
    luatSu: 'LS. Lê Quang Đ (Đại diện theo ủy quyền)',
    theLuatSu: 'LS-0928/ĐLS-HN',
    loaiNoiDung: 'Tố giác tội phạm',
    dauHieu: 'Lừa đảo chiếm đoạt tài sản',
    congTyBiToGiac: 'Công ty Cổ phần Đầu tư & Phát triển Đô thị X',
    mstCongTy: '0108293847',
    doiTuong: 'Ông Trần Văn B',
    chucVu: 'Chủ tịch HĐQT kiêm TGĐ',
    donVi: 'Công ty Cổ phần Đầu tư & Phát triển Đô thị X',
    nguoiLienQuan: 'Bà Vũ Mai H (Kế toán trưởng kiêm Thủ quỹ)',
    cccdNguoiLienQuan: '001183002910',
    thoiGian: 'Khoảng năm 2024 – 2025',
    duAn: 'Dự án Khu đô thị Y',
    diaDiem: 'Quận Hà Đông, Hà Nội',
    yeuCau1: 'Xác minh, điều tra làm rõ hành vi chiếm đoạt 3,5 tỷ VNĐ.',
    yeuCau2: 'Bảo vệ quyền và lợi ích hợp pháp của các bị hại.',
    yeuCau3: 'Áp dụng biện pháp phong tỏa tài khoản và thông báo kết quả giải quyết.',
  });
  const [savedExtractData, setSavedExtractData] = useState(extractData);

  // ─── TRẠNG THÁI AI NGẦM CHUẨN BỊ THEO QUY TRÌNH (BACKGROUND PRE-PROCESSING) ─
  const [isPreProcessing, setIsPreProcessing] = useState<boolean>(false);
  const [preProcessNotice, setPreProcessNotice] = useState<string>('');

  // Ngay khi xác định hoặc thay đổi loại đơn, ngầm cho AI chạy xử lý theo quy trình đó
  useEffect(() => {
    setIsPreProcessing(true);
    const targetWf = matchWorkflowByLoaiDon(extractData.loaiNoiDung);
    const timer = setTimeout(() => {
      setIsPreProcessing(false);
      setPreProcessNotice(`AI đã ngầm chuẩn bị sẵn ${targetWf.totalSteps} bước tác nghiệp, ${targetWf.defaultTasks.length} nhiệm vụ và ${targetWf.potentialMissingInfo.length} điểm lưu ý theo "${targetWf.name}"`);
    }, 400);
    return () => clearTimeout(timer);
  }, [extractData.loaiNoiDung]);

  const handleSaveExtract = () => {
    setSavedExtractData({ ...extractData });
    setIsEditingExtract(false);
    showToast('✓ Đã lưu thay đổi thông tin trích xuất của AI thành công!');
  };

  const handleCancelExtract = () => {
    setExtractData({ ...savedExtractData });
    setIsEditingExtract(false);
  };

  const updateExtractField = (key: keyof typeof extractData, val: string) => {
    setExtractData((prev) => ({ ...prev, [key]: val }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleConfirmWorkflowFromModal = (wf: WorkflowDefinition) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const donCode = 'Đ-2026-00125';
    const donTitle = `Tố giác vi phạm lừa đảo chiếm đoạt tài sản (${extractData.duAn || 'Dự án Khu đô thị Y'})`;

    const activeWfState: ActiveWorkflowState = {
      donCode: donCode,
      donTitle: donTitle,
      luotNhanId: luotNhan.id || 'LN-2025-0819',
      nguoiNop: extractData.nguoiGui || 'Nguyễn Văn A',
      loaiDonConfirmed: extractData.loaiNoiDung || 'Đơn tố giác về tội phạm',
      workflow: wf,
      activeStepId: wf.steps[1]?.id || wf.steps[0].id,
      tasks: wf.defaultTasks,
      missingInfoList: wf.potentialMissingInfo,
      status: 'dang_xu_ly',
      startedAt: timeStr,
      assignedOfficer: 'Nguyễn Minh Anh',
      historyLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          actor: 'Nguyễn Minh Anh (Cán bộ tiếp nhận)',
          action: 'Tiếp nhận hồ sơ & Khởi tạo quy trình xử lý đơn',
          newValue: `${extractData.loaiNoiDung} (${wf.name})`,
          reason: 'Cán bộ kiểm tra hồ sơ và xác nhận quy trình xử lý theo thẩm quyền',
        }
      ],
    };

    setShowKhoiTaoModal(false);
    showToast(`✓ Đã tiếp nhận và khởi tạo quy trình "${wf.name}" thành công!`);

    onAcceptAndProcess?.(
      {
        id: donCode,
        code: donCode,
        title: donTitle,
        luotNhanId: luotNhan.id || 'LN-2025-0819',
        nguoiNop: extractData.nguoiGui || 'Nguyễn Văn A',
        ngayNhan: luotNhan.ngayNhan || '16/09/2026 09:15',
        loaiDon: extractData.loaiNoiDung,
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: 'Đang xử lý',
        isNew: true,
      },
      activeWfState
    );
  };

  // Mô phỏng AI đang quét đọc tài liệu
  useEffect(() => {
    if (!isSimulating || aiState === 'done') return;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setAiState('done');
          setIsSimulating(false);
          showToast('✓ AI đã đọc xong toàn bộ văn bản và bóc tách thông tin hoàn tất!');
          return 100;
        }
        return prev + 15;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, aiState]);

  const handleStartSimulation = () => {
    setAiState('reading');
    setReadingProgress(20);
    setIsSimulating(true);
    showToast('Bắt đầu mô phỏng: AI đang quét OCR và đọc bóc tách văn bản đơn tố giác...');
  };

  const handleCopySummary = () => {
    navigator.clipboard?.writeText(
      'Nguyễn Văn A tố giác ông Trần Văn B – Giám đốc Công ty Cổ phần X có hành vi lừa đảo chiếm đoạt tài sản thông qua việc huy động vốn tại Dự án Khu đô thị Y (Hà Nội) trong giai đoạn 2024 – 2025. Người gửi đề nghị cơ quan điều tra xác minh, điều tra, bảo vệ quyền lợi và thông báo kết quả.'
    );
    showToast('Đã sao chép nội dung tóm tắt của AI vào khay nhớ tạm.');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] text-[#1e293b] font-body-md overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. BỘ CHUYỂN ĐỔI DEMO 2 TRẠNG THÁI (STATE SWITCHER BAR)                   */}
      {/* ========================================================================= */}
      <div className="bg-[#1e293b] text-white px-5 py-2 border-b border-slate-700 flex items-center justify-between text-xs shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">tune</span>
          <span className="font-semibold text-slate-300">Chế độ hiển thị:</span>
          <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-600">
            <button
              type="button"
              onClick={() => {
                setAiState('reading');
                setReadingProgress(55);
                setIsSimulating(false);
                showToast('Chuyển sang: Trạng thái 1 - AI đang đọc thông tin.');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'reading'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>1. AI đang đọc thông tin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAiState('done');
                setReadingProgress(100);
                setIsSimulating(false);
                showToast('Chuyển sang: Trạng thái 2 - AI đã đọc xong thông tin (Khớp 100% ảnh mẫu).');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${aiState === 'done'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>2. AI đã đọc xong (Ảnh mẫu)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[15px]">play_arrow</span>
            <span>{isSimulating ? `Đang quét OCR (${readingProgress}%)...` : 'Phát lại quá trình AI quét đọc'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-HEADER BREADCRUMB & METADATA                                       */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex flex-col gap-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="hover:text-blue-600 hover:underline cursor-pointer"
            >
              Tiếp nhận đơn
            </button>
            <span>&gt;</span>
            <span className="text-slate-700 font-medium">Phân tích đơn</span>
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-slate-900 font-headline-md tracking-tight">
              Đơn số: D-2026-00125
            </h1>

            {aiState === 'reading' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[11.5px] font-semibold font-label-technical animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin text-amber-600">
                  sync
                </span>
                <span>Đang phân tích ({readingProgress}%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11.5px] font-semibold font-label-technical">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Đang phân tích</span>
              </span>
            )}
          </div>

          {/* Meta Attributes */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5 font-normal">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
              <span>Ngày nhận:</span>
              <strong className="text-slate-700 font-label-technical">15/09/2026 10:24</strong>
            </div>
            <span>•</span>
            <div>
              <span>Hình thức:</span> <strong className="text-slate-700">Trực tiếp</strong>
            </div>
            <span>•</span>
            <div>
              <span>Số trang:</span> <strong className="text-slate-700 font-label-technical">3</strong>
            </div>
            <span>•</span>
            <div>
              <span>Trạng thái:</span> <strong className="text-slate-700">Chưa phân loại</strong>
            </div>
          </div>
        </div>

        {/* Action Controls Top-Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Đang tải xuống tài liệu đơn tố giác...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Tải xuống</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Đã tạo liên kết chia sẻ hồ sơ đơn.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">share</span>
            <span>Chia sẻ</span>
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs shadow-2xs cursor-pointer"
            title="Thêm tùy chọn"
          >
            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            disabled={aiState === 'reading'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0043a8] active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">task_alt</span>
            <span>Tiếp nhận và xử lý</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: BỐ CỤC 2 CỘT CHÍNH (TÀI LIỆU & AI PHÂN TÍCH)            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN TRÁI: TÀI LIỆU / NỘI DUNG ĐƠN (46% Width)                           */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[46%] flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Khu vực Tài liệu */}
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-slate-600">description</span>
              <h2 className="text-xs font-bold text-slate-900 uppercase font-headline-md tracking-tight">
                Tài liệu / Nội dung đơn
              </h2>
            </div>
            {aiState === 'reading' && (
              <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                Đang quét OCR trang 1/3...
              </span>
            )}
          </div>

          {/* PDF Viewer Dark Toolbar */}
          <div className="px-3 py-1.5 bg-[#2d3748] text-white flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Mục lục"
              >
                <span className="material-symbols-outlined text-[16px]">menu</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] font-label-technical">
                <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-600 font-bold">
                  {currentPage}
                </span>
                <span className="text-slate-400">/ 3</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Thu nhỏ"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_out</span>
              </button>
              <span className="font-label-technical text-[11px] min-w-[34px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Phóng to"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Vừa trang"
              >
                <span className="material-symbols-outlined text-[16px]">aspect_ratio</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Xoay"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
              </button>
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="Tải về"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
              <button
                type="button"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                title="In"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
              </button>
            </div>
          </div>

          {/* PDF Canvas View with Scanner effect */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-slate-200/80 relative">
            {/* LASER SCANNER ANIMATION KHI AI ĐANG ĐỌC */}
            {aiState === 'reading' && (
              <div className="laser-scanner" />
            )}

            {/* Banner nổi báo hiệu đang bóc tách */}
            {aiState === 'reading' && (
              <div className="absolute top-2 left-4 right-4 z-30 flex items-center justify-between px-3 py-1.5 bg-blue-600/95 backdrop-blur-xs text-white rounded-xl shadow-lg text-[11px] font-medium border border-blue-400 animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                  <span>Tia quét AI đang đọc văn bản &amp; đối soát thực thể...</span>
                </div>
                <span className="font-label-technical font-bold">{readingProgress}%</span>
              </div>
            )}

            {/* Trang giấy mô phỏng đơn tố giác */}
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="bg-white shadow-xl rounded-sm border border-slate-300 p-8 min-h-[580px] w-[95%] transition-transform text-slate-800 text-[11.5px] leading-relaxed space-y-3.5 relative"
            >
              {/* Header Quốc hiệu */}
              <div className="text-center space-y-1 pb-1">
                <p className="font-bold uppercase text-[10.5px] tracking-wide text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="text-[10px] underline font-medium text-slate-800">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <p className="text-right text-[10.5px] italic text-slate-600 pt-1">
                  Hà Nội, ngày 10 tháng 9 năm 2026
                </p>
              </div>

              {/* Tiêu đề Đơn */}
              <div className="text-center py-1">
                <h3 className="text-[15px] font-bold uppercase text-slate-950 tracking-wide">
                  ĐƠN TỐ GIÁC
                </h3>
              </div>

              {/* Kính gửi */}
              <p className="font-semibold text-slate-900">
                Kính gửi:{' '}
                <span className="font-normal text-slate-800">
                  Cơ quan Cảnh sát điều tra Công an thành phố Hà Nội
                </span>
              </p>

              {/* Thông tin người tố giác & đồng đứng đơn */}
              <div className="space-y-1 pt-0.5 border-b border-slate-200/60 pb-2">
                <p>
                  <strong>1. Người làm đơn: </strong>
                  <span
                    className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'nguoiGui' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    Nguyễn Văn A
                  </span>{' '}
                  (Sinh năm: 1988 | CCCD:{' '}
                  <span
                    className={`font-label-technical px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'cccd' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    001088019482
                  </span>
                  )
                </p>
                <p>
                  Địa chỉ thường trú:{' '}
                  <span
                    className={`px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaChi' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    Số 12, ngõ 45, Cầu Giấy, Hà Nội
                  </span>{' '}
                  | SĐT: <span className="font-label-technical">0912 345 678</span>
                </p>
                <p>
                  <strong>2. Người cùng đứng đơn: </strong>
                  <span className="font-semibold text-slate-900">Bà Trần Thị C</span> (Vợ kiêm đồng sở hữu tài sản | CCCD:{' '}
                  <span className="font-label-technical">001190028391</span>)
                </p>
                <p>
                  <strong>3. Người đại diện theo ủy quyền: </strong>
                  <span className="font-semibold text-purple-900">Luật sư Lê Quang Đ</span> (Văn phòng Luật sư Ánh Dương, Thẻ LS số{' '}
                  <span className="font-label-technical">LS-0928/ĐLS-HN</span> theo Giấy ủy quyền số 12/2026/UQ đính kèm).
                </p>
              </div>

              {/* Nội dung tố giác */}
              <div className="space-y-1 pt-1 text-justify leading-relaxed">
                <p>
                  Chúng tôi làm đơn này tố giác hành vi có dấu hiệu lừa đảo chiếm đoạt tài sản của:{' '}
                </p>
                <div className="p-2 rounded bg-slate-100/70 border border-slate-200/80 space-y-1">
                  <p>
                    • <strong>Tổ chức bị tố giác: </strong>
                    <span className="font-bold text-slate-900">Công ty Cổ phần Đầu tư & Phát triển Đô thị X</span> (Mã số thuế:{' '}
                    <span className="font-label-technical">0108293847</span>; Trụ sở: Tòa nhà Landmark, Nam Từ Liêm, Hà Nội).
                  </p>
                  <p>
                    • <strong>Cá nhân trực tiếp chỉ đạo: </strong>
                    <span
                      className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'doiTuong' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                        }`}
                    >
                      Ông Trần Văn B – Chủ tịch HĐQT kiêm Tổng Giám đốc
                    </span>
                  </p>
                  <p>
                    • <strong>Cá nhân liên đới: </strong>
                    <span className="font-semibold text-slate-900">Bà Vũ Mai H</span> – Kế toán trưởng (Người trực tiếp ký phiếu thu 3,5 tỷ VNĐ).
                  </p>
                </div>
                <p className="pt-1">
                  Cụ thể về việc huy động vốn trái phép tại{' '}
                  <span
                    className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaDiem' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    Dự án Khu đô thị Y
                  </span>{' '}
                  thông qua Hợp đồng góp vốn số 88/2024/HĐGV nhưng không bàn giao đất và có dấu hiệu tẩu tán tài sản...
                </p>
              </div>

              {/* Yêu cầu */}
              <div className="space-y-1 pt-1">
                <p className="font-semibold text-slate-900">Chúng tôi kính đề nghị Quý Cơ quan:</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 text-slate-700">
                  <li>Xác minh, khởi tố điều tra làm rõ hành vi chiếm đoạt 3,5 tỷ VNĐ của ông Trần Văn B và các đối tượng liên quan.</li>
                  <li>Bảo vệ quyền và lợi ích hợp pháp của các nạn nhân; áp dụng biện pháp khẩn cấp phong tỏa tài khoản Công ty X.</li>
                  <li>Thông báo kết quả giải quyết cho chúng tôi và Luật sư đại diện theo quy định pháp luật.</li>
                </ol>
              </div>

              <p className="italic text-slate-600 pt-1 text-[11px]">
                Chúng tôi xin cam đoan những nội dung trên là đúng sự thật và chịu trách nhiệm trước pháp luật về nội dung đơn thư của mình.
              </p>

              {/* Chữ ký đa đương sự */}
              <div className="pt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">Luật sư đại diện</p>
                  <div className="h-7 flex items-center justify-center italic text-purple-900 font-script text-sm">
                    LeQuangD
                  </div>
                  <p className="font-semibold text-slate-900">LS. Lê Quang Đ</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">Người cùng đứng đơn</p>
                  <div className="h-7 flex items-center justify-center italic text-indigo-900 font-script text-sm">
                    TranThiC
                  </div>
                  <p className="font-semibold text-slate-900">Trần Thị C</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">Người làm đơn</p>
                  <div className="h-7 flex items-center justify-center italic text-blue-900 font-script text-sm">
                    NguyenVanA
                  </div>
                  <p className="font-semibold text-slate-900">Nguyễn Văn A</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tài liệu kèm theo (2) */}
          <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-slate-800">
                Tài liệu kèm theo (2)
              </span>
              <button
                type="button"
                onClick={() => showToast('Mở hộp thoại tải lên tài liệu chứng cứ kèm theo...')}
                className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Thêm tài liệu</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => {
                  setSelectedFileId('f1');
                  showToast('Đang mở: Đơn tố giác.pdf');
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${selectedFileId === 'f1'
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                  picture_as_pdf
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-slate-800 truncate">
                    Đơn tố giác.pdf
                  </p>
                  <span className="text-[10px] text-slate-400 font-label-technical">
                    1.2 MB • 15/09/2026 10:24
                  </span>
                </div>
              </div>

              <div
                onClick={() => {
                  setSelectedFileId('f2');
                  showToast('Đang mở: Hợp đồng góp vốn.pdf');
                }}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${selectedFileId === 'f2'
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                  picture_as_pdf
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-semibold text-slate-800 truncate">
                    Hợp đồng góp vốn.pdf
                  </p>
                  <span className="text-[10px] text-slate-400 font-label-technical">
                    2.8 MB • 15/09/2026 10:24
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN PHẢI: CÁC KHỐI ②, ③, ④, ⑤, ⑥ (54% Width)                            */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[54%] flex flex-col h-full overflow-y-auto space-y-3.5 pr-1">
          {/* =================================================================== */}
          {/* KHỐI ②: THÔNG TIN TRÍCH XUẤT TỪ ĐƠN (AI)                           */}
          {/* =================================================================== */}
          <div className={`bg-white rounded-2xl border ${isEditingExtract ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200/90 shadow-2xs'} p-4 space-y-3 transition-all`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Thông tin trích xuất từ đơn (AI)
                </h3>
              </div>

              {aiState === 'reading' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold font-label-technical border border-amber-200 animate-pulse">
                  <span className="material-symbols-outlined text-[13px] animate-spin text-amber-600">
                    sync
                  </span>
                  Đang bóc tách ({readingProgress}%)
                </span>
              ) : isEditingExtract ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[11px] text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                    Nhấp trực tiếp vào chữ để sửa
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveExtract}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#004ac6] hover:bg-[#003ea8] text-white transition-all cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>Lưu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelExtract}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200"
                  >
                    <span>Hủy</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Đã hoàn thành
                  </span>
                  <span className="text-slate-400 font-label-technical">Cập nhật lúc 10:24</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingExtract(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-md text-[#004ac6] hover:text-[#003ea8] hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer shadow-2xs ml-1"
                    title="Chỉnh sửa trực tiếp nội dung văn bản"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit</span>
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              )}
            </div>

            {/* Grid 6 ô thông tin chi tiết */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* 1. Người gửi */}
              <div
                onMouseEnter={() => setActiveHighlightKey('nguoiGui')}
                onMouseLeave={() => setActiveHighlightKey(null)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">Người gửi</span>
                  <div>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('nguoiGui', e.currentTarget.textContent || '')}
                      className={`font-bold text-slate-900 text-[12.5px] outline-none transition-all inline-block ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:bg-white focus:border-solid focus:border-[#004ac6] focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.nguoiGui}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 flex items-center flex-wrap gap-1">
                    <span>Sinh năm:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('namSinh', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.namSinh}
                    </span>
                    <span>| CCCD:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('cccd', e.currentTarget.textContent || '')}
                      className={`font-label-technical font-semibold text-slate-800 outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.cccd}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>SĐT:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('sdt', e.currentTarget.textContent || '')}
                      className={`font-label-technical outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.sdt}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-start gap-1">
                    <span className="shrink-0">Địa chỉ:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('diaChi', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.diaChi}
                    </span>
                  </p>
                </div>
              </div>

              {/* 2. Loại nội dung */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">Loại nội dung</span>
                  {aiState === 'reading' && readingProgress < 70 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="h-3 w-28 bg-slate-200 rounded skel" />
                      <div className="h-2.5 w-40 bg-slate-200 rounded skel" />
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-blue-900 text-[12.5px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-blue-700 shrink-0">shield</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('loaiNoiDung', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                              ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                              : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.loaiNoiDung}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-0.5 flex items-center flex-wrap gap-1">
                        <span>Có dấu hiệu:</span>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('dauHieu', e.currentTarget.textContent || '')}
                          className={`text-slate-800 font-medium outline-none transition-all ${isEditingExtract
                              ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                              : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.dauHieu}
                        </span>
                      </p>

                      {/* Quick select pills for testing rule 8 */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh:</span>
                        {[
                          'Tố giác tội phạm',
                          'Đơn khiếu nại (Lần 1)',
                          'Đơn tố cáo',
                          'Đơn phản ánh, kiến nghị',
                        ].map((ld) => (
                          <button
                            key={ld}
                            type="button"
                            onClick={() => {
                              updateExtractField('loaiNoiDung', ld);
                              showToast(`Đã chuyển loại đơn sang: "${ld}"`);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                              extractData.loaiNoiDung === ld
                                ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {ld}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 3. Đối tượng bị tố giác / liên quan */}
              <div
                onMouseEnter={() => setActiveHighlightKey('doiTuong')}
                onMouseLeave={() => setActiveHighlightKey(null)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-purple-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Đối tượng bị tố giác / liên quan
                  </span>
                  <div>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('doiTuong', e.currentTarget.textContent || '')}
                      className={`font-bold text-slate-900 text-[12.5px] outline-none transition-all inline-block ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.doiTuong}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>Chức vụ:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('chucVu', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.chucVu}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>Đơn vị:</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('donVi', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.donVi}
                    </span>
                  </p>
                </div>
              </div>

              {/* 4. Thời gian sự việc */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Thời gian sự việc
                  </span>
                  {aiState === 'reading' && readingProgress < 60 ? (
                    <div className="h-3.5 w-32 bg-slate-200 rounded skel mt-1" />
                  ) : (
                    <p className="font-bold text-slate-800 text-[12px] pt-0.5">
                      <span
                        contentEditable={isEditingExtract}
                        suppressContentEditableWarning
                        onBlur={(e) => updateExtractField('thoiGian', e.currentTarget.textContent || '')}
                        className={`outline-none transition-all ${isEditingExtract
                            ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                            : ''
                          }`}
                        title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                      >
                        {extractData.thoiGian}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* 5. Địa điểm, dự án, sự việc */}
              <div
                onMouseEnter={() => setActiveHighlightKey('diaDiem')}
                onMouseLeave={() => setActiveHighlightKey(null)}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-rose-50/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Địa điểm, dự án, sự việc
                  </span>
                  <div className="font-bold text-slate-900 text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-rose-600 shrink-0">place</span>
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('duAn', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 py-0.5 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.duAn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-4">
                    <span
                      contentEditable={isEditingExtract}
                      suppressContentEditableWarning
                      onBlur={(e) => updateExtractField('diaDiem', e.currentTarget.textContent || '')}
                      className={`outline-none transition-all ${isEditingExtract
                          ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                          : ''
                        }`}
                      title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                    >
                      {extractData.diaDiem}
                    </span>
                  </p>
                </div>
              </div>

              {/* 6. Yêu cầu của người gửi */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-emerald-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div className="min-w-0 flex-1 leading-snug space-y-1">
                  <span className="text-[10.5px] text-slate-500 font-medium block">
                    Yêu cầu của người gửi
                  </span>
                  {aiState === 'reading' && readingProgress < 75 ? (
                    <div className="space-y-1 pt-1">
                      <div className="h-2.5 w-full bg-slate-200 rounded skel" />
                      <div className="h-2.5 w-4/5 bg-slate-200 rounded skel" />
                    </div>
                  ) : (
                    <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                      <li>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('yeuCau1', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                              ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                              : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.yeuCau1}
                        </span>
                      </li>
                      <li>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('yeuCau2', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                              ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                              : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.yeuCau2}
                        </span>
                      </li>
                      <li>
                        <span
                          contentEditable={isEditingExtract}
                          suppressContentEditableWarning
                          onBlur={(e) => updateExtractField('yeuCau3', e.currentTarget.textContent || '')}
                          className={`outline-none transition-all ${isEditingExtract
                              ? 'bg-white border-b border-dashed border-[#004ac6] hover:bg-blue-50/70 px-1 rounded cursor-text focus:ring-1 focus:ring-blue-300'
                              : ''
                            }`}
                          title={isEditingExtract ? 'Nhấp vào chữ để sửa' : undefined}
                        >
                          {extractData.yeuCau3}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* KHỐI ③: KẾT QUẢ TRA CỨU TRONG HỆ THỐNG                              */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Kết quả tra cứu trong hệ thống
                </h3>
              </div>
              <button
                type="button"
                onClick={() => showToast('Mở xem chi tiết đối soát toàn bộ hệ thống tra cứu...')}
                className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>

            {/* 3 Thẻ kết quả */}
            <div className="grid grid-cols-3 gap-3">
              {/* Thẻ 1: Lịch sử người gửi */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[17px]">badge</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-600 block leading-tight">
                    Lịch sử người gửi
                  </span>
                  {aiState === 'reading' && readingProgress < 60 ? (
                    <div className="h-5 w-8 bg-blue-200 rounded skel my-1" />
                  ) : (
                    <div className="text-[20px] font-bold text-slate-900 font-headline-md leading-none my-0.5">
                      3
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500">đơn đã gửi</p>
                  <button
                    type="button"
                    onClick={() => showToast('Mở danh sách 3 đơn của người gửi Nguyễn Văn A...')}
                    className="text-[10.5px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 mt-1 cursor-pointer"
                  >
                    <span>Xem danh sách</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Thẻ 2: Đơn tương tự */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 relative">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[17px]">description</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-600 block leading-tight">
                    Đơn tương tự
                  </span>
                  {aiState === 'reading' && readingProgress < 75 ? (
                    <div className="h-5 w-8 bg-amber-200 rounded skel my-1" />
                  ) : (
                    <div className="text-[20px] font-bold text-slate-900 font-headline-md leading-none my-0.5">
                      1
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    đơn có nội dung tương tự
                  </p>
                  <p className="text-[10px] text-amber-800 font-medium">Độ tương đồng cao (86%)</p>
                  <button
                    type="button"
                    onClick={() => showToast('Mở đơn tương tự mã D-2025-00341 (86%)...')}
                    className="text-[10.5px] text-amber-800 hover:underline font-semibold flex items-center gap-0.5 mt-1 cursor-pointer"
                  >
                    <span>Xem chi tiết</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Thẻ 3: Vụ việc liên quan */}
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-2.5 relative">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[17px]">folder</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-600 block leading-tight">
                    Vụ việc liên quan
                  </span>
                  {aiState === 'reading' && readingProgress < 85 ? (
                    <div className="h-5 w-8 bg-purple-200 rounded skel my-1" />
                  ) : (
                    <div className="text-[20px] font-bold text-slate-900 font-headline-md leading-none my-0.5">
                      1
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500 leading-tight">vụ việc đang xử lý</p>
                  <p className="text-[10px] text-purple-800 font-medium">Có cùng đối tượng / dự án</p>
                  <button
                    type="button"
                    onClick={() => showToast('Mở vụ việc liên quan Dự án Khu đô thị Y...')}
                    className="text-[10.5px] text-purple-800 hover:underline font-semibold flex items-center gap-0.5 mt-1 cursor-pointer"
                  >
                    <span>Xem chi tiết</span>
                    <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* KHỐI ④: TÓM TẮT VÀ PHÂN TÍCH (AI)                                  */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Tóm tắt và phân tích (AI)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopySummary}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[13px]">content_copy</span>
                <span>Sao chép</span>
              </button>
            </div>

            {aiState === 'reading' && readingProgress < 75 ? (
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="h-3 w-full bg-slate-200 rounded skel" />
                <div className="h-3 w-full bg-slate-200 rounded skel" />
                <div className="h-3 w-2/3 bg-slate-200 rounded skel" />
              </div>
            ) : (
              <p className="text-[11.5px] text-slate-700 leading-relaxed text-justify bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                <strong>Nguyễn Văn A</strong> tố giác ông <strong>Trần Văn B</strong> – Giám đốc Công ty Cổ phần X có hành vi lừa đảo chiếm đoạt tài sản thông qua việc huy động vốn tại <strong>Dự án Khu đô thị Y (Hà Nội)</strong> trong giai đoạn 2024 – 2025. Người gửi đề nghị cơ quan điều tra xác minh, điều tra, bảo vệ quyền lợi và thông báo kết quả.
              </p>
            )}
          </div>

          {/* =================================================================== */}
          {/* KHỐI ⑤: GỢI Ý HƯỚNG XỬ LÝ (AI + QUY ĐỊNH NGHIỆP VỤ)                 */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Gợi ý hướng xử lý (AI + Quy định nghiệp vụ)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCanCuModal(true)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-50"
              >
                <span className="material-symbols-outlined text-[13px]">menu_book</span>
                <span>Căn cứ gợi ý</span>
              </button>
            </div>

            {aiState === 'reading' && readingProgress < 90 ? (
              <div className="p-3 bg-emerald-50/40 rounded-xl space-y-1.5">
                <div className="h-3 w-full bg-emerald-100 rounded skel" />
                <div className="h-3 w-5/6 bg-emerald-100 rounded skel" />
                <div className="h-3 w-4/5 bg-emerald-100 rounded skel" />
              </div>
            ) : (
              <div className="text-[11.5px] text-slate-800 space-y-2 leading-relaxed bg-emerald-50/30 p-3 rounded-xl border border-emerald-100">
                <p>
                  <strong>1. Đề xuất phân loại:</strong> Tố giác tội phạm về lừa đảo chiếm đoạt tài sản.
                </p>
                <p>
                  <strong>2. Kiểm tra đơn trùng:</strong> Có 01 đơn tương tự (D-2025-00341), đề nghị xem xét hợp nhất.
                </p>
                <div>
                  <strong className="block">3. Đề xuất hướng xử lý:</strong>
                  <ul className="list-disc list-inside space-y-0.5 pl-2 text-slate-700">
                    <li>Chuyển Phòng Cảnh sát kinh tế để xác minh, giải quyết theo thẩm quyền.</li>
                    <li>Trường hợp có đủ dấu hiệu tội phạm, thụ lý nguồn tin về tội phạm.</li>
                  </ul>
                </div>
                <p className="text-slate-600 pt-0.5 border-t border-emerald-100/80">
                  <strong>4. Lưu ý:</strong> Người gửi đã có 03 đơn, cần kiểm tra kết quả các đơn trước và các vụ việc liên quan.
                </p>
              </div>
            )}
          </div>

          {/* =================================================================== */}
          {/* KHỐI ⑥: AI ĐÃ NGẦM CHUẨN BỊ XỬ LÝ THEO QUY TRÌNH (PRE-PROCESSED)     */}
          {/* =================================================================== */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
                  <span className={`material-symbols-outlined text-[17px] ${isPreProcessing ? 'animate-spin' : 'animate-pulse'}`}>
                    {isPreProcessing ? 'autorenew' : 'neurology'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight uppercase">
                    AI ĐÃ NGẦM CHẠY XỬ LÝ THEO QUY TRÌNH
                  </h3>
                  <span className="text-[10.5px] text-slate-500 font-medium">
                    Tự động kích hoạt ngay khi phân loại: "{extractData.loaiNoiDung}"
                  </span>
                </div>
              </div>

              {isPreProcessing ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#004ac6] border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-ping"></span>
                  Đang ngầm nạp quy trình...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Sẵn sàng áp dụng (Zero-delay)
                </span>
              )}
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-blue-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11.5px] text-slate-700">
                <span>Quy trình được khớp nối: <strong className="text-[#004ac6]">{matchWorkflowByLoaiDon(extractData.loaiNoiDung).name}</strong></span>
                <span className="font-bold text-slate-500">{matchWorkflowByLoaiDon(extractData.loaiNoiDung).totalSteps} bước</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">task_alt</span>
                  <span><strong>{matchWorkflowByLoaiDon(extractData.loaiNoiDung).defaultTasks.length}</strong> việc tạo sẵn</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="material-symbols-outlined text-amber-600 text-[16px]">warning</span>
                  <span><strong>{matchWorkflowByLoaiDon(extractData.loaiNoiDung).potentialMissingInfo.length}</strong> điểm thiếu sót</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">description</span>
                  <span><strong>2</strong> dự thảo mẫu</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic flex items-center justify-between">
              <span>* AI đã hoàn tất các phân tích ngầm, cán bộ không phải chờ thiết lập lại từ đầu khi bấm Tiếp nhận.</span>
              <button
                type="button"
                onClick={() => setShowKhoiTaoModal(true)}
                className="font-bold text-[#004ac6] hover:underline cursor-pointer not-italic ml-2 shrink-0"
              >
                Xem quy trình ngầm →
              </button>
            </p>
          </div>

          {/* =================================================================== */}
          {/* KHỐI: Ý KIẾN CỦA CÁN BỘ TIẾP NHẬN & QUYẾT ĐỊNH XỬ LÝ                */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-slate-600">edit_note</span>
                <h3 className="text-xs font-bold text-slate-900 font-headline-md tracking-tight">
                  Ý kiến của cán bộ tiếp nhận
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Quyết định xử lý hồ sơ</span>
            </div>

            <div className="space-y-3">
              {/* Textarea nhập ý kiến */}
              <textarea
                rows={2}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Nhập ý kiến, nhận xét, căn cứ đề xuất của cán bộ tiếp nhận (tùy chọn)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none transition-all"
              />

              {/* Nhóm các nút hành động: Trả lại, Bàn giao, Tiếp nhận và xử lý */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => showToast('Đã lưu tạm ý kiến cán bộ tiếp nhận.')}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span>
                  <span>Lưu nháp</span>
                </button>

                <div className="flex items-center gap-2.5">
                  {/* Nút 1: Trả lại */}
                  <button
                    type="button"
                    onClick={() => setShowTraLaiModal(true)}
                    disabled={aiState === 'reading'}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                    <span>Trả lại</span>
                  </button>

                  {/* Nút 2: Bàn giao */}
                  <button
                    type="button"
                    onClick={() => setShowBanGiaoModal(true)}
                    disabled={aiState === 'reading'}
                    className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    <span>Bàn giao</span>
                  </button>

                  {/* Nút 3: Tiếp nhận & bắt đầu xử lý */}
                  <button
                    type="button"
                    onClick={() => setShowKhoiTaoModal(true)}
                    disabled={aiState === 'reading'}
                    className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Tiếp nhận &amp; bắt đầu xử lý</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CĂN CỨ GỢI Ý                                                        */}
      {/* ========================================================================= */}
      {showCanCuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">menu_book</span>
                <h3 className="font-bold text-slate-900 text-base">Căn cứ pháp lý gợi ý xử lý</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCanCuModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="text-xs text-slate-700 space-y-2.5">
              <p>
                <strong>1. Điều 145 Bộ luật Tố tụng Hình sự 2015:</strong> Thẩm quyền và trách nhiệm tiếp nhận, giải quyết tố giác, tin báo về tội phạm.
              </p>
              <p>
                <strong>2. Thông tư liên tịch 01/2017/TTLT-BCA-BQP-BTC-BNN&amp;PTNT-VKSNDTC:</strong> Phối hợp giữa các cơ quan trong việc tiếp nhận, thụ lý nguồn tin tội phạm.
              </p>
              <p>
                <strong>3. Điều 174 Bộ luật Hình sự 2015 (sửa đổi 2017):</strong> Tội lừa đảo chiếm đoạt tài sản.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCanCuModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TRẢ LẠI ĐƠN                                                         */}
      {/* ========================================================================= */}
      {showTraLaiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">assignment_return</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận trả lại đơn</h3>
                <p className="text-xs text-slate-500">Đơn số: D-2026-00125 - Người gửi: Nguyễn Văn A</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do trả lại đơn:
                </label>
                <select
                  value={traLaiReason}
                  onChange={(e) => setTraLaiReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                >
                  <option value="Không thuộc thẩm quyền giải quyết">Không thuộc thẩm quyền giải quyết</option>
                  <option value="Thiếu hồ sơ tài liệu chứng minh theo quy định">Thiếu hồ sơ tài liệu chứng minh theo quy định</option>
                  <option value="Đơn trùng lặp nội dung đã có thông báo trả lời">Đơn trùng lặp nội dung đã có thông báo trả lời</option>
                  <option value="Người gửi có đơn xin rút yêu cầu xử lý">Người gửi có đơn xin rút yêu cầu xử lý</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung thông báo hướng dẫn người gửi:
                </label>
                <textarea
                  rows={2}
                  defaultValue="Đề nghị công dân gửi đơn đến đúng cơ quan có thẩm quyền hoặc bổ sung đầy đủ tài liệu, chứng cứ kèm theo."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTraLaiModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTraLaiModal(false);
                  showToast('Đã trả lại đơn D-2026-00125 và gửi thông báo cho công dân thành công.');
                  setTimeout(() => onNav('cong-viec'), 1500);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Xác nhận trả lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL BÀN GIAO ĐƠN                                                        */}
      {/* ========================================================================= */}
      {showBanGiaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">swap_horiz</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bàn giao / Chuyển đơn</h3>
                <p className="text-xs text-slate-500">Đơn số: D-2026-00125 - Người gửi: Nguyễn Văn A</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn vị tiếp nhận bàn giao:
                </label>
                <select
                  value={banGiaoUnit}
                  onChange={(e) => setBanGiaoUnit(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội">Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội</option>
                  <option value="Phòng Cảnh sát hình sự (PC02) - Công an TP. Hà Nội">Phòng Cảnh sát hình sự (PC02) - Công an TP. Hà Nội</option>
                  <option value="Công an Quận Cầu Giấy - Đội Điều tra tổng hợp">Công an Quận Cầu Giấy - Đội Điều tra tổng hợp</option>
                  <option value="Viện Kiểm sát Nhân dân TP. Hà Nội">Viện Kiểm sát Nhân dân TP. Hà Nội</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Hồ sơ bàn giao đính kèm:</p>
                <p className="text-[11px] text-amber-800">• 01 Đơn tố giác bản gốc (3 trang scan)</p>
                <p className="text-[11px] text-amber-800">• 02 Hợp đồng góp vốn photo có đối chiếu</p>
                <p className="text-[11px] text-amber-800">• Phiếu phân tích sơ bộ &amp; kết quả tra cứu hệ thống do AI trích xuất</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBanGiaoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBanGiaoModal(false);
                  showToast(`Đã tạo phiếu bàn giao đơn D-2026-00125 sang ${banGiaoUnit} thành công.`);
                  setTimeout(() => onNav('cong-viec'), 1500);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">forward</span>
                <span>Xác nhận bàn giao</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TIẾP NHẬN VÀ XỬ LÝ ĐƠN                                              */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0052cc] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận tiếp nhận và xử lý</h3>
                <p className="text-xs text-slate-500">Đơn số: D-2026-00125</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-700 space-y-1.5">
              <p>
                Người gửi: <strong>Nguyễn Văn A</strong>
              </p>
              <p>
                Phân loại: <strong>Tố giác tội phạm (Lừa đảo chiếm đoạt tài sản)</strong>
              </p>
              <p>
                Hướng xử lý: <strong>Thụ lý đơn, phân công cán bộ điều tra xác minh</strong>
              </p>
              {officerNote && (
                <p className="pt-1 text-slate-600 border-t border-slate-200">
                  Ý kiến cán bộ: <em>{officerNote}</em>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  showToast('Đã tiếp nhận và đưa đơn Đ-2026-00125 vào danh sách Tiếp nhận & Xử lý thành công!');
                  onAcceptAndProcess?.({
                    id: 'Đ-2026-00125',
                    code: 'Đ-2026-00125',
                    title: 'Tố giác vi phạm lừa đảo chiếm đoạt tài sản (Dự án Khu đô thị Y)',
                    luotNhanId: 'LN-2025-0819',
                    nguoiNop: 'Nguyễn Văn A',
                    ngayNhan: '16/09/2026 09:15',
                    loaiDon: 'Đơn tố giác tội phạm',
                    type: 'ĐƠN TIẾP NHẬN',
                    isNew: true,
                  });
                  setTimeout(() => onNav('cong-viec'), 1200);
                }}
                className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0043a8] text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Xác nhận tiếp nhận</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KHỞI TẠO QUY TRÌNH TỰ ĐỘNG THEO LOẠI ĐƠN                            */}
      {/* ========================================================================= */}
      <KhoiTaoQuyTrinhModal
        isOpen={showKhoiTaoModal}
        onClose={() => setShowKhoiTaoModal(false)}
        loaiDonConfirmed={extractData.loaiNoiDung || 'Đơn tố giác về tội phạm'}
        workflow={matchWorkflowByLoaiDon(extractData.loaiNoiDung)}
        donCode="Đ-2026-00125"
        donTitle={`Tố giác vi phạm lừa đảo chiếm đoạt tài sản (${extractData.duAn || 'Dự án Khu đô thị Y'})`}
        nguoiNop={extractData.nguoiGui || 'Nguyễn Văn A'}
        onConfirmAndEnterProcess={handleConfirmWorkflowFromModal}
      />
    </div>
  );
}