import React, { useState, useMemo, useEffect } from 'react';
import { LuotNhan, Screen, DonDetail } from "../types";
import {
  WorkItem,
  WorkItemColumn,
  AIProcessingStatus,
  WorkItemSourceType,
  WorkItemSubStatus,
  WorkItemDeadlineType,
  WorkItemPriority,
} from '../types/work';
import { INITIAL_WORK_ITEMS } from '../constants/workItems';
import { LN19, ALL_LUOT_NHAN } from '../constants';
import ChuyenTiepNhanModal, { ChuyenTiepNhanSubmitData } from '../components/modals/ChuyenTiepNhanModal';
import PhanCongModal, { PhanCongSubmitData } from '../components/modals/PhanCongModal';
import BanGiaoDonModal, { BanGiaoDonSubmitData } from '../components/modals/BanGiaoDonModal';
import TraLaiDonModal, { TraLaiDonSubmitData } from '../components/modals/TraLaiDonModal';
import { TiepNhanDonItem, DEPARTMENTS } from '../constants/departments';
import { SigningDocument, CurrentUserAccount, DEMO_ACCOUNTS } from '../types/signing';
export type CongViecTab = 'tasks' | 'all';
export type ViewMode = 'kanban' | 'list' | 'completed';
export type FilterStatus = WorkItemColumn | 'all';
export type FilterSource = WorkItemSourceType | 'all';
export type FilterDeadline = WorkItemDeadlineType | 'all';
export type FilterAI = AIProcessingStatus | 'all';
export type FilterHandler = 'all' | 'me' | 'others';

interface CongViecCuaToiProps {
  onSelect: (ln: LuotNhan) => void;
  onNav: (s: Screen) => void;
  extraCard: LuotNhan | null;
  onSelectDon?: (don: DonDetail) => void;
  acceptedDons?: DonDetail[];
  luotNhanList?: LuotNhan[];
  tiepNhanItems?: TiepNhanDonItem[];
  onBanGiaoDone?: (luotNhanId?: string, donViName?: string, canBoName?: string, lyDo?: string) => void;
  currentAccount?: CurrentUserAccount;
  onSwitchAccount?: (account: CurrentUserAccount) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: (docs: SigningDocument[]) => void;
  onSelectSigningDoc?: (docId: string) => void;
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

const SUB_STATUS_LABELS: Record<string, string> = {
  moi_giao: 'Mới được giao',
  chua_xu_ly: 'Chưa xử lý',
  can_kiem_tra_ai: 'Cần kiểm tra AI',
  can_bo_sung: 'Cần bổ sung hồ sơ',
  bi_tra_lai: 'Bị trả lại',
  can_xac_nhan: 'Cần xác nhận',
  dang_xu_ly: 'Đang trực tiếp xử lý',
  cho_ky: 'Chờ ký duyệt',
  cho_phe_duyet: 'Chờ phê duyệt',
  cho_phoi_hop: 'Chờ phối hợp',
  cho_he_thong: 'Chờ hệ thống',
  da_ban_giao: 'Đã bàn giao',
  khong_thu_ly: 'Không thụ lý',
  yeu_cau_bo_sung: 'Yêu cầu bổ sung tài liệu',
};

export default function CongViecCuaToi({
  onSelect,
  onNav,
  extraCard,
  onSelectDon,
  acceptedDons = [],
  luotNhanList = [],
  tiepNhanItems = [],
  onBanGiaoDone,
  currentAccount = DEMO_ACCOUNTS[0],
  onSwitchAccount,
  signingDocuments = [],
  onUpdateSigningDocuments,
  onSelectSigningDoc,
}: CongViecCuaToiProps) {
  const isLeader = currentAccount.role === 'lanh_dao';

  const docs = signingDocuments;
  const signingCounts = useMemo(() => {
    const choTrinh = docs.filter((d) => d.status === 'cho_trinh' || d.status === 'nhap').length;
    const daTrinh = docs.filter((d) => d.status === 'da_trinh').length;
    const yeuCauSua = docs.filter((d) => d.status === 'yeu_cau_chinh_sua').length;
    const daKy = docs.filter((d) => d.status === 'da_ky').length;
    const khan = docs.filter((d) => d.status === 'da_trinh' && (d.mucDoUuTien === 'khan' || d.mucDoUuTien === 'hoa_toc')).length;
    return { choTrinh, daTrinh, yeuCauSua, daKy, khan };
  }, [docs]);

  const [items, setItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Bộ lọc đa chiều & Bộ lọc nhanh
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [filterDeadline, setFilterDeadline] = useState<FilterDeadline>('all');
  const [filterAI, setFilterAI] = useState<FilterAI>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterHandler, setFilterHandler] = useState<FilterHandler>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority_deadline');

  // Trạng thái cho Bộ lọc nâng cao
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [filterLoaiCongViec, setFilterLoaiCongViec] = useState<string>('all');
  const [filterLoaiHoSo, setFilterLoaiHoSo] = useState<string>('all');
  const [filterNguoiGiao, setFilterNguoiGiao] = useState<string>('all');
  const [filterSubStatus, setFilterSubStatus] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterDeadlineFrom, setFilterDeadlineFrom] = useState<string>('');
  const [filterDeadlineTo, setFilterDeadlineTo] = useState<string>('');

  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // States cho Modal Bàn giao & Phân công & Trả lại đơn
  const [selectedItemForAction, setSelectedItemForAction] = useState<WorkItem | null>(null);
  const [isChuyenModalOpen, setIsChuyenModalOpen] = useState(false);
  const [isPhanCongModalOpen, setIsPhanCongModalOpen] = useState(false);
  const [isBanGiaoModalOpen, setIsBanGiaoModalOpen] = useState(false);
  const [isTraLaiModalOpen, setIsTraLaiModalOpen] = useState(false);

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
        subStatus: 'dang_xu_ly',
        holder: {
          role: 'Đang xử lý',
          name: 'Tôi (Nguyễn Minh Anh)',
          department: 'Phòng Tiếp công dân & Xử lý đơn',
        },
        actionTitle: item.actionTitle || 'Đang thụ lý giải quyết',
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

  // 2. Nhấn Bàn giao: mở Modal Chuyển tiếp nhận và xử lý để chuyển sang "Đã bàn giao"
  const handleOpenBanGiao = (item: WorkItem) => {
    setSelectedItemForAction(item);
    setIsChuyenModalOpen(true);
  };

  // Mở Popup Bàn giao đơn chuẩn (STEP-03C)
  const handleOpenBanGiaoDon = (item: WorkItem) => {
    setSelectedItemForAction(item);
    setIsBanGiaoModalOpen(true);
  };

  // Mở Popup Trả lại đơn chuẩn (STEP-03D)
  const handleOpenTraLaiDon = (item: WorkItem) => {
    setSelectedItemForAction(item);
    setIsTraLaiModalOpen(true);
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
            subStatus: 'dang_xu_ly',
            nguoiGiao: 'Trần Trọng Giáp (Trưởng phòng)',
            ngayDuocGiao: '23/09/2026',
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
            subStatus: 'da_ban_giao',
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

      const donObj: DonDetail = {
        id: selectedItemForAction.id,
        code: selectedItemForAction.code,
        title: selectedItemForAction.title,
        luotNhanId: selectedItemForAction.luotNhanId || selectedItemForAction.id,
        nguoiNop: selectedItemForAction.sender,
        ngayNhan: selectedItemForAction.timeReceived,
        loaiDon: selectedItemForAction.loaiDon || 'Đơn đăng ký hộ kinh doanh',
        type: selectedItemForAction.code.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
        statusBadge: isMe ? 'Đang xử lý' : 'Đã bàn giao',
      };
      if (onSelectDon) {
        onSelectDon(donObj);
      }

      if (isMe) {
        showToast(`✓ Đã tiếp nhận hồ sơ ${selectedItemForAction.code} vào phần "Tiếp nhận & xử lý" của cá nhân!`);
      } else {
        showToast(`✓ Đã bàn giao hồ sơ ${selectedItemForAction.code} sang ${data.donViTiepNhanName}, chuyển đến mục "Đã bàn giao / Theo dõi"!`);
      }
      setTimeout(() => onNav('don-tiep-nhan'), 350);
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
          subStatus: isMe ? 'dang_xu_ly' : 'cho_phe_duyet',
          nguoiGiao: 'Trần Trọng Giáp (Trưởng phòng)',
          ngayDuocGiao: '23/09/2026',
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

      const donObj: DonDetail = {
        id: selectedItemForAction.id,
        code: selectedItemForAction.code,
        title: selectedItemForAction.title,
        luotNhanId: selectedItemForAction.luotNhanId || selectedItemForAction.id,
        nguoiNop: selectedItemForAction.sender,
        ngayNhan: selectedItemForAction.timeReceived,
        loaiDon: selectedItemForAction.loaiDon || 'Đơn đăng ký hộ kinh doanh',
        type: selectedItemForAction.code.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
        statusBadge: isMe ? 'Đang xử lý' : 'Chờ xử lý',
      };
      if (onSelectDon) {
        onSelectDon(donObj);
      }

      showToast(`✓ Đã phân công hồ sơ ${selectedItemForAction.code} cho cán bộ ${data.canBo.name}!`);
      setTimeout(() => onNav('don-tiep-nhan'), 350);
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
        ngayNhan: selectedItemForAction.timeReceived || '23/09/2026',
        ngayChuyenDen: '23/09/2026',
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
        donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
        noiDungTomTat: '',
        suggestedDeptId: 'qldt',
      };
    }

    let suggestedDeptId = 'qldt';
    const text = ((selectedItemForAction.title || '') + ' ' + (selectedItemForAction.loaiDon || '')).toLowerCase();
    if (text.includes('đất') || text.includes('môi trường') || text.includes('sổ đỏ') || text.includes('tnmt')) {
      suggestedDeptId = 'tnmt';
    } else if (text.includes('khiếu nại') || text.includes('tố cáo') || text.includes('thanh tra')) {
      suggestedDeptId = 'thanh-tra';
    } else if (text.includes('kinh tế') || text.includes('tham nhũng') || text.includes('buôn lậu') || text.includes('pc03')) {
      suggestedDeptId = 'pc03';
    } else if (text.includes('tư pháp') || text.includes('hộ tịch')) {
      suggestedDeptId = 'tu-phap';
    } else {
      suggestedDeptId = 'qldt';
    }

    const isPersonalProcessing =
      selectedItemForAction.column === 'processing' ||
      selectedItemForAction.holder?.name.includes('Tôi');

    return {
      code: selectedItemForAction.code,
      loaiDon: selectedItemForAction.loaiDon || 'Hồ sơ / Đơn',
      nguoiNop: selectedItemForAction.sender,
      ngayNhan: selectedItemForAction.timeReceived || '23/09/2026',
      donViHienTai: selectedItemForAction.holder?.department || 'Phòng Tiếp công dân & Xử lý đơn',
      noiDungTomTat: selectedItemForAction.title,
      suggestedDeptId,
      isPersonalProcessing,
    };
  }, [selectedItemForAction]);

  // Submit Modal Bàn giao đơn chuẩn (STEP-03C)
  const handleBanGiaoDonSubmit = (data: BanGiaoDonSubmitData) => {
    if (selectedItemForAction) {
      const targetName = data.banGiaoType === 'don_vi_khac'
        ? (data.donViNhanName || 'Đơn vị ngoài')
        : (data.canBoNhan?.name || 'Cán bộ chuyên môn');

      setItems((prev) => {
        const updatedItem: WorkItem = {
          ...selectedItemForAction,
          column: 'handed_over',
          subStatus: 'da_ban_giao',
          lyDoBanGiao: data.lyDoBanGiao,
          holder: {
            role: 'Đã bàn giao cho',
            name: targetName,
            department: data.donViNhanName || 'Đơn vị tiếp nhận',
          },
          actionTitle: `Bàn giao [STEP-03C]: ${data.cauHinhVanBan.taoVanBan ? (data.cauHinhVanBan.loaiVanBan === 'bien_ban_ban_giao' ? 'Biên bản bàn giao' : 'Phiếu chuyển đơn') : 'Hồ sơ bàn giao'}`,
          nextAction: 'Theo dõi tiếp nhận & phản hồi',
          cta: { label: 'Xem hồ sơ', actionType: 'view_progress', variant: 'neutral' },
        };
        return prev.map((it) => (it.id === selectedItemForAction.id ? updatedItem : it));
      });

      if (onBanGiaoDone) {
        onBanGiaoDone(selectedItemForAction.id, data.donViNhanName, targetName, data.lyDoBanGiao);
      }

      showToast(`✓ Đã bàn giao hồ sơ ${selectedItemForAction.code} sang ${targetName} thành công (STEP-03C)!`);
    }
    setIsBanGiaoModalOpen(false);
    setSelectedItemForAction(null);
  };

  // Submit Modal Trả lại đơn chuẩn (STEP-03D)
  const handleTraLaiDonSubmit = (data: TraLaiDonSubmitData) => {
    if (selectedItemForAction) {
      setItems((prev) => {
        const updatedItem: WorkItem = {
          ...selectedItemForAction,
          column: 'completed',
          subStatus: 'bi_tra_lai',
          lyDoTraLai: data.lyDoChinh,
          holder: {
            role: 'Đã hoàn thành',
            name: currentAccount?.name || 'Nguyễn Minh Anh',
            department: 'Phòng Tiếp công dân & Xử lý đơn',
          },
          actionTitle: `Trả lại đơn [STEP-03D]: ${data.cauHinhVanBan.soKyHieu || data.lyDoChinh}`,
          completionResult: `Đã trả lại đơn: ${data.lyDoChinh}`,
          completedAt: new Date().toLocaleDateString('vi-VN'),
          nextAction: 'Đã lập thông báo trả lại & hướng dẫn công dân',
          cta: { label: 'Xem văn bản trả lại', actionType: 'view_doc', variant: 'neutral' },
        };
        return prev.map((it) => (it.id === selectedItemForAction.id ? updatedItem : it));
      });

      showToast(`✓ Đã lập văn bản trả lại hồ sơ ${selectedItemForAction.code} cho công dân (STEP-03D)!`);
    }
    setIsTraLaiModalOpen(false);
    setSelectedItemForAction(null);
  };

  const donInfoForBanGiao = useMemo(() => {
    if (!selectedItemForAction) return undefined;
    return {
      code: selectedItemForAction.code,
      luotNhanId: selectedItemForAction.luotNhanId || selectedItemForAction.id,
      nguoiNop: selectedItemForAction.sender || 'Công dân',
      loaiDon: selectedItemForAction.loaiDon || 'Đơn Khiếu nại / Tố cáo',
      noiDung: selectedItemForAction.title || '',
      ngayNhan: selectedItemForAction.timeReceived || '23/09/2026',
      suggestedDeptId: donInfoForChuyen.suggestedDeptId,
    };
  }, [selectedItemForAction, donInfoForChuyen]);

  const donInfoForTraLai = useMemo(() => {
    if (!selectedItemForAction) return undefined;
    return {
      code: selectedItemForAction.code,
      luotNhanId: selectedItemForAction.luotNhanId || selectedItemForAction.id,
      nguoiNop: selectedItemForAction.sender || 'Công dân',
      loaiDon: selectedItemForAction.loaiDon || 'Đơn Khiếu nại / Tố cáo',
      noiDung: selectedItemForAction.title || '',
      ngayNhan: selectedItemForAction.timeReceived || '23/09/2026',
      diaChi: (selectedItemForAction as any).diaChi || 'Cầu Giấy, Hà Nội',
      hinhThucTiepNhan: selectedItemForAction.source || 'Trực tiếp tại trụ sở',
    };
  }, [selectedItemForAction]);

  // Xử lý nút Thử lại AI
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
            actionTitle: 'Đang bóc tách thông tin... (Chờ AI hoàn tất)',
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
              actionTitle: 'Kiểm tra kết quả AI và tiếp nhận',
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
    let list: WorkItem[] = [];

    // Chỉ cán bộ thụ lý mới hiển thị các việc đơn tiếp nhận, lượt nhận, vụ việc
    if (!isLeader) {
      list = [...items];

      // Thêm các đơn mới tiếp nhận từ màn Tiếp nhận đơn
      if (acceptedDons && acceptedDons.length > 0) {
        acceptedDons.forEach((ad) => {
          // Loại bỏ lượt nhận hoặc đơn cũ ở cột 'action_required' nếu đã được tiếp nhận
          list = list.filter((it) => it.id !== ad.luotNhanId && it.code !== ad.luotNhanId && it.code !== ad.code && it.id !== ad.id);
          const isChoTiepNhan = ad.statusBadge === 'Chờ tiếp nhận';
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
            column: isChoTiepNhan ? 'action_required' : 'processing',
            nextAction: isChoTiepNhan
              ? 'Kiểm tra kết quả AI và xác nhận tiếp nhận giải quyết'
              : 'Thực hiện thẩm tra & giải quyết đơn theo thẩm quyền',
            holder: {
              role: isChoTiepNhan ? 'Chờ tiếp nhận' : 'Đang xử lý',
              name: 'Tôi (Nguyễn Minh Anh)',
              department: 'Phòng Tiếp công dân & Xử lý đơn',
            },
            departmentId: 'tiep-dan',
            departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
            progress: {
              currentStep: isChoTiepNhan ? 1 : 2,
              totalSteps: 5,
              stepName: isChoTiepNhan ? 'Tiếp nhận hồ sơ' : 'Thụ lý giải quyết',
              steps: ['Tiếp nhận', 'Phân loại', 'Thẩm tra', 'Trình ký', 'Trả kết quả'],
            },
            docCount: 3,
            cta: {
              label: isChoTiepNhan ? 'Tiếp nhận ngay' : 'Mở xử lý',
              actionType: isChoTiepNhan ? 'handle_now' : 'continue',
              variant: isChoTiepNhan ? 'urgent' : 'primary',
            },
            category: 'Đã chuyển tiếp nhận',
            tags: ['Đã chuyển đến', isChoTiepNhan ? 'Chờ tiếp nhận' : 'Đang xử lý'],
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
        const isKhongOcr = !extraCard.hasFile || extraCard.sourceType === 'ghi_chu';
        list.unshift({
          id: extraCard.id,
          code: extraCard.id,
          title: extraCard.noiDung,
          sender: extraCard.nguoiNop,
          source: 'Bộ phận Một cửa',
          sourceType: 'luot_nhan',
          timeReceived: 'Vừa xong',
          priority: 'urgent',
          deadlineType: 'today',
          deadlineText: 'Hôm nay 16:30',
          deadlineFull: 'Hôm nay - 16:30',
          column: 'action_required',
          actionTitle: isKhongOcr ? 'Xử lý theo ghi chú (Không OCR)' : 'Kiểm tra & Tiếp nhận',
          nextAction: isKhongOcr
            ? 'Xử lý thủ công theo ghi chú tiếp nhận Một cửa (Hồ sơ giấy nộp trực tiếp, không chạy OCR)'
            : 'Kiểm tra tính hợp lệ & đối soát cơ sở dữ liệu quốc gia',
          holder: {
            role: 'Đang xử lý',
            name: 'Tôi (Nguyễn Minh Anh)',
            department: 'Tổ Tiếp nhận hồ sơ',
          },
          departmentId: 'tiep-dan',
          departmentName: 'Phòng Tiếp công dân & Xử lý đơn',
          progress: {
            currentStep: 1,
            totalSteps: 4,
            stepName: 'Tiếp nhận hồ sơ',
            steps: ['Tiếp nhận', 'Phân loại', 'Xác minh', 'Vào sổ'],
          },
          docCount: isKhongOcr ? 1 : 3,
          cta: {
            label: isKhongOcr ? 'Xử lý ghi chú' : 'Xử lý ngay',
            actionType: isKhongOcr ? 'manual_process' : 'handle_now',
            variant: 'urgent',
          },
          category: 'Hồ sơ mới',
          tags: isKhongOcr ? ['Đã chuyển đến', 'Không OCR', 'Xử lý theo ghi chú'] : ['Đã chuyển đến', 'Hồ sơ mới'],
          luotNhanId: extraCard.id,
          aiStatus: isKhongOcr ? 'none' : 'completed',
          nguonXuLy: isKhongOcr ? 'ghi_chu_thu_cong' : 'file_ocr',
          taskReadiness: 'manual_required',
        });
      }
    }

    // Thêm các văn bản ký duyệt / trình ký từ signingDocuments nếu chưa có trong list
    if (docs && docs.length > 0) {
      docs.forEach((doc) => {
        // Đối với LÃNH ĐẠO: CHỈ hiển thị các văn bản ĐÃ ĐƯỢC TRÌNH KÝ (không hiển thị bản nháp / chờ trình của cán bộ)
        if (isLeader) {
          const isSubmitted = doc.status !== 'nhap' && doc.status !== 'cho_trinh';
          if (!isSubmitted) return;
        }

        if (!list.some((it) => it.id === doc.id || it.code === doc.id)) {
          const docSigners = doc.signers || [];
          const currIdx = doc.currentSignerIndex ?? 0;
          const currSigner = docSigners[currIdx] || {
            id: doc.lanhDaoId,
            name: doc.lanhDaoName,
            chucVu: doc.lanhDaoChucVu,
            role: 'ky' as const,
            status: 'cho_ky' as const,
            order: 1,
          };
          const prevSigner = currIdx > 0 ? docSigners[currIdx - 1] : null;
          const nguoiKyTruoc = prevSigner
            ? `${prevSigner.name} (${prevSigner.chucVu || 'Lãnh đạo'})`
            : `${doc.nguoiTrinh || doc.nguoiLap || 'Cán bộ'} (Cán bộ trình)`;
          const thoiGianKyTruoc = prevSigner
            ? (prevSigner.thoiGianKy || doc.thoiGianTrinh || '04/10/2026')
            : (doc.thoiGianTrinh || doc.ngayTao || '04/10/2026');
          const tienTrinhKyHienTai = docSigners.length > 0
            ? `Lượt ${currIdx + 1}/${docSigners.length}: ${currSigner.name} (${currSigner.status === 'da_ky'
              ? 'Đã ký'
              : currSigner.status === 'cho_ky'
                ? 'Đang chờ ký'
                : 'Chưa đến lượt'
            })`
            : 'Chờ lãnh đạo ký';

          let column: WorkItemColumn = 'action_required';
          let subStatus: WorkItemSubStatus = 'cho_ky';
          let ctaLabel = 'Ký văn bản';
          let ctaVariant: 'urgent' | 'primary' | 'outline' | 'warning' = 'urgent';
          let nextAction = 'Xem xét dự thảo văn bản và thực hiện ký số';
          let holderRole: 'Đang xử lý' | 'Đang chờ' | 'Đã bàn giao cho' | 'Đã hoàn thành' | 'Chờ tiếp nhận' = 'Đang xử lý';
          let holderName = currentAccount.name;

          if (isLeader) {
            const myIdx = docSigners.findIndex(
              (s) =>
                s.id === currentAccount.id ||
                s.name.toLowerCase().includes(currentAccount.name.toLowerCase()) ||
                currentAccount.name.toLowerCase().includes(s.name.toLowerCase())
            );

            if (myIdx >= 0) {
              if (
                myIdx === currIdx &&
                (doc.status === 'da_trinh' || doc.status === 'cho_ky' || doc.status === 'dang_ky')
              ) {
                column = 'action_required';
                subStatus = 'cho_ky';
                ctaLabel = 'Ký văn bản';
                ctaVariant = 'urgent';
                nextAction = `Đến lượt bạn (${currentAccount.name}) ký số phê duyệt (${currIdx + 1}/${docSigners.length})`;
                holderRole = 'Đang xử lý';
                holderName = currentAccount.name;
              } else if (myIdx < currIdx) {
                column = 'processing';
                subStatus = 'dang_xu_ly';
                ctaLabel = 'Xem tiến trình ký';
                ctaVariant = 'outline';
                nextAction = `Bạn đã ký xong — Hệ thống tự động chuyển nhiệm vụ sang ${currSigner.name} ký`;
                holderRole = 'Đang chờ';
                holderName = currSigner.name;
              } else if (myIdx > currIdx) {
                column = 'waiting';
                subStatus = 'cho_ky';
                ctaLabel = 'Xem dự thảo';
                ctaVariant = 'outline';
                nextAction = `Chưa đến lượt (Đang chờ ${currSigner.name} ký duyệt trước)`;
                holderRole = 'Đang chờ';
                holderName = currSigner.name;
              } else if (doc.status === 'yeu_cau_chinh_sua') {
                column = 'waiting';
                subStatus = 'cho_phe_duyet';
                ctaLabel = 'Xem chi tiết';
                ctaVariant = 'outline';
                nextAction = `Đã yêu cầu chỉnh sửa: Chờ cán bộ ${doc.nguoiTrinh || 'thụ lý'} lập phiên bản V2`;
                holderRole = 'Đang chờ';
                holderName = doc.nguoiTrinh || 'Cán bộ thụ lý';
              } else if (doc.status === 'da_ky' || doc.status === 'hoan_tat') {
                column = 'completed';
                subStatus = 'dang_xu_ly';
                ctaLabel = 'Xem văn bản đã ký';
                ctaVariant = 'outline';
                nextAction = 'Văn bản đã hoàn tất toàn bộ quy trình ký số tuần tự';
                holderRole = 'Đã hoàn thành';
                holderName = currentAccount.name;
              }
            } else {
              // Lãnh đạo chung
              if (doc.status === 'da_trinh' || doc.status === 'cho_ky' || doc.status === 'dang_ky') {
                column = 'action_required';
                subStatus = 'cho_ky';
                ctaLabel = 'Ký văn bản';
                ctaVariant = 'urgent';
                nextAction = `Lượt ký của ${currSigner.name} (${currIdx + 1}/${docSigners.length || 1})`;
                holderRole = 'Đang xử lý';
                holderName = currSigner.name;
              } else if (doc.status === 'yeu_cau_chinh_sua') {
                column = 'waiting';
                subStatus = 'cho_phe_duyet';
                ctaLabel = 'Xem chi tiết';
                ctaVariant = 'outline';
                nextAction = `Chờ cán bộ lập phiên bản mới V2`;
                holderRole = 'Đang chờ';
                holderName = doc.nguoiTrinh || 'Cán bộ thụ lý';
              } else if (doc.status === 'da_ky' || doc.status === 'hoan_tat') {
                column = 'completed';
                subStatus = 'dang_xu_ly';
                ctaLabel = 'Xem văn bản đã ký';
                ctaVariant = 'outline';
                nextAction = 'Văn bản đã hoàn tất ký số và phát hành';
                holderRole = 'Đã hoàn thành';
                holderName = currentAccount.name;
              }
            }
          } else {
            // Cán bộ thụ lý
            if (doc.status === 'yeu_cau_chinh_sua') {
              column = 'action_required';
              subStatus = 'bi_tra_lai';
              ctaLabel = 'Sửa đổi (Tạo V2)';
              ctaVariant = 'urgent';
              nextAction = `Lãnh đạo yêu cầu sửa: ${doc.lyDoTraLai || doc.lyDoTuChoi || 'Chỉnh sửa nội dung'}`;
              holderRole = 'Đang xử lý';
              holderName = currentAccount.name;
            } else if (doc.status === 'cho_trinh' || doc.status === 'nhap') {
              column = 'processing';
              subStatus = 'dang_xu_ly';
              ctaLabel = 'Trình ký';
              ctaVariant = 'primary';
              nextAction = 'Hoàn thiện hồ sơ & danh sách người ký để trình Lãnh đạo';
              holderRole = 'Đang xử lý';
              holderName = currentAccount.name;
            } else if (doc.status === 'da_trinh' || doc.status === 'cho_ky' || doc.status === 'dang_ky') {
              column = 'waiting';
              subStatus = 'cho_ky';
              ctaLabel = 'Theo dõi ký';
              ctaVariant = 'outline';
              nextAction = `Đang chờ ${currSigner.name} (${currIdx + 1}/${docSigners.length || 1}) ký số`;
              holderRole = 'Đang chờ';
              holderName = currSigner.name;
            } else if (doc.status === 'da_ky' || doc.status === 'hoan_tat') {
              column = 'completed';
              subStatus = 'dang_xu_ly';
              ctaLabel = 'Xem văn bản đã ký';
              ctaVariant = 'outline';
              nextAction = 'Tất cả người có thẩm quyền đã ký xong — Hoàn tất';
              holderRole = 'Đã hoàn thành';
              holderName = currSigner.name;
            }
          }

          list.push({
            id: doc.id,
            code: doc.id,
            title: doc.tenVanBan,
            sender: doc.nguoiGuiDon || doc.nguoiTrinh || 'Cán bộ trình',
            source: 'Văn bản trình ký',
            sourceType: 'don',
            timeReceived: doc.thoiGianTrinh || doc.ngayTao || 'Hôm nay',
            priority: doc.mucDoUuTien === 'hoa_toc' ? 'urgent' : doc.mucDoUuTien === 'khan' ? 'high' : 'normal',
            deadlineType: doc.mucDoUuTien === 'hoa_toc' || doc.mucDoUuTien === 'khan' ? 'today' : 'upcoming',
            deadlineText: doc.hanXuLy || 'Trong ngày',
            deadlineFull: doc.hanXuLy || 'Hôm nay - 17:00',
            column,
            subStatus,
            actionTitle: doc.loaiVanBanLabel || 'Văn bản trình ký',
            nextAction,
            holder: {
              role: holderRole,
              name: holderName,
              department: isLeader ? currentAccount.phongBan : (doc.donViNguoiLap || currentAccount.phongBan),
            },
            departmentId: 'tiep-dan',
            departmentName: doc.donViNguoiLap || currentAccount.phongBan,
            progress: {
              currentStep: doc.status === 'da_ky' || doc.status === 'hoan_tat' ? 5 : (doc.status === 'da_trinh' || doc.status === 'cho_ky' || doc.status === 'dang_ky') ? 4 : 3,
              totalSteps: 5,
              stepName: doc.status === 'da_ky' || doc.status === 'hoan_tat' ? 'Đã ký số' : (doc.status === 'da_trinh' || doc.status === 'cho_ky' || doc.status === 'dang_ky') ? 'Chờ lãnh đạo ký' : 'Soạn thảo',
              steps: ['Dự thảo', 'Thẩm định', 'Trình ký', 'Ký số', 'Ban hành'],
            },
            docCount: (doc.tepDinhKem?.length || 0) + 1,
            cta: {
              label: ctaLabel,
              actionType: 'handle_now',
              variant: ctaVariant,
            },
            category: doc.loaiVanBanLabel || 'Văn bản trình ký',
            tags: [
              doc.loaiVanBanLabel || 'Văn bản',
              doc.mucDoUuTien === 'hoa_toc' ? 'Hỏa tốc' : doc.mucDoUuTien === 'khan' ? 'Khẩn' : 'Bình thường',
              doc.phienBanHienTai ? `Bản ${doc.phienBanHienTai}` : 'Bản V1',
            ],
            loaiDon: doc.loaiDon || 'Văn bản hành chính',
            luotNhanId: doc.luotNhanId || doc.hoSoCode,
            nguoiGiao: doc.nguoiTrinh || 'Cán bộ trình',
            ngayDuocGiao: doc.thoiGianTrinh || doc.ngayTao,
            aiStatus: 'completed',
            taskReadiness: column === 'action_required' ? 'action_required' : column === 'completed' ? 'completed' : 'waiting_system',
            // Trình ký tuần tự metadata
            isSigningDoc: true,
            nguoiKyTruoc,
            thoiGianKyTruoc,
            tienTrinhKyHienTai,
          });
        }
      });
    }


    return list;
  }, [items, acceptedDons, extraCard, luotNhanList, tiepNhanItems, docs, isLeader, currentAccount]);

  // =========================================================================
  // 5 KPI ĐẦU TRANG THEO ĐÚNG YÊU CẦU:
  // - Tổng công việc (active: action_required + processing + waiting + handed_over)
  // - Cần xử lý
  // - Đang thực hiện
  // - Đang chờ
  // - Quá hạn (tình trạng deadline độc lập, không trộn vào trạng thái)
  // =========================================================================
  const kpiStats = useMemo(() => {
    // Chỉ tính các công việc đang hoạt động (chưa hoàn thành)
    const activeItems = allItemsWithExtra.filter((i) => i.column !== 'completed');
    const total = isLeader ? allItemsWithExtra.length : activeItems.length;
    const canXuLy = allItemsWithExtra.filter((i) => i.column === 'action_required').length;
    const dangThucHien = allItemsWithExtra.filter((i) => i.column === 'processing').length;
    const dangCho = allItemsWithExtra.filter((i) => i.column === 'waiting').length;
    const daBanGiao = isLeader
      ? allItemsWithExtra.filter((i) => i.column === 'completed').length
      : allItemsWithExtra.filter((i) => i.column === 'handed_over').length;
    const quaHan = allItemsWithExtra.filter((i) => i.deadlineType === 'overdue').length;

    // Số lượng hoàn thành trong tab lịch sử
    const completedCount = allItemsWithExtra.filter((i) => i.column === 'completed').length;

    // Thống kê theo nguồn
    const sourceStats = {
      luotNhan: activeItems.filter((i) => getEffectiveSourceType(i) === 'luot_nhan').length,
      don: activeItems.filter((i) => getEffectiveSourceType(i) === 'don').length,
      vuViec: activeItems.filter((i) => getEffectiveSourceType(i) === 'vu_viec').length,
    };

    return {
      total,
      canXuLy,
      dangThucHien,
      dangCho,
      daBanGiao,
      quaHan,
      completedCount,
      sourceStats,
    };
  }, [allItemsWithExtra]);

  // Bộ lọc tìm kiếm và bộ lọc đa chiều
  const filteredItems = useMemo(() => {
    let result = allItemsWithExtra.filter((item) => {
      // Nếu đang ở tab Hoàn thành
      if (viewMode === 'completed') {
        if (item.column !== 'completed') return false;
      } else {
        // Nếu ở tab Kanban hoặc List, mặc định hiển thị active items
        if (item.column === 'completed') return false;
      }

      // 1. Tìm kiếm Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q) ||
          (item.actionTitle && item.actionTitle.toLowerCase().includes(q)) ||
          item.nextAction.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
        if (!match) return false;
      }

      // 2. Lọc theo Trạng thái công việc chính
      if (filterStatus !== 'all' && item.column !== filterStatus) {
        return false;
      }

      // 3. Lọc theo Nguồn công việc: Lượt nhận / Đơn / Vụ việc
      if (filterSource !== 'all') {
        const itemSource = getEffectiveSourceType(item);
        if (itemSource !== filterSource) return false;
      }

      // 4. Lọc theo Deadline: Quá hạn / Hôm nay / Sắp quá hạn / Trong hạn
      if (filterDeadline !== 'all') {
        if (item.deadlineType !== filterDeadline) return false;
      }

      // 5. Lọc theo Trạng thái AI / OCR
      if (filterAI !== 'all') {
        if (item.aiStatus !== filterAI) {
          return false;
        }
      }

      // 6. Lọc theo Phòng ban
      if (filterDept !== 'all') {
        if (item.departmentId !== filterDept && !item.holder.department?.toLowerCase().includes(filterDept.toLowerCase())) {
          return false;
        }
      }

      // 7. Lọc theo Người xử lý (Chỉ áp dụng khi bật chế độ quyền quản lý)
      if (isManagerMode && filterHandler !== 'all') {
        const isMe = item.holder.name.includes('Tôi') || item.holder.name.includes('Minh Anh');
        if (filterHandler === 'me' && !isMe) return false;
        if (filterHandler === 'others' && isMe) return false;
      }

      // 8. Lọc nâng cao: Loại công việc
      if (filterLoaiCongViec !== 'all') {
        const target = filterLoaiCongViec.toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const act = (item.actionTitle || '').toLowerCase();
        const next = (item.nextAction || '').toLowerCase();
        if (!cat.includes(target) && !act.includes(target) && !next.includes(target)) {
          return false;
        }
      }

      // 9. Lọc nâng cao: Loại hồ sơ
      if (filterLoaiHoSo !== 'all') {
        const target = filterLoaiHoSo.toLowerCase();
        const loai = (item.loaiDon || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const code = item.code.toLowerCase();
        if (target.includes('tố giác') && !loai.includes('tố giác') && !title.includes('tố giác')) return false;
        if (target.includes('khiếu nại') && !loai.includes('khiếu nại') && !title.includes('khiếu nại')) return false;
        if (target.includes('tố cáo') && !loai.includes('tố cáo') && !title.includes('tố cáo')) return false;
        if (target.includes('kiến nghị') && !loai.includes('kiến nghị') && !title.includes('kiến nghị') && !title.includes('phản ánh')) return false;
        if (target.includes('lượt nhận') && !code.startsWith('lr') && !code.startsWith('ln')) return false;
        if (target.includes('vụ việc') && !code.startsWith('vv')) return false;
      }

      // 10. Lọc nâng cao: Người tạo / Người giao
      if (filterNguoiGiao !== 'all') {
        const target = filterNguoiGiao.toLowerCase();
        const sender = (item.nguoiGiao || '').toLowerCase();
        if (!sender.includes(target)) return false;
      }

      // 11. Lọc nâng cao: Trạng thái chi tiết (hỗ trợ nhóm Chờ ký)
      if (filterSubStatus !== 'all') {
        if (filterSubStatus === 'cho_ky') {
          if (item.subStatus !== 'cho_ky' && !item.isSigningDoc) return false;
        } else {
          if (item.subStatus !== filterSubStatus) return false;
        }
      }

      if (filterDateFrom || filterDateTo) {
        const dateMatch = item.timeReceived.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateMatch) {
          const itemDateStr = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          if (filterDateFrom && itemDateStr < filterDateFrom) return false;
          if (filterDateTo && itemDateStr > filterDateTo) return false;
        }
      }

      // 13. Lọc nâng cao: Khoảng deadline
      if (filterDeadlineFrom || filterDeadlineTo) {
        const dlMatch = (item.deadlineFull || item.deadlineText || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dlMatch) {
          const itemDlStr = `${dlMatch[3]}-${dlMatch[2]}-${dlMatch[1]}`;
          if (filterDeadlineFrom && itemDlStr < filterDeadlineFrom) return false;
          if (filterDeadlineTo && itemDlStr > filterDeadlineTo) return false;
        }
      }

      return true;
    });

    // Sắp xếp
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
  }, [
    allItemsWithExtra,
    viewMode,
    searchQuery,
    filterStatus,
    filterSource,
    filterDeadline,
    filterAI,
    filterDept,
    filterHandler,
    isManagerMode,
    filterLoaiCongViec,
    filterLoaiHoSo,
    filterNguoiGiao,
    filterSubStatus,
    filterDateFrom,
    filterDateTo,
    filterDeadlineFrom,
    filterDeadlineTo,
    sortBy,
  ]);

  // Phân chia danh sách theo đúng 4 cột Kanban chính
  const columnItems = useMemo(() => {
    return {
      action_required: filteredItems.filter((i) => i.column === 'action_required'),
      processing: filteredItems.filter((i) => i.column === 'processing'),
      waiting: filteredItems.filter((i) => i.column === 'waiting'),
      handed_over: filteredItems.filter((i) => i.column === 'handed_over'),
      completed: filteredItems.filter((i) => i.column === 'completed'),
    };
  }, [filteredItems]);

  // Đếm số tiêu chí nâng cao đang được áp dụng
  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (filterDept !== 'all') count++;
    if (isManagerMode && filterHandler !== 'all') count++;
    if (filterLoaiCongViec !== 'all') count++;
    if (filterLoaiHoSo !== 'all') count++;
    if (filterNguoiGiao !== 'all') count++;
    if (filterSubStatus !== 'all') count++;
    if (filterDateFrom || filterDateTo) count++;
    if (filterDeadlineFrom || filterDeadlineTo) count++;
    return count;
  }, [
    filterDept,
    isManagerMode,
    filterHandler,
    filterLoaiCongViec,
    filterLoaiHoSo,
    filterNguoiGiao,
    filterSubStatus,
    filterDateFrom,
    filterDateTo,
    filterDeadlineFrom,
    filterDeadlineTo,
  ]);

  // Kiểm tra có đang áp dụng bộ lọc nào không
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filterSource !== 'all' ||
    filterDeadline !== 'all' ||
    filterAI !== 'all' ||
    advancedFilterCount > 0;

  const handleResetFilters = () => {
    setFilterStatus('all');
    setFilterSource('all');
    setFilterDeadline('all');
    setFilterAI('all');
    setFilterDept('all');
    setFilterHandler('all');
    setFilterLoaiCongViec('all');
    setFilterLoaiHoSo('all');
    setFilterNguoiGiao('all');
    setFilterSubStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterDeadlineFrom('');
    setFilterDeadlineTo('');
    setSearchQuery('');
  };
  const handleItemClick = (item: WorkItem) => {
    // 0. Nếu là hồ sơ bản nháp từ màn AI Tiếp nhận đơn qua Chat
    if (item.id.includes('NHAP') || item.code.includes('NHAP') || item.tags?.includes('Bản nháp AI')) {
      onNav('ai-tiep-nhan-chat');
      showToast(`Mở bản nháp hồ sơ ${item.code} tại màn AI Tiếp nhận đơn qua Chat`);
      return;
    }

    // 0B. Nếu là LÃNH ĐẠO click vào văn bản cần xử lý hoặc ký duyệt -> Mở trực tiếp màn ký chi tiết của Lãnh đạo
    if (isLeader) {
      const matchedSigningDoc = docs.find(
        (d) =>
          d.id === item.id ||
          d.id === item.code ||
          d.hoSoCode === item.code ||
          d.hoSoCode === item.id ||
          (item.luotNhanId && d.hoSoCode === item.luotNhanId)
      );

      const isSigningAction =
        Boolean(matchedSigningDoc) ||
        item.id.startsWith('VB-') ||
        item.code.startsWith('VB-') ||
        item.subStatus === 'cho_ky' ||
        item.actionTitle?.toLowerCase().includes('ký') ||
        item.nextAction?.toLowerCase().includes('ký') ||
        item.title?.toLowerCase().includes('ký duyệt') ||
        item.title?.toLowerCase().includes('trình ký');

      if (isSigningAction) {
        const targetDoc = matchedSigningDoc || docs.find((d) => d.status === 'da_trinh') || docs[0];
        if (targetDoc) {
          if (onSelectSigningDoc) onSelectSigningDoc(targetDoc.id);
          onNav('van-ban-cho-ky');
          showToast(`Mở Bàn ký duyệt văn bản chi tiết: [${targetDoc.id}] ${targetDoc.tenVanBan}`);
          return;
        }
      }
    } else {
      const matchedSigningDoc = docs.find(
        (d) =>
          d.id === item.id ||
          d.id === item.code ||
          d.hoSoCode === item.code ||
          d.hoSoCode === item.id ||
          (item.luotNhanId && d.hoSoCode === item.luotNhanId)
      );

      const isSigningAction =
        Boolean(matchedSigningDoc) ||
        item.id.startsWith('VB-') ||
        item.code.startsWith('VB-') ||
        item.actionTitle?.toLowerCase().includes('trình') ||
        item.title?.toLowerCase().includes('trình ký');

      if (isSigningAction && (matchedSigningDoc || docs.length > 0)) {
        const targetDoc = matchedSigningDoc || docs[0];
        if (targetDoc) {
          if (onSelectSigningDoc) onSelectSigningDoc(targetDoc.id);
          onNav('trinh-ky');
          showToast(`Mở màn hình Trình ký văn bản: [${targetDoc.id}] ${targetDoc.tenVanBan}`);
          return;
        }
      }
    }

    // Hồ sơ ở cột ĐANG THỰC HIỆN ('processing') hoặc đã tiếp nhận (không còn ở cột action_required)
    // → Mở màn chi tiết đơn và hiển thị đúng bước hiện tại của quy trình
    const isProcessingOrAfter =
      item.column === 'processing' ||
      item.column === 'waiting' ||
      item.column === 'completed' ||
      item.column === 'handed_over' ||
      item.column !== 'action_required';

    if (isProcessingOrAfter) {
      const currentStepNum = item.progress?.currentStep || (item.column === 'processing' ? 2 : 1);
      const stepName = item.progress?.stepName || (currentStepNum === 2 ? 'Thụ lý giải quyết' : 'Đang xử lý');
      const donObj: DonDetail = {
        id: item.id,
        code: item.code,
        title: item.title,
        luotNhanId: item.luotNhanId || item.id,
        nguoiNop: item.sender,
        ngayNhan: item.timeReceived,
        loaiDon: item.loaiDon || 'Đơn tiếp nhận hành chính',
        type: item.code.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
        statusBadge: item.subStatus && SUB_STATUS_LABELS[item.subStatus] ? SUB_STATUS_LABELS[item.subStatus] : 'Đang xử lý',
        currentStep: currentStepNum,
        stepName: stepName,
        progress: item.progress,
      };
      if (onSelectDon) onSelectDon(donObj);
      onNav('don-tiep-nhan');
      showToast(`Mở chi tiết hồ sơ [${item.code}] — Đang ở bước: ${stepName} (Bước ${currentStepNum})`);
      return;
    }

    const isAiAnalyzedForReview =
      item.aiStatus === 'needs_review' ||
      item.aiStatus === 'processing' ||
      item.aiStatus === 'failed' ||
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

    // Không OCR → mở màn chi tiết tiếp nhận (để cán bộ nhấn Tiếp nhận thủ công)
    const isKhongOcr = item.aiStatus === 'none' && item.column === 'action_required';
    if (isKhongOcr) {
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
      if (onSelectDon) onSelectDon(donObj);
      onNav('don-tiep-nhan');
      showToast(`Mở chi tiết hồ sơ [${item.code}] — Không OCR, sẵn sàng tiếp nhận`);
      return;
    }

    if (isAiAnalyzedForReview || item.aiStatus === 'processing' || item.aiStatus === 'failed' || item.code.startsWith('LN')) {
      const matchedLn =
        luotNhanList.find((l) => l.id === item.id || l.id === item.code || l.id === item.luotNhanId) ||
        ALL_LUOT_NHAN.find((l) => l.id === item.id || l.id === item.code);

      // Nếu lượt nhận đã tiếp nhận xong -> mở màn chi tiết đơn chứ không mở màn phân tích AI
      const isDaTiepNhan =
        matchedLn?.status === 'da_chuyen' ||
        matchedLn?.status === 'da_thu_ly' ||
        item.tags.includes('Đã tiếp nhận');

      if (isDaTiepNhan) {
        const dynamicCode = item.code.startsWith('LN-') ? `Đ-${item.code.replace('LN-', '')}` : item.code;
        const donObj: DonDetail = {
          id: dynamicCode,
          code: dynamicCode,
          title: item.title,
          luotNhanId: item.code,
          nguoiNop: item.sender,
          ngayNhan: item.timeReceived,
          loaiDon: item.loaiDon || 'Đơn phản ánh kiến nghị',
          type: 'ĐƠN TIẾP NHẬN',
          statusBadge: 'Đang xác minh thông tin',
        };
        if (onSelectDon) onSelectDon(donObj);
        onNav('don-tiep-nhan');
        showToast(`Mở màn chi tiết đơn [${dynamicCode}] (Đã tiếp nhận)`);
        return;
      }

      const targetLuotNhan: LuotNhan = {
        id: item.code,
        ngayNhan: item.timeReceived,
        nguoiNop: item.sender,
        hinhThuc: item.source,
        noiDung: item.title,
        donVi: item.holder?.department || 'Tổ Tiếp nhận hồ sơ',
        aiJob: item.aiStatus === 'none' ? 0 : item.aiStatus === 'failed' ? 1 : (item.aiStatus === 'completed' || item.aiStatus === 'needs_review' ? 5 : item.aiStatus === 'processing' ? 3 : 0),
        status: matchedLn?.status || 'cho_chuyen',
      };

      onSelect(targetLuotNhan);
      onNav('ban-phan-tich');
      showToast(
        item.aiStatus === 'none'
          ? `Mở xử lý thủ công Lượt nhận [${item.code}] (Không OCR)`
          : item.aiStatus === 'failed'
            ? `Mở khắc phục lỗi OCR cho Lượt nhận [${item.code}]`
            : `Mở chi tiết Lượt nhận [${item.code}] tại Bàn phân tích AI`
      );
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs mb-3.5 flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${isLeader ? 'bg-indigo-600 text-white' : 'bg-[#004ac6] text-white'
              } flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isLeader ? 'approval_delegation' : 'checklist'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-headline-md">
                Công việc của tôi
              </h1>
            </div>

          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${viewMode === 'kanban'
                ? 'bg-white text-[#004ac6] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
                }`}
              title="Xem dạng Kanban 4 cột quy trình"
            >
              <span className="material-symbols-outlined text-[17px]">view_kanban</span>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${viewMode === 'list'
                ? 'bg-white text-[#004ac6] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
                }`}
              title="Xem dạng Bảng danh sách chi tiết"
            >
              <span className="material-symbols-outlined text-[17px]">view_list</span>
              <span>Danh sách</span>
            </button>
          </div>
          {onSwitchAccount && (
            <button
              type="button"
              onClick={() => {
                const other = DEMO_ACCOUNTS.find((a) => a.role !== currentAccount.role);
                if (other) {
                  onSwitchAccount(other);
                  showToast(`Đã chuyển sang tài khoản ${other.name} (${other.roleLabel})`);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${isLeader
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                }`}
              title="Đổi vai trò tài khoản để kiểm tra giữa Cán bộ thụ lý và Lãnh đạo ký duyệt"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span className="hidden md:inline">
                {isLeader ? 'Đổi sang Cán bộ' : 'Đổi sang Lãnh đạo'}
              </span>
            </button>
          )}

          {/* Nút Tạo mới tiếp nhận */}
          <div className="relative inline-flex items-center rounded-xl bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-xs">
            <button
              type="button"
              onClick={() => onNav('nhan-don-them')}
              className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-95"
              title="Mở trực tiếp màn hình thêm mới lượt nhận hồ sơ"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              <span>Tạo mới</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              className="px-1.5 py-1.5 border-l border-red-700/60 hover:bg-black/10 rounded-r-xl cursor-pointer flex items-center transition-colors"
              title="Tùy chọn khởi tạo"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
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
                    onNav('nhan-don-them');
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">post_add</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 leading-snug">Tạo lượt nhận hồ sơ</div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Mở màn hình thêm mới lượt nhận hồ sơ</p>
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
                    <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 leading-snug">Thêm mới tiếp nhận và xử lý</div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Mở màn hình tiếp nhận và xử lý đơn</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        <button
          type="button"
          onClick={() => {
            setViewMode('kanban');
            setFilterStatus('all');
            setFilterDeadline('all');
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${filterStatus === 'all' && filterDeadline === 'all' && viewMode !== 'completed'
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
          <span className="text-[10px] opacity-70 mt-1">Gồm Lượt nhận, Đơn &amp; Vụ việc</span>
        </button>

        {/* KPI 2: CẦN XỬ LÝ (Đang đến lượt người dùng làm) */}
        <button
          type="button"
          onClick={() => {
            setViewMode('kanban');
            setFilterStatus(filterStatus === 'action_required' ? 'all' : 'action_required');
            setFilterDeadline('all');
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${filterStatus === 'action_required'
            ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600/30 shadow-sm'
            : 'bg-rose-50/70 border-rose-200 hover:border-rose-300 text-rose-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${filterStatus === 'action_required' ? 'bg-white' : 'bg-rose-500'} animate-pulse`}></span>
              <span>Cần xử lý</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${filterStatus === 'action_required' ? 'text-white' : 'text-rose-600'}`}>bolt</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${filterStatus === 'action_required' ? 'text-white' : 'text-rose-700'}`}>
            {String(kpiStats.canXuLy).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${filterStatus === 'action_required' ? 'text-white/90' : 'text-rose-700'}`}>
            Lượt nhận không OCR/lỗi, việc đến lượt tôi
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setViewMode('kanban');
            setFilterStatus(filterStatus === 'processing' ? 'all' : 'processing');
            setFilterDeadline('all');
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${filterStatus === 'processing'
            ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/30 shadow-sm'
            : 'bg-amber-50/70 border-amber-200 hover:border-amber-300 text-amber-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${filterStatus === 'processing' ? 'bg-white' : 'bg-amber-500'}`}></span>
              <span>Đang thực hiện</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${filterStatus === 'processing' ? 'text-white' : 'text-amber-600'}`}>pending_actions</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${filterStatus === 'processing' ? 'text-white' : 'text-amber-700'}`}>
            {String(kpiStats.dangThucHien).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${filterStatus === 'processing' ? 'text-white/90' : 'text-amber-700'}`}>
            Đã bắt đầu, chưa hoàn tất bước
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setViewMode('kanban');
            setFilterStatus(filterStatus === 'waiting' ? 'all' : 'waiting');
            setFilterDeadline('all');
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${filterStatus === 'waiting'
            ? 'bg-sky-700 text-white border-sky-700 ring-2 ring-sky-700/30 shadow-sm'
            : 'bg-sky-50/70 border-sky-200 hover:border-sky-300 text-sky-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className={`material-symbols-outlined text-[15px] ${filterStatus === 'waiting' ? 'text-white' : 'text-sky-600'}`}>hourglass_top</span>
              <span>Đang chờ</span>
            </span>
            <span className={`material-symbols-outlined text-[16px] ${filterStatus === 'waiting' ? 'text-white' : 'text-sky-600'}`}>sync_alt</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${filterStatus === 'waiting' ? 'text-white' : 'text-sky-800'}`}>
            {String(kpiStats.dangCho).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${filterStatus === 'waiting' ? 'text-white/90' : 'text-sky-700'}`}>
            Chờ duyệt, ký, phối hợp, bổ sung
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setViewMode('kanban');
            setFilterDeadline(filterDeadline === 'overdue' ? 'all' : 'overdue');
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${filterDeadline === 'overdue'
            ? 'bg-red-700 text-white border-red-700 ring-2 ring-red-700/30 shadow-sm'
            : 'bg-red-50/75 border-red-200 hover:border-red-300 text-red-950'
            }`}
        >
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-red-600">error</span>
              <span>Quá hạn</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase">Deadline</span>
          </div>
          <div className={`text-2xl font-bold font-label-technical mt-2 tracking-tight ${filterDeadline === 'overdue' ? 'text-white' : 'text-red-700'}`}>
            {String(kpiStats.quaHan).padStart(2, '0')}
          </div>
          <span className={`text-[10px] font-medium mt-1 ${filterDeadline === 'overdue' ? 'text-white/90' : 'text-red-700'}`}>
            Hồ sơ chậm tiến độ cần ưu tiên
          </span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs mb-3.5 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all font-medium"
              placeholder="Tìm theo mã hồ sơ (LR-, Đ-, VV-), tên hồ sơ, người nộp, việc cần xử lý..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Cụm điều khiển bên phải: [Bộ lọc nâng cao] & [Sắp xếp: Ưu tiên deadline ▼] */}
          <div className="flex items-center gap-2">
            {/* 1. Nút bật/tắt Bộ lọc nâng cao */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAdvancedFilterOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isAdvancedFilterOpen || advancedFilterCount > 0
                  ? 'bg-blue-50 border-[#004ac6] text-[#004ac6] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                title="Mở bộ lọc nâng cao"
              >
                <span className="material-symbols-outlined text-[17px]">tune</span>
                <span>Bộ lọc nâng cao</span>
                {advancedFilterCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-[#004ac6] text-white text-[10px] font-bold flex items-center justify-center -mr-0.5">
                    {advancedFilterCount}
                  </span>
                )}
              </button>

              {/* Backdrop đóng popup khi bấm ra ngoài */}
              {isAdvancedFilterOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAdvancedFilterOpen(false)}
                />
              )}

              {/* POPUP BỘ LỌC NÂNG CAO */}
              {isAdvancedFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-[480px] max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in flex flex-col gap-3">
                  {/* Header popup */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs tracking-tight">
                      <span className="material-symbols-outlined text-[18px] text-[#004ac6]">tune</span>
                      <span>BỘ LỌC NÂNG CAO</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAdvancedFilterOpen(false)}
                      className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                      title="Đóng"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Phòng ban</label>
                      <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                      >
                        <option value="all">Tất cả phòng ban</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.shortName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Loại công việc</label>
                      <select
                        value={filterLoaiCongViec}
                        onChange={(e) => setFilterLoaiCongViec(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                      >
                        <option value="all">Tất cả loại việc</option>
                        <option value="tiếp nhận">Tiếp nhận hồ sơ</option>
                        <option value="bóc tách">Bóc tách &amp; Phân tích AI</option>
                        <option value="thẩm tra">Thẩm tra &amp; Thụ lý</option>
                        <option value="bàn giao">Bàn giao &amp; Chuyển đơn vị</option>
                        <option value="trình ký">Trình ký &amp; Phê duyệt</option>
                        <option value="bổ sung">Bổ sung tài liệu</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Loại hồ sơ</label>
                      <select
                        value={filterLoaiHoSo}
                        onChange={(e) => setFilterLoaiHoSo(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                      >
                        <option value="all">Tất cả loại hồ sơ</option>
                        <option value="tố giác">Đơn tố giác / Tin báo</option>
                        <option value="khiếu nại">Đơn khiếu nại</option>
                        <option value="tố cáo">Đơn tố cáo</option>
                        <option value="kiến nghị">Đơn kiến nghị / Phản ánh</option>
                        <option value="lượt nhận">Lượt nhận hồ sơ Một cửa</option>
                        <option value="vụ việc">Vụ việc thụ lý</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Trạng thái chi tiết</label>
                      <select
                        value={filterSubStatus}
                        onChange={(e) => setFilterSubStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.entries(SUB_STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Người tạo / Người giao</label>
                      <select
                        value={filterNguoiGiao}
                        onChange={(e) => setFilterNguoiGiao(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                      >
                        <option value="all">Tất cả người tạo</option>
                        <option value="Trần Trọng Giáp">Trần Trọng Giáp (Trưởng phòng)</option>
                        <option value="Minh Anh">Nguyễn Minh Anh (Cán bộ thụ lý)</option>
                        <option value="Một cửa">Tổ Tiếp nhận Một cửa</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-600">Ngày tạo</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:border-[#004ac6]"
                          title="Ngày tạo từ ngày"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                          type="date"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:border-[#004ac6]"
                          title="Ngày tạo đến ngày"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">Khoảng deadline</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={filterDeadlineFrom}
                          onChange={(e) => setFilterDeadlineFrom(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:border-[#004ac6]"
                          title="Hạn từ ngày"
                        />
                        <span className="text-slate-400 text-xs font-medium">đến</span>
                        <input
                          type="date"
                          value={filterDeadlineTo}
                          onChange={(e) => setFilterDeadlineTo(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:border-[#004ac6]"
                          title="Hạn đến ngày"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isManagerMode}
                        onChange={(e) => {
                          setIsManagerMode(e.target.checked);
                          if (!e.target.checked) setFilterHandler('all');
                        }}
                        className="rounded border-slate-300 text-[#004ac6] focus:ring-[#004ac6] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        Quyền quản lý / Xem công việc của người khác
                      </span>
                    </label>

                    {isManagerMode ? (
                      <div className="flex items-center gap-2 pl-5 pt-1 animate-fade-in">
                        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Người xử lý:</span>
                        <select
                          value={filterHandler}
                          onChange={(e) => setFilterHandler(e.target.value as FilterHandler)}
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004ac6] cursor-pointer"
                        >
                          <option value="all">Tất cả cán bộ trong phòng</option>
                          <option value="me">Việc của tôi (Nguyễn Minh Anh)</option>
                          <option value="others">Cán bộ / Đơn vị khác</option>
                        </select>
                      </div>
                    ) : (
                      <p className="text-[10.5px] text-slate-400 pl-5 leading-tight">
                        * Bạn đang xem công việc của chính mình. Bật tùy chọn này khi có quyền quản lý để lọc theo cán bộ khác.
                      </p>
                    )}
                  </div>

                  {/* Footer popup */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterDept('all');
                        setFilterLoaiCongViec('all');
                        setFilterLoaiHoSo('all');
                        setFilterNguoiGiao('all');
                        setFilterSubStatus('all');
                        setFilterDateFrom('');
                        setFilterDateTo('');
                        setFilterDeadlineFrom('');
                        setFilterDeadlineTo('');
                        setFilterHandler('all');
                      }}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Đặt lại nâng cao
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAdvancedFilterOpen(false)}
                      className="px-4 py-1.5 bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                    >
                      Áp dụng {advancedFilterCount > 0 ? `(${advancedFilterCount})` : ''}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Dropdown Sắp xếp */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">sort</span>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="priority_deadline">Ưu tiên deadline: Quá hạn → Hôm nay → Sắp quá hạn</option>
                <option value="deadline_asc">Hạn xử lý gần nhất</option>
                <option value="urgent_first">Khẩn cấp trước</option>
                <option value="newest">Mới tiếp nhận gần đây</option>
                <option value="oldest">Hồ sơ cũ nhất</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">Nhóm:</span>
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setFilterSource('all');
                  setFilterSubStatus('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterSource === 'all' && filterSubStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => {
                  if (filterSubStatus === 'cho_ky') {
                    setFilterSubStatus('all');
                  } else {
                    setFilterSubStatus('cho_ky');
                    setFilterSource('all');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${filterSubStatus === 'cho_ky'
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'text-indigo-800 hover:bg-indigo-50 font-medium'
                  }`}
              >
                <span className="material-symbols-outlined text-[13px]">draw</span>
                <span>{isLeader ? 'Chờ tôi ký' : 'Chờ ký'}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-bold ${filterSubStatus === 'cho_ky' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-800'
                    }`}
                >
                  {isLeader
                    ? allItemsWithExtra.filter((i) => i.column === 'action_required').length
                    : allItemsWithExtra.filter((i) => i.subStatus === 'cho_ky' || i.isSigningDoc).length}
                </span>
              </button>

              {!isLeader ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSource('luot_nhan');
                      if (filterSubStatus === 'cho_ky') setFilterSubStatus('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterSource === 'luot_nhan' && filterSubStatus !== 'cho_ky'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Lượt nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSource('don');
                      if (filterSubStatus === 'cho_ky') setFilterSubStatus('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterSource === 'don' && filterSubStatus !== 'cho_ky'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Đơn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSource('vu_viec');
                      if (filterSubStatus === 'cho_ky') setFilterSubStatus('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterSource === 'vu_viec' && filterSubStatus !== 'cho_ky'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Vụ việc
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (filterSubStatus === 'dang_xu_ly') {
                        setFilterSubStatus('all');
                      } else {
                        setFilterSubStatus('dang_xu_ly');
                        setFilterSource('all');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${filterSubStatus === 'dang_xu_ly'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span>Đã ký / Đang chuyển</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-slate-200 text-slate-700">
                      {allItemsWithExtra.filter((i) => i.column === 'processing').length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (filterSubStatus === 'cho_phe_duyet') {
                        setFilterSubStatus('all');
                      } else {
                        setFilterSubStatus('cho_phe_duyet');
                        setFilterSource('all');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${filterSubStatus === 'cho_phe_duyet'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span>Yêu cầu sửa</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800">
                      {allItemsWithExtra.filter((i) => i.subStatus === 'cho_phe_duyet').length}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 2. LỌC HẠN XỬ LÝ: Tất cả | Quá hạn | Hôm nay | Sắp quá hạn */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">Hạn:</span>
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFilterDeadline('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterDeadline === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterDeadline('overdue')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${filterDeadline === 'overdue'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-rose-700 hover:bg-rose-50 font-medium'
                  }`}
              >
                {filterDeadline === 'overdue' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
                <span>Quá hạn</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterDeadline('today')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterDeadline === 'today'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setFilterDeadline('upcoming')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterDeadline === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Sắp quá hạn
              </button>
            </div>
          </div>

          {/* 3. LỌC AI: Tất cả | Không OCR | OCR lỗi | Cần kiểm tra | Đang xử lý | Đã phân tích */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">AI/OCR:</span>
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFilterAI('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterAI === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterAI('none')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${filterAI === 'none'
                  ? 'bg-slate-800 text-white shadow-2xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-200 font-medium'
                  }`}
              >
                <span className="material-symbols-outlined text-[13px]">edit_note</span>
                <span>Không OCR</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterAI('failed')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${filterAI === 'failed'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-rose-700 hover:bg-rose-50 font-medium'
                  }`}
              >
                <span className="material-symbols-outlined text-[13px]">error</span>
                <span>OCR lỗi</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterAI('needs_review')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${filterAI === 'needs_review'
                  ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                  : 'text-amber-800 hover:bg-amber-50 font-medium'
                  }`}
              >
                {filterAI === 'needs_review' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
                <span>Cần kiểm tra</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterAI('processing')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterAI === 'processing'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Đang xử lý
              </button>
              <button
                type="button"
                onClick={() => setFilterAI('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterAI === 'completed'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Đã phân tích
              </button>
            </div>
          </div>
        </div>

        {/* HÀNG 3: HIỂN THỊ CÁC FILTER ĐÃ CHỌN (CHIPS) & NÚT XÓA TẤT CẢ */}
        {(advancedFilterCount > 0 || filterSource !== 'all' || filterDeadline !== 'all' || filterAI !== 'all' || searchQuery.trim().length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs animate-fade-in">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-0.5">
              <span className="material-symbols-outlined text-[14px]">filter_alt</span>
              Đang lọc:
            </span>

            {/* Chip Tìm kiếm */}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200">
                <span>"{searchQuery.length > 20 ? searchQuery.slice(0, 20) + '...' : searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                  title="Xóa tìm kiếm"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Nguồn */}
            {filterSource !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200">
                <span>{filterSource === 'luot_nhan' ? 'Lượt nhận' : filterSource === 'don' ? 'Đơn' : 'Vụ việc'}</span>
                <button
                  type="button"
                  onClick={() => setFilterSource('all')}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Hạn */}
            {filterDeadline !== 'all' && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium border ${filterDeadline === 'overdue'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                <span>{filterDeadline === 'overdue' ? 'Quá hạn' : filterDeadline === 'today' ? 'Hôm nay' : 'Sắp quá hạn'}</span>
                <button
                  type="button"
                  onClick={() => setFilterDeadline('all')}
                  className="hover:opacity-80 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip AI */}
            {filterAI !== 'all' && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11.5px] font-medium border ${filterAI === 'failed'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : filterAI === 'none'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : filterAI === 'needs_review'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                <span>{filterAI === 'failed' ? 'OCR bị lỗi' : filterAI === 'none' ? 'Không OCR' : filterAI === 'needs_review' ? 'Cần kiểm tra' : filterAI === 'processing' ? 'Đang xử lý' : 'Đã phân tích'}</span>
                <button
                  type="button"
                  onClick={() => setFilterAI('all')}
                  className="hover:opacity-80 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Phòng ban (Ví dụ: [Phòng Tiếp dân ×]) */}
            {filterDept !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#004ac6] text-[11.5px] font-medium border border-blue-200">
                <span>{DEPARTMENTS.find((d) => d.id === filterDept)?.shortName || filterDept}</span>
                <button
                  type="button"
                  onClick={() => setFilterDept('all')}
                  className="hover:text-blue-900 cursor-pointer ml-0.5"
                  title="Xóa bộ lọc phòng ban"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Người xử lý (Ví dụ: [Nguyễn Văn A ×]) */}
            {isManagerMode && filterHandler !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#004ac6] text-[11.5px] font-medium border border-blue-200">
                <span>{filterHandler === 'me' ? 'Việc của tôi (Nguyễn Minh Anh)' : 'Cán bộ khác'}</span>
                <button
                  type="button"
                  onClick={() => setFilterHandler('all')}
                  className="hover:text-blue-900 cursor-pointer ml-0.5"
                  title="Xóa bộ lọc người xử lý"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Khoảng deadline (Ví dụ: [Hạn: 25/09 - 30/09 ×]) */}
            {(filterDeadlineFrom || filterDeadlineTo) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 text-[11.5px] font-medium border border-rose-200">
                <span>
                  Hạn: {filterDeadlineFrom && filterDeadlineTo
                    ? `${filterDeadlineFrom} - ${filterDeadlineTo}`
                    : filterDeadlineFrom
                      ? `từ ${filterDeadlineFrom}`
                      : `đến ${filterDeadlineTo}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterDeadlineFrom('');
                    setFilterDeadlineTo('');
                  }}
                  className="hover:text-rose-950 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Ngày tạo (Ví dụ: [25/09 - 30/09 ×]) */}
            {(filterDateFrom || filterDateTo) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11.5px] font-medium border border-amber-200">
                <span>
                  Tạo: {filterDateFrom && filterDateTo
                    ? `${filterDateFrom} - ${filterDateTo}`
                    : filterDateFrom
                      ? `từ ${filterDateFrom}`
                      : `đến ${filterDateTo}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                  className="hover:text-amber-950 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Loại công việc */}
            {filterLoaiCongViec !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200">
                <span>{filterLoaiCongViec}</span>
                <button
                  type="button"
                  onClick={() => setFilterLoaiCongViec('all')}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Loại hồ sơ */}
            {filterLoaiHoSo !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200">
                <span>{filterLoaiHoSo}</span>
                <button
                  type="button"
                  onClick={() => setFilterLoaiHoSo('all')}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Trạng thái chi tiết */}
            {filterSubStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11.5px] font-medium border border-indigo-200">
                <span>{SUB_STATUS_LABELS[filterSubStatus] || filterSubStatus}</span>
                <button
                  type="button"
                  onClick={() => setFilterSubStatus('all')}
                  className="hover:text-indigo-900 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Chip Người tạo */}
            {filterNguoiGiao !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200">
                <span>Tạo bởi: {filterNguoiGiao}</span>
                <button
                  type="button"
                  onClick={() => setFilterNguoiGiao('all')}
                  className="hover:text-slate-900 cursor-pointer ml-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}

            {/* Nút Xóa tất cả */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-[11.5px] text-rose-600 hover:text-rose-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded-lg hover:bg-rose-50/60"
              title="Đặt lại toàn bộ tìm kiếm & bộ lọc"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>


      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
          <div className="bg-rose-50/40 rounded-2xl p-3 border border-rose-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                <h2 className="text-[13px] font-bold text-rose-950 uppercase tracking-tight font-headline-md">
                  CẦN XỬ LÝ
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.action_required.length).padStart(2, '0')}
              </span>
            </div>

            <p className="text-[10.5px] text-rose-800/80 px-1 -mt-1 font-medium">
              Lượt nhận chuyển tới (không OCR / OCR lỗi), đơn mới giao, cần bổ sung
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.action_required.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-rose-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-emerald-500 mb-1">check_circle</span>
                  <div className="text-xs font-bold text-slate-700">Không có việc tồn đọng</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bạn đã xử lý hết các việc đến lượt mình.</p>
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
                    onBanGiaoDon={handleOpenBanGiaoDon}
                    onTraLaiDon={handleOpenTraLaiDon}
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
                  ĐANG THỰC HIỆN
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.processing.length).padStart(2, '0')}
              </span>
            </div>

            <p className="text-[10.5px] text-amber-800/80 px-1 -mt-1 font-medium">
              Đã bắt đầu xử lý, đang trong quá trình giải quyết
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.processing.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-amber-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">pending_actions</span>
                  <div className="text-xs font-bold text-slate-700">Không có việc đang thực hiện</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Không có hồ sơ nào đang trong quá trình xử lý.</p>
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
                    onBanGiaoDon={handleOpenBanGiaoDon}
                    onTraLaiDon={handleOpenTraLaiDon}
                    onPhanCong={handleOpenPhanCong}
                  />
                ))
              )}
            </div>
          </div>

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

            <p className="text-[10.5px] text-sky-800/80 px-1 -mt-1 font-medium">
              Văn bản đi đang trình ký, hoặc chờ người dân bổ sung hồ sơ
            </p>

            <div className="flex flex-col gap-2.5">
              {columnItems.waiting.length === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-sky-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">hourglass_disabled</span>
                  <div className="text-xs font-bold text-slate-700">Không có việc đang chờ</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Không có hồ sơ nào đang chờ phản hồi bên ngoài.</p>
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
                    onBanGiaoDon={handleOpenBanGiaoDon}
                    onTraLaiDon={handleOpenTraLaiDon}
                    onPhanCong={handleOpenPhanCong}
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-emerald-50/40 rounded-2xl p-3 border border-emerald-200/80 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h2 className="text-[13px] font-bold text-emerald-950 uppercase tracking-tight font-headline-md">
                  HOÀN TẤT / BÀN GIAO
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[11px] font-label-technical">
                {String(columnItems.completed.length + columnItems.handed_over.length).padStart(2, '0')}
              </span>
            </div>

            <p className="text-[10.5px] text-emerald-800/80 px-1 -mt-1 font-medium">
              Đã hoàn thành quy trình giải quyết, hoặc đã bàn giao cán bộ khác thụ lý
            </p>

            <div className="flex flex-col gap-2.5">
              {(columnItems.completed.length + columnItems.handed_over.length) === 0 ? (
                <div className="p-6 bg-white/80 rounded-xl border border-dashed border-emerald-200 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">task_alt</span>
                  <div className="text-xs font-bold text-slate-700">Chưa có việc hoàn tất</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Các đơn giải quyết xong hoặc đã bàn giao sẽ xuất hiện ở đây.</p>
                </div>
              ) : (
                [...columnItems.completed, ...columnItems.handed_over].map((item) => (
                  <TaskCard
                    key={item.id}
                    item={item}
                    onClick={() => handleItemClick(item)}
                    onRetryAI={(e) => handleRetryAI(e, item)}
                    onTiepNhanXuLy={handleTiepNhanXuLyCaNhan}
                    onBanGiao={handleOpenBanGiao}
                    onBanGiaoDon={handleOpenBanGiaoDon}
                    onTraLaiDon={handleOpenTraLaiDon}
                    onPhanCong={handleOpenPhanCong}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : viewMode === 'list' ? (

        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">Nguồn &amp; Mã</th>
                  <th className="py-3 px-4 min-w-[260px]">Tên hồ sơ / Việc cần xử lý</th>
                  <th className="py-3 px-3 min-w-[130px]">Trạng thái chính</th>
                  <th className="py-3 px-3 min-w-[130px]">Trạng thái AI</th>
                  <th className="py-3 px-3 min-w-[170px]">Người đang xử lý</th>
                  <th className="py-3 px-3 w-36">Hạn xử lý</th>
                  <th className="py-3 px-3 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">search_off</span>
                      <div className="font-semibold text-slate-700">Không tìm thấy công việc nào phù hợp</div>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">Thử đổi từ khóa hoặc xóa bớt tiêu chí lọc.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const srcType = getEffectiveSourceType(item);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            <SourceTypeBadge sourceType={srcType} />
                            <span className="font-mono font-bold text-slate-800 group-hover:text-[#C62828] transition-colors">
                              {item.code}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-[#C62828] transition-colors leading-snug">
                            {item.title}
                          </div>
                          <div className="text-[11.5px] text-slate-600 mt-1 flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">Cần làm:</span>
                            <span className="font-medium text-[#C62828]">{item.actionTitle || item.nextAction}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <ColumnStatusBadge column={item.column} />
                        </td>

                        <td className="py-3 px-3">
                          <AIStatusBadge status={item.aiStatus} progress={item.aiProgress} />
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{item.holder.name}</div>
                          <div className="text-[10.5px] text-slate-500">{item.holder.department || 'Đơn vị xử lý'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <DeadlineBadge type={item.deadlineType} text={item.deadlineText} />
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#C62828] hover:bg-[#b71c1c] text-white font-bold text-[11px] transition-all shadow-2xs"
                          >
                            Xử lý
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Lịch sử công việc đã hoàn thành</h2>
                <p className="text-[11px] text-slate-500">Danh mục hồ sơ đã giải quyết xong và lưu trữ số</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              {kpiStats.completedCount} hồ sơ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 w-28">Nguồn &amp; Mã</th>
                  <th className="py-3 px-4 min-w-[260px]">Tên hồ sơ / Kết quả giải quyết</th>
                  <th className="py-3 px-3 w-36">Người nộp</th>
                  <th className="py-3 px-3 w-36">Ngày hoàn thành</th>
                  <th className="py-3 px-3 w-40">Cán bộ phụ trách</th>
                  <th className="py-3 px-3 w-28 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allItemsWithExtra.filter((i) => i.column === 'completed').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl text-slate-300 block mb-1">inventory_2</span>
                      <div className="font-semibold text-slate-700">Chưa có hồ sơ nào trong mục hoàn thành</div>
                    </td>
                  </tr>
                ) : (
                  allItemsWithExtra
                    .filter((i) => i.column === 'completed')
                    .map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            <SourceTypeBadge sourceType={getEffectiveSourceType(item)} />
                            <span className="font-mono font-bold text-slate-800">{item.code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>{item.completionResult || item.actionTitle}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">{item.sender}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{item.completedAt || '16/09/2026'}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{item.holder.name}</div>
                          <div className="text-[10.5px] text-slate-500">{item.holder.department}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-all"
                          >
                            Xem lại
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedItemForAction && (
        <ChuyenTiepNhanModal
          isOpen={isChuyenModalOpen}
          onClose={() => {
            setIsChuyenModalOpen(false);
            setSelectedItemForAction(null);
          }}
          onSubmit={handleChuyenTiepNhanSubmit}
          currentDepartmentId="tiep-dan"
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
      {selectedItemForAction && (
        <BanGiaoDonModal
          isOpen={isBanGiaoModalOpen}
          onClose={() => {
            setIsBanGiaoModalOpen(false);
            setSelectedItemForAction(null);
          }}
          onSubmit={handleBanGiaoDonSubmit}
          currentOfficerName={currentAccount?.name || 'Nguyễn Minh Anh'}
          currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
          donInfo={donInfoForBanGiao}
        />
      )}
      {selectedItemForAction && (
        <TraLaiDonModal
          isOpen={isTraLaiModalOpen}
          onClose={() => {
            setIsTraLaiModalOpen(false);
            setSelectedItemForAction(null);
          }}
          onSubmit={handleTraLaiDonSubmit}
          currentOfficerName={currentAccount?.name || 'Nguyễn Minh Anh'}
          currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
          donInfo={donInfoForTraLai}
        />
      )}
    </div>
  );
}

function getEffectiveSourceType(item: WorkItem): WorkItemSourceType {
  if (item.sourceType) return item.sourceType;
  const code = (item.code || '').toUpperCase();
  if (code.startsWith('LR') || code.startsWith('LN')) return 'luot_nhan';
  if (code.startsWith('VV')) return 'vu_viec';
  if (item.loaiDon?.toLowerCase().includes('vụ việc')) return 'vu_viec';
  if (item.loaiDon?.toLowerCase().includes('lượt nhận')) return 'luot_nhan';
  return 'don';
}
function SourceTypeBadge({ sourceType }: { sourceType: WorkItemSourceType }) {
  if (sourceType === 'luot_nhan') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-sky-50 text-sky-800 border border-sky-200 shrink-0 font-label-technical">
        LƯỢT NHẬN
      </span>
    );
  }
  if (sourceType === 'vu_viec') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-800 border border-purple-200 shrink-0 font-label-technical">
        VỤ VIỆC
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-800 border border-indigo-200 shrink-0 font-label-technical">
      ĐƠN
    </span>
  );
}

// =========================================================================
// THÀNH PHẦN CON: BADGE TRẠNG THÁI CỘT CHÍNH
// =========================================================================
function ColumnStatusBadge({ column }: { column: WorkItemColumn }) {
  switch (column) {
    case 'action_required':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Cần xử lý
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Đang thực hiện
        </span>
      );
    case 'waiting':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <span className="material-symbols-outlined text-[12px] text-sky-600">hourglass_top</span>
          Đang chờ
        </span>
      );
    case 'handed_over':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="material-symbols-outlined text-[12px] text-emerald-600">outbox</span>
          Đã bàn giao
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="material-symbols-outlined text-[12px] text-slate-500">task_alt</span>
          Đã hoàn thành
        </span>
      );
  }
}

// =========================================================================
// THÀNH PHẦN CON: BADGE PHỤ NGHIỆP VỤ (Cần bổ sung, Bị trả lại, Chờ ký...)
// =========================================================================
function SubBusinessBadge({ subStatus }: { subStatus?: WorkItemSubStatus }) {
  if (!subStatus) return null;

  switch (subStatus) {
    case 'can_bo_sung':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-purple-600">attachment</span>
          <span>Cần bổ sung</span>
        </span>
      );
    case 'bi_tra_lai':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-rose-600">replay</span>
          <span>Bị trả lại</span>
        </span>
      );
    case 'can_xac_nhan':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-sky-600">verified_user</span>
          <span>Cần xác nhận</span>
        </span>
      );
    case 'cho_ky':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-indigo-600">draw</span>
          <span>Chờ ký</span>
        </span>
      );
    case 'cho_phe_duyet':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-blue-600">approval</span>
          <span>Chờ phê duyệt</span>
        </span>
      );
    case 'cho_phoi_hop':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-teal-600">diversity_3</span>
          <span>Chờ phối hợp</span>
        </span>
      );
    case 'moi_giao':
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
          <span className="material-symbols-outlined text-[11px] text-cyan-600">fiber_new</span>
          <span>Mới được giao</span>
        </span>
      );
    case 'chua_xu_ly':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          Chưa xử lý
        </span>
      );
    default:
      return null;
  }
}

// =========================================================================
// THÀNH PHẦN CON: BADGE PHỤ TRẠNG THÁI AI
// =========================================================================
function AIStatusBadge({ status, progress }: { status?: AIProcessingStatus; progress?: number }) {
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 shrink-0" title="Module OCR không đọc được tài liệu scan kèm theo (mờ/nghiêng)">
        <span className="material-symbols-outlined text-[11px] text-rose-600">error</span>
        <span>OCR bị lỗi</span>
      </span>
    );
  }
  // if (status === 'none') {
  //   return (
  //     <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 shrink-0" title="Xử lý thủ công theo ghi chú (Không chạy OCR - BR-09)">
  //       <span className="material-symbols-outlined text-[11px] text-slate-500">edit_note</span>
  //       <span>Không OCR</span>
  //     </span>
  //   );
  // }
  if (status === 'needs_review') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200 shrink-0">
        <span className="material-symbols-outlined text-[11px] text-orange-600">warning</span>
        <span>AI cần kiểm tra</span>
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
        <span className="material-symbols-outlined text-[11px] text-blue-600 animate-spin">sync</span>
        <span>AI đang phân tích {progress ? `(${progress}%)` : ''}</span>
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>AI đã phân tích</span>
      </span>
    );
  }
  return null;
}

// =========================================================================
// THÀNH PHẦN CON: BADGE PHỤ DEADLINE
// =========================================================================
function DeadlineBadge({ type, text }: { type: WorkItemDeadlineType; text: string }) {
  if (type === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-label-technical shrink-0">
        <span className="material-symbols-outlined text-[11px] text-rose-600">error</span>
        <span>{text?.includes('Quá hạn') ? text : `Quá hạn ${text || ''}`}</span>
      </span>
    );
  }
  if (type === 'today') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-label-technical shrink-0">
        <span className="material-symbols-outlined text-[11px] text-amber-600">schedule</span>
        <span>{text?.includes('Hôm nay') ? text : `Hôm nay ${text || ''}`}</span>
      </span>
    );
  }
  if (type === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 font-label-technical shrink-0">
        <span className="material-symbols-outlined text-[11px] text-yellow-600">event</span>
        <span>{text}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-technical shrink-0">
      <span>{text}</span>
    </span>
  );
}

// =========================================================================
// THÀNH PHẦN CON: TASK CARD TINH GỌN (QUY TẮC 3-5 GIÂY)
// - Loại nguồn: [Lượt nhận] / [Đơn] / [Vụ việc]
// - Mã hồ sơ
// - Tên hoặc nội dung ngắn
// - Việc cần xử lý
// - Deadline
// - Trạng thái phụ / badge
// - Người đang xử lý nếu cần
// =========================================================================
interface TaskCardProps {
  item: WorkItem;
  onClick: () => void;
  onRetryAI: (e: React.MouseEvent) => void;
  onTiepNhanXuLy?: (item: WorkItem) => void;
  onBanGiao?: (item: WorkItem) => void;
  onBanGiaoDon?: (item: WorkItem) => void;
  onTraLaiDon?: (item: WorkItem) => void;
  onPhanCong?: (item: WorkItem) => void;
}

function TaskCard({ item, onClick, onRetryAI, onTiepNhanXuLy, onBanGiao, onBanGiaoDon, onTraLaiDon, onPhanCong }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isUrgent = item.priority === 'urgent';
  const isOverdue = item.deadlineType === 'overdue';
  const srcType = getEffectiveSourceType(item);
  const actionTitle = item.actionTitle || item.nextAction;

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
      {/* DÒNG 1: [BADGE NGUỒN] [MÃ HỒ SƠ] + CÁC BADGE PHỤ (AI / NGHIỆP VỤ / DEADLINE) */}
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

        {/* TASK TYPE / NGUỒN */}
        <SourceTypeBadge sourceType={srcType} />

        {/* MÃ HỒ SƠ */}
        <span className="font-mono text-[11px] font-bold text-slate-800 group-hover/card:text-[#C62828] transition-colors">
          {item.code}
        </span>

        {/* BADGE PHỤ BÊN PHẢI */}
        <div className="ml-auto flex items-center gap-1 flex-wrap">
          {/* Badge AI nếu có */}
          <AIStatusBadge status={item.aiStatus} progress={item.aiProgress} />

          {/* Badge Nghiệp vụ phụ nếu có */}
          <SubBusinessBadge subStatus={item.subStatus} />

          {/* Badge Deadline */}
          <DeadlineBadge type={item.deadlineType} text={item.deadlineType === 'overdue' ? 'Quá hạn' : item.deadlineType === 'today' ? 'Hôm nay' : item.deadlineType === 'upcoming' ? 'Sắp quá hạn' : 'Trong hạn'} />
        </div>
      </div>

      {/* DÒNG 2: TÊN HOẶC NỘI DUNG NGẮN (TỐI ĐA 2 DÒNG) */}
      <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover/card:text-[#C62828] transition-colors">
        {item.title}
      </h3>
      {item.isSigningDoc && (
        <div className="p-2 rounded-lg bg-slate-50/90 border border-slate-200/90 text-[11px] flex flex-col gap-1 my-0.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400">Người trình:</span>
            <span className="font-semibold text-slate-800 truncate max-w-[170px]">{item.sender}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400">Ngày trình:</span>
            <span className="font-mono text-slate-700">{item.ngayDuocGiao || item.timeReceived}</span>
          </div>
          {item.nguoiKyTruoc && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400">Người ký trước:</span>
              <span className="font-medium text-emerald-700 flex items-center gap-0.5 truncate max-w-[170px]" title={item.nguoiKyTruoc}>
                <span className="material-symbols-outlined text-[13px] text-emerald-600 shrink-0">check_circle</span>
                <span className="truncate">{item.nguoiKyTruoc}</span>
              </span>
            </div>
          )}
          {item.tienTrinhKyHienTai && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
              <span className="text-slate-400">Trạng thái:</span>
              <span className="font-bold text-indigo-700 text-[10.5px] truncate max-w-[180px]">
                {item.tienTrinhKyHienTai}
              </span>
            </div>
          )}
        </div>
      )}

      {/* DÒNG 4: DEADLINE & NGƯỜI ĐANG XỬ LÝ (NẾU ĐANG CHỜ HOẶC ĐÃ BÀN GIAO) */}
      <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-500">
        <div className="flex items-center gap-1">
          <span>Hạn:</span>
          <span className={`font-semibold ${isOverdue ? 'text-rose-700 font-bold' : item.deadlineType === 'today' ? 'text-amber-700 font-bold' : 'text-slate-700'}`}>
            {item.deadlineText}
          </span>
        </div>

        {/* Người đang xử lý (Hiển thị rõ nếu đang chờ hoặc đã bàn giao) */}
        {(item.column === 'waiting' || item.column === 'handed_over') && (
          <div className="flex items-center gap-1 text-[10.5px] text-slate-600 truncate max-w-[140px]" title={item.holder.name}>
            <span className="material-symbols-outlined text-[13px] text-slate-400">person</span>
            <span className="truncate font-medium">{item.holder.name}</span>
          </div>
        )}
      </div>

      {/* FOOTER: THANH TÁC VỤ (CTA NÚT CHÍNH & TÙY CHỌN [...]) */}
      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${item.column === 'action_required'
            ? 'bg-[#C62828] hover:bg-[#b71c1c] text-white shadow-2xs'
            : item.column === 'processing'
              ? 'bg-[#004ac6] hover:bg-[#003ea8] text-white shadow-2xs'
              : 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs'
            }`}
        >
          {item.column === 'action_required' && <span className="material-symbols-outlined text-[14px]">bolt</span>}
          {item.column === 'processing' && <span className="material-symbols-outlined text-[14px]">play_arrow</span>}
          {item.column === 'waiting' && <span className="material-symbols-outlined text-[14px]">visibility</span>}
          {item.column === 'handed_over' && <span className="material-symbols-outlined text-[14px]">sync</span>}
          <span>{item.cta?.label || (item.column === 'action_required' ? 'Xử lý ngay' : item.column === 'processing' ? 'Xử lý' : 'Xem tiến độ')}</span>
        </button>

        {/* NÚT [...] MỞ MENU CHUYỂN TIẾP NHẬN & PHÂN CÔNG */}
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
              {/* Lớp nền trong suốt đóng menu khi click ra ngoài */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />

              {/* Menu dropdown mở lên trên */}
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
                    <span className="material-symbols-outlined text-[17px]">task_alt</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center justify-between">
                      <span>Tiếp nhận xử lý</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">Cá nhân</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Chuyển vào mục Đang thực hiện của tôi</div>
                  </div>
                </button>

                {/* Option 2: Bàn giao đơn (STEP-03C) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (onBanGiaoDon) {
                      onBanGiaoDon(item);
                    } else {
                      onBanGiao?.(item);
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[17px]">swap_horiz</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-amber-800 flex items-center justify-between">
                      <span>Bàn giao đơn</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">STEP-03C</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Chuyển cơ quan khác / lập biên bản</div>
                  </div>
                </button>

                {/* Option 3: Trả lại đơn (STEP-03D) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onTraLaiDon?.(item);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-800 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[17px]">assignment_return</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-rose-800 flex items-center justify-between">
                      <span>Trả lại đơn</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">STEP-03D</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Lập thông báo trả lại công dân</div>
                  </div>
                </button>

                {/* Option 4: Phân công xử lý */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onPhanCong?.(item);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[17px]">assignment_ind</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700">Phân công cán bộ</div>
                    <div className="text-[10.5px] text-slate-500 font-normal truncate">Giao cán bộ chuyên môn phụ trách</div>
                  </div>
                </button>

                {/* Option 5: Thử lại OCR (khi OCR bị lỗi) */}
                {item.aiStatus === 'failed' && onRetryAI && (
                  <button
                    type="button"
                    onClick={(e) => {
                      setShowMenu(false);
                      onRetryAI(e);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer group border-t border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[17px]">sync</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-rose-900 group-hover:text-rose-700 flex items-center justify-between">
                        <span>Thử lại OCR</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">AI Quét lại</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-normal truncate">Quét lại tài liệu &amp; chạy lại OCR</div>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}