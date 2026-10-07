import React, { useState, useEffect, useMemo } from 'react';
import { LuotNhan, Screen, UploadedFile } from '../types';
import { matchWorkflowByLoaiDon } from '../constants/workflows';
import { ActiveWorkflowState } from '../types/workflow';
import { DON_VI_OPTIONS } from '../constants';
import { TiepNhanDonItem, DEPARTMENTS, OFFICERS } from '../constants/departments';
import ChuyenTiepNhanModal, { ChuyenTiepNhanSubmitData } from '../components/modals/ChuyenTiepNhanModal';
import NguonTraCuuModal, { NguonTraCuuTabType } from '../components/modals/NguonTraCuuModal';
import BanGiaoDonModal, { BanGiaoDonSubmitData } from '../components/modals/BanGiaoDonModal';
import TraLaiDonModal, { TraLaiDonSubmitData } from '../components/modals/TraLaiDonModal';
import ThuLyDonModal, { ThuLyDonSubmitData } from '../components/modals/ThuLyDonModal';
import XacMinhVaDeXuatModal, { HuongGiaiQuyetType } from '../components/modals/XacMinhVaDeXuatModal';
import KhongThuLyModal from '../components/modals/KhongThuLyModal';
import ThongBaoBoSungModal from '../components/workflow/ThongBaoBoSungModal';
import { getSuggestedActionsForWorkflow } from '../components/workflow/QuyTrinhSuggestedActions';
import { SigningDocument, CurrentUserAccount } from '../types/signing';
import { INITIAL_LEADERS } from '../constants/signingData';
import DonTrungDetailDrawer, { DonTrungItem } from '../components/modals/DonTrungDetailDrawer';

interface BanPhanTichProps {
  luotNhan: LuotNhan;
  onNav: (s: Screen) => void;
  onAcceptAndProcess?: (don: any, wfState?: ActiveWorkflowState) => void;
  onChuyenTiepNhan?: (item: TiepNhanDonItem, isDirect: boolean, assignedOfficerName?: string) => void;
  onBanGiao?: (luotNhanId: string, donViName: string, canBoName?: string, lyDo?: string) => void;
  onTraLai?: (luotNhanId: string, lyDo: string) => void;
  onUpdateLuotNhan?: (updated: LuotNhan) => void;
  onCreateSigningDocument?: (doc: SigningDocument) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: (docs: SigningDocument[]) => void;
  currentAccount?: CurrentUserAccount;
}

export default function BanPhanTich({
  luotNhan,
  onNav,
  onAcceptAndProcess,
  onChuyenTiepNhan,
  onBanGiao,
  onTraLai,
  onUpdateLuotNhan,
  onCreateSigningDocument,
  signingDocuments = [],
  onUpdateSigningDocuments,
  currentAccount,
}: BanPhanTichProps) {
  // ─── 1. TRẠNG THÁI AI: "none" (Thủ công) vs "reading" (Đang đọc) vs "done" (Đã đọc xong)
  const [aiState, setAiState] = useState<'none' | 'reading' | 'done'>('done');
  const [readingProgress, setReadingProgress] = useState<number>(100);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState<number>(6); // 1..6 (BR-11)

  // BR-01..BR-24 State controls
  const [currentLuotNhanStatus, setCurrentLuotNhanStatus] = useState<string>(luotNhan?.status || 'cho_chuyen');
  const hasDeterminedHuongXuLy = currentLuotNhanStatus !== 'cho_chuyen' && currentLuotNhanStatus !== 'cho_xu_ly' && currentLuotNhanStatus !== 'chua_xu_ly';

  useEffect(() => {
    if (luotNhan?.status) {
      setCurrentLuotNhanStatus(luotNhan.status);
    }
  }, [luotNhan?.status]);

  const [validationErrorModal, setValidationErrorModal] = useState<string | null>(null);
  const [isOfficialData, setIsOfficialData] = useState<boolean>(Boolean(luotNhan?.isOfficialData));
  const [tiepNhanHuong, setTiepNhanHuong] = useState<'tu_xu_ly' | 'phan_cong'>('tu_xu_ly');
  const [selectedOfficerForPhanCong, setSelectedOfficerForPhanCong] = useState<string>('');
  const [ghiChuPhanCong, setGhiChuPhanCong] = useState<string>('');
  const [banGiaoHuong, setBanGiaoHuong] = useState<'don_vi_khac' | 'can_bo_khac'>('don_vi_khac');
  const [banGiaoCanBoId, setBanGiaoCanBoId] = useState<string>('');
  const [lyDoBanGiao, setLyDoBanGiao] = useState<string>('Chuyển thụ lý theo đúng thẩm quyền nghiệp vụ đơn vị');
  const [traLaiHuongDan, setTraLaiHuongDan] = useState<string>(
    'Đề nghị công dân gửi đơn đến đúng cơ quan có thẩm quyền hoặc bổ sung đầy đủ tài liệu, chứng cứ kèm theo theo quy định.'
  );


  // PDF Viewer Controls & Danh sách tài liệu tải lên thực tế
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const currentFiles: UploadedFile[] = useMemo(() => {
    if (luotNhan?.files && luotNhan.files.length > 0) {
      return luotNhan.files;
    }
    return [
      { name: 'Đơn tố giác.pdf', size: '1.2 MB', category: 'main' },
      { name: 'Hợp đồng góp vốn.pdf', size: '2.8 MB', category: 'attach' },
    ];
  }, [luotNhan?.files]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const activeFile = currentFiles[selectedFileIndex] || currentFiles[0];
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFileIndex(0);
  }, [luotNhan?.id]);

  // Dữ liệu đơn trùng phục vụ đối soát CSDL và chọn đơn ghép
  const DON_TRUNG_LIST: DonTrungItem[] = [
    {
      id: 'dt-1',
      code: 'DS-29/2026-GOVEX',
      status: 'Đang xử lý',
      title: 'Phản ánh cơ sở tái chế phế liệu Minh Phát gây ô nhiễm môi trường và tiếng ồn tại TDP 4',
      matchPercent: 96,
      tags: ['Người đứng đơn', 'Nội dung tương tự'],
      ngayNhan: '10/09/2026',
      nguoiNop: 'Đại diện KDC số 4',
      cccd: '001075018392',
      soDienThoai: '0912 345 678',
      diaChi: 'Tổ dân phố số 4, phường Nghĩa Đô, quận Cầu Giấy, Hà Nội',
      loaiDon: 'Phản ánh / Kiến nghị',
      linhVuc: 'Môi trường & Trật tự đô thị',
      doiTuongBiPhanAnh: 'Cơ sở tái chế phế liệu Minh Phát',
      canBoThuLy: 'Nguyễn Minh Anh',
      donVi: 'Phòng QLĐT',
      noiDungGhepGoiY: 'Gói này giống hồ sơ DS-29/2026-GOVEX đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Tập thể người dân KDC số 4 phản ánh cơ sở tái chế phế liệu Minh Phát hoạt động phát tán mùi khói khét độc hại và xả thải không qua xử lý, đồng thời gây tiếng ồn nghiêm trọng từ 22h đêm đến 04h sáng, ảnh hưởng đến người già và trẻ nhỏ.',
      quaTrinhXuLy: [
        {
          date: '10/09/2026',
          title: 'Tiếp nhận đơn & Vào sổ theo dõi',
          actor: 'Nguyễn Minh Anh (Cán bộ thụ lý - Phòng QLĐT)',
          desc: 'Tiếp nhận đơn thư, đối chiếu thông tin chủ thể và cấp mã hồ sơ chính thức DS-29/2026-GOVEX.',
          status: 'done',
        },
        {
          date: '12/09/2026',
          title: 'Kiểm tra hiện trường & Lập biên bản xác minh',
          actor: 'Tổ công tác TDP 4 & Cán bộ thụ lý',
          desc: 'Lập biên bản xác minh thực địa, ghi nhận hiện trạng phản ánh cơ sở tái chế phế liệu Minh Phát.',
          status: 'done',
        },
        {
          date: '16/09/2026',
          title: 'Phối hợp Phòng TN&MT đo kiểm khí thải, tiếng ồn',
          actor: 'Phòng Tài nguyên & Môi trường quận',
          desc: 'Tiến hành đo đạc nồng độ khí thải và cường độ âm thanh ban đêm tại khu vực dân sinh giáp ranh.',
          status: 'done',
        },
        {
          date: '20/09/2026',
          title: 'Tổng hợp kết quả & Dự thảo văn bản xử lý',
          actor: 'Nguyễn Minh Anh',
          desc: 'Đang tổng hợp báo cáo kiểm tra và dự thảo văn bản yêu cầu cơ sở chấp hành quy định hoặc áp dụng biện pháp đình chỉ.',
          status: 'in_progress',
        },
      ],
      taiLieuDinhKem: [
        {
          name: 'Don_kien_nghi_goc_DS-29_2026_GOVEX.pdf',
          size: '2.4 MB',
          type: 'Đơn thư gốc scan (Bản có chữ ký tập thể hộ dân)',
        },
        {
          name: 'Bien_ban_kiem_tra_hien_truong_12-09.pdf',
          size: '1.8 MB',
          type: 'Biên bản làm việc thực địa',
        },
        {
          name: 'Hinh_anh_khoi_bui_co_so_Minh_Phat.jpg',
          size: '3.6 MB',
          type: 'Hình ảnh bằng chứng vi phạm',
        },
        {
          name: 'Phieu_de_nghi_do_kiem_TNMT.pdf',
          size: '780 KB',
          type: 'Phiếu kiểm tra chuyên môn',
        },
      ],
      tieuChiSoSanh: [
        {
          tieuChi: 'Người đứng đơn',
          donGoc: 'Đại diện KDC số 4',
          donMoi: 'Đại diện KDC số 4',
          match: true,
          note: 'Trùng khớp 100% chủ thể',
        },
        {
          tieuChi: 'Số định danh CCCD',
          donGoc: '001075018392',
          donMoi: '001075018392',
          match: true,
          note: 'Trùng khớp số CCCD/Định danh',
        },
        {
          tieuChi: 'Đối tượng bị phản ánh',
          donGoc: 'Cơ sở tái chế phế liệu Minh Phát',
          donMoi: 'Cơ sở tái chế Minh Phát',
          match: true,
          note: 'Trùng khớp đối tượng vi phạm',
        },
        {
          tieuChi: 'Địa bàn phát sinh',
          donGoc: 'Khu dân cư TDP số 4, Cầu Giấy, Hà Nội',
          donMoi: 'KDC số 4, Cầu Giấy, Hà Nội',
          match: true,
          note: 'Cùng vị trí địa bàn vụ việc',
        },
        {
          tieuChi: 'Nội dung & Chứng cứ mới',
          donGoc: 'Biên bản ghi nhận ngày 10/09/2026',
          donMoi: 'Bổ sung hợp đồng & biên bản đo đạc ban đêm',
          match: false,
          note: 'Cung cấp chứng cứ bổ sung cho đơn gốc',
        },
      ],
    },
    {
      id: 'dt-2',
      code: 'DS-4/2026-CATPHN',
      status: 'Đang xử lý',
      title: 'Tố giác cơ sở kinh doanh phế liệu Minh Phát lấn chiếm lối đi chung và xả khói bụi',
      matchPercent: 89,
      tags: ['Người đứng đơn', 'Nội dung tương tự'],
      ngayNhan: '05/09/2026',
      nguoiNop: 'Nguyễn Văn A',
      cccd: '001088019234',
      soDienThoai: '0903 888 999',
      diaChi: 'Số 12 ngõ 45 Cầu Giấy, Hà Nội',
      loaiDon: 'Tố giác vi phạm',
      linhVuc: 'An ninh trật tự & Môi trường',
      doiTuongBiPhanAnh: 'Cơ sở tái chế Minh Phát & chủ cơ sở',
      canBoThuLy: 'Trần Hoàng Long',
      donVi: 'Công an TP. Hà Nội',
      noiDungGhepGoiY: 'Gói này giống hồ sơ DS-4/2026-CATPHN đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Tố giác việc tụ tập xe tải bốc dỡ phế liệu lấn chiếm lòng lề đường, phát tán khói bụi độc hại vào ban đêm.',
      quaTrinhXuLy: [
        {
          date: '05/09/2026',
          title: 'Tiếp nhận tin báo tố giác',
          actor: 'Trần Hoàng Long (Cán bộ thụ lý)',
          desc: 'Tiếp nhận thông tin tố giác từ công dân, phân loại hồ sơ ban đầu.',
          status: 'done',
        },
        {
          date: '09/09/2026',
          title: 'Xác minh trật tự đô thị tại cơ sở',
          actor: 'Công an phường phối hợp',
          desc: 'Kiểm tra hiện trạng đỗ xe lấn chiếm ngõ xóm và lập biên bản nhắc nhở.',
          status: 'done',
        },
      ],
      taiLieuDinhKem: [
        {
          name: 'Don_to_giac_DS-4.pdf',
          size: '1.5 MB',
          type: 'Đơn tố giác của công dân',
        },
        {
          name: 'Anh_chup_xe_tai_lan_chiem.jpg',
          size: '2.8 MB',
          type: 'Hình ảnh vi phạm',
        },
      ],
    },
    {
      id: 'dt-3',
      code: 'DS-5/2026-CATPHN',
      status: 'Đang xử lý',
      title: 'Kiến nghị kiểm tra khí thải độc hại phát tán từ điểm thu mua phế liệu Minh Phát',
      matchPercent: 84,
      tags: ['Người đứng đơn', 'Nội dung tương tự'],
      ngayNhan: '01/09/2026',
      nguoiNop: 'Trần Thị C (Đồng đứng đơn)',
      cccd: '001180023412',
      soDienThoai: '0987 654 321',
      diaChi: 'KDC số 4, Cầu Giấy, Hà Nội',
      loaiDon: 'Kiến nghị / Phản ánh',
      linhVuc: 'Môi trường dân sinh',
      doiTuongBiPhanAnh: 'Cơ sở tái chế Minh Phát',
      canBoThuLy: 'Lê Thanh Tùng',
      donVi: 'Công an TP. Hà Nội',
      noiDungGhepGoiY: 'Gói này giống hồ sơ DS-5/2026-CATPHN đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Kiến nghị phối hợp cơ quan chức năng kiểm tra khí thải, mùi hóa chất đốt nhựa tái chế vào ban đêm.',
    },
    {
      id: 'dt-4',
      code: 'Đ-2025-00341',
      status: 'Đang thụ lý',
      title: 'Khiếu nại về bồi thường hỗ trợ tái định cư dự án Khu đô thị Y',
      matchPercent: 78,
      tags: ['Cùng đối tượng', 'Nội dung tương tự'],
      ngayNhan: '15/12/2025',
      nguoiNop: 'Đại diện KDC số 4',
      cccd: '001075018392',
      soDienThoai: '0912 345 678',
      diaChi: 'KDC số 4, Cầu Giấy, Hà Nội',
      loaiDon: 'Khiếu nại',
      linhVuc: 'Đất đai & Bồi thường GPMB',
      doiTuongBiPhanAnh: 'Hội đồng Bồi thường GPMB Dự án Y',
      canBoThuLy: 'Phạm Thu Hằng',
      donVi: 'Thanh tra Sở Xây dựng',
      noiDungGhepGoiY: 'Gói này giống hồ sơ Đ-2025-00341 đang mở – ghép vào đó không sinh đơn mới, không tốn số',
      tomTatNoiDung: 'Khiếu nại về đơn giá bồi thường đất nông nghiệp và phương án giao đất tái định cư.',
    },
  ];

  // Officer inputs
  const [selectedGhepDonCode, setSelectedGhepDonCode] = useState<string>('DS-29/2026-GOVEX');
  const [showAllDonTrung, setShowAllDonTrung] = useState<boolean>(false);
  const [selectedDonTrungForDrawer, setSelectedDonTrungForDrawer] = useState<DonTrungItem | null>(null);
  const [showDonTrungDrawer, setShowDonTrungDrawer] = useState<boolean>(false);
  const [isGhepComboboxOpen, setIsGhepComboboxOpen] = useState<boolean>(false);
  const [ghepSearchQuery, setGhepSearchQuery] = useState<string>('');

  const selectedGhepItem = useMemo(() => {
    return DON_TRUNG_LIST.find((item) => item.code === selectedGhepDonCode) || DON_TRUNG_LIST[0];
  }, [selectedGhepDonCode]);

  const filteredGhepList = useMemo(() => {
    if (!ghepSearchQuery.trim()) return DON_TRUNG_LIST;
    const q = ghepSearchQuery.toLowerCase();
    return DON_TRUNG_LIST.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.nguoiNop.toLowerCase().includes(q)
    );
  }, [ghepSearchQuery]);
  const [officerNote, setOfficerNote] = useState<string>(
    'Gói này giống hồ sơ DS-29/2026-GOVEX đang mở – ghép vào đó không sinh đơn mới, không tốn số'
  );
  const [huongXuLy, setHuongXuLy] = useState<
    'tiep-nhan' | 'ghep' | 'ban-giao' | 'tra-lai' | 'yeu-cau-bo-sung' | 'khong-thu-ly'
  >('ghep');
  const [expandedCanCu, setExpandedCanCu] = useState<string | null>(null);
  const [showGhepModal, setShowGhepModal] = useState<boolean>(false);
  const [showDetailTargetDonModal, setShowDetailTargetDonModal] = useState<boolean>(false);
  const [lyDoGhep, setLyDoGhep] = useState<string>(
    'Bổ sung tài liệu, chứng cứ cho hồ sơ đang thụ lý giải quyết'
  );
  const [ghiChuGhep, setGhiChuGhep] = useState<string>(
    'Ghép lượt nhận vào hồ sơ DS-29/2026-GOVEX để theo dõi tập trung, không tạo mã đơn mới.'
  );
  const [banGiaoUnit, setBanGiaoUnit] = useState<string>('Phòng Cảnh sát kinh tế (PC03) - Công an TP. Hà Nội');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showXacMinhModal, setShowXacMinhModal] = useState<boolean>(false);
  const [showThuLyModal, setShowThuLyModal] = useState<boolean>(false);
  const [showKhongThuLyModal, setShowKhongThuLyModal] = useState<boolean>(false);
  const [showBoSungModal, setShowBoSungModal] = useState<boolean>(false);
  const [showChuyenModal, setShowChuyenModal] = useState<boolean>(false);
  const [showTraLaiModal, setShowTraLaiModal] = useState<boolean>(false);
  const [showBanGiaoModal, setShowBanGiaoModal] = useState<boolean>(false);
  const [traLaiReason, setTraLaiReason] = useState<string>('Không thuộc thẩm quyền giải quyết');
  const [showCanCuModal, setShowCanCuModal] = useState<boolean>(false);
  const [showNguonTraCuuModal, setShowNguonTraCuuModal] = useState<boolean>(false);
  const [nguonTraCuuTab, setNguonTraCuuTab] = useState<NguonTraCuuTabType>('nguoi-gui');

  const openNguonTraCuu = (tab: NguonTraCuuTabType) => {
    setNguonTraCuuTab(tab);
    setShowNguonTraCuuModal(true);
  };

  // ─── QUẢN LÝ VĂN BẢN TRÌNH KÝ LIÊN KẾT TRỰC TIẾP VỚI ĐƠN HIỆN HÀNH ───
  const currentDonCode = useMemo(() => {
    return luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';
  }, [luotNhan?.id]);

  const linkedSigningDoc = useMemo(() => {
    return (
      signingDocuments.find(
        (d) => d.hoSoCode === currentDonCode || (luotNhan?.id && d.luotNhanId === luotNhan.id)
      ) || null
    );
  }, [signingDocuments, currentDonCode, luotNhan?.id]);

  const [activeSigningDoc, setActiveSigningDoc] = useState<SigningDocument | null>(() => linkedSigningDoc);
  const [showSigningDocModal, setShowSigningDocModal] = useState<boolean>(false);
  const [signingModalTab, setSigningModalTab] = useState<'van_ban' | 'luong_ky'>('van_ban');
  const [isSigningSubmitting, setIsSigningSubmitting] = useState<boolean>(false);
  const [signingNoteInput, setSigningNoteInput] = useState<string>('');

  useEffect(() => {
    if (linkedSigningDoc) {
      setActiveSigningDoc(linkedSigningDoc);
    }
  }, [linkedSigningDoc]);

  const handleQuickSignDocument = (doc: SigningDocument, note?: string) => {
    setIsSigningSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updatedSigners = doc.signers.map((s, idx) => {
        if (s.status === 'cho_ky' || idx === 1) {
          return {
            ...s,
            status: 'da_ky' as const,
            thoiGianKy: `${timeStr} ${todayStr}`,
            yKien: note || signingNoteInput || 'Đồng ý thụ lý giải quyết theo đề xuất. Giao Tổ xác minh khẩn trương tiến hành theo đúng quy định pháp luật.',
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ (Token: 5402-9912-8812)',
          };
        }
        return s;
      });

      const updatedDoc: SigningDocument = {
        ...doc,
        status: 'da_ky',
        signers: updatedSigners,
        auditLogs: [
          ...(doc.auditLogs || []),
          {
            id: `al-${Date.now()}`,
            time: `${todayStr} ${timeStr}`,
            actor: doc.lanhDaoName || 'Lãnh đạo ký duyệt',
            actorRole: 'Lãnh đạo phê duyệt',
            action: 'Ký số điện tử phê duyệt',
            statusBefore: doc.status,
            statusAfter: 'da_ky',
            version: 'V1',
            note: note || signingNoteInput || 'Đồng ý thụ lý giải quyết. Đã ký số phê duyệt Tờ trình.',
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
          },
        ],
        history: [
          ...(doc.history || []),
          {
            id: `h-${Date.now()}`,
            time: `${todayStr} ${timeStr}`,
            actor: doc.lanhDaoName || 'Lãnh đạo ký duyệt',
            action: 'Ký số điện tử phê duyệt Tờ trình Mẫu số 01',
            note: note || signingNoteInput || 'Đã ký số phê duyệt đề xuất thụ lý.',
            signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
          },
        ],
      };

      setActiveSigningDoc(updatedDoc);
      if (onUpdateSigningDocuments && signingDocuments.length > 0) {
        onUpdateSigningDocuments(
          signingDocuments.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
        );
      }
      setIsSigningSubmitting(false);
      setSigningNoteInput('');
      showToast(`✓ Đã ký số phê duyệt Tờ trình ${updatedDoc.soKyHieu || ''} cho đơn ${currentDonCode}!`);
    }, 600);
  };

  // Chỉnh sửa trực tiếp dạng text cho Khối 2: Thông tin trích xuất từ đơn
  const [isEditingExtract, setIsEditingExtract] = useState<boolean>(false);
  const [extractData, setExtractData] = useState({
    nguoiGui: 'Nguyễn Văn A',
    namSinh: '1988',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Số 12, ngõ 45, Cầu Giấy, Hà Nội',
    dongNguoiGui: 'Trần Thị C (Đồng đứng đơn)',
    cccdDongNguoiGui: '001190028391',
    luatSu: 'LS. Lê Quang Đ (Đại diện theo ủy quyền)',
    theLuatSu: 'LS-0928/ĐLS-HN',
    loaiNoiDung: 'Tố giác tội phạm',
    dauHieu: 'Lừa đảo chiếm đoạt tài sản',
    congTyBiToGiac: 'Công ty Cổ phần X',
    mstCongTy: '0108293847',
    doiTuong: 'Trần Văn B',
    chucVu: 'Giám đốc',
    donVi: 'Công ty Cổ phần X',
    nguoiLienQuan: 'Bà Vũ Mai H (Kế toán trưởng kiêm Thủ quỹ)',
    cccdNguoiLienQuan: '001183002910',
    thoiGian: 'Khoảng năm 2024 – 2025',
    duAn: 'Dự án Khu đô thị Y',
    diaDiem: 'Quận Hà Đông, Hà Nội',
    noiDungTomTat: 'Phản ánh ông Trần Văn B và Công ty Cổ phần X có hành vi lừa đảo chiếm đoạt tài sản thông qua việc huy động vốn tại Dự án Khu đô thị Y... không thực hiện cam kết và không hoàn trả tiền cho các nhà đầu tư.',
    yeuCau1: 'Xác minh, điều tra làm rõ hành vi.',
    yeuCau2: 'Bảo vệ quyền và lợi ích hợp pháp.',
    yeuCau3: 'Thông báo kết quả giải quyết.',
  });
  const [savedExtractData, setSavedExtractData] = useState(extractData);

  // ─── ĐỒNG BỘ THÔNG TIN BÓC TÁCH KHI MỞ TỪ MÀN HÌNH "CÔNG VIỆC CỦA TÔI" ─────
  useEffect(() => {
    if (!luotNhan) return;

    if (luotNhan.id.includes('LN-56') || luotNhan.noiDung?.includes('môi trường')) {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Đại diện khu dân cư số 4',
        namSinh: '1975',
        cccd: '001075018392',
        sdt: '0984 556 789',
        diaChi: 'Khu dân cư số 4, Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Ông Trần Văn Nam (Tổ phó TDP 4)',
        cccdDongNguoiGui: '001175029182',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Đơn phản ánh kiến nghị',
        dauHieu: 'Tiếp nhận trực tiếp theo ghi chú Một cửa (Không OCR - BR-09)',
        congTyBiToGiac: 'Cơ sở thu gom & tái chế phế liệu Minh Phát',
        mstCongTy: '0109283746',
        doiTuong: 'Cơ sở tái chế Minh Phát',
        chucVu: 'Chủ cơ sở sản xuất',
        donVi: 'Cơ sở tư nhân',
        nguoiLienQuan: 'Các hộ dân liền kề Khu dân cư số 4',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Tháng 8/2026 - nay',
        duAn: 'Khu dân cư số 4',
        diaDiem: 'Quận Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Phản ánh cơ sở tái chế phế liệu xả khói bụi và tiếng ồn ban đêm vượt quy chuẩn kỹ thuật môi trường tại Khu dân cư số 4, gây ảnh hưởng nghiêm trọng đến đời sống sinh hoạt của các hộ dân.',
        yeuCau1: 'Kiểm tra hiện trạng môi trường và đo đạc chỉ số khí thải.',
        yeuCau2: 'Yêu cầu tạm đình chỉ hoạt động gây tiếng ồn sau 22h.',
        yeuCau3: 'Buộc di dời cơ sở ra khỏi khu dân cư theo quy hoạch.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('none');
      setReadingProgress(0);
      setOfficerNote('Lượt nhận chuyển từ Một cửa: Tiếp nhận theo ghi chú thủ công, không có file scan (Không chạy OCR - BR-09). Cán bộ nhập liệu và xử lý thủ công.');
    } else if (luotNhan.id.includes('0430') || luotNhan.noiDung?.includes('Đội Cấn') || luotNhan.noiDung?.includes('cấp phép')) {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Nguyễn Hải Phong',
        namSinh: '1982',
        cccd: '001082019482',
        sdt: '0912 889 922',
        diaChi: 'Số 14 ngõ 128 Đội Cấn, Ba Đình, Hà Nội',
        dongNguoiGui: 'Bà Lê Thúy Hằng (Đồng sở hữu)',
        cccdDongNguoiGui: '001184019283',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Hồ sơ cấp phép xây dựng',
        dauHieu: 'Chồng lấn chỉ giới xây dựng với ngõ đi chung (Độ tin cậy 68%)',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Công trình nhà ở riêng lẻ tại số 14 ngõ 128 Đội Cấn',
        chucVu: 'Chủ đầu tư công trình',
        donVi: 'Cá nhân',
        nguoiLienQuan: 'Các hộ dân sử dụng chung ngõ 128 Đội Cấn',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Tháng 09/2026',
        duAn: 'Nhà ở gia đình (5 tầng + 1 lửng)',
        diaDiem: 'Ngõ 128 Đội Cấn, Ba Đình, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Thẩm định hồ sơ xin cấp phép xây dựng nhà ở riêng lẻ ngõ 128 Đội Cấn. AI phát hiện bản vẽ hiện trạng có dấu hiệu chồng lấn 0.35m với chỉ giới ngõ đi chung của TDP số 3, cần cán bộ kiểm tra thực địa trước khi tiếp nhận.',
        yeuCau1: 'Kiểm tra trích lục bản đồ địa chính và mốc chỉ giới ngõ đi chung.',
        yeuCau2: 'Thẩm định tính hợp lệ của bản vẽ thiết kế thi công.',
        yeuCau3: 'Cán bộ xác nhận kết quả kiểm tra thực địa và quyết định thụ lý/bổ sung hồ sơ.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote('Đề xuất tiếp nhận hồ sơ để tiến hành thẩm tra, đồng thời gửi phiếu yêu cầu công dân làm rõ phần ban công nhô ra ngõ đi chung 0.35m.');
    } else if (luotNhan.id.includes('LN-57') || luotNhan.aiJob === 3) {
      setAiState('reading');
      setReadingProgress(75);
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Bà Hoàng Thị Lựu',
        namSinh: '1948',
        cccd: '001048002918',
        sdt: '0903 221 445',
        diaChi: 'Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Thủ tục chính sách xã hội',
        dauHieu: 'Đang đối soát CSDL Dân cư VNeID',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Chế độ trợ cấp xã hội người cao tuổi',
        chucVu: 'Đối tượng bảo trợ',
        donVi: 'UBND Phường',
        nguoiLienQuan: 'N/A',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: '16/09/2026',
        duAn: 'Trợ cấp an sinh xã hội',
        diaDiem: 'Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Đề nghị hỗ trợ chính sách an sinh xã hội đối với người cao tuổi có hoàn cảnh neo đơn.',
        yeuCau1: 'Đối soát thông tin công dân trên CSDL Quốc gia về dân cư.',
        yeuCau2: 'Xác minh điều kiện hoàn cảnh bảo trợ xã hội.',
        yeuCau3: 'Hoàn thiện hồ sơ chi trả chế độ theo quy định.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setOfficerNote('Hồ sơ đang chờ kết nối CSDL dân cư VNeID bóc tách tự động.');
    } else if (luotNhan.id.includes('LN-58')) {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Ông Đỗ Viết Thắng',
        namSinh: '1965',
        cccd: '001065009182',
        sdt: '0913 229 118',
        diaChi: 'Quận Cầu Giấy, Hà Nội',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: 'Đơn phản ánh kiến nghị',
        dauHieu: 'Tài liệu scan bị nghiêng mờ - Module OCR báo lỗi không bóc tách được',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Hộ liền kề số 16',
        chucVu: 'Cá nhân',
        donVi: 'Tổ dân phố',
        nguoiLienQuan: 'UBND Phường sở tại',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: 'Tháng 9/2026',
        duAn: 'Ranh giới ngõ đi chung',
        diaDiem: 'Quận Cầu Giấy, Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Phản ánh tranh chấp ranh giới sử dụng đất ngõ đi chung. Tài liệu scan kèm theo bị nghiêng mờ, module OCR không đọc được, cần cán bộ kiểm tra bản chính tại Một cửa hoặc nhập liệu bổ sung.',
        yeuCau1: 'Đối chiếu bản đồ địa chính gốc.',
        yeuCau2: 'Xác minh thực địa hiện trạng.',
        yeuCau3: 'Hòa giải tranh chấp ranh giới lối đi.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('none');
      setOfficerNote('Lỗi OCR: Tài liệu scan kèm theo bị nghiêng mờ, module OCR không đọc được. Cán bộ thụ lý kiểm tra và nhập liệu bổ sung.');
    } else {
      const data = {
        nguoiGui: luotNhan.nguoiNop || 'Người nộp đơn',
        namSinh: '1988',
        cccd: luotNhan.cccd || '001088012345',
        sdt: luotNhan.sdt || '0983 123 456',
        diaChi: luotNhan.diaChi || 'Hà Nội',
        dongNguoiGui: 'Không có',
        cccdDongNguoiGui: 'N/A',
        luatSu: 'Không có',
        theLuatSu: 'N/A',
        loaiNoiDung: luotNhan.loaiDon || 'Đơn phản ánh kiến nghị',
        dauHieu: 'Thông tin tiếp nhận mới từ bộ phận một cửa',
        congTyBiToGiac: 'N/A',
        mstCongTy: 'N/A',
        doiTuong: 'Cơ quan / Đơn vị có thẩm quyền giải quyết',
        chucVu: 'N/A',
        donVi: luotNhan.donVi || 'Phòng Hành chính - Tổng hợp',
        nguoiLienQuan: 'N/A',
        cccdNguoiLienQuan: 'N/A',
        thoiGian: luotNhan.ngayNhan || 'Hôm nay',
        duAn: 'Tiếp nhận đơn',
        diaDiem: luotNhan.diaChi || 'Hà Nội',
        noiDungTomTat: luotNhan.noiDung || 'Đơn mới tiếp nhận, chờ kiểm tra và chuyển tiếp nhận xử lý.',
        yeuCau1: 'Kiểm tra tính hợp lệ của hồ sơ đơn tiếp nhận.',
        yeuCau2: 'Xem xét thẩm quyền tiếp nhận và căn cứ pháp luật.',
        yeuCau3: 'Chuyển tiếp nhận và phân công cán bộ xử lý theo thẩm quyền.',
      };
      setExtractData(data);
      setSavedExtractData(data);
      setAiState('done');
      setReadingProgress(100);
      setOfficerNote('Lượt nhận vừa được thêm mới. Hồ sơ đã sẵn sàng để chuyển tiếp nhận và xử lý.');
    }
  }, [luotNhan]);

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

  const { workflow: currentWf, actions: suggestedWfActions } = getSuggestedActionsForWorkflow(
    extractData.loaiNoiDung || 'Đơn tố giác về tội phạm'
  );

  // 6 bước tuần tự của AI sau OCR (BR-11)
  const AI_PIPELINE_STEPS_6 = [
    { step: 1, title: 'Trích xuất dữ liệu', desc: 'Bóc tách văn bản OCR & nhận diện bố cục' },
    { step: 2, title: 'Chuẩn hóa chủ thể', desc: 'Định danh đối chiếu CSDL dân cư' },
    { step: 3, title: 'Tra cứu lịch sử', desc: 'Lịch sử nộp đơn & giải quyết trước đây' },
    { step: 4, title: 'Tìm đơn/vụ việc liên quan', desc: 'Quét trùng lặp & liên đới hệ thống' },
    { step: 5, title: 'Đánh giá tính hợp lệ', desc: 'Kiểm tra thẩm quyền & điều kiện thụ lý' },
    { step: 6, title: 'Tổng hợp & gợi ý', desc: 'Đề xuất phân loại & quy trình xử lý' },
  ];

  // BR-12, BR-13, BR-14: Kết quả AI là đề xuất; cán bộ sửa và lưu sẽ trở thành dữ liệu chính thức ưu tiên cao; không tự chạy lại OCR
  const handleSaveExtract = () => {
    setSavedExtractData({ ...extractData });
    setIsOfficialData(true);
    setIsEditingExtract(false);
    onUpdateLuotNhan?.({ ...luotNhan, isOfficialData: true, officerEdits: extractData as any });
    showToast('✓ Đã lưu thay đổi! Giá trị cán bộ chỉnh sửa được xác lập là Dữ liệu chính thức (BR-13).');
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

  // BR-11: Mô phỏng AI tuần tự 6 bước sau OCR
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setReadingProgress((prev) => {
        const next = prev + 15;
        if (next <= 25) setAiStepIndex(1);
        else if (next <= 45) setAiStepIndex(2);
        else if (next <= 65) setAiStepIndex(3);
        else if (next <= 80) setAiStepIndex(4);
        else if (next <= 95) setAiStepIndex(5);
        else setAiStepIndex(6);

        if (next >= 100) {
          clearInterval(interval);
          setAiState('done');
          setIsSimulating(false);
          setAiStepIndex(6);
          showToast('✓ AI đã hoàn thành 6 bước phân tích và tổng hợp đề xuất xử lý (BR-11)!');
          return 100;
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // BR-10: Chỉ chạy lại khi cán bộ chủ động chọn Phân tích lại
  const handleStartSimulation = () => {
    setAiState('reading');
    setReadingProgress(15);
    setAiStepIndex(1);
    setIsSimulating(true);
    showToast('Bắt đầu phân tích lại: AI quét OCR và chạy tuần tự 6 bước phân tích (BR-10, BR-11)...');
  };

  const handleCopySummary = () => {
    navigator.clipboard?.writeText(
      'Nguyễn Văn A tố giác ông Trần Văn B (Giám đốc Công ty Cổ phần X) có hành vi lừa đảo chiếm đoạt tài sản qua huy động vốn tại Dự án Khu đô thị Y (Hà Nội) giai đoạn 2024 – 2025. Đề xuất hướng xử lý: Phân loại đơn Tố giác tội phạm; chuyển Phòng Cảnh sát kinh tế thụ lý, xác minh theo thẩm quyền; đồng thời rà soát hợp nhất với 01 đơn tương tự (D-2025-00341) và kiểm tra tiền sử 03 đơn đã gửi của người đứng đơn.'
    );
    showToast('Đã sao chép nội dung tóm tắt & đề xuất xử lý vào khay nhớ tạm.');
  };

  // BR-03, BR-04, BR-05: Kiểm tra điều kiện mở modal chuyển tiếp nhận & xử lý
  const handleOpenChuyenModal = () => {
    if (currentLuotNhanStatus !== 'cho_chuyen') {
      showToast(`Lượt nhận đã ở trạng thái "${currentLuotNhanStatus === 'da_chuyen' ? 'Đã chuyển' : currentLuotNhanStatus === 'da_ban_giao' ? 'Đã bàn giao' : 'Đã trả lại'}", không thể chuyển tiếp nhận lại.`);
      return;
    }

    const hasFiles = Boolean(
      (luotNhan?.files && luotNhan.files.length > 0) ||
      luotNhan?.hasFile ||
      (luotNhan?.id && !luotNhan.id.includes('empty'))
    );
    const hasNote = Boolean(
      luotNhan?.ghiChu?.trim() ||
      luotNhan?.noiDung?.trim() ||
      extractData?.noiDungTomTat?.trim()
    );

    if (!hasFiles && !hasNote) {
      setValidationErrorModal(
        'Lượt nhận chưa đủ điều kiện để chuyển tiếp nhận & xử lý (Quy tắc BR-04, BR-05):\n\n• Yêu cầu bắt buộc: Phải có ít nhất 01 nguồn dữ liệu xử lý (file tài liệu đính kèm hoặc ghi chú nội dung tiếp nhận).\n• Thông tin người nộp hồ sơ: Không bắt buộc.\n\nVui lòng tải lên tệp tài liệu hoặc nhập nội dung ghi chú trước khi chuyển.'
      );
      return;
    }

    setShowChuyenModal(true);
  };

  // Chuyển sang màn hình chi tiết đơn (don-tiep-nhan)
  const handleGoToChiTietDon = () => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    const donObj = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn phản ánh kiến nghị',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đang xác minh thông tin',
      isNew: true,
    };
    onAcceptAndProcess?.(donObj);
    onNav('don-tiep-nhan');
  };

  // BR-06, BR-07, BR-08, BR-09: Xử lý submit chuyển tiếp nhận
  const handleChuyenTiepNhanSubmit = (data: ChuyenTiepNhanSubmitData) => {
    setShowChuyenModal(false);
    setCurrentLuotNhanStatus('da_chuyen');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_chuyen' });

    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    const hasFiles = Boolean(
      (luotNhan?.files && luotNhan.files.length > 0) ||
      luotNhan?.hasFile ||
      (luotNhan?.id && !luotNhan.id.includes('empty'))
    );

    const newItem: TiepNhanDonItem = {
      id: `TN-${dynamicCode.replace('Đ-', '')}`,
      code: dynamicCode,
      luotNhanId: luotNhan?.id || 'LN-2025-0819',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Chưa xác định danh tính',
      loaiDon: extractData.loaiNoiDung || 'Đơn phản ánh kiến nghị',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
      ngayChuyenDen: 'Vừa xong',
      donViHienTai: 'Bộ phận Tiếp nhận đơn (Một cửa)',
      donViTiepNhanId: data.donViTiepNhanId,
      donViTiepNhan: data.donViTiepNhanName,
      hanXuLy: 'Còn 3 ngày',
      hanXuLyFull: '19/09/2026 - 17:00',
      trangThai: data.hinhThuc === 'hang_cho' ? 'cho_phan_cong' : 'dang_xu_ly',
      noiDungTomTat: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      ghiChuChuyen: data.ghiChu,
      nguoiChuyen: 'Cán bộ thụ lý (Nguyễn Minh Anh)',
      canBoXuLy: data.canBoNhan?.name,
      canBoXuLyId: data.canBoNhan?.id,
      chucVuCanBo: data.canBoNhan?.role,
      ngayPhanCong: data.hinhThuc === 'truc_tiep' ? '16/09/2026' : undefined,
      nguoiPhanCong: data.hinhThuc === 'truc_tiep' ? 'Nguyễn Minh Anh (Giao trực tiếp)' : undefined,
      hinhThucChuyen: data.hinhThuc,
      nguonXuLy: hasFiles ? 'file_ocr' : 'ghi_chu_thu_cong',
    };

    if (data.hinhThuc === 'hang_cho') {
      onChuyenTiepNhan?.(newItem, false);
    } else {
      onChuyenTiepNhan?.(newItem, true, data.canBoNhan?.name);
    }

    const donObj = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Chưa xác định danh tính',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn phản ánh kiến nghị',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đang xác minh thông tin',
      isNew: true,
    };
    onAcceptAndProcess?.(donObj);

    showToast(`✓ Đã tiếp nhận đơn ${dynamicCode} thành công. Chuyển sang màn hình chi tiết đơn...`);
    setTimeout(() => onNav('don-tiep-nhan'), 350);
  };

  // BR-16, BR-17, BR-18: Xác nhận Tiếp nhận (Tự xử lý vs Phân công)
  const handleConfirmTiepNhan = () => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    if (tiepNhanHuong === 'phan_cong' && !selectedOfficerForPhanCong) {
      showToast('Vui lòng chọn cán bộ nhận phân công xử lý (BR-18).');
      return;
    }

    setShowSubmitModal(false);

    const donObj = {
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || dynamicCode,
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Người nộp đơn',
      ngayNhan: luotNhan?.ngayNhan || 'Hôm nay',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn tiếp nhận hành chính',
      type: (dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN') as 'VỤ VIỆC' | 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đang xác minh thông tin',
      isNew: true,
    };

    if (tiepNhanHuong === 'tu_xu_ly') {
      setCurrentLuotNhanStatus('da_chuyen');
      onUpdateLuotNhan?.({ ...luotNhan, status: 'da_chuyen' });
      showToast(`✓ Đã tiếp nhận đơn ${dynamicCode}. Đang chuyển sang màn hình chi tiết đơn...`);
      onAcceptAndProcess?.(donObj);
      setTimeout(() => onNav('don-tiep-nhan'), 350);
    } else {
      const assignedOfficer = OFFICERS.find((o) => o.id === selectedOfficerForPhanCong);
      showToast(`✓ Đã tiếp nhận và phân công cho cán bộ ${assignedOfficer?.name || 'được chọn'} xử lý (BR-18). Đang chuyển sang màn hình chi tiết đơn...`);
      const newItem: TiepNhanDonItem = {
        id: `TN-${dynamicCode.replace('Đ-', '')}`,
        code: dynamicCode,
        luotNhanId: luotNhan?.id || dynamicCode,
        nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Người nộp đơn',
        loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính',
        ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:30',
        ngayChuyenDen: 'Vừa xong',
        donViHienTai: 'Phòng Tiếp công dân & Xử lý đơn',
        donViTiepNhanId: 'tiep-dan',
        donViTiepNhan: 'Phòng Tiếp công dân & Xử lý đơn',
        hanXuLy: 'Còn 3 ngày',
        hanXuLyFull: '19/09/2026 - 17:00',
        trangThai: 'dang_xu_ly',
        noiDungTomTat: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
        canBoXuLy: assignedOfficer?.name,
        canBoXuLyId: assignedOfficer?.id,
        chucVuCanBo: assignedOfficer?.role,
        ngayPhanCong: '16/09/2026',
        nguoiPhanCong: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        ghiChuPhanCong: ghiChuPhanCong,
        hinhThucChuyen: 'truc_tiep',
        lichSuPhanCong: [
          {
            time: '16/09/2026 10:45',
            nguoiGiao: 'Nguyễn Minh Anh',
            nguoiNhan: assignedOfficer?.name || 'Cán bộ',
            ghiChu: ghiChuPhanCong || 'Phân công thụ lý giải quyết đơn',
          },
        ],
      };
      onChuyenTiepNhan?.(newItem, true, assignedOfficer?.name);
      onAcceptAndProcess?.(donObj);
      setTimeout(() => onNav('don-tiep-nhan'), 350);
    }
  };

  // Xử lý xác nhận Ghép lượt nhận vào hồ sơ Đơn đã có (Không sinh mã đơn mới)
  const handleConfirmGhep = () => {
    setShowGhepModal(false);
    setCurrentLuotNhanStatus('da_ghep');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_ghep' });
    showToast(
      `✓ Đã ghép thành công lượt nhận ${luotNhan?.id || 'LN-56/2026-GOVEX'} vào hồ sơ đơn ${selectedGhepDonCode}!`
    );
    setTimeout(() => {
      onNav('don-tiep-nhan');
    }, 1000);
  };

  // BR-19, BR-20, BR-21, BR-22: Xác nhận Bàn giao (Đơn vị khác vs Cán bộ trong phòng)
  // STEP-03C: Xác nhận Bàn giao từ Popup BanGiaoDonModal (Cán bộ chuyên môn)
  const handleBanGiaoModalSubmit = (data: BanGiaoDonSubmitData) => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowBanGiaoModal(false);
    setCurrentLuotNhanStatus('da_ban_giao');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_ban_giao' });

    const targetName =
      data.banGiaoType === 'don_vi_khac'
        ? data.donViNhanName || 'Đơn vị tiếp nhận'
        : data.canBoNhan?.name || 'Cán bộ trong phòng';

    showToast(
      `✓ [STEP-03C] Đã hoàn tất bàn giao đơn ${dynamicCode} sang "${targetName}" (${data.danhMucTaiLieu.length} tài liệu, ${data.cauHinhVanBan.taoVanBan ? `Biên bản: ${data.cauHinhVanBan.soKyHieu}` : 'Không xuất văn bản'}).`
    );

    onBanGiao?.(luotNhan?.id, targetName, data.canBoNhan?.name, data.lyDoBanGiao);

    onAcceptAndProcess?.({
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || 'LN-2025-0105',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Vũ Thị Thanh',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:30',
      loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính',
      type: dynamicCode.startsWith('VV') ? 'VỤ VIỆC' : 'ĐƠN TIẾP NHẬN',
      statusBadge: 'Đã bàn giao',
    });

    setTimeout(() => onNav('don-tiep-nhan'), 800);
  };

  // STEP-03D: Xác nhận Trả lại từ Popup TraLaiDonModal (Cán bộ chuyên môn)
  const handleTraLaiModalSubmit = (data: TraLaiDonSubmitData) => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowTraLaiModal(false);
    setCurrentLuotNhanStatus('da_tra_lai');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_tra_lai' });

    showToast(
      `✓ [STEP-03D] Đã lập văn bản trả lại đơn ${dynamicCode} cho công dân ${extractData.nguoiGui || luotNhan?.nguoiNop} (${data.cauHinhVanBan.taoVanBan ? `Văn bản: ${data.cauHinhVanBan.soKyHieu}` : 'Ghi nhận lý do'}) và kết thúc Task xử lý.`
    );

    onTraLai?.(luotNhan?.id, data.lyDoChiTiet);
  };

  // STEP-03A: Xác nhận Thụ lý từ Popup ThuLyDonModal (Lập Tờ trình Mẫu số 01/TT-TTCP và vào Luồng trình ký)
  const handleThuLyModalSubmit = (data: ThuLyDonSubmitData) => {
    const dynamicCode = luotNhan?.id
      ? luotNhan.id.startsWith('LN-')
        ? `Đ-${luotNhan.id.replace('LN-', '')}`
        : luotNhan.id
      : 'Đ-2026-00125';

    setShowThuLyModal(false);
    setCurrentLuotNhanStatus('da_thu_ly');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'da_thu_ly' });

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const docId = `VB-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const leader = INITIAL_LEADERS.find((l) => l.id === data.lanhDaoKyId) || {
      id: data.lanhDaoKyId || 'ld-01',
      name: data.lanhDaoKyName || 'Đ/c Trần Văn Hùng',
      chucVu: data.lanhDaoKyChucVu || 'Phó Chánh Thanh tra thành phố',
      coQuan: data.lanhDaoKyCoQuan || 'Thanh tra Thành phố',
    };

    // Tạo văn bản Trình ký chuẩn hệ thống
    const newDoc: SigningDocument = {
      id: docId,
      soKyHieu: data.cauHinhBaoCao.soKyHieu || `${Math.floor(10 + Math.random() * 90)}/TTr-TCD`,
      hoSoCode: dynamicCode,
      luotNhanId: luotNhan?.id || 'LN-2026-0819',
      loaiDon: extractData.loaiNoiDung || luotNhan?.loaiDon || 'Đơn tố cáo cán bộ vi phạm',
      nguoiGuiDon: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
      noiDungDon: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo vi phạm công vụ',

      tenVanBan: `Tờ trình đề xuất thụ lý giải quyết đơn tố cáo [${dynamicCode}]`,
      loaiVanBan: 'to_trinh_thu_ly',
      loaiVanBanLabel: 'Tờ trình đề xuất thụ lý',
      trichYeu: `V/v Đề xuất thụ lý giải quyết đơn tố cáo đối với ${extractData.doiTuong || 'cán bộ vi phạm'} - Hồ sơ ${dynamicCode}`,
      noiDungChiTiet: `Kính gửi: ${data.cauHinhBaoCao.kinhGui || leader.name}

Căn cứ Luật Tố cáo năm 2018 (Điều 12, Điều 29, Điều 30);
Căn cứ Nghị định số 31/2019/NĐ-CP ngày 10/04/2019 của Chính phủ;
Căn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ;

Sau khi kiểm tra ban đầu và xác minh thông tin đối với hồ sơ đơn số ${dynamicCode} của người tố cáo:
1. Tư cách người tố cáo: Đầy đủ năng lực hành vi dân sự, đơn có chữ ký trực tiếp, thông tin nhân thân rõ ràng.
2. Thẩm quyền: Vụ việc thuộc thẩm quyền thụ lý giải quyết theo quy định tại Điều 12 Luật Tố cáo 2018.
3. Nội dung: Đã xác định rõ người bị tố cáo (${extractData.doiTuong || 'cán bộ vi phạm'}), hành vi vi phạm và có tài liệu kèm theo.

Ý kiến đề xuất:
Kính trình Lãnh đạo phê duyệt:
- Thụ lý giải quyết nội dung tố cáo nêu trên.
- Ban hành Quyết định thụ lý và thành lập Tổ xác minh gồm ${data.phuongThucThuLy === 'phan_cong_can_bo' ? data.canBoThuLyName : 'cán bộ'} làm Tổ trưởng. Thời hạn xác minh: ${data.thoiHanXacMinhNgay} ngày làm việc.`,

      nguoiLap: 'Nguyễn Minh Anh',
      donViNguoiLap: 'Phòng Tiếp công dân & Xử lý đơn',
      ngayTao: todayStr,

      nguoiTrinh: 'Nguyễn Minh Anh',
      thoiGianTrinh: `${todayStr} ${timeStr}`,
      yKienCanBo: data.yKienTrinhLanhDao || 'Kính trình Lãnh đạo xem xét, phê duyệt Tờ trình đề xuất thụ lý và ban hành Quyết định thụ lý giải quyết theo quy định.',

      // Luồng ký tuần tự: Lãnh đạo được chọn -> Chánh Thanh tra
      signers: [
        {
          id: leader.id,
          name: leader.name,
          chucVu: leader.chucVu,
          coQuan: leader.coQuan,
          vaiTro: 'ky',
          thuTu: 1,
          status: 'cho_ky',
        },
        {
          id: 'ld-05',
          name: 'Đ/c Đặng Quốc Bảo',
          chucVu: 'Chánh Thanh tra thành phố',
          coQuan: 'Ban Lãnh đạo Thanh tra',
          vaiTro: 'ky',
          thuTu: 2,
          status: 'chua_den_luot',
        },
      ],
      currentSignerIndex: 0,
      lanhDaoId: leader.id,
      lanhDaoName: leader.name,
      lanhDaoChucVu: leader.chucVu,

      status: 'da_trinh',
      hanXuLy: data.hanXuLy || '24 giờ',
      mucDoUuTien: data.mucDoUuTien || 'khan',

      tepDinhKem: [
        { id: 'att-1', tenTep: `To_trinh_thu_ly_${dynamicCode}.docx`, dungLuong: '1.8 MB', loai: 'du_thao' },
        { id: 'att-2', tenTep: `Du_thao_Quyet_dinh_thu_ly_${dynamicCode}.docx`, dungLuong: '1.2 MB', loai: 'du_thao' },
        { id: 'att-3', tenTep: `Don_to_cao_scan_${dynamicCode}.pdf`, dungLuong: '4.6 MB', loai: 'chung_cu' },
      ],

      phienBanHienTai: 'V1',
      versionHistory: [
        {
          version: 'V1',
          thoiGian: `${todayStr} ${timeStr}`,
          nguoiTao: 'Nguyễn Minh Anh',
          trangThaiLucDo: 'Khởi tạo và trình ký',
          ghiChu: 'Tờ trình Mẫu số 01 kèm dự thảo Quyết định',
          noiDungSnapshot: 'Khởi tạo tờ trình',
        },
      ],

      history: [
        {
          id: `h-${Date.now()}`,
          time: `${todayStr} ${timeStr}`,
          actor: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
          action: 'Lập Tờ trình và chuyển vào Luồng trình ký',
          note: data.yKienTrinhLanhDao || 'Kính trình Lãnh đạo xem xét phê duyệt.',
          signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
        },
      ],

      auditLogs: [
        {
          id: `al-${Date.now()}`,
          time: `${todayStr} ${timeStr}`,
          actor: 'Nguyễn Minh Anh',
          actorRole: 'Cán bộ thụ lý',
          action: 'Trình văn bản',
          statusBefore: 'nhap',
          statusAfter: 'da_trinh',
          version: 'V1',
          note: `Trình Lãnh đạo ${leader.name} phê duyệt Tờ trình`,
          signatureCert: 'VGCA - Ban Cơ yếu Chính phủ',
        },
      ],

      stepId: 'STEP-03A',
    };

    onCreateSigningDocument?.(newDoc);
    setActiveSigningDoc(newDoc);
    setShowSigningDocModal(true);

    showToast(
      `✓ Đã lập Tờ trình (${newDoc.soKyHieu}) đề xuất thụ lý ${dynamicCode} và liên kết trực tiếp vào hồ sơ đơn!`
    );

    onAcceptAndProcess?.({
      id: dynamicCode,
      code: dynamicCode,
      title: extractData.noiDungTomTat || luotNhan?.noiDung || `Hồ sơ ${dynamicCode}`,
      luotNhanId: luotNhan?.id || 'LN-2025-0105',
      nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
      ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:30',
      loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
      type: 'ĐƠN THỤ LÝ',
      statusBadge: 'Đang trình ký thụ lý',
      baoCaoThuLy: data,
    });
  };

  const handleConfirmBanGiao = () => {
    setShowBanGiaoModal(true);
  };

  const handleConfirmTraLai = () => {
    setShowTraLaiModal(true);
  };

  const handleXacMinhSelectHuong = (huong: HuongGiaiQuyetType | 'quy_trinh') => {
    setShowXacMinhModal(false);
    if (huong === 'thu_ly') {
      setShowThuLyModal(true);
    } else if (huong === 'yeu_cau_bo_sung') {
      setShowBoSungModal(true);
    } else if (huong === 'khong_thu_ly') {
      setShowKhongThuLyModal(true);
    } else if (huong === 'ban_giao') {
      setShowBanGiaoModal(true);
    } else if (huong === 'tra_lai') {
      setShowTraLaiModal(true);
    } else {
      onNav('quy-trinh-xu-ly');
    }
  };

  const handleKhongThuLySubmit = (data: {
    soKyHieu: string;
    ngayBanHanh: string;
    lyDoChinh: string;
    lyDoChiTiet: string;
    canCuPhapLy: string;
    nguoiNhan: string;
    nguoiKy: string;
  }) => {
    setShowKhongThuLyModal(false);
    setCurrentLuotNhanStatus('khong_thu_ly');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'khong_thu_ly' });
    showToast(`✓ Đã ban hành ${data.soKyHieu} - Thông báo không thụ lý giải quyết đơn (KẾT THÚC ĐƠN).`);
    setTimeout(() => {
      onNav('don-tiep-nhan');
    }, 1200);
  };

  const handleBoSungSubmit = (soHieu: string, danhSachBoSung: string[]) => {
    setShowBoSungModal(false);
    setCurrentLuotNhanStatus('cho_bo_sung');
    onUpdateLuotNhan?.({ ...luotNhan, status: 'cho_bo_sung' });
    showToast(`✓ Đã ban hành ${soHieu} - Yêu cầu bổ sung ${danhSachBoSung.length} tài liệu gửi công dân (Thời hạn 10 ngày).`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] text-[#1e293b] font-body-md overflow-hidden select-none">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}
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

          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-600">
            <span className="font-semibold text-slate-300">Hướng xử lý:</span>
            <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-600">
              <button
                type="button"
                onClick={() => {
                  setCurrentLuotNhanStatus('cho_chuyen');
                  showToast('Chuyển sang: Chưa có hướng xử lý (Hiển thị các nút Ghép đơn & Tiếp nhận đơn).');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${!hasDeterminedHuongXuLy
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
                  }`}
                title="Hồ sơ chưa có hướng xử lý: Hiển thị các nút để cán bộ thao tác"
              >
                <span className="material-symbols-outlined text-[13px]">pending</span>
                <span>Chưa có hướng</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentLuotNhanStatus('da_chuyen');
                  showToast('Đã tiếp nhận tạo đơn thành công. Đang chuyển sang màn chi tiết đơn...');
                  setTimeout(() => handleGoToChiTietDon(), 350);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${hasDeterminedHuongXuLy
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
                  }`}
                title="Hồ sơ đã xác định hướng xử lý: Tiếp nhận và chuyển sang màn chi tiết đơn"
              >
                <span className="material-symbols-outlined text-[13px]">task_alt</span>
                <span>Đã xác định hướng</span>
              </button>
            </div>
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
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => onNav('cong-viec')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              title="Quay lại Bàn làm việc Công việc của tôi"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Công việc của tôi</span>
            </button>
            <span className="text-slate-300">/</span>
            <button
              type="button"
              onClick={() => onNav('nhan-don-list')}
              className="text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
            >
              Tiếp nhận đơn
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">Chi tiết lượt nhận</span>
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-slate-900 font-headline-md tracking-tight">
              Chi tiết lượt nhận: {luotNhan?.id ? luotNhan.id : 'LN-2025-0105'}
            </h1>

            {luotNhan?.id?.includes('LN-58') || extractData.dauHieu?.includes('OCR báo lỗi') ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-rose-600">error</span>
                <span>Module OCR bị lỗi (Tài liệu scan mờ/nghiêng)</span>
              </span>
            ) : aiState === 'none' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-slate-500">edit_note</span>
                <span>Xử lý thủ công theo ghi chú (Không chạy OCR - BR-09)</span>
              </span>
            ) : aiState === 'reading' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[11.5px] font-semibold font-label-technical animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin text-amber-600">
                  sync
                </span>
                <span>AI phân tích: Bước {aiStepIndex}/6 ({AI_PIPELINE_STEPS_6[aiStepIndex - 1]?.title}) ({readingProgress}%)</span>
              </span>
            ) : (luotNhan?.id?.includes('0430') || extractData.dauHieu.includes('68%')) ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-300 text-[11.5px] font-semibold font-label-technical">
                <span className="material-symbols-outlined text-[14px] text-orange-600">warning</span>
                <span>AI cần kiểm tra (Độ tin cậy 68%)</span>
              </span>
            ) : null}
          </div>

          {/* Meta Attributes */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5 font-normal">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
              <span>Ngày nhận:</span>
              <strong className="text-slate-700 font-label-technical">{luotNhan?.ngayNhan || '15/09/2026 10:24'}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Hình thức:</span> <strong className="text-slate-700">{luotNhan?.hinhThuc || 'Trực tiếp'}</strong>
            </div>
            {/* <div>
              <span>Người gửi/nộp:</span> <strong className="text-slate-800 font-semibold">{extractData.nguoiGui || luotNhan?.nguoiNop}</strong>
            </div> */}

          </div>
        </div>

        {/* Action Controls Top-Right */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* BR-03: Thao tác theo tiến trình quy trình nghiệp vụ đã cấu hình */}
          {currentLuotNhanStatus === 'da_chuyen' ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* NÚT VỀ MÀN HÌNH CHI TIẾT ĐƠN */}
              <button
                type="button"
                onClick={handleGoToChiTietDon}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs"
                title="Chuyển sang màn hình chi tiết đơn tiếp nhận"
              >
                <span className="material-symbols-outlined text-[17px] text-[#004ac6]">description</span>
                <span>Màn chi tiết đơn</span>
              </button>

              {/* NÚT CHÍNH: BƯỚC TIẾP THEO THEO QUY TRÌNH: XÁC MINH THÔNG TIN & ĐỀ XUẤT HƯỚNG XỬ LÝ */}
              <button
                type="button"
                onClick={handleGoToChiTietDon}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
                title="Chuyển đến màn chi tiết đơn để xác minh thông tin & đề xuất hướng xử lý"
              >
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
                <span>Xác minh thông tin &amp; Đề xuất hướng xử lý ➔</span>
              </button>
            </div>
          ) : currentLuotNhanStatus === 'da_thu_ly' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>
                  Đã lập Tờ trình {activeSigningDoc?.soKyHieu ? `(${activeSigningDoc.soKyHieu})` : ''} •{' '}
                  {activeSigningDoc?.status === 'da_ky' ? 'Đã ký duyệt' : 'Đang trình ký'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowThuLyModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold shadow-2xs cursor-pointer transition-all"
                title="Xem lại bản in A4 Mẫu 01"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Bản in A4 Mẫu 01</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!activeSigningDoc && linkedSigningDoc) {
                    setActiveSigningDoc(linkedSigningDoc);
                  }
                  setShowSigningDocModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                title="Xem văn bản Tờ trình & Luồng trình ký gắn với đơn này"
              >
                <span className="material-symbols-outlined text-[16px]">draw</span>
                <span>Văn bản trình ký của đơn ➔</span>
              </button>
            </div>
          ) : currentLuotNhanStatus === 'da_ban_giao' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-amber-600">swap_horiz</span>
                <span>Đã bàn giao</span>
              </span>
              <button
                type="button"
                onClick={() => setShowBanGiaoModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <span>Xem biên bản bàn giao</span>
              </button>
            </div>
          ) : currentLuotNhanStatus === 'da_ghep' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-300 text-xs font-bold shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-indigo-600">merge_type</span>
              <span>Đã ghép vào {selectedGhepDonCode}</span>
            </span>
          ) : currentLuotNhanStatus === 'da_tra_lai' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[16px] text-rose-600">assignment_return</span>
                <span>Đã trả lại</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTraLaiModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <span>Xem văn bản trả lại</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenChuyenModal}
              disabled={aiState === 'reading'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Chuyển tiếp nhận và xử lý (BR-03, BR-04, BR-05)"
            >
              <span className="material-symbols-outlined text-[17px]">forward_to_inbox</span>
              <span>Chuyển tiếp nhận và xử lý</span>
            </button>
          )}

          {/* <button
            type="button"
            onClick={() => showToast('Đang tải xuống tài liệu đơn...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
            <span>Tải xuống</span>
          </button> */}
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
          {/* Header Khu vực Tài liệu được tải lên */}
          <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-[#004ac6]">description</span>
              <h2 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                Tài liệu được tải lên ({currentFiles.length} tệp)
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[220px]" title={activeFile?.name}>
                #{selectedFileIndex + 1}: {activeFile?.name}
              </span>
              {aiState === 'reading' && (
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                  Đang quét OCR...
                </span>
              )}
            </div>
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
                  {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
                    ? 'ĐƠN ĐỀ NGHỊ CẤP GIẤY PHÉP XÂY DỰNG'
                    : extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị'
                      ? 'ĐƠN PHẢN ÁNH KIẾN NGHỊ'
                      : 'ĐƠN TỐ GIÁC'}
                </h3>
                {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng' && (
                  <p className="text-[10.5px] italic text-slate-600">(Công trình: Nhà ở riêng lẻ đô thị - 5 tầng + 1 lửng)</p>
                )}
                {extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị' && (
                  <p className="text-[10.5px] italic text-slate-600">(V/v: Cơ sở tái chế phế liệu xả khói bụi và tiếng ồn ban đêm)</p>
                )}
              </div>

              {/* Kính gửi */}
              <p className="font-semibold text-slate-900">
                Kính gửi:{' '}
                <span className="font-normal text-slate-800">
                  {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng'
                    ? 'Ủy ban nhân dân Quận Ba Đình - Phòng Quản lý Đô thị'
                    : extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị'
                      ? 'Ủy ban nhân dân Quận Cầu Giấy - Phòng Tài nguyên và Môi trường'
                      : 'Cơ quan Cảnh sát điều tra Công an thành phố Hà Nội'}
                </span>
              </p>

              {/* Thông tin người làm đơn */}
              <div className="space-y-1 pt-0.5 border-b border-slate-200/60 pb-2">
                <p>
                  <strong>1. Người làm đơn: </strong>
                  <span
                    className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'nguoiGui' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    {extractData.nguoiGui}
                  </span>{' '}
                  (Sinh năm: {extractData.namSinh} | CCCD:{' '}
                  <span
                    className={`font-label-technical px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'cccd' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    {extractData.cccd}
                  </span>
                  )
                </p>
                <p>
                  Địa chỉ thường trú:{' '}
                  <span
                    className={`px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaChi' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                      }`}
                  >
                    {extractData.diaChi}
                  </span>{' '}
                  | SĐT: <span className="font-label-technical">{extractData.sdt}</span>
                </p>
                {extractData.dongNguoiGui && extractData.dongNguoiGui !== 'Không có' && (
                  <p>
                    <strong>2. Người cùng đứng đơn / Đồng sở hữu: </strong>
                    <span className="font-semibold text-slate-900">{extractData.dongNguoiGui}</span> (CCCD:{' '}
                    <span className="font-label-technical">{extractData.cccdDongNguoiGui}</span>)
                  </p>
                )}
                {extractData.luatSu && extractData.luatSu !== 'Không có' && (
                  <p>
                    <strong>3. Người đại diện theo ủy quyền: </strong>
                    <span className="font-semibold text-purple-900">{extractData.luatSu}</span> (Thẻ LS:{' '}
                    <span className="font-label-technical">{extractData.theLuatSu}</span>)
                  </p>
                )}
              </div>

              {/* HỘP CẢNH BÁO / KẾT QUẢ AI PHÂN TÍCH */}
              {extractData.loaiNoiDung === 'Hồ sơ cấp phép xây dựng' && (
                <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-300 text-[11px] text-orange-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-orange-900">
                    <span className="material-symbols-outlined text-[15px] text-orange-600">warning</span>
                    <span>AI PHÂN TÍCH &amp; CẢNH BÁO (Độ tin cậy 68%):</span>
                  </div>
                  <p className="leading-relaxed">
                    Đối soát với CSDL Quy hoạch &amp; bản đồ chỉ giới: Bản vẽ hiện trạng có dấu hiệu chồng lấn <strong>0.35m</strong> với chỉ giới ngõ đi chung. Cần cán bộ kiểm tra thực địa trước khi tiếp nhận.
                  </p>
                </div>
              )}

              {extractData.loaiNoiDung === 'Đơn phản ánh kiến nghị' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-900">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                    <span>AI ĐÃ PHÂN TÍCH &amp; BÓC TÁCH (Độ tin cậy 94%):</span>
                  </div>
                  <p className="leading-relaxed">
                    Đã bóc tách tự động hành vi phản ánh về môi trường tiếng ồn và khí thải. Đối tượng liên quan: {extractData.doiTuong}.
                  </p>
                </div>
              )}

              {extractData.loaiNoiDung !== 'Hồ sơ cấp phép xây dựng' && extractData.loaiNoiDung !== 'Đơn phản ánh kiến nghị' && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-blue-900">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">smart_toy</span>
                    <span>AI ĐÃ PHÂN TÍCH VĂN BẢN (Độ tin cậy 92%):</span>
                  </div>
                  <p className="leading-relaxed">
                    Đã trích xuất tự động thông tin người gửi, đối tượng liên quan và các yêu cầu cụ thể của người gửi đơn.
                  </p>
                </div>
              )}

              {/* Nội dung chi tiết */}
              <div className="space-y-1 pt-1 text-justify leading-relaxed">
                <p>
                  <strong>Nội dung trình bày: </strong>
                  {extractData.noiDungTomTat}
                </p>
                <div className="p-2 rounded bg-slate-100/70 border border-slate-200/80 space-y-1">
                  <p>
                    • <strong>Đối tượng liên quan: </strong>
                    <span
                      className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'doiTuong' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                        }`}
                    >
                      {extractData.doiTuong}
                    </span>
                  </p>
                  <p>
                    • <strong>Địa điểm phát sinh: </strong>
                    <span
                      className={`font-semibold text-slate-900 px-1 py-0.5 rounded transition-colors ${activeHighlightKey === 'diaDiem' ? 'bg-amber-200 ring-2 ring-amber-400' : ''
                        }`}
                    >
                      {extractData.diaDiem}
                    </span>
                  </p>
                </div>
              </div>

              {/* Yêu cầu */}
              <div className="space-y-1 pt-1">
                <p className="font-semibold text-slate-900">Kính đề nghị Quý Cơ quan xem xét, giải quyết:</p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 text-slate-700">
                  <li>{extractData.yeuCau1}</li>
                  <li>{extractData.yeuCau2}</li>
                  <li>{extractData.yeuCau3}</li>
                </ol>
              </div>

              <p className="italic text-slate-600 pt-1 text-[11px]">
                Tôi/Chúng tôi xin cam đoan những nội dung trên là đúng sự thật và chịu trách nhiệm trước pháp luật về nội dung đơn thư của mình.
              </p>

              {/* Chữ ký */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">Cán bộ một cửa tiếp nhận sơ bộ</p>
                  <div className="h-7 flex items-center justify-center italic text-slate-600 font-script text-sm">
                    NguyenMinhAnh
                  </div>
                  <p className="font-semibold text-slate-700">Nguyễn Minh Anh</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800">Người làm đơn</p>
                  <div className="h-7 flex items-center justify-center italic text-blue-900 font-script text-sm">
                    {extractData.nguoiGui.replace(/\s+/g, '')}
                  </div>
                  <p className="font-semibold text-slate-900">{extractData.nguoiGui}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách tệp tài liệu đã tải lên với số thứ tự #1, #2... */}
          <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">
                  Danh sách tài liệu đã tải lên ({currentFiles.length})
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (Bấm tệp để xem trước)
                </span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Mở hộp thoại tải lên thêm tài liệu chứng cứ kèm theo...')}
                className="text-[11.5px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>+ Thêm tài liệu</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {currentFiles.map((f, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedFileIndex(idx);
                    showToast(`Đang mở: ${f.name}`);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedFileIndex === idx
                      ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                      picture_as_pdf
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-800 truncate" title={f.name}>
                        {f.name}
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {f.size} • {f.category === 'main' ? 'Tài liệu chính' : 'Tài liệu kèm theo'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded shrink-0 ml-1">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* BÊN PHẢI: THÔNG TIN LƯỢT NHẬN & CÁC KHỐI PHÂN TÍCH (54% Width)           */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="w-[54%] flex flex-col h-full overflow-y-auto space-y-3.5 pr-1">
          {/* =================================================================== */}
          {/* KHỐI ①: THÔNG TIN LƯỢT NHẬN CHI TIẾT                                */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[19px] text-[#004ac6]">assignment</span>
                <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                  Thông tin lượt nhận &amp; Người nộp đơn
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentLuotNhanStatus === 'da_chuyen' ? 'Đã chuyển tiếp nhận' : 'Mới tiếp nhận'}
                </span>
              </div>
            </div>

            {/* Grid thông tin chi tiết */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Mã lượt nhận</span>
                <span className="font-bold text-[#004ac6] text-[13px]">{luotNhan?.id || 'LN-2025-0105'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Thời gian tiếp nhận</span>
                <span className="font-semibold text-slate-800 text-[12.5px]">{luotNhan?.ngayNhan || '16/09/2026 09:30'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Hình thức nhận</span>
                <span className="font-semibold text-slate-800 text-[12.5px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {luotNhan?.hinhThuc || 'Trực tiếp'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Người đứng đơn</span>
                <span className="font-bold text-slate-900 text-[13px]">{luotNhan?.nguoiNop || extractData.nguoiGui || 'Vũ Thị Thanh'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Số CCCD / Mã số</span>
                <span className="font-semibold text-slate-800 text-[12.5px]">{luotNhan?.cccd || extractData.cccd || '001088012345'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Số điện thoại</span>
                <span className="font-semibold text-slate-800 text-[12.5px]">{luotNhan?.sdt || extractData.sdt || '0983 123 456'}</span>
              </div>

              <div className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Địa chỉ liên hệ</span>
                <span className="font-semibold text-slate-800 text-[12.5px]">
                  {luotNhan?.diaChi || extractData.diaChi || 'Quận Ba Đình, TP. Hà Nội'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block mb-0.5">Đơn vị & Cán bộ tiếp nhận</span>
                <span className="font-semibold text-slate-800 text-[12.5px]">
                  {luotNhan?.donVi || 'Phòng Tiếp công dân & Xử lý đơn'} • Cán bộ: Nguyễn Minh Anh
                </span>
              </div>

              <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-blue-700 font-bold uppercase tracking-tight">
                    Nội dung đơn & Ghi chú tiếp nhận
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    {currentFiles.length} tệp tài liệu
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-800 font-normal leading-relaxed">
                  {luotNhan?.noiDung || luotNhan?.ghiChu || extractData.noiDungTomTat}
                </p>
                {luotNhan?.ghiChu && luotNhan.ghiChu !== luotNhan.noiDung && (
                  <p className="text-[11.5px] text-slate-500 italic mt-1 pt-1 border-t border-blue-100">
                    Ghi chú cán bộ: {luotNhan.ghiChu}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* =================================================================== */}
          {/* KHỐI ②: THÔNG TIN TRÍCH XUẤT TỪ ĐƠN (AI)                           */}
          {/* =================================================================== */}
          <div className={`bg-white rounded-2xl border ${isEditingExtract ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200/90 shadow-2xs'} p-4 space-y-3 transition-all`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
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
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${extractData.loaiNoiDung === ld
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">description</span>
                <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                  Kết quả tra cứu trong hệ thống
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AI đã đối soát 2 nguồn dữ liệu
                </span>
              </div>
              <button
                type="button"
                onClick={() => openNguonTraCuu('nguoi-gui')}
                className="text-[11px] text-rose-800 hover:text-rose-900 hover:bg-rose-50 font-medium flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-rose-200/80 shadow-2xs transition-all"
              >
                <span>Xem nguồn thông tin gốc</span>
                <span className="text-rose-700">→</span>
              </button>
            </div>

            {/* 3 Thẻ kết quả tóm tắt */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Thẻ 1: Lịch sử người gửi */}
              <div
                onClick={() => openNguonTraCuu('nguoi-gui')}
                className="p-3.5 rounded-2xl bg-[#fcf8f0] border border-[#f4edd9] hover:border-amber-300 hover:bg-[#faf4e6] transition-all flex items-start gap-2.5 relative cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f6ecda] text-[#a1712a] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[17px]">badge</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-600 block leading-tight">
                    Lịch sử người gửi
                  </span>
                  <div className="text-[24px] font-bold text-slate-900 font-headline-md leading-none my-1">
                    6
                  </div>
                  <p className="text-[10.5px] text-slate-500">6 đơn đã gửi trước đây</p>
                </div>
              </div>

              {/* Thẻ 2: Đơn tương tự */}
              <div
                onClick={() => openNguonTraCuu('don-tuong-tu')}
                className="p-3.5 rounded-2xl bg-[#fff5f5] border border-[#fcdede] hover:border-rose-300 hover:bg-[#ffebeb] transition-all flex items-start gap-2.5 relative cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[17px]">description</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-600 block leading-tight">
                    Đơn tương tự
                  </span>
                  <div className="text-[24px] font-bold text-slate-900 font-headline-md leading-none my-1">
                    6
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    6 đơn có nội dung tương tự
                  </p>
                  <p className="text-[10.5px] text-[#b91c1c] font-bold mt-0.5">
                    Có 4 đơn trùng
                  </p>
                </div>
              </div>

              {/* Thẻ 3: Vụ việc liên quan */}
              <div
                onClick={() => openNguonTraCuu('vu-viec')}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-start gap-2.5 relative cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#b91c1c] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[17px]">folder</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-slate-600 block leading-tight">
                    Vụ việc liên quan
                  </span>
                  <div className="text-[24px] font-bold text-slate-900 font-headline-md leading-none my-1">
                    0
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    0 vụ việc đang xử lý
                  </p>
                </div>
              </div>
            </div>


          </div>

          {/* =================================================================== */}
          {/* GỢI Ý HƯỚNG XỬ LÝ (2 ĐỀ XUẤT: GHÉP VÀO ĐƠN HOẶC TIẾP NHẬN)          */}
          {/* =================================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💡</span>
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight font-headline-md">
                  Gợi ý hướng xử lý
                </h3>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${hasDeterminedHuongXuLy
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                : 'text-slate-500'
                }`}>
                {hasDeterminedHuongXuLy ? '✓ Đã xác định hướng xử lý' : '4 đề xuất nghiệp vụ'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Card 1: Ghép vào đơn */}
              <div
                onClick={() => {
                  if (hasDeterminedHuongXuLy) return;
                  setHuongXuLy('ghep');
                  setOfficerNote(
                    `Gói này giống hồ sơ ${selectedGhepDonCode} đang mở – ghép vào đó không sinh đơn mới, không tốn số`
                  );
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${hasDeterminedHuongXuLy
                  ? currentLuotNhanStatus === 'da_ghep'
                    ? 'border-[#a61c1c] bg-[#fffaf9] shadow-2xs ring-1 ring-[#a61c1c]/30 cursor-default'
                    : 'border-slate-200 bg-slate-50/50 opacity-60 cursor-default'
                  : huongXuLy === 'ghep'
                    ? 'border-[#a61c1c] bg-[#fffaf9] shadow-2xs ring-1 ring-[#a61c1c]/30 cursor-pointer'
                    : 'border-[#a61c1c]/60 bg-white hover:border-[#a61c1c] cursor-pointer'
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Ghép vào đơn
                    </h4>
                    {hasDeterminedHuongXuLy && currentLuotNhanStatus === 'da_ghep' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#a61c1c] text-white text-[10px] font-bold">
                        ✓ Hướng đã chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Gói này giống hồ sơ {selectedGhepDonCode} đang mở – ghép vào đó không sinh đơn mới, không tốn số
                  </p>
                </div>

              </div>

              {/* Card 2: Tiếp nhận — chạy workflow theo loại đơn */}
              <div
                onClick={() => {
                  if (hasDeterminedHuongXuLy) return;
                  setHuongXuLy('tiep-nhan');
                  setOfficerNote(
                    'Hồ sơ phát sinh mới, không trùng lặp. Đề xuất tiếp nhận tạo Đơn mới để chuyển tiếp sang quy trình thụ lý giải quyết theo quy định.'
                  );
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${hasDeterminedHuongXuLy
                  ? currentLuotNhanStatus === 'da_chuyen' || currentLuotNhanStatus === 'da_thu_ly'
                    ? 'border-[#004ac6] bg-blue-50/50 shadow-2xs ring-1 ring-[#004ac6]/30 cursor-default'
                    : 'border-slate-200 bg-slate-50/50 opacity-60 cursor-default'
                  : huongXuLy === 'tiep-nhan'
                    ? 'border-[#004ac6] bg-blue-50/50 shadow-2xs ring-1 ring-[#004ac6]/30 cursor-pointer'
                    : 'border-slate-200 bg-white hover:border-[#004ac6] cursor-pointer'
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Tiếp nhận — {extractData.loaiNoiDung || 'Đơn tố cáo trong tố tụng hình sự'}
                    </h4>
                    {hasDeterminedHuongXuLy && (currentLuotNhanStatus === 'da_chuyen' || currentLuotNhanStatus === 'da_thu_ly') && (
                      <span className="px-2 py-0.5 rounded-full bg-[#004ac6] text-white text-[10px] font-bold">
                        ✓ Hướng đã chọn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Hồ sơ đủ điều kiện tiếp nhận ban đầu theo thẩm quyền; lập mã đơn điện tử và chạy workflow theo loại đơn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-[14px] font-bold text-slate-900 tracking-tight font-headline-md">
                6. Ý kiến của cán bộ tiếp nhận
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span>Hướng đang chọn:</span>
                <span className="font-bold text-slate-800 uppercase font-mono">
                  {huongXuLy === 'tiep-nhan'
                    ? '1. Tiếp nhận (Tạo Đơn mới)'
                    : huongXuLy === 'ghep'
                      ? `2. Ghép vào đơn ${selectedGhepDonCode}`
                      : huongXuLy === 'yeu-cau-bo-sung'
                        ? '3. Yêu cầu bổ sung tài liệu'
                        : '4. Không thụ lý giải quyết'}
                </span>
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Nhập ý kiến đề xuất xử lý của cán bộ..."
                maxLength={500}
                className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-[13.5px] font-normal text-slate-800 placeholder:text-slate-400 placeholder:text-[12.5px] focus:outline-none focus:bg-white focus:border-blue-500 transition-all resize-none leading-relaxed"
              />
              <div className="flex justify-end pt-1">
                <span className="text-[11px] text-slate-400 font-mono">
                  {officerNote.length}/500
                </span>
              </div>
            </div>

            {/* Nhóm các nút hành động */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => showToast('Đã lưu tạm ý kiến cán bộ tiếp nhận.')}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[13.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">save</span>
                <span>Lưu nháp</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {!hasDeterminedHuongXuLy ? (
                  <>
                    {huongXuLy === 'ghep' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setHuongXuLy('tiep-nhan');
                            setOfficerNote('Hồ sơ phát sinh mới, không trùng lặp. Đề xuất tiếp nhận tạo Đơn mới để chuyển tiếp sang quy trình thụ lý giải quyết theo quy định.');
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 active:scale-95 text-[13.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Chuyển sang hướng Tiếp nhận (Tạo Đơn mới)"
                        >
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">add_circle</span>
                          <span>Đổi sang Tiếp nhận</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowGhepModal(true)}
                          className="px-4.5 py-2.5 rounded-xl bg-[#a61c1c] hover:bg-[#8b1414] active:scale-95 text-white text-[13.5px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">merge_type</span>
                          <span>Xác nhận ghép vào {selectedGhepDonCode}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setHuongXuLy('ghep');
                            setOfficerNote(`Gói này giống hồ sơ ${selectedGhepDonCode} đang mở – ghép vào đó không sinh đơn mới, không tốn số`);
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 active:scale-95 text-[13.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Chuyển sang hướng Ghép đơn đã có"
                        >
                          <span className="material-symbols-outlined text-[15px] text-indigo-600">merge_type</span>
                          <span>Đổi sang Ghép đơn</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowSubmitModal(true)}
                          className="px-4.5 py-2.5 rounded-xl bg-[#a61c1c] hover:bg-[#8b1414] active:scale-95 text-white text-[13.5px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">task_alt</span>
                          <span>Tiếp nhận (Tạo Đơn mới)</span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleGoToChiTietDon}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:shadow-xs active:scale-95 ${currentLuotNhanStatus === 'da_chuyen'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : currentLuotNhanStatus === 'da_ghep'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100'
                          : currentLuotNhanStatus === 'da_ban_giao'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                      title="Bấm để mở màn chi tiết đơn"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {currentLuotNhanStatus === 'da_chuyen'
                          ? 'check_circle'
                          : currentLuotNhanStatus === 'da_ghep'
                            ? 'merge_type'
                            : currentLuotNhanStatus === 'da_ban_giao'
                              ? 'swap_horiz'
                              : 'assignment_return'}
                      </span>
                      <span>
                        {currentLuotNhanStatus === 'da_chuyen'
                          ? 'Đã tiếp nhận tạo Đơn'
                          : currentLuotNhanStatus === 'da_ghep'
                            ? `Đã ghép vào ${selectedGhepDonCode}`
                            : currentLuotNhanStatus === 'da_ban_giao'
                              ? 'Đã bàn giao'
                              : 'Đã trả lại'}
                      </span>
                    </button>

                    {currentLuotNhanStatus === 'da_chuyen' && (
                      <button
                        type="button"
                        onClick={handleGoToChiTietDon}
                        className="px-3.5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                        title="Chuyển sang màn hình chi tiết đơn"
                      >
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        <span>Màn chi tiết đơn</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentLuotNhanStatus('cho_chuyen');
                        showToast('Đã mở lại chế độ để cán bộ chọn lại hướng xử lý.');
                      }}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
                      title="Mở lại chế độ chọn hướng xử lý"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Đổi hướng</span>
                    </button>
                  </div>
                )}
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
      {/* MODAL BÀN GIAO ĐƠN (STEP-03C)                                             */}
      {/* ========================================================================= */}
      <BanGiaoDonModal
        isOpen={showBanGiaoModal}
        onClose={() => setShowBanGiaoModal(false)}
        onSubmit={handleBanGiaoModalSubmit}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn đề xuất giải quyết vụ việc',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
          suggestedDeptId: 'pc03',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL TRẢ LẠI ĐƠN (STEP-03D)                                              */}
      {/* ========================================================================= */}
      <TraLaiDonModal
        isOpen={showTraLaiModal}
        onClose={() => setShowTraLaiModal(false)}
        onSubmit={handleTraLaiModalSubmit}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tiếp nhận',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn đề xuất giải quyết vụ việc',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
          hinhThucTiepNhan: luotNhan?.hinhThuc || 'Trực tiếp tại cơ quan',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL BƯỚC 2: XÁC MINH THÔNG TIN & ĐỀ XUẤT HƯỚNG XỬ LÝ (THEO QUY TRÌNH)  */}
      {/* ========================================================================= */}
      <XacMinhVaDeXuatModal
        isOpen={showXacMinhModal}
        onClose={() => setShowXacMinhModal(false)}
        onSelectHuongXuLy={handleXacMinhSelectHuong}
        onNav={onNav}
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo hành vi vi phạm pháp luật',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL THỤ LÝ ĐƠN - BÁO CÁO ĐỀ XUẤT THỤ LÝ (MẪU SỐ 01/TT-TTCP)            */}
      {/* ========================================================================= */}
      <ThuLyDonModal
        isOpen={showThuLyModal}
        onClose={() => setShowThuLyModal(false)}
        onSubmit={handleThuLyModalSubmit}
        onNav={onNav}
        currentOfficerName="Nguyễn Minh Anh"
        currentDepartmentName="Phòng Tiếp công dân & Xử lý đơn"
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo hành vi vi phạm pháp luật',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL KHÔNG THỤ LÝ ĐƠN (ĐIỀU 29 LUẬT TỐ CÁO)                             */}
      {/* ========================================================================= */}
      <KhongThuLyModal
        isOpen={showKhongThuLyModal}
        onClose={() => setShowKhongThuLyModal(false)}
        onSubmit={handleKhongThuLySubmit}
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          luotNhanId: luotNhan?.id || 'LN-2026-0819',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          cccd: extractData.cccd || '001088012345',
          sdt: extractData.sdt || '0983 123 456',
          diaChi: extractData.diaChi || luotNhan?.diaChi || 'Cầu Giấy, Hà Nội',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố cáo',
          noiDung: extractData.noiDungTomTat || luotNhan?.noiDung || 'Tố cáo hành vi vi phạm pháp luật',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026',
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL YÊU CẦU BỔ SUNG TÀI LIỆU / THÔNG TIN (HẠN 10 NGÀY)                  */}
      {/* ========================================================================= */}
      <ThongBaoBoSungModal
        isOpen={showBoSungModal}
        onClose={() => setShowBoSungModal(false)}
        onSuccess={handleBoSungSubmit}
        workflow={currentWf}
        donCode={luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125'}
        donTitle={extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn tố cáo'}
        nguoiNop={extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A'}
        loaiDon={extractData.loaiNoiDung || 'Đơn tố cáo'}
      />

      {/* ========================================================================= */}
      {/* MODAL TIẾP NHẬN ĐƠN (BR-16, BR-17, BR-18)                                 */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-[#004ac6] flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận tiếp nhận đơn</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Mã đơn: {luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125'} • Lượt nhận: {luotNhan?.id || 'LN-2025-0819'}
                </p>
              </div>
            </div>

            {/* BR-16: Lựa chọn phương thức xử lý */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Phương thức xử lý (BR-16):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setTiepNhanHuong('tu_xu_ly')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${tiepNhanHuong === 'tu_xu_ly'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tiepNhanHuong"
                      checked={tiepNhanHuong === 'tu_xu_ly'}
                      onChange={() => setTiepNhanHuong('tu_xu_ly')}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-xs text-slate-900">Tự xử lý (BR-17)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Thụ lý trực tiếp và chuyển vào workflow nghiệp vụ loại đơn
                  </p>
                </div>

                <div
                  onClick={() => setTiepNhanHuong('phan_cong')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${tiepNhanHuong === 'phan_cong'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tiepNhanHuong"
                      checked={tiepNhanHuong === 'phan_cong'}
                      onChange={() => setTiepNhanHuong('phan_cong')}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-xs text-slate-900">Phân công (BR-18)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-5">
                    Giao Task cho cán bộ chuyên môn khác thụ lý
                  </p>
                </div>
              </div>
            </div>

            {tiepNhanHuong === 'phan_cong' && (
              <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cán bộ nhận xử lý <span className="text-red-500">*</span> (BR-18):
                  </label>
                  <select
                    value={selectedOfficerForPhanCong}
                    onChange={(e) => setSelectedOfficerForPhanCong(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="">-- Chọn cán bộ thụ lý --</option>
                    {OFFICERS.filter((o) => o.departmentId === 'tiep-dan').map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} - {o.role} (Đang xử lý: {o.workloadCount} đơn)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chỉ đạo / Ghi chú phân công:
                  </label>
                  <textarea
                    rows={2}
                    value={ghiChuPhanCong}
                    onChange={(e) => setGhiChuPhanCong(e.target.value)}
                    placeholder="Chỉ đạo tiến độ hoặc định hướng thụ lý..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>
              </div>
            )}

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Người gửi:</span>
                <strong className="text-slate-900 text-right">{extractData.nguoiGui || luotNhan?.nguoiNop || 'Công dân'}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 shrink-0">Phân loại đơn:</span>
                <strong className="text-slate-900 text-right">{extractData.loaiNoiDung || 'Đơn tiếp nhận hành chính'}</strong>
              </div>
              {officerNote && (
                <div className="pt-2 border-t border-slate-200/80 text-slate-600">
                  <span className="text-slate-500 block mb-0.5 font-medium">Ý kiến cán bộ tiếp nhận:</span>
                  <p className="italic text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-200/60">
                    "{officerNote}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmTiepNhan}
                className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da8] active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span>
                  {tiepNhanHuong === 'tu_xu_ly'
                    ? 'Xác nhận tiếp nhận & Vào Workflow ➔'
                    : 'Xác nhận phân công cán bộ ➔'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CẢNH BÁO THIẾU ĐIỀU KIỆN CHUYỂN TIẾP NHẬN (BR-04, BR-05)            */}
      {/* ========================================================================= */}
      {validationErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Chưa đủ điều kiện chuyển</h3>
                <p className="text-xs text-slate-500 font-label-technical">Quy tắc BR-04 &amp; BR-05</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-950 space-y-2">
              <p className="font-semibold text-red-900">
                Để được chuyển tiếp nhận &amp; xử lý, lượt nhận phải có ít nhất 01 nguồn dữ liệu xử lý:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-red-800">
                <li><strong>Tệp tài liệu:</strong> Có ít nhất 01 file đơn hoặc tài liệu đính kèm hợp lệ.</li>
                <li><strong>Ghi chú tiếp nhận:</strong> Có nội dung tóm tắt/ghi chú tiếp nhận hợp lệ.</li>
              </ul>
              <p className="text-[11px] text-red-700 italic pt-1 border-t border-red-200">
                * Lưu ý: Thông tin người nộp hồ sơ không bắt buộc.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setValidationErrorModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Đã hiểu &amp; Bổ sung thêm
              </button>
            </div>
          </div>
        </div>
      )}

      <NguonTraCuuModal
        isOpen={showNguonTraCuuModal}
        onClose={() => setShowNguonTraCuuModal(false)}
        initialTab={nguonTraCuuTab}
        currentDonCode="Đ-2026-00125"
        currentNguoiGui={extractData.nguoiGui || 'Nguyễn Văn A'}
        currentCccd={extractData.cccd || '001088012345'}
        onApplyRecommendation={(recText) => {
          setOfficerNote(recText);
          showToast('✓ Đã áp dụng đề xuất từ nguồn tra cứu vào Ý kiến cán bộ!');
        }}
      />

      <ChuyenTiepNhanModal
        isOpen={showChuyenModal}
        onClose={() => setShowChuyenModal(false)}
        onSubmit={handleChuyenTiepNhanSubmit}
        donInfo={{
          code: luotNhan?.id ? (luotNhan.id.startsWith('LN-') ? `Đ-${luotNhan.id.replace('LN-', '')}` : luotNhan.id) : 'Đ-2026-00125',
          loaiDon: extractData.loaiNoiDung || 'Đơn tố giác về tội phạm',
          nguoiNop: extractData.nguoiGui || luotNhan?.nguoiNop || 'Nguyễn Văn A',
          ngayNhan: luotNhan?.ngayNhan || '16/09/2026 09:15',
          donViHienTai: 'Bộ phận Tiếp nhận đơn (Một cửa)',
          noiDungTomTat: extractData.noiDungTomTat || luotNhan?.noiDung,
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL XÁC NHẬN GHÉP ĐƠN VÀO HỒ SƠ ĐÃ CÓ                                   */}
      {/* ========================================================================= */}
      {showGhepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-2xl">merge_type</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác nhận ghép vào hồ sơ đơn đã có</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Lượt nhận: {luotNhan?.id || 'LN-56/2026-GOVEX'} ➔ Đơn đích: {selectedGhepDonCode}
                </p>
              </div>
            </div>

            {/* Chọn hồ sơ đơn tiếp nhận đích (Dạng Combobox) */}
            <div className="space-y-2">
              <label className="block text-[12.5px] font-semibold text-slate-700">
                Chọn đơn ghép <span className="text-rose-500 font-bold ml-0.5 text-[12px]">*</span>:
              </label>

              {/* Combobox Dropdown Container */}
              <div className="relative">
                {/* Trigger Combobox Button */}
                <button
                  type="button"
                  onClick={() => setIsGhepComboboxOpen(!isGhepComboboxOpen)}
                  className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl text-left transition-all cursor-pointer shadow-2xs ${
                    isGhepComboboxOpen
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600 shrink-0">
                      folder_open
                    </span>
                    {selectedGhepItem ? (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-[13px]">
                            {selectedGhepItem.code}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10.5px] font-semibold">
                            {selectedGhepItem.status}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10.5px] font-bold border ${
                              selectedGhepItem.matchPercent >= 90
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            Trùng {selectedGhepItem.matchPercent}%
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-600 truncate mt-0.5">
                          {selectedGhepItem.title}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[13px]">
                        -- Nhấp chọn hồ sơ đơn cần ghép --
                      </span>
                    )}
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform ${
                      isGhepComboboxOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown Menu của Combobox */}
                {isGhepComboboxOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-scale-up">
                    {/* Ô tìm kiếm trong Combobox */}
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                      <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tiêu đề, người nộp..."
                        value={ghepSearchQuery}
                        onChange={(e) => setGhepSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        autoFocus
                      />
                      {ghepSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setGhepSearchQuery('')}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Danh sách options */}
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {filteredGhepList.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Không tìm thấy đơn phù hợp
                        </div>
                      ) : (
                        filteredGhepList.map((item) => {
                          const isSelected = selectedGhepDonCode === item.code;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedGhepDonCode(item.code);
                                setOfficerNote(
                                  `Gói này giống hồ sơ ${item.code} đang mở – ghép vào đó không sinh đơn mới, không tốn số`
                                );
                                setGhiChuGhep(
                                  `Ghép lượt nhận vào hồ sơ ${item.code} để theo dõi tập trung, không tạo mã đơn mới.`
                                );
                                setIsGhepComboboxOpen(false);
                              }}
                              className={`p-2.5 hover:bg-indigo-50/60 cursor-pointer transition-colors flex items-start gap-2.5 ${
                                isSelected ? 'bg-indigo-50/80' : ''
                              }`}
                            >
                              <div className="pt-0.5">
                                {isSelected ? (
                                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-300 block" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 text-[12.5px]">
                                      {item.code}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                                      {item.status}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${
                                      item.matchPercent >= 90
                                        ? 'bg-rose-100/90 text-rose-800 border-rose-200'
                                        : 'bg-amber-100/90 text-amber-800 border-amber-200'
                                    }`}
                                  >
                                    Trùng {item.matchPercent}%
                                  </span>
                                </div>
                                <p className="text-[12px] text-slate-800 font-medium leading-snug line-clamp-1 mt-0.5">
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                  <span>
                                    Người nộp: <strong className="text-slate-700 font-medium">{item.nguoiNop}</strong>
                                  </span>
                                  <span>
                                    Thụ lý: <strong className="text-slate-700 font-medium">{item.canBoThuLy}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thẻ xem tóm tắt & chi tiết đơn đã chọn */}
              {selectedGhepItem && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-[12.5px]">{selectedGhepItem.code}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 truncate font-medium">Người nộp: {selectedGhepItem.nguoiNop}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 truncate font-medium">Cán bộ: {selectedGhepItem.canBoThuLy}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 truncate mt-0.5">{selectedGhepItem.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDonTrungForDrawer(selectedGhepItem);
                      setShowDonTrungDrawer(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#004ac6] border border-slate-200 text-[12px] font-medium transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                    title="Xem chi tiết hồ sơ đơn trong Drawer"
                  >
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                    <span>Xem chi tiết</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do ghép hồ sơ <span className="text-red-500">*</span>:
                </label>
                <select
                  value={lyDoGhep}
                  onChange={(e) => setLyDoGhep(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Bổ sung tài liệu, chứng cứ cho hồ sơ đang thụ lý giải quyết">
                    Bổ sung tài liệu, chứng cứ cho hồ sơ đang thụ lý giải quyết
                  </option>
                  <option value="Đơn gửi nhiều lần trùng người nộp và đối tượng bị phản ánh (đơn trùng)">
                    Đơn gửi nhiều lần trùng người nộp và đối tượng bị phản ánh (đơn trùng)
                  </option>
                  <option value="Đơn cùng nội dung của đồng đứng đơn / người liên quan">
                    Đơn cùng nội dung của đồng đứng đơn / người liên quan
                  </option>
                  <option value="Văn bản giải trình, tài liệu phát sinh mới phục vụ xác minh">
                    Văn bản giải trình, tài liệu phát sinh mới phục vụ xác minh
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú của cán bộ ghép hồ sơ:
                </label>
                <textarea
                  rows={2}
                  value={ghiChuGhep}
                  onChange={(e) => setGhiChuGhep(e.target.value)}
                  placeholder="Nhập ghi chú xử lý ghép hồ sơ..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGhepModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmGhep}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">merge_type</span>
                <span>Xác nhận ghép hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ĐỐI CHIẾU CHI TIẾT HỒ SƠ ĐƠN GỐC ĐỂ GHÉP                           */}
      {/* ========================================================================= */}
      {showDetailTargetDonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">compare_arrows</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Đối chiếu Lượt nhận &amp; Hồ sơ Đơn gốc</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {luotNhan?.id || 'LN-56/2026-GOVEX'} ⟷ {selectedGhepDonCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailTargetDonModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">verified</span>
                <span>Độ tương đồng nội dung &amp; chủ thể do AI đối soát:</span>
              </div>
              <strong className="text-sm font-bold text-emerald-800">94% (Khuyến nghị Ghép đơn)</strong>
            </div>

            {/* Bảng so sánh đối chiếu */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="p-2.5 w-1/4">Tiêu chí so sánh</th>
                    <th className="p-2.5 w-3/8 bg-blue-50/50 text-blue-900">Lượt nhận mới ({luotNhan?.id || 'LN-56'})</th>
                    <th className="p-2.5 w-3/8 bg-indigo-50/50 text-indigo-900">Đơn gốc ({selectedGhepDonCode})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Người đứng đơn</td>
                    <td className="p-2.5">{extractData.nguoiGui || 'Đại diện KDC số 4'}</td>
                    <td className="p-2.5 flex items-center justify-between">
                      <span>Đại diện khu dân cư số 4</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Trùng khớp</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Số CCCD / Định danh</td>
                    <td className="p-2.5 font-mono">{extractData.cccd || '001075018392'}</td>
                    <td className="p-2.5 font-mono flex items-center justify-between">
                      <span>001075018392</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">100%</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Đối tượng bị phản ánh</td>
                    <td className="p-2.5">{extractData.doiTuong || 'Cơ sở tái chế Minh Phát'}</td>
                    <td className="p-2.5 flex items-center justify-between">
                      <span>Cơ sở tái chế Minh Phát</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Trùng khớp</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Địa bàn xảy ra vụ việc</td>
                    <td className="p-2.5">{extractData.diaDiem || 'Quận Cầu Giấy, Hà Nội'}</td>
                    <td className="p-2.5 flex items-center justify-between">
                      <span>Khu dân cư số 4, Cầu Giấy, Hà Nội</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Cùng địa bàn</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Tình trạng thụ lý</td>
                    <td className="p-2.5 text-amber-700 font-medium">Lượt nhận mới tiếp nhận</td>
                    <td className="p-2.5 text-blue-700 font-medium">Đang thụ lý giải quyết (Nguyễn Minh Anh)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500">Điểm mới bổ sung</td>
                    <td className="p-2.5 text-slate-800" colSpan={2}>
                      Lượt nhận mới cung cấp thêm file <strong>Hợp đồng góp vốn.pdf</strong> và biên bản đo đạc hiện trạng tiếng ồn ban đêm để củng cố chứng cứ cho đơn gốc.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailTargetDonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetailTargetDonModal(false);
                  setShowGhepModal(true);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">merge_type</span>
                <span>Tiến hành ghép vào đơn này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER XEM CHI TIẾT ĐƠN TRÙNG */}
      <DonTrungDetailDrawer
        isOpen={showDonTrungDrawer}
        onClose={() => setShowDonTrungDrawer(false)}
        donTrung={selectedDonTrungForDrawer}
        currentLuotNhanCode={luotNhan?.id || 'LN-56/2026-GOVEX'}
        currentNguoiGui={extractData.nguoiGui || luotNhan?.nguoiNop || 'Đại diện KDC số 4'}
        currentCccd={extractData.cccd || '001075018392'}
        isSelectedForGhep={selectedGhepDonCode === selectedDonTrungForDrawer?.code}
        isDetermined={hasDeterminedHuongXuLy}
        onSelectForGhep={(item) => {
          setSelectedGhepDonCode(item.code);
          setHuongXuLy('ghep');
          setOfficerNote(`Gói này giống hồ sơ ${item.code} đang mở – ghép vào đó không sinh đơn mới, không tốn số`);
          setGhiChuGhep(`Ghép lượt nhận vào hồ sơ ${item.code} để theo dõi tập trung, không tạo mã đơn mới.`);
          showToast(`✓ Đã chọn hồ sơ ${item.code} để ghép vào lượt nhận này`);
        }}
        onOpenSoSanhChiTiet={(item) => {
          setSelectedGhepDonCode(item.code);
          setShowDonTrungDrawer(false);
          setShowDetailTargetDonModal(true);
        }}
      />

      {/* MODAL VĂN BẢN TRÌNH KÝ LIÊN KẾT TRỰC TIẾP CỦA ĐƠN */}
      {showSigningDocModal && activeSigningDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[92vh] max-h-[960px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <span className="material-symbols-outlined text-[24px]">contract_edit</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 border border-blue-700/50 px-2 py-0.5 rounded-md">
                      VĂN BẢN LIÊN KẾT ĐƠN: {activeSigningDoc.hoSoCode || currentDonCode}
                    </span>
                    <span className="text-xs text-slate-300">
                      Số: <strong className="text-white font-mono">{activeSigningDoc.soKyHieu || '01/TTr-TCD'}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-2xl">
                    {activeSigningDoc.tenVanBan}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeSigningDoc.status === 'da_ky' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>ĐÃ KÝ DUYỆT PHÊ DUYỆT</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                    <span>ĐANG TRÌNH KÝ LÃNH ĐẠO</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setShowSigningDocModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all"
                  title="Đóng (Vẫn ở lại trên Bàn phân tích của đơn này)"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Quick Context Banner */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600 shrink-0">
              <div className="flex items-center gap-4 flex-wrap">
                <span>
                  <strong className="text-slate-800">Người nộp đơn:</strong> {activeSigningDoc.nguoiGuiDon}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">Đối tượng:</strong> {extractData.doiTuong || 'Cán bộ vi phạm'}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">Cán bộ lập tờ trình:</strong> {activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh'}
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  <strong className="text-slate-800">Lãnh đạo phụ trách:</strong> {activeSigningDoc.lanhDaoName} ({activeSigningDoc.lanhDaoChucVu})
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSigningModalTab('van_ban')}
                  className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${signingModalTab === 'van_ban'
                    ? 'bg-white text-indigo-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span className="material-symbols-outlined text-[15px]">description</span>
                  <span>1. Nội dung Tờ trình &amp; Đính kèm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSigningModalTab('luong_ky')}
                  className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${signingModalTab === 'luong_ky'
                    ? 'bg-white text-indigo-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span className="material-symbols-outlined text-[15px]">draw</span>
                  <span>2. Tiến trình Trình ký số &amp; Phê duyệt</span>
                  {activeSigningDoc.status !== 'da_ky' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              {signingModalTab === 'van_ban' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Official Administrative A4 Document Sheet */}
                  <div className="lg:col-span-8 bg-white rounded-xl shadow-md border border-slate-200 p-8 text-slate-800 font-serif leading-relaxed text-sm">
                    {/* Header: Quốc hiệu & Tiêu ngữ */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-center font-sans text-xs">
                      <div>
                        <p className="font-bold uppercase tracking-wider text-slate-700">UBND THÀNH PHỐ HÀ NỘI</p>
                        <p className="font-bold uppercase text-slate-900">BAN TIẾP CÔNG DÂN</p>
                        <p className="text-slate-500 mt-1">Số: <span className="font-mono font-bold text-slate-800">{activeSigningDoc.soKyHieu || '01/TTr-TCD'}</span></p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                        <p className="font-bold underline text-slate-900">Độc lập - Tự do - Hạnh phúc</p>
                        <p className="text-slate-500 italic mt-1">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center my-6">
                      <h2 className="text-lg font-bold font-sans uppercase text-slate-900 tracking-wide">
                        TỜ TRÌNH
                      </h2>
                      <p className="italic text-slate-700 font-sans text-xs mt-1">
                        Về việc đề xuất thụ lý giải quyết {activeSigningDoc.loaiDon.toLowerCase()}
                      </p>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        (Liên kết hồ sơ đơn: <strong className="text-indigo-700 font-mono">{activeSigningDoc.hoSoCode || currentDonCode}</strong>)
                      </p>
                    </div>

                    {/* Kính gửi */}
                    <div className="mb-4 font-sans text-xs">
                      <p className="font-bold">
                        Kính gửi: <span className="text-slate-900">{activeSigningDoc.lanhDaoName} - {activeSigningDoc.lanhDaoChucVu}</span>
                      </p>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="space-y-3.5 text-xs text-justify">
                      <p>
                        Căn cứ Luật Tố cáo năm 2018 (Điều 12, Điều 29 và Điều 30); Căn cứ Nghị định số 31/2019/NĐ-CP ngày 10/4/2019 của Chính phủ quy định chi tiết một số điều của Luật Tố cáo; Căn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh.
                      </p>
                      <p>
                        Ban Tiếp công dân thành phố đã tiến hành kiểm tra điều kiện thụ lý và phân tích ban đầu đối với hồ sơ đơn mang mã số <strong>{activeSigningDoc.hoSoCode || currentDonCode}</strong> (Lượt tiếp nhận: {activeSigningDoc.luotNhanId || luotNhan?.id}), do công dân <strong>{activeSigningDoc.nguoiGuiDon}</strong> gửi đến.
                      </p>

                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 font-sans">
                        <p className="font-bold text-slate-900 mb-1">Kết quả kiểm tra 3 điều kiện thụ lý:</p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                          <li>
                            <strong>Tư cách người đứng đơn:</strong> Đơn có họ tên, địa chỉ, số CCCD rõ ràng, có chữ ký trực tiếp của người tố cáo/khiếu nại; có năng lực hành vi dân sự đầy đủ theo luật định.
                          </li>
                          <li>
                            <strong>Thẩm quyền giải quyết:</strong> Nội dung đơn phản ánh, tố giác hành vi vi phạm của <em>{extractData.doiTuong || 'ông/bà vi phạm'} ({extractData.chucVu || 'Cán bộ'} - {extractData.donVi || 'Đơn vị'})</em> thuộc thẩm quyền xem xét, giải quyết của Chủ tịch UBND Thành phố/Thủ trưởng cơ quan.
                          </li>
                          <li>
                            <strong>Căn cứ &amp; Chứng cứ đính kèm:</strong> Người nộp đơn đã cung cấp tài liệu, hình ảnh, trích sao chứng minh hành vi có dấu hiệu sai phạm, không thuộc trường hợp đơn nặc danh hoặc đã được giải quyết dứt điểm đúng pháp luật.
                          </li>
                        </ul>
                      </div>

                      <p className="font-bold font-sans">Ban Tiếp công dân kính trình Lãnh đạo xem xét, quyết định các nội dung sau:</p>
                      <ol className="list-decimal pl-5 space-y-1.5 font-sans">
                        <li>
                          <strong>Ban hành Quyết định thụ lý</strong> giải quyết đơn số <strong>{activeSigningDoc.hoSoCode || currentDonCode}</strong> theo đúng thời hạn 07 ngày làm việc quy định tại Điều 30 Luật Tố cáo.
                        </li>
                        <li>
                          <strong>Thành lập Tổ xác minh</strong> gồm 03 đồng chí thuộc Phòng Nghiệp vụ 1 để tiến hành thẩm tra, xác minh thực tế nội dung đơn.
                        </li>
                        <li>
                          <strong>Giao Cán bộ thụ lý {activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh'}</strong> thông báo bằng văn bản về việc thụ lý đến người tố cáo và các bên liên quan theo Mẫu quy định.
                        </li>
                      </ol>

                      <p className="italic font-sans text-slate-600 mt-2">
                        (Kính gửi kèm theo: Dự thảo Quyết định thụ lý; Toàn văn đơn gốc scan; Bảng tổng hợp tài liệu, chứng cứ đính kèm).
                      </p>
                    </div>

                    {/* Footer ký tá */}
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-200 font-sans text-xs">
                      <div>
                        <p className="font-bold uppercase text-slate-600 text-[11px]">Nơi nhận:</p>
                        <p className="text-slate-500 text-[11px]">- Như kính gửi;</p>
                        <p className="text-slate-500 text-[11px]">- Trưởng ban (để b/c);</p>
                        <p className="text-slate-500 text-[11px]">- Lưu: VT, HS {activeSigningDoc.hoSoCode || currentDonCode}.</p>
                      </div>

                      <div className="text-center flex flex-col items-center">
                        <p className="font-bold uppercase text-slate-800">
                          {activeSigningDoc.status === 'da_ky' ? 'LÃNH ĐẠO PHÊ DUYỆT' : 'CÁN BỘ ĐỀ XUẤT'}
                        </p>
                        <p className="text-slate-500 text-[11px] italic">
                          {activeSigningDoc.status === 'da_ky' ? '(Đã ký số điện tử phê duyệt)' : '(Đã ký số xác thực đề xuất)'}
                        </p>

                        {/* Digital Signature Stamp */}
                        <div className="my-3 p-3 rounded-lg border-2 border-emerald-500 bg-emerald-50/60 text-emerald-800 flex flex-col items-center max-w-xs shadow-xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                            <span>KÝ SỐ XÁC THỰC VGCA</span>
                          </div>
                          <p className="text-[11px] font-bold mt-1 text-center">
                            {activeSigningDoc.status === 'da_ky' ? activeSigningDoc.lanhDaoName : (activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh')}
                          </p>
                          <p className="text-[10px] text-emerald-700 text-center font-mono">
                            {activeSigningDoc.status === 'da_ky' ? 'Token: 5402-9912-8812 • Ban Cơ yếu CP' : 'Token: 0019-8812-4411 • Ban Cơ yếu CP'}
                          </p>
                          <p className="text-[10px] text-emerald-600 text-center mt-0.5">
                            Thời gian: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <p className="font-bold text-slate-900 text-xs">
                          {activeSigningDoc.status === 'da_ky' ? activeSigningDoc.lanhDaoName : (activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Linked Petition Info & Attached Documents */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Card 1: Thông tin liên kết đơn */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-indigo-600">link</span>
                          <span>Hồ sơ đơn liên kết</span>
                        </h4>
                        <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                          {activeSigningDoc.hoSoCode || currentDonCode}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500">Người đứng đơn:</span>
                          <p className="font-bold text-slate-800">{activeSigningDoc.nguoiGuiDon}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Phân loại đơn:</span>
                          <p className="font-semibold text-slate-700">{activeSigningDoc.loaiDon}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Đối tượng phản ánh/tố cáo:</span>
                          <p className="font-semibold text-rose-700">{extractData.doiTuong || 'Cán bộ vi phạm'}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Tóm tắt nội dung:</span>
                          <p className="text-slate-600 text-[11px] line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                            {extractData.noiDungTomTat || luotNhan?.noiDung || 'Đơn phản ánh sai phạm trong quản lý và thực thi công vụ.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Tài liệu đính kèm của đơn */}
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">attach_file</span>
                          <span>Tài liệu đính kèm ({activeSigningDoc.tepDinhKem?.length || 3})</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">Tự động liên kết</span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {activeSigningDoc.tepDinhKem && activeSigningDoc.tepDinhKem.length > 0 ? (
                          activeSigningDoc.tepDinhKem.map((file, idx) => (
                            <div
                              key={file.id || idx}
                              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-[18px] text-indigo-600 shrink-0">
                                  {file.tenTep.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate" title={file.tenTep}>
                                    {file.tenTep}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {file.dungLuong} • {file.loai === 'du_thao' ? 'Dự thảo văn bản' : 'Chứng cứ đơn gốc'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => showToast(`Đang mở xem tệp: ${file.tenTep}`)}
                                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white cursor-pointer"
                                title="Xem trước tài liệu"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-indigo-600">description</span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">To_trinh_thu_ly_{currentDonCode}.docx</p>
                                  <p className="text-[10px] text-slate-500">1.8 MB • Dự thảo văn bản</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-indigo-600">description</span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">Du_thao_Quyet_dinh_thu_ly_{currentDonCode}.docx</p>
                                  <p className="text-[10px] text-slate-500">1.2 MB • Dự thảo văn bản</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-rose-600">picture_as_pdf</span>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">Don_goc_cong_dan_scan.pdf</p>
                                  <p className="text-[10px] text-slate-500">4.6 MB • Chứng cứ đính kèm</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card 3: Thao tác ký duyệt nhanh nếu đang là Lãnh đạo hoặc cán bộ kiểm tra */}
                    {activeSigningDoc.status !== 'da_ky' ? (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 shadow-xs">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                          <span className="material-symbols-outlined text-[18px] text-indigo-600">draw</span>
                          <span>Ký số phê duyệt Tờ trình</span>
                        </h4>
                        <p className="text-xs text-indigo-800 leading-relaxed mb-3">
                          Lãnh đạo <strong>{activeSigningDoc.lanhDaoName}</strong> có thể phê duyệt và ký số chứng thư điện tử VGCA ngay tại đơn này:
                        </p>

                        <div className="mb-3">
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Ý kiến chỉ đạo / Ghi chú phê duyệt:
                          </label>
                          <textarea
                            value={signingNoteInput}
                            onChange={(e) => setSigningNoteInput(e.target.value)}
                            rows={2}
                            placeholder="Đồng ý thụ lý giải quyết. Giao Tổ xác minh khẩn trương thực hiện..."
                            className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSigningSubmitting}
                          onClick={() => handleQuickSignDocument(activeSigningDoc, signingNoteInput)}
                          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer flex items-center justify-center gap-2 transition-all"
                        >
                          {isSigningSubmitting ? (
                            <>
                              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                              <span>Đang xác thực chứng thư VGCA...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">verified</span>
                              <span>Ký số phê duyệt Tờ trình ngay</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-900">
                        <div className="flex items-center gap-2 font-bold mb-1">
                          <span className="material-symbols-outlined text-[18px] text-emerald-600">task_alt</span>
                          <span>Tờ trình đã được ký duyệt</span>
                        </div>
                        <p className="text-emerald-800 text-[11px]">
                          Văn bản đã có đầy đủ chữ ký số của Cán bộ thụ lý và Lãnh đạo phê duyệt. Đơn đã đủ điều kiện để ban hành Quyết định thụ lý và thành lập Tổ xác minh.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Tab 2: Tiến trình luồng ký số & Lịch sử phê duyệt */
                <div className="space-y-6">
                  {/* Step Diagram */}
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">linear_scale</span>
                      <span>Luồng ký số tuần tự của hồ sơ đơn</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Step 1 */}
                      <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                            Bước 1: Cán bộ lập
                          </span>
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{activeSigningDoc.nguoiLap || 'Nguyễn Minh Anh'}</p>
                        <p className="text-xs text-slate-500">Cán bộ Ban Tiếp công dân</p>
                        <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] text-emerald-800">
                          <p className="font-semibold">✓ Đã ký số xác thực đề xuất</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Chứng thư: VGCA - Ban Cơ yếu CP</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-4 rounded-xl border-2 relative ${activeSigningDoc.status === 'da_ky'
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-amber-400 bg-amber-50/40'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activeSigningDoc.status === 'da_ky'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                            }`}>
                            Bước 2: Lãnh đạo thẩm tra
                          </span>
                          <span className="material-symbols-outlined text-[18px] text-amber-600">
                            {activeSigningDoc.status === 'da_ky' ? 'verified' : 'hourglass_top'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{activeSigningDoc.lanhDaoName}</p>
                        <p className="text-xs text-slate-500">{activeSigningDoc.lanhDaoChucVu}</p>
                        <div className="mt-3 pt-2 border-t border-slate-200 text-[11px]">
                          {activeSigningDoc.status === 'da_ky' ? (
                            <p className="font-semibold text-emerald-800">✓ Đã ký số phê duyệt</p>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-amber-800 font-semibold">Đang chờ ký số...</span>
                              <button
                                type="button"
                                onClick={() => handleQuickSignDocument(activeSigningDoc)}
                                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer"
                              >
                                Ký duyệt ngay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-70">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded-full">
                            Bước 3: Ban hành Quyết định
                          </span>
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">gavel</span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">Chánh Thanh tra thành phố</p>
                        <p className="text-xs text-slate-500">Thủ trưởng cơ quan có thẩm quyền</p>
                        <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                          {activeSigningDoc.status === 'da_ky'
                            ? 'Sẵn sàng ban hành Quyết định thụ lý'
                            : 'Chờ sau khi Lãnh đạo thẩm tra ký duyệt'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-600">history</span>
                      <span>Nhật ký luồng ký &amp; Ý kiến chỉ đạo (Audit Trail)</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                            <th className="py-2.5 px-3 font-semibold">Thời gian</th>
                            <th className="py-2.5 px-3 font-semibold">Người thực hiện</th>
                            <th className="py-2.5 px-3 font-semibold">Vai trò</th>
                            <th className="py-2.5 px-3 font-semibold">Hành động</th>
                            <th className="py-2.5 px-3 font-semibold">Ý kiến / Ghi chú</th>
                            <th className="py-2.5 px-3 font-semibold">Chứng thư số</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeSigningDoc.auditLogs && activeSigningDoc.auditLogs.length > 0 ? (
                            activeSigningDoc.auditLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{log.time}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{log.actor}</td>
                                <td className="py-2.5 px-3 text-slate-600">{log.actorRole}</td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 italic">{log.note || '—'}</td>
                                <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-700">{log.signatureCert || 'VGCA'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="py-2.5 px-3 font-mono text-slate-600">Hôm nay 10:15</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">Nguyễn Minh Anh</td>
                              <td className="py-2.5 px-3 text-slate-600">Cán bộ thụ lý</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Lập tờ trình &amp; Trình ký
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 italic">Trình Lãnh đạo xem xét phê duyệt</td>
                              <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-700">VGCA - Ban Cơ yếu CP</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Đang kết nối máy in văn phòng...');
                    window.print();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>In Tờ trình</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`✓ Đã tải tệp To_trinh_thu_ly_${activeSigningDoc.hoSoCode || currentDonCode}.pdf`)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Tải PDF đã ký</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {activeSigningDoc.status !== 'da_ky' && (
                  <button
                    type="button"
                    disabled={isSigningSubmitting}
                    onClick={() => handleQuickSignDocument(activeSigningDoc)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer flex items-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">draw</span>
                    <span>Ký số phê duyệt Tờ trình</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSigningDocModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer transition-all"
                >
                  Đóng (Ở lại bàn phân tích)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}