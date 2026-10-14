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
import { SigningDocument, CurrentUserAccount } from '../types/signing';

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
    }
  }, [donDetail]);

  // Kiểm tra văn bản báo cáo đề xuất đã có cho hồ sơ đơn này (chỉ loại báo cáo đề xuất, không tính tờ trình thụ lý)
  const existingSigningDoc = useMemo(() => {
    return (
      signingDocuments?.find(
        (d) =>
          d.hoSoCode === currentDon.code &&
          d.loaiVanBan === 'bao_cao_de_xuat'
      ) || null
    );
  }, [signingDocuments, currentDon.code]);

  // Kiểm tra báo cáo đề xuất đã được lập và trình ký xong chưa (khác null và status !== 'nhap')
  const isBaoCaoDaTrinhKy = Boolean(
    existingSigningDoc && existingSigningDoc.status !== 'nhap'
  );

  // Kiểm tra báo cáo đề xuất đã được ký duyệt chính thức chưa (đã ký / hoàn tất)
  const isBaoCaoDaKy = Boolean(
    (existingSigningDoc &&
      (existingSigningDoc.status === 'da_ky' || existingSigningDoc.status === 'hoan_tat')) ||
    currentDon?.statusBadge?.includes('Đã ký')
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

  // 1. Nhấn vào "Tạo báo cáo đề xuất" -> Hiển thị popup/modal "Tạo báo cáo đề xuất"
  const handleTaoBaoCaoDeXuat = () => {
    if (isBaoCaoDaTrinhKy) {
      // Nếu đã trình ký, bấm "Xem báo cáo đề xuất" -> mở xem văn bản tại Tab Hồ sơ & Văn bản
      if (existingSigningDoc) {
        const docItem: DocItem = {
          id: existingSigningDoc.id,
          name: `Bao_cao_ket_qua_xac_minh_${currentDon.code}.pdf`,
          tenVanBan: existingSigningDoc.tenVanBan || 'Báo cáo kết quả xác minh',
          category: 'Báo cáo đề xuất',
          soHieu: existingSigningDoc.soKyHieu,
          size: '380 KB',
          pages: 2,
          uploadDate: existingSigningDoc.ngayTao,
          signer: `${existingSigningDoc.nguoiLap} (${existingSigningDoc.donViNguoiLap || 'Điều tra viên'})`,
          coQuanBanHanh: existingSigningDoc.donViNguoiLap || 'Cơ quan Cảnh sát điều tra',
          stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
          ocrStatus: 'Hoàn tất',
          isProcessDoc: true,
          isEditable: true,
          loaiVanBan: 'bao_cao_de_xuat',
          nguoiNhan: existingSigningDoc.lanhDaoName || 'Thủ trưởng Cơ quan Điều tra',
          trichYeu: existingSigningDoc.trichYeu,
          noiDungChiTiet: existingSigningDoc.noiDungChiTiet,
          previewExcerpt: existingSigningDoc.noiDungChiTiet,
          trangThai: existingSigningDoc.status === 'da_ky' ? 'da_ban_hanh' : 'du_thao',
          fromXacMinh: true,
          signingStatus: existingSigningDoc.status,
        };
        setEditingDocInTab(docItem);
      }
      setActiveTab('tai-lieu');
      return;
    }

    // Mở popup/modal "Tạo báo cáo đề xuất"
    setShowTaoBaoCaoDeXuatModal(true);
  };

  // Xử lý khi cán bộ nhấn Tiếp nhận đơn (đặc biệt khi chuyển từ Lượt nhận không có file)
  const handleTiepNhanDon = () => {
    setCurrentDon((prev) => ({
      ...prev,
      statusBadge: 'Đang xử lý',
      isAwaitingAcceptance: false,
      isNoFileTransfer: false,
    }));
    setActiveTab('thong-tin');
    setIsEditingThongTinDon(true);
    showToast('✓ Tiếp nhận đơn thành công! Vui lòng nhập và hoàn thiện thông tin chung của hồ sơ.');
    addHistoryLog({
      title: 'Cán bộ thụ lý tiếp nhận đơn & Cập nhật thông tin',
      actor: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentAccount?.role || currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: 'tiep_nhan',
      statusBadge: {
        text: 'Tiếp nhận',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-800',
        borderClass: 'border-emerald-200',
      },
      description: `Cán bộ ${currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh'} đã chính thức tiếp nhận đơn ${currentDon.code} và bắt đầu cập nhật thông tin chung.`,
    });
  };

  // 2. Nhận sự kiện Trình ký Báo cáo từ TabTaiLieu
  const handleTrinhKyBaoCaoTuTab = (_docId?: string, updatedDoc?: SigningDocument) => {
    const docToSubmit = updatedDoc || existingSigningDoc;
    if (!docToSubmit) return;

    if (updatedDoc && onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prev) => {
        const idx = prev.findIndex((d) => d.id === updatedDoc.id || (d.hoSoCode === currentDon.code && d.loaiVanBan === 'bao_cao_de_xuat'));
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

    setEditingDocInTab(null);
    setActiveTab('tai-lieu');
    setDocCount((c) => Math.max(c, 7));

    showToast('✓ Đã lưu Báo cáo kết quả xác minh vào Hồ sơ và văn bản (Bản nháp)!');

    addHistoryLog({
      title: `Lập Báo cáo kết quả xác minh (${updatedDoc.soKyHieu})`,
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
        code: updatedDoc.soKyHieu,
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

    setTrangThaiXacMinh('da_xac_minh');
    setActiveStepNumber(2);
    setCurrentDon((prev) => ({
      ...prev,
      currentStep: 2,
      statusBadge: 'Chờ phê duyệt',
    }));
    setShowTaoBaoCaoDeXuatModal(false);
    setDocCount((c) => Math.max(c, 7));

    showToast(
      `✓ Đã lập và trình ký Báo cáo đề xuất (${updatedDoc.soKyHieu}) tới Lãnh đạo! Đã chuyển sang Bước 2 và mở khóa nút Thụ lý đơn.`
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
              <h1 className="text-[19px] font-bold text-slate-900 tracking-tight font-headline-md leading-tight">
                {currentDon.code}: {currentDon.title ? (currentDon.title.startsWith(currentDon.code) ? currentDon.title.replace(`${currentDon.code}: `, '') : currentDon.title) : (currentDon.noiDung || 'Đơn tiếp nhận & xử lý')}
              </h1>

              {/* Status Badge: Hướng xử lý hiện tại */}
              {/* <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold shadow-2xs border ${
                huongXuLyDaChon === 'yeu_cau_bo_sung'
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : huongXuLyDaChon === 'khong_thu_ly'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : huongXuLyDaChon === 'tra_lai'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : huongXuLyDaChon === 'ban_giao'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                <span className="material-symbols-outlined text-[16px]">
                  {HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.icon || 'verified'}
                </span>
                <span>
                  {huongXuLyDaChon === 'yeu_cau_bo_sung' && isAiNeedsMissingDocs
                    ? 'AI đề xuất: Yêu cầu bổ sung tài liệu'
                    : `Hướng xử lý: ${HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.label || huongXuLyDaChon}`}
                </span>
              </span> */}
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
            {/* Nút Tiếp nhận đơn (hiển thị khi hồ sơ chuyển đến đang chờ tiếp nhận / không có file) */}
            {(currentDon.isAwaitingAcceptance || currentDon.statusBadge === 'Chờ tiếp nhận' || currentDon.isNoFileTransfer) && (
              <button
                type="button"
                onClick={handleTiepNhanDon}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[13px] font-bold shadow-md ring-2 ring-emerald-300/40 transition-all cursor-pointer animate-pulse"
                title="Bấm để chính thức tiếp nhận đơn và mở chế độ nhập thông tin cơ bản"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                <span>Tiếp nhận đơn</span>
              </button>
            )}

            {/* Nút Tạo / Xem báo cáo đề xuất (nghiệp vụ Quản lý Đơn): Sau khi đã ký báo cáo đề xuất thì không hiển thị nút này nữa */}
            {!isBaoCaoDaKy && (
              <button
                type="button"
                onClick={handleTaoBaoCaoDeXuat}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 text-[13px] font-bold ${isBaoCaoDaTrinhKy
                  ? 'border-blue-300 bg-blue-50/90 hover:bg-blue-100 text-[#004ac6]'
                  : 'border-blue-600 bg-[#004ac6] hover:bg-[#003ea8] text-white shadow-md ring-2 ring-blue-300/40'
                  }`}
                title={
                  isBaoCaoDaTrinhKy
                    ? 'Xem văn bản Báo cáo đề xuất tại tab Hồ sơ & Văn bản'
                    : 'Khởi tạo văn bản Báo cáo đề xuất chi tiết tại tab Hồ sơ & Văn bản để chỉnh sửa và trình ký'
                }
              >
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                <span>{isBaoCaoDaTrinhKy ? 'Xem báo cáo đề xuất' : 'Tạo báo cáo đề xuất'}</span>
              </button>
            )}
            {/* Dropdown Thao tác khác: Ghép hồ sơ đơn, Tải bổ sung file, Phân công xử lý, Chỉnh sửa thông tin đơn */}
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

            {/* Sau khi lập và trình ký văn bản báo cáo xong mới hiển thị nút Thụ lý / Hướng xử lý chính */}
            {isBaoCaoDaTrinhKy && (
              <div className="relative inline-flex items-center">
                {/* 1. NÚT CHÍNH (PRIMARY ACTION BUTTON) */}
                <button
                  type="button"
                  onClick={handleExecutePrimaryAction}
                  className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-l-xl rounded-r-none border-r border-white/20 active:scale-98 text-white text-[13px] font-semibold transition-all cursor-pointer shadow-md ${huongXuLyDaChon === 'thu_ly'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : huongXuLyDaChon === 'khong_thu_ly'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : huongXuLyDaChon === 'yeu_cau_bo_sung'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : huongXuLyDaChon === 'tra_lai'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : huongXuLyDaChon === 'ban_giao'
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                  title="Bấm để thực hiện ngay hướng xử lý chính"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.icon || 'gavel'}
                  </span>
                  <span>{HUONG_XU_LY_CONFIG[huongXuLyDaChon]?.buttonText || 'Thụ lý'}</span>
                  {/* {huongXuLyDaChon === 'yeu_cau_bo_sung' && isAiNeedsMissingDocs && (
                    <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
                      AI đề xuất
                    </span>
                  )} */}
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

                {/* 3. DROPDOWN MENU CHỌN CÁC HƯỚNG XỬ LÝ KHÁC */}
                {showHuongDropdown && (
                  <>
                    {/* Backdrop vô hình để đóng dropdown khi click outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowHuongDropdown(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-scale-up">

                      <div className="space-y-1">
                        {/* 1. Thụ lý */}
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

                        {/* 2. Không thụ lý */}
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

                        {/* 3. Yêu cầu bổ sung */}
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

                        {/* 4. Trả lại */}
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

                        {/* 5. Chuyển thẩm quyền xử lý */}
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

                        {/* 6. Trả lời đơn */}
                        {/* <button
                          type="button"
                          onClick={() => handleSelectHuong('tra_loi_don')}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${huongXuLyDaChon === 'tra_loi_don'
                            ? 'bg-teal-50/80 text-teal-900 ring-1 ring-teal-300'
                            : 'hover:bg-slate-50 text-slate-800'
                            }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[18px]">reply</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[13px] text-slate-900">Trả lời đơn</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                              Lập văn bản trả lời, giải thích cho công dân
                            </p>
                          </div>
                          {huongXuLyDaChon === 'tra_loi_don' && (
                            <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0 mt-1">check</span>
                          )}
                        </button> */}
                      </div>

                      {/* Phân cách & Bảng xác minh chi tiết */}
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
            )}
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

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE CONTENT                                                 */}
      {/* ========================================================================= */}
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
          showToast(`✓ Đã ban hành Thông báo bổ sung ${soHieu} (${danhSachBoSung.length} mục) gửi cho công dân ${currentDon.nguoiNop}!`);
          setDocCount((c) => c + 1);
          setDaGuiThongBaoBoSung(true);
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

          // 2. Thêm vào signingDocuments phục vụ luồng trình ký Lãnh đạo
          const signingDoc: SigningDocument = {
            id: newDocItem.id,
            soKyHieu: targetSoHieu,
            hoSoCode: currentDon.code,
            luotNhanId: currentDon.luotNhanId,
            loaiDon: currentDon.loaiDon || 'Đơn khiếu nại',
            nguoiGuiDon: currentDon.nguoiNop,
            noiDungDon: currentDon.title,
            tenVanBan: targetDocTitle,
            loaiVanBan:
              loaiVanBan === 'quyet_dinh'
                ? 'quyet_dinh_thu_ly'
                : targetDocTitle.toLowerCase().includes('đề xuất')
                  ? 'bao_cao_de_xuat'
                  : 'to_trinh_thu_ly',
            loaiVanBanLabel: targetDocTitle,
            trichYeu: newDocItem.trichYeu,
            noiDungChiTiet: fullDocText,
            nguoiLap: currentAccount?.name || targetAssignee,
            donViNguoiLap: coQuan,
            ngayTao: `${todayStr} 09:30`,
            status: isTrinhKy ? 'cho_trinh' : 'nhap',
            thoiGianTrinh: isTrinhKy ? `${todayStr} 10:00` : undefined,
            nguoiTrinh: isTrinhKy ? (currentAccount?.name || targetAssignee) : undefined,
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
                status: isTrinhKy ? 'cho_ky' : 'chua_den_luot',
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
                trangThaiLucDo: isTrinhKy ? 'Chờ trình ký' : 'Bản nháp',
                ghiChu: `Đề xuất thụ lý đơn: ${targetDocTitle}`,
                noiDungSnapshot: fullDocText,
              },
            ],
            history: [
              {
                id: `hist-${Date.now()}`,
                time: `${todayStr} 10:00`,
                actor: currentAccount?.name || targetAssignee,
                action: isTrinhKy
                  ? `Trình Lãnh đạo (${targetLanhDao}) phê duyệt đề xuất thụ lý`
                  : 'Lưu bản nháp đề xuất thụ lý',
              },
            ],
            auditLogs: [
              {
                id: `al-${Date.now()}`,
                time: `${todayStr} 10:00`,
                actor: currentAccount?.name || targetAssignee,
                actorRole: 'Cán bộ thụ lý',
                action: isTrinhKy ? 'Trình văn bản' : 'Tạo mới',
                statusBefore: 'nhap',
                statusAfter: isTrinhKy ? 'cho_trinh' : 'nhap',
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
          setDaHoanThanhBuoc(true);
          if (activeStepNumber < workflow.steps.length) {
            setActiveStepNumber((prev) => prev + 1);
          }
          setEditingDocInTab(newDocItem);
          setActiveTab('tai-lieu');

          if (isTrinhKy) {
            showToast(`✓ Đã lưu đề xuất thụ lý và chuyển trình ký Lãnh đạo (${targetLanhDao}) văn bản "${targetDocTitle}"!`);
          } else {
            showToast(`✓ Đã lưu bản nháp đề xuất thụ lý và tạo văn bản "${targetDocTitle}" tại tab Hồ sơ & Văn bản!`);
          }

          // 4. Ghi lịch sử xử lý
          addHistoryLog({
            title: isTrinhKy
              ? `Trình Lãnh đạo phê duyệt Đề xuất thụ lý: ${targetDocTitle}`
              : `Lập bản nháp Đề xuất thụ lý: ${targetDocTitle}`,
            actor: targetAssignee,
            actorRole: currentDon.chucVuCanBo || 'Cán bộ thụ lý',
            actorDept: coQuan,
            category: 'quy_trinh',
            statusBadge: {
              text: isTrinhKy ? 'Chờ ký duyệt' : 'Bản nháp',
              bgClass: isTrinhKy ? 'bg-blue-50' : 'bg-slate-100',
              textClass: isTrinhKy ? 'text-blue-800' : 'text-slate-800',
              borderClass: isTrinhKy ? 'border-blue-200' : 'border-slate-200',
            },
            description: isTrinhKy
              ? `Cán bộ thụ lý đã lập xong Đề xuất thụ lý đơn và chuyển trình ký Lãnh đạo (${targetLanhDao}) xem xét, ký số phê duyệt theo quy định. Văn bản lưu trữ tại tab Hồ sơ & Văn bản.`
              : `Đã lưu bản nháp đề xuất thụ lý đơn. Hệ thống tự động tạo văn bản "${targetDocTitle}" (Số hiệu: ${targetSoHieu}) và lưu trữ tại tab Hồ sơ & Văn bản.`,
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
          const fullDocText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nỦY BAN NHÂN DÂN QUẬN CẦU GIẤY\nSố: ${data.soKyHieu}\nHà Nội, ngày ${data.ngayBanHanh}\n\nTHÔNG BÁO\nVề việc không thụ lý giải quyết tố cáo\n\nKính gửi: Ông/Bà ${data.nguoiNhan} (Địa chỉ: ${currentDon.diaChi || 'Cầu Giấy, Hà Nội'})\n\nNgày ${currentDon.ngayNhan}, Ủy ban nhân dân quận tiếp nhận đơn của Ông/Bà mang mã hồ sơ ${currentDon.code}.\nNội dung đơn: "${currentDon.title}".\nSau khi kiểm tra điều kiện thụ lý tố cáo theo quy định tại Điều 24 và Điều 29 Luật Tố cáo năm 2018, Ủy ban nhân dân quận nhận thấy:\n${data.lyDoChiTiet}\n\nCăn cứ ${data.canCuPhapLy}, Ủy ban nhân dân quận thông báo: Không thụ lý giải quyết nội dung tố cáo nêu trên.\nỦy ban nhân dân quận thông báo để Ông/Bà được biết và thực hiện theo đúng quy định của pháp luật./.\n\nTM. ỦY BAN NHÂN DÂN\nKT. CHỦ TỊCH - PHÓ CHỦ TỊCH\n${data.nguoiKy}`;

          const newDocItem: any = {
            id: `DOC-KTL-${Date.now().toString().slice(-4)}`,
            name: `Thong_bao_khong_thu_ly_${data.soKyHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            category: 'Thông báo không thụ lý',
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
            loaiVanBan: 'thong_bao',
            tenVanBan: 'Thông báo không thụ lý giải quyết đơn',
            nguoiNhan: data.nguoiNhan,
            trichYeu: `V/v Không thụ lý giải quyết đơn: ${data.lyDoChinh}`,
            noiDungChiTiet: data.lyDoChiTiet,
            previewExcerpt: fullDocText,
            trangThai: isTrinhKy ? 'da_ban_hanh' : 'du_thao',
            fromXacMinh: true,
            signingStatus: isTrinhKy ? 'cho_trinh' : 'nhap',
            canCuPhapLy: data.canCuPhapLy,
            lyDoChinh: data.lyDoChinh,
            lyDoChiTiet: data.lyDoChiTiet,
          };

          // 1. Thêm vào danh sách văn bản dùng chung
          setVanBanXacMinhList((prev) => [
            {
              id: newDocItem.id,
              loai: 'cong_van',
              tenVanBan: 'Thông báo không thụ lý giải quyết đơn',
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
            loaiDon: currentDon.loaiDon || 'Đơn tố cáo',
            nguoiGuiDon: data.nguoiNhan,
            noiDungDon: currentDon.title,
            tenVanBan: 'Thông báo không thụ lý giải quyết đơn',
            loaiVanBan: 'thong_bao',
            loaiVanBanLabel: 'Thông báo không thụ lý',
            trichYeu: newDocItem.trichYeu,
            noiDungChiTiet: fullDocText,
            nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
            ngayTao: `${data.ngayBanHanh} 09:30`,
            status: isTrinhKy ? 'cho_trinh' : 'nhap',
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
                tenTep: `Thong_bao_khong_thu_ly_${currentDon.code}.pdf`,
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
                ghiChu: 'Lập thông báo không thụ lý giải quyết đơn',
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
                statusAfter: isTrinhKy ? 'cho_trinh' : 'nhap',
                version: 'V1',
                note: newDocItem.trichYeu,
              },
            ],
          };

          if (onUpdateSigningDocuments) {
            onUpdateSigningDocuments((prev) => [signingDoc, ...prev]);
          }

          // 3. Cập nhật editing doc tại tab Hồ sơ & Văn bản và chuyển tab
          setDocCount((c) => c + 1);
          setEditingDocInTab(newDocItem);
          setActiveTab('tai-lieu');

          if (isTrinhKy) {
            showToast(`✓ Đã lưu và chuyển trình ký Lãnh đạo Thông báo không thụ lý số ${data.soKyHieu}!`);
          } else {
            showToast(`✓ Đã lưu Thông báo không thụ lý số ${data.soKyHieu} vào Hồ sơ & Văn bản. Đang mở biểu mẫu xem trước!`);
          }

          // 4. Ghi lịch sử xử lý
          addHistoryLog({
            title: isTrinhKy
              ? `Trình Lãnh đạo phê duyệt Thông báo không thụ lý số ${data.soKyHieu}`
              : `Lập bản nháp Thông báo không thụ lý số ${data.soKyHieu}`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: isTrinhKy ? 'Chờ ký duyệt' : 'Bản nháp',
              bgClass: isTrinhKy ? 'bg-blue-50' : 'bg-slate-100',
              textClass: isTrinhKy ? 'text-blue-800' : 'text-slate-800',
              borderClass: isTrinhKy ? 'border-blue-200' : 'border-slate-200',
            },
            description: `Lập Thông báo số ${data.soKyHieu} không thụ lý giải quyết đơn. Căn cứ: ${data.canCuPhapLy}. Lý do: ${data.lyDoChinh}.`,
            docInfo: {
              name: 'Thông báo không thụ lý giải quyết',
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

          if (data.actionType === 'trinh_ky') {
            // Đưa vào Luồng Trình ký Lãnh đạo
            const newSigningDoc: SigningDocument = {
              id: `vb-tra-lai-${Date.now()}`,
              soKyHieu: data.cauHinhVanBan.soKyHieu,
              tenVanBan: `Phiếu hướng dẫn trả lại đơn (${data.cauHinhVanBan.soKyHieu})`,
              loaiVanBan: 'van_ban_tra_lai',
              loaiVanBanLabel: 'Phiếu hướng dẫn trả lại đơn',
              hoSoCode: currentDon.code,
              loaiDon: currentDon.loaiDon || 'Đơn tiếp nhận hành chính',
              nguoiGuiDon: currentDon.nguoiNop || data.nguoiNhan,
              noiDungDon: currentDon.noiDung || currentDon.title || 'Đơn chuyển/trả lại theo thẩm quyền',
              nguoiLap: currentAccount?.name || currentDon.canBoXuLy || 'Nguyễn Minh Anh',
              donViNguoiLap: currentAccount?.phongBan || currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
              ngayTao: timeNow.split(' ')[0],
              hanXuLy: data.hanXuLy || '24 giờ',
              mucDoUuTien: 'khan',
              status: 'da_trinh',
              currentSignerIndex: 0,
              lanhDaoId: data.lanhDaoKyId || 'ld-01',
              lanhDaoName: data.lanhDaoKyTen || 'Đ/c Trần Văn Hùng',
              lanhDaoChucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
              trichYeu: `Phiếu hướng dẫn trả lại đơn cho công dân ${data.nguoiNhan}`,
              noiDungChiTiet: data.lyDoChiTiet,
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
                  noiDungSnapshot: data.lyDoChiTiet,
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

            setCurrentDon((prev) => ({
              ...prev,
              statusBadge: 'Chờ duyệt trả đơn',
            }));

            setDocCount((c) => c + 1);
            showToast(`✓ Đã chuyển văn bản trả lại đơn (${data.cauHinhVanBan.soKyHieu}) sang luồng Trình ký. Quy trình trả đơn sẽ hoàn tất khi Lãnh đạo ký duyệt!`);

            addHistoryLog({
              title: `Trình ký văn bản trả lại đơn (${data.cauHinhVanBan.soKyHieu})`,
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
              description: `Cán bộ đã chuyển Phiếu hướng dẫn trả đơn số ${data.cauHinhVanBan.soKyHieu} đến ${data.lanhDaoKyTen || 'Lãnh đạo'} để duyệt ký. Sau khi Lãnh đạo phê duyệt và ký số mới kết thúc quy trình trả đơn.`,
              docInfo: {
                name: 'Phiếu hướng dẫn chuyển/trả đơn',
                code: data.cauHinhVanBan.soKyHieu,
                type: 'phieu_huong_dan',
              },
            });
          } else {
            // Lưu bản nháp
            setDocCount((c) => c + 1);
            showToast(`✓ Đã lưu bản nháp văn bản trả lại đơn (${data.cauHinhVanBan.soKyHieu}) vào Hồ sơ!`);
            addHistoryLog({
              title: `Lưu bản nháp văn bản trả lại đơn (${data.cauHinhVanBan.soKyHieu})`,
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
              description: `Lưu dự thảo Phiếu hướng dẫn trả đơn số ${data.cauHinhVanBan.soKyHieu} trong hồ sơ đơn.`,
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
          showToast(`✓ Đã lập văn bản chuyển thẩm quyền (${data.cauHinhVanBan.soKyHieu}) sang "${data.donViNhanName || 'đơn vị có thẩm quyền'}".`);
          setDocCount((c) => c + 1);
          addHistoryLog({
            title: `Lập văn bản chuyển thẩm quyền xử lý (${data.cauHinhVanBan.soKyHieu})`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: 'Chuyển thẩm quyền',
              bgClass: 'bg-purple-50',
              textClass: 'text-purple-800',
              borderClass: 'border-purple-200',
            },
            description: `Lập văn bản chuyển đơn số ${data.cauHinhVanBan.soKyHieu} chuyển hồ sơ sang "${data.donViNhanName || 'đơn vị có thẩm quyền'}" giải quyết.`,
            docInfo: {
              name: 'Phiếu chuyển đơn xử lý',
              code: data.cauHinhVanBan.soKyHieu,
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
          showToast(`✓ Đã ban hành văn bản trả lời đơn (${data.soKyHieu}) cho công dân ${data.nguoiNhan}.`);
          setDocCount((c) => c + 1);
          addHistoryLog({
            title: `Ban hành văn bản trả lời đơn (${data.soKyHieu})`,
            actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
            actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
            actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
            category: 'van_ban',
            statusBadge: {
              text: 'Trả lời đơn',
              bgClass: 'bg-teal-50',
              textClass: 'text-teal-800',
              borderClass: 'border-teal-200',
            },
            description: `Ban hành văn bản trả lời, giải thích số ${data.soKyHieu} gửi cho công dân ${data.nguoiNhan}.`,
            docInfo: {
              name: 'Văn bản trả lời đơn thư',
              code: data.soKyHieu,
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
    </div>
  );
}