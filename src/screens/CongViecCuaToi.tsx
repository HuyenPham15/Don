import React, { useState, useMemo } from 'react';
import { LuotNhan, Screen, DonDetail } from "../types";
import { WorkItem, WorkItemColumn, AIProcessingStatus } from '../types/work';
import { INITIAL_WORK_ITEMS } from '../constants/workItems';
import { LN19, ALL_LUOT_NHAN } from '../constants';
import ChuyenTiepNhanModal, { ChuyenTiepNhanSubmitData } from '../components/modals/ChuyenTiepNhanModal';
import PhanCongModal, { PhanCongSubmitData } from '../components/modals/PhanCongModal';
import { TiepNhanDonItem } from '../constants/departments';

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

  // States cho Modal Tiếp nhận xử lý & Phân công xử lý từ Task Card
  const [selectedItemForAction, setSelectedItemForAction] = useState<WorkItem | null>(null);
  const [isChuyenModalOpen, setIsChuyenModalOpen] = useState(false);
  const [isPhanCongModalOpen, setIsPhanCongModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3500);
  };

  // 1. Nhấn Tiếp nhận xử lý: chuyển hồ sơ về phần "Tiếp nhận & xử lý" của cá nhân (Cột 2)
  const handleTiepNhanXuLyCaNhan = (item: WorkItem) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.id === item.id);
      const updatedItem: WorkItem = {
        ...item,
        column: 'processing',
        holder: {
          role: 'Đang xử lý',
          name: 'Tôi (Nguyễn Minh Anh)',
          department: 'Phòng Tiếp công dân & Xử lý đơn',
        },
        nextAction: item.progress?.stepName ? `${item.progress.stepName}` : 'Xử lý hồ sơ chuyên môn',
        cta: { label: 'Xử lý', actionType: 'continue', variant: 'primary' },
      };
      if (exists) {
        return prev.map((it) => (it.id === item.id ? updatedItem : it));
      }
      return [updatedItem, ...prev];
    });
    showToast(`✓ Đã tiếp nhận hồ sơ ${item.code} vào phần "Tiếp nhận & xử lý" của cá nhân!`);
  };

  // 2. Nhấn Bàn giao: mở Modal Chuyển tiếp nhận và xử lý để chuyển sang "Đã bàn giao / theo dõi" (Cột 4)
  const handleOpenBanGiao = (item: WorkItem) => {
    setSelectedItemForAction(item);
    setIsChuyenModalOpen(true);
  };

  // 3. Nhấn Phân công xử lý: mở Modal phân công cán bộ
  const handleOpenPhanCong = (item: WorkItem) => {
    setSelectedItemForAction(item);
    setIsPhanCongModalOpen(true);
  };

  // Xử lý submit Modal Chuyển tiếp nhận (Bàn giao sang đơn vị tiếp nhận -> Đã bàn giao / theo dõi)
  const handleChuyenTiepNhanSubmit = (data: ChuyenTiepNhanSubmitData) => {
    if (selectedItemForAction) {
      const isMe = data.canBoNhan?.isCurrentUser || data.canBoNhan?.name.includes('Tôi');

      setItems((prev) => {
        const exists = prev.some((it) => it.id === selectedItemForAction.id);
        const updatedItem: WorkItem = isMe
          ? {
            ...selectedItemForAction,
            column: 'processing',
            nguoiGiao: 'Trần Trọng Giáp (Trưởng phòng)',
            ngayDuocGiao: '18/09/2026',
            holder: {
              role: 'Đang xử lý',
              name: 'Tôi (Nguyễn Minh Anh)',
              department: data.donViTiepNhanName,
            },
            nextAction: `Tôi (Nguyễn Minh Anh) đang trực tiếp giải quyết`,
            cta: { label: 'Xử lý', actionType: 'continue', variant: 'primary' },
          }
          : {
            ...selectedItemForAction,
            column: 'handed_over',
            holder: {
              role: 'Đã bàn giao cho',
              name: data.hinhThuc === 'truc_tiep' && data.canBoNhan
                ? `${data.canBoNhan.name} (${data.donViTiepNhanName})`
                : data.donViTiepNhanName,
              department: data.donViTiepNhanName,
            },
            nextAction: data.hinhThuc === 'truc_tiep' && data.canBoNhan
              ? `Cán bộ ${data.canBoNhan.name} đang thụ lý giải quyết`
              : `Chờ Lãnh đạo ${data.donViTiepNhanName} phân công cán bộ xử lý`,
            cta: { label: 'Xem tiến độ', actionType: 'view_progress', variant: 'neutral' },
          };

        if (exists) {
          return prev.map((it) => (it.id === selectedItemForAction.id ? updatedItem : it));
        }
        return [updatedItem, ...prev];
      });

      if (isMe) {
        showToast(`✓ Đã tiếp nhận hồ sơ ${selectedItemForAction.code} vào phần "Tiếp nhận & xử lý" của cá nhân!`);
      } else {
        showToast(`✓ Đã bàn giao hồ sơ ${selectedItemForAction.code} sang ${data.donViTiepNhanName}, chuyển đến mục "Đã bàn giao / Theo dõi"!`);
      }
    }
    setIsChuyenModalOpen(false);
    setSelectedItemForAction(null);
  };

  const handlePhanCongSubmit = (data: PhanCongSubmitData) => {
    if (selectedItemForAction) {
      const isMe = data.canBo?.isCurrentUser || data.canBo?.name.includes('Tôi');
      setItems((prev) => {
        const exists = prev.some((it) => it.id === selectedItemForAction.id);
        const updatedItem: WorkItem = {
          ...selectedItemForAction,
          column: isMe ? 'processing' : 'waiting',
          nguoiGiao: 'Trần Trọng Giáp (Trưởng phòng)',
          ngayDuocGiao: '18/09/2026',
          holder: {
            role: isMe ? 'Đang xử lý' : 'Đang chờ',
            name: data.canBo.name,
            department: data.canBo.departmentName || 'Phòng Tiếp công dân & Xử lý đơn',
          },
          nextAction: isMe
            ? `Tôi (${data.canBo.name}) đang trực tiếp giải quyết`
            : `Cán bộ ${data.canBo.name} (${data.canBo.role}) giải quyết theo thẩm quyền`,
          cta: isMe
            ? { label: 'Xử lý', actionType: 'continue', variant: 'primary' }
            : { label: 'Xem tiến độ', actionType: 'view_progress', variant: 'outline' },
        };

        if (exists) {
          return prev.map((it) => (it.id === selectedItemForAction.id ? updatedItem : it));
        }
        return [updatedItem, ...prev];
      });
      showToast(`✓ Đã phân công xử lý hồ sơ ${selectedItemForAction.code} cho ${data.canBo.name} (${data.canBo.role})`);
    }
    setIsPhanCongModalOpen(false);
    setSelectedItemForAction(null);
  };

  const itemsToAssign: TiepNhanDonItem[] = useMemo(() => {
    if (!selectedItemForAction) return [];
    return [
      {
        id: selectedItemForAction.id,
        code: selectedItemForAction.code,
        luotNhanId: selectedItemForAction.luotNhanId || selectedItemForAction.code,
        nguoiNop: selectedItemForAction.sender,
        loaiDon: selectedItemForAction.loaiDon || 'Hồ sơ / Đơn',
        ngayNhan: selectedItemForAction.timeReceived || '18/09/2026',
        ngayChuyenDen: '18/09/2026',
        donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
        donViTiepNhanId: 'tiep-dan',
        donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
        hanXuLy: selectedItemForAction.deadlineText || 'Còn 2 ngày',
        hanXuLyFull: selectedItemForAction.deadlineFull || 'Còn 2 ngày',
        trangThai: 'cho_phan_cong',
        noiDungTomTat: selectedItemForAction.title,
      },
    ];
  }, [selectedItemForAction]);

  const donInfoForChuyen = useMemo(() => {
    if (!selectedItemForAction) {
      return {
        code: '',
        loaiDon: '',
        nguoiNop: '',
        ngayNhan: '',
        donViHienTai: '',
        noiDungTomTat: '',
      };
    }
    return {
      code: selectedItemForAction.code,
      loaiDon: selectedItemForAction.loaiDon || 'Hồ sơ / Đơn',
      nguoiNop: selectedItemForAction.sender,
      ngayNhan: selectedItemForAction.timeReceived || '18/09/2026',
      donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
      noiDungTomTat: selectedItemForAction.title,
    };
  }, [selectedItemForAction]);

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
          source: 'Tiếp nhận & phân công',
          timeReceived: ad.ngayNhan || 'Vừa xong',
          priority: 'normal',
          deadlineType: 'today',
          deadlineText: 'Hôm nay - 17:00',
          deadlineFull: 'Hôm nay - 17:00',
          column: 'processing',
          nextAction: 'Thực hiện thẩm tra & giải quyết đơn theo thẩm quyền',
          holder: {
            role: 'Đang xử lý',
            name: 'Tôi (Nguyễn Minh Anh)',
            department: 'Phòng Tiếp công dân & Xử lý đơn',
          },
          progress: {
            currentStep: 2,
            totalSteps: 5,
            stepName: 'Thụ lý giải quyết',
            steps: ['Tiếp nhận', 'Phân loại', 'Thẩm tra', 'Trình ký', 'Trả kết quả'],
          },
          docCount: 5,
          cta: {
            label: 'Mở xử lý',
            actionType: 'continue',
            variant: 'primary',
          },
          category: 'Tiếp nhận & xử lý',
          tags: ['Đã phân công', 'Đang xử lý'],
          loaiDon: ad.loaiDon || 'Đơn tiếp nhận hành chính',
          luotNhanId: ad.luotNhanId,
          nguoiGiao: 'Trần Trọng Giáp (Trưởng phòng)',
          ngayDuocGiao: '16/09/2026',
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
              <span className={`w-2 h-2 rounded-full ${quickFilter === 'today' ? 'bg-white' : 'bg-rose-500'} animate-pulse`}></span>
              <span>Cần làm hôm nay</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${quickFilter === 'today' ? 'text-white' : 'text-rose-600'}`}>alarm</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${quickFilter === 'today' ? 'text-white' : 'text-rose-700'}`}>
            {String(kpiStats.today).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${quickFilter === 'today' ? 'text-white/90' : 'text-rose-700'}`}>
            Gồm {kpiStats.overdue} quá hạn &amp; {kpiStats.dueTodayOnly} trong ngày
          </span>
        </button>

        {/* KPI 4: 🟡 Sắp quá hạn */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'upcoming' ? 'all' : 'upcoming')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${quickFilter === 'upcoming'
            ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/30 shadow-sm'
            : 'bg-amber-50/70 border-amber-200 hover:border-amber-300 text-amber-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${quickFilter === 'upcoming' ? 'bg-white' : 'bg-amber-500'}`}></span>
              <span>Sắp quá hạn</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${quickFilter === 'upcoming' ? 'text-white' : 'text-amber-600'}`}>schedule</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${quickFilter === 'upcoming' ? 'text-white' : 'text-amber-700'}`}>
            {String(kpiStats.upcoming).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${quickFilter === 'upcoming' ? 'text-white/90' : 'text-amber-700'}`}>Hạn trong 24h – 48h tới</span>
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
              <span className={`material-symbols-outlined text-[15px] ${quickFilter === 'action_required' ? 'text-white' : 'text-[#004ac6]'}`}>person</span>
              <span>Cần tôi xử lý</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${quickFilter === 'action_required' ? 'text-white' : 'text-blue-600'}`}>bolt</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${quickFilter === 'action_required' ? 'text-white' : 'text-[#004ac6]'}`}>
            {String(kpiStats.actionRequired).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${quickFilter === 'action_required' ? 'text-white/90' : 'text-blue-600'}`}>Hồ sơ chờ bạn trực tiếp làm</span>
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
              <span className={`material-symbols-outlined text-[15px] ${quickFilter === 'waiting_sign' ? 'text-white' : 'text-sky-600'}`}>hourglass_top</span>
              <span>Đang chờ người khác</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${quickFilter === 'waiting_sign' ? 'text-white' : 'text-sky-600'}`}>sync_alt</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${quickFilter === 'waiting_sign' ? 'text-white' : 'text-sky-800'}`}>
            {String(kpiStats.waiting).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${quickFilter === 'waiting_sign' ? 'text-white/90' : 'text-sky-700'}`}>Chờ ký duyệt, phối hợp</span>
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

          {/* Bộ lọc nhanh AI đã phân tích */}
          <span className="text-slate-300">|</span>

          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'ai_completed' ? 'all' : 'ai_completed')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${quickFilter === 'ai_completed'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>AI đã phân tích ({kpiStats.aiCompleted})</span>
          </button>

          {/* Bộ lọc kiểm tra nghiệp vụ nếu có hồ sơ cần rà soát */}
          {(kpiStats.aiNeedsReview > 0 || kpiStats.aiFailed > 0) && (
            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'ai_needs_review' ? 'all' : 'ai_needs_review')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${quickFilter === 'ai_needs_review'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              title="Hồ sơ cần cán bộ kiểm tra, rà soát lại thông tin"
            >
              <span className="material-symbols-outlined text-[13px]">warning</span>
              <span>AI cần kiểm tra ({kpiStats.aiNeedsReview + kpiStats.aiFailed})</span>
            </button>
          )}

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
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
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
                    onTiepNhanXuLy={handleTiepNhanXuLyCaNhan}
                    onBanGiao={handleOpenBanGiao}
                    onPhanCong={handleOpenPhanCong}
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-amber-50/40 rounded-2xl p-3 border border-amber-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="text-[13px] font-bold text-amber-950 uppercase tracking-tight font-headline-md">
                  TIẾP NHẬN &amp; XỬ LÝ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.processing.length).padStart(2, '0')}
              </span>
            </div>


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
                    onTiepNhanXuLy={handleTiepNhanXuLyCaNhan}
                    onBanGiao={handleOpenBanGiao}
                    onPhanCong={handleOpenPhanCong}
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
                    onTiepNhanXuLy={handleTiepNhanXuLyCaNhan}
                    onBanGiao={handleOpenBanGiao}
                    onPhanCong={handleOpenPhanCong}
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
                    onTiepNhanXuLy={handleTiepNhanXuLyCaNhan}
                    onBanGiao={handleOpenBanGiao}
                    onPhanCong={handleOpenPhanCong}
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

      {/* ========================================================================= */}
      {/* 6. MODAL TIẾP NHẬN XỬ LÝ & PHÂN CÔNG XỬ LÝ TỪ TASK CARD                  */}
      {/* ========================================================================= */}
      {selectedItemForAction && (
        <ChuyenTiepNhanModal
          isOpen={isChuyenModalOpen}
          onClose={() => {
            setIsChuyenModalOpen(false);
            setSelectedItemForAction(null);
          }}
          onSubmit={handleChuyenTiepNhanSubmit}
          donInfo={donInfoForChuyen}
        />
      )}

      {selectedItemForAction && (
        <PhanCongModal
          isOpen={isPhanCongModalOpen}
          onClose={() => {
            setIsPhanCongModalOpen(false);
            setSelectedItemForAction(null);
          }}
          onSubmit={handlePhanCongSubmit}
          itemsToAssign={itemsToAssign}
          currentDepartmentId="tiep-dan"
          departmentName="Phòng Tiếp công dân & Xử lý đơn"
        />
      )}
    </div>
  );
}

// =========================================================================
// THÀNH PHẦN CON: CÁC HÀM TIỆN ÍCH CHO TASK CARD REDESIGN (QUY TẮC 3-5 GIÂY)
// =========================================================================

function getTaskTypeBadge(item: WorkItem): string {
  const code = item.code?.toUpperCase() || '';
  if (code.startsWith('VV')) return 'VỤ VIỆC';
  if (code.startsWith('LN')) return 'LƯỢT NHẬN';
  if (code.startsWith('KN')) return 'KHIẾU NẠI';
  if (code.startsWith('TG')) return 'TỐ GIÁC';
  if (item.loaiDon?.toLowerCase().includes('vụ việc')) return 'VỤ VIỆC';
  if (item.loaiDon?.toLowerCase().includes('lượt nhận')) return 'LƯỢT NHẬN';
  return 'HỒ SƠ / ĐƠN';
}

function getViecCanLam(item: WorkItem): string {
  // 1. Khớp các mẫu card đặc thù theo chuẩn thiết kế
  if (item.id === 'VV-2025-0430') return 'Thẩm định hiện trạng';
  if (item.id === 'Đ-2025-0105') return 'Thẩm tra mã ngành';
  if (item.id === 'VV-2025-0612') return 'Trình lãnh đạo ký';

  // 2. Theo trạng thái AI
  if (item.aiStatus === 'failed') return 'Xử lý và phân loại thủ công';
  if (item.aiStatus === 'needs_review') return 'Kiểm tra và xác minh hồ sơ';
  if (item.aiStatus === 'processing') return 'Chờ AI bóc tách thông tin';

  // 3. Phân theo tiến độ / tên bước
  if (item.progress?.stepName) {
    const s = item.progress.stepName.toLowerCase();
    if (s.includes('trình') || s.includes('ký')) return 'Trình lãnh đạo ký';
    if (s.includes('thẩm định')) return 'Thẩm định hiện trạng';
    if (s.includes('thẩm tra')) return 'Thẩm tra mã ngành';
    if (s.includes('phân loại')) return 'Phân loại đơn';
    if (s.includes('tiếp nhận')) return 'Tiếp nhận lượt nhận';
    if (s.includes('chứng thực')) return 'Đối chiếu chứng thực và trả kết quả';
    if (s.includes('thu thập')) return 'Thu thập và xác minh chứng cứ';
    if (s.includes('lấy ý kiến') || s.includes('phối hợp')) return 'Theo dõi ý kiến thẩm định phối hợp';
    if (s.includes('xác minh')) return 'Xác minh thông tin';
    if (s.includes('bổ sung')) return 'Bổ sung hồ sơ';
    if (s.includes('nhận kết quả') || s.includes('trả kết quả')) return 'Bàn giao trả kết quả cho công dân';
  }

  // 4. Trích xuất ngắn gọn từ nextAction nếu có
  if (item.nextAction) {
    if (item.nextAction.length <= 35) return item.nextAction;
    const short = item.nextAction.split(' - ')[0].split(' (')[0];
    if (short.length <= 35) return short;
  }

  return item.progress?.stepName || 'Xử lý hồ sơ';
}

function getDeadlineInfo(item: WorkItem) {
  if (item.deadlineType === 'overdue') {
    return {
      icon: '🔴',
      text: item.deadlineText?.includes('Quá hạn') ? item.deadlineText : `Quá hạn ${item.deadlineText || '2 giờ'}`,
      colorClass: 'text-rose-700 font-bold',
    };
  }
  if (item.deadlineType === 'today' || item.deadlineType === 'upcoming') {
    return {
      icon: '🟠',
      text: item.deadlineText || 'Sắp quá hạn',
      colorClass: 'text-amber-700 font-bold',
    };
  }
  return {
    icon: '🟢',
    text: item.deadlineText || 'Còn hạn',
    colorClass: 'text-emerald-700 font-bold',
  };
}

function getPrimaryCta(item: WorkItem): {
  label: string;
  icon?: string;
  className: string;
} {
  // 1. Các mẫu theo quy chuẩn yêu cầu
  if (item.id === 'VV-2025-0430') {
    return {
      label: 'Kiểm tra',
      icon: 'checklist',
      className: 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs',
    };
  }
  if (item.id === 'Đ-2025-0105') {
    return {
      label: 'Xử lý ngay',
      icon: 'bolt',
      className: 'bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-2xs',
    };
  }
  if (item.id === 'VV-2025-0612') {
    return {
      label: 'Xem hồ sơ',
      icon: 'description',
      className: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs',
    };
  }

  // 2. Theo trạng thái AI
  if (item.aiStatus === 'needs_review') {
    return {
      label: 'Kiểm tra',
      icon: 'checklist',
      className: 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs',
    };
  }
  if (item.aiStatus === 'failed') {
    return {
      label: 'Xử lý thủ công',
      icon: 'edit',
      className: 'bg-rose-700 hover:bg-rose-800 text-white shadow-2xs',
    };
  }
  if (item.aiStatus === 'processing') {
    return {
      label: 'Xem hồ sơ',
      icon: 'visibility',
      className: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs',
    };
  }

  // 3. Quá hạn -> Xử lý ngay
  if (item.deadlineType === 'overdue') {
    return {
      label: 'Xử lý ngay',
      icon: 'bolt',
      className: 'bg-rose-700 hover:bg-rose-800 text-white shadow-2xs',
    };
  }

  // 4. Theo cột Kanban & Loại việc
  if (item.column === 'action_required') {
    if (item.code.startsWith('LN')) {
      return {
        label: 'Tiếp nhận',
        icon: 'move_to_inbox',
        className: 'bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-2xs',
      };
    }
    return {
      label: 'Xử lý ngay',
      icon: 'bolt',
      className: 'bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-2xs',
    };
  }

  if (item.column === 'processing') {
    return {
      label: 'Xử lý',
      icon: 'task_alt',
      className: 'bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-2xs',
    };
  }

  if (item.column === 'waiting') {
    if (item.progress?.stepName?.toLowerCase().includes('ký')) {
      return {
        label: 'Xem hồ sơ',
        icon: 'description',
        className: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs',
      };
    }
    return {
      label: 'Xem tiến độ',
      icon: 'visibility',
      className: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs',
    };
  }

  if (item.column === 'handed_over') {
    return {
      label: 'Xem tiến độ',
      icon: 'visibility',
      className: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs',
    };
  }

  return {
    label: 'Xử lý',
    icon: 'task_alt',
    className: 'bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-2xs',
  };
}

// =========================================================================
// THÀNH PHẦN CON: TASK CARD THIẾT KẾ MỚI TẬP TRUNG HÀNH ĐỘNG (QUY TẮC 3-5s)
// =========================================================================
interface TaskCardProps {
  item: WorkItem;
  onClick: () => void;
  onRetryAI: (e: React.MouseEvent) => void;
  onTiepNhanXuLy?: (item: WorkItem) => void;
  onBanGiao?: (item: WorkItem) => void;
  onPhanCong?: (item: WorkItem) => void;
}

function TaskCard({ item, onClick, onRetryAI, onTiepNhanXuLy, onBanGiao, onPhanCong }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isUrgent = item.priority === 'urgent';
  const isOverdue = item.deadlineType === 'overdue';
  const taskType = getTaskTypeBadge(item);
  const viecCanLam = getViecCanLam(item);
  const deadline = getDeadlineInfo(item);
  const cta = getPrimaryCta(item);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2 relative cursor-pointer group/card border ${isOverdue
        ? 'border-rose-300 hover:border-rose-500'
        : isUrgent
          ? 'border-amber-200 hover:border-[#C62828]'
          : 'border-slate-200 hover:border-[#C62828]'
        }`}
    >
      {/* DÒNG 1: [PRIORITY] [TASK TYPE] [MÃ HỒ SƠ] + (BADGE AI CẦN KIỂM TRA) */}
      <div className="flex items-center gap-1.5 text-xs flex-wrap">
        {/* PRIORITY */}
        {isUrgent ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 tracking-wider uppercase shrink-0">
            KHẨN
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 tracking-wider uppercase shrink-0">
            BÌNH THƯỜNG
          </span>
        )}

        {/* TASK TYPE */}
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200 shrink-0 font-label-technical">
          {taskType}
        </span>

        {/* MÃ HỒ SƠ */}
        <span className="font-mono text-[11px] font-bold text-slate-800 group-hover/card:text-[#C62828] transition-colors truncate">
          {item.code}
        </span>

        {/* AI BADGE NHỎ (NẾU CẦN KIỂM TRA) */}
        {item.aiStatus === 'needs_review' && (
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
            <span className="material-symbols-outlined text-[11px] text-amber-600">warning</span>
            <span>AI cần kiểm tra</span>
          </span>
        )}
      </div>

      {/* DÒNG 2: TÊN CÔNG VIỆC / TÊN HỒ SƠ (MAX 2 DÒNG) */}
      <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover/card:text-[#C62828] transition-colors">
        {item.title}
      </h3>

      {/* DÒNG 3: NGƯỜI GỬI */}
      <div className="text-[11.5px] text-slate-500 truncate">
        <span>Người gửi: </span>
        <strong className="text-slate-800 font-semibold">{item.sender}</strong>
      </div>

      {/* DÒNG 4 – QUAN TRỌNG NHẤT: VIỆC CẦN LÀM (BLOCK NỔI BẬT) */}
      {/* <div className="bg-slate-50/90 rounded-lg p-2 border-l-[3px] border-[#C62828] text-xs">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
          VIỆC CẦN LÀM
        </div>
        <div className="font-bold text-slate-900 leading-tight">
          {viecCanLam}
        </div>
      </div> */}

      {/* DÒNG 5: BƯỚC HIỆN TẠI (TEXT NGẮN + MINI PROGRESS BAR MẢNH) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span className="text-slate-400">Bước hiện tại:</span>
          <span className="font-semibold text-slate-800">
            {item.progress.currentStep}/{item.progress.totalSteps} · {item.progress.stepName}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div
            className="bg-[#C62828] h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(10, (item.progress.currentStep / item.progress.totalSteps) * 100))}%` }}
          />
        </div>
      </div>

      {/* DÒNG 6: DEADLINE & SỐ TÀI LIỆU */}
      <div className="flex items-center justify-between text-[11.5px] pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Hạn xử lý:</span>
          <span className={`inline-flex items-center gap-1 font-bold ${deadline.colorClass}`}>
            <span>{deadline.text}</span>
          </span>
        </div>

        {item.docCount ? (
          <span className="text-[10.5px] text-slate-400 font-medium shrink-0">
            {item.docCount} tài liệu
          </span>
        ) : null}
      </div>

      {/* FOOTER: [CTA CHÍNH] [...] */}
      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${cta.className}`}
        >
          {cta.icon && <span className="material-symbols-outlined text-[14px]">{cta.icon}</span>}
          <span>{cta.label}</span>
        </button>

        {/* NÚT [...] MỞ OPTION TIẾP NHẬN XỬ LÝ & PHÂN CÔNG XỬ LÝ */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className={`p-1.5 px-2 rounded-lg border transition-all shrink-0 flex items-center justify-center cursor-pointer ${showMenu
              ? 'bg-slate-200 border-slate-400 text-slate-800 ring-2 ring-slate-300'
              : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            title="Tùy chọn thao tác"
          >
            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
          </button>

          {showMenu && (
            <>
              {/* Lớp nền trong suốt đóng popup khi click ra ngoài */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />

              {/* Menu dropdown mở lên phía trên */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span>Tùy chọn thao tác</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">#{item.code}</span>
                </div>

                {/* Option 1: Tiếp nhận xử lý (Chuyển về cá nhân) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onTiepNhanXuLy?.(item);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[17px]">
                      task_alt
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center justify-between">
                      <span>Tiếp nhận xử lý</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">Cá nhân</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Chuyển về tiếp nhận &amp; xử lý của cá nhân</div>
                  </div>
                </button>

                {/* Option 2: Bàn giao xử lý (Chuyển sang Đã bàn giao / theo dõi) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onBanGiao?.(item);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#C62828] flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#C62828] flex items-center justify-center shrink-0 group-hover:bg-[#C62828] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[17px]">
                      outbox
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-[#C62828] flex items-center justify-between">
                      <span>Bàn giao xử lý</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-medium">Bàn giao</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Chuyển đến đã bàn giao / theo dõi</div>
                  </div>
                </button>

                {/* Option 3: Phân công xử lý */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onPhanCong?.(item);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[17px]">
                      assignment_ind
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700">Phân công xử lý</div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Giao cán bộ chuyên môn phụ trách</div>
                  </div>
                </button>
              </div>
            </>
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-label-technical">
        <span>🔴</span>
        <span>{text?.includes('Quá hạn') ? text : `Quá hạn ${text || '2 giờ'}`}</span>
      </span>
    );
  }
  if (type === 'today' || type === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-label-technical">
        <span>🟠</span>
        <span>{text}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-technical">
      <span>🟢</span>
      <span>{text}</span>
    </span>
  );
}