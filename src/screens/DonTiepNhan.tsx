import React, { useState, useEffect, useMemo } from 'react';
import { Screen, DonDetail } from "../types";
import TabThongTinChung from '../components/tabs/TabThongTinChung';
import TabMoiLienHe from '../components/tabs/TabMoiLienHe';
import TabDonKhac from '../components/tabs/TabDonKhac';
import TabTaiLieu, { DocItem } from '../components/tabs/TabTaiLieu';
import TabQuyTrinh from '../components/tabs/TabQuyTrinh';
import TabLichSuXuLy, { ProcessHistoryLog } from '../components/tabs/TabLichSuXuLy';
import TabLichSuTrinhKy from '../components/tabs/TabLichSuTrinhKy';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import ThongBaoBoSungModal from '../components/workflow/ThongBaoBoSungModal';
import ThucHienBuocTiepTheoModal from '../components/workflow/ThucHienBuocTiepTheoModal';
import XacMinhVaDeXuatModal, { HuongGiaiQuyetType, VanBanXacMinhItem } from '../components/modals/XacMinhVaDeXuatModal';
import KhongThuLyModal from '../components/modals/KhongThuLyModal';
import TraLaiDonModal, { TraLaiDonSubmitData } from '../components/modals/TraLaiDonModal';
import BanGiaoDonModal, { BanGiaoDonSubmitData } from '../components/modals/BanGiaoDonModal';
import TraLoiDonModal, { TraLoiDonSubmitData } from '../components/modals/TraLoiDonModal';
import ChinhSuaDonModal from '../components/modals/ChinhSuaDonModal';
import BaoCaoXacMinhModal from '../components/modals/BaoCaoXacMinhModal';
import TaoBaoCaoDeXuatModal, { BaoCaoDeXuatFormData } from '../components/modals/TaoBaoCaoDeXuatModal';
import PhanCongModal, { PhanCongSubmitData } from '../components/modals/PhanCongModal';
import GhepDonModal, { GhepDonSubmitData } from '../components/modals/GhepDonModal';
import TaiTaiLieuModal, { TaiTaiLieuSubmitData } from '../components/modals/TaiTaiLieuModal';
import GuiQuyetDinhModal from '../components/modals/GuiQuyetDinhModal';
import LichSuGuiModal from '../components/modals/LichSuGuiModal';
import { QuyetDinhTraLaiInfo, ThongTinGuiQuyetDinh, TrangThaiGuiQuyetDinh } from '../types';
import { SigningDocument, CurrentUserAccount } from '../types/signing';
import { DEPARTMENTS, Department } from '../constants/departments';

interface DonTiepNhanProps {
  onNav: (s: Screen) => void;
  donDetail?: DonDetail | null;
  /** Khi true: tự động mở XacMinhVaDeXuatModal ngay khi vào màn */
  openXacMinhOnEnter?: boolean;
  /** Callback báo App đã xử lý flag, để reset về false */
  onXacMinhOpened?: () => void;
  onCreateSigningDocument?: (doc: SigningDocument) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: React.Dispatch<React.SetStateAction<SigningDocument[]>>;
  onSelectSigningDoc?: (docId: string) => void;
  currentAccount?: CurrentUserAccount;
  onUpdateDon?: (don: DonDetail) => void;
}

export const HUONG_XU_LY_CONFIG: Record<
  HuongGiaiQuyetType,
  {
    label: string;
    subLabel: string;
    badgeColor: string;
    buttonText: string;
    icon: string;
  }
> = {
  thu_ly: {
    label: 'Thụ lý',
    subLabel: 'Đủ điều kiện thụ lý giải quyết theo quy định',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    buttonText: 'Thụ lý',
    icon: 'gavel',
  },
  khong_thu_ly: {
    label: 'Không thụ lý',
    subLabel: 'Không đủ điều kiện thụ lý theo quy định',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
    buttonText: 'Không thụ lý',
    icon: 'cancel',
  },
  yeu_cau_bo_sung: {
    label: 'Yêu cầu bổ sung',
    subLabel: 'Chưa đủ chứng cứ hoặc hồ sơ theo quy định',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
    buttonText: 'Yêu cầu bổ sung',
    icon: 'note_add',
  },
  tra_lai: {
    label: 'Trả lại',
    subLabel: 'Trả lại đơn và kèm phiếu hướng dẫn công dân',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    buttonText: 'Trả lại',
    icon: 'assignment_return',
  },
  ban_giao: {
    label: 'Chuyển thẩm quyền xử lý',
    subLabel: 'Chuyển đơn đến cơ quan có thẩm quyền giải quyết',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    buttonText: 'Chuyển thẩm quyền xử lý',
    icon: 'drive_file_move',
  },
  tra_loi_don: {
    label: 'Trả lời đơn',
    subLabel: 'Lập văn bản trả lời, giải thích cho công dân',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-300',
    buttonText: 'Trả lời đơn',
    icon: 'reply',
  },
};

export default function DonTiepNhan({
  onNav,
  donDetail,
  openXacMinhOnEnter,
  onXacMinhOpened,
  onCreateSigningDocument,
  signingDocuments = [],
  onUpdateSigningDocuments,
  onSelectSigningDoc,
  currentAccount,
  onUpdateDon,
}: DonTiepNhanProps) {
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'lien-he' | 'don-khac' | 'tai-lieu' | 'quy-trinh' | 'lich-su' | 'lich-su-trinh-ky'>('thong-tin');
  const [docCount, setDocCount] = useState<number>(6);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [historyLogs, setHistoryLogs] = useState<ProcessHistoryLog[]>([
    {
      id: 'LOG-05',
      time: '17/09/2026 15:30:00',
      title: 'Lập Biên bản làm việc xác minh thông tin ban đầu',
      actor: 'Nguyễn Minh Anh',
      actorRole: 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'xac_minh',
      statusBadge: {
        text: 'Xác minh hồ sơ',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200',
      },
      description: 'Tổ chức làm việc trực tiếp với người gửi đơn (ông Nguyễn Văn A). Ghi nhận ý kiến trình bày và tiếp nhận bổ sung bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền để đối chiếu tính pháp lý.',
      note: 'Căn cứ Điều 28 Luật Khiếu nại 2011 và Quy trình tiếp nhận, xử lý đơn khiếu nại.',
      docInfo: {
        name: 'Biên bản làm việc xác minh thông tin ban đầu',
        code: '02/BB-XM',
        type: 'bien_ban',
      },
    },
    {
      id: 'LOG-04',
      time: '16/09/2026 14:00:00',
      title: 'Ban hành Giấy mời làm việc với người gửi đơn',
      actor: 'Nguyễn Minh Anh',
      actorRole: 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'van_ban',
      statusBadge: {
        text: 'Ban hành văn bản',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-800',
        borderClass: 'border-purple-200',
      },
      description: 'Lập và ban hành Giấy mời số 18/GM-TCD gửi công dân Nguyễn Văn A, thời gian hẹn: 08:30 ngày 18/09/2026 tại Trụ sở Tiếp công dân để làm rõ nội dung yêu cầu trong đơn.',
      docInfo: {
        name: 'Giấy mời làm việc với người gửi đơn',
        code: '18/GM-TCD',
        type: 'giay_moi',
      },
    },
    {
      id: 'LOG-03',
      time: '16/09/2026 10:20:30',
      title: 'Trợ lý AI phân tích tính pháp lý & Đối soát hồ sơ',
      actor: 'Hệ thống AI Nghiệp vụ',
      actorRole: 'Hỗ trợ xử lý thông minh',
      actorDept: 'Trung tâm Phân tích dữ liệu',
      category: 'xac_minh',
      statusBadge: {
        text: 'Phân tích AI',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-800',
        borderClass: 'border-blue-200',
      },
      description: 'Hệ thống AI tự động OCR, trích xuất dữ liệu đối soát CCCD và cơ sở dữ liệu dân cư. Phát hiện nội dung có liên quan đến tranh chấp đất đai, gợi ý cần thu thập thêm chứng từ hợp đồng gốc.',
    },
    {
      id: 'LOG-02',
      time: '16/09/2026 10:15:00',
      title: 'Phân công cán bộ thụ lý hồ sơ',
      actor: 'Trần Văn Hưng',
      actorRole: 'Trưởng phòng',
      actorDept: 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'tiep_nhan',
      statusBadge: {
        text: 'Phân công',
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-800',
        borderClass: 'border-indigo-200',
      },
      description: 'Chuyển giao và phân công cán bộ Nguyễn Minh Anh trực tiếp thụ lý, kiểm tra điều kiện thụ lý và đề xuất phương án xử lý theo quy định.',
      note: 'Thời hạn giải quyết bước ban đầu: 05 ngày làm việc kể từ ngày tiếp nhận.',
    },
    {
      id: 'LOG-01',
      time: '16/09/2026 09:30:15',
      title: 'Tiếp nhận hồ sơ đơn vào hệ thống',
      actor: 'Lê Ngọc Mai',
      actorRole: 'Cán bộ Một cửa',
      actorDept: 'Bộ phận Tiếp nhận hồ sơ & Trả kết quả',
      category: 'tiep_nhan',
      statusBadge: {
        text: 'Tiếp nhận',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-200',
      },
      description: 'Tiếp nhận đơn trực tiếp từ công dân. Đã kiểm tra căn cước công dân, quét số hóa đơn và cấp mã hồ sơ chính thức Đ-2025-0105 (từ lượt nhận LN-2025-0105).',
    },
  ]);

  const addHistoryLog = (newLog: Omit<ProcessHistoryLog, 'id' | 'time'>) => {
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    const created: ProcessHistoryLog = {
      id: `LOG-${Date.now()}`,
      time: timeStr,
      ...newLog,
    };
    setHistoryLogs((prev) => [created, ...prev]);
  };

  // Trạng thái xác minh thông tin đơn: 'dang_xac_minh' -> 'da_xac_minh'
  const isInitiallyVerified = Boolean(
    donDetail?.statusBadge?.includes('Đã xác minh') ||
    donDetail?.statusBadge?.includes('Đã thụ lý') ||
    donDetail?.statusBadge?.includes('Đã hoàn thành')
  );

  const [trangThaiXacMinh, setTrangThaiXacMinh] = useState<'chua_xac_minh' | 'da_xac_minh'>(
    isInitiallyVerified ? 'da_xac_minh' : 'chua_xac_minh'
  );

  // Kiểm tra xem đơn có bị thiếu tài liệu (AI phân tích đơn)
  const isAiNeedsMissingDocs = Boolean(
    donDetail?.title?.toLowerCase().includes('thiếu') ||
    donDetail?.title?.toLowerCase().includes('bổ sung') ||
    donDetail?.code?.includes('0105') ||
    !donDetail
  );

  const initialSuggestedHuong: HuongGiaiQuyetType = isAiNeedsMissingDocs ? 'yeu_cau_bo_sung' : 'thu_ly';
  const [huongXuLyDaChon, setHuongXuLyDaChon] = useState<HuongGiaiQuyetType>(initialSuggestedHuong);
  const [showHuongDropdown, setShowHuongDropdown] = useState<boolean>(false);

  // State các Modal
  const [showXacMinhModal, setShowXacMinhModal] = useState<boolean>(false);
  const [showModalBoSung, setShowModalBoSung] = useState(false);
  const [showModalBuocTiepTheo, setShowModalBuocTiepTheo] = useState(false);
  const [showKhongThuLyModal, setShowKhongThuLyModal] = useState(false);
  const [showTraLaiModal, setShowTraLaiModal] = useState(false);
  const [showBanGiaoModal, setShowBanGiaoModal] = useState(false);
  const [showTraLoiDonModal, setShowTraLoiDonModal] = useState(false);
  const [showChinhSuaModal, setShowChinhSuaModal] = useState(false);
  const [isEditingThongTinDon, setIsEditingThongTinDon] = useState<boolean>(false);
  const [showBaoCaoXacMinhModal, setShowBaoCaoXacMinhModal] = useState(false);
  const [showTaoBaoCaoDeXuatModal, setShowTaoBaoCaoDeXuatModal] = useState(false);
  const [showThaoTacKhacDropdown, setShowThaoTacKhacDropdown] = useState<boolean>(false);
  const [showPhanCongModal, setShowPhanCongModal] = useState<boolean>(false);
  const [showGhepDonModal, setShowGhepDonModal] = useState<boolean>(false);
  const [showTaiTaiLieuModal, setShowTaiTaiLieuModal] = useState<boolean>(false);
  const [daHoanThanhBuoc, setDaHoanThanhBuoc] = useState(false);
  const [daGuiThongBaoBoSung, setDaGuiThongBaoBoSung] = useState(false);

  // State phục vụ luồng sau khi Lãnh đạo ký văn bản quyết định hướng xử lý
  const [showTaoVuViecModal, setShowTaoVuViecModal] = useState<boolean>(false);
  const [showInThongBaoModal, setShowInThongBaoModal] = useState<boolean>(false);
  const [showXacNhanChuyenModal, setShowXacNhanChuyenModal] = useState<boolean>(false);
  const [selectedDonViNhanId, setSelectedDonViNhanId] = useState<string>(DEPARTMENTS[1]?.id || 'pc03');
  const [isChuyenThamQuyenSuccess, setIsChuyenThamQuyenSuccess] = useState<boolean>(false);
  const [banGiaoData, setBanGiaoData] = useState<{
    donViNhanId: string;
    donViNhanName: string;
    thoiGianChuyen: string;
    nguoiChuyen: string;
    soVanBan: string;
  } | null>(null);

  // State phục vụ Bước 3 & Bước 4: Gửi quyết định trả lại đơn cho đương sự
  const [showGuiQuyetDinhModal, setShowGuiQuyetDinhModal] = useState<boolean>(false);
  const [guiQuyetDinhMode, setGuiQuyetDinhMode] = useState<'send' | 'resend' | 'bo_sung_chung_tu'>('send');
  const [showLichSuGuiModal, setShowLichSuGuiModal] = useState<boolean>(false);

  // State theo dõi việc đã khởi tạo văn bản Báo cáo đề xuất cho hồ sơ đơn
  const [hasCreatedBaoCaoDeXuat, setHasCreatedBaoCaoDeXuat] = useState<boolean>(false);

  // Danh sách văn bản xác minh dùng chung giữa Modal Xác minh và Tab Hồ sơ & Văn bản
  const [vanBanXacMinhList, setVanBanXacMinhList] = useState<VanBanXacMinhItem[]>([
    {
      id: 'DOC-XM-01',
      loai: 'giay_moi',
      tenVanBan: 'Giấy mời làm việc với người gửi đơn',
      soKyHieu: '18/GM-TCD',
      ngayLap: '16/09/2026',
      nguoiNhan: 'Nguyễn Văn A',
      trichYeu: 'V/v Làm việc, cung cấp thông tin, tài liệu liên quan đến nội dung đơn',
      thoiGianHen: '08:30 ngày 18/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
      noiDungChiTiet: 'Kính mời Ông/Bà Nguyễn Văn A có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày 16/09/2026.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.',
      trangThai: 'da_ban_hanh',
    },
    {
      id: 'DOC-XM-02',
      loai: 'bien_ban',
      tenVanBan: 'Biên bản làm việc xác minh thông tin ban đầu',
      soKyHieu: '02/BB-XM',
      ngayLap: '17/09/2026',
      nguoiNhan: 'Nguyễn Văn A (Người đứng đơn)',
      trichYeu: 'Ghi nhận ý kiến trình bày và tiếp nhận tài liệu gốc của công dân',
      thoiGianHen: '14:30 ngày 17/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
      noiDungChiTiet: 'Tại buổi làm việc, công dân Nguyễn Văn A khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nCán bộ thụ lý đã tiếp nhận, kiểm tra tính pháp lý ban đầu và lập biên nhận bàn giao tài liệu phục vụ xác minh.',
      trangThai: 'du_thao',
    },
  ]);

  // Văn bản đang được mở chỉnh sửa trực tiếp tại tab Hồ sơ & Văn bản
  const [editingDocInTab, setEditingDocInTab] = useState<any | null>(null);

  // Chuyển sang Tab Hồ sơ & Văn bản để chỉnh sửa trực tiếp văn bản
  const handleOpenDocInTab = (docData: any, allDocs?: VanBanXacMinhItem[]) => {
    setShowXacMinhModal(false);
    if (allDocs && allDocs.length > 0) {
      setVanBanXacMinhList(allDocs);
    }
    setEditingDocInTab(docData);
    setActiveTab('tai-lieu');
    showToast(`✓ Đã chuyển sang tab "Hồ sơ & Văn bản" để chỉnh sửa trực tiếp: ${docData.soHieu || docData.tenVanBan}`);
  };

  // Chuyển sang Tab Hồ sơ & Văn bản để xem văn bản từ quy trình
  const handleViewDocInTabTaiLieu = (docInfo?: {
    tenVanBan: string;
    soHieu?: string;
    loai?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
  }) => {
    if (docInfo) {
      const docItem = {
        id: `DOC-WF-${Date.now()}`,
        tenVanBan: docInfo.tenVanBan,
        soHieu: docInfo.soHieu || '01/VB-TC',
        loai: docInfo.loai || 'thong_bao',
        category: 'Văn bản quy trình',
        ngayLap: '16/09/2026',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        coQuanBanHanh: 'UBND quận Cầu Giấy / Phòng Tiếp công dân & Xử lý đơn',
        trichYeu: docInfo.trichYeu || docInfo.tenVanBan,
        noiDungChiTiet: docInfo.noiDungChiTiet || `Nội dung văn bản: ${docInfo.tenVanBan}\nBan hành theo quy trình xử lý đơn số ${currentDon.code}.`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        trangThai: 'da_ban_hanh',
        fromXacMinh: true,
      };
      setEditingDocInTab(docItem);
    }
    setActiveTab('tai-lieu');
    showToast(`✓ Đã chuyển về tab "Hồ sơ & Văn bản" để xem văn bản: ${docInfo?.tenVanBan || ''}`);
  };

  // Tự động mở modal nếu được yêu cầu từ props (nếu có)
  useEffect(() => {
    if (openXacMinhOnEnter) {
      setShowXacMinhModal(true);
      onXacMinhOpened?.();
    }
  }, [openXacMinhOnEnter, onXacMinhOpened]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const defaultDon: DonDetail = {
    id: "Đ-2025-0105",
    code: "Đ-2025-0105",
    title: "Tố cáo hành vi vi phạm trật tự xây dựng và quản lý đất đai",
    luotNhanId: "LN-2025-0105",
    nguoiNop: "Vũ Thị Thanh",
    ngayNhan: "16/09/2026 09:30",
    loaiDon: "Đơn tố cáo",
    canBoTiepNhan: "Nguyễn Minh Anh",
    chucVuCanBo: "Chuyên viên Tiếp nhận",
    donViXuLy: "Phòng Tiếp công dân & Xử lý đơn",
    cccd: "001088012345",
    sdt: "0983 123 456",
    diaChi: "Số 15 đường Cầu Giấy, phường Quan Hoa, quận Cầu Giấy, Hà Nội",
    noiDung: "Tố cáo hành vi vi phạm quy định pháp luật trong quản lý đất đai và trật tự xây dựng",
  };

  const [currentDon, setCurrentDon] = useState<DonDetail>(donDetail || defaultDon);

  useEffect(() => {
    if (donDetail) {
      setCurrentDon(donDetail);
      if (donDetail.fromBanPhanTich || donDetail.hasBaoCaoDeXuat === false) {
        setHasCreatedBaoCaoDeXuat(false);
      } else if (donDetail.hasBaoCaoDeXuat === true) {
        setHasCreatedBaoCaoDeXuat(true);
      }
    }
  }, [donDetail]);
  const isAwaitingAcceptance = Boolean(
    currentDon.isAwaitingAcceptance ||
    currentDon.statusBadge === 'Chờ tiếp nhận' ||
    currentDon.isNoFileTransfer
  );
  const existingSigningDoc = useMemo(() => {
    return (
      signingDocuments?.find(
        (d) =>
          (d.hoSoCode === currentDon.code || d.hoSoCode === currentDon.id || (currentDon.luotNhanId && d.luotNhanId === currentDon.luotNhanId)) &&
          (d.loaiVanBan === 'bao_cao_de_xuat' ||
            d.loaiVanBan === 'to_trinh_thu_ly' ||
            d.loaiVanBan === 'bao_cao_xac_minh' ||
            d.loaiVanBanLabel?.toLowerCase().includes('đề xuất') ||
            d.tenVanBan?.toLowerCase().includes('đề xuất') ||
            d.tenVanBan?.toLowerCase().includes('báo cáo'))
      ) || null
    );
  }, [signingDocuments, currentDon.code, currentDon.id, currentDon.luotNhanId]);
  const isBaoCaoDaTrinhKy = Boolean(
    (existingSigningDoc && existingSigningDoc.status !== 'nhap') ||
    currentDon.statusBadge === 'Chờ phê duyệt' ||
    currentDon.statusBadge === 'Đang trình ký' ||
    currentDon.statusBadge === 'Đã trình ký' ||
    currentDon.statusBadge === 'Chờ duyệt ký'
  );
  useEffect(() => {
    if (existingSigningDoc) {
      const pa = (existingSigningDoc as any).formData?.phuongAnDeXuat;
      if (pa === 1) {
        setHuongXuLyDaChon('thu_ly');
      } else if (pa === 2) {
        setHuongXuLyDaChon('ban_giao');
      } else if (pa === 3) {
        setHuongXuLyDaChon('khong_thu_ly');
      } else if (pa === 4) {
        setHuongXuLyDaChon('yeu_cau_bo_sung');
      } else if (existingSigningDoc.noiDungChiTiet || existingSigningDoc.trichYeu || existingSigningDoc.tenVanBan) {
        const text = `${existingSigningDoc.tenVanBan} ${existingSigningDoc.trichYeu} ${existingSigningDoc.noiDungChiTiet}`.toLowerCase();
        if (text.includes('thụ lý giải quyết') || text.includes('đề xuất thụ lý') || text.includes('thụ lý')) {
          setHuongXuLyDaChon('thu_ly');
        } else if (text.includes('chuyển đơn') || text.includes('bàn giao') || text.includes('chuyển thẩm quyền')) {
          setHuongXuLyDaChon('ban_giao');
        } else if (text.includes('không thụ lý') || text.includes('lưu đơn')) {
          setHuongXuLyDaChon('khong_thu_ly');
        } else if (text.includes('bổ sung')) {
          setHuongXuLyDaChon('yeu_cau_bo_sung');
        }
      }
    }
  }, [existingSigningDoc]);

  // Kiểm tra báo cáo đề xuất đã được ký duyệt chính thức chưa (đã ký / hoàn tất)
  const isBaoCaoDaKy = Boolean(
    (existingSigningDoc &&
      (existingSigningDoc.status === 'da_ky' || existingSigningDoc.status === 'hoan_tat')) ||
    currentDon?.statusBadge?.includes('Đã ký') ||
    currentDon?.statusBadge?.includes('Đã thụ lý')
  );

  // Kiểm tra văn bản trả lại đơn của hồ sơ này
  const existingTraLaiSigningDoc = useMemo(() => {
    return (
      signingDocuments?.find(
        (d) => d.hoSoCode === currentDon.code && d.loaiVanBan === 'van_ban_tra_lai'
      ) || null
    );
  }, [signingDocuments, currentDon.code]);

  // Khi văn bản trả lại đơn đã được Lãnh đạo ký duyệt (status === 'da_ky' || 'hoan_tat')
  // thì quy trình trả lại đơn mới chính thức kết thúc
  useEffect(() => {
    if (
      existingTraLaiSigningDoc &&
      (existingTraLaiSigningDoc.status === 'da_ky' || existingTraLaiSigningDoc.status === 'hoan_tat') &&
      currentDon.statusBadge !== 'Đã trả lại đơn'
    ) {
      setCurrentDon((prev) => ({
        ...prev,
        statusBadge: 'Đã trả lại đơn',
      }));
      setHuongXuLyDaChon('tra_lai');
    }
  }, [existingTraLaiSigningDoc, currentDon.statusBadge]);

  // Tự động đồng bộ trạng thái hồ sơ khi văn bản đề xuất / báo cáo đã được trình ký
  useEffect(() => {
    if (
      !currentDon.fromBanPhanTich &&
      currentDon.hasBaoCaoDeXuat !== false &&
      !currentDon.isAwaitingAcceptance &&
      existingSigningDoc &&
      existingSigningDoc.status !== 'nhap' &&
      currentDon.statusBadge !== 'Chờ tiếp nhận' &&
      currentDon.statusBadge !== 'Chờ phê duyệt' &&
      currentDon.statusBadge !== 'Đã thụ lý' &&
      currentDon.statusBadge !== 'Đã giải quyết' &&
      currentDon.statusBadge !== 'Đã trả lại đơn'
    ) {
      setTrangThaiXacMinh('da_xac_minh');
      if ((currentDon.currentStep || 1) < 2) {
        setActiveStepNumber(2);
      }
      setCurrentDon((prev) => ({
        ...prev,
        currentStep: Math.max(prev.currentStep || 1, 2),
        statusBadge:
          existingSigningDoc.status === 'da_ky' || existingSigningDoc.status === 'hoan_tat'
            ? 'Đã ký duyệt'
            : 'Chờ phê duyệt',
      }));
    }
  }, [existingSigningDoc, currentDon.fromBanPhanTich, currentDon.hasBaoCaoDeXuat, currentDon.isAwaitingAcceptance, currentDon.statusBadge]);

  // 1. Tìm văn bản Quyết định giải quyết (QĐ Thụ lý, TB Không thụ lý, Phiếu hướng dẫn trả lại, Phiếu chuyển đơn)
  const quyetDinhSigningDoc = useMemo(() => {
    return (
      signingDocuments?.find(
        (d) =>
          (d.hoSoCode === currentDon.code || d.hoSoCode === currentDon.id || (currentDon.luotNhanId && d.luotNhanId === currentDon.luotNhanId)) &&
          (d.loaiVanBan === 'quyet_dinh_thu_ly' ||
            d.loaiVanBan === 'thong_bao_khong_thu_ly' ||
            d.loaiVanBan === 'van_ban_tra_lai' ||
            d.loaiVanBan === 'bien_ban_ban_giao' ||
            (d.loaiVanBan as string) === 'phieu_chuyen_don' ||
            (d.loaiVanBan as string) === 'quyet_dinh' ||
            d.loaiVanBanLabel?.toLowerCase().includes('quyết định') ||
            d.loaiVanBanLabel?.toLowerCase().includes('không thụ lý') ||
            d.loaiVanBanLabel?.toLowerCase().includes('trả lại') ||
            d.loaiVanBanLabel?.toLowerCase().includes('chuyển') ||
            d.tenVanBan?.toLowerCase().includes('quyết định') ||
            d.tenVanBan?.toLowerCase().includes('không thụ lý') ||
            d.tenVanBan?.toLowerCase().includes('trả lại') ||
            d.tenVanBan?.toLowerCase().includes('chuyển đơn'))
      ) || null
    );
  }, [signingDocuments, currentDon.code, currentDon.id, currentDon.luotNhanId]);

  // Phân loại nhánh xử lý dựa trên văn bản quyết định
  const quyetDinhBranch = useMemo<'thu_ly' | 'khong_thu_ly' | 'tra_lai' | 'ban_giao' | null>(() => {
    if (!quyetDinhSigningDoc) return null;
    const lv = quyetDinhSigningDoc.loaiVanBan;
    const name = `${quyetDinhSigningDoc.tenVanBan || ''} ${quyetDinhSigningDoc.loaiVanBanLabel || ''}`.toLowerCase();
    if (lv === 'thong_bao_khong_thu_ly' || (lv as string) === 'quyet_dinh_khong_thu_ly' || name.includes('không thụ lý')) return 'khong_thu_ly';
    if (lv === 'quyet_dinh_thu_ly' || name.includes('thụ lý')) return 'thu_ly';
    if (lv === 'van_ban_tra_lai' || name.includes('trả lại') || name.includes('hướng dẫn')) return 'tra_lai';
    if (lv === 'bien_ban_ban_giao' || (lv as string) === 'phieu_chuyen_don' || name.includes('chuyển') || name.includes('bàn giao')) return 'ban_giao';
    return null;
  }, [quyetDinhSigningDoc]);

  // Trạng thái phê duyệt / ký của văn bản quyết định
  const decisionStatus = useMemo<'chua_tao' | 'cho_ky' | 'da_ky' | 'yeu_cau_sua' | 'tu_choi'>(() => {
    if (!quyetDinhSigningDoc || quyetDinhSigningDoc.status === 'nhap') {
      return 'chua_tao';
    }
    if (quyetDinhSigningDoc.status === 'da_ky' || quyetDinhSigningDoc.status === 'hoan_tat') {
      return 'da_ky';
    }
    if (quyetDinhSigningDoc.status === 'yeu_cau_chinh_sua') {
      return 'yeu_cau_sua';
    }
    if (quyetDinhSigningDoc.status === 'tu_choi') {
      return 'tu_choi';
    }
    return 'cho_ky';
  }, [quyetDinhSigningDoc]);

  // Đối tượng Thông tin Quyết định trả lại đơn (phục vụ Bước 3 & Bước 4)
  const currentQuyetDinhTraLai = useMemo<QuyetDinhTraLaiInfo>(() => {
    if (currentDon.quyetDinhTraLai) {
      return currentDon.quyetDinhTraLai;
    }
    const signerName =
      quyetDinhSigningDoc?.chuKy?.nguoiKy ||
      quyetDinhSigningDoc?.lanhDaoName ||
      'Trần Văn Cường';
    const signerRole =
      quyetDinhSigningDoc?.chuKy?.chucVu ||
      quyetDinhSigningDoc?.lanhDaoChucVu ||
      'Phó Chủ tịch UBND quận Cầu Giấy';
    const docFile =
      quyetDinhSigningDoc?.tepDinhKem?.[0]
        ? {
          name: quyetDinhSigningDoc.tepDinhKem[0].tenTep,
          size: quyetDinhSigningDoc.tepDinhKem[0].dungLuong,
        }
        : {
          name: `Quyet_dinh_tra_lai_don_${currentDon.code.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          size: '1.8 MB',
        };

    return {
      soQuyetDinh: quyetDinhSigningDoc?.soKyHieu || `08/TB-TLĐ/2026/UBND-${currentDon.code}`,
      ngayBanHanh: quyetDinhSigningDoc?.ngayTao || currentDon.ngayNhan?.split(' ')[0] || '16/09/2026',
      nguoiKy: signerName,
      chucVuNguoiKy: signerRole,
      thoiDiemKy: quyetDinhSigningDoc?.thoiGianKy || quyetDinhSigningDoc?.chuKy?.thoiGianKy || '16/09/2026 14:30',
      tepQuyetDinh: docFile,
      lyDoTraLai:
        (currentDon as any).lyDoTraLai ||
        quyetDinhSigningDoc?.trichYeu ||
        'Đơn không thuộc thẩm quyền giải quyết của UBND quận Cầu Giấy theo quy định tại Điều 28 Thông tư 05/2021/TT-TTCP. Hướng dẫn công dân nộp đơn đến Tòa án nhân dân hoặc cơ quan có thẩm quyền đúng quy định pháp luật.',
      canCuPhapLy: 'Căn cứ Luật Khiếu nại số 02/2011/QH13 và Thông tư số 05/2021/TT-TTCP của Thanh tra Chính phủ.',
      trangThaiGui: currentDon.trangThaiGuiQuyetDinh || 'cho_gui',
      thongTinGuiHienTai: undefined,
      lichSuGui: [],
    };
  }, [
    currentDon.quyetDinhTraLai,
    currentDon.trangThaiGuiQuyetDinh,
    currentDon.code,
    currentDon.ngayNhan,
    quyetDinhSigningDoc,
  ]);

  // Handler: Lưu nháp thông tin gửi quyết định (Trạng thái vẫn là "Chờ gửi cho đương sự")
  const handleSaveDraftGuiQuyetDinh = (thongTinDraft: Partial<ThongTinGuiQuyetDinh>) => {
    const fullDraft: ThongTinGuiQuyetDinh = {
      id: thongTinDraft.id || `DRAFT-GUI-${Date.now()}`,
      lanGui: thongTinDraft.lanGui || 1,
      ngayGui: thongTinDraft.ngayGui || new Date().toLocaleDateString('vi-VN'),
      gioGui: thongTinDraft.gioGui || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      nguoiThucHien: thongTinDraft.nguoiThucHien || currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      phuongThuc: thongTinDraft.phuongThuc || 'buu_chinh',
      trangThai: 'cho_gui',
      nguoiNhan: thongTinDraft.nguoiNhan || currentDon.nguoiNop || 'Công dân nộp đơn',
      diaChiNhan: thongTinDraft.diaChiNhan || currentDon.diaChi || '',
      sdtNhan: thongTinDraft.sdtNhan || currentDon.sdt,
      emailNhan: thongTinDraft.emailNhan,
      ...thongTinDraft,
    };

    const updatedQuyetDinh: QuyetDinhTraLaiInfo = {
      ...currentQuyetDinhTraLai,
      trangThaiGui: 'cho_gui', // Lưu nháp không thay đổi trạng thái Chờ gửi
      thongTinGuiHienTai: fullDraft,
    };

    const updatedDonData: DonDetail = {
      ...currentDon,
      quyetDinhTraLai: updatedQuyetDinh,
      trangThaiGuiQuyetDinh: 'cho_gui',
    };

    setCurrentDon(updatedDonData);
    onUpdateDon?.(updatedDonData);
    setShowGuiQuyetDinhModal(false);

    showToast('✓ Đã lưu thông tin gửi (Bản nháp). Trạng thái vẫn là "Chờ gửi cho đương sự".');

    addHistoryLog({
      title: 'Lưu thông tin gửi quyết định trả lại đơn (Bản nháp)',
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
      actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'ghi_chu',
      statusBadge: {
        text: 'Chờ gửi',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-300',
      },
      description: `Cán bộ đã lưu nháp thông tin gửi văn bản theo phương thức "${thongTinDraft.phuongThuc === 'truc_tiep'
        ? 'Trực tiếp'
        : thongTinDraft.phuongThuc === 'buu_chinh'
          ? 'Bưu chính'
          : 'Điện tử'
        }". Người nhận dự kiến: ${thongTinDraft.nguoiNhan} (${thongTinDraft.diaChiNhan}).`,
    });
  };

  // Handler: Xác nhận gửi / Gửi lại / Bổ sung chứng từ (Chuyển sang Bước 4 - Đã gửi / Đã giao nhận)
  const handleConfirmSendQuyetDinh = (newThongTin: ThongTinGuiQuyetDinh) => {
    const isResend = guiQuyetDinhMode === 'resend';
    const isBoSung = guiQuyetDinhMode === 'bo_sung_chung_tu';

    const oldHistory = currentQuyetDinhTraLai.lichSuGui || [];
    let updatedHistory = [...oldHistory];

    if (isBoSung && currentQuyetDinhTraLai.thongTinGuiHienTai) {
      updatedHistory = updatedHistory.map((item) =>
        item.id === newThongTin.id ? newThongTin : item
      );
    } else {
      updatedHistory = [newThongTin, ...updatedHistory];
    }

    const newTrangThai: TrangThaiGuiQuyetDinh = newThongTin.trangThai; // 'da_gui' | 'da_giao_nhan' | 'gui_that_bai'

    const updatedQuyetDinh: QuyetDinhTraLaiInfo = {
      ...currentQuyetDinhTraLai,
      trangThaiGui: newTrangThai,
      thongTinGuiHienTai: newThongTin,
      lichSuGui: updatedHistory,
    };

    const updatedDonData: DonDetail = {
      ...currentDon,
      statusBadge: 'Đã trả lại đơn', // Trạng thái xử lý đơn giữ nguyên
      quyetDinhTraLai: updatedQuyetDinh,
      trangThaiGuiQuyetDinh: newTrangThai,
    };

    setCurrentDon(updatedDonData);
    onUpdateDon?.(updatedDonData);
    setShowGuiQuyetDinhModal(false);

    const phuongThucLabel =
      newThongTin.phuongThuc === 'truc_tiep'
        ? 'Giao trực tiếp tại trụ sở'
        : newThongTin.phuongThuc === 'buu_chinh'
          ? `Bưu chính (${newThongTin.donViVanChuyen || 'VNPost'}${newThongTin.maVanDon ? ` - Vận đơn: ${newThongTin.maVanDon}` : ''})`
          : 'Cổng DVC / Dịch vụ công điện tử';

    showToast(
      newTrangThai === 'da_giao_nhan'
        ? `✓ Đã ghi nhận bàn giao quyết định trả lại đơn trực tiếp thành công cho công dân ${newThongTin.nguoiNhan}!`
        : `✓ Đã ghi nhận gửi quyết định trả lại đơn cho đương sự thành công qua ${phuongThucLabel}!`
    );

    addHistoryLog({
      title: isResend
        ? `Gửi lại quyết định trả lại đơn (Lần ${newThongTin.lanGui}) cho đương sự`
        : isBoSung
          ? `Bổ sung chứng từ giao nhận quyết định trả lại đơn`
          : `Gửi quyết định trả lại đơn cho đương sự (${phuongThucLabel})`,
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
      actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'van_ban',
      statusBadge: {
        text: newTrangThai === 'da_giao_nhan' ? 'Đã giao/nhận' : 'Đã gửi cho đương sự',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-300',
      },
      description: `Phương thức: ${phuongThucLabel}. Người nhận: ${newThongTin.nguoiNhan} (${newThongTin.diaChiNhan}). ${newThongTin.maVanDon ? `Mã vận đơn: ${newThongTin.maVanDon}. ` : ''
        }${newThongTin.ghiChu ? `Ghi chú: ${newThongTin.ghiChu}. ` : ''}${newThongTin.lyDoGuiLai ? `Lý do gửi lại: ${newThongTin.lyDoGuiLai}. ` : ''
        }${newThongTin.chungTuList && newThongTin.chungTuList.length > 0
          ? `Chứng từ kèm theo: ${newThongTin.chungTuList.map((c) => c.name).join(', ')}.`
          : ''
        }`,
      docInfo: {
        name: currentQuyetDinhTraLai.tepQuyetDinh?.name || 'Quyết định trả lại đơn',
        code: currentQuyetDinhTraLai.soQuyetDinh,
        type: 'quyet_dinh',
      },
    });
  };

  // Bắt buộc phải có tạo Báo cáo đề xuất trước thì mới mở khóa các nút hướng xử lý
  const hasBaoCaoDeXuat = Boolean(
    hasCreatedBaoCaoDeXuat ||
    currentDon.hasBaoCaoDeXuat === true ||
    (!currentDon.fromBanPhanTich && currentDon.hasBaoCaoDeXuat !== false && !isAwaitingAcceptance && (
      (existingSigningDoc && existingSigningDoc.hoSoCode === currentDon.code) ||
      isBaoCaoDaTrinhKy ||
      quyetDinhSigningDoc ||
      decisionStatus !== 'chua_tao'
    ))
  );

  // Tự động đồng bộ trạng thái hồ sơ theo kết quả phê duyệt của Lãnh đạo
  useEffect(() => {
    if (decisionStatus === 'cho_ky') {
      if (currentDon.statusBadge !== 'Chờ lãnh đạo ký' && currentDon.statusBadge !== 'Chờ duyệt ký') {
        setCurrentDon((prev) => ({
          ...prev,
          statusBadge: 'Chờ lãnh đạo ký',
        }));
      }
    } else if (decisionStatus === 'da_ky') {
      if (quyetDinhBranch === 'thu_ly') {
        if (currentDon.statusBadge !== 'Đã thụ lý') {
          setCurrentDon((prev) => ({
            ...prev,
            statusBadge: 'Đã thụ lý',
          }));
        }
      } else if (quyetDinhBranch === 'khong_thu_ly') {
        if (currentDon.statusBadge !== 'Không thụ lý') {
          setCurrentDon((prev) => ({
            ...prev,
            statusBadge: 'Không thụ lý',
          }));
        }
      } else if (quyetDinhBranch === 'tra_lai') {
        if (currentDon.statusBadge !== 'Đã trả lại đơn') {
          setCurrentDon((prev) => ({
            ...prev,
            statusBadge: 'Đã trả lại đơn',
          }));
        }
      } else if (quyetDinhBranch === 'ban_giao') {
        const targetStatus = isChuyenThamQuyenSuccess ? 'Đã chuyển thẩm quyền' : 'Đã phê duyệt chuyển thẩm quyền';
        if (currentDon.statusBadge !== targetStatus) {
          setCurrentDon((prev) => ({
            ...prev,
            statusBadge: targetStatus,
          }));
        }
      }
    } else if (decisionStatus === 'yeu_cau_sua' || decisionStatus === 'tu_choi') {
      if (currentDon.statusBadge !== 'Yêu cầu chỉnh sửa') {
        setCurrentDon((prev) => ({
          ...prev,
          statusBadge: 'Yêu cầu chỉnh sửa',
        }));
      }
    }
  }, [decisionStatus, quyetDinhBranch, isChuyenThamQuyenSuccess, currentDon.statusBadge]);

  // Thao tác Ký số phê duyệt văn bản (Lãnh đạo ký duyệt)
  const handleLanhDaoKyDuyet = () => {
    if (!quyetDinhSigningDoc || !onUpdateSigningDocuments) return;
    const timeNow = `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`;
    const signerName = currentAccount?.name || quyetDinhSigningDoc.lanhDaoName || 'Trần Văn Cường (Phó Chủ tịch UBND)';

    onUpdateSigningDocuments((prev) =>
      prev.map((d) =>
        d.id === quyetDinhSigningDoc.id
          ? {
            ...d,
            status: 'da_ky',
            thoiGianKy: timeNow,
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
            chuKy: {
              nguoiKy: signerName,
              chucVu: currentAccount?.role === 'lanh_dao' ? 'Phó Chủ tịch UBND' : 'Lãnh đạo ký duyệt',
              coQuan: 'UBND quận Cầu Giấy',
              thoiGianKy: timeNow,
              loaiChungThu: 'VGCA - Ban Cơ yếu Chính phủ',
            },
          }
          : d
      )
    );

    let newStatus = 'Đã ký duyệt';
    if (quyetDinhBranch === 'thu_ly') newStatus = 'Đã thụ lý';
    else if (quyetDinhBranch === 'khong_thu_ly') newStatus = 'Không thụ lý';
    else if (quyetDinhBranch === 'tra_lai') newStatus = 'Đã trả lại đơn';
    else if (quyetDinhBranch === 'ban_giao') newStatus = 'Đã phê duyệt chuyển thẩm quyền';

    const updatedDonData: DonDetail = {
      ...currentDon,
      statusBadge: newStatus,
    };
    setCurrentDon(updatedDonData);
    onUpdateDon?.(updatedDonData);

    showToast(`✓ Lãnh đạo (${signerName}) đã ký số phê duyệt ${quyetDinhSigningDoc.tenVanBan} thành công!`);

    addHistoryLog({
      title: `Lãnh đạo ký số phê duyệt: ${quyetDinhSigningDoc.tenVanBan}`,
      actor: signerName,
      actorRole: 'Lãnh đạo ký duyệt',
      actorDept: 'UBND quận Cầu Giấy',
      category: 'van_ban',
      statusBadge: {
        text: 'Đã ký số',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-200',
      },
      description: `Lãnh đạo đã phê duyệt và ký số chứng thư VGCA văn bản số ${quyetDinhSigningDoc.soKyHieu}. Chuyển sang bước tiếp theo: ${quyetDinhBranch === 'thu_ly' ? 'Thụ lý đơn (Tạo vụ việc)' : quyetDinhBranch === 'ban_giao' ? 'Gửi chuyển thẩm quyền' : 'In thông báo gửi công dân'
        }.`,
      docInfo: {
        name: quyetDinhSigningDoc.tenVanBan,
        code: quyetDinhSigningDoc.soKyHieu,
        type: 'quyet_dinh',
      },
    });

    // Nếu là nhánh thụ lý: Sau khi ký số, tự động mở popup tạo vụ việc để thực hiện thụ lý ngay
    if (quyetDinhBranch === 'thu_ly') {
      setTimeout(() => {
        setShowTaoVuViecModal(true);
      }, 400);
    }
  };

  // Thao tác Lãnh đạo Yêu cầu chỉnh sửa / Trả lại văn bản
  const handleLanhDaoYeuCauSua = () => {
    if (!quyetDinhSigningDoc || !onUpdateSigningDocuments) return;
    const yKien = 'Yêu cầu kiểm tra, đối chiếu lại hồ sơ địa chính và bổ sung biên bản xác minh trước khi ban hành.';
    onUpdateSigningDocuments((prev) =>
      prev.map((d) =>
        d.id === quyetDinhSigningDoc.id
          ? {
            ...d,
            status: 'yeu_cau_chinh_sua',
            yKienLanhDao: yKien,
          }
          : d
      )
    );
    const updatedDonData: DonDetail = {
      ...currentDon,
      statusBadge: 'Yêu cầu chỉnh sửa',
    };
    setCurrentDon(updatedDonData);
    onUpdateDon?.(updatedDonData);

    showToast(`Lãnh đạo đã trả lại văn bản yêu cầu chỉnh sửa: "${yKien}"`);

    addHistoryLog({
      title: `Lãnh đạo yêu cầu chỉnh sửa văn bản: ${quyetDinhSigningDoc.tenVanBan}`,
      actor: currentAccount?.name || 'Trần Văn Cường (Phó Chủ tịch UBND)',
      actorRole: 'Lãnh đạo ký duyệt',
      actorDept: 'UBND quận Cầu Giấy',
      category: 'van_ban',
      statusBadge: {
        text: 'Yêu cầu chỉnh sửa',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200',
      },
      description: `Ý kiến chỉ đạo của Lãnh đạo: "${yKien}". Cán bộ thụ lý cập nhật lại dự thảo và trình ký lại.`,
    });
  };

  // Xác nhận tạo vụ việc từ Đơn đã thụ lý (Nhánh 1)
  const handleXacNhanTaoVuViec = (vuViecData: {
    code: string;
    title: string;
    nguoiNop: string;
    canBoThuLy: string;
    donViThuLy: string;
    ghiChu?: string;
  }) => {
    setShowTaoVuViecModal(false);

    const updatedDonData: DonDetail = {
      ...currentDon,
      id: vuViecData.code,
      code: vuViecData.code,
      type: 'VỤ VIỆC',
      statusBadge: 'Đã thụ lý',
      currentStep: 3,
    };

    setCurrentDon(updatedDonData);
    setActiveStepNumber(3);
    setActiveTab('quy-trinh');
    onUpdateDon?.(updatedDonData);

    showToast(`✓ Đã tạo và liên kết Vụ việc [${vuViecData.code}] thành công!`);

    addHistoryLog({
      title: `Chính thức tạo VỤ VIỆC (${vuViecData.code}) từ Đơn đã thụ lý`,
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
      actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'quy_trinh',
      statusBadge: {
        text: 'Vụ việc mới',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-800',
        borderClass: 'border-purple-200',
      },
      description: `Đã hoàn tất lập hồ sơ VỤ VIỆC số ${vuViecData.code} dựa trên Quyết định thụ lý ${quyetDinhSigningDoc?.soKyHieu || ''} đã được phê duyệt. Hồ sơ bước vào giai đoạn xác minh giải quyết vụ việc.`,
    });
  };

  // Xác nhận gửi chuyển thẩm quyền (Nhánh 3)
  const handleXacNhanGuiChuyenThamQuyen = () => {
    setShowXacNhanChuyenModal(false);
    const targetDept = DEPARTMENTS.find((d) => d.id === selectedDonViNhanId) || DEPARTMENTS[1];
    const timeNow = `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`;

    setIsChuyenThamQuyenSuccess(true);
    setBanGiaoData({
      donViNhanId: targetDept.id,
      donViNhanName: targetDept.name,
      thoiGianChuyen: timeNow,
      nguoiChuyen: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      soVanBan: quyetDinhSigningDoc?.soKyHieu || 'CV-CHUYEN/2026/UBND',
    });

    const updatedDonData: DonDetail = {
      ...currentDon,
      statusBadge: 'Đã chuyển thẩm quyền',
      donViTiepNhan: targetDept.name,
    };

    setCurrentDon(updatedDonData);
    onUpdateDon?.(updatedDonData);

    showToast(`✓ Đã gửi chuyển thẩm quyền hồ sơ ${currentDon.code} sang "${targetDept.name}" thành công!`);

    addHistoryLog({
      title: `Gửi chuyển thẩm quyền sang: ${targetDept.name}`,
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'quy_trinh',
      statusBadge: {
        text: 'Đã chuyển thẩm quyền',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-800',
        borderClass: 'border-purple-200',
      },
      description: `Hồ sơ đơn đã được chuyển liên thông điện tử sang "${targetDept.name}" (Người phụ trách: ${targetDept.leaderName}) theo Quyết định chuyển thẩm quyền số ${quyetDinhSigningDoc?.soKyHieu || 'đã ký'}.`,
    });
  };

  // 1. Nhấn vào "Tạo báo cáo đề xuất"
  const handleTaoBaoCaoDeXuat = () => {
    setShowTaoBaoCaoDeXuatModal(true);
  };
  const handleTiepNhanDon = () => {
    const updatedDonData: DonDetail = {
      ...currentDon,
      statusBadge: 'Đang xử lý',
      isAwaitingAcceptance: false,
      isNoFileTransfer: false,
      hasBaoCaoDeXuat: false,
    };
    setCurrentDon(updatedDonData);
    setHasCreatedBaoCaoDeXuat(false);
    if (onUpdateDon) {
      onUpdateDon(updatedDonData);
    }
    setActiveTab('thong-tin');
    setIsEditingThongTinDon(true);
    showToast('✓ Tiếp nhận về thành công! Vui lòng tạo Báo cáo đề xuất trước khi xác định hướng xử lý đơn.');
    addHistoryLog({
      title: 'Cán bộ thụ lý tiếp nhận về & Cập nhật thông tin',
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'tiep_nhan',
      statusBadge: {
        text: 'Tiếp nhận về',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-200',
      },
      description: `Cán bộ ${currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'} đã chính thức tiếp nhận về đơn ${currentDon.code} và bắt đầu cập nhật thông tin chung.`,
    });
  };

  // 2. Nhận sự kiện Trình ký Báo cáo / Quyết định từ TabTaiLieu
  const handleTrinhKyBaoCaoTuTab = (_docId?: string, updatedDoc?: SigningDocument) => {
    const docToSubmit = updatedDoc || existingSigningDoc;
    if (!docToSubmit) return;

    // Phân loại các hướng văn bản quyết định / đề xuất
    const isTraLai = Boolean(
      docToSubmit.loaiVanBan === 'van_ban_tra_lai' ||
      docToSubmit.loaiVanBanLabel?.toLowerCase().includes('trả lại') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('trả lại')
    );

    const isKhongThuLy = Boolean(
      docToSubmit.loaiVanBan === 'thong_bao_khong_thu_ly' ||
      docToSubmit.loaiVanBanLabel?.toLowerCase().includes('không thụ lý') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('không thụ lý')
    );

    const isChuyenDon = Boolean(
      docToSubmit.loaiVanBan === 'bien_ban_ban_giao' ||
      (docToSubmit.loaiVanBan as string) === 'phieu_chuyen_don' ||
      (docToSubmit.loaiVanBan as string) === 'chuyen_don' ||
      docToSubmit.loaiVanBanLabel?.toLowerCase().includes('chuyển') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('chuyển')
    );

    const isTraLoiDon = Boolean(
      (docToSubmit.loaiVanBan as string) === 'tra_loi_don' ||
      docToSubmit.loaiVanBanLabel?.toLowerCase().includes('trả lời') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('trả lời')
    );

    if (isTraLai) {
      if (onUpdateSigningDocuments) {
        onUpdateSigningDocuments((prev) => {
          const next = [...prev];
          const idx = next.findIndex((d) => d.id === docToSubmit.id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
          } else {
            next.unshift({
              ...docToSubmit,
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            });
          }
          return next;
        });
      }

      const updatedDonData: DonDetail = {
        ...currentDon,
        statusBadge: 'Chờ lãnh đạo ký',
      };
      setCurrentDon(updatedDonData);
      setHuongXuLyDaChon('tra_lai');
      onUpdateDon?.(updatedDonData);

      showToast(
        `✓ Đã trình ký Văn bản trả lại đơn (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})! Đang chờ Lãnh đạo phê duyệt ký số điện tử.`
      );

      addHistoryLog({
        title: `Trình Lãnh đạo ký Văn bản trả lại đơn (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})`,
        actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
        actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
        category: 'van_ban',
        statusBadge: {
          text: 'Chờ lãnh đạo ký',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-200',
        },
        description: `Đã hoàn tất trình dự thảo Phiếu hướng dẫn trả lại đơn số ${docToSubmit.soKyHieu || docToSubmit.tenVanBan} lên Lãnh đạo ký duyệt. Khi Lãnh đạo ký duyệt xong, hệ thống sẽ mở quyền Gửi quyết định cho đương sự (Bước 3).`,
        docInfo: {
          name: docToSubmit.tenVanBan,
          code: docToSubmit.soKyHieu,
          type: 'van_ban_tra_lai',
        },
      });

      return;
    }

    if (isKhongThuLy) {
      if (onUpdateSigningDocuments) {
        onUpdateSigningDocuments((prev) => {
          const next = [...prev];
          const idx = next.findIndex((d) => d.id === docToSubmit.id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
          } else {
            next.unshift({
              ...docToSubmit,
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            });
          }
          return next;
        });
      }

      const updatedDonData: DonDetail = {
        ...currentDon,
        statusBadge: 'Chờ lãnh đạo ký',
      };
      setCurrentDon(updatedDonData);
      setHuongXuLyDaChon('khong_thu_ly');
      onUpdateDon?.(updatedDonData);

      showToast(
        `✓ Đã trình ký Quyết định không thụ lý (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})! Đang chờ Lãnh đạo phê duyệt ký số điện tử.`
      );

      addHistoryLog({
        title: `Trình Lãnh đạo ký Quyết định không thụ lý (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})`,
        actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
        actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
        category: 'van_ban',
        statusBadge: {
          text: 'Chờ lãnh đạo ký',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-200',
        },
        description: `Đã hoàn tất trình dự thảo Quyết định không thụ lý giải quyết số ${docToSubmit.soKyHieu || docToSubmit.tenVanBan} lên Lãnh đạo ký duyệt.`,
        docInfo: {
          name: docToSubmit.tenVanBan,
          code: docToSubmit.soKyHieu,
          type: 'quyet_dinh',
        },
      });

      return;
    }

    if (isChuyenDon) {
      if (onUpdateSigningDocuments) {
        onUpdateSigningDocuments((prev) => {
          const next = [...prev];
          const idx = next.findIndex((d) => d.id === docToSubmit.id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
          } else {
            next.unshift({
              ...docToSubmit,
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            });
          }
          return next;
        });
      }

      const updatedDonData: DonDetail = {
        ...currentDon,
        statusBadge: 'Chờ lãnh đạo ký',
      };
      setCurrentDon(updatedDonData);
      setHuongXuLyDaChon('ban_giao');
      onUpdateDon?.(updatedDonData);

      showToast(
        `✓ Đã trình ký Văn bản chuyển thẩm quyền (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})! Đang chờ Lãnh đạo phê duyệt ký số điện tử.`
      );

      addHistoryLog({
        title: `Trình Lãnh đạo ký Văn bản chuyển thẩm quyền (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})`,
        actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
        actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
        category: 'van_ban',
        statusBadge: {
          text: 'Chờ lãnh đạo ký',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-200',
        },
        description: `Đã hoàn tất trình dự thảo Phiếu chuyển đơn số ${docToSubmit.soKyHieu || docToSubmit.tenVanBan} lên Lãnh đạo ký duyệt.`,
        docInfo: {
          name: docToSubmit.tenVanBan,
          code: docToSubmit.soKyHieu,
          type: 'phieu_chuyen',
        },
      });

      return;
    }

    if (isTraLoiDon) {
      if (onUpdateSigningDocuments) {
        onUpdateSigningDocuments((prev) => {
          const next = [...prev];
          const idx = next.findIndex((d) => d.id === docToSubmit.id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
          } else {
            next.unshift({
              ...docToSubmit,
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            });
          }
          return next;
        });
      }

      const updatedDonData: DonDetail = {
        ...currentDon,
        statusBadge: 'Chờ lãnh đạo ký',
      };
      setCurrentDon(updatedDonData);
      setHuongXuLyDaChon('tra_loi_don');
      onUpdateDon?.(updatedDonData);

      showToast(
        `✓ Đã trình ký Văn bản trả lời đơn (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})! Đang chờ Lãnh đạo phê duyệt ký số điện tử.`
      );

      addHistoryLog({
        title: `Trình Lãnh đạo ký Văn bản trả lời đơn (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})`,
        actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
        actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
        category: 'van_ban',
        statusBadge: {
          text: 'Chờ lãnh đạo ký',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-200',
        },
        description: `Đã hoàn tất trình dự thảo Văn bản trả lời đơn số ${docToSubmit.soKyHieu || docToSubmit.tenVanBan} lên Lãnh đạo ký duyệt.`,
        docInfo: {
          name: docToSubmit.tenVanBan,
          code: docToSubmit.soKyHieu,
          type: 'tra_loi',
        },
      });

      return;
    }

    // Kiểm tra nếu là văn bản Quyết định thụ lý thì chính thức thụ lý và chuyển thành VỤ VIỆC
    const isQuyetDinhThuLy = Boolean(
      docToSubmit.loaiVanBan === 'quyet_dinh_thu_ly' ||
      (docToSubmit.loaiVanBan as string) === 'quyet_dinh' ||
      docToSubmit.loaiVanBanLabel?.toLowerCase().includes('quyết định') ||
      docToSubmit.loaiVanBanLabel?.toLowerCase().includes('thụ lý') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('quyết định') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('quyet_dinh') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('thụ lý') ||
      docToSubmit.tenVanBan?.toLowerCase().includes('thu_ly') ||
      docToSubmit.trichYeu?.toLowerCase().includes('thụ lý') ||
      docToSubmit.soKyHieu?.toLowerCase().includes('qđ') ||
      docToSubmit.soKyHieu?.toLowerCase().includes('qd')
    );

    if (isQuyetDinhThuLy) {
      const vuViecCode = currentDon.code.startsWith('Đ-')
        ? currentDon.code.replace('Đ-', 'VV-')
        : currentDon.code.startsWith('VV-')
          ? currentDon.code
          : `VV-${currentDon.code}`;

      if (onUpdateSigningDocuments) {
        onUpdateSigningDocuments((prev) => {
          const next = [...prev];
          const idx = next.findIndex(
            (d) =>
              d.id === docToSubmit.id ||
              ((d.hoSoCode === currentDon.code || d.hoSoCode === vuViecCode) &&
                (d.loaiVanBan === 'quyet_dinh_thu_ly' || (d.loaiVanBan as string) === 'quyet_dinh'))
          );
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              status: 'da_trinh',
              thoiGianTrinh: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
          }
          return next;
        });
      }

      // Trạng thái hồ sơ chuyển sang Chờ lãnh đạo ký (Chưa tạo vụ việc ở đây)
      const updatedDonData: DonDetail = {
        ...currentDon,
        statusBadge: 'Chờ lãnh đạo ký',
      };

      setCurrentDon(updatedDonData);
      setActiveTab('quy-trinh');
      onUpdateDon?.(updatedDonData);

      showToast(
        `✓ Đã trình ký Quyết định thụ lý (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})! Đang chờ Lãnh đạo phê duyệt ký số điện tử.`
      );

      addHistoryLog({
        title: `Trình Lãnh đạo ký Quyết định thụ lý (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})`,
        actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
        actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
        actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
        category: 'van_ban',
        statusBadge: {
          text: 'Chờ lãnh đạo ký',
          bgClass: 'bg-blue-50',
          textClass: 'text-blue-800',
          borderClass: 'border-blue-200',
        },
        description: `Đã hoàn tất trình dự thảo Quyết định thụ lý số ${docToSubmit.soKyHieu || docToSubmit.tenVanBan} lên Lãnh đạo ký duyệt. Khi Lãnh đạo ký duyệt xong, hệ thống sẽ mở quyền Tạo vụ việc.`,
        docInfo: {
          name: docToSubmit.tenVanBan,
          code: docToSubmit.soKyHieu,
          type: 'quyet_dinh',
        },
      });

      return;
    }

    // Nếu là Báo cáo đề xuất thông thường
    if (updatedDoc && onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prev) => {
        const idx = prev.findIndex(
          (d) =>
            d.id === updatedDoc.id ||
            ((d.hoSoCode === currentDon.code || d.hoSoCode === currentDon.id) &&
              (d.loaiVanBan === updatedDoc.loaiVanBan || d.soKyHieu === updatedDoc.soKyHieu))
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedDoc;
          return next;
        }
        return [updatedDoc, ...prev];
      });
    }

    setTrangThaiXacMinh('da_xac_minh');
    setActiveStepNumber(2);
    setCurrentDon((prev) => ({
      ...prev,
      currentStep: 2,
      statusBadge: 'Chờ phê duyệt',
    }));

    showToast(
      `✓ Đã trình ký Báo cáo đề xuất (${docToSubmit.soKyHieu || docToSubmit.tenVanBan}) tới Lãnh đạo! Đã chuyển sang Bước 2 và mở khóa nút Thụ lý đơn.`
    );

    addHistoryLog({
      title: `Trình Lãnh đạo Báo cáo kết quả xác minh / Đề xuất (${docToSubmit.soKyHieu || docToSubmit.tenVanBan})`,
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
      actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'van_ban',
      statusBadge: {
        text: 'Chờ duyệt ký',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-800',
        borderClass: 'border-blue-200',
      },
      description: `Đã hoàn tất lập Báo cáo đề xuất hướng xử lý đơn và chuyển sang luồng trình ký Lãnh đạo phê duyệt. Hồ sơ chuyển tiếp sang Bước 2: Ban hành Quyết định thụ lý.`,
      docInfo: {
        name: docToSubmit.tenVanBan,
        code: docToSubmit.soKyHieu,
        type: 'bao_cao',
      },
    });
  };

  // 3. Xử lý lưu nháp từ popup TaoBaoCaoDeXuatModal
  const handleSaveDraftBaoCaoModal = (
    _formData: BaoCaoDeXuatFormData,
    updatedDoc: SigningDocument
  ) => {
    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prev) => {
        const idx = prev.findIndex((d) => d.id === updatedDoc.id || d.hoSoCode === currentDon.code);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedDoc;
          return next;
        }
        return [updatedDoc, ...prev];
      });
    } else if (onCreateSigningDocument) {
      onCreateSigningDocument(updatedDoc);
    }

    if (_formData.phuongAnDeXuat) {
      let mappedHuong: HuongGiaiQuyetType = 'thu_ly';
      if (_formData.phuongAnDeXuat === 1) mappedHuong = 'thu_ly';
      else if (_formData.phuongAnDeXuat === 2) mappedHuong = 'ban_giao';
      else if (_formData.phuongAnDeXuat === 3) mappedHuong = 'tra_loi_don';
      else if (_formData.phuongAnDeXuat === 4) mappedHuong = 'yeu_cau_bo_sung';
      setHuongXuLyDaChon(mappedHuong);
    }

    setHasCreatedBaoCaoDeXuat(true);
    setCurrentDon((prev) => ({
      ...prev,
      hasBaoCaoDeXuat: true,
      currentStep: Math.max(prev.currentStep || 1, 2),
    }));
    const draftSoHieu = updatedDoc.soKyHieu || 'BC-01';
    const newDraftDocItem: any = {
      id: updatedDoc.id,
      name: `Bao_cao_de_xuat_${draftSoHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      category: 'Báo cáo đề xuất',
      folder: 'van_ban_quyet_dinh',
      soHieu: draftSoHieu,
      size: '350 KB',
      pages: 2,
      uploadDate: updatedDoc.ngayTao,
      signer: updatedDoc.nguoiLap,
      coQuanBanHanh: updatedDoc.donViNguoiLap || 'Phòng Tiếp công dân & Xử lý đơn',
      stepBelongsTo: 'Bước 2: Đề xuất xử lý',
      ocrStatus: 'Hoàn tất',
      isProcessDoc: true,
      isEditable: true,
      loaiVanBan: 'bao_cao_de_xuat',
      tenVanBan: updatedDoc.tenVanBan,
      trichYeu: updatedDoc.trichYeu,
      noiDungChiTiet: updatedDoc.noiDungChiTiet,
      previewExcerpt: updatedDoc.noiDungChiTiet,
      signingStatus: 'nhap',
    };
    setShowTaoBaoCaoDeXuatModal(false);
    setEditingDocInTab(newDraftDocItem);
    setActiveTab('tai-lieu');
    setDocCount((c) => Math.max(c, 7));

    showToast('✓ Đã lưu Báo cáo đề xuất (Bản nháp)! Đã chuyển sang tab Hồ sơ & Văn bản để thực hiện trình ký.');

    addHistoryLog({
      title: `Lập Báo cáo kết quả xác minh (${draftSoHieu})`,
      actor: updatedDoc.nguoiLap,
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
      actorDept: updatedDoc.donViNguoiLap || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'van_ban',
      statusBadge: {
        text: 'Bản nháp',
        bgClass: 'bg-slate-100',
        textClass: 'text-slate-800',
        borderClass: 'border-slate-200',
      },
      description: `Đã lưu bản nháp Báo cáo kết quả xác minh về việc giải quyết đơn. Văn bản hiển thị tại tab "Hồ sơ và văn bản".`,
      docInfo: {
        name: updatedDoc.tenVanBan,
        code: draftSoHieu,
        type: 'bao_cao',
      },
    });
  };

  // 4. Xử lý trình lãnh đạo từ popup TaoBaoCaoDeXuatModal
  const handleSubmitToLeaderBaoCaoModal = (
    formData: BaoCaoDeXuatFormData,
    updatedDoc: SigningDocument
  ) => {
    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prev) => {
        const idx = prev.findIndex((d) => d.id === updatedDoc.id || d.hoSoCode === currentDon.code);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedDoc;
          return next;
        }
        return [updatedDoc, ...prev];
      });
    }

    if (formData.phuongAnDeXuat) {
      let mappedHuong: HuongGiaiQuyetType = 'thu_ly';
      if (formData.phuongAnDeXuat === 1) mappedHuong = 'thu_ly';
      else if (formData.phuongAnDeXuat === 2) mappedHuong = 'ban_giao';
      else if (formData.phuongAnDeXuat === 3) mappedHuong = 'tra_loi_don';
      else if (formData.phuongAnDeXuat === 4) mappedHuong = 'yeu_cau_bo_sung';
      setHuongXuLyDaChon(mappedHuong);
    }

    setHasCreatedBaoCaoDeXuat(true);
    setTrangThaiXacMinh('da_xac_minh');
    setActiveStepNumber(2);
    setCurrentDon((prev) => ({
      ...prev,
      hasBaoCaoDeXuat: true,
      currentStep: 2,
      statusBadge: 'Chờ phê duyệt',
    }));

    const submittedSoHieu = updatedDoc.soKyHieu || 'BC-01';
    const newSubmittedDocItem: any = {
      id: updatedDoc.id,
      name: `Bao_cao_de_xuat_${submittedSoHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      category: 'Báo cáo đề xuất',
      folder: 'van_ban_quyet_dinh',
      soHieu: submittedSoHieu,
      size: '350 KB',
      pages: 2,
      uploadDate: updatedDoc.ngayTao,
      signer: updatedDoc.nguoiLap,
      coQuanBanHanh: updatedDoc.donViNguoiLap || 'Phòng Tiếp công dân & Xử lý đơn',
      stepBelongsTo: 'Bước 2: Đề xuất xử lý',
      ocrStatus: 'Hoàn tất',
      isProcessDoc: true,
      isEditable: true,
      loaiVanBan: 'bao_cao_de_xuat',
      tenVanBan: updatedDoc.tenVanBan,
      trichYeu: updatedDoc.trichYeu,
      noiDungChiTiet: updatedDoc.noiDungChiTiet,
      previewExcerpt: updatedDoc.noiDungChiTiet,
      signingStatus: 'da_trinh',
    };
    setShowTaoBaoCaoDeXuatModal(false);
    setEditingDocInTab(newSubmittedDocItem);
    setActiveTab('tai-lieu');
    setDocCount((c) => Math.max(c, 7));

    showToast(
      `✓ Đã lập và trình ký Báo cáo đề xuất (${submittedSoHieu}) tới Lãnh đạo! Đã chuyển sang tab Hồ sơ & Văn bản để theo dõi.`
    );

    addHistoryLog({
      title: `Trình Lãnh đạo Báo cáo kết quả xác minh (${updatedDoc.soKyHieu})`,
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
      actorDept: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'van_ban',
      statusBadge: {
        text: 'Chờ duyệt ký',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-800',
        borderClass: 'border-blue-200',
      },
      description: `Hoàn tất lập Báo cáo kết quả xác minh về việc giải quyết đơn số ${currentDon.code} và đã chuyển sang luồng trình ký Lãnh đạo.`,
      docInfo: {
        name: updatedDoc.tenVanBan,
        code: updatedDoc.soKyHieu,
        type: 'bao_cao',
      },
    });
  };

  const workflow = matchWorkflowByLoaiDon(currentDon.loaiDon || 'Đơn khiếu nại đất đai');

  // Xác định bước hiện tại của quy trình (từ currentDon hoặc mặc định)
  const initialStepNumber = currentDon.currentStep || (trangThaiXacMinh === 'da_xac_minh' ? 2 : 1);
  const [activeStepNumber, setActiveStepNumber] = useState<number>(initialStepNumber);

  useEffect(() => {
    if (currentDon.currentStep) {
      setActiveStepNumber(currentDon.currentStep);
      if (currentDon.currentStep >= 2) {
        setTrangThaiXacMinh('da_xac_minh');
      }
    }
  }, [currentDon.currentStep]);

  // Thực thi hành động tương ứng với Nút chính
  const handleExecutePrimaryAction = () => {
    switch (huongXuLyDaChon) {
      case 'thu_ly':
        setShowModalBuocTiepTheo(true);
        break;
      case 'khong_thu_ly':
        setShowKhongThuLyModal(true);
        break;
      case 'yeu_cau_bo_sung':
        setShowModalBoSung(true);
        break;
      case 'tra_lai':
        setShowTraLaiModal(true);
        break;
      case 'ban_giao':
        setShowBanGiaoModal(true);
        break;
      case 'tra_loi_don':
        setShowTraLoiDonModal(true);
        break;
      default:
        setShowXacMinhModal(true);
    }
  };

  // Chuyển hướng xử lý khi người dùng chọn từ Dropdown
  const handleSelectHuong = (targetHuong: HuongGiaiQuyetType) => {
    setHuongXuLyDaChon(targetHuong);
    setShowHuongDropdown(false);
    showToast(`✓ Đã chọn hướng xử lý: ${HUONG_XU_LY_CONFIG[targetHuong]?.label || targetHuong}`);

    addHistoryLog({
      title: `Chuyển hướng giải quyết: ${HUONG_XU_LY_CONFIG[targetHuong]?.label || targetHuong}`,
      actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'huong_xu_ly',
      statusBadge: {
        text: HUONG_XU_LY_CONFIG[targetHuong]?.label || 'Đổi hướng',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-200',
      },
      description: `Cán bộ thụ lý đã xác định hướng giải quyết hồ sơ đơn là "${HUONG_XU_LY_CONFIG[targetHuong]?.label}". Hệ thống chuẩn bị văn bản và biểu mẫu tương ứng.`,
      note: HUONG_XU_LY_CONFIG[targetHuong]?.subLabel,
    });

    // Mở ngay modal tương ứng để người dùng thực hiện
    switch (targetHuong) {
      case 'thu_ly':
        setShowModalBuocTiepTheo(true);
        break;
      case 'khong_thu_ly':
        setShowKhongThuLyModal(true);
        break;
      case 'yeu_cau_bo_sung':
        setShowModalBoSung(true);
        break;
      case 'tra_lai':
        setShowTraLaiModal(true);
        break;
      case 'ban_giao':
        setShowBanGiaoModal(true);
        break;
      case 'tra_loi_don':
        setShowTraLoiDonModal(true);
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden font-body-md select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in max-w-lg">
          <span className="material-symbols-outlined text-blue-400 text-lg shrink-0">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-6 pt-3.5 shrink-0 shadow-2xs">
        {/* Breadcrumb row */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <button
              type="button"
              onClick={() => onNav("cong-viec")}
              className="flex items-center gap-1 text-[#004ac6] hover:text-[#003ea8] hover:underline font-semibold cursor-pointer mr-1"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Quay lại</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="hover:underline cursor-pointer" onClick={() => onNav("cong-viec")}>
              Bàn làm việc
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">
              Tiếp nhận &amp; Xử lý đơn
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">{currentDon.code}</span>
          </div>
        </div>

        {/* Title Row & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3.5 gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {currentDon.type === 'VỤ VIỆC' || currentDon.code.startsWith('VV') ? (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                  <span className="material-symbols-outlined text-[15px] text-purple-700">folder_special</span>
                  <span>VỤ VIỆC</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">description</span>
                  <span>HỒ SƠ ĐƠN</span>
                </span>
              )}
              <h1 className="text-[19px] font-bold text-slate-900 tracking-tight font-headline-md leading-tight">
                {currentDon.code}: {currentDon.title ? (currentDon.title.startsWith(currentDon.code) ? currentDon.title.replace(`${currentDon.code}: `, '') : currentDon.title) : (currentDon.noiDung || 'Đơn tiếp nhận & xử lý')}
              </h1>
              {/* {currentDon.statusBadge && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs border ${currentDon.statusBadge.includes('Đã thụ lý')
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : currentDon.statusBadge.includes('Đã trả lại')
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : currentDon.statusBadge.includes('Chờ')
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {currentDon.statusBadge.includes('Đã thụ lý') ? 'verified' : currentDon.statusBadge.includes('Đã trả lại') ? 'reply' : 'schedule'}
                  </span>
                </span>
              )} */}

              {/* Trạng thái gửi quyết định trả lại (Hiển thị riêng biệt với trạng thái xử lý đơn) */}
              {/* {((quyetDinhBranch === 'tra_lai' && decisionStatus === 'da_ky') || currentDon.statusBadge === 'Đã trả lại đơn') && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold shadow-2xs border ${currentQuyetDinhTraLai.trangThaiGui === 'cho_gui'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-400/20 animate-pulse'
                  : currentQuyetDinhTraLai.trangThaiGui === 'da_giao_nhan'
                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                    : currentQuyetDinhTraLai.trangThaiGui === 'da_gui'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {currentQuyetDinhTraLai.trangThaiGui === 'cho_gui'
                      ? 'hourglass_top'
                      : currentQuyetDinhTraLai.trangThaiGui === 'da_giao_nhan'
                        ? 'verified'
                        : currentQuyetDinhTraLai.trangThaiGui === 'da_gui'
                          ? 'mark_email_read'
                          : 'error'}
                  </span>
                  <span>
                    Trạng thái gửi: {
                      currentQuyetDinhTraLai.trangThaiGui === 'cho_gui'
                        ? 'Bước 3 – Chờ gửi cho đương sự'
                        : currentQuyetDinhTraLai.trangThaiGui === 'da_giao_nhan'
                          ? 'Bước 4 – Đã giao/nhận thành công'
                          : currentQuyetDinhTraLai.trangThaiGui === 'da_gui'
                            ? 'Bước 4 – Đã gửi cho đương sự'
                            : 'Gửi thất bại (Cần gửi lại)'
                    }
                  </span>
                </span>
              )} */}
            </div>

            <div className="flex items-center gap-2 text-[12.5px] text-slate-500 font-medium mt-1.5 flex-wrap">
              <span>
                Lượt tiếp nhận số{' '}
                <span className="font-semibold text-slate-700">
                  {currentDon.luotNhanId || 'LN-45/2026-GOVEX'}
                </span>
              </span>

              <span className="text-slate-300">•</span>
              <span>
                Cán bộ tiếp nhận:{' '}
                <strong className="text-slate-800 font-semibold">
                  {currentDon.canBoTiepNhan || currentDon.canBoXuLy || 'Nguyễn Minh Anh'}
                </strong>
                {currentDon.chucVuCanBo ? (
                  <span className="text-slate-400 font-normal ml-1">({currentDon.chucVuCanBo})</span>
                ) : null}
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Đơn vị xử lý:{' '}
                <strong className="text-slate-800 font-semibold">
                  {currentDon.donViXuLy || currentDon.donViTiepNhan || 'Phòng Tiếp công dân & Xử lý đơn'}
                </strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Nộp ngày:{' '}
                <span className="font-semibold text-slate-700">
                  {currentDon.ngayNhan || '15/09/2026 09:15'}
                </span>
              </span>
            </div>
          </div>

          {/* Action Buttons: Nút Chỉnh sửa thông tin + Split Button chính */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Nút Tiếp nhận về (hiển thị khi hồ sơ đang chờ tiếp nhận về) */}
            {isAwaitingAcceptance && (
              <button
                type="button"
                onClick={handleTiepNhanDon}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[13px] font-bold shadow-md ring-2 ring-emerald-300/40 transition-all cursor-pointer animate-pulse"
                title="Bấm để chính thức tiếp nhận về và mở các chức năng xử lý đơn"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span>Tiếp nhận về</span>
              </button>
            )}

            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => setShowThaoTacKhacDropdown(!showThaoTacKhacDropdown)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-95 text-slate-700 text-[13px] font-semibold shadow-2xs transition-all cursor-pointer"
                title="Các thao tác nghiệp vụ: Ghép hồ sơ đơn, Tải bổ sung file, Phân công xử lý, Chỉnh sửa thông tin đơn"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">tune</span>
                <span>Thao tác khác</span>
                <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${showThaoTacKhacDropdown ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {showThaoTacKhacDropdown && (
                <>
                  {/* Backdrop vô hình để đóng dropdown khi click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowThaoTacKhacDropdown(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-scale-up">
                    <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Thao tác nghiệp vụ
                      </span>
                    </div>
                    <div className="space-y-1">
                      {/* 1. Ghép hồ sơ đơn */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowThaoTacKhacDropdown(false);
                          setShowGhepDonModal(true);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">merge_type</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[13px] text-slate-900 group-hover:text-indigo-700 transition-colors">
                            Ghép hồ sơ đơn
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Ghép vào hồ sơ đơn trùng hoặc vụ việc đã có
                          </p>
                        </div>
                      </button>

                      {/* 2. Tải bổ sung file */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowThaoTacKhacDropdown(false);
                          setShowTaiTaiLieuModal(true);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[13px] text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Tải bổ sung file / tài liệu
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Đính kèm thêm tài liệu, hồ sơ chứng cứ bổ sung
                          </p>
                        </div>
                      </button>

                      {/* 3. Phân công xử lý */}
                      {/* <button
                        type="button"
                        onClick={() => {
                          setShowThaoTacKhacDropdown(false);
                          setShowPhanCongModal(true);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[13px] text-slate-900 group-hover:text-amber-700 transition-colors">
                            Phân công xử lý
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Giao cán bộ thụ lý hoặc chuyển đơn vị phụ trách
                          </p>
                        </div>
                      </button> */}

                      {/* 4. Chỉnh sửa thông tin đơn */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowThaoTacKhacDropdown(false);
                          setActiveTab('thong-tin');
                          setIsEditingThongTinDon(true);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[13px] text-slate-900 group-hover:text-blue-700 transition-colors">
                            Chỉnh sửa thông tin đơn
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Cập nhật trực tiếp người nộp, loại đơn, nội dung tiếp nhận tại màn hình
                          </p>
                        </div>
                      </button>

                      {/* 5. Bảng xác minh & Đề xuất (4 tiêu chí) */}
                      {/* <button
                        type="button"
                        onClick={() => {
                          setShowThaoTacKhacDropdown(false);
                          setShowXacMinhModal(true);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">fact_check</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[13px] text-slate-900 group-hover:text-teal-700 transition-colors">
                            Bảng xác minh (4 tiêu chí)
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Kiểm tra tư cách, thẩm quyền, thời hiệu và hồ sơ tài liệu
                          </p>
                        </div>
                      </button> */}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* KHU VỰC THAO TÁC HƯỚNG XỬ LÝ THEO QUY TRÌNH KÝ DUYỆT CỦA LÃNH ĐẠO (Chỉ hiển thị sau khi đã tiếp nhận về) */}
            {!isAwaitingAcceptance && (
              /* 1. KHI VĂN BẢN QUYẾT ĐỊNH ĐANG CHỜ LÃNH ĐẠO KÝ */
              decisionStatus === 'cho_ky' ? (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold shadow-2xs">
                    <span className="material-symbols-outlined text-[17px] text-amber-600 animate-spin">progress_activity</span>
                    <span>Chờ lãnh đạo ký ({quyetDinhSigningDoc?.soKyHieu || quyetDinhSigningDoc?.tenVanBan || 'Văn bản quyết định'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (quyetDinhSigningDoc) {
                        setEditingDocInTab(quyetDinhSigningDoc);
                      }
                      setActiveTab('tai-lieu');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    title="Xem văn bản đang trình ký tại tab Hồ sơ & Văn bản"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Xem văn bản trình ký</span>
                  </button>

                  {/* Cụm thao tác Ký số duyệt cho Lãnh đạo */}
                  <div className="flex items-center gap-1 bg-emerald-50/90 p-1 rounded-xl border border-emerald-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={handleLanhDaoKyDuyet}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      title="Lãnh đạo ký số chứng thư điện tử VGCA để phê duyệt quyết định"
                    >
                      <span className="material-symbols-outlined text-[16px]">draw</span>
                      <span>Ký số phê duyệt</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLanhDaoYeuCauSua}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold transition-all cursor-pointer"
                      title="Trả lại văn bản kèm ý kiến chỉ đạo yêu cầu cán bộ chỉnh sửa"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit_note</span>
                      <span>Yêu cầu sửa</span>
                    </button>
                  </div>
                </div>
              ) : decisionStatus === 'yeu_cau_sua' || decisionStatus === 'tu_choi' ? (
                /* 2. KHI VĂN BẢN BỊ TỪ CHỐI HOẶC YÊU CẦU CHỈNH SỬA */
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs font-semibold shadow-2xs">
                    <span className="material-symbols-outlined text-[17px] text-rose-600">error</span>
                    <span>Lãnh đạo yêu cầu chỉnh sửa</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (quyetDinhSigningDoc) {
                        setEditingDocInTab(quyetDinhSigningDoc);
                      }
                      setActiveTab('tai-lieu');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    title="Mở tab văn bản để chỉnh sửa và trình ký lại"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit_document</span>
                    <span>Chỉnh sửa &amp; Trình lại</span>
                  </button>
                </div>
              ) : decisionStatus === 'da_ky' ? (
                /* 3. KHI VĂN BẢN QUYẾT ĐỊNH ĐÃ ĐƯỢC LÃNH ĐẠO KÝ SỐ - PHÂN THEO 3 NHÁNH NGHIỆP VỤ */
                <div className="flex items-center gap-2.5">
                  {/* NHÁNH 1: THỤ LÝ -> TẠO VỤ VIỆC HOẶC XEM VỤ VIỆC */}
                  {quyetDinhBranch === 'thu_ly' && (
                    <>
                      {currentDon.type === 'VỤ VIỆC' || currentDon.code.startsWith('VV') ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold shadow-2xs">
                            <span className="material-symbols-outlined text-[16px] text-purple-600">verified</span>
                            <span>Đã liên kết Vụ việc: {currentDon.code}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('quy-trinh');
                              showToast(`Đang mở hồ sơ Vụ việc ${currentDon.code}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-[13px] font-bold shadow-md ring-2 ring-purple-300/40 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">folder_open</span>
                            <span>Xem vụ việc</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowTaoVuViecModal(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[13px] font-bold shadow-lg ring-2 ring-emerald-300/40 transition-all cursor-pointer animate-pulse"
                          title="Bấm để thụ lý đơn và mở popup tạo hồ sơ vụ việc"
                        >
                          <span className="material-symbols-outlined text-[18px]">gavel</span>
                          <span>Thụ lý đơn</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* NHÁNH 2A: KHÔNG THỤ LÝ -> IN QUYẾT ĐỊNH */}
                  {quyetDinhBranch === 'khong_thu_ly' && (
                    <button
                      type="button"
                      onClick={() => setShowInThongBaoModal(true)}
                      className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-[13px] font-bold shadow-md ring-2 ring-slate-400/40 transition-all cursor-pointer"
                      title="Mở bản xem trước và in Quyết định không thụ lý gửi công dân"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      <span>In quyết định</span>
                    </button>
                  )}

                  {/* NHÁNH 2B: TRẢ LẠI ĐƠN -> QUY TRÌNH BƯỚC 3 & BƯỚC 4 GỬI QUYẾT ĐỊNH CHO ĐƯƠNG SỰ */}
                  {quyetDinhBranch === 'tra_lai' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentQuyetDinhTraLai.trangThaiGui === 'cho_gui' ? (
                        /* BƯỚC 3: CHỜ GỬI CHO ĐƯƠNG SỰ */
                        <>
                          {/* Nút hành động chính: Gửi cho đương sự */}
                          <button
                            type="button"
                            onClick={() => {
                              setGuiQuyetDinhMode('send');
                              setShowGuiQuyetDinhModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-[13px] font-bold shadow-lg shadow-blue-600/25 ring-2 ring-blue-300/40 transition-all cursor-pointer animate-pulse"
                            title="Mở popup thực hiện gửi quyết định trả lại đơn cho đương sự"
                          >
                            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                            <span>Gửi cho đương sự</span>
                          </button>
                        </>
                      ) : (
                        /* BƯỚC 4: ĐÃ GỬI CHO ĐƯƠNG SỰ / ĐÃ GIAO NHẬN */
                        <>

                        </>
                      )}
                    </div>
                  )}

                  {quyetDinhBranch === 'ban_giao' && (
                    <>
                      {isChuyenThamQuyenSuccess || currentDon.statusBadge === 'Đã chuyển thẩm quyền' ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold shadow-2xs">
                            <span className="material-symbols-outlined text-[16px] text-purple-600">task_alt</span>
                            <span>Đã chuyển đến: {banGiaoData?.donViNhanName || currentDon.donViTiepNhan || 'Đơn vị thẩm quyền'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('tai-lieu');
                              showToast('Xem thông tin văn bản chuyển thẩm quyền tại tab Hồ sơ & Văn bản');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            <span>Biên bản bàn giao</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowXacNhanChuyenModal(true)}
                          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-[13px] font-bold shadow-lg ring-2 ring-purple-300/40 transition-all cursor-pointer"
                          title="Gửi chuyển thẩm quyền hồ sơ đơn đến đơn vị tiếp nhận"
                        >
                          <span className="material-symbols-outlined text-[18px]">drive_file_move</span>
                          <span>Gửi chuyển thẩm quyền</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* 4. CHƯA TẠO VĂN BẢN QUYẾT ĐỊNH */
                hasBaoCaoDeXuat ? (
                  /* ĐÃ CÓ BÁO CÁO ĐỀ XUẤT: HIỂN THỊ CÁC NÚT XÁC ĐỊNH HƯỚNG XỬ LÝ ĐƠN (THỤ LÝ, KHÔNG THỤ LÝ, TRẢ LẠI...) */
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={handleExecutePrimaryAction}
                      className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-l-xl rounded-r-none border-r border-white/20 active:scale-98 text-white text-[13px] font-bold transition-all cursor-pointer shadow-md ${huongXuLyDaChon === 'thu_ly'
                        ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300/40'
                        : huongXuLyDaChon === 'khong_thu_ly'
                          ? 'bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-300/40'
                          : huongXuLyDaChon === 'yeu_cau_bo_sung'
                            ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-300/40'
                            : huongXuLyDaChon === 'tra_lai'
                              ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300/40'
                              : huongXuLyDaChon === 'ban_giao'
                                ? 'bg-purple-600 hover:bg-purple-700 ring-2 ring-purple-300/40'
                                : 'bg-teal-600 hover:bg-teal-700 ring-2 ring-teal-300/40'
                        }`}
                      title={`Bấm để thực hiện: ${HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.buttonText || 'Thụ lý'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.icon || 'gavel'}
                      </span>
                      <span>{HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.buttonText || 'Thụ lý'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHuongDropdown(!showHuongDropdown)}
                      className={`inline-flex items-center justify-center px-2.5 py-2.5 rounded-r-xl rounded-l-none text-white transition-all cursor-pointer shadow-md ${huongXuLyDaChon === 'thu_ly'
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : huongXuLyDaChon === 'khong_thu_ly'
                          ? 'bg-rose-700 hover:bg-rose-800'
                          : huongXuLyDaChon === 'yeu_cau_bo_sung'
                            ? 'bg-blue-700 hover:bg-blue-800'
                            : huongXuLyDaChon === 'tra_lai'
                              ? 'bg-amber-700 hover:bg-amber-800'
                              : huongXuLyDaChon === 'ban_giao'
                                ? 'bg-purple-700 hover:bg-purple-800'
                                : 'bg-teal-700 hover:bg-teal-800'
                        }`}
                      title="Nhấn để chọn hướng xử lý khác"
                    >
                      <span className={`material-symbols-outlined text-[20px] transition-transform ${showHuongDropdown ? 'rotate-180' : ''}`}>
                        arrow_drop_down
                      </span>
                    </button>

                    {/* DROPDOWN MENU CHỌN CÁC HƯỚNG XỬ LÝ KHÁC */}
                    {showHuongDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowHuongDropdown(false)} />
                        <div className="absolute right-0 top-full mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-scale-up">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleSelectHuong('thu_ly')}
                              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${huongXuLyDaChon === 'thu_ly'
                                ? 'bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-300'
                                : 'hover:bg-slate-50 text-slate-800'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">gavel</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-[13px] text-slate-900">Thụ lý</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                  Đủ điều kiện thụ lý giải quyết theo quy định
                                </p>
                              </div>
                              {huongXuLyDaChon === 'thu_ly' && (
                                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-1">check</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectHuong('khong_thu_ly')}
                              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${huongXuLyDaChon === 'khong_thu_ly'
                                ? 'bg-rose-50/80 text-rose-900 ring-1 ring-rose-300'
                                : 'hover:bg-slate-50 text-slate-800'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-[13px] text-slate-900">Không thụ lý</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                  Không đủ điều kiện thụ lý theo Điều 29
                                </p>
                              </div>
                              {huongXuLyDaChon === 'khong_thu_ly' && (
                                <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-1">check</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectHuong('yeu_cau_bo_sung')}
                              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${huongXuLyDaChon === 'yeu_cau_bo_sung'
                                ? 'bg-blue-50/80 text-blue-900 ring-1 ring-blue-300'
                                : 'hover:bg-slate-50 text-slate-800'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">note_add</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-[13px] text-slate-900">Yêu cầu bổ sung</span>
                                  {isAiNeedsMissingDocs && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                      AI đề xuất
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                  Chưa đủ chứng cứ hoặc hồ sơ theo quy định
                                </p>
                              </div>
                              {huongXuLyDaChon === 'yeu_cau_bo_sung' && (
                                <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-1">check</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectHuong('tra_lai')}
                              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${huongXuLyDaChon === 'tra_lai'
                                ? 'bg-amber-50/80 text-amber-900 ring-1 ring-amber-300'
                                : 'hover:bg-slate-50 text-slate-800'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-[13px] text-slate-900">Trả lại</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                  Trả lại đơn và kèm phiếu hướng dẫn công dân
                                </p>
                              </div>
                              {huongXuLyDaChon === 'tra_lai' && (
                                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-1">check</span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectHuong('ban_giao')}
                              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${huongXuLyDaChon === 'ban_giao'
                                ? 'bg-purple-50/80 text-purple-900 ring-1 ring-purple-300'
                                : 'hover:bg-slate-50 text-slate-800'
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">drive_file_move</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-[13px] text-slate-900">Chuyển thẩm quyền xử lý</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                                  Chuyển đơn đến cơ quan có thẩm quyền giải quyết
                                </p>
                              </div>
                              {huongXuLyDaChon === 'ban_giao' && (
                                <span className="material-symbols-outlined text-purple-600 text-[18px] shrink-0 mt-1">check</span>
                              )}
                            </button>
                          </div>

                          <div className="border-t border-slate-100 pt-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowHuongDropdown(false);
                                setShowXacMinhModal(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-colors text-[12.5px] font-semibold cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[17px] text-blue-600">fact_check</span>
                              <span>Mở bảng Xác minh &amp; Đề xuất (4 tiêu chí)</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* CHƯA CÓ BÁO CÁO ĐỀ XUẤT: BẮT BUỘC TẠO BÁO CÁO ĐỀ XUẤT TRƯỚC, CHƯA HIỂN THỊ CÁC NÚT HƯỚNG XỬ LÝ */
                  <button
                    type="button"
                    onClick={handleTaoBaoCaoDeXuat}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-600 bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white shadow-md ring-2 ring-blue-300/40 transition-all cursor-pointer text-[13px] font-bold animate-pulse"
                    title="Khởi tạo văn bản Báo cáo đề xuất hướng xử lý đơn trước khi xác định hướng giải quyết"
                  >
                    <span className="material-symbols-outlined text-[18px]">rate_review</span>
                    <span>Tạo báo cáo đề xuất</span>
                  </button>
                )
              ))}
          </div>
        </div>
        <div className="flex items-center gap-8 text-xs font-bold border-b border-slate-200 -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('thong-tin')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'thong-tin'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Thông tin chung</span>
          </button>

          {/* Tab 2: Mối liên hệ */}
          <button
            type="button"
            onClick={() => setActiveTab('lien-he')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'lien-he'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Mối liên hệ</span>
          </button>

          {/* Tab 3: Đơn khác (Đơn & lượt nhận đã ghép) */}
          <button
            type="button"
            onClick={() => setActiveTab('don-khac')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'don-khac'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder_shared</span>
            <span>Đơn khác</span>

          </button>

          {/* Tab 4: Hồ sơ & Văn bản */}
          <button
            type="button"
            onClick={() => setActiveTab('tai-lieu')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'tai-lieu'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            <span>Hồ sơ &amp; Văn bản</span>

          </button>

          {/* Tab 5: Quy trình */}
          <button
            type="button"
            onClick={() => setActiveTab('quy-trinh')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'quy-trinh'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            <span>Quy trình</span>

          </button>

          {/* Tab 6: Lịch sử xử lý */}
          <button
            type="button"
            onClick={() => setActiveTab('lich-su')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'lich-su'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Lịch sử xử lý</span>

          </button>

          {/* Tab 7: Lịch sử trình ký */}
          <button
            type="button"
            onClick={() => setActiveTab('lich-su-trinh-ky')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'lich-su-trinh-ky'
              ? 'border-[#004ac6] text-[#004ac6]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]">draw</span>
            <span>Lịch sử trình ký</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full mx-auto space-y-6">
          {/* Banner thông báo: Chờ cán bộ tiếp nhận đơn (trường hợp chuyển từ Lượt nhận không có file) */}
          {/* {(currentDon.isAwaitingAcceptance || currentDon.statusBadge === 'Chờ tiếp nhận' || currentDon.isNoFileTransfer) && (
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Đơn thư chuyển xử lý trực tiếp (Chưa có tệp đính kèm)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Chờ tiếp nhận
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Lượt nhận này chưa có tài liệu scan/số hóa. Cán bộ nhấn <strong>Tiếp nhận đơn</strong> để nhận thụ lý và nhập các thông tin cơ bản tại tab Thông tin chung.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTiepNhanDon}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                <span>Tiếp nhận đơn &amp; Nhập thông tin</span>
              </button>
            </div>
          )} */}

          {activeTab === 'thong-tin' && (
            <TabThongTinChung
              currentDon={currentDon}
              onOpenLuotNhan={() => onNav('ban-phan-tich')}
              onOpenSoDo={() => setActiveTab('lien-he')}
              isEditing={isEditingThongTinDon}
              onStartEdit={() => setIsEditingThongTinDon(true)}
              onCancelEdit={() => setIsEditingThongTinDon(false)}
              onSaveDon={(updatedData) => {
                setCurrentDon(updatedData);
                setIsEditingThongTinDon(false);
                showToast(`✓ Đã cập nhật thành công thông tin đơn ${updatedData.code}!`);
                addHistoryLog({
                  title: 'Chỉnh sửa, cập nhật thông tin hồ sơ đơn',
                  actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
                  actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
                  actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
                  category: 'ghi_chu',
                  statusBadge: {
                    text: 'Cập nhật',
                    bgClass: 'bg-slate-100',
                    textClass: 'text-slate-800',
                    borderClass: 'border-slate-200',
                  },
                  description: `Cán bộ thụ lý đã cập nhật lại thông tin hồ sơ trực tiếp: người nộp "${updatedData.nguoiNop}", tiêu đề "${updatedData.title}", loại đơn "${updatedData.loaiDon}".`,
                });
              }}
            />
          )}
          {activeTab === 'lien-he' && <TabMoiLienHe currentDon={currentDon} />}
          {activeTab === 'don-khac' && <TabDonKhac currentDon={currentDon} />}
          {activeTab === 'tai-lieu' && (
            <TabTaiLieu
              currentDon={currentDon}
              onDocCountChange={setDocCount}
              initialEditingDoc={editingDocInTab}
              onClearInitialEditingDoc={() => setEditingDocInTab(null)}
              onReturnToXacMinh={() => setShowXacMinhModal(true)}
              sharedVanBanList={vanBanXacMinhList}
              onUpdateSharedVanBanList={setVanBanXacMinhList}
              signingDocuments={signingDocuments}
              onOpenBaoCaoDeXuat={() => setShowTaoBaoCaoDeXuatModal(true)}
              onUpdateSigningDocuments={onUpdateSigningDocuments}
              onTrinhKyBaoCao={handleTrinhKyBaoCaoTuTab}
            />
          )}
          {activeTab === 'quy-trinh' && (
            <TabQuyTrinh
              currentDon={currentDon}
              workflow={workflow}
              activeStepNumber={activeStepNumber}
              onNav={onNav}
              onOpenXacMinh={() => setShowXacMinhModal(true)}
              onOpenBoSung={() => setShowModalBoSung(true)}
              onOpenBuocTiepTheo={() => setShowModalBuocTiepTheo(true)}
              onStepChange={(stepNum) => setActiveStepNumber(stepNum)}
              onWorkflowChange={(_newLoaiDon, newWf) => {
                showToast(`✓ Đã chuyển sang quy trình "${newWf.name}"!`);
              }}
              onViewDocument={handleViewDocInTabTaiLieu}
            />
          )}
          {activeTab === 'lich-su' && (
            <TabLichSuXuLy
              currentDon={currentDon}
              historyLogs={historyLogs}
              onAddLog={addHistoryLog}
              onViewDoc={(docName) => handleViewDocInTabTaiLieu({ tenVanBan: docName })}
            />
          )}
          {activeTab === 'lich-su-trinh-ky' && (
            <TabLichSuTrinhKy
              currentDon={currentDon}
              signingDocuments={signingDocuments}
              currentAccount={currentAccount}
              onOpenQuyTrinh={() => setActiveTab('quy-trinh')}
              onOpenTaiLieu={() => setActiveTab('tai-lieu')}
            />
          )}
        </div>
      </div>

      {/* Modal tạo Thông báo bổ sung thông tin, tài liệu khi chưa đủ thông tin */}
      <ThongBaoBoSungModal
        isOpen={showModalBoSung}
        onClose={() => setShowModalBoSung(false)}
        onSuccess={(soHieu, danhSachBoSung) => {
          const now = new Date();
          const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
          const timeNow = `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const coQuanBanHanh = currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn';
          const nguoiNop = currentDon.nguoiNop || 'Công dân nộp đơn';

          const fullDocText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n${coQuanBanHanh.toUpperCase()}\nSố: ${soHieu}\nHà Nội, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}\n\nTHÔNG BÁO\nVề việc yêu cầu bổ sung thông tin, tài liệu liên quan đến nội dung đơn\n\nKính gửi: Ông/Bà ${nguoiNop}\n\nCơ quan tiếp nhận đơn của Ông/Bà ghi mã hồ sơ ${currentDon.code}.\nNội dung đơn: "${currentDon.title || currentDon.noiDung}".\n\nĐể có đủ cơ sở xem xét, thụ lý giải quyết đơn theo đúng quy định của pháp luật, cơ quan đề nghị Ông/Bà bổ sung các thông tin, tài liệu sau đây:\n${danhSachBoSung.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}\n\nThời hạn nộp bổ sung: Trong thời hạn 10 ngày làm việc kể từ ngày nhận được Thông báo này.\nQuá thời hạn nêu trên mà Ông/Bà không bổ sung đầy đủ tài liệu, cơ quan sẽ xử lý theo quy định hiện hành.\n\nNơi nhận:\n- Như trên;\n- Lãnh đạo Ban (để báo cáo);\n- Lưu: VT, Hồ sơ ${soHieu}.\n\nCÁN BỘ XỬ LÝ ĐƠN\n(Ký số VGCA)\n${currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'}`;

          const newDocItem: any = {
            id: `DOC-BS-${Date.now()}`,
            name: `Thong_bao_bo_sung_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            category: 'Thông báo bổ sung hồ sơ',
            folder: 'van_ban_quyet_dinh',
            soHieu: soHieu,
            size: '320 KB',
            pages: 1,
            uploadDate: timeNow,
            signer: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            coQuanBanHanh: coQuanBanHanh,
            stepBelongsTo: 'Bước 1: Kiểm tra điều kiện',
            ocrStatus: 'Hoàn tất',
            isProcessDoc: true,
            isEditable: true,
            loaiVanBan: 'thong_bao_bo_sung',
            tenVanBan: `Thông báo yêu cầu bổ sung hồ sơ (${soHieu})`,
            nguoiNhan: nguoiNop,
            trichYeu: `Yêu cầu bổ sung tài liệu hồ sơ đơn ${currentDon.code}`,
            noiDungChiTiet: fullDocText,
            previewExcerpt: fullDocText,
            trangThai: 'du_thao',
            signingStatus: 'nhap',
          };

          const signingDoc: SigningDocument = {
            id: newDocItem.id,
            soKyHieu: soHieu,
            tenVanBan: `Thông báo yêu cầu bổ sung hồ sơ (${soHieu})`,
            loaiVanBan: 'thong_bao_bo_sung',
            loaiVanBanLabel: 'Thông báo yêu cầu bổ sung hồ sơ',
            hoSoCode: currentDon.code,
            loaiDon: currentDon.loaiDon || 'Đơn tiếp nhận hành chính',
            nguoiGuiDon: nguoiNop,
            noiDungDon: currentDon.noiDung || currentDon.title || 'Đơn yêu cầu bổ sung thông tin',
            nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            donViNguoiLap: currentAccount?.phongBan || coQuanBanHanh,
            ngayTao: todayStr,
            hanXuLy: '10 ngày',
            mucDoUuTien: 'thuong',
            status: 'nhap',
            currentSignerIndex: 0,
            lanhDaoId: 'ld-01',
            lanhDaoName: 'Đ/c Trần Văn Hùng',
            lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
            trichYeu: `Thông báo bổ sung tài liệu cho công dân ${nguoiNop}`,
            noiDungChiTiet: fullDocText,
            yKienCanBo: 'Kính trình Lãnh đạo ký duyệt Thông báo bổ sung hồ sơ.',
            phienBanHienTai: 'V1',
            versionHistory: [
              {
                version: 'V1',
                thoiGian: timeNow,
                nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
                trangThaiLucDo: 'Bản nháp',
                ghiChu: 'Lập Thông báo bổ sung hồ sơ',
                noiDungSnapshot: fullDocText,
              },
            ],
            tepDinhKem: [],
            signers: [
              {
                id: 'ld-01',
                name: 'Đ/c Trần Văn Hùng',
                chucVu: 'Phó Chánh Thanh tra thành phố',
                vaiTro: 'ky',
                thuTu: 1,
                status: 'chua_den_luot',
              },
            ],
            auditLogs: [
              {
                id: `al-${Date.now()}-1`,
                time: timeNow,
                actor: currentAccount?.name || 'Nguyễn Minh Anh',
                actorRole: 'Cán bộ thụ lý',
                action: 'Lập Thông báo bổ sung',
                statusBefore: 'nhap',
                statusAfter: 'nhap',
                version: 'V1',
                note: 'Lưu dự thảo Thông báo bổ sung',
              },
            ],
            history: [
              {
                id: `h-${Date.now()}`,
                time: timeNow,
                actor: `${currentAccount?.name || 'Nguyễn Minh Anh'} (Cán bộ thụ lý)`,
                action: 'Lập Thông báo bổ sung',
                note: `Bổ sung ${danhSachBoSung.length} mục tài liệu`,
              },
            ],
          };

          if (onUpdateSigningDocuments) {
            onUpdateSigningDocuments((prev) => [signingDoc, ...prev]);
          } else if (onCreateSigningDocument) {
            onCreateSigningDocument(signingDoc);
          }

          setDocCount((c) => c + 1);
          setDaGuiThongBaoBoSung(true);
          setEditingDocInTab(newDocItem);
          setActiveTab('tai-lieu');
          showToast(`✓ Đã lưu Thông báo bổ sung (${soHieu})! Đã chuyển sang tab Hồ sơ & Văn bản để thực hiện trình ký.`);

          addHistoryLog({
            title: `Ban hành Thông báo yêu cầu bổ sung hồ sơ (${soHieu})`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: 'Yêu cầu bổ sung',
              bgClass: 'bg-amber-50',
              textClass: 'text-amber-800',
              borderClass: 'border-amber-200',
            },
            description: `Đã ban hành thông báo yêu cầu công dân ${currentDon.nguoiNop} bổ sung ${danhSachBoSung.length} tài liệu, chứng cứ còn thiếu theo quy định.`,
            docInfo: {
              name: `Thông báo bổ sung hồ sơ ${soHieu}`,
              code: soHieu,
              type: 'thong_bao',
            },
          });
        }}
        workflow={workflow}
        donCode={currentDon.code}
        donTitle={currentDon.title}
        nguoiNop={currentDon.nguoiNop}
        loaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
      />

      {/* Modal thực hiện bước tiếp theo theo quy trình khi có đủ thông tin */}
      <ThucHienBuocTiepTheoModal
        isOpen={showModalBuocTiepTheo}
        onClose={() => setShowModalBuocTiepTheo(false)}
        stepNumber={activeStepNumber}
        onSuccess={(stepName, docTitle, docDetails) => {
          const now = new Date();
          const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
          const timeStr = `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

          const targetSoHieu =
            docDetails?.soHieu ||
            (workflow.id === 'to-giac'
              ? `QĐ-PC03/${now.getFullYear()}/CSĐT`
              : `TB-${activeStepNumber}/${now.getFullYear()}/UBND`);
          const targetDocTitle = docDetails?.docTitle || docTitle;
          const targetAssignee =
            docDetails?.assignee || currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh';
          const targetHanGiaiQuyet = docDetails?.hanGiaiQuyet || '30 ngày làm việc';
          const targetGhiChu = docDetails?.ghiChu || '';
          const isToGiac = workflow.id === 'to-giac';
          const isToCao = workflow.id === 'to-cao';
          const coQuan = isToGiac
            ? 'Cơ quan CSĐT Công an TP. Hà Nội'
            : 'UBND quận Cầu Giấy';

          const loaiVanBan =
            docDetails?.loaiVanBan ||
            (targetDocTitle.toLowerCase().includes('quyết định')
              ? 'quyet_dinh'
              : targetDocTitle.toLowerCase().includes('thông báo')
                ? 'thong_bao'
                : 'cong_van');

          const category =
            docDetails?.category ||
            (targetDocTitle.toLowerCase().includes('quyết định')
              ? 'Quyết định thụ lý'
              : targetDocTitle.toLowerCase().includes('thông báo')
                ? 'Thông báo thụ lý'
                : 'Văn bản quy trình');

          // Sinh văn bản chuẩn hành chính theo loại hồ sơ
          const fullDocText = isToGiac
            ? `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nCƠ QUAN CẢNH SÁT ĐIỀU TRA\nSố: ${targetSoHieu}\nHà Nội, ngày ${todayStr.split('/')[0]} tháng ${todayStr.split('/')[1]} năm ${todayStr.split('/')[2]}\n\nQUYẾT ĐỊNH\nPhân công Phó Thủ trưởng CQĐT, Điều tra viên, Cán bộ điều tra\ngiải quyết nguồn tin về tội phạm\n\nTHỦ TRƯỞNG CƠ QUAN CẢNH SÁT ĐIỀU TRA\n\nCăn cứ Điều 36, Điều 145 và Điều 146 Bộ luật Tố tụng hình sự năm 2015;\nCăn cứ Thông tư liên tịch số 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC quy định phối hợp trong việc tiếp nhận, giải quyết nguồn tin về tội phạm;\nXét nguồn tin về tội phạm mang mã hồ sơ số ${currentDon.code} do người gửi: ${currentDon.nguoiNop};\nNội dung nguồn tin: "${currentDon.title}".\n\nQUYẾT ĐỊNH:\n\nĐiều 1. Thụ lý giải quyết nguồn tin về tội phạm nêu trên và phân công các đồng chí sau tiến hành giải quyết:\n1. Phân công Điều tra viên thụ lý chính: ${targetAssignee}.\n2. Thời hạn giải quyết: ${targetHanGiaiQuyet}.\n\nĐiều 2. Điều tra viên được phân công có trách nhiệm thực hiện nhiệm vụ, quyền hạn theo đúng quy định của Bộ luật Tố tụng hình sự; báo cáo tiến độ và đề xuất biện pháp xử lý kịp thời.${targetGhiChu ? `\nChỉ đạo cụ thể: ${targetGhiChu}` : ''}\n\nĐiều 3. Quyết định này có hiệu lực kể từ ngày ký. Các đơn vị nghiệp vụ, Viện kiểm sát nhân dân cùng cấp và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này./.\n\nNơi nhận:\n- Viện kiểm sát nhân dân cùng cấp;\n- Thủ trưởng CQĐT (để b/c);\n- Các đồng chí tại Điều 1;\n- Người nộp nguồn tin (để biết);\n- Lưu: Hồ sơ số ${currentDon.code}.\n\nTHỦ TRƯỞNG CƠ QUAN ĐIỀU TRA\n(Ký, đóng dấu)`
            : isToCao
              ? `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nỦY BAN NHÂN DÂN QUẬN CẦU GIẤY\nSố: ${targetSoHieu}\nHà Nội, ngày ${todayStr.split('/')[0]} tháng ${todayStr.split('/')[1]} năm ${todayStr.split('/')[2]}\n\nQUYẾT ĐỊNH\nVề việc thụ lý giải quyết tố cáo\n\nCHỦ TỊCH ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY\n\nCăn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;\nCăn cứ Luật Tố cáo ngày 12 tháng 6 năm 2018;\nCăn cứ Nghị định số 31/2019/NĐ-CP ngày 10 tháng 4 năm 2019 của Chính phủ quy định chi tiết một số điều của Luật Tố cáo;\nXét đơn tố cáo của ông/bà ${currentDon.nguoiNop} (Mã hồ sơ: ${currentDon.code});\nNội dung tố cáo: "${currentDon.title}".\nTheo Báo cáo kết quả xác minh ban đầu và đề xuất thụ lý của bộ phận chuyên môn,\n\nQUYẾT ĐỊNH:\n\nĐiều 1. Thụ lý giải quyết tố cáo đối với các nội dung nêu trong đơn của ông/bà ${currentDon.nguoiNop}.\n- Thời hạn giải quyết tố cáo là: ${targetHanGiaiQuyet}.\n\nĐiều 2. Phân công cán bộ xác minh nội dung tố cáo:\n- Cán bộ chủ trì thụ lý xác minh: ${targetAssignee}.\n- Cán bộ được phân công có nhiệm vụ tiến hành xác minh, thu thập chứng cứ, làm rõ nội dung tố cáo theo đúng trình tự, thủ tục quy định của Luật Tố cáo và báo cáo Chủ tịch UBND quận.${targetGhiChu ? `\n- Chỉ đạo cụ thể: ${targetGhiChu}` : ''}\n\nĐiều 3. Chánh Văn phòng HĐND-UBND quận, Trưởng phòng Tiếp công dân & Xử lý đơn, cán bộ có tên tại Điều 2 và ông/bà ${currentDon.nguoiNop} chịu trách nhiệm thi hành Quyết định này./.\n\nNơi nhận:\n- Như Điều 3;\n- Chủ tịch, Phó Chủ tịch UBND quận;\n- Người tố cáo (để biết);\n- Lưu: VT, Hồ sơ ${currentDon.code}.\n\nTM. ỦY BAN NHÂN DÂN\nKT. CHỦ TỊCH - PHÓ CHỦ TỊCH\n(Ký, đóng dấu)`
              : `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nỦY BAN NHÂN DÂN QUẬN CẦU GIẤY\nSố: ${targetSoHieu}\nHà Nội, ngày ${todayStr.split('/')[0]} tháng ${todayStr.split('/')[1]} năm ${todayStr.split('/')[2]}\n\n${targetDocTitle.toUpperCase()}\nVề việc thụ lý giải quyết đơn của ông/bà ${currentDon.nguoiNop}\n\nKính gửi: Ông/Bà ${currentDon.nguoiNop} (Địa chỉ: ${currentDon.diaChi || 'Cầu Giấy, Hà Nội'})\n\nỦy ban nhân dân quận tiếp nhận đơn của Ông/Bà mang mã hồ sơ số ${currentDon.code}.\nNội dung đơn: "${currentDon.title}".\nSau khi kiểm tra điều kiện thụ lý và xem xét hồ sơ theo quy định của pháp luật;\n\nỦY BAN NHÂN DÂN QUẬN THÔNG BÁO:\n1. Chính thức thụ lý giải quyết nội dung đơn của Ông/Bà kể từ ngày ban hành văn bản này.\n2. Cán bộ được phân công thụ lý chính: ${targetAssignee}.\n3. Thời hạn giải quyết: ${targetHanGiaiQuyet}.${targetGhiChu ? `\n4. Chỉ đạo giải quyết: ${targetGhiChu}` : ''}\n\nỦy ban nhân dân quận thông báo để Ông/Bà được biết và phối hợp làm việc khi có yêu cầu./.\n\nNơi nhận:\n- Như trên;\n- Lãnh đạo UBND quận;\n- Cán bộ thụ lý (${targetAssignee});\n- Lưu: VT, HS.${currentDon.code}.\n\nTM. ỦY BAN NHÂN DÂN\nKT. CHỦ TỊCH - PHÓ CHỦ TỊCH\n(Ký, đóng dấu)`;

          const cleanFileName = targetDocTitle
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_');

          const isTrinhKy = docDetails?.action !== 'save';
          const targetLanhDao =
            docDetails?.lanhDaoKy ||
            (isToGiac
              ? 'Lê Hoàng Nam (Thủ trưởng Cơ quan CSĐT)'
              : 'Trần Văn Cường (Phó Chủ tịch UBND quận)');

          const newDocItem: any = {
            id: `DOC-TL-${Date.now().toString().slice(-4)}`,
            name: `${cleanFileName}_${targetSoHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            category: category,
            soHieu: targetSoHieu,
            size: '390 KB',
            pages: 2,
            uploadDate: timeStr,
            signer: isTrinhKy ? targetLanhDao : targetAssignee,
            coQuanBanHanh: coQuan,
            stepBelongsTo: `Bước ${activeStepNumber}: ${stepName}`,
            ocrStatus: 'Hoàn tất',
            isProcessDoc: true,
            isEditable: true,
            loaiVanBan: loaiVanBan,
            tenVanBan: targetDocTitle,
            nguoiNhan: currentDon.nguoiNop,
            diaDiem: 'Trụ sở cơ quan giải quyết',
            thoiGianHen: targetHanGiaiQuyet,
            trichYeu: `V/v ${targetDocTitle}: ${currentDon.title}`,
            noiDungChiTiet: fullDocText,
            previewExcerpt: fullDocText,
            trangThai: isTrinhKy ? 'da_ban_hanh' : 'du_thao',
            fromXacMinh: true,
            signingStatus: isTrinhKy ? 'cho_trinh' : 'nhap',
          };

          // 1. Thêm vào danh sách văn bản dùng chung của hồ sơ
          setVanBanXacMinhList((prev) => [
            {
              id: newDocItem.id,
              loai: loaiVanBan as any,
              tenVanBan: targetDocTitle,
              soKyHieu: targetSoHieu,
              ngayLap: todayStr,
              nguoiNhan: currentDon.nguoiNop,
              trichYeu: newDocItem.trichYeu,
              noiDungChiTiet: fullDocText,
              coQuanBanHanh: coQuan,
              trangThai: isTrinhKy ? 'da_ban_hanh' : 'du_thao',
            },
            ...prev,
          ]);

          // 2. Thêm vào signingDocuments phục vụ luồng trình ký Lãnh đạo (trạng thái Bản nháp)
          const signingDoc: SigningDocument = {
            id: newDocItem.id,
            soKyHieu: targetSoHieu,
            hoSoCode: currentDon.code,
            luotNhanId: currentDon.luotNhanId,
            loaiDon: currentDon.loaiDon || 'Đơn khiếu nại',
            nguoiGuiDon: currentDon.nguoiNop,
            noiDungDon: currentDon.title,
            tenVanBan: targetDocTitle,
            loaiVanBan: 'quyet_dinh_thu_ly',
            loaiVanBanLabel: 'Quyết định thụ lý',
            trichYeu: `Quyết định thụ lý giải quyết: ${currentDon.title}`,
            noiDungChiTiet: fullDocText,
            nguoiLap: currentAccount?.name || targetAssignee,
            donViNguoiLap: coQuan,
            ngayTao: `${todayStr} 09:30`,
            status: 'nhap',
            mucDoUuTien: 'thuong',
            hanXuLy: '24 giờ',
            signers: [
              {
                id: 'ld-01',
                name: targetLanhDao.replace(/\s*\(.*\)/, ''),
                chucVu: isToGiac ? 'Thủ trưởng Cơ quan CSĐT' : 'Phó Chủ tịch UBND quận',
                coQuan: coQuan,
                vaiTro: 'duyet',
                thuTu: 1,
                status: 'chua_den_luot',
              },
            ],
            currentSignerIndex: 0,
            lanhDaoId: 'ld-01',
            lanhDaoName: targetLanhDao.replace(/\s*\(.*\)/, ''),
            lanhDaoChucVu: isToGiac ? 'Thủ trưởng Cơ quan CSĐT' : 'Phó Chủ tịch UBND quận',
            tepDinhKem: [
              {
                id: `att-tl-${Date.now()}`,
                tenTep: `${cleanFileName}_${targetSoHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                dungLuong: '390 KB',
                loai: 'du_thao',
              },
            ],
            phienBanHienTai: 'V1',
            versionHistory: [
              {
                version: 'V1',
                thoiGian: `${todayStr} 10:00`,
                nguoiTao: currentAccount?.name || targetAssignee,
                trangThaiLucDo: 'Bản nháp',
                ghiChu: `Dự thảo Quyết định thụ lý đơn: ${targetDocTitle}`,
                noiDungSnapshot: fullDocText,
              },
            ],
            history: [
              {
                id: `hist-${Date.now()}`,
                time: `${todayStr} 10:00`,
                actor: currentAccount?.name || targetAssignee,
                action: 'Lưu bản nháp Quyết định thụ lý giải quyết',
              },
            ],
            auditLogs: [
              {
                id: `al-${Date.now()}`,
                time: `${todayStr} 10:00`,
                actor: currentAccount?.name || targetAssignee,
                actorRole: 'Cán bộ thụ lý',
                action: 'Tạo mới',
                statusBefore: 'chua_tao',
                statusAfter: 'nhap',
                version: 'V1',
                note: newDocItem.trichYeu,
              },
            ],
          };

          if (onUpdateSigningDocuments) {
            onUpdateSigningDocuments((prev) => [signingDoc, ...prev]);
          }

          // 3. Chuyển sang tab Hồ sơ & Văn bản và hiển thị văn bản vừa tạo
          setDocCount((c) => c + 1);
          setEditingDocInTab(newDocItem);
          setActiveTab('tai-lieu');

          showToast(
            `✓ Đã lưu văn bản Quyết định thụ lý (${targetSoHieu})! Đã chuyển sang tab Hồ sơ & Văn bản để rà soát và thực hiện trình ký Lãnh đạo.`
          );

          // 4. Ghi lịch sử xử lý
          addHistoryLog({
            title: `Lập dự thảo Quyết định thụ lý: ${targetDocTitle}`,
            actor: targetAssignee,
            actorRole: currentDon.chucVuCanBo || 'Cán bộ thụ lý',
            actorDept: coQuan,
            category: 'quy_trinh',
            statusBadge: {
              text: 'Bản nháp',
              bgClass: 'bg-slate-100',
              textClass: 'text-slate-800',
              borderClass: 'border-slate-200',
            },
            description: `Đã lưu dự thảo Quyết định thụ lý giải quyết số ${targetSoHieu} tại tab Hồ sơ & Văn bản. Cán bộ thực hiện rà soát và chuyển trình ký Lãnh đạo phê duyệt.`,
            docInfo: {
              name: targetDocTitle,
              code: targetSoHieu,
              type: loaiVanBan,
            },
          });
        }}
        workflow={workflow}
        donCode={currentDon.code}
        donTitle={currentDon.title}
        nguoiNop={currentDon.nguoiNop}
        loaiDon={currentDon.loaiDon || 'Đơn khiếu nại đất đai'}
      />
      {/* Modal Xác minh & Đề xuất hướng giải quyết */}
      <XacMinhVaDeXuatModal
        isOpen={showXacMinhModal}
        onClose={() => setShowXacMinhModal(false)}
        onNav={onNav}
        onOpenBaoCaoXacMinh={() => setShowTaoBaoCaoDeXuatModal(true)}
        onOpenDocInTab={handleOpenDocInTab}
        sharedVanBanList={vanBanXacMinhList}
        onUpdateSharedVanBanList={setVanBanXacMinhList}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
        onSelectHuongXuLy={(huong: HuongGiaiQuyetType | 'quy_trinh') => {
          setShowXacMinhModal(false);
          if (huong === 'quy_trinh') {
            onNav('quy-trinh-xu-ly');
            return;
          }
          // Chuyển trạng thái đơn sang "Đã xác minh" và lưu hướng đã chọn
          setTrangThaiXacMinh('da_xac_minh');
          setHuongXuLyDaChon(huong);

          addHistoryLog({
            title: `Hoàn thành xác minh & Đề xuất phương án: ${HUONG_XU_LY_CONFIG[huong]?.label || huong}`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'xac_minh',
            statusBadge: {
              text: 'Đã xác minh',
              bgClass: 'bg-amber-50',
              textClass: 'text-amber-800',
              borderClass: 'border-amber-200',
            },
            description: `Hoàn tất kiểm tra điều kiện thụ lý và xác minh nội dung đơn. Đề xuất phương án giải quyết: ${HUONG_XU_LY_CONFIG[huong]?.label}.`,
          });

          if (huong === 'thu_ly') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Thụ lý giải quyết`);
            setTimeout(() => setShowModalBuocTiepTheo(true), 300);
          } else if (huong === 'yeu_cau_bo_sung') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Yêu cầu bổ sung tài liệu`);
            setTimeout(() => setShowModalBoSung(true), 300);
          } else if (huong === 'khong_thu_ly') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Không thụ lý giải quyết`);
            setTimeout(() => setShowKhongThuLyModal(true), 300);
          } else if (huong === 'tra_lai') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Trả lại đơn & Hướng dẫn`);
            setTimeout(() => setShowTraLaiModal(true), 300);
          } else if (huong === 'ban_giao') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Chuyển thẩm quyền xử lý`);
            setTimeout(() => setShowBanGiaoModal(true), 300);
          } else if (huong === 'tra_loi_don') {
            showToast(`✓ Đã xác minh hoàn tất: Đơn chuyển trạng thái "ĐÃ XÁC MINH" • Hướng xử lý: Trả lời đơn`);
            setTimeout(() => setShowTraLoiDonModal(true), 300);
          }
        }}
      />

      {/* Modal Không thụ lý giải quyết */}
      <KhongThuLyModal
        isOpen={showKhongThuLyModal}
        onClose={() => setShowKhongThuLyModal(false)}
        onSubmit={(data) => {
          setShowKhongThuLyModal(false);

          const isTrinhKy = data.action === 'trinh_ky';
          const fullDocText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nỦY BAN NHÂN DÂN QUẬN CẦU GIẤY\nSố: ${data.soKyHieu}\nHà Nội, ngày ${data.ngayBanHanh}\n\nQUYẾT ĐỊNH\nVề việc không thụ lý giải quyết đơn\n\nKính gửi: Ông/Bà ${data.nguoiNhan} (Địa chỉ: ${currentDon.diaChi || 'Cầu Giấy, Hà Nội'})\n\nNgày ${currentDon.ngayNhan}, Ủy ban nhân dân quận tiếp nhận đơn của Ông/Bà mang mã hồ sơ ${currentDon.code}.\nNội dung đơn: "${currentDon.title}".\nSau khi kiểm tra điều kiện thụ lý theo quy định của pháp luật, Ủy ban nhân dân quận nhận thấy:\n${data.lyDoChiTiet}\n\nCăn cứ ${data.canCuPhapLy}, Ủy ban nhân dân quận quyết định: Không thụ lý giải quyết nội dung đơn nêu trên.\nỦy ban nhân dân quận thông báo để Ông/Bà được biết và thực hiện theo đúng quy định của pháp luật./.\n\nTM. ỦY BAN NHÂN DÂN\nKT. CHỦ TỊCH - PHÓ CHỦ TỊCH\n${data.nguoiKy}`;

          const newDocItem: any = {
            id: `DOC-KTL-${Date.now().toString().slice(-4)}`,
            name: `Quyet_dinh_khong_thu_ly_${data.soKyHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            category: 'Quyết định không thụ lý',
            soHieu: data.soKyHieu,
            size: '420 KB',
            pages: 1,
            uploadDate: `${data.ngayBanHanh} 10:00`,
            signer: data.nguoiKy,
            coQuanBanHanh: 'UBND quận Cầu Giấy',
            stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
            ocrStatus: 'Hoàn tất',
            isProcessDoc: true,
            isEditable: true,
            loaiVanBan: 'thong_bao_khong_thu_ly',
            tenVanBan: 'Quyết định không thụ lý giải quyết đơn',
            nguoiNhan: data.nguoiNhan,
            trichYeu: `V/v Không thụ lý giải quyết đơn: ${data.lyDoChinh}`,
            noiDungChiTiet: data.lyDoChiTiet,
            previewExcerpt: fullDocText,
            trangThai: isTrinhKy ? 'da_ban_hanh' : 'du_thao',
            fromXacMinh: true,
            signingStatus: isTrinhKy ? 'da_trinh' : 'nhap',
            canCuPhapLy: data.canCuPhapLy,
            lyDoChinh: data.lyDoChinh,
            lyDoChiTiet: data.lyDoChiTiet,
          };

          // 1. Thêm vào danh sách văn bản dùng chung
          setVanBanXacMinhList((prev) => [
            {
              id: newDocItem.id,
              loai: 'cong_van',
              tenVanBan: 'Quyết định không thụ lý giải quyết đơn',
              soKyHieu: data.soKyHieu,
              ngayLap: data.ngayBanHanh,
              nguoiNhan: data.nguoiNhan,
              trichYeu: newDocItem.trichYeu,
              noiDungChiTiet: fullDocText,
              coQuanBanHanh: 'UBND quận Cầu Giấy',
              trangThai: isTrinhKy ? 'da_ban_hanh' : 'du_thao',
            },
            ...prev,
          ]);

          // 2. Thêm vào signingDocuments để phục vụ trình ký lãnh đạo
          const signingDoc: SigningDocument = {
            id: newDocItem.id,
            soKyHieu: data.soKyHieu,
            hoSoCode: currentDon.code,
            luotNhanId: currentDon.luotNhanId,
            loaiDon: currentDon.loaiDon || 'Đơn khiếu nại, tố cáo',
            nguoiGuiDon: data.nguoiNhan,
            noiDungDon: currentDon.title,
            tenVanBan: 'Quyết định không thụ lý giải quyết đơn',
            loaiVanBan: 'thong_bao_khong_thu_ly',
            loaiVanBanLabel: 'Quyết định không thụ lý',
            trichYeu: newDocItem.trichYeu,
            noiDungChiTiet: fullDocText,
            nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
            ngayTao: `${data.ngayBanHanh} 09:30`,
            status: isTrinhKy ? 'da_trinh' : 'nhap',
            thoiGianTrinh: isTrinhKy ? `${data.ngayBanHanh} 10:00` : undefined,
            nguoiTrinh: isTrinhKy ? (currentAccount?.name || 'Nguyễn Minh Anh') : undefined,
            mucDoUuTien: 'thuong',
            hanXuLy: '24 giờ',
            signers: [
              {
                id: 'ld-01',
                name: data.nguoiKy.replace(/\s*\(.*\)/, '') || 'Đ/c Trần Văn Cường',
                chucVu: 'Phó Chủ tịch UBND quận',
                coQuan: 'UBND quận Cầu Giấy',
                vaiTro: 'duyet',
                thuTu: 1,
                status: isTrinhKy ? 'cho_ky' : 'chua_den_luot',
              },
            ],
            currentSignerIndex: 0,
            lanhDaoId: 'ld-01',
            lanhDaoName: data.nguoiKy.replace(/\s*\(.*\)/, '') || 'Đ/c Trần Văn Cường',
            lanhDaoChucVu: 'Phó Chủ tịch UBND quận',
            tepDinhKem: [
              {
                id: `att-ktl-${Date.now()}`,
                tenTep: `Quyet_dinh_khong_thu_ly_${currentDon.code}.pdf`,
                dungLuong: '420 KB',
                loai: 'du_thao',
              },
            ],
            phienBanHienTai: 'V1',
            versionHistory: [
              {
                version: 'V1',
                thoiGian: `${data.ngayBanHanh} 10:00`,
                nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
                trangThaiLucDo: isTrinhKy ? 'Chờ trình ký' : 'Bản nháp',
                ghiChu: 'Lập quyết định không thụ lý giải quyết đơn',
                noiDungSnapshot: fullDocText,
              },
            ],
            history: [
              {
                id: `hist-${Date.now()}`,
                time: `${data.ngayBanHanh} 10:00`,
                actor: currentAccount?.name || 'Nguyễn Minh Anh',
                action: isTrinhKy ? 'Trình Lãnh đạo phê duyệt' : 'Lưu bản nháp văn bản',
              },
            ],
            auditLogs: [
              {
                id: `al-${Date.now()}`,
                time: `${data.ngayBanHanh} 10:00`,
                actor: currentAccount?.name || 'Nguyễn Minh Anh',
                actorRole: 'Cán bộ thụ lý',
                action: isTrinhKy ? 'Trình văn bản' : 'Tạo mới',
                statusBefore: 'nhap',
                statusAfter: isTrinhKy ? 'da_trinh' : 'nhap',
                version: 'V1',
                note: newDocItem.trichYeu,
              },
            ],
          };

          if (onUpdateSigningDocuments) {
            onUpdateSigningDocuments((prev) => [signingDoc, ...prev]);
          }

          // 3. Cập nhật editing doc tại tab Hồ sơ & Văn bản và hướng xử lý
          setDocCount((c) => c + 1);
          setEditingDocInTab({
            ...newDocItem,
            folder: 'van_ban_quyet_dinh',
          });
          setHuongXuLyDaChon('khong_thu_ly');
          setActiveTab('tai-lieu');

          if (isTrinhKy) {
            const updatedDonData: DonDetail = {
              ...currentDon,
              statusBadge: 'Chờ lãnh đạo ký',
            };
            setCurrentDon(updatedDonData);
            onUpdateDon?.(updatedDonData);
            showToast(`✓ Đã tạo và trình ký Lãnh đạo Quyết định không thụ lý số ${data.soKyHieu}! Đã chuyển sang tab Hồ sơ & Văn bản để theo dõi.`);
          } else {
            showToast(`✓ Đã lưu dự thảo Quyết định không thụ lý số ${data.soKyHieu}! Đã chuyển sang tab Hồ sơ & Văn bản để thực hiện trình ký.`);
          }

          // 4. Ghi lịch sử xử lý
          addHistoryLog({
            title: isTrinhKy
              ? `Trình Lãnh đạo phê duyệt Quyết định không thụ lý số ${data.soKyHieu}`
              : `Lập bản nháp Quyết định không thụ lý số ${data.soKyHieu}`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: isTrinhKy ? 'Chờ lãnh đạo ký' : 'Bản nháp',
              bgClass: isTrinhKy ? 'bg-blue-50' : 'bg-slate-100',
              textClass: isTrinhKy ? 'text-blue-800' : 'text-slate-800',
              borderClass: isTrinhKy ? 'border-blue-200' : 'border-slate-200',
            },
            description: `Lập Quyết định số ${data.soKyHieu} không thụ lý giải quyết đơn. Căn cứ: ${data.canCuPhapLy}. Lý do: ${data.lyDoChinh}.`,
            docInfo: {
              name: 'Quyết định không thụ lý giải quyết đơn',
              code: data.soKyHieu,
              type: 'thong_bao',
            },
          });
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
      />

      {/* Modal Trả lại đơn & Hướng dẫn công dân */}
      <TraLaiDonModal
        isOpen={showTraLaiModal}
        onClose={() => setShowTraLaiModal(false)}
        onSubmit={(data: TraLaiDonSubmitData) => {
          setShowTraLaiModal(false);

          const timeNow =
            new Date().toLocaleDateString('vi-VN') +
            ' ' +
            new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

          const coQuanBanHanh = currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn';
          const nguoiNhan = currentDon.nguoiNop || data.nguoiNhan || 'Người nộp đơn';
          const soKyHieu = data.cauHinhVanBan.soKyHieu;

          // Tạo văn bản hành chính đầy đủ theo Mẫu số 02/TL-Đ (Thông tư 05/2021/TT-TTCP)
          const fullDocText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n${coQuanBanHanh.toUpperCase()}\nBỘ PHẬN TIẾP NHẬN & XỬ LÝ ĐƠN\nSố: ${soKyHieu}\nHà Nội, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}\n\nVĂN BẢN TRẢ LỜI ĐƠN VÀ HƯỚNG DẪN CÔNG DÂN\n(V/v Trả lại hồ sơ đơn ${currentDon.code} của ông/bà ${nguoiNhan})\n\nKính gửi: Ông/Bà ${nguoiNhan}\n- Địa chỉ nhận kết quả: ${data.diaChiNhan || currentDon.diaChi || 'Cầu Giấy, Hà Nội'}\n- Số CCCD/Định danh: ${currentDon.cccd || '001088012345'} - Điện thoại: ${data.sdtLienHe || currentDon.sdt || '0983 123 456'}\n- Hình thức gửi trả kết quả: ${data.hinhThucNhan || 'Nhận trực tiếp tại Bộ phận Tiếp công dân'}\n\nCơ quan nhận được đơn của ông/bà ghi ngày nộp ${currentDon.ngayNhan || '16/09/2026'}.\nNội dung đơn: "${currentDon.title || currentDon.noiDung}".\n\nSau khi kiểm tra hồ sơ, đối chiếu quy định tại ${data.canCuPhapLy}, cơ quan nhận thấy:\n"${data.lyDoChiTiet}"\n\nDo đó, đơn của ông/bà không đủ điều kiện thụ lý giải quyết tại cơ quan chúng tôi. Cơ quan xin thông báo trả lại hồ sơ đơn kèm các giấy tờ tài liệu công dân đã nộp.\n\n${data.cauHinhVanBan.noiDungHuongDan ? `HƯỚNG DẪN CÔNG DÂN:\n${data.cauHinhVanBan.noiDungHuongDan}\n${data.cauHinhVanBan.coQuanHuongDan ? `• Cơ quan có thẩm quyền tiếp nhận giải quyết: ${data.cauHinhVanBan.coQuanHuongDan}.` : ''}\n\n` : ''}Nơi nhận:\n- Như trên (để thực hiện);\n- Lãnh đạo Ban (để báo cáo);\n- Lưu: VT, Hồ sơ TCD (${soKyHieu}).\n\nCÁN BỘ XỬ LÝ ĐƠN\n(Ký số VGCA)\n${currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'}`;

          if (data.actionType === 'trinh_ky') {
            // Đưa vào Luồng Trình ký Lãnh đạo
            const newSigningDoc: SigningDocument = {
              id: `vb-tra-lai-${Date.now()}`,
              soKyHieu: soKyHieu,
              tenVanBan: `Phiếu hướng dẫn trả lại đơn (${soKyHieu})`,
              loaiVanBan: 'van_ban_tra_lai',
              loaiVanBanLabel: 'Phiếu hướng dẫn trả lại đơn',
              hoSoCode: currentDon.code,
              loaiDon: currentDon.loaiDon || 'Đơn tiếp nhận hành chính',
              nguoiGuiDon: nguoiNhan,
              noiDungDon: currentDon.noiDung || currentDon.title || 'Đơn chuyển/trả lại theo thẩm quyền',
              nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
              donViNguoiLap: currentAccount?.phongBan || coQuanBanHanh,
              ngayTao: timeNow.split(' ')[0],
              hanXuLy: data.hanXuLy || '24 giờ',
              mucDoUuTien: 'khan',
              status: 'da_trinh',
              currentSignerIndex: 0,
              lanhDaoId: data.lanhDaoKyId || 'ld-01',
              lanhDaoName: data.lanhDaoKyTen || 'Đ/c Trần Văn Hùng',
              lanhDaoChucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
              trichYeu: `Phiếu hướng dẫn trả lại đơn cho công dân ${nguoiNhan}`,
              noiDungChiTiet: fullDocText,
              yKienCanBo: data.yKienTrinh || 'Kính trình Lãnh đạo xem xét phê duyệt và ký ban hành Phiếu hướng dẫn trả lại đơn.',
              thoiGianTrinh: timeNow,
              phienBanHienTai: 'V1',
              versionHistory: [
                {
                  version: 'V1',
                  thoiGian: timeNow,
                  nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
                  trangThaiLucDo: 'Khởi tạo và trình ký',
                  ghiChu: 'Lập dự thảo Phiếu hướng dẫn trả lại đơn',
                  noiDungSnapshot: fullDocText,
                },
              ],
              tepDinhKem: [],
              signers: [
                {
                  id: data.lanhDaoKyId || 'ld-01',
                  name: data.lanhDaoKyTen || 'Đ/c Trần Văn Hùng',
                  chucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
                  vaiTro: 'ky',
                  thuTu: 1,
                  status: 'cho_ky',
                },
              ],
              auditLogs: [
                {
                  id: `al-${Date.now()}-1`,
                  time: timeNow,
                  actor: currentAccount?.name || 'Nguyễn Minh Anh',
                  actorRole: 'Cán bộ thụ lý',
                  action: `Lập văn bản trả lại đơn và trình ký đến ${data.lanhDaoKyTen || 'Lãnh đạo'}`,
                  statusBefore: 'nhap',
                  statusAfter: 'da_trinh',
                  version: 'V1',
                  note: data.yKienTrinh || 'Trình duyệt văn bản trả lại đơn theo quy định',
                },
              ],
              history: [
                {
                  id: `h-${Date.now()}`,
                  time: timeNow,
                  actor: `${currentAccount?.name || 'Nguyễn Minh Anh'} (Cán bộ thụ lý)`,
                  action: 'Trình văn bản trả lại đơn',
                  note: `Chuyển trình Lãnh đạo ${data.lanhDaoKyTen || 'phê duyệt'}`,
                },
              ],
            };

            if (onUpdateSigningDocuments) {
              onUpdateSigningDocuments((prev) => [newSigningDoc, ...prev]);
            } else if (onCreateSigningDocument) {
              onCreateSigningDocument(newSigningDoc);
            }

            setEditingDocInTab({
              id: newSigningDoc.id,
              name: `Phieu_huong_dan_tra_lai_don_${soKyHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              category: 'Văn bản trả lại đơn',
              folder: 'van_ban_quyet_dinh',
              soHieu: soKyHieu,
              size: '350 KB',
              pages: 1,
              uploadDate: timeNow,
              signer: currentAccount?.name || 'Nguyễn Minh Anh',
              coQuanBanHanh: coQuanBanHanh,
              stepBelongsTo: 'Bước 3: Hướng xử lý đơn',
              ocrStatus: 'Hoàn tất',
              isProcessDoc: true,
              isEditable: true,
              loaiVanBan: 'van_ban_tra_lai',
              tenVanBan: 'Văn bản trả lại đơn và hướng dẫn công dân',
              nguoiNhan: nguoiNhan,
              trichYeu: `V/v Trả lại hồ sơ đơn: ${data.lyDoChinh}`,
              noiDungChiTiet: fullDocText,
              previewExcerpt: fullDocText,
              trangThai: 'du_thao',
              signingStatus: 'da_trinh',
              canCuPhapLy: data.canCuPhapLy,
              lyDoChinh: data.lyDoChinh,
              lyDoChiTiet: data.lyDoChiTiet,
            } as any);

            setCurrentDon((prev) => ({
              ...prev,
              statusBadge: 'Chờ lãnh đạo ký',
            }));

            setHuongXuLyDaChon('tra_lai');
            setDocCount((c) => c + 1);
            setActiveTab('tai-lieu');
            showToast(`✓ Đã chuyển văn bản trả lại đơn (${soKyHieu}) sang luồng Trình ký! Đã chuyển sang tab Hồ sơ & Văn bản để theo dõi.`);

            addHistoryLog({
              title: `Trình ký văn bản trả lại đơn (${soKyHieu})`,
              actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
              actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
              actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
              category: 'van_ban',
              statusBadge: {
                text: 'Chờ duyệt ký',
                bgClass: 'bg-blue-50',
                textClass: 'text-blue-800',
                borderClass: 'border-blue-200',
              },
              description: `Cán bộ đã chuyển Phiếu hướng dẫn trả đơn số ${soKyHieu} đến ${data.lanhDaoKyTen || 'Lãnh đạo'} để duyệt ký. Sau khi Lãnh đạo phê duyệt và ký số mới kết thúc quy trình trả đơn.`,
              docInfo: {
                name: 'Phiếu hướng dẫn chuyển/trả đơn',
                code: soKyHieu,
                type: 'phieu_huong_dan',
              },
            });
          } else {
            // Lưu văn bản / bản nháp vào Hồ sơ
            const draftSigningDoc: SigningDocument = {
              id: `vb-tra-lai-${Date.now()}`,
              soKyHieu: soKyHieu,
              tenVanBan: `Phiếu hướng dẫn trả lại đơn (${soKyHieu})`,
              loaiVanBan: 'van_ban_tra_lai',
              loaiVanBanLabel: 'Phiếu hướng dẫn trả lại đơn',
              hoSoCode: currentDon.code,
              loaiDon: currentDon.loaiDon || 'Đơn tiếp nhận hành chính',
              nguoiGuiDon: nguoiNhan,
              noiDungDon: currentDon.noiDung || currentDon.title || 'Đơn chuyển/trả lại theo thẩm quyền',
              nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
              donViNguoiLap: currentAccount?.phongBan || coQuanBanHanh,
              ngayTao: timeNow.split(' ')[0],
              hanXuLy: data.hanXuLy || '24 giờ',
              mucDoUuTien: 'thuong',
              status: 'nhap',
              currentSignerIndex: 0,
              lanhDaoId: data.lanhDaoKyId || 'ld-01',
              lanhDaoName: data.lanhDaoKyTen || 'Đ/c Trần Văn Hùng',
              lanhDaoChucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
              trichYeu: `Phiếu hướng dẫn trả lại đơn cho công dân ${nguoiNhan}`,
              noiDungChiTiet: fullDocText,
              yKienCanBo: data.yKienTrinh || 'Dự thảo Phiếu hướng dẫn trả lại đơn.',
              phienBanHienTai: 'V1',
              versionHistory: [
                {
                  version: 'V1',
                  thoiGian: timeNow,
                  nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
                  trangThaiLucDo: 'Bản nháp',
                  ghiChu: 'Lập dự thảo Phiếu hướng dẫn trả lại đơn',
                  noiDungSnapshot: fullDocText,
                },
              ],
              tepDinhKem: [],
              signers: [
                {
                  id: data.lanhDaoKyId || 'ld-01',
                  name: data.lanhDaoKyTen || 'Đ/c Trần Văn Hùng',
                  chucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
                  vaiTro: 'ky',
                  thuTu: 1,
                  status: 'chua_den_luot',
                },
              ],
              auditLogs: [
                {
                  id: `al-${Date.now()}-1`,
                  time: timeNow,
                  actor: currentAccount?.name || 'Nguyễn Minh Anh',
                  actorRole: 'Cán bộ thụ lý',
                  action: 'Lập văn bản trả lại đơn',
                  statusBefore: 'nhap',
                  statusAfter: 'nhap',
                  version: 'V1',
                  note: 'Lưu văn bản trả lại đơn',
                },
              ],
              history: [
                {
                  id: `h-${Date.now()}`,
                  time: timeNow,
                  actor: `${currentAccount?.name || 'Nguyễn Minh Anh'} (Cán bộ thụ lý)`,
                  action: 'Lưu văn bản trả lại đơn',
                  note: 'Lưu văn bản trả lại đơn trong hồ sơ',
                },
              ],
            };

            if (onUpdateSigningDocuments) {
              onUpdateSigningDocuments((prev) => [draftSigningDoc, ...prev]);
            } else if (onCreateSigningDocument) {
              onCreateSigningDocument(draftSigningDoc);
            }

            setEditingDocInTab({
              id: draftSigningDoc.id,
              name: `Phieu_huong_dan_tra_lai_don_${soKyHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              category: 'Văn bản trả lại đơn',
              folder: 'van_ban_quyet_dinh',
              soHieu: soKyHieu,
              size: '350 KB',
              pages: 1,
              uploadDate: timeNow,
              signer: currentAccount?.name || 'Nguyễn Minh Anh',
              coQuanBanHanh: coQuanBanHanh,
              stepBelongsTo: 'Bước 3: Hướng xử lý đơn',
              ocrStatus: 'Hoàn tất',
              isProcessDoc: true,
              isEditable: true,
              loaiVanBan: 'van_ban_tra_lai',
              tenVanBan: 'Văn bản trả lại đơn và hướng dẫn công dân',
              nguoiNhan: nguoiNhan,
              trichYeu: `V/v Trả lại hồ sơ đơn: ${data.lyDoChinh}`,
              noiDungChiTiet: fullDocText,
              previewExcerpt: fullDocText,
              trangThai: 'du_thao',
              signingStatus: 'nhap',
              canCuPhapLy: data.canCuPhapLy,
              lyDoChinh: data.lyDoChinh,
              lyDoChiTiet: data.lyDoChiTiet,
            } as any);

            setHuongXuLyDaChon('tra_lai');
            setDocCount((c) => c + 1);
            setActiveTab('tai-lieu');
            showToast(`✓ Đã lưu văn bản trả lại đơn (${soKyHieu})! Đã chuyển sang tab Hồ sơ & Văn bản để thực hiện trình ký.`);

            addHistoryLog({
              title: `Lưu văn bản trả lại đơn (${soKyHieu})`,
              actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
              actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
              actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
              category: 'van_ban',
              statusBadge: {
                text: 'Bản nháp',
                bgClass: 'bg-slate-100',
                textClass: 'text-slate-800',
                borderClass: 'border-slate-300',
              },
              description: `Lưu văn bản trả lại đơn số ${soKyHieu} trong hồ sơ đơn.`,
              docInfo: {
                name: 'Phiếu hướng dẫn chuyển/trả đơn',
                code: soKyHieu,
                type: 'phieu_huong_dan',
              },
            });
          }
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
      />

      {/* Modal Chuyển thẩm quyền / Bàn giao */}
      <BanGiaoDonModal
        isOpen={showBanGiaoModal}
        onClose={() => setShowBanGiaoModal(false)}
        onSubmit={(data: BanGiaoDonSubmitData) => {
          setShowBanGiaoModal(false);
          const timeNow =
            new Date().toLocaleDateString('vi-VN') +
            ' ' +
            new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const soKyHieu = data.cauHinhVanBan.soKyHieu;
          const coQuanBanHanh = currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn';
          const donViNhan = data.donViNhanName || 'đơn vị có thẩm quyền';

          const fullDocText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n${coQuanBanHanh.toUpperCase()}\nSố: ${soKyHieu}\nHà Nội, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}\n\nPHIẾU CHUYỂN ĐƠN\n(V/v Chuyển đơn ${currentDon.code} đến ${donViNhan})\n\nKính gửi: ${donViNhan}\n\nCơ quan tiếp nhận đơn của công dân ${currentDon.nguoiNop || 'Công dân nộp đơn'}.\nNội dung đơn: "${currentDon.title || currentDon.noiDung}".\n\nCăn cứ quy định tại: ${data.canCuPhapLy}.\nLý do chuyển đơn: ${data.lyDoBanGiao}.\n\nCơ quan xin chuyển toàn bộ hồ sơ, tài liệu kèm theo đến ${donViNhan} để xem xét, thụ lý giải quyết theo đúng thẩm quyền và thông báo kết quả cho công dân theo quy định của pháp luật.\nThời hạn tiếp nhận và xử lý: ${data.thoiHanTiepNhan}.\n\nNơi nhận:\n- Như trên (để giải quyết);\n- Người nộp đơn (để biết);\n- Lãnh đạo Ban (để báo cáo);\n- Lưu: VT, Hồ sơ ${soKyHieu}.\n\nCÁN BỘ XỬ LÝ ĐƠN\n(Ký số VGCA)\n${currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'}`;

          const newDocItem: any = {
            id: `DOC-BG-${Date.now()}`,
            name: `Phieu_chuyen_don_${soKyHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            category: 'Phiếu chuyển đơn',
            folder: 'van_ban_quyet_dinh',
            soHieu: soKyHieu,
            size: '360 KB',
            pages: 1,
            uploadDate: timeNow,
            signer: currentAccount?.name || 'Nguyễn Minh Anh',
            coQuanBanHanh: coQuanBanHanh,
            stepBelongsTo: 'Bước 3: Hướng xử lý đơn',
            ocrStatus: 'Hoàn tất',
            isProcessDoc: true,
            isEditable: true,
            loaiVanBan: 'chuyen_don',
            tenVanBan: `Phiếu chuyển đơn (${soKyHieu})`,
            nguoiNhan: donViNhan,
            trichYeu: `Phiếu chuyển đơn số ${soKyHieu} sang ${donViNhan}`,
            noiDungChiTiet: fullDocText,
            previewExcerpt: fullDocText,
            trangThai: 'du_thao',
            signingStatus: 'nhap',
          };

          const signingDoc: SigningDocument = {
            id: newDocItem.id,
            soKyHieu: soKyHieu,
            tenVanBan: `Phiếu chuyển đơn (${soKyHieu})`,
            loaiVanBan: 'chuyen_don',
            loaiVanBanLabel: 'Phiếu chuyển đơn',
            hoSoCode: currentDon.code,
            loaiDon: currentDon.loaiDon || 'Đơn tiếp nhận hành chính',
            nguoiGuiDon: currentDon.nguoiNop || 'Công dân nộp đơn',
            noiDungDon: currentDon.noiDung || currentDon.title || 'Đơn chuyển thẩm quyền giải quyết',
            nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            donViNguoiLap: currentAccount?.phongBan || coQuanBanHanh,
            ngayTao: timeNow.split(' ')[0],
            hanXuLy: data.thoiHanTiepNhan || '24 giờ',
            mucDoUuTien: 'thuong',
            status: 'nhap',
            currentSignerIndex: 0,
            lanhDaoId: 'ld-01',
            lanhDaoName: 'Đ/c Trần Văn Hùng',
            lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
            trichYeu: `Phiếu chuyển đơn sang ${donViNhan}`,
            noiDungChiTiet: fullDocText,
            yKienCanBo: data.ghiChuBanGiao || 'Kính trình Lãnh đạo duyệt ký Phiếu chuyển đơn.',
            phienBanHienTai: 'V1',
            versionHistory: [
              {
                version: 'V1',
                thoiGian: timeNow,
                nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
                trangThaiLucDo: 'Bản nháp',
                ghiChu: 'Lập dự thảo Phiếu chuyển đơn',
                noiDungSnapshot: fullDocText,
              },
            ],
            tepDinhKem: [],
            signers: [
              {
                id: 'ld-01',
                name: 'Đ/c Trần Văn Hùng',
                chucVu: 'Phó Chánh Thanh tra thành phố',
                vaiTro: 'ky',
                thuTu: 1,
                status: 'chua_den_luot',
              },
            ],
            auditLogs: [
              {
                id: `al-${Date.now()}-1`,
                time: timeNow,
                actor: currentAccount?.name || 'Nguyễn Minh Anh',
                actorRole: 'Cán bộ thụ lý',
                action: 'Lập Phiếu chuyển đơn',
                statusBefore: 'nhap',
                statusAfter: 'nhap',
                version: 'V1',
                note: 'Lưu dự thảo Phiếu chuyển đơn',
              },
            ],
            history: [
              {
                id: `h-${Date.now()}`,
                time: timeNow,
                actor: `${currentAccount?.name || 'Nguyễn Minh Anh'} (Cán bộ thụ lý)`,
                action: 'Lập dự thảo Phiếu chuyển đơn',
                note: `Chuyển đơn vị ${donViNhan}`,
              },
            ],
          };

          if (onUpdateSigningDocuments) {
            onUpdateSigningDocuments((prev) => [signingDoc, ...prev]);
          } else if (onCreateSigningDocument) {
            onCreateSigningDocument(signingDoc);
          }

          setDocCount((c) => c + 1);
          setEditingDocInTab(newDocItem);
          setHuongXuLyDaChon('ban_giao');
          setActiveTab('tai-lieu');
          showToast(`✓ Đã lưu văn bản chuyển thẩm quyền (${soKyHieu})! Đã chuyển sang tab Hồ sơ & Văn bản để thực hiện trình ký.`);

          addHistoryLog({
            title: `Lập văn bản chuyển thẩm quyền xử lý (${soKyHieu})`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: 'Bản nháp',
              bgClass: 'bg-purple-50',
              textClass: 'text-purple-800',
              borderClass: 'border-purple-200',
            },
            description: `Lập văn bản chuyển đơn số ${soKyHieu} chuyển hồ sơ sang "${donViNhan}" giải quyết. Văn bản hiển thị tại tab Hồ sơ & Văn bản để trình ký.`,
            docInfo: {
              name: 'Phiếu chuyển đơn xử lý',
              code: soKyHieu,
              type: 'phieu_chuyen',
            },
          });
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
        }}
      />

      {/* Modal Trả lời đơn */}
      <TraLoiDonModal
        isOpen={showTraLoiDonModal}
        onClose={() => setShowTraLoiDonModal(false)}
        onSubmit={(data: TraLoiDonSubmitData) => {
          setShowTraLoiDonModal(false);
          const timeNow =
            new Date().toLocaleDateString('vi-VN') +
            ' ' +
            new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const soKyHieu = data.soKyHieu;
          const coQuanBanHanh = currentDon.donViXuLy || 'Ủy ban nhân dân quận';
          const nguoiNhan = data.nguoiNhan || currentDon.nguoiNop || 'Công dân nộp đơn';

          const fullDocText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n${coQuanBanHanh.toUpperCase()}\nSố: ${soKyHieu}\nHà Nội, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}\n\nVĂN BẢN TRẢ LỜI ĐƠN\n(V/v ${data.trichYeu || 'Trả lời, giải thích nội dung đơn'})\n\nKính gửi: Ông/Bà ${nguoiNhan}\n(Địa chỉ: ${currentDon.diaChi || 'Cầu Giấy, Hà Nội'})\n\nCơ quan nhận được đơn của ông/bà ghi ngày nộp ${currentDon.ngayNhan || '16/09/2026'}.\nNội dung đơn: "${currentDon.title || currentDon.noiDung}".\n\nCăn cứ quy định pháp luật: ${data.canCuPhapLy}.\nSau khi xem xét nội dung đơn và kiểm tra các tài liệu liên quan, cơ quan thông báo và trả lời như sau:\n\n${data.noiDungChiTiet}\n\nKính thông báo để Ông/Bà được biết và phối hợp thực hiện theo đúng quy định của pháp luật./.\n\nNơi nhận:\n- Như trên;\n- Lãnh đạo cơ quan (để báo cáo);\n- Lưu: VT, Hồ sơ đơn (${soKyHieu}).\n\nTM. ỦY BAN NHÂN DÂN\n(Ký số VGCA)\n${data.nguoiKy || currentAccount?.name || 'Nguyễn Minh Anh'}`;

          const newDocItem: any = {
            id: `DOC-TLD-${Date.now()}`,
            name: `Van_ban_tra_loi_don_${soKyHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            category: 'Văn bản trả lời đơn',
            folder: 'van_ban_quyet_dinh',
            soHieu: soKyHieu,
            size: '340 KB',
            pages: 1,
            uploadDate: timeNow,
            signer: data.nguoiKy || currentAccount?.name || 'Nguyễn Minh Anh',
            coQuanBanHanh: coQuanBanHanh,
            stepBelongsTo: 'Bước 3: Hướng xử lý đơn',
            ocrStatus: 'Hoàn tất',
            isProcessDoc: true,
            isEditable: true,
            loaiVanBan: 'tra_loi_don',
            tenVanBan: `Văn bản trả lời đơn (${soKyHieu})`,
            nguoiNhan: nguoiNhan,
            trichYeu: data.trichYeu || `Trả lời đơn của công dân ${nguoiNhan}`,
            noiDungChiTiet: fullDocText,
            previewExcerpt: fullDocText,
            trangThai: 'du_thao',
            signingStatus: 'nhap',
          };

          const signingDoc: SigningDocument = {
            id: newDocItem.id,
            soKyHieu: soKyHieu,
            tenVanBan: `Văn bản trả lời đơn (${soKyHieu})`,
            loaiVanBan: 'tra_loi_don',
            loaiVanBanLabel: 'Văn bản trả lời đơn',
            hoSoCode: currentDon.code,
            loaiDon: currentDon.loaiDon || 'Đơn tiếp nhận hành chính',
            nguoiGuiDon: nguoiNhan,
            noiDungDon: currentDon.noiDung || currentDon.title || 'Đơn yêu cầu giải thích, trả lời',
            nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            donViNguoiLap: currentAccount?.phongBan || coQuanBanHanh,
            ngayTao: timeNow.split(' ')[0],
            hanXuLy: '24 giờ',
            mucDoUuTien: 'thuong',
            status: 'nhap',
            currentSignerIndex: 0,
            lanhDaoId: 'ld-01',
            lanhDaoName: 'Đ/c Trần Văn Hùng',
            lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
            trichYeu: data.trichYeu || `Văn bản trả lời đơn cho công dân ${nguoiNhan}`,
            noiDungChiTiet: fullDocText,
            yKienCanBo: 'Kính trình Lãnh đạo xem xét và ký duyệt văn bản trả lời đơn.',
            phienBanHienTai: 'V1',
            versionHistory: [
              {
                version: 'V1',
                thoiGian: timeNow,
                nguoiTao: currentAccount?.name || 'Nguyễn Minh Anh',
                trangThaiLucDo: 'Bản nháp',
                ghiChu: 'Lập dự thảo Văn bản trả lời đơn',
                noiDungSnapshot: fullDocText,
              },
            ],
            tepDinhKem: [],
            signers: [
              {
                id: 'ld-01',
                name: 'Đ/c Trần Văn Hùng',
                chucVu: 'Phó Chánh Thanh tra thành phố',
                vaiTro: 'ky',
                thuTu: 1,
                status: 'chua_den_luot',
              },
            ],
            auditLogs: [
              {
                id: `al-${Date.now()}-1`,
                time: timeNow,
                actor: currentAccount?.name || 'Nguyễn Minh Anh',
                actorRole: 'Cán bộ thụ lý',
                action: 'Lập Văn bản trả lời đơn',
                statusBefore: 'nhap',
                statusAfter: 'nhap',
                version: 'V1',
                note: 'Lưu dự thảo Văn bản trả lời đơn',
              },
            ],
            history: [
              {
                id: `h-${Date.now()}`,
                time: timeNow,
                actor: `${currentAccount?.name || 'Nguyễn Minh Anh'} (Cán bộ thụ lý)`,
                action: 'Lập dự thảo Văn bản trả lời đơn',
                note: `Trả lời công dân ${nguoiNhan}`,
              },
            ],
          };

          if (onUpdateSigningDocuments) {
            onUpdateSigningDocuments((prev) => [signingDoc, ...prev]);
          } else if (onCreateSigningDocument) {
            onCreateSigningDocument(signingDoc);
          }

          setDocCount((c) => c + 1);
          setEditingDocInTab(newDocItem);
          setHuongXuLyDaChon('tra_loi_don');
          setActiveTab('tai-lieu');
          showToast(`✓ Đã lưu văn bản trả lời đơn (${soKyHieu})! Đã chuyển sang tab Hồ sơ & Văn bản để thực hiện trình ký.`);

          addHistoryLog({
            title: `Ban hành văn bản trả lời đơn (${soKyHieu})`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: 'Bản nháp',
              bgClass: 'bg-teal-50',
              textClass: 'text-teal-800',
              borderClass: 'border-teal-200',
            },
            description: `Lập văn bản trả lời, giải thích số ${soKyHieu} gửi cho công dân ${nguoiNhan}. Văn bản hiển thị tại tab Hồ sơ & Văn bản để trình ký.`,
            docInfo: {
              name: 'Văn bản trả lời đơn thư',
              code: soKyHieu,
              type: 'tra_loi',
            },
          });
        }}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
          noiDung: currentDon.title,
        }}
      />



      {/* Modal Tạo Báo cáo đề xuất hướng xử lý */}
      <TaoBaoCaoDeXuatModal
        isOpen={showTaoBaoCaoDeXuatModal}
        onClose={() => setShowTaoBaoCaoDeXuatModal(false)}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop,
          loaiDon: currentDon.loaiDon,
          ngayNhan: currentDon.ngayNhan,
          noiDung: currentDon.title,
        }}
        currentOfficer={{
          name: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
          chucVu: currentAccount?.role || currentDon.chucVuCanBo || 'Cán bộ thụ lý',
          phongBan: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
          coQuan: 'UBND quận',
        }}
        initialHuongXuLy={huongXuLyDaChon}
        existingSigningDoc={existingSigningDoc}
        onSaveDraft={handleSaveDraftBaoCaoModal}
        onSubmitToLeader={handleSubmitToLeaderBaoCaoModal}
      />

      {/* Modal Ghép đơn */}
      <GhepDonModal
        isOpen={showGhepDonModal}
        onClose={() => setShowGhepDonModal(false)}
        donInfo={{
          code: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          nguoiNop: currentDon.nguoiNop || 'Công dân nộp đơn',
          loaiDon: currentDon.loaiDon || 'Đơn khiếu nại / tố cáo',
          noiDung: currentDon.title || '',
          ngayNhan: currentDon.ngayNhan,
        }}
        onSubmit={(data: GhepDonSubmitData) => {
          setShowGhepDonModal(false);
          showToast(`✓ Đã ghép thành công đơn ${currentDon.code} vào hồ sơ vụ việc ${data.targetDonCode}!`);
          addHistoryLog({
            title: `Ghép hồ sơ đơn vào vụ việc ${data.targetDonCode}`,
            actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'tiep_nhan',
            statusBadge: {
              text: 'Ghép đơn',
              bgClass: 'bg-indigo-50',
              textClass: 'text-indigo-800',
              borderClass: 'border-indigo-200',
            },
            description: `Thực hiện ghép đơn ${currentDon.code} vào hồ sơ ${data.targetDonCode} (${data.targetDonTitle}). Quyết định ghép: ${data.soQuyetDinhGhep}. Căn cứ: ${data.canCuGhep.join('; ')}. Ghi chú: ${data.ghiChuGhep}`,
          });
          setActiveTab('don-khac');
        }}
      />

      {/* Modal Tải tài liệu */}
      <TaiTaiLieuModal
        isOpen={showTaiTaiLieuModal}
        onClose={() => setShowTaiTaiLieuModal(false)}
        donInfo={{
          code: currentDon.code,
          nguoiNop: currentDon.nguoiNop || 'Công dân nộp đơn',
          loaiDon: currentDon.loaiDon || 'Đơn khiếu nại / tố cáo',
        }}
        onSubmit={(data: TaiTaiLieuSubmitData) => {
          setShowTaiTaiLieuModal(false);
          setDocCount((prev) => prev + 1);

          const newDocItem: VanBanXacMinhItem = {
            id: `DOC-UP-${Date.now()}`,
            loai: (data.loaiTaiLieu === 'bien_ban' ? 'bien_ban' : 'khac') as any,
            tenVanBan: data.tenTaiLieu,
            soKyHieu: data.soKyHieu || `TL-${Date.now().toString().slice(-4)}`,
            ngayLap: data.ngayBanHanh || new Date().toLocaleDateString('vi-VN'),
            nguoiNhan: data.nguoiCungCap,
            trichYeu: data.trichYeu,
            noiDungChiTiet: `Tài liệu đính kèm: ${data.fileName} (${data.fileSize}). Nguồn cung cấp: ${data.nguoiCungCap}.\nTrích yếu: ${data.trichYeu}`,
            trangThai: 'da_dinh_kem',
          };
          setVanBanXacMinhList((prev) => [newDocItem, ...prev]);

          showToast(`✓ Đã đính kèm tài liệu "${data.tenTaiLieu}" (${data.fileName}) vào hồ sơ thành công!`);
          addHistoryLog({
            title: `Đính kèm tài liệu: ${data.tenTaiLieu}`,
            actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: 'Tài liệu mới',
              bgClass: 'bg-emerald-50',
              textClass: 'text-emerald-800',
              borderClass: 'border-emerald-200',
            },
            description: `Tải lên và đính kèm tệp ${data.fileName} (${data.fileSize}) phân loại "${data.category}". Nguồn: ${data.nguoiCungCap}.`,
            docInfo: {
              name: data.tenTaiLieu,
              code: data.soKyHieu || `TL-${Date.now().toString().slice(-4)}`,
              type: data.loaiTaiLieu,
            },
          });
          setActiveTab('tai-lieu');
        }}
      />

      {/* Modal Phân công xử lý */}
      <PhanCongModal
        isOpen={showPhanCongModal}
        onClose={() => setShowPhanCongModal(false)}
        onSubmit={(data: PhanCongSubmitData) => {
          setShowPhanCongModal(false);
          setCurrentDon((prev) => ({
            ...prev,
            canBoXuLy: data.canBo.name,
            canBoTiepNhan: data.canBo.name,
            chucVuCanBo: data.canBo.role,
            donViXuLy: data.canBo.departmentName,
          }));
          showToast(`✓ Đã phân công thụ lý/xử lý đơn cho cán bộ ${data.canBo.name} (${data.canBo.role})`);
          addHistoryLog({
            title: 'Phân công cán bộ xử lý đơn',
            actor: currentAccount?.name || 'Trần Trọng Giáp',
            actorRole: 'Lãnh đạo đơn vị',
            actorDept: data.canBo.departmentName,
            category: 'tiep_nhan',
            statusBadge: {
              text: 'Phân công',
              bgClass: 'bg-indigo-50',
              textClass: 'text-indigo-800',
              borderClass: 'border-indigo-200',
            },
            description: `Phân công hồ sơ cho cán bộ ${data.canBo.name} (${data.canBo.role}) tiếp tục xử lý. Ghi chú: ${data.ghiChu || 'Theo dõi và xử lý đúng hạn quy định.'}`,
          });
        }}
        itemsToAssign={[
          {
            id: currentDon.id || currentDon.code,
            code: currentDon.code,
            luotNhanId: currentDon.luotNhanId || '',
            nguoiNop: currentDon.nguoiNop || '',
            loaiDon: currentDon.loaiDon || 'Đơn khiếu nại / tố cáo',
            ngayNhan: currentDon.ngayNhan || '',
            ngayChuyenDen: currentDon.ngayNhan || '',
            donViHienTai: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            donViTiepNhanId: 'tiep-dan',
            donViTiepNhan: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            hanXuLy: '15 ngày',
            hanXuLyFull: '15 ngày kể từ ngày nhận',
            trangThai: 'dang_xu_ly',
            noiDungTomTat: currentDon.title || '',
            canBoXuLy: currentDon.canBoXuLy || currentDon.canBoTiepNhan,
            chucVuCanBo: currentDon.chucVuCanBo,
          },
        ]}
        currentDepartmentId="tiep-dan"
        departmentName={currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn'}
      />

      {/* ========================================================================= */}
      {/* 1. MODAL TẠO VỤ VIỆC TỪ ĐƠN ĐÃ THỤ LÝ (NHÁNH 1 - THỤ LÝ)                  */}
      {/* ========================================================================= */}
      {showTaoVuViecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-linear-to-r from-purple-50 via-white to-purple-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">folder_special</span>
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-slate-900 font-headline-md flex items-center gap-2">
                    <span>Thụ lý đơn &amp; Lập hồ sơ VỤ VIỆC</span>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Đã ký duyệt
                    </span>
                  </h3>
                  <p className="text-xs text-purple-700 font-medium mt-0.5">
                    Căn cứ Quyết định thụ lý số {quyetDinhSigningDoc?.soKyHieu || 'đã ký'} đã được Lãnh đạo phê duyệt
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTaoVuViecModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleXacNhanTaoVuViec({
                  code: (formData.get('vuViecCode') as string) || (currentDon.code.startsWith('Đ-') ? currentDon.code.replace('Đ-', 'VV-') : `VV-${currentDon.code}`),
                  title: (formData.get('vuViecTitle') as string) || currentDon.title || '',
                  nguoiNop: currentDon.nguoiNop || '',
                  canBoThuLy: (formData.get('canBoThuLy') as string) || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
                  donViThuLy: (formData.get('donViThuLy') as string) || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
                  ghiChu: (formData.get('ghiChu') as string) || '',
                });
              }}
              className="p-6 space-y-4"
            >
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-purple-700 shrink-0 mt-0.5">info</span>
                <p>
                  Hệ thống tự động liên kết hồ sơ Đơn gốc <strong className="font-semibold">{currentDon.code}</strong> với Vụ việc mới. Tất cả tài liệu, văn bản xác minh và nhật ký xử lý sẽ được kế thừa sang hồ sơ Vụ việc.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã Vụ việc <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    name="vuViecCode"
                    defaultValue={currentDon.code.startsWith('Đ-') ? currentDon.code.replace('Đ-', 'VV-') : (currentDon.code.startsWith('VV-') ? currentDon.code : `VV-${currentDon.code}`)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Người nộp đơn liên quan:
                  </label>
                  <input
                    type="text"
                    value={currentDon.nguoiNop || 'Công dân nộp đơn'}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề hồ sơ Vụ việc <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  name="vuViecTitle"
                  defaultValue={currentDon.title || currentDon.noiDung || ''}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cán bộ thụ lý vụ việc:
                  </label>
                  <input
                    type="text"
                    name="canBoThuLy"
                    defaultValue={currentDon.canBoXuLy || 'Nguyễn Minh Anh'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn vị phụ trách giải quyết:
                  </label>
                  <input
                    type="text"
                    name="donViThuLy"
                    defaultValue={currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>Quyết định thụ lý đính kèm:</span>
                </div>
                <div className="text-slate-600">
                  • Số văn bản: <strong className="text-slate-800">{quyetDinhSigningDoc?.soKyHieu || '01/QĐ-UBND'}</strong> ({quyetDinhSigningDoc?.tenVanBan || 'Quyết định thụ lý giải quyết'})
                </div>
                <div className="text-slate-600">
                  • Người ký: <strong className="text-slate-800">{quyetDinhSigningDoc?.chuKy?.nguoiKy || 'Trần Văn Cường (Phó Chủ tịch UBND)'}</strong> - Ngày ký: {quyetDinhSigningDoc?.thoiGianKy || new Date().toLocaleDateString('vi-VN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kế hoạch / Ghi chú bước xác minh vụ việc:
                </label>
                <textarea
                  name="ghiChu"
                  rows={2}
                  defaultValue="Thực hiện xác minh theo đúng kế hoạch ban hành kèm Quyết định thụ lý. Thời hạn 30 ngày làm việc."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTaoVuViecModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">gavel</span>
                  <span>Xác nhận thụ lý &amp; Tạo vụ việc</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL IN THÔNG BÁO THEO QUYẾT ĐỊNH ĐÃ KÝ (NHÁNH 2 - KHÔNG THỤ LÝ / TRẢ) */}
      {/* ========================================================================= */}
      {showInThongBaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-scale-up">
            {/* Header thanh điều khiển in */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[20px]">print</span>
                <span className="font-bold text-sm">
                  {quyetDinhBranch === 'khong_thu_ly'
                    ? 'Bản xem trước Quyết định không thụ lý giải quyết đơn'
                    : 'Bản xem trước Phiếu hướng dẫn & Thông báo trả lại đơn'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('Đang mở hộp thoại in văn bản...');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>{quyetDinhBranch === 'khong_thu_ly' ? 'In quyết định' : 'In thông báo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInThongBaoModal(false)}
                  className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Trang xem trước khổ A4 chuẩn hành chính */}
            <div className="p-8 bg-slate-100 flex justify-center">
              <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md border border-slate-300 text-slate-900 font-serif leading-relaxed text-[13.5px]">
                {/* Quốc hiệu - Tiêu ngữ */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                  <div className="text-center font-sans">
                    <p className="font-bold text-xs uppercase text-slate-800">ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY</p>
                    <p className="font-semibold text-xs uppercase text-slate-700 underline">PHÒNG TIẾP DÂN &amp; XỬ LÝ ĐƠN</p>
                    <p className="text-[11px] text-slate-600 mt-2">
                      Số: <span className="font-mono font-semibold">{quyetDinhSigningDoc?.soKyHieu || (quyetDinhBranch === 'tra_lai' ? '05/PHD-UBND' : '18/QĐ-KTL/UBND')}</span>
                    </p>
                  </div>
                  <div className="text-center font-sans">
                    <p className="font-bold text-xs uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs text-slate-900 underline">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic text-slate-600 mt-2">
                      Cầu Giấy, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Tiêu đề văn bản */}
                <div className="text-center my-6">
                  <h2 className="font-sans font-bold text-[16px] uppercase text-slate-900 tracking-wide">
                    {quyetDinhBranch === 'tra_lai'
                      ? 'PHIẾU HƯỚNG DẪN VÀ THÔNG BÁO TRẢ LẠI ĐƠN'
                      : 'QUYẾT ĐỊNH VỀ VIỆC KHÔNG THỤ LÝ GIẢI QUYẾT ĐƠN'}
                  </h2>
                  <p className="text-xs italic text-slate-600 mt-1">
                    (V/v: Giải quyết đơn số {currentDon.code} của công dân {currentDon.nguoiNop})
                  </p>
                </div>

                {/* Kính gửi */}
                <div className="space-y-3">
                  <p>
                    <strong>Kính gửi:</strong> Ông/Bà <strong className="uppercase">{currentDon.nguoiNop || 'Vũ Thị Thanh'}</strong>
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {currentDon.diaChi || 'Quận Cầu Giấy, Thành phố Hà Nội'}
                  </p>
                  <p>
                    <strong>Số CCCD/CMND:</strong> {currentDon.cccd || '001088012345'} — SĐT: {currentDon.sdt || '0983 123 456'}
                  </p>

                  <p className="text-justify indent-6 mt-3">
                    Ngày {currentDon.ngayNhan || '16/09/2026'}, UBND quận Cầu Giấy nhận được đơn của Quý công dân với nội dung: <em className="text-slate-800">{currentDon.title || currentDon.noiDung}</em>.
                  </p>

                  <p className="text-justify indent-6">
                    {quyetDinhBranch === 'tra_lai' ? (
                      <>
                        Căn cứ Luật Khiếu nại, Luật Tố cáo và Thông tư số 05/2021/TT-TTCP quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh. Qua kiểm tra nội dung đơn và hồ sơ kèm theo, UBND quận Cầu Giấy nhận thấy vụ việc nêu trong đơn không thuộc thẩm quyền giải quyết của UBND quận Cầu Giấy.
                      </>
                    ) : (
                      <>
                        Căn cứ quy định tại Điều 29 Luật Khiếu nại năm 2011 (hoặc Điều 29 Luật Tố cáo năm 2018) về các trường hợp không thụ lý giải quyết. Qua kiểm tra, xác minh hồ sơ và các chứng cứ liên quan, nội dung đơn không đủ điều kiện thụ lý giải quyết theo quy định của pháp luật.
                      </>
                    )}
                  </p>

                  <div className="p-3.5 my-3 rounded-lg bg-slate-50 border border-slate-300 font-sans text-xs">
                    <p className="font-bold text-slate-900 mb-1">
                      {quyetDinhBranch === 'tra_lai' ? 'HƯỚNG DẪN CÔNG DÂN:' : 'LÝ DO KHÔNG THỤ LÝ:'}
                    </p>
                    <p className="text-slate-700">
                      {quyetDinhSigningDoc?.trichYeu ||
                        (quyetDinhBranch === 'tra_lai'
                          ? 'Đơn không thuộc thẩm quyền giải quyết của UBND quận. Hướng dẫn công dân nộp đơn trực tiếp đến cơ quan có thẩm quyền để được xem xét giải quyết theo quy định.'
                          : 'Đơn không đủ điều kiện theo quy định tại Điều 29. Đơn đã được cơ quan có thẩm quyền giải quyết đúng pháp luật và có hiệu lực thi hành.')}
                    </p>
                  </div>

                  <p className="text-justify indent-6">
                    UBND quận Cầu Giấy thông báo để Quý công dân được biết và thực hiện quyền khiếu nại, tố cáo theo đúng quy định của pháp luật./.
                  </p>
                </div>

                {/* Chữ ký & Con dấu số */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-4 font-sans text-xs">
                  <div>
                    <p className="font-bold text-slate-700">Nơi nhận:</p>
                    <p className="text-slate-600 text-[11px]">• Như kính gửi;</p>
                    <p className="text-slate-600 text-[11px]">• Lãnh đạo UBND quận (b/c);</p>
                    <p className="text-slate-600 text-[11px]">• Lưu: VT, TCD.</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold uppercase text-slate-900">KT. CHỦ TỊCH</p>
                    <p className="font-bold uppercase text-slate-800">PHÓ CHỦ TỊCH</p>

                    {/* Huy hiệu chữ ký số VGCA */}
                    <div className="inline-block mt-3 p-2 rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50/80 text-emerald-900 text-left">
                      <div className="flex items-center gap-1 font-bold text-[11px] text-emerald-800">
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                        <span>ĐÃ KÝ SỐ ĐIỆN TỬ</span>
                      </div>
                      <p className="text-[10px] text-slate-700 mt-0.5">
                        Ký bởi: <strong className="text-slate-900">{quyetDinhSigningDoc?.chuKy?.nguoiKy || 'Trần Văn Cường'}</strong>
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Cơ quan: UBND quận Cầu Giấy
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Thời gian: {quyetDinhSigningDoc?.thoiGianKy || new Date().toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <p className="font-bold text-slate-900 pt-2">
                      {quyetDinhSigningDoc?.chuKy?.nguoiKy || 'Trần Văn Cường'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>* Việc in thông báo không làm thay đổi kết quả quyết định đã được ký duyệt.</span>
              <button
                type="button"
                onClick={() => setShowInThongBaoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL XÁC NHẬN GỬI CHUYỂN THẨM QUYỀN (NHÁNH 3 - CHUYỂN THẨM QUYỀN)     */}
      {/* ========================================================================= */}
      {showXacNhanChuyenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-purple-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15.5px] text-slate-900 font-headline-md">
                    Xác nhận gửi chuyển thẩm quyền
                  </h3>
                  <p className="text-xs text-purple-700 font-medium">
                    Bàn giao hồ sơ liên thông điện tử theo quyết định đã ký
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowXacNhanChuyenModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-amber-700 shrink-0 mt-0.5">warning</span>
                <p>
                  Vui lòng kiểm tra kỹ đơn vị tiếp nhận trước khi gửi. Sau khi gửi thành công, trạng thái hồ sơ sẽ chuyển sang <strong>"Đã chuyển thẩm quyền"</strong> và ghi nhận biên bản giao nhận.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã hồ sơ đơn:</span>
                  <strong className="text-slate-900 font-bold">{currentDon.code}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người nộp đơn:</span>
                  <strong className="text-slate-800">{currentDon.nguoiNop || 'Công dân nộp đơn'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Văn bản quyết định đã ký:</span>
                  <strong className="text-emerald-700">{quyetDinhSigningDoc?.soKyHieu || 'QĐ-CHUYEN/2026'}</strong>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Đơn vị tiếp nhận bàn giao <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={selectedDonViNhanId}
                    onChange={(e) => setSelectedDonViNhanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {DEPARTMENTS.filter((d) => d.id !== 'tiep-dan').map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code}) — Lãnh đạo: {dept.leaderName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-[11.5px] text-slate-500">
                • Cán bộ thực hiện gửi: <strong className="text-slate-700">{currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'}</strong>
                <br />
                • Cơ quan gửi: <strong className="text-slate-700">UBND quận Cầu Giấy (Phòng Tiếp dân &amp; Xử lý đơn)</strong>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowXacNhanChuyenModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleXacNhanGuiChuyenThamQuyen}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">send</span>
                  <span>Xác nhận &amp; Gửi chuyển</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL GỬI QUYẾT ĐỊNH CHO ĐƯƠNG SỰ (BƯỚC 3 & 4 - TRẢ LẠI ĐƠN)           */}
      {/* ========================================================================= */}
      <GuiQuyetDinhModal
        isOpen={showGuiQuyetDinhModal}
        onClose={() => setShowGuiQuyetDinhModal(false)}
        quyetDinhInfo={currentQuyetDinhTraLai}
        donInfo={{
          code: currentDon.code,
          nguoiNop: currentDon.nguoiNop || 'Công dân nộp đơn',
          diaChi: currentDon.diaChi,
          sdt: currentDon.sdt,
          email: (currentDon as any).email,
        }}
        currentOfficerName={currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'}
        mode={guiQuyetDinhMode}
        onSaveDraft={handleSaveDraftGuiQuyetDinh}
        onConfirmSend={handleConfirmSendQuyetDinh}
      />

      {/* ========================================================================= */}
      {/* 5. MODAL LỊCH SỬ GỬI QUYẾT ĐỊNH & THEO DÕI GIAO NHẬN (TRẢ LẠI ĐƠN)        */}
      {/* ========================================================================= */}
      <LichSuGuiModal
        isOpen={showLichSuGuiModal}
        onClose={() => setShowLichSuGuiModal(false)}
        quyetDinhInfo={currentQuyetDinhTraLai}
        donCode={currentDon.code}
        onOpenResend={() => {
          setShowLichSuGuiModal(false);
          setGuiQuyetDinhMode('resend');
          setShowGuiQuyetDinhModal(true);
        }}
        onOpenBoSungChungTu={() => {
          setShowLichSuGuiModal(false);
          setGuiQuyetDinhMode('bo_sung_chung_tu');
          setShowGuiQuyetDinhModal(true);
        }}
      />
    </div>
  );
}