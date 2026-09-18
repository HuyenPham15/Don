import React, { useState, useMemo } from 'react';
import { LuotNhan, Screen, DonDetail } from "../types";
import { WorkItem, WorkItemColumn, AIProcessingStatus } from '../types/work';
import { INITIAL_WORK_ITEMS } from '../constants/workItems';
import { LN19, ALL_LUOT_NHAN } from '../constants';

interface CongViecCuaToiProps {
  onSelect: (ln: LuotNhan) => void;
  onNav: (s: Screen) => void;
  extraCard: LuotNhan | null;
  onSelectDon?: (don: DonDetail) => void;
  acceptedDons?: DonDetail[];
}

type QuickFilter =
  | 'all'
  | 'overdue'
  | 'today'
  | 'upcoming'
  | 'action_required'
  | 'ai_completed'
  | 'ai_processing'
  | 'ai_needs_review'
  | 'ai_failed'
  | 'collab'
  | 'waiting_sign'
  | 'handed_over';

type SortOption = 'priority_deadline' | 'deadline_asc' | 'urgent_first' | 'newest' | 'oldest';

export default function CongViecCuaToi({
  onSelect,
  onNav,
  extraCard,
  onSelectDon,
  acceptedDons = [],
}: CongViecCuaToiProps) {
  const [items, setItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority_deadline');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Xử lý nút Thử lại AI (Retry AI analysis)
  const handleRetryAI = (e: React.MouseEvent, item: WorkItem) => {
    e.stopPropagation();
    showToast(`Đang kích hoạt AI Agent phân tích lại hồ sơ ${item.code}...`);
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
            ...i,
            aiStatus: 'processing',
            aiProgress: 25,
            taskReadiness: 'waiting_system',
            nextAction: 'Đang xử lý lại nội dung... (Chờ AI hoàn tất)',
            cta: { label: 'Xem hồ sơ', actionType: 'view_doc', variant: 'outline' },
          }
          : i
      )
    );

    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
              ...i,
              aiStatus: 'completed',
              aiProgress: 100,
              taskReadiness: 'action_required',
              nextAction: 'Kiểm tra kết quả phân tích AI và xác nhận tiếp nhận',
              cta: { label: 'Xử lý ngay', actionType: 'handle_now', variant: 'urgent' },
            }
            : i
        )
      );
      showToast(`✓ AI đã hoàn tất phân tích thành công cho ${item.code}!`);
    }, 2800);
  };

  // Tích hợp extraCard nếu người dùng vừa lập lượt nhận mới
  const allItemsWithExtra = useMemo(() => {
    let list = [...items];

    // Thêm các đơn mới tiếp nhận từ màn Tiếp nhận đơn
    if (acceptedDons && acceptedDons.length > 0) {
      acceptedDons.forEach((ad) => {
        // Loại bỏ lượt nhận hoặc đơn cũ ở cột 'action_required' nếu đã được tiếp nhận
        list = list.filter((it) => it.id !== ad.luotNhanId && it.code !== ad.luotNhanId && it.code !== ad.code && it.id !== ad.id);
        list.unshift({
          id: ad.id,
          code: ad.code,
          title: ad.title,
          sender: ad.nguoiNop,
          source: 'Cổng DVC Quốc gia',
          timeReceived: ad.ngayNhan || 'Vừa xong',
          priority: 'normal',
          deadlineType: 'today',
          deadlineText: 'Hôm nay - 17:00',
          deadlineFull: 'Hôm nay - 17:00',
          column: 'processing',
          nextAction: 'Phân công cán bộ thụ lý & xác minh thông tin đơn',
          holder: {
            role: 'Đang xử lý',
            name: 'Tôi (Nguyễn Minh Anh)',
            department: 'Tổ Tiếp nhận & Xử lý',
          },
          progress: {
            currentStep: 2,
            totalSteps: 5,
            stepName: 'Phân loại thụ lý',
            steps: ['Tiếp nhận', 'Phân loại', 'Thẩm tra', 'Trình ký', 'Trả kết quả'],
          },
          docCount: 5,
          cta: {
            label: 'Tiếp tục xử lý',
            actionType: 'continue',
            variant: 'primary',
          },
          category: 'Đơn mới tiếp nhận',
          tags: ['Mới tiếp nhận', 'Đã tiếp nhận'],
          loaiDon: ad.loaiDon,
          luotNhanId: ad.luotNhanId,
          aiStatus: 'completed',
          taskReadiness: 'action_required',
        });
      });
    }

    // Thêm extraCard nếu có
    if (extraCard && !list.some((it) => it.id === extraCard.id)) {
      list.unshift({
        id: extraCard.id,
        code: extraCard.id,
        title: extraCard.noiDung,
        sender: extraCard.nguoiNop,
        source: 'Bộ phận Một cửa',
        timeReceived: 'Vừa xong',
        priority: 'urgent',
        deadlineType: 'today',
        deadlineText: 'Hôm nay - 16:30',
        deadlineFull: 'Hôm nay - 16:30',
        column: 'action_required',
        nextAction: 'Kiểm tra tính hợp lệ & đối soát cơ sở dữ liệu quốc gia',
        holder: {
          role: 'Đang xử lý',
          name: 'Tôi (Nguyễn Minh Anh)',
          department: 'Tổ Tiếp nhận hồ sơ',
        },
        progress: {
          currentStep: 1,
          totalSteps: 5,
          stepName: 'Tiếp nhận hồ sơ',
          steps: ['Tiếp nhận', 'Phân loại', 'Xác minh', 'Trình ký', 'Trả kết quả'],
        },
        docCount: 3,
        cta: {
          label: 'Xử lý ngay',
          actionType: 'handle_now',
          variant: 'urgent',
        },
        category: 'Hồ sơ mới',
        tags: ['Mới tạo'],
        luotNhanId: extraCard.id,
        aiStatus: 'completed',
        taskReadiness: 'action_required',
      });
    }

    return list;
  }, [items, acceptedDons, extraCard]);

  // Tính toán KPI số liệu chuẩn xác 100% từ tập dữ liệu
  const kpiStats = useMemo(() => {
    const total = allItemsWithExtra.length;
    const overdue = allItemsWithExtra.filter((i) => i.deadlineType === 'overdue').length;
    const dueTodayOnly = allItemsWithExtra.filter((i) => i.deadlineType === 'today').length;
    // "Cần làm hôm nay" bao gồm: việc đã quá hạn + việc cần xử lý trong ngày
    const today = overdue + dueTodayOnly;
    const upcoming = allItemsWithExtra.filter((i) => i.deadlineType === 'upcoming').length;
    const actionRequired = allItemsWithExtra.filter((i) => i.column === 'action_required').length;
    const waiting = allItemsWithExtra.filter((i) => i.column === 'waiting').length;

    // Thống kê trạng thái AI
    const aiCompleted = allItemsWithExtra.filter((i) => i.aiStatus === 'completed').length;
    const aiProcessing = allItemsWithExtra.filter((i) => i.aiStatus === 'processing').length;
    const aiNeedsReview = allItemsWithExtra.filter((i) => i.aiStatus === 'needs_review').length;
    const aiFailed = allItemsWithExtra.filter((i) => i.aiStatus === 'failed').length;

    return {
      total,
      overdue,
      today,
      dueTodayOnly,
      upcoming,
      actionRequired,
      waiting,
      aiCompleted,
      aiProcessing,
      aiNeedsReview,
      aiFailed,
    };
  }, [allItemsWithExtra]);

  // Bộ lọc tìm kiếm và Quick Filters
  const filteredItems = useMemo(() => {
    let result = allItemsWithExtra.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q) ||
          item.nextAction.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
        if (!match) return false;
      }

      // 2. Quick Filter
      switch (quickFilter) {
        case 'overdue':
          return item.deadlineType === 'overdue';
        case 'today':
          // Cần làm hôm nay: Quá hạn + Cần xử lý trong ngày
          return item.deadlineType === 'today' || item.deadlineType === 'overdue';
        case 'upcoming':
          return item.deadlineType === 'upcoming';
        case 'action_required':
          return item.column === 'action_required';
        case 'ai_completed':
          return item.aiStatus === 'completed';
        case 'ai_processing':
          return item.aiStatus === 'processing';
        case 'ai_needs_review':
          return item.aiStatus === 'needs_review';
        case 'ai_failed':
          return item.aiStatus === 'failed';
        case 'collab':
          return item.tags?.includes('Chờ phối hợp') || item.holder.name.includes('Phòng Quản lý');
        case 'waiting_sign':
          return item.tags?.includes('Chờ ký duyệt') || item.holder.role === 'Đang chờ';
        case 'handed_over':
          return item.column === 'handed_over';
        default:
          return true;
      }
    });

    // 3. Sắp xếp (Sort)
    return result.sort((a, b) => {
      if (sortBy === 'priority_deadline') {
        const order = { overdue: 0, today: 1, upcoming: 2, normal: 3 };
        if (order[a.deadlineType] !== order[b.deadlineType]) {
          return order[a.deadlineType] - order[b.deadlineType];
        }
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return 0;
      }
      if (sortBy === 'urgent_first') {
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return 0;
      }
      if (sortBy === 'deadline_asc') {
        const order = { overdue: 0, today: 1, upcoming: 2, normal: 3 };
        return order[a.deadlineType] - order[b.deadlineType];
      }
      if (sortBy === 'newest') {
        return b.timeReceived.localeCompare(a.timeReceived);
      }
      if (sortBy === 'oldest') {
        return a.timeReceived.localeCompare(b.timeReceived);
      }
      return 0;
    });
  }, [allItemsWithExtra, searchQuery, quickFilter, sortBy]);

  // Phân chia danh sách theo 4 cột Kanban
  const columnItems = useMemo(() => {
    return {
      action_required: filteredItems.filter((i) => i.column === 'action_required'),
      processing: filteredItems.filter((i) => i.column === 'processing'),
      waiting: filteredItems.filter((i) => i.column === 'waiting'),
      handed_over: filteredItems.filter((i) => i.column === 'handed_over'),
    };
  }, [filteredItems]);

  // Điều hướng khi nhấp vào thẻ hoặc nút CTA
  const handleItemClick = (item: WorkItem) => {
    // 1. Kiểm tra nếu là đơn / lượt nhận mà AI mới phân tích (cần kiểm tra và tiếp nhận)
    // Các trường hợp chuyển đến màn AI đã phân tích (Bàn phân tích & bóc tách AI):
    // - Trạng thái AI cần kiểm tra (needs_review) e.g. VV-2025-0430 (Độ tin cậy 68%)
    // - Nút CTA là review_ai ('Kiểm tra')
    // - AI đã phân tích (completed) ở giai đoạn cần tôi xử lý / tiếp nhận e.g. LN-56/2026-GOVEX
    // - Các lượt nhận chuyển tiếp bắt đầu bằng LN-
    // - Đang phân tích (processing) muốn xem tiến trình AI quét OCR
    // - Phân tích lỗi (failed) muốn kiểm tra lại
    const isAiAnalyzedForReview =
      item.aiStatus === 'needs_review' ||
      item.cta.actionType === 'review_ai' ||
      (item.aiStatus === 'completed' && (
        item.column === 'action_required' ||
        item.code.startsWith('LN') ||
        item.progress.currentStep <= 2 ||
        item.nextAction.toLowerCase().includes('kiểm tra') ||
        item.nextAction.toLowerCase().includes('tiếp nhận')
      )) ||
      item.code.startsWith('LN') ||
      item.nextAction.toLowerCase().includes('kiểm tra và xác nhận kết quả ai') ||
      item.nextAction.toLowerCase().includes('kiểm tra kết quả ai') ||
      item.id === 'LN-56/2026-GOVEX' ||
      item.id === 'VV-2025-0430' ||
      item.id === 'LN-2025-0819';

    if (isAiAnalyzedForReview || item.aiStatus === 'processing' || item.aiStatus === 'failed') {
      const targetLuotNhan: LuotNhan = {
        id: item.code,
        ngayNhan: item.timeReceived,
        nguoiNop: item.sender,
        hinhThuc: item.source,
        noiDung: item.title,
        donVi: item.holder?.department || 'Tổ Tiếp nhận hồ sơ',
        aiJob: item.aiStatus === 'completed' || item.aiStatus === 'needs_review' ? 5 : item.aiStatus === 'processing' ? 3 : 0,
      };

      onSelect(targetLuotNhan);
      onNav('ban-phan-tich');
      showToast(`Đang chuyển đến màn AI đã phân tích: ${item.code} (${item.title})`);
      return;
    }

    if (item.id === 'Đ-2025-0982') {
      onSelect(ALL_LUOT_NHAN[2] || LN19);
      onNav('ban-phan-tich');
      showToast(`Đang xem chi tiết phối hợp liên ngành: ${item.code}`);
      return;
    }

    // 2. Mở màn Tiếp nhận & Xử lý đơn chi tiết (cho các hồ sơ đang xử lý ở các bước sau hoặc đã bàn giao)
    const donObj: DonDetail = {
      id: item.id,
      code: item.code,
      title: item.title,
      luotNhanId: item.luotNhanId || item.id,
      nguoiNop: item.sender,
      ngayNhan: item.timeReceived,
      loaiDon: item.loaiDon || 'Đơn tiếp nhận hành chính',
      type: item.code.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
    };

    if (onSelectDon) {
      onSelectDon(donObj);
    }
    onNav('don-tiep-nhan');
    showToast(`Đang mở chi tiết hồ sơ: ${item.code}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-5 bg-[#f4f7fb] select-none font-body-md">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER CHÍNH & TÙY CHỌN TIẾP NHẬN                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-[#C62828] flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold text-slate-900 font-headline-md tracking-tight uppercase">
                CÔNG VIỆC CỦA TÔI
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-200 text-slate-700 font-label-technical">
                {kpiStats.total} việc
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              Bàn làm việc điều hành cá nhân • Giám sát AI Agent xử lý lượt nhận &amp; giải quyết hồ sơ công vụ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút chuyển đổi View: Kanban vs List */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'kanban'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              title="Xem dạng bảng Kanban 4 cột hành động"
            >
              <span className="material-symbols-outlined text-[15px]">grid_view</span>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              title="Xem dạng danh sách bảng dữ liệu"
            >
              <span className="material-symbols-outlined text-[15px]">view_list</span>
              <span>Danh sách</span>
            </button>
          </div>

          {/* Tùy chọn tạo tiếp nhận */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Tạo việc / Tiếp nhận</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-fade-in"
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div className="px-3 py-1 text-[10.5px] font-semibold text-slate-400 font-label-technical uppercase tracking-wider border-b border-slate-100 mb-1">
                  Khởi tạo tiếp nhận
                </div>
                <button
                  type="button"
                  className="w-full flex items-start gap-3 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                  onClick={() => {
                    setShowDropdown(false);
                    onNav('nhan-don-list');
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 leading-snug">Tạo lượt nhận hồ sơ</div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Tiếp nhận hồ sơ DVC hoặc giấy tờ trực tiếp</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="w-full flex items-start gap-3 px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  onClick={() => {
                    setShowDropdown(false);
                    onNav('nhan-don-them');
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">post_add</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 leading-snug">Lập đơn tiếp nhận mới</div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Đơn khiếu nại, tố cáo, kiến nghị trực tiếp</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DẢI KPI ĐẦU TRANG - TẬP TRUNG HÀNH ĐỘNG (CLICK ĐỂ FILTER)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        {/* KPI 1: Tổng công việc */}
        <button
          type="button"
          onClick={() => setQuickFilter('all')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${quickFilter === 'all'
            ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-medium opacity-80">
            <span>Tổng công việc</span>
            <span className="material-symbols-outlined text-[16px]">folder_managed</span>
          </div>
          <div className="text-2xl font-bold font-label-technical mt-2 tracking-tight">
            {String(kpiStats.total).padStart(2, '0')}
          </div>
          <span className="text-[10px] opacity-70 mt-1">Toàn bộ hồ sơ đang theo dõi</span>
        </button>

        {/* KPI 2 (GỘP): 🔴 Cần làm hôm nay (Gồm quá hạn & cần xử lý trong ngày) */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'today' ? 'all' : 'today')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${quickFilter === 'today'
            ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600/30 shadow-sm'
            : 'bg-rose-50/75 border-rose-200 hover:border-rose-300 text-rose-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Cần làm hôm nay
            </span>
            <span className="material-symbols-outlined text-[16px] text-rose-600">alarm</span>
          </div>
          <div className="text-2xl font-bold font-label-technical mt-2 text-rose-700 tracking-tight">
            {String(kpiStats.today).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-rose-700 font-medium mt-1">
            Gồm {kpiStats.overdue} quá hạn &amp; {kpiStats.dueTodayOnly} trong ngày
          </span>
        </button>

        {/* KPI 4: 🟡 Sắp quá hạn */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'upcoming' ? 'all' : 'upcoming')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${quickFilter === 'upcoming'
            ? 'bg-yellow-600 text-white border-yellow-600 ring-2 ring-yellow-600/30 shadow-sm'
            : 'bg-yellow-50/70 border-yellow-200 hover:border-yellow-300 text-yellow-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Sắp quá hạn
            </span>
            <span className="material-symbols-outlined text-[16px] text-yellow-600">schedule</span>
          </div>
          <div className="text-2xl font-bold font-label-technical mt-2 text-yellow-700 tracking-tight">
            {String(kpiStats.upcoming).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-yellow-700 font-medium mt-1">Hạn trong 24h – 48h tới</span>
        </button>

        {/* KPI 5: 👤 Cần tôi xử lý */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'action_required' ? 'all' : 'action_required')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${quickFilter === 'action_required'
            ? 'bg-[#004ac6] text-white border-[#004ac6] ring-2 ring-blue-600/30 shadow-sm'
            : 'bg-blue-50/70 border-blue-200 hover:border-blue-300 text-blue-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#004ac6]">person</span>
              Cần tôi xử lý
            </span>
            <span className="material-symbols-outlined text-[16px] text-blue-600">bolt</span>
          </div>
          <div className="text-2xl font-bold font-label-technical mt-2 text-[#004ac6] tracking-tight">
            {String(kpiStats.actionRequired).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-blue-600 font-medium mt-1">Hồ sơ chờ bạn trực tiếp làm</span>
        </button>

        {/* KPI 6: 🔵 Đang chờ người khác */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'waiting_sign' ? 'all' : 'waiting_sign')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${quickFilter === 'waiting_sign'
            ? 'bg-sky-700 text-white border-sky-700 ring-2 ring-sky-700/30 shadow-sm'
            : 'bg-sky-50/70 border-sky-200 hover:border-sky-300 text-sky-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-sky-600">hourglass_top</span>
              Đang chờ người khác
            </span>
            <span className="material-symbols-outlined text-[16px] text-sky-600">sync_alt</span>
          </div>
          <div className="text-2xl font-bold font-label-technical mt-2 text-sky-800 tracking-tight">
            {String(kpiStats.waiting).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-sky-700 font-medium mt-1">Chờ ký duyệt, phối hợp</span>
        </button>
      </div>


      {/* ========================================================================= */}
      {/* 3. TÌM KIẾM, QUICK FILTERS & SẮP XẾP                                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Ô Tìm kiếm */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
              search
            </span>
            <input
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all font-medium"
              placeholder="Tìm trong công việc của tôi (Mã đơn, tên hồ sơ, người nộp, việc cần làm)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Sắp xếp (Sort) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">sort</span>
              Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#004ac6] cursor-pointer"
            >
              <option value="priority_deadline">Ưu tiên xử lý (Quá hạn → Hôm nay → Sắp hạn)</option>
              <option value="deadline_asc">Hạn xử lý gần nhất</option>
              <option value="urgent_first">Khẩn cấp trước</option>
              <option value="newest">Mới tiếp nhận gần đây</option>
              <option value="oldest">Hồ sơ cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips bao gồm cả Deadline & Trạng thái AI */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Bộ lọc:</span>

          <button
            type="button"
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${quickFilter === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Tất cả ({kpiStats.total})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'today' ? 'all' : 'today')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${quickFilter === 'today'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            title="Bao gồm các việc đã quá hạn và các việc cần xử lý trong ngày"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Cần làm hôm nay ({kpiStats.today})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'action_required' ? 'all' : 'action_required')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'action_required'
              ? 'bg-[#004ac6] text-white shadow-2xs'
              : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
          >
            <span className="material-symbols-outlined text-[13px]">person</span>
            Cần tôi xử lý ({kpiStats.actionRequired})
          </button>

          {/* Dải lọc AI Status theo đúng yêu cầu */}
          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'ai_completed' ? 'all' : 'ai_completed')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'ai_completed'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            title="AI đã phân tích xong, sẵn sàng xử lý bước tiếp theo"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            🟢 AI đã xong ({kpiStats.aiCompleted})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'ai_processing' ? 'all' : 'ai_processing')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'ai_processing'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            title="AI đang bóc tách/phân tích dữ liệu, chờ hệ thống"
          >
            <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
            🟡 AI đang phân tích ({kpiStats.aiProcessing})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'ai_needs_review' ? 'all' : 'ai_needs_review')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'ai_needs_review'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
              }`}
            title="AI có kết quả nhưng confidence thấp hoặc cần user xác nhận"
          >
            <span className="material-symbols-outlined text-[12px]">warning</span>
            🟠 AI cần kiểm tra ({kpiStats.aiNeedsReview})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'ai_failed' ? 'all' : 'ai_failed')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'ai_failed'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
              }`}
            title="AI phân tích thất bại, cần xử lý thủ công hoặc thử lại"
          >
            <span className="material-symbols-outlined text-[12px]">error</span>
            🔴 AI lỗi ({kpiStats.aiFailed})
          </button>

          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'waiting_sign' ? 'all' : 'waiting_sign')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'waiting_sign'
              ? 'bg-sky-600 text-white shadow-2xs'
              : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
              }`}
          >
            <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
            Đang chờ ({kpiStats.waiting})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'handed_over' ? 'all' : 'handed_over')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${quickFilter === 'handed_over'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
          >
            <span className="material-symbols-outlined text-[13px]">outbox</span>
            Đã bàn giao
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHẾ ĐỘ HIỂN THỊ KANBAN (4 CỘT HÀNH ĐỘNG) HOẶC DANH SÁCH                */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
          {/* ──────────────── CỘT 1: 🔴 CẦN TÔI XỬ LÝ ──────────────── */}
          <div className="bg-rose-50/40 rounded-2xl p-3 border border-rose-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                <h2 className="text-[13px] font-bold text-rose-950 uppercase tracking-tight font-headline-md">
                  CẦN TÔI XỬ LÝ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.action_required.length).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[11px] text-rose-800/80 px-1 -mt-1 font-medium">
              Ưu tiên cao nhất • Cán bộ cần thực hiện trực tiếp
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.action_required.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-rose-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-emerald-500 mb-1">check_circle</span>
                  <div className="text-xs font-bold text-slate-700">Không có việc tồn đọng</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bạn đã xử lý hết các công việc thuộc nhóm ưu tiên này.</p>
                </div>
              ) : (
                columnItems.action_required.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onRetryAI={(e) => handleRetryAI(e, item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ──────────────── CỘT 2: 🟡 ĐANG XỬ LÝ ──────────────── */}
          <div className="bg-amber-50/40 rounded-2xl p-3 border border-amber-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="text-[13px] font-bold text-amber-950 uppercase tracking-tight font-headline-md">
                  ĐANG XỬ LÝ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.processing.length).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 px-1 -mt-1 font-medium">
              Đã tiếp nhận • Đang thực hiện các bước thẩm tra
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.processing.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-amber-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">inbox</span>
                  <div className="text-xs font-bold text-slate-700">Chưa có việc đang giải quyết</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tiếp nhận việc từ Cột 1 để chuyển sang bước xử lý.</p>
                </div>
              ) : (
                columnItems.processing.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onRetryAI={(e) => handleRetryAI(e, item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ──────────────── CỘT 3: 🔵 ĐANG CHỜ ──────────────── */}
          <div className="bg-sky-50/40 rounded-2xl p-3 border border-sky-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <h2 className="text-[13px] font-bold text-sky-950 uppercase tracking-tight font-headline-md">
                  ĐANG CHỜ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-700 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.waiting.length).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[11px] text-sky-800/80 px-1 -mt-1 font-medium">
              Chờ người khác • Chờ lãnh đạo duyệt, chờ phối hợp
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.waiting.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-sky-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">hourglass_disabled</span>
                  <div className="text-xs font-bold text-slate-700">Không có việc đang chờ</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Không có hồ sơ nào đang chờ phản hồi từ các bộ phận khác.</p>
                </div>
              ) : (
                columnItems.waiting.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onRetryAI={(e) => handleRetryAI(e, item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ──────────────── CỘT 4: 🟢 ĐÃ BÀN GIAO / THEO DÕI ──────────────── */}
          <div className="bg-emerald-50/40 rounded-2xl p-3 border border-emerald-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h2 className="text-[13px] font-bold text-emerald-950 uppercase tracking-tight font-headline-md">
                  ĐÃ BÀN GIAO / THEO DÕI
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.handed_over.length).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 px-1 -mt-1 font-medium">
              Đã chuyển đơn vị khác • Theo dõi tiến độ giải quyết
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.handed_over.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-emerald-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">task_alt</span>
                  <div className="text-xs font-bold text-slate-700">Chưa có việc bàn giao</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Các hồ sơ đã hoàn tất chuyển đơn vị sẽ hiển thị tại đây.</p>
                </div>
              ) : (
                columnItems.handed_over.map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onRetryAI={(e) => handleRetryAI(e, item)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 5. CHẾ ĐỘ HIỂN THỊ DANH SÁCH BẢNG (LIST VIEW)                             */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">Ưu tiên</th>
                  <th className="py-3 px-3 w-28">Mã hồ sơ</th>
                  <th className="py-3 px-4 min-w-[240px]">Tên hồ sơ / Công việc</th>
                  <th className="py-3 px-3 min-w-[130px]">Trạng thái AI</th>
                  <th className="py-3 px-3 min-w-[170px]">Người đang giữ việc</th>
                  <th className="py-3 px-3 w-36">Hạn xử lý</th>
                  <th className="py-3 px-3 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">search_off</span>
                      <div className="font-semibold text-slate-700">Không tìm thấy công việc nào phù hợp</div>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">Thử đổi từ khóa hoặc xóa bộ lọc nhanh.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3 text-center">
                        {item.priority === 'urgent' ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700" title="Khẩn cấp">
                            <span className="material-symbols-outlined text-[13px]">priority_high</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400" title="Bình thường">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 group-hover:text-[#004ac6]">
                        {item.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-[#004ac6] leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{item.sender}</span>
                          <span>•</span>
                          <span>{item.source}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <AIStatusBadge status={item.aiStatus} progress={item.aiProgress} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold text-[11.5px] leading-snug flex items-start gap-1.5">
                          <span className="text-[#C62828] text-xs">📌</span>
                          <span>{item.nextAction}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-400 font-medium">{item.holder.role}:</div>
                        <div className="font-semibold text-slate-800">{item.holder.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <DeadlineBadge type={item.deadlineType} text={item.deadlineText} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.aiStatus === 'failed' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleRetryAI(e, item)}
                              className="px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                              title="Thử lại AI"
                            >
                              Thử lại
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Thủ công
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${item.aiStatus === 'processing'
                              ? 'border border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                              : item.aiStatus === 'needs_review'
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : item.cta.variant === 'urgent'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : item.cta.variant === 'primary'
                                    ? 'bg-[#004ac6] hover:bg-[#003ea8] text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                          >
                            {item.aiStatus === 'processing' ? 'Xem hồ sơ' : item.cta.label}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// THÀNH PHẦN CON: TASK CARD THIẾT KẾ MỚI TẬP TRUNG HÀNH ĐỘNG & TRẠNG THÁI AI
// =========================================================================
interface TaskCardProps {
  item: WorkItem;
  onClick: () => void;
  onRetryAI: (e: React.MouseEvent) => void;
}

function TaskCard({ item, onClick, onRetryAI }: TaskCardProps) {
  const isUrgent = item.priority === 'urgent';
  const isOverdue = item.deadlineType === 'overdue';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2.5 relative overflow-hidden cursor-pointer group/card border ${isOverdue
        ? 'border-rose-300 hover:border-rose-500'
        : isUrgent
          ? 'border-amber-300 hover:border-blue-600'
          : 'border-slate-200 hover:border-blue-600'
        }`}
    >
      {/* Hàng 1: Entity Type Tag + Mã công việc + Priority + Giờ nhận */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-label-technical bg-slate-100 text-slate-700 border border-slate-200">
            {item.code.startsWith('LN')
              ? '[ LƯỢT NHẬN ]'
              : item.code.startsWith('VV')
                ? '[ VỤ VIỆC ]'
                : item.code.startsWith('KN')
                  ? '[ KHIẾU NẠI ]'
                  : '[ HỒ SƠ / ĐƠN ]'}
          </span>
          <span className="font-mono text-[11.5px] font-bold text-slate-800 group-hover/card:text-[#004ac6] transition-colors">
            {item.code}
          </span>
          {item.priority === 'urgent' && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
              KHẨN CẤP
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-slate-400 shrink-0">{item.timeReceived}</span>
      </div>

      {/* Hàng 2: Tên công việc / Tên đơn */}
      <h3 className="text-[13px] font-bold text-slate-900 leading-snug group-hover/card:text-[#004ac6] transition-colors">
        {item.title}
      </h3>

      {/* Hàng 3: Người gửi & Nguồn việc */}
      <div className="text-[11.5px] text-slate-500 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <span className="truncate">
          Người gửi: <strong className="text-slate-700 font-semibold">{item.sender}</strong>
        </span>
        <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
          {item.source}
        </span>
      </div>

      {/* Hàng 4: KHỐI TRẠNG THÁI AI (NẾU CÓ) THEO 4 TRƯỜNG HỢP NGHIỆP VỤ */}
      {item.aiStatus === 'completed' && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>🟢 AI đã phân tích</span>
        </div>
      )}

      {item.aiStatus === 'processing' && (
        <div className="flex flex-col gap-1.5 p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-amber-600 animate-spin">sync</span>
              <span>🟡 AI đang phân tích</span>
            </span>
            <span className="font-mono font-bold text-amber-800">{item.aiProgress || 75}%</span>
          </div>
          <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${item.aiProgress || 75}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-amber-900 font-medium">“Đang phân tích nội dung...”</span>
        </div>
      )}

      {item.aiStatus === 'failed' && (
        <div className="flex flex-col gap-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-rose-700">
            <span className="material-symbols-outlined text-[15px]">error</span>
            <span>🔴 AI phân tích không thành công</span>
          </div>
          {item.aiFailureReason && (
            <p className="text-[11px] text-rose-900 leading-snug">
              <strong>Lý do:</strong> {item.aiFailureReason}
            </p>
          )}
        </div>
      )}

      {item.aiStatus === 'needs_review' && (
        <div className="flex flex-col gap-1.5 p-2.5 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-orange-900">
            <span className="material-symbols-outlined text-[15px] text-orange-600">warning</span>
            <span>🟠 AI cần kiểm tra</span>
          </div>
          {item.aiReviewNote && (
            <p className="text-[11px] text-orange-950 leading-snug">
              {item.aiReviewNote}
            </p>
          )}
        </div>
      )}

      {/* Hàng 6: TIẾN ĐỘ WORKFLOW (MINI PROGRESS) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10.5px] text-slate-500">
          <span className="font-semibold text-slate-700">Tiến độ quy trình:</span>
          <span className="font-mono text-[10px] font-bold text-slate-600">
            Bước {item.progress.currentStep}/{item.progress.totalSteps} ({item.progress.stepName})
          </span>
        </div>
        <div className="flex items-center gap-1 w-full">
          {item.progress.steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < item.progress.currentStep;
            const isCurrent = stepNum === item.progress.currentStep;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col gap-0.5"
                title={`Bước ${stepNum}: ${step}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all ${isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'bg-[#004ac6]'
                      : 'bg-slate-200'
                    }`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hàng 7: Hạn xử lý & Số tài liệu */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">⏱</span>
          <DeadlineBadge type={item.deadlineType} text={item.deadlineText} />
        </div>

        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          <span className="text-slate-400">📎</span>
          <span>{item.docCount} tài liệu</span>
        </span>
      </div>

      {/* Hàng 8: Người giữ việc & Nút CTA theo ngữ cảnh AI */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="text-left text-[11px] truncate max-w-[135px]">
          <span className="text-slate-400">{item.holder.role}: </span>
          <span className="font-semibold text-slate-700">{item.holder.name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* TRƯỜNG HỢP 1: AI ĐÃ PHÂN TÍCH -> [ XỬ LÝ NGAY ] [...] */}
          {item.aiStatus === 'completed' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="py-1.5 px-3 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span>Xử lý ngay</span>
                <span className="material-symbols-outlined text-[13px] opacity-80">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer transition-colors"
                title="Tùy chọn khác"
              >
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: AI ĐANG PHÂN TÍCH -> KHÔNG HIỂN THỊ "XỬ LÝ NGAY", CHỈ HIỂN THỊ "XEM HỒ SƠ" */}
          {item.aiStatus === 'processing' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="py-1.5 px-3.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              <span>Xem hồ sơ</span>
            </button>
          )}

          {/* TRƯỜNG HỢP 3: AI THẤT BẠI -> 2 NÚT: [ XỬ LÝ THỦ CÔNG ] [ THỬ LẠI ] */}
          {item.aiStatus === 'failed' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Xử lý thủ công</span>
              </button>
              <button
                type="button"
                onClick={onRetryAI}
                className="py-1.5 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                title="Yêu cầu AI Agent quét và phân tích lại"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Thử lại</span>
              </button>
            </div>
          )}

          {/* TRƯỜNG HỢP 4: AI CẦN KIỂM TRA -> NÚT [ KIỂM TRA ] [...] */}
          {item.aiStatus === 'needs_review' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="py-1.5 px-3.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">checklist</span>
                <span>Kiểm tra</span>
                <span className="material-symbols-outlined text-[13px] opacity-80">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer transition-colors"
                title="Tùy chọn khác"
              >
                <span className="material-symbols-outlined text-[16px]">more_horiz</span>
              </button>
            </div>
          )}

          {/* TRƯỜNG HỢP CÁC HỒ SƠ KHÁC KHÔNG CÓ AI PROCESSING HOẶC TRUYỀN THỐNG */}
          {(!item.aiStatus || item.aiStatus === 'none') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer ${item.cta.variant === 'urgent'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : item.cta.variant === 'primary'
                  ? 'bg-[#004ac6] hover:bg-[#003ea8] text-white'
                  : item.cta.variant === 'outline'
                    ? 'border border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              {item.cta.variant === 'urgent' && (
                <span className="material-symbols-outlined text-[14px]">bolt</span>
              )}
              {item.cta.actionType === 'continue' && (
                <span className="material-symbols-outlined text-[14px]">edit_document</span>
              )}
              {item.cta.actionType === 'supplement' && (
                <span className="material-symbols-outlined text-[14px]">note_add</span>
              )}
              {item.cta.actionType === 'view_progress' && (
                <span className="material-symbols-outlined text-[14px]">visibility</span>
              )}
              {item.cta.actionType === 'view_doc' && (
                <span className="material-symbols-outlined text-[14px]">description</span>
              )}
              <span>{item.cta.label}</span>
              <span className="material-symbols-outlined text-[13px] opacity-80">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// THÀNH PHẦN CON: BADGE TRẠNG THÁI AI
// =========================================================================
function AIStatusBadge({ status, progress }: { status?: AIProcessingStatus; progress?: number }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        🟢 AI đã phân tích
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
        <span className="material-symbols-outlined text-[12px] text-amber-600 animate-spin">sync</span>
        🟡 AI đang phân tích ({progress || 75}%)
      </span>
    );
  }
  if (status === 'needs_review') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-orange-50 text-orange-950 border border-orange-200">
        <span className="material-symbols-outlined text-[12px] text-orange-600">warning</span>
        🟠 AI cần kiểm tra
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
        <span className="material-symbols-outlined text-[12px] text-rose-600">error</span>
        🔴 AI phân tích không thành công
      </span>
    );
  }
  return <span className="text-[11px] text-slate-400">—</span>;
}

// =========================================================================
// THÀNH PHẦN CON: DEADLINE BADGE NGỮ NGHĨA RÕ RÀNG
// =========================================================================
function DeadlineBadge({ type, text }: { type: string; text: string }) {
  if (type === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-700 border border-rose-200 font-label-technical">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
        {text}
      </span>
    );
  }
  if (type === 'today') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-200 font-label-technical">
        <span className="material-symbols-outlined text-[12px] text-amber-700">schedule</span>
        {text}
      </span>
    );
  }
  if (type === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-yellow-100 text-yellow-900 border border-yellow-200 font-label-technical">
        <span className="material-symbols-outlined text-[12px] text-yellow-700">hourglass_top</span>
        {text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 font-label-technical">
      <span className="material-symbols-outlined text-[12px] text-emerald-700">check</span>
      {text}
    </span>
  );
}