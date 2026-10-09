import React, { useState, useEffect } from 'react';
import { DonDetail } from '../../types';
import { VanBanXacMinhItem } from '../modals/XacMinhVaDeXuatModal';
import { SigningDocument, SigningStatus } from '../../types/signing';
import { BaoCaoDeXuatFormData } from '../modals/TaoBaoCaoDeXuatModal';

export interface TabTaiLieuProps {
  currentDon: DonDetail;
  onDocCountChange?: (count: number) => void;
  initialEditingDoc?: {
    id?: string;
    loai?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'file_scan' | string;
    soHieu: string;
    tenVanBan: string;
    category?: string;
    ngayLap?: string;
    coQuanBanHanh?: string;
    nguoiNhan?: string;
    diaDiem?: string;
    thoiGianHen?: string;
    trichYeu?: string;
    noiDungChiTiet?: string;
    signer?: string;
    trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
    fromXacMinh?: boolean;
  } | null;
  onClearInitialEditingDoc?: () => void;
  onReturnToXacMinh?: () => void;
  sharedVanBanList?: VanBanXacMinhItem[];
  onUpdateSharedVanBanList?: (list: VanBanXacMinhItem[] | ((prev: VanBanXacMinhItem[]) => VanBanXacMinhItem[])) => void;
  signingDocuments?: SigningDocument[];
  onUpdateSigningDocuments?: React.Dispatch<React.SetStateAction<SigningDocument[]>>;
  onOpenBaoCaoDeXuat?: (doc?: any) => void;
  onTrinhKyBaoCao?: (docId?: string, updatedDoc?: SigningDocument) => void;
}

export interface DocItem {
  id: string;
  name: string;
  category: string;
  soHieu?: string;
  size: string;
  pages: number;
  uploadDate: string;
  signer: string;
  coQuanBanHanh?: string;
  stepBelongsTo?: string;
  ocrStatus: 'Hoàn tất' | 'Đang xử lý';
  previewExcerpt: string;
  isProcessDoc?: boolean;
  isEditable?: boolean;
  loaiVanBan?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac' | 'bao_cao_de_xuat' | 'bao_cao_xac_minh';
  tenVanBan?: string;
  nguoiNhan?: string;
  diaDiem?: string;
  thoiGianHen?: string;
  trichYeu?: string;
  noiDungChiTiet?: string;
  trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
  fromXacMinh?: boolean;
  signingStatus?: SigningStatus;
  formData?: any;
}

export default function TabTaiLieu({
  currentDon,
  onDocCountChange,
  initialEditingDoc,
  onClearInitialEditingDoc,
  onReturnToXacMinh,
  sharedVanBanList,
  onUpdateSharedVanBanList,
  signingDocuments,
  onOpenBaoCaoDeXuat,
  onUpdateSigningDocuments,
  onTrinhKyBaoCao,
}: TabTaiLieuProps) {
  const isToGiac = currentDon.code.startsWith('Đ-2026') || currentDon.nguoiNop === 'Nguyễn Văn A';

  const initialDocs: DocItem[] = isToGiac
    ? [
      {
        id: 'DOC-XM-01',
        name: 'Giay_moi_lam_viec_so_18_GM_TCD.pdf',
        category: 'Giấy mời xác minh',
        soHieu: '18/GM-TCD',
        size: '380 KB',
        pages: 1,
        uploadDate: '16/09/2026 10:00',
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn - UBND quận',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'giay_moi',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        thoiGianHen: '08:30 ngày 18/09/2026',
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
        trichYeu: 'V/v Làm việc, cung cấp thông tin, tài liệu liên quan đến nội dung đơn',
        noiDungChiTiet: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày 16/09/2026.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
        trangThai: 'da_ban_hanh',
        fromXacMinh: true,
        previewExcerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nGIẤY MỜI LÀM VIỆC\nSố: 18/GM-TCD\nKính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc...`,
      },
      {
        id: 'DOC-XM-02',
        name: 'Bien_ban_lam_viec_xac_minh_so_02_BB_XM.pdf',
        category: 'Biên bản làm việc',
        soHieu: '02/BB-XM',
        size: '520 KB',
        pages: 2,
        uploadDate: '17/09/2026 15:30',
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'bien_ban',
        nguoiNhan: `${currentDon.nguoiNop || 'Nguyễn Văn A'} (Người đứng đơn)`,
        thoiGianHen: '14:30 ngày 17/09/2026',
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
        trichYeu: 'Ghi nhận ý kiến trình bày và tiếp nhận tài liệu gốc của công dân',
        noiDungChiTiet: `Tại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nCán bộ thụ lý đã tiếp nhận, kiểm tra tính pháp lý ban đầu và lập biên nhận bàn giao tài liệu phục vụ xác minh.`,
        trangThai: 'du_thao',
        fromXacMinh: true,
        previewExcerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nBIÊN BẢN LÀM VIỆC XÁC MINH\nSố: 02/BB-XM\nTại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác...`,
      },
      {
        id: 'DOC-01',
        name: 'Don_to_giac_toi_pham_NguyenVanA_16092026.pdf',
        category: 'Đơn gốc tiếp nhận',
        soHieu: 'Đ-2026-00125',
        size: '1.8 MB',
        pages: 3,
        uploadDate: '16/09/2026 09:18',
        signer: 'Công dân Nguyễn Văn A (Ký tươi + VNeID)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nĐƠN TỐ GIÁC TỘI PHẠM\n(V/v: Hành vi lừa đảo chiếm đoạt tài sản tại Dự án Khu đô thị Y)\n\nKính gửi: Cơ quan Cảnh sát điều tra - Công an thành phố Hà Nội\nTôi là: Nguyễn Văn A, sinh năm 1988...\nTôi làm đơn này tố giác ông Trần Văn B - Giám đốc CTCP X...',
      },
      {
        id: 'DOC-02',
        name: 'CCCD_gan_chip_cong_chung_001088019482.pdf',
        category: 'Định danh cá nhân',
        soHieu: '001088019482',
        size: '850 KB',
        pages: 2,
        uploadDate: '16/09/2026 09:20',
        signer: 'Bộ Công an (Xác thực CSDL Dân cư)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'CĂN CƯỚC CÔNG DÂN\nSố: 001088019482\nHọ và tên: NGUYỄN VĂN A\nNgày sinh: 15/05/1988\nQuê quán: Hà Nội\nNơi thường trú: Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội\nGiá trị đến: 15/05/2038',
      },
      {
        id: 'DOC-03',
        name: 'Hop_dong_gop_von_hop_tac_dau_tu_so_88_2024.pdf',
        category: 'Chứng cứ vụ việc',
        soHieu: '88/2024/HĐGV',
        size: '4.2 MB',
        pages: 12,
        uploadDate: '16/09/2026 09:22',
        signer: 'CTCP Đầu tư X (Dấu đỏ đại diện pháp luật)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'HỢP ĐỒNG HỢP TÁC ĐẦU TƯ SỐ 88/2024/HĐGV\nDự án: Khu đô thị phức hợp Y - Hà Đông\nBên A: Công ty Cổ phần Đầu tư & Phát triển Đô thị X\nĐại diện: Ông Trần Văn B - Chức vụ: Tổng Giám đốc\nBên B: Ông Nguyễn Văn A\nĐiều 3: Số tiền góp vốn cam kết 3.500.000.000 VNĐ...',
      },
      {
        id: 'DOC-04',
        name: 'Sao_ke_uy_nhiem_chi_VCB_3.5_ty_dong.pdf',
        category: 'Tài liệu tài chính',
        soHieu: 'VCB-987654',
        size: '2.1 MB',
        pages: 5,
        uploadDate: '16/09/2026 09:24',
        signer: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'ỦY NHIỆM CHI / LỆNH CHUYỂN TIỀN\nNgày hạch toán: 22/11/2024\nTài khoản trích: 0021000987654 (Nguyễn Văn A)\nTài khoản thụ hưởng: 0011004567899 (CTCP Đầu tư X)\nSố tiền bằng số: 3.500.000.000 VND\nBằng chữ: Ba tỷ năm trăm triệu đồng chẵn\nNội dung: Góp vốn Đợt 1 Dự án Khu đô thị Y theo HĐ số 88/2024',
      },
      {
        id: 'DOC-05',
        name: 'Phieu_tiep_nhan_ho_so_TN_2026_00125.pdf',
        category: 'Văn bản hành chính',
        soHieu: 'TN-2026-00125',
        size: '420 KB',
        pages: 1,
        uploadDate: '16/09/2026 09:26',
        signer: 'Cán bộ Nguyễn Minh Anh (Chứng thư số GOVEX CA)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        stepBelongsTo: 'Bước 1: Tiếp nhận & Vào sổ',
        previewExcerpt:
          'PHIẾU TIẾP NHẬN HỒ SƠ & HẸN TRẢ KẾT QUẢ\nMã hồ sơ tiếp nhận: TN-2026-00125\nBộ phận: Tiếp dân & Tiếp nhận Một cửa\nNgười tiếp nhận: Nguyễn Minh Anh - Cán bộ thụ lý\nThời hạn thông báo kết quả thụ lý: 10 ngày làm việc kể từ ngày nhận',
      },
      {
        id: 'DOC-06',
        name: 'Quyet_dinh_phan_cong_dieu_tra_vien_so_42_QD_PC03.pdf',
        category: 'Quyết định tố tụng',
        soHieu: '42/QĐ-PC03',
        size: '650 KB',
        pages: 2,
        uploadDate: '17/09/2026 10:15',
        signer: 'Thượng tá Trần Quốc Dũng (Phó Thủ trưởng CQĐT)',
        coQuanBanHanh: 'Cơ quan CSĐT Công an TP. Hà Nội',
        stepBelongsTo: 'Bước 3: Phân công Điều tra viên',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        previewExcerpt:
          'CƠ QUAN CSĐT CÔNG AN TP. HÀ NỘI\nSố: 42/QĐ-PC03\n\nQUYẾT ĐỊNH\nPhân công Phó Thủ trưởng CQĐT và Điều tra viên thụ lý giải quyết nguồn tin về tội phạm\n\nCăn cứ Điều 36, Điều 145 và Điều 146 Bộ luật Tố tụng hình sự năm 2015;\nCăn cứ Thông tư liên tịch số 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC;\nXét hồ sơ tố giác tội phạm số Đ-2026-00125 do công dân Nguyễn Văn A gửi;\n\nQUYẾT ĐỊNH:\nĐiều 1. Phân công Trung tá Lê Văn Nam - Điều tra viên Đội Cảnh sát kinh tế (PC03) thụ lý chính xác minh làm rõ hành vi có dấu hiệu lừa đảo chiếm đoạt tài sản.\nĐiều 2. Gửi Quyết định này đến Viện kiểm sát nhân dân thành phố Hà Nội theo quy định pháp luật.',
      },
    ]
    : [
      {
        id: 'DOC-01',
        name: 'Don_khieu_nai_boi_thuong_dat_LeVanHung.pdf',
        category: 'Đơn gốc tiếp nhận',
        soHieu: 'KN-2026-0045',
        size: '2.1 MB',
        pages: 4,
        uploadDate: '15/09/2026 09:18',
        signer: 'Lê Văn Hùng (Ký tươi)',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'ĐƠN KHIẾU NẠI\n(V/v: Xem xét lại đơn giá bồi thường đất khi thu hồi phục vụ Dự án nâng cấp mở rộng Quốc lộ 1A)\nKính gửi: Chủ tịch UBND thành phố Cần Thơ\nNgười khiếu nại: Lê Văn Hùng...',
      },
      {
        id: 'DOC-02',
        name: 'GCN_Quyen_su_dung_dat_Thua_45_To_12.pdf',
        category: 'Tài liệu đất đai',
        soHieu: 'CM-892100',
        size: '3.8 MB',
        pages: 4,
        uploadDate: '15/09/2026 09:20',
        signer: 'Sở TN&MT TP. Cần Thơ',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'GIẤY CHỨNG NHẬN QUYỀN SỬ DỤNG ĐẤT, QUYỀN SỞ HỮU NHÀ Ở\nSố phát hành: CM 892100\nThửa đất số: 45, Tờ bản đồ số: 12\nĐịa chỉ: Phường An Khánh, Quận Ninh Kiều, TP. Cần Thơ\nDiện tích: 185.4 m² (Đất ở đô thị: 100m², Đất trồng cây lâu năm: 85.4m²)',
      },
      {
        id: 'DOC-03',
        name: 'Quyet_dinh_thu_hoi_dat_so_1422_QD_UBND.pdf',
        category: 'Quyết định hành chính',
        soHieu: '1422/QĐ-UBND',
        size: '1.9 MB',
        pages: 6,
        uploadDate: '15/09/2026 09:22',
        signer: 'UBND TP. Cần Thơ',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'QUYẾT ĐỊNH\nVề việc thu hồi đất để thực hiện Dự án nâng cấp mở rộng Quốc lộ 1A\nSố: 1422/QĐ-UBND ngày 20/06/2026 của UBND TP. Cần Thơ...',
      },
      {
        id: 'DOC-04',
        name: 'Phuong_an_boi_thuong_ho_tro_tai_dinh_cu.pdf',
        category: 'Phương án đền bù',
        soHieu: 'PA-2026-BT',
        size: '2.5 MB',
        pages: 8,
        uploadDate: '15/09/2026 09:24',
        signer: 'Hội đồng Bồi thường & GPMB',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'BẢNG TÍNH GIÁ TRỊ BỒI THƯỜNG, HỖ TRỢ\nHộ gia đình: Ông Lê Văn Hùng\nĐơn giá áp dụng: 18.500.000 đ/m²\nTổng giá trị bồi thường dự kiến: 3.429.900.000 đồng...',
      },
      {
        id: 'DOC-05',
        name: 'Giay_xac_nhan_nguon_goc_dat_UBND_Phuong.pdf',
        category: 'Xác nhận địa phương',
        soHieu: '45/XN-UBND',
        size: '640 KB',
        pages: 2,
        uploadDate: '15/09/2026 09:26',
        signer: 'UBND Phường An Khánh',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: false,
        previewExcerpt:
          'GIẤY XÁC NHẬN NGUỒN GỐC VÀ THỜI ĐIỂM SỬ DỤNG ĐẤT\nUBND Phường An Khánh xác nhận: Thửa đất số 45 sử dụng ổn định từ năm 1996, không có tranh chấp...',
      },
      {
        id: 'DOC-06',
        name: 'Thong_bao_thu_ly_giai_quyet_khieu_nai_so_18_TB_UBND.pdf',
        category: 'Thông báo thụ lý',
        soHieu: '18/TB-UBND',
        size: '520 KB',
        pages: 2,
        uploadDate: '16/09/2026 14:30',
        signer: 'Chủ tịch UBND quận Ninh Kiều',
        coQuanBanHanh: 'UBND quận Ninh Kiều',
        stepBelongsTo: 'Bước 2: Thông báo thụ lý khiếu nại',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        previewExcerpt:
          'ỦY BAN NHÂN DÂN QUẬN NINH KIỀU\nSố: 18/TB-UBND\n\nTHÔNG BÁO\nVề việc thụ lý giải quyết khiếu nại (Lần 1)\n\nKính gửi: Ông Lê Văn Hùng và bà Nguyễn Thị Mai\nĐịa chỉ: 142/8 Nguyễn Văn Cừ, Phường An Khánh, Ninh Kiều, Cần Thơ\n\nChủ tịch UBND quận Ninh Kiều thông báo thụ lý giải quyết đơn khiếu nại của ông/bà về việc yêu cầu nâng đơn giá bồi thường đất tại Thửa 45, Tờ bản đồ số 12.\nThời hạn giải quyết khiếu nại lần 1 là 30 ngày theo quy định tại Điều 28 Luật Khiếu nại 2011.',
      },
    ];

  const [documents, setDocuments] = useState<DocItem[]>(initialDocs);
  const [filterTab, setFilterTab] = useState<'all' | 'process' | 'initial'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // =========================================================================
  // STATE CHẾ ĐỘ SOẠN THẢO & CHỈNH SỬA VĂN BẢN TRỰC TIẾP (DIRECT A4 EDITOR)
  // =========================================================================
  const [activeEditingDoc, setActiveEditingDoc] = useState<DocItem | null>(null);

  // Các trường form trong Live Direct Document Editor
  const [editSoHieu, setEditSoHieu] = useState('');
  const [editTenVanBan, setEditTenVanBan] = useState('');
  const [editLoaiVanBan, setEditLoaiVanBan] = useState<'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac' | 'bao_cao_de_xuat' | 'bao_cao_xac_minh'>('giay_moi');
  const [editCategory, setEditCategory] = useState('');
  const [editNgayLap, setEditNgayLap] = useState('');
  const [editCoQuanCapTren, setEditCoQuanCapTren] = useState('ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY');
  const [editCoQuanBanHanh, setEditCoQuanBanHanh] = useState('PHÒNG TIẾP CÔNG DÂN & XỬ LÝ ĐƠN');
  const [editNguoiNhan, setEditNguoiNhan] = useState('');
  const [editThoiGianHen, setEditThoiGianHen] = useState('');
  const [editDiaDiem, setEditDiaDiem] = useState('');
  const [editTrichYeu, setEditTrichYeu] = useState('');
  const [editNoiDungChiTiet, setEditNoiDungChiTiet] = useState('');
  const [editSigner, setEditSigner] = useState('Nguyễn Minh Anh');
  const [editChucVuSigner, setEditChucVuSigner] = useState('CÁN BỘ THỤ LÝ XÁC MINH');
  const [editTrangThai, setEditTrangThai] = useState<'du_thao' | 'da_ban_hanh'>('du_thao');
  const [editIsSignedVGCA, setEditIsSignedVGCA] = useState<boolean>(true);
  const [editFromXacMinh, setEditFromXacMinh] = useState<boolean>(false);
  const [editorZoom, setEditorZoom] = useState<number>(100);

  // Mở bản xem trước văn bản trực tiếp
  const handleStartEdit = (doc: DocItem) => {
    setActiveEditingDoc(doc);
    setEditSoHieu(doc.soHieu || `${Math.floor(10 + Math.random() * 89)}/VB`);
    const isBc = doc.loaiVanBan === 'bao_cao_de_xuat' || doc.loaiVanBan === 'bao_cao_xac_minh';
    const rawName = doc.tenVanBan || doc.name || 'Van_ban';
    setEditTenVanBan(isBc ? (doc.tenVanBan || 'Báo cáo kết quả xác minh') : rawName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    setEditLoaiVanBan(
      doc.loaiVanBan ||
      (rawName.toLowerCase().includes('giay_moi')
        ? 'giay_moi'
        : rawName.toLowerCase().includes('bien_ban')
          ? 'bien_ban'
          : rawName.toLowerCase().includes('cong_van')
            ? 'cong_van'
            : isBc || rawName.toLowerCase().includes('bao_cao')
              ? 'bao_cao_de_xuat'
              : 'quyet_dinh')
    );
    setEditCategory(isBc ? 'Báo cáo đề xuất' : (doc.category || 'Văn bản nghiệp vụ'));
    setEditNgayLap(doc.uploadDate ? doc.uploadDate.split(' ')[0] : '16/09/2026');
    setEditCoQuanBanHanh(doc.coQuanBanHanh || (isBc ? 'CƠ QUAN CẢNH SÁT ĐIỀU TRA' : 'Phòng Tiếp công dân & Xử lý đơn'));
    setEditCoQuanCapTren(isBc ? 'CÔNG AN TP. HÀ NỘI' : 'ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY');
    setEditNguoiNhan(doc.nguoiNhan || (isBc ? 'Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra' : (currentDon.nguoiNop || 'Nguyễn Văn A')));
    setEditThoiGianHen(doc.thoiGianHen || '08:30 ngày 18/09/2026');
    setEditDiaDiem(doc.diaDiem || 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)');
    setEditTrichYeu(doc.trichYeu || `V/v Xác minh đơn của ông/bà ${currentDon.nguoiNop}`);
    setEditNoiDungChiTiet(doc.noiDungChiTiet || doc.previewExcerpt || '');
    setEditSigner(doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh');
    setEditChucVuSigner(isBc ? 'ĐIỀU TRA VIÊN / CÁN BỘ ĐIỀU TRA' : 'CÁN BỘ THỤ LÝ XÁC MINH');
    setEditTrangThai(doc.trangThai === 'da_ban_hanh' ? 'da_ban_hanh' : 'du_thao');
    setEditFromXacMinh(Boolean(doc.fromXacMinh));
  };

  // Xử lý Đi trình ký trực tiếp từ dòng danh sách văn bản
  const handleTrinhKyFromRow = (doc: DocItem) => {
    // 1. Kiểm tra thông tin bắt buộc và nội dung văn bản trước khi trình ký
    if (!doc.soHieu || !doc.soHieu.trim()) {
      showToast('⚠️ Báo cáo chưa có Số ký hiệu văn bản. Vui lòng bấm "Chỉnh sửa" để bổ sung trước khi trình ký!');
      return;
    }

    if (!doc.noiDungChiTiet || !doc.noiDungChiTiet.trim()) {
      showToast('⚠️ Nội dung văn bản báo cáo chưa hoàn thiện. Vui lòng kiểm tra lại trước khi trình ký!');
      return;
    }

    // 2. Xác nhận chuyển trình ký
    const confirmMsg = `Xác nhận chuyển Báo cáo kết quả xác minh (Số: ${doc.soHieu}) sang luồng trình ký Lãnh đạo phê duyệt?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // 3. Cập nhật trong danh sách documents của tab
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id || (d.soHieu && d.soHieu === doc.soHieu)
          ? {
              ...d,
              signingStatus: 'cho_trinh',
              trangThai: 'du_thao',
            }
          : d
      )
    );

    // 4. Cập nhật trong signingDocuments
    const matchingSigningDoc = signingDocuments?.find(
      (sd) =>
        sd.id === doc.id ||
        sd.hoSoCode === currentDon.code ||
        (sd.loaiVanBan === 'bao_cao_de_xuat' || sd.loaiVanBan === 'to_trinh_thu_ly')
    );

    const updatedSigningDoc: SigningDocument = matchingSigningDoc
      ? {
          ...matchingSigningDoc,
          status: 'cho_trinh',
          thoiGianTrinh: `${todayStr} 10:15`,
          nguoiTrinh: doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh',
        }
      : {
          id: doc.id,
          soKyHieu: doc.soHieu,
          hoSoCode: currentDon.code,
          luotNhanId: currentDon.luotNhanId,
          loaiDon: currentDon.loaiDon || 'Đơn tố cáo',
          nguoiGuiDon: currentDon.nguoiNop,
          noiDungDon: currentDon.title,
          tenVanBan: doc.tenVanBan || 'Báo cáo kết quả xác minh',
          loaiVanBan: 'bao_cao_de_xuat',
          loaiVanBanLabel: 'Báo cáo đề xuất',
          trichYeu: doc.trichYeu || `V/v Xác minh đơn của ông/bà ${currentDon.nguoiNop}`,
          noiDungChiTiet: doc.noiDungChiTiet,
          nguoiLap: doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh',
          donViNguoiLap: doc.coQuanBanHanh || 'Cơ quan Cảnh sát điều tra',
          ngayTao: doc.uploadDate || `${todayStr} 09:00`,
          status: 'cho_trinh',
          thoiGianTrinh: `${todayStr} 10:15`,
          nguoiTrinh: doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh',
          mucDoUuTien: 'thuong',
          hanXuLy: '24 giờ',
          signers: [
            {
              id: 'ld-01',
              name: 'Đ/c Trần Văn Hùng',
              chucVu: 'Thủ trưởng / Phó Thủ trưởng Cơ quan Điều tra',
              coQuan: doc.coQuanBanHanh || 'Cơ quan Cảnh sát điều tra',
              vaiTro: 'duyet',
              thuTu: 1,
              status: 'cho_ky',
            },
          ],
          currentSignerIndex: 0,
          lanhDaoId: 'ld-01',
          lanhDaoName: 'Đ/c Trần Văn Hùng',
          lanhDaoChucVu: 'Thủ trưởng / Phó Thủ trưởng Cơ quan Điều tra',
          tepDinhKem: [
            {
              id: `att-bc-${Date.now()}`,
              tenTep: `Bao_cao_ket_qua_xac_minh_${currentDon.code}.pdf`,
              dungLuong: '380 KB',
              loai: 'du_thao',
            },
          ],
          phienBanHienTai: 'V1',
          versionHistory: [
            {
              version: 'V1',
              thoiGian: `${todayStr} 10:15`,
              nguoiTao: doc.signer || 'Nguyễn Minh Anh',
              trangThaiLucDo: 'Chờ trình ký',
              ghiChu: 'Trình Lãnh đạo Báo cáo kết quả xác minh',
              noiDungSnapshot: doc.noiDungChiTiet || '',
            },
          ],
          history: [
            {
              id: `hist-${Date.now()}`,
              time: `${todayStr} 10:15`,
              actor: doc.signer || 'Nguyễn Minh Anh',
              action: 'Chuyển trình Lãnh đạo phê duyệt',
            },
          ],
          auditLogs: [
            {
              id: `al-${Date.now()}`,
              time: `${todayStr} 10:15`,
              actor: doc.signer || 'Nguyễn Minh Anh',
              actorRole: 'Cán bộ thụ lý',
              action: 'Trình văn bản',
              statusBefore: 'nhap',
              statusAfter: 'cho_trinh',
              version: 'V1',
              note: doc.trichYeu,
            },
          ],
        };

    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prevDocs) => {
        const idx = prevDocs.findIndex((d) => d.id === updatedSigningDoc.id || d.hoSoCode === currentDon.code);
        if (idx >= 0) {
          const next = [...prevDocs];
          next[idx] = updatedSigningDoc;
          return next;
        }
        return [updatedSigningDoc, ...prevDocs];
      });
    }

    if (onTrinhKyBaoCao) {
      onTrinhKyBaoCao(updatedSigningDoc.id, updatedSigningDoc);
    }

    showToast(
      `✓ Đã chuyển Báo cáo kết quả xác minh (${doc.soHieu}) sang luồng trình ký Lãnh đạo thành công!`
    );
  };

  // Đóng trình soạn thảo trực tiếp
  const handleExitDirectEdit = () => {
    setActiveEditingDoc(null);
    onClearInitialEditingDoc?.();
  };

  // Lưu văn bản trực tiếp
  const handleSaveDirectEdit = () => {
    if (!editSoHieu.trim()) {
      showToast('Vui lòng nhập Số ký hiệu văn bản!');
      return;
    }

    const updatedDoc: DocItem = {
      ...(activeEditingDoc || {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        size: '450 KB',
        pages: 2,
        uploadDate: `${editNgayLap || '16/09/2026'} 10:00`,
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
      }),
      name: activeEditingDoc?.name || `${editTenVanBan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      soHieu: editSoHieu,
      category: editCategory || 'Văn bản xác minh',
      signer: `${editSigner || 'Nguyễn Minh Anh'}${editIsSignedVGCA ? ' (Ký số VGCA)' : ''}`,
      coQuanBanHanh: editCoQuanBanHanh,
      stepBelongsTo: activeEditingDoc?.stepBelongsTo || 'Bước 2: Xác minh thông tin & Đề xuất',
      loaiVanBan: editLoaiVanBan,
      nguoiNhan: editNguoiNhan,
      diaDiem: editDiaDiem,
      thoiGianHen: editThoiGianHen,
      trichYeu: editTrichYeu,
      noiDungChiTiet: editNoiDungChiTiet,
      previewExcerpt: editNoiDungChiTiet,
      trangThai: editTrangThai,
      fromXacMinh: editFromXacMinh,
    };

    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === updatedDoc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedDoc;
        return next;
      }
      return [updatedDoc, ...prev];
    });

    setActiveEditingDoc(updatedDoc);

    // Đồng bộ sang sharedVanBanList nếu có
    if ((updatedDoc.fromXacMinh || editFromXacMinh) && onUpdateSharedVanBanList) {
      onUpdateSharedVanBanList((prevList) => {
        const idx = prevList.findIndex((v) => v.id === updatedDoc.id || v.soKyHieu === updatedDoc.soHieu);
        const item: VanBanXacMinhItem = {
          id: updatedDoc.id,
          loai: (updatedDoc.loaiVanBan as any) || 'giay_moi',
          tenVanBan: editTenVanBan,
          soKyHieu: editSoHieu,
          ngayLap: editNgayLap || '16/09/2026',
          nguoiNhan: editNguoiNhan,
          trichYeu: editTrichYeu,
          noiDungChiTiet: editNoiDungChiTiet,
          diaDiem: editDiaDiem,
          thoiGianHen: editThoiGianHen,
          trangThai: editTrangThai,
        };
        if (idx >= 0) {
          const next = [...prevList];
          next[idx] = item;
          return next;
        }
        return [item, ...prevList];
      });
    }

    // Đồng bộ sang signingDocuments nếu là văn bản Báo cáo đề xuất / Tờ trình
    if (
      (updatedDoc.loaiVanBan === 'bao_cao_de_xuat' || updatedDoc.signingStatus) &&
      onUpdateSigningDocuments
    ) {
      onUpdateSigningDocuments((prevDocs) => {
        const existing = prevDocs.find(
          (d) =>
            d.id === updatedDoc.id ||
            (d.hoSoCode === currentDon.code && (d.loaiVanBan === 'bao_cao_de_xuat' || d.loaiVanBan === 'to_trinh_thu_ly'))
        );
        if (existing) {
          return prevDocs.map((d) =>
            d.id === existing.id
              ? {
                ...d,
                soKyHieu: editSoHieu,
                trichYeu: editTrichYeu,
                noiDungChiTiet: editNoiDungChiTiet,
                tenVanBan: editTenVanBan,
              }
              : d
          );
        }
        return prevDocs;
      });
    }

    showToast(`✓ Đã lưu thành công văn bản ${editSoHieu} vào Hồ sơ & Văn bản của đơn!`);
  };

  // Trình ký Báo cáo đề xuất Lãnh đạo trực tiếp từ trình xem trước A4
  const handleTrinhKyBaoCaoDirect = () => {
    if (!editSoHieu.trim()) {
      showToast('⚠️ Báo cáo chưa có Số ký hiệu văn bản. Vui lòng bổ sung trước khi trình ký!');
      return;
    }

    if (!editNoiDungChiTiet.trim() && !activeEditingDoc?.formData) {
      showToast('⚠️ Nội dung văn bản báo cáo chưa hoàn thiện. Vui lòng kiểm tra lại trước khi trình ký!');
      return;
    }

    const confirmMsg = `Xác nhận chuyển Báo cáo kết quả xác minh (Số: ${editSoHieu}) sang luồng trình ký Lãnh đạo phê duyệt?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    // 1. Lưu nội dung văn bản hiện tại
    handleSaveDirectEdit();

    // 2. Cập nhật DocItem trong danh sách documents
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeEditingDoc?.id || (d.soHieu && d.soHieu === editSoHieu)
          ? {
            ...d,
            signingStatus: 'cho_trinh',
            trangThai: 'du_thao',
            noiDungChiTiet: editNoiDungChiTiet,
            trichYeu: editTrichYeu,
            soHieu: editSoHieu,
          }
          : d
      )
    );

    if (activeEditingDoc) {
      setActiveEditingDoc((prev) =>
        prev
          ? {
            ...prev,
            signingStatus: 'cho_trinh',
            noiDungChiTiet: editNoiDungChiTiet,
            trichYeu: editTrichYeu,
            soHieu: editSoHieu,
          }
          : null
      );
    }

    // 3. Cập nhật hoặc tạo SigningDocument tương ứng với status 'cho_trinh'
    const matchingSigningDoc = signingDocuments?.find(
      (sd) =>
        sd.hoSoCode === currentDon.code &&
        (sd.loaiVanBan === 'bao_cao_de_xuat' || sd.loaiVanBan === 'to_trinh_thu_ly')
    );

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const preservedFormData = activeEditingDoc?.formData || (matchingSigningDoc as any)?.formData;

    const updatedSigningDoc: SigningDocument = matchingSigningDoc
      ? {
        ...matchingSigningDoc,
        status: 'cho_trinh',
        soKyHieu: editSoHieu,
        trichYeu: editTrichYeu,
        noiDungChiTiet: editNoiDungChiTiet,
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: editSigner || 'Nguyễn Minh Anh',
      }
      : {
        id: activeEditingDoc?.id || `VB-BC-${Date.now().toString().slice(-4)}`,
        soKyHieu: editSoHieu,
        hoSoCode: currentDon.code,
        luotNhanId: currentDon.luotNhanId,
        loaiDon: currentDon.loaiDon || 'Đơn tố cáo',
        nguoiGuiDon: currentDon.nguoiNop,
        noiDungDon: currentDon.title,
        tenVanBan: editTenVanBan || `Báo cáo đề xuất hướng xử lý đơn ${currentDon.code}`,
        loaiVanBan: 'bao_cao_de_xuat',
        loaiVanBanLabel: 'Báo cáo đề xuất hướng xử lý',
        trichYeu: editTrichYeu,
        noiDungChiTiet: editNoiDungChiTiet,
        nguoiLap: editSigner || 'Nguyễn Minh Anh',
        donViNguoiLap: editCoQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
        ngayTao: `${todayStr} 09:00`,
        status: 'cho_trinh',
        thoiGianTrinh: `${todayStr} 10:15`,
        nguoiTrinh: editSigner || 'Nguyễn Minh Anh',
        mucDoUuTien: 'thuong',
        hanXuLy: '24 giờ',
        signers: [
          {
            id: 'ld-01',
            name: 'Đ/c Trần Văn Hùng',
            chucVu: 'Phó Chánh Thanh tra thành phố',
            coQuan: 'Thanh tra Thành phố',
            vaiTro: 'duyet',
            thuTu: 1,
            status: 'cho_ky',
          },
        ],
        currentSignerIndex: 0,
        lanhDaoId: 'ld-01',
        lanhDaoName: 'Đ/c Trần Văn Hùng',
        lanhDaoChucVu: 'Phó Chánh Thanh tra thành phố',
        tepDinhKem: [
          {
            id: `att-bc-${Date.now()}`,
            tenTep: `Bao_cao_de_xuat_${currentDon.code}.pdf`,
            dungLuong: '380 KB',
            loai: 'du_thao',
          },
        ],
        phienBanHienTai: 'V1',
        versionHistory: [
          {
            version: 'V1',
            thoiGian: `${todayStr} 10:15`,
            nguoiTao: editSigner || 'Nguyễn Minh Anh',
            trangThaiLucDo: 'Chờ trình ký',
            ghiChu: 'Soạn thảo và trình ký Báo cáo đề xuất hướng xử lý',
            noiDungSnapshot: editNoiDungChiTiet,
          },
        ],
        history: [
          {
            id: `hist-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: editSigner || 'Nguyễn Minh Anh',
            action: 'Hoàn thiện báo cáo và trình Lãnh đạo phê duyệt',
          },
        ],
        auditLogs: [
          {
            id: `al-${Date.now()}`,
            time: `${todayStr} 10:15`,
            actor: editSigner || 'Nguyễn Minh Anh',
            actorRole: 'Cán bộ thụ lý',
            action: 'Trình văn bản',
            statusBefore: 'nhap',
            statusAfter: 'cho_trinh',
            version: 'V1',
            note: editTrichYeu,
          },
        ],
      };

    if (preservedFormData) {
      (updatedSigningDoc as any).formData = preservedFormData;
    }

    if (onUpdateSigningDocuments) {
      onUpdateSigningDocuments((prevDocs) => {
        const idx = prevDocs.findIndex((d) => d.id === updatedSigningDoc.id || d.hoSoCode === currentDon.code);
        if (idx >= 0) {
          const next = [...prevDocs];
          next[idx] = updatedSigningDoc;
          return next;
        }
        return [updatedSigningDoc, ...prevDocs];
      });
    }

    if (onTrinhKyBaoCao) {
      onTrinhKyBaoCao(updatedSigningDoc.id, updatedSigningDoc);
    }

    showToast(
      `✓ Đã trình ký Báo cáo kết quả xác minh (${editSoHieu}) tới Lãnh đạo thành công! Nghiệp vụ Thụ lý và Chỉnh sửa thông tin đã được mở khóa.`
    );
  };

  // Tạo văn bản xác minh mới trực tiếp ngay trong tab Hồ sơ & Văn bản (không cần quay lại popup)
  const handleCreateNewXacMinhDoc = (type: 'giay_moi' | 'bien_ban' | 'cong_van' | 'thong_bao') => {
    // Tự động lưu văn bản hiện hành nếu đang mở
    if (activeEditingDoc && editSoHieu) {
      handleSaveDirectEdit();
    }

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const nextDayStr = `${String(now.getDate() + 2).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    let newDoc: DocItem;
    if (type === 'giay_moi') {
      const count = documents.filter((d) => d.loaiVanBan === 'giay_moi').length;
      const soHieu = `${19 + count}/GM-TCD`;
      newDoc = {
        id: `DOC-XM-${Date.now().toString().slice(-4)}`,
        name: `Giay_moi_lam_viec_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Giấy mời xác minh',
        soHieu: soHieu,
        size: '390 KB',
        pages: 1,
        uploadDate: `${todayStr} 09:00`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn - UBND quận',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'giay_moi',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        thoiGianHen: `09:00 ngày ${nextDayStr}`,
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
        trichYeu: `V/v Mời làm việc xác minh nội dung đơn số ${currentDon.code}`,
        noiDungChiTiet: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày ${currentDon.ngayNhan || '16/09/2026'}.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
        previewExcerpt: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    } else if (type === 'bien_ban') {
      const count = documents.filter((d) => d.loaiVanBan === 'bien_ban').length;
      const soHieu = `0${3 + count}/BB-XM`;
      newDoc = {
        id: `DOC-XM-${Date.now().toString().slice(-4)}`,
        name: `Bien_ban_lam_viec_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Biên bản làm việc',
        soHieu: soHieu,
        size: '510 KB',
        pages: 2,
        uploadDate: `${todayStr} 14:00`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'bien_ban',
        nguoiNhan: `${currentDon.nguoiNop || 'Nguyễn Văn A'} (Công dân đứng đơn)`,
        thoiGianHen: `${todayStr} (14:30)`,
        diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
        trichYeu: `Biên bản ghi nhận ý kiến và giao nhận tài liệu hồ sơ ${currentDon.code}`,
        noiDungChiTiet: `Tại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu thu tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nCán bộ thụ lý đã tiếp nhận, kiểm tra tính pháp lý ban đầu và lập biên nhận bàn giao tài liệu phục vụ xác minh.`,
        previewExcerpt: `Tại buổi làm việc, công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} khẳng định...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    } else if (type === 'cong_van') {
      const count = documents.filter((d) => d.loaiVanBan === 'cong_van').length;
      const soHieu = `${106 + count}/CV-UBND`;
      newDoc = {
        id: `DOC-XM-${Date.now()}`,
        name: `Cong_van_de_nghi_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Công văn phối hợp',
        soHieu: soHieu,
        size: '420 KB',
        pages: 2,
        uploadDate: `${todayStr} 10:30`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'UBND quận - Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'cong_van',
        nguoiNhan: 'Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy',
        thoiGianHen: `Thời hạn phản hồi: Trong 03 ngày làm việc kể từ ngày nhận công văn`,
        diaDiem: 'Gửi qua Trục liên thông văn bản điện tử thành phố',
        trichYeu: `V/v Đề nghị cung cấp hồ sơ địa chính và tình trạng giải quyết liên quan đến đơn ${currentDon.code}`,
        noiDungChiTiet: `Để có căn cứ xử lý đơn của công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} theo đúng quy định pháp luật, Phòng Tiếp công dân & Xử lý đơn đề nghị Quý cơ quan kiểm tra, sao lục và cung cấp toàn bộ hồ sơ đăng ký cấp GCNQSDĐ của đương sự trước ngày ${nextDayStr}.\nVăn bản phản hồi đề nghị gửi về Phòng Tiếp công dân qua Trục liên thông văn bản điện tử thành phố.`,
        previewExcerpt: `Để có căn cứ xử lý đơn của công dân...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    } else {
      const count = documents.filter((d) => d.loaiVanBan === 'thong_bao').length;
      const soHieu = `${20 + count}/TB-TCD`;
      newDoc = {
        id: `DOC-XM-${Date.now()}`,
        name: `Thong_bao_yeu_cau_bo_sung_so_${soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        category: 'Thông báo hành chính',
        soHieu: soHieu,
        size: '360 KB',
        pages: 1,
        uploadDate: `${todayStr} 11:00`,
        signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
        coQuanBanHanh: 'Phòng Tiếp công dân & Xử lý đơn',
        stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
        ocrStatus: 'Hoàn tất',
        isProcessDoc: true,
        isEditable: true,
        loaiVanBan: 'thong_bao',
        nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
        thoiGianHen: 'Thời hạn bổ sung: 10 ngày kể từ ngày nhận thông báo',
        diaDiem: 'Bộ phận Tiếp nhận & Trả kết quả một cửa',
        trichYeu: `V/v Yêu cầu bổ sung tài liệu chứng cứ đối với đơn ${currentDon.code}`,
        noiDungChiTiet: `Qua kiểm tra nội dung đơn số ${currentDon.code} của Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'}, cơ quan thụ lý nhận thấy hồ sơ chưa có đầy đủ tài liệu chứng cứ gốc chứng minh hành vi sai phạm.\nĐể có cơ sở xem xét thụ lý theo quy định tại Điều 29 Luật Tố cáo 2018, đề nghị Ông/Bà bổ sung:\n1. Bản sao có chứng thực giấy chứng nhận quyền sử dụng đất;\n2. Giấy tờ ủy quyền (nếu có đại diện);\n3. Tài liệu giao dịch tài chính có xác nhận ngân hàng.\nHết thời hạn 10 ngày nêu trên, nếu không bổ sung thì đơn sẽ không đủ điều kiện để thụ lý giải quyết.`,
        previewExcerpt: `Qua kiểm tra nội dung đơn số ${currentDon.code}...`,
        trangThai: 'du_thao',
        fromXacMinh: true,
      };
    }

    setDocuments((prev) => [newDoc, ...prev]);
    handleStartEdit(newDoc);

    if (onUpdateSharedVanBanList) {
      const xmItem: VanBanXacMinhItem = {
        id: newDoc.id,
        loai: (newDoc.loaiVanBan as any) || 'giay_moi',
        tenVanBan: newDoc.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        soKyHieu: newDoc.soHieu || '',
        ngayLap: todayStr,
        nguoiNhan: newDoc.nguoiNhan || '',
        trichYeu: newDoc.trichYeu || '',
        noiDungChiTiet: newDoc.noiDungChiTiet || '',
        diaDiem: newDoc.diaDiem,
        thoiGianHen: newDoc.thoiGianHen,
        trangThai: 'du_thao',
      };
      onUpdateSharedVanBanList((prev) => [xmItem, ...prev]);
    }

    showToast(`✓ Đã tạo thêm "${newDoc.soHieu}". Bạn có thể chỉnh sửa trực tiếp trên mặt giấy A4!`);
  };

  // Đồng bộ sharedVanBanList vào documents nếu có văn bản mới được tạo từ Modal Xác minh
  useEffect(() => {
    if (sharedVanBanList && sharedVanBanList.length > 0) {
      setDocuments((prev) => {
        let changed = false;
        let nextDocs = [...prev];
        sharedVanBanList.forEach((xm) => {
          const exists = nextDocs.some((d) => d.id === xm.id || (d.soHieu && d.soHieu === xm.soKyHieu));
          if (!exists) {
            changed = true;
            nextDocs.unshift({
              id: xm.id,
              name: (xm as any).name || `${(xm.tenVanBan || xm.soKyHieu || 'van_ban').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              category:
                xm.loai === 'giay_moi'
                  ? 'Giấy mời xác minh'
                  : xm.loai === 'bien_ban'
                    ? 'Biên bản làm việc'
                    : 'Công văn phối hợp',
              soHieu: xm.soKyHieu,
              size: xm.dungLuongFile || '450 KB',
              pages: 1,
              uploadDate: `${xm.ngayLap} 09:30`,
              signer: 'Nguyễn Minh Anh - Cán bộ thụ lý',
              coQuanBanHanh: xm.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
              stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
              ocrStatus: 'Hoàn tất',
              isProcessDoc: true,
              isEditable: true,
              loaiVanBan: (xm.loai as any) || 'giay_moi',
              nguoiNhan: xm.nguoiNhan,
              diaDiem: xm.diaDiem,
              thoiGianHen: xm.thoiGianHen,
              trichYeu: xm.trichYeu,
              noiDungChiTiet: xm.noiDungChiTiet,
              previewExcerpt: xm.noiDungChiTiet,
              trangThai: xm.trangThai,
              fromXacMinh: true,
            });
          }
        });
        return changed ? nextDocs : prev;
      });
    }
  }, [sharedVanBanList]);

  // Đồng bộ văn bản trình ký / Báo cáo đề xuất (SigningDocument) thuộc đơn này vào Hồ sơ & Văn bản
  useEffect(() => {
    if (!signingDocuments || signingDocuments.length === 0) return;

    // Lọc các văn bản thuộc đơn đang mở
    const relevantSigningDocs = signingDocuments.filter(
      (sd) =>
        sd.hoSoCode === currentDon.code ||
        sd.luotNhanId === currentDon.luotNhanId ||
        (currentDon.id && sd.hoSoCode === currentDon.id)
    );

    if (relevantSigningDocs.length === 0) return;

    setDocuments((prev) => {
      let nextDocs = [...prev];
      let hasChanges = false;

      relevantSigningDocs.forEach((sd) => {
        const isBc = sd.loaiVanBan === 'bao_cao_de_xuat' || sd.loaiVanBan === 'bao_cao_xac_minh';
        const item: DocItem = {
          id: sd.id,
          name: (sd as any).name || `${(sd.tenVanBan || sd.soKyHieu || 'Bao_cao_ket_qua_xac_minh').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          category: isBc ? 'Báo cáo đề xuất' : (sd.loaiVanBanLabel || 'Văn bản trình ký'),
          tenVanBan: sd.tenVanBan || (isBc ? 'Báo cáo kết quả xác minh' : undefined),
          soHieu: sd.soKyHieu,
          size: sd.tepDinhKem?.[0]?.dungLuong || '340 KB',
          pages: 2,
          uploadDate: sd.ngayTao,
          signer: `${sd.nguoiLap} (${sd.donViNguoiLap || 'Điều tra viên'})`,
          coQuanBanHanh: sd.donViNguoiLap || 'Phòng Tiếp công dân & Xử lý đơn',
          stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
          ocrStatus: 'Hoàn tất',
          isProcessDoc: true,
          isEditable: true,
          loaiVanBan: (sd.loaiVanBan as any) || 'bao_cao_de_xuat',
          trichYeu: sd.trichYeu,
          noiDungChiTiet: sd.noiDungChiTiet,
          previewExcerpt: sd.noiDungChiTiet,
          trangThai: sd.status === 'da_ky' || sd.status === 'hoan_tat' ? 'da_ban_hanh' : 'du_thao',
          fromXacMinh: true,
          signingStatus: sd.status,
          formData: (sd as any).formData,
        };

        const existingIdx = nextDocs.findIndex((d) => d.id === sd.id || (d.soHieu && d.soHieu === sd.soKyHieu));
        if (existingIdx >= 0) {
          // Cập nhật trạng thái và nội dung nếu đã tồn tại
          if (
            nextDocs[existingIdx].signingStatus !== sd.status ||
            nextDocs[existingIdx].soHieu !== sd.soKyHieu ||
            nextDocs[existingIdx].previewExcerpt !== sd.noiDungChiTiet ||
            (sd as any).formData
          ) {
            nextDocs[existingIdx] = {
              ...nextDocs[existingIdx],
              ...item,
              formData: (sd as any).formData || nextDocs[existingIdx].formData,
            };
            hasChanges = true;
          }
        } else {
          // Thêm mới lên đầu danh sách văn bản
          nextDocs = [item, ...nextDocs];
          hasChanges = true;
        }
      });

      return hasChanges ? nextDocs : prev;
    });
  }, [signingDocuments, currentDon.code, currentDon.luotNhanId, currentDon.id]);

  // Tự động nhận prop initialEditingDoc từ Modal Xác minh
  useEffect(() => {
    if (initialEditingDoc) {
      const match = documents.find(
        (d) => d.id === initialEditingDoc.id || (d.soHieu && d.soHieu === initialEditingDoc.soHieu)
      );
      if (match) {
        handleStartEdit({
          ...match,
          ...initialEditingDoc,
          name: match.name,
        } as DocItem);
      } else {
        const newDoc: DocItem = {
          id: initialEditingDoc.id || `DOC-XM-${Date.now().toString().slice(-4)}`,
          name:
            (initialEditingDoc as any).name ||
            `${(initialEditingDoc.tenVanBan || initialEditingDoc.soHieu || 'van_ban').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          category: initialEditingDoc.category || 'Văn bản xác minh',
          soHieu: initialEditingDoc.soHieu,
          size: '420 KB',
          pages: 1,
          uploadDate: `${initialEditingDoc.ngayLap || '16/09/2026'} 09:30`,
          signer: initialEditingDoc.signer || 'Nguyễn Minh Anh - Cán bộ thụ lý',
          coQuanBanHanh: initialEditingDoc.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn',
          stepBelongsTo: 'Bước 2: Xác minh thông tin & Đề xuất',
          ocrStatus: 'Hoàn tất',
          isProcessDoc: true,
          isEditable: true,
          loaiVanBan: (initialEditingDoc.loai as any) || 'giay_moi',
          nguoiNhan: initialEditingDoc.nguoiNhan || currentDon.nguoiNop || 'Nguyễn Văn A',
          diaDiem: initialEditingDoc.diaDiem,
          thoiGianHen: initialEditingDoc.thoiGianHen,
          trichYeu: initialEditingDoc.trichYeu,
          noiDungChiTiet: initialEditingDoc.noiDungChiTiet || '',
          previewExcerpt: initialEditingDoc.noiDungChiTiet || '',
          trangThai: (initialEditingDoc.trangThai as any) || 'du_thao',
          fromXacMinh: initialEditingDoc.fromXacMinh ?? true,
        };
        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
        handleStartEdit(newDoc);
      }
    }
  }, [initialEditingDoc]);

  // Các mẫu văn bản soạn thảo nhanh trong editor
  const DIRECT_TEMPLATES = [
    {
      title: 'Báo cáo đề xuất thụ lý (Mẫu BC-ĐX)',
      type: 'bao_cao_de_xuat' as any,
      ten: `Báo cáo đề xuất hướng xử lý đơn ${currentDon.code}`,
      soHieu: '01/BC-ĐX',
      trichYeu: `V/v Kiểm tra ban đầu và đề xuất thụ lý giải quyết đơn ${currentDon.code}`,
      thoiGian: '16/09/2026',
      diaDiem: 'Công an cấp xã / Cơ quan thụ lý',
      nguoiNhan: 'Lãnh đạo đơn vị có thẩm quyền giải quyết',
      noiDung: `Kính gửi: Lãnh đạo Công an cấp xã\n\nCăn cứ Luật Tố cáo năm 2018;\nCăn cứ Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh;\nCăn cứ Thông tư số 129/2020/TT-BCA ngày 08/12/2020 của Bộ trưởng Bộ Công an;\n\nCán bộ thụ lý báo cáo kết quả kiểm tra ban đầu đối với hồ sơ đơn số: ${currentDon.code} của người làm đơn ${currentDon.nguoiNop}:\n\n1. THÔNG TIN NGƯỜI LÀM ĐƠN VÀ ĐỐI TƯỢNG BỊ TỐ CÁO\n- Người làm đơn: ${currentDon.nguoiNop}, CCCD: ${currentDon.cccd || '001088012345'}.\n- Người làm đơn có đủ năng lực hành vi dân sự, đơn ghi rõ ngày tháng và có chữ ký trực tiếp.\n- Đối tượng bị tố cáo: Hành vi sai phạm quy định pháp luật trong quản lý đất đai và trật tự xây dựng.\n\n2. TÓM TẮT NỘI DUNG ĐƠN VÀ TÀI LIỆU KÈM THEO\n- Nội dung đơn: ${currentDon.title || 'Tố cáo hành vi vi phạm trật tự xây dựng và quản lý đất đai'}.\n- Tài liệu gửi kèm: Bản sao Giấy chứng nhận quyền sử dụng đất, tài liệu hình ảnh sai phạm.\n\n3. KẾT QUẢ KIỂM TRA ĐIỀU KIỆN THỤ LÝ\n- Đơn thuộc thẩm quyền giải quyết của cơ quan.\n- Nội dung tố cáo có căn cứ pháp lý rõ ràng, không thuộc các trường hợp không được thụ lý quy định tại Điều 29 Luật Tố cáo 2018.\n\n4. ĐỀ XUẤT HƯỚNG XỬ LÝ\nKính trình Lãnh đạo phê duyệt:\n- Đồng ý THỤ LÝ GIẢI QUYẾT nội dung đơn theo quy định của pháp luật.\n- Ban hành Quyết định thụ lý giải quyết và phân công Cán bộ/Tổ xác minh tiến hành các bước tiếp theo.`,
    },
    {
      title: 'Giấy mời làm việc xác minh (Mẫu 18/GM)',
      type: 'giay_moi' as const,
      ten: 'Giấy mời làm việc xác minh nội dung đơn',
      soHieu: '18/GM-TCD',
      trichYeu: `V/v Mời làm việc xác minh nội dung đơn số ${currentDon.code}`,
      thoiGian: '09:00 ngày 18/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)',
      nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
      noiDung: `Kính mời Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} có mặt tại Phòng Tiếp công dân để làm việc về nội dung đơn đề ngày 16/09/2026.\nKhi đi mang theo Căn cước công dân và toàn bộ bản chính tài liệu, chứng cứ có liên quan đến việc phản ánh/tố cáo để đối chiếu, xác minh làm rõ theo quy định pháp luật.`,
    },
    {
      title: 'Biên bản làm việc xác minh (Mẫu 02/BB)',
      type: 'bien_ban' as const,
      ten: 'Biên bản làm việc xác minh thông tin ban đầu',
      soHieu: '02/BB-XM',
      trichYeu: `Biên bản ghi nhận ý kiến và giao nhận tài liệu hồ sơ ${currentDon.code}`,
      thoiGian: '14:30 ngày 17/09/2026',
      diaDiem: 'Phòng Tiếp công dân & Xử lý đơn',
      nguoiNhan: `${currentDon.nguoiNop || 'Nguyễn Văn A'} (Công dân đứng đơn)`,
      noiDung: `Hồi 14 giờ 30 phút, ngày 17/09/2026, tại Phòng Tiếp công dân & Xử lý đơn.\nThành phần làm việc gồm:\n1. Cán bộ thụ lý: Nguyễn Minh Anh - Chuyên viên thụ lý giải quyết đơn.\n2. Người làm việc: Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'} (Người đứng đơn).\nNội dung làm việc:\nCán bộ đã tiến hành làm rõ các mốc thời gian, đối tượng có hành vi sai phạm được nêu trong đơn. Công dân khẳng định nội dung đơn gửi là hoàn toàn chính xác, cam kết chịu trách nhiệm trước pháp luật.\nCông dân đã giao nộp bản sao chứng thực Hợp đồng góp vốn, phiếu nộp tiền và biên bản làm việc với Chi nhánh Văn phòng Đăng ký đất đai.\nBiên bản được lập thành 02 bản có giá trị như nhau, đọc lại cho các bên cùng nghe và ký tên xác nhận.`,
    },
    {
      title: 'Công văn đề nghị phối hợp xác minh (CV-UBND)',
      type: 'cong_van' as const,
      ten: 'Công văn đề nghị cung cấp hồ sơ, tài liệu phục vụ xác minh',
      soHieu: '105/CV-UBND',
      trichYeu: `V/v Đề nghị cung cấp hồ sơ địa chính và tình trạng giải quyết liên quan đến đơn ${currentDon.code}`,
      thoiGian: 'Thời hạn cung cấp: Trong 03 ngày làm việc',
      diaDiem: 'Gửi qua Trục liên thông văn bản điện tử thành phố',
      nguoiNhan: 'Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy',
      noiDung: `Để có đầy đủ căn cứ xác minh, giải quyết đơn phản ánh/tố cáo của công dân ${currentDon.nguoiNop || 'Nguyễn Văn A'} theo đúng quy định pháp luật;\nPhòng Tiếp công dân & Xử lý đơn kính đề nghị Quý cơ quan kiểm tra, rà soát và cung cấp toàn bộ hồ sơ đăng ký cấp GCNQSDĐ của đương sự trước ngày 20/09/2026.\nVăn bản phúc đáp và tài liệu gửi kèm đề nghị chuyển qua Trục liên thông văn bản điện tử của thành phố.`,
    },
    {
      title: 'Thông báo yêu cầu bổ sung hồ sơ (Mẫu 02/TB)',
      type: 'thong_bao' as const,
      ten: 'Thông báo yêu cầu bổ sung thông tin, tài liệu chứng cứ',
      soHieu: '19/TB-TCD',
      trichYeu: `V/v Yêu cầu bổ sung tài liệu chứng cứ đối với đơn ${currentDon.code}`,
      thoiGian: 'Thời hạn bổ sung: 10 ngày kể từ ngày nhận thông báo',
      diaDiem: 'Bộ phận Tiếp nhận & Trả kết quả một cửa',
      nguoiNhan: currentDon.nguoiNop || 'Nguyễn Văn A',
      noiDung: `Qua kiểm tra nội dung đơn số ${currentDon.code} của Ông/Bà ${currentDon.nguoiNop || 'Nguyễn Văn A'}, cơ quan thụ lý nhận thấy hồ sơ chưa có đầy đủ tài liệu chứng cứ gốc chứng minh hành vi sai phạm.\nĐể có cơ sở xem xét thụ lý theo quy định tại Điều 29 Luật Tố cáo 2018, đề nghị Ông/Bà bổ sung:\n1. Bản sao có chứng thực giấy chứng nhận quyền sử dụng đất;\n2. Giấy tờ ủy quyền (nếu có đại diện);\n3. Tài liệu giao dịch tài chính có xác nhận ngân hàng.\nHết thời hạn 10 ngày nêu trên, nếu không bổ sung thì đơn sẽ không đủ điều kiện để thụ lý giải quyết.`,
    },
  ];

  // Modal thêm văn bản / quyết định xử lý
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    soHieu: '',
    category: 'Quyết định tố tụng',
    stepBelongsTo: 'Bước 3: Phân công thụ lý & Xác minh',
    coQuanBanHanh: isToGiac ? 'Cơ quan CSĐT Công an TP. Hà Nội' : 'UBND quận/huyện',
    signer: isToGiac ? 'Thượng tá Trần Quốc Dũng - Phó Thủ trưởng CQĐT' : 'Chủ tịch UBND quận',
    previewExcerpt: '',
    pages: 2,
    size: '680 KB',
    isSignedVGCA: true,
    autoOcr: true,
  });

  // Sync count to parent
  useEffect(() => {
    onDocCountChange?.(documents.length);
  }, [documents.length, onDocCountChange]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Các mẫu văn bản / quyết định xử lý phổ biến
  const QUICK_TEMPLATES = [
    {
      title: 'Quyết định phân công thụ lý / Điều tra viên',
      category: 'Quyết định tố tụng',
      soHieu: '45/QĐ-PC03',
      step: 'Bước 3: Phân công Điều tra viên',
      excerpt: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nCƠ QUAN CSĐT CÔNG AN TP. HÀ NỘI\nSố: 45/QĐ-PC03\n\nQUYẾT ĐỊNH\nPhân công Phó Thủ trưởng Cơ quan điều tra và Điều tra viên thụ lý giải quyết nguồn tin về tội phạm\n\nCăn cứ Điều 36, Điều 145 và Điều 146 Bộ luật Tố tụng hình sự 2015;\nXét đơn tố giác tội phạm số ${currentDon.code} của công dân ${currentDon.nguoiNop};\n\nQUYẾT ĐỊNH:\nĐiều 1. Phân công Trung tá Lê Văn Nam - Điều tra viên chính thụ lý xác minh nguồn tin.\nĐiều 2. Thời hạn giải quyết nguồn tin là 20 ngày kể từ ngày ban hành quyết định này.`,
    },
    {
      title: 'Thông báo thụ lý giải quyết đơn',
      category: 'Thông báo thụ lý',
      soHieu: '22/TB-TL',
      step: 'Bước 2: Thông báo thụ lý',
      excerpt: `THÔNG BÁO\nVề việc thụ lý giải quyết đơn thư\n\nKính gửi: Ông/bà ${currentDon.nguoiNop}\nCơ quan có thẩm quyền thông báo đã tiếp nhận và chính thức thụ lý giải quyết nội dung đơn số ${currentDon.code}.\nThời hạn giải quyết theo quy định của pháp luật hiện hành. Đề nghị người làm đơn phối hợp cung cấp tài liệu khi có yêu cầu.`,
    },
    {
      title: 'Quyết định thành lập Tổ / Đoàn xác minh',
      category: 'Quyết định hành chính',
      soHieu: '108/QĐ-UBND',
      step: 'Bước 3: Thành lập Tổ xác minh',
      excerpt: `QUYẾT ĐỊNH\nVề việc thành lập Tổ xác minh nội dung đơn\n\nCăn cứ Luật Khiếu nại, Luật Tố cáo;\nQUYẾT ĐỊNH:\nĐiều 1. Thành lập Tổ xác minh gồm 03 đồng chí do Trưởng phòng chuyên môn làm Tổ trưởng.\nĐiều 2. Tổ xác minh có trách nhiệm kiểm tra thực địa, thu thập chứng cứ và báo cáo kết quả trong 15 ngày làm việc.`,
    },
    {
      title: 'Công văn yêu cầu tra soát tài chính / Sao kê ngân hàng',
      category: 'Công văn phối hợp',
      soHieu: '92/CV-CQĐT',
      step: 'Bước 4: Xác minh dòng tiền & Chứng cứ',
      excerpt: `CÔNG VĂN YÊU CẦU CUNG CẤP THÔNG TIN TÀI LIỆU\n\nKính gửi: Các Ngân hàng TMCP trên địa bàn thành phố\nCơ quan điều tra đang tiến hành thụ lý xác minh nguồn tin tố giác lừa đảo chiếm đoạt tài sản.\nĐề nghị Quý Ngân hàng phối hợp cung cấp lịch sử giao dịch và bản in sao kê tài khoản của các đối tượng liên quan theo danh sách đính kèm.`,
    },
    {
      title: 'Biên bản làm việc / Ghi lời khai người làm đơn',
      category: 'Biên bản làm việc',
      soHieu: 'BB-01/XL',
      step: 'Bước 4: Làm việc & Thu thập chứng cứ',
      excerpt: `BIÊN BẢN LÀM VIỆC & GHI LỜI KHAI\n\nHồi 09 giờ 00 phút, ngày 17/09/2026 tại Trụ sở cơ quan.\nThành phần tham gia:\n1. Cán bộ thụ lý / Điều tra viên: Nguyễn Minh Anh\n2. Người được mời làm việc: ${currentDon.nguoiNop}\nNội dung làm việc: Xác minh làm rõ nội dung đơn số ${currentDon.code}, đối chiếu các giao dịch tài chính và bổ sung tài liệu chứng cứ gốc.`,
    },
    {
      title: 'Phiếu hướng dẫn / Yêu cầu bổ sung chứng cứ',
      category: 'Văn bản hướng dẫn',
      soHieu: '14/HD-TTD',
      step: 'Bước 2: Kiểm tra chứng cứ gốc',
      excerpt: `PHIẾU HƯỚNG DẪN BỔ SUNG TÀI LIỆU, CHỨNG CỨ\n\nKính gửi: Ông/bà ${currentDon.nguoiNop}\nSau khi kiểm tra hồ sơ số ${currentDon.code}, cơ quan thụ lý đề nghị công dân bổ sung các tài liệu sau:\n1. Bản in sao kê ngân hàng có dấu đỏ xác nhận của tổ chức tín dụng;\n2. Văn bản ủy quyền có chứng thực của cơ quan công chứng có thẩm quyền.\nThời hạn bổ sung: Trong vòng 07 ngày làm việc.`,
    },
  ];

  const handleApplyTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    const cleanFileName = tpl.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    setAddForm((prev) => ({
      ...prev,
      name: `${cleanFileName}_so_${tpl.soHieu.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      soHieu: tpl.soHieu,
      category: tpl.category,
      stepBelongsTo: tpl.step,
      previewExcerpt: tpl.excerpt,
      pages: Math.floor(Math.random() * 3 + 1),
      size: `${Math.floor(Math.random() * 500 + 350)} KB`,
    }));
  };

  const handleOpenAddModal = () => {
    // Mặc định chọn mẫu đầu tiên
    handleApplyTemplate(QUICK_TEMPLATES[0]);
    setShowAddModal(true);
  };

  const handleSaveAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      alert('Vui lòng nhập tên tệp tin văn bản hoặc quyết định!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDoc: DocItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: addForm.name.endsWith('.pdf') ? addForm.name : `${addForm.name}.pdf`,
      category: addForm.category,
      soHieu: addForm.soHieu || `${Math.floor(Math.random() * 89 + 10)}/QĐ`,
      size: addForm.size || '520 KB',
      pages: addForm.pages || 2,
      uploadDate: timeStr,
      signer: `${addForm.signer}${addForm.isSignedVGCA ? ' (Ký số VGCA)' : ''}`,
      coQuanBanHanh: addForm.coQuanBanHanh,
      stepBelongsTo: addForm.stepBelongsTo,
      ocrStatus: 'Hoàn tất',
      isProcessDoc: true,
      previewExcerpt: addForm.previewExcerpt || `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\n${addForm.name}\nSố: ${addForm.soHieu}\nBan hành bởi: ${addForm.coQuanBanHanh}\nNgười ký: ${addForm.signer}\nNội dung: Tài liệu phát sinh trong quá trình xử lý đơn ${currentDon.code}.`,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowAddModal(false);
    showToast(`✓ Đã thêm văn bản / quyết định "${newDoc.name}" vào hồ sơ xử lý thành công!`);
  };

  const handleDeleteDoc = (docId: string, docName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa văn bản "${docName}" khỏi hồ sơ vụ việc?`)) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast(`✓ Đã xóa văn bản "${docName}".`);
    }
  };

  const handleOpenPreview = (doc: DocItem) => {
    setSelectedDoc(doc);
    setShowPreviewModal(true);
    setPreviewZoom(100);
  };

  const processDocsCount = documents.filter((d) => d.isProcessDoc).length;
  const initialDocsCount = documents.filter((d) => !d.isProcessDoc).length;

  const verificationDocs = documents.filter(
    (d) =>
      d.fromXacMinh ||
      d.loaiVanBan === 'giay_moi' ||
      d.loaiVanBan === 'bien_ban' ||
      d.loaiVanBan === 'cong_van' ||
      d.loaiVanBan === 'thong_bao' ||
      d.stepBelongsTo?.includes('Xác minh') ||
      (sharedVanBanList && sharedVanBanList.some((s) => s.id === d.id || s.soKyHieu === d.soHieu))
  );

  const filteredDocs = documents.filter((doc) => {
    const matchTab =
      filterTab === 'all' ||
      (filterTab === 'process' && doc.isProcessDoc) ||
      (filterTab === 'initial' && !doc.isProcessDoc);

    const matchSearch =
      !searchKeyword.trim() ||
      doc.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (doc.soHieu && doc.soHieu.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      doc.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      doc.signer.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchTab && matchSearch;
  });

  const isEditingBaoCao = Boolean(
    activeEditingDoc &&
      (activeEditingDoc.loaiVanBan === 'bao_cao_de_xuat' ||
        activeEditingDoc.loaiVanBan === 'bao_cao_xac_minh' ||
        activeEditingDoc.tenVanBan?.includes('Báo cáo') ||
        activeEditingDoc.name.toLowerCase().includes('bao_cao'))
  );
  const activeBaoCaoFormData = (activeEditingDoc?.formData || {}) as Partial<BaoCaoDeXuatFormData>;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {activeEditingDoc ? (
        /* ========================================================================= */
        /* TRÌNH XEM TRƯỚC VĂN BẢN THEO BIỂU MẪU CHUẨN & SOẠN THẢO TRỰC TIẾP A4     */
        /* ========================================================================= */
        <div className="space-y-4 animate-fade-in">
          {/* 1. TOP HEADER & ACTION CONTROLS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleExitDirectEdit}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:border-slate-300 active:scale-95"
                title="Quay lại danh sách văn bản trong hồ sơ"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">arrow_back</span>
                <span>Quay lại danh mục</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900">
                  {isEditingBaoCao ? 'Bản xem trước văn bản:' : 'Soạn thảo A4:'}{' '}
                  <span className="text-[#004ac6]">{activeBaoCaoFormData.soBaoCao || editSoHieu || activeEditingDoc.soHieu || activeEditingDoc.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold border bg-blue-50 text-[#004ac6] border-blue-200">
                  {isEditingBaoCao ? 'Báo cáo đề xuất' : (activeEditingDoc.category || 'Văn bản nghiệp vụ')}
                </span>

                {activeEditingDoc.signingStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      activeEditingDoc.signingStatus === 'nhap'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : activeEditingDoc.signingStatus === 'da_ky' || activeEditingDoc.signingStatus === 'hoan_tat'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : activeEditingDoc.signingStatus === 'yeu_cau_chinh_sua'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {activeEditingDoc.signingStatus === 'nhap'
                        ? 'edit_note'
                        : activeEditingDoc.signingStatus === 'da_ky' || activeEditingDoc.signingStatus === 'hoan_tat'
                        ? 'verified'
                        : activeEditingDoc.signingStatus === 'yeu_cau_chinh_sua'
                        ? 'replay'
                        : 'pending_actions'}
                    </span>
                    <span>
                      {activeEditingDoc.signingStatus === 'nhap'
                        ? 'Bản nháp'
                        : activeEditingDoc.signingStatus === 'da_ky' || activeEditingDoc.signingStatus === 'hoan_tat'
                        ? 'Đã ký duyệt'
                        : activeEditingDoc.signingStatus === 'yeu_cau_chinh_sua'
                        ? 'Cần chỉnh sửa'
                        : 'Chờ ký duyệt'}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditorZoom((z) => Math.max(70, z - 10))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 text-xs font-bold cursor-pointer"
                  title="Thu nhỏ"
                >
                  -
                </button>
                <span className="text-[11px] font-bold text-slate-700 px-1">{editorZoom}%</span>
                <button
                  type="button"
                  onClick={() => setEditorZoom((z) => Math.min(130, z + 10))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 text-xs font-bold cursor-pointer"
                  title="Phóng to"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="In trang A4"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">print</span>
                <span className="hidden md:inline">In A4</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  showToast(
                    `✓ Đang xuất tệp "${(activeBaoCaoFormData.soBaoCao || editSoHieu || 'Bao_cao').replace(/[^a-zA-Z0-9]/g, '_')}.docx" chuẩn thể thức!`
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Tải tệp tin Word .docx"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">description</span>
                <span className="hidden md:inline">Tải .DOCX</span>
              </button>

              {/* Nút Chỉnh sửa thông tin Báo cáo (Mở popup form) */}
              {isEditingBaoCao && onOpenBaoCaoDeXuat && (
                <button
                  type="button"
                  onClick={() => onOpenBaoCaoDeXuat(activeEditingDoc)}
                  className="px-3.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50/90 hover:bg-blue-100 text-[#004ac6] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Mở popup để chỉnh sửa các trường thông tin Báo cáo đề xuất"
                >
                  <span className="material-symbols-outlined text-[17px]">edit_note</span>
                  <span>Chỉnh sửa thông tin</span>
                </button>
              )}

              {/* Nút Đi trình ký (Nếu là báo cáo) hoặc Lưu văn bản (Nếu là văn bản khác) */}
              {isEditingBaoCao ? (
                activeEditingDoc.signingStatus === 'nhap' ? (
                  <button
                    type="button"
                    onClick={handleTrinhKyBaoCaoDirect}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    title="Chuyển Báo cáo kết quả xác minh sang luồng trình ký Lãnh đạo"
                  >
                    <span className="material-symbols-outlined text-[17px]">send</span>
                    <span>Đi trình ký</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Đã trình ký</span>
                  </span>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDirectEdit}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Lưu lại các chỉnh sửa trên văn bản"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu văn bản</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. BODY TRÌNH DIỄN VĂN BẢN A4 */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full bg-slate-200/80 rounded-2xl p-4 sm:p-8 flex justify-center border border-slate-300 overflow-x-auto shadow-inner">
              <div
                className="bg-white shadow-2xl rounded-sm border border-slate-300 w-full max-w-[840px] min-h-[1100px] p-8 sm:p-14 text-slate-900 font-serif relative transition-transform origin-top flex flex-col justify-between"
                style={{ transform: `scale(${editorZoom / 100})` }}
              >
                {isEditingBaoCao ? (
                  /* ========================================================================= */
                  /* BIỂU MẪU CHUẨN: BÁO CÁO KẾT QUẢ XÁC MINH VỀ VIỆC GIẢI QUYẾT ĐƠN          */
                  /* ========================================================================= */
                  <div className="space-y-4 text-xs leading-relaxed font-serif text-slate-900">
                    {/* Header: Cơ quan ban hành & Quốc hiệu tiêu ngữ */}
                    <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                      <div className="space-y-0.5 text-center">
                        <p className="uppercase font-medium text-slate-700 text-[11px]">
                          {activeBaoCaoFormData.coQuanCapTren || editCoQuanCapTren || 'CÔNG AN TP. HÀ NỘI'}
                        </p>
                        <p className="uppercase font-bold text-slate-900 text-xs tracking-tight">
                          {activeBaoCaoFormData.coQuanLap || editCoQuanBanHanh || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA'}
                        </p>
                        <div className="w-20 h-px bg-slate-800 mx-auto my-1"></div>
                        <p className="font-mono text-[11px] text-slate-800">
                          Số: <strong>{activeBaoCaoFormData.soBaoCao || editSoHieu}</strong>
                        </p>
                      </div>
                      <div className="space-y-0.5 text-center">
                        <p className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </p>
                        <p className="font-bold text-slate-900 text-xs">
                          Độc lập - Tự do - Hạnh phúc
                        </p>
                        <div className="w-28 h-px bg-slate-800 mx-auto my-1"></div>
                        <p className="italic text-[11px] text-slate-700 pt-0.5">
                          Hà Nội, ngày {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[0] || '16'} tháng{' '}
                          {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[1] || '09'} năm{' '}
                          {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[2] || '2026'}
                        </p>
                      </div>
                    </div>

                    {/* Tiêu đề văn bản */}
                    <div className="text-center pt-4 pb-2">
                      <h1 className="text-center uppercase font-bold text-base sm:text-lg text-slate-900 tracking-wide">
                        BÁO CÁO KẾT QUẢ XÁC MINH
                      </h1>
                      <p className="text-center italic text-xs text-slate-700 mt-1">
                        Về việc giải quyết đơn (tố giác/tin báo/kiến nghị khởi tố) của ông/bà{' '}
                        <strong>{activeBaoCaoFormData.nguoiGuiDon || currentDon.nguoiNop}</strong>
                      </p>
                    </div>

                    {/* Kính gửi */}
                    <div className="py-1">
                      <p className="text-xs">
                        <strong>Kính gửi:</strong>{' '}
                        {activeBaoCaoFormData.nguoiNhan || editNguoiNhan || 'Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra'}
                      </p>
                    </div>

                    {/* Phân công & Cán bộ */}
                    <div className="py-2 space-y-1.5 text-justify text-xs leading-relaxed">
                      <p>
                        Thực hiện Phân công giải quyết nguồn tin về tội phạm số:{' '}
                        <strong>{activeBaoCaoFormData.soPhanCong || `${editSoHieu.replace(/\D/g, '') || '24'}/QĐ-CQĐT`}</strong>{' '}
                        ngày{' '}
                        <strong>{activeBaoCaoFormData.ngayPhanCong || activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026'}</strong>{' '}
                        của Thủ trưởng/Phó Thủ trưởng Cơ quan Điều tra;
                      </p>
                      <p>
                        Hôm nay, ngày {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[0] || '16'} tháng{' '}
                        {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[1] || '09'} năm{' '}
                        {(activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026').split('/')[2] || '2026'}, Điều tra viên / Cán bộ điều tra:{' '}
                        <strong>{activeBaoCaoFormData.nguoiLap || editSigner || 'Nguyễn Minh Anh'}</strong>
                      </p>
                      <p>
                        Đơn vị công tác:{' '}
                        <strong>{activeBaoCaoFormData.coQuanLap || editCoQuanBanHanh || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA'}</strong>
                      </p>
                      <p>
                        Tiến hành báo cáo kết quả xác minh đơn của:{' '}
                        <strong>{activeBaoCaoFormData.nguoiGuiDon || currentDon.nguoiNop}</strong>
                      </p>
                      <p>
                        Cư trú / Địa chỉ:{' '}
                        <strong>{activeBaoCaoFormData.diaChiNguoiGui || currentDon.diaChi || 'Quận Cầu Giấy, TP. Hà Nội'}</strong>
                      </p>
                      <p>
                        Nội dung đơn phản ánh / tố giác:{' '}
                        <em>{activeBaoCaoFormData.noiDungDon || currentDon.title || 'Tố giác hành vi vi phạm quy định pháp luật'}</em>
                      </p>
                    </div>

                    {/* I. KẾT QUẢ XÁC MINH */}
                    <div className="pt-2 pb-1 space-y-2 text-justify">
                      <h2 className="font-bold text-xs uppercase text-slate-900 tracking-wide border-b border-slate-200 pb-1">
                        I. KẾT QUẢ XÁC MINH
                      </h2>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">1. Các tài liệu, chứng cứ đã thu thập:</h3>
                        <div className="pl-4 pt-1 whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                          {activeBaoCaoFormData.taiLieuThuThap ||
                            '- Tài liệu, chứng cứ do người nộp đơn cung cấp: Đơn tố giác tội phạm (Bản chính); Bản sao CCCD; Bảng kê chứng từ giao dịch chuyển tiền và các tài liệu liên quan.\n- Tài liệu, chứng cứ do Cơ quan Điều tra thu thập: Biên bản tiếp nhận nguồn tin về tội phạm; Biên bản ghi lời khai người tố giác; Báo cáo xác minh hiện trường, nhân thân đối tượng.'}
                        </div>
                      </div>
                      <div className="pt-1.5">
                        <h3 className="font-bold text-slate-900 text-xs">2. Nội dung diễn biến sự việc được xác minh:</h3>
                        <div className="pl-4 pt-1 whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                          {activeBaoCaoFormData.noiDungXacMinh ||
                            (editNoiDungChiTiet
                              ? editNoiDungChiTiet
                              : 'Qua công tác xác minh ban đầu, các nội dung tố giác của công dân có căn cứ thực tế. Đã làm rõ diễn biến hành vi, các giao dịch và tài liệu liên quan đến dấu hiệu vi phạm pháp luật hình sự; các đối tượng liên quan đã được triệu tập, lấy lời khai bước đầu.')}
                        </div>
                      </div>
                    </div>

                    {/* II. NHẬN XÉT VÀ ĐỀ XUẤT */}
                    <div className="pt-2 pb-1 space-y-2 text-justify">
                      <h2 className="font-bold text-xs uppercase text-slate-900 tracking-wide border-b border-slate-200 pb-1">
                        II. NHẬN XÉT VÀ ĐỀ XUẤT
                      </h2>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">1. Đánh giá, nhận xét:</h3>
                        <div className="pl-4 pt-1 whitespace-pre-line text-slate-800 leading-relaxed text-[11.5px]">
                          {activeBaoCaoFormData.danhGiaNhanXet ||
                            '- Về tính chất, mức độ của sự việc: Vụ việc có tính chất nghiêm trọng, ảnh hưởng đến quyền lợi hợp pháp của công dân và tình hình an ninh trật tự trên địa bàn.\n- Về dấu hiệu tội phạm: Đã phát hiện đủ căn cứ dấu hiệu tội phạm theo quy định của Bộ luật Hình sự; vụ việc thuộc thẩm quyền thụ lý, giải quyết của Cơ quan Điều tra.'}
                        </div>
                        <div className="pl-4 pt-1.5 text-slate-800 text-[11.5px]">
                          <strong>- Căn cứ pháp lý:</strong>{' '}
                          {activeBaoCaoFormData.canCuPhapLy || 'Căn cứ Điều 145, 146, 147 Bộ luật Tố tụng hình sự năm 2015; Điều 174 Bộ luật Hình sự 2015.'}
                        </div>
                      </div>

                      <div className="pt-1.5">
                        <h3 className="font-bold text-slate-900 text-xs">2. Đề xuất xử lý:</h3>
                        <p className="pl-4 pt-1 italic text-slate-800 text-[11.5px]">
                          Kính đề nghị Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra xem xét, phê duyệt các nội dung sau:
                        </p>
                        <div className="pl-4 pt-1.5 space-y-1 font-mono text-[11px]">
                          <div
                            className={`p-1.5 rounded transition-all ${
                              activeBaoCaoFormData.phuongAnDeXuat === 1 || !activeBaoCaoFormData.phuongAnDeXuat
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                            }`}
                          >
                            [{activeBaoCaoFormData.phuongAnDeXuat === 1 || !activeBaoCaoFormData.phuongAnDeXuat ? 'X' : '  '}] Phương án 1: Thụ lý đơn (Đủ điều kiện thụ lý giải quyết theo quy định của pháp luật).
                          </div>
                          <div
                            className={`p-1.5 rounded transition-all ${
                              activeBaoCaoFormData.phuongAnDeXuat === 2
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                            }`}
                          >
                            [{activeBaoCaoFormData.phuongAnDeXuat === 2 ? 'X' : '  '}] Phương án 2: Chuyển thẩm quyền (Chuyển đơn, hồ sơ đến cơ quan, đơn vị có đúng thẩm quyền để giải quyết).
                          </div>
                          <div
                            className={`p-1.5 rounded transition-all ${
                              activeBaoCaoFormData.phuongAnDeXuat === 3
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                            }`}
                          >
                            [{activeBaoCaoFormData.phuongAnDeXuat === 3 ? 'X' : '  '}] Phương án 3: Trả lời đơn (Lập văn bản trả lời, hướng dẫn hoặc giải thích cho công dân/người nộp đơn).
                          </div>
                          <div
                            className={`p-1.5 rounded transition-all ${
                              activeBaoCaoFormData.phuongAnDeXuat === 4
                                ? 'bg-blue-50/80 font-bold text-blue-950 border border-blue-200'
                                : 'text-slate-600'
                            }`}
                          >
                            [{activeBaoCaoFormData.phuongAnDeXuat === 4 ? 'X' : '  '}] Phương án 4: Yêu cầu bổ sung (Yêu cầu người nộp bổ sung tài liệu, chứng cứ hoặc giải trình làm rõ nội dung).
                          </div>
                        </div>

                        {activeBaoCaoFormData.chiTietPhuongAn && (
                          <p className="pl-4 pt-1 text-[11px] italic text-slate-700">
                            (Ghi chú phương án đề xuất: {activeBaoCaoFormData.chiTietPhuongAn})
                          </p>
                        )}

                        <div className="pl-4 pt-2 text-slate-800 text-[11.5px] leading-relaxed">
                          <p>
                            Dự thảo các văn bản tố tụng kèm theo bao gồm:{' '}
                            <em>
                              {activeBaoCaoFormData.vanBanKemTheo ||
                                'Dự thảo Quyết định khởi tố vụ án; Bản kết luận xác minh nguồn tin về tội phạm; Bảng kê danh mục tài liệu, chứng cứ trong hồ sơ.'}
                            </em>
                          </p>
                          <p className="pt-1 italic">Kính trình Đồng chí phê duyệt./.</p>
                        </div>
                      </div>
                    </div>

                    {/* Phần chữ ký: 2 cột theo đúng thể thức */}
                    <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-xs text-center font-sans">
                      <div className="space-y-1">
                        <p className="font-bold uppercase text-slate-900 text-xs">
                          Ý KIẾN PHÊ DUYỆT CỦA THỦ TRƯỞNG
                        </p>
                        <p className="font-bold text-slate-800 text-[11px]">(PHÓ THỦ TRƯỞNG)</p>
                        <p className="italic text-[10.5px] text-slate-500 pt-1">
                          (Ký, ghi rõ họ tên, ngày... tháng... năm...)
                        </p>
                        <div className="h-16"></div>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold uppercase text-slate-900 text-xs">
                          NGƯỜI LẬP BÁO CÁO
                        </p>
                        <p className="font-bold text-slate-800 text-[11px]">(Điều tra viên / Cán bộ điều tra)</p>
                        <p className="italic text-[10.5px] text-slate-500 pt-1">(Ký, ghi rõ họ tên)</p>

                        {activeEditingDoc.signingStatus === 'da_ky' ? (
                          <div className="my-2 p-2 rounded-lg border-2 border-red-500 bg-red-50/30 text-red-700 text-[10px] inline-block max-w-[200px] text-left shadow-2xs">
                            <div className="flex items-center gap-1 font-bold text-red-800 border-b border-red-300 pb-0.5">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              <span>KÝ BỞI: {activeBaoCaoFormData.nguoiLap || editSigner || 'Nguyễn Minh Anh'}</span>
                            </div>
                            <p className="pt-0.5 font-mono text-[9px]">
                              CƠ QUAN: {activeBaoCaoFormData.coQuanLap || editCoQuanBanHanh || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA'}
                            </p>
                            <p className="font-mono text-[9px]">
                              NGÀY KÝ: {activeBaoCaoFormData.ngayLap || editNgayLap || '16/09/2026'}
                            </p>
                          </div>
                        ) : (
                          <div className="h-16"></div>
                        )}

                        <p className="font-bold text-slate-900 text-sm pt-1">
                          {activeBaoCaoFormData.nguoiLap || editSigner || 'Nguyễn Minh Anh'}
                        </p>
                      </div>
                    </div>

                    {/* Banner CTA Trình ký Lãnh đạo */}
                    <div className="mt-8 pt-4 border-t border-slate-200">
                      {activeEditingDoc.signingStatus === 'cho_trinh' ||
                      activeEditingDoc.signingStatus === 'da_trinh' ||
                      activeEditingDoc.signingStatus === 'cho_ky' ? (
                        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/80 flex items-center justify-between gap-3 font-sans">
                          <div className="flex items-center gap-2.5 text-xs text-blue-900 font-medium">
                            <span className="material-symbols-outlined text-blue-600 text-[20px]">verified</span>
                            <span>
                              Báo cáo kết quả xác minh này <strong>đã được chuyển trình ký</strong> tới Lãnh đạo phê duyệt. Các chức năng <strong>Chỉnh sửa thông tin</strong> và <strong>Thụ lý đơn</strong> đã sẵn sàng trên thanh tác vụ.
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shrink-0">
                            Đã trình ký
                          </span>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
                          <div>
                            <p className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-emerald-700 text-[19px]">approval</span>
                              <span>Hoàn tất xem trước &amp; Chuyển trình Lãnh đạo phê duyệt</span>
                            </p>
                            <p className="text-xs text-emerald-800 mt-0.5">
                              Sau khi nhấn "Đi trình ký", văn bản sẽ chuyển sang quy trình ký duyệt và hệ thống sẽ mở khóa nút <strong>Chỉnh sửa thông tin</strong> và <strong>Thụ lý đơn</strong>.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleTrinhKyBaoCaoDirect}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer shrink-0 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            <span>Đi trình ký ngay</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ========================================================================= */
                  /* SOẠN THẢO VĂN BẢN THÔNG THƯỜNG (GIẤY MỜI, BIÊN BẢN, CÔNG VĂN, THÔNG BÁO) */
                  /* ========================================================================= */
                  <div>
                    {/* Phần 1: Quốc hiệu & Tiêu ngữ */}
                    <div className="grid grid-cols-2 gap-4 text-center text-xs pb-4 border-b border-slate-200/80">
                      <div className="space-y-1 text-left">
                        <input
                          type="text"
                          value={editCoQuanCapTren}
                          onChange={(e) => setEditCoQuanCapTren(e.target.value)}
                          className="w-full text-center uppercase font-medium text-slate-600 text-[11px] bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                        />
                        <input
                          type="text"
                          value={editCoQuanBanHanh}
                          onChange={(e) => setEditCoQuanBanHanh(e.target.value)}
                          className="w-full text-center uppercase font-bold text-slate-900 text-xs bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                        />
                        <div className="w-24 h-px bg-slate-800 mx-auto my-1"></div>
                        <div className="flex items-center justify-center gap-1 font-mono text-[11px] text-slate-700">
                          <span>Số:</span>
                          <input
                            type="text"
                            value={editSoHieu}
                            onChange={(e) => setEditSoHieu(e.target.value)}
                            className="w-36 font-bold font-mono text-center text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold uppercase text-slate-900 text-xs tracking-wider">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        </p>
                        <p className="font-bold text-slate-900 text-xs">
                          Độc lập - Tự do - Hạnh phúc
                        </p>
                        <div className="w-36 h-px bg-slate-800 mx-auto my-1"></div>
                        <p className="italic text-[11px] text-slate-600 pt-0.5">
                          Hà Nội, ngày {editNgayLap ? editNgayLap.split('/')[0] : '16'} tháng{' '}
                          {editNgayLap ? editNgayLap.split('/')[1] : '09'} năm 2026
                        </p>
                      </div>
                    </div>

                    {/* Phần 2: Tiêu đề văn bản */}
                    <div className="text-center pt-6 pb-4">
                      <input
                        type="text"
                        value={editTenVanBan}
                        onChange={(e) => setEditTenVanBan(e.target.value)}
                        className="w-full text-center uppercase font-bold text-base sm:text-lg text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-2 outline-none tracking-wide"
                      />
                      <div className="flex items-center justify-center gap-1 mt-1 text-xs italic text-slate-600">
                        <span>(V/v:</span>
                        <input
                          type="text"
                          value={editTrichYeu}
                          onChange={(e) => setEditTrichYeu(e.target.value)}
                          className="w-4/5 text-center italic text-xs text-slate-700 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                        />
                        <span>)</span>
                      </div>
                    </div>

                    {/* Phần 3: Kính gửi */}
                    <div className="pt-2 pb-3 text-xs leading-relaxed space-y-2">
                      <div className="flex items-baseline gap-2">
                        <strong className="text-slate-900 shrink-0">Kính gửi:</strong>
                        <input
                          type="text"
                          value={editNguoiNhan}
                          onChange={(e) => setEditNguoiNhan(e.target.value)}
                          className="flex-1 font-semibold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none text-xs"
                        />
                      </div>

                      {editThoiGianHen && (
                        <div className="flex items-baseline gap-2">
                          <strong className="text-slate-900 shrink-0">Thời gian:</strong>
                          <input
                            type="text"
                            value={editThoiGianHen}
                            onChange={(e) => setEditThoiGianHen(e.target.value)}
                            className="flex-1 text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none text-xs"
                          />
                        </div>
                      )}

                      {editDiaDiem && (
                        <div className="flex items-baseline gap-2">
                          <strong className="text-slate-900 shrink-0">Địa điểm:</strong>
                          <input
                            type="text"
                            value={editDiaDiem}
                            onChange={(e) => setEditDiaDiem(e.target.value)}
                            className="flex-1 text-slate-800 bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Phần 4: NỘI DUNG VĂN BẢN CHÍNH */}
                    <div className="pt-2 pb-6">
                      <div className="relative">
                        <textarea
                          rows={14}
                          value={editNoiDungChiTiet}
                          onChange={(e) => setEditNoiDungChiTiet(e.target.value)}
                          placeholder="Nhập nội dung văn bản chi tiết..."
                          className="w-full p-3 font-serif text-sm leading-relaxed text-slate-900 bg-transparent border border-dashed border-slate-300 hover:border-blue-400 focus:border-[#004ac6] focus:bg-blue-50/20 rounded-lg outline-none transition-all resize-y"
                        />
                      </div>
                      <p className="text-[10.5px] text-slate-400 italic text-right mt-1">
                        * Khung soạn thảo trực tiếp chuẩn trang A4
                      </p>
                    </div>

                    {/* Phần 5: Nơi nhận & Ký tên */}
                    <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                      <div className="text-left text-[11px] text-slate-600 font-sans space-y-0.5">
                        <p className="font-bold text-slate-800">Nơi nhận:</p>
                        <p>- Như kính gửi;</p>
                        <p>- Lưu: VT, Hồ sơ xác minh đơn {currentDon.code}.</p>
                      </div>

                      <div className="text-center space-y-1">
                        <input
                          type="text"
                          value={editChucVuSigner}
                          onChange={(e) => setEditChucVuSigner(e.target.value)}
                          className="w-full text-center uppercase font-bold text-slate-900 text-xs bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                        />

                        {/* Dấu ký số điện tử VGCA */}
                        {editIsSignedVGCA && (
                          <div className="my-2 p-2 rounded-lg border-2 border-red-500 bg-red-50/30 text-red-700 text-[10px] font-sans inline-block max-w-[200px] text-left shadow-2xs">
                            <div className="flex items-center gap-1 font-bold text-red-800 border-b border-red-300 pb-0.5">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              <span>KÝ BỞI: {editSigner}</span>
                            </div>
                            <p className="pt-0.5 font-mono text-[9px]">CƠ QUAN: {editCoQuanBanHanh}</p>
                            <p className="font-mono text-[9px]">NGÀY KÝ: {editNgayLap || '16/09/2026'}</p>
                            <p className="font-mono text-[8.5px] text-red-500 truncate">SHA-256: 7F8E...3A21</p>
                          </div>
                        )}

                        <div className="pt-1">
                          <input
                            type="text"
                            value={editSigner}
                            onChange={(e) => setEditSigner(e.target.value)}
                            className="w-full text-center font-bold text-slate-900 text-sm bg-transparent hover:bg-slate-50 focus:bg-blue-50/50 focus:ring-1 focus:ring-blue-300 rounded px-1 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CHẾ ĐỘ DANH SÁCH HỒ SƠ, VĂN BẢN & TÀI LIỆU                                */
        /* ========================================================================= */
        <>


          {/* 2. Danh sách tài liệu chi tiết */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3.5 px-4 w-12 text-center">STT</th>
                    <th className="py-3.5 px-4">Tên tệp tin &amp; Số hiệu văn bản</th>
                    <th className="py-3.5 px-4">Giai đoạn quy trình</th>
                    <th className="py-3.5 px-4">Dung lượng / Trang</th>
                    <th className="py-3.5 px-4">Thời gian số hóa</th>
                    <th className="py-3.5 px-4">Đơn vị / Người ký xác thực</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái AI OCR</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-[11.5px]">
                  {filteredDocs.map((doc, idx) => {
                    const isBaoCao = doc.loaiVanBan === 'bao_cao_de_xuat' || doc.loaiVanBan === 'bao_cao_xac_minh';
                    return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-blue-50/40 transition-colors ${doc.isProcessDoc ? 'bg-purple-50/15' : ''
                        }`}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${isBaoCao
                              ? 'bg-blue-50 border-blue-200 text-[#004ac6]'
                              : doc.isProcessDoc
                                ? 'bg-purple-50 border-purple-200 text-purple-700'
                                : 'bg-rose-50 border-rose-200 text-rose-600'
                              }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isBaoCao ? 'rate_review' : doc.isProcessDoc ? 'gavel' : 'picture_as_pdf'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-bold text-slate-900 hover:text-[#004ac6] cursor-pointer leading-tight truncate max-w-[340px]"
                                onClick={() => handleStartEdit(doc)}
                                title={`Nhấp để mở xem chi tiết văn bản: ${doc.tenVanBan || doc.name}`}
                              >
                                {isBaoCao ? (doc.tenVanBan || 'Báo cáo kết quả xác minh') : doc.name}
                              </span>
                              {isBaoCao ? (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-blue-100 text-[#004ac6] border border-blue-200">
                                  Báo cáo đề xuất
                                </span>
                              ) : (
                                <>
                                  {doc.isProcessDoc && (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                                      Quy trình xử lý
                                    </span>
                                  )}
                                  {doc.fromXacMinh && (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                                      Xác minh
                                    </span>
                                  )}
                                </>
                              )}
                              {doc.signingStatus && (
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${doc.signingStatus === 'nhap'
                                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                                    : doc.signingStatus === 'yeu_cau_chinh_sua'
                                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                                      : doc.signingStatus === 'da_ky' || doc.signingStatus === 'hoan_tat'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : 'bg-blue-100 text-blue-800 border-blue-300'
                                    }`}
                                >
                                  <span className="material-symbols-outlined text-[11px]">
                                    {doc.signingStatus === 'nhap'
                                      ? 'edit_note'
                                      : doc.signingStatus === 'yeu_cau_chinh_sua'
                                        ? 'replay'
                                        : doc.signingStatus === 'da_ky' || doc.signingStatus === 'hoan_tat'
                                          ? 'verified'
                                          : 'pending_actions'}
                                  </span>
                                  <span>
                                    {doc.signingStatus === 'nhap'
                                      ? 'Bản nháp'
                                      : doc.signingStatus === 'yeu_cau_chinh_sua'
                                        ? 'Cần sửa đổi'
                                        : doc.signingStatus === 'da_ky' || doc.signingStatus === 'hoan_tat'
                                          ? 'Đã ký duyệt'
                                          : 'Chờ ký duyệt'}
                                  </span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10.5px]">
                              {doc.soHieu && (
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  Số: {doc.soHieu}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 font-medium border border-slate-200">
                                {isBaoCao ? 'Báo cáo đề xuất' : doc.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {doc.stepBelongsTo ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>{doc.stepBelongsTo}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Hồ sơ tiếp nhận ban đầu</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div>{doc.size}</div>
                        <span className="text-[10.5px] text-slate-400 font-sans">{doc.pages} trang</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{doc.uploadDate}</div>
                        <span className="text-[10px] text-slate-400 font-mono">SHA-256 Verified</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 max-w-[200px] truncate" title={doc.signer}>
                          {doc.signer}
                        </div>
                        {doc.coQuanBanHanh && (
                          <div className="text-[10.5px] text-slate-500 truncate max-w-[200px]">
                            {doc.coQuanBanHanh}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[10.5px] text-emerald-700 font-medium mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-emerald-600">verified_user</span>
                          <span>Chứng thư số VGCA</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Đã bóc tách 100%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBaoCao ? (
                            <>
                              {/* 1. Xem chi tiết -> mở bản xem trước văn bản A4 theo đúng biểu mẫu đã tạo, không mở lại popup nhập thông tin */}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(doc)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] border border-blue-200 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
                                title="Xem trước văn bản theo đúng biểu mẫu Báo cáo kết quả xác minh"
                              >
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                                <span>Xem chi tiết</span>
                              </button>

                              {/* 2. Chỉnh sửa -> mở popup nhập thông tin để cập nhật */}
                              <button
                                type="button"
                                onClick={() => onOpenBaoCaoDeXuat?.(doc)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
                                title="Chỉnh sửa thông tin Báo cáo đề xuất"
                              >
                                <span className="material-symbols-outlined text-[15px] text-slate-500">edit_note</span>
                                <span>Chỉnh sửa</span>
                              </button>

                              {/* 3. Đi trình ký -> chuyển sang luồng trình ký Lãnh đạo */}
                              {doc.signingStatus === 'nhap' ? (
                                <button
                                  type="button"
                                  onClick={() => handleTrinhKyFromRow(doc)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11.5px] font-bold transition-all cursor-pointer shadow-xs"
                                  title="Chuyển Báo cáo kết quả xác minh sang luồng trình ký Lãnh đạo"
                                >
                                  <span className="material-symbols-outlined text-[15px]">send</span>
                                  <span>Đi trình ký</span>
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  <span>Đã trình ký</span>
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(doc)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] border border-blue-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                                title="Mở trình soạn thảo và chỉnh sửa trực tiếp văn bản này trên trang A4"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit_document</span>
                                <span>Sửa trực tiếp</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenPreview(doc)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Xem trước văn bản"
                              >
                                <span className="material-symbols-outlined text-[17px]">visibility</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => alert(`Đang tải tệp: ${doc.name}`)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Tải tệp xuống"
                              >
                                <span className="material-symbols-outlined text-[17px]">download</span>
                              </button>

                              {doc.isProcessDoc && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc.id, doc.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa văn bản này"
                                >
                                  <span className="material-symbols-outlined text-[17px]">delete</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-10 bg-slate-50/50">
                <span className="material-symbols-outlined text-[36px] text-slate-300 mb-1 block">
                  folder_off
                </span>
                <p className="text-xs font-semibold text-slate-600">
                  Không tìm thấy văn bản hoặc quyết định nào theo điều kiện tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('all');
                    setSearchKeyword('');
                  }}
                  className="mt-1.5 text-xs font-bold text-[#004ac6] hover:underline cursor-pointer"
                >
                  Xem tất cả danh mục hồ sơ
                </button>
              </div>
            )}

            {/* Footer info bar */}

          </div>
        </>
      )
      }

      {/* ========================================================================= */}
      {/* 3. MODAL THÊM VĂN BẢN / QUYẾT ĐỊNH CHO QUÁ TRÌNH XỬ LÝ                     */}
      {/* ========================================================================= */}
      {
        showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/90 via-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[20px]">post_add</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Thêm văn bản / Quyết định cho quá trình xử lý
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Hồ sơ: <strong className="text-slate-800 font-mono">{currentDon.code}</strong> • Người nộp: {currentDon.nguoiNop}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveAddDoc} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Chọn nhanh mẫu văn bản theo nghiệp vụ */}
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#004ac6] flex items-center gap-1.5 text-xs">
                      <span className="material-symbols-outlined text-[15px]">auto_stories</span>
                      <span>Chọn nhanh mẫu văn bản / quyết định nghiệp vụ:</span>
                    </span>
                    <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.2 rounded-full font-semibold">
                      1-Click điền tự động
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {QUICK_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.title}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${addForm.soHieu === tpl.soHieu
                          ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-2xs font-bold'
                          : 'bg-white hover:bg-blue-100 text-slate-700 border-blue-200'
                          }`}
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Input fields */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Tên tệp tin văn bản / quyết định <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="VD: Quyet_dinh_phan_cong_dieu_tra_vien_so_42.pdf"
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Số ký hiệu văn bản <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.soHieu}
                      onChange={(e) => setAddForm({ ...addForm, soHieu: e.target.value })}
                      placeholder="VD: 42/QĐ-PC03 hoặc 18/TB-UBND"
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Loại văn bản / Quyết định <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6] cursor-pointer"
                    >
                      <option value="Quyết định tố tụng">Quyết định tố tụng (CQĐT / VKSND)</option>
                      <option value="Quyết định hành chính">Quyết định hành chính (UBND)</option>
                      <option value="Thông báo thụ lý">Thông báo thụ lý (Khiếu nại / Tố cáo / Nguồn tin)</option>
                      <option value="Công văn phối hợp">Công văn trao đổi / Yêu cầu tra soát</option>
                      <option value="Biên bản làm việc">Biên bản làm việc / Ghi lời khai / Đối thoại</option>
                      <option value="Văn bản hướng dẫn">Phiếu hướng dẫn bổ sung tài liệu</option>
                      <option value="Báo cáo kết luận">Báo cáo kết luận xác minh</option>
                      <option value="Tài liệu chứng cứ mới">Tài liệu chứng cứ phát sinh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Giai đoạn trong quy trình xử lý
                    </label>
                    <select
                      value={addForm.stepBelongsTo}
                      onChange={(e) => setAddForm({ ...addForm, stepBelongsTo: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6] cursor-pointer"
                    >
                      <option value="Bước 1: Tiếp nhận & Vào sổ">Bước 1: Tiếp nhận &amp; Vào sổ</option>
                      <option value="Bước 2: Kiểm tra chứng cứ & Thụ lý">Bước 2: Kiểm tra chứng cứ &amp; Thụ lý</option>
                      <option value="Bước 3: Phân công thụ lý & Xác minh">Bước 3: Phân công thụ lý / Lập tổ xác minh</option>
                      <option value="Bước 4: Xác minh thực địa & Thu thập chứng cứ">Bước 4: Xác minh thực tế / Sao kê / Đối thoại</option>
                      <option value="Bước 5: Báo cáo kết luận & Đề xuất">Bước 5: Báo cáo kết luận &amp; Đề xuất</option>
                      <option value="Bước 6: Ban hành Quyết định giải quyết">Bước 6: Ban hành Quyết định giải quyết</option>
                      <option value="Bước 7: Thông báo kết quả & Trả lời">Bước 7: Thông báo kết quả &amp; Trả lời</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Cơ quan ban hành <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.coQuanBanHanh}
                      onChange={(e) => setAddForm({ ...addForm, coQuanBanHanh: e.target.value })}
                      placeholder="VD: Cơ quan CSĐT Công an TP. Hà Nội"
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Người ký &amp; Chức vụ <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.signer}
                      onChange={(e) => setAddForm({ ...addForm, signer: e.target.value })}
                      placeholder="VD: Thượng tá Trần Quốc Dũng - Phó Thủ trưởng CQĐT"
                      className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Số trang &amp; Dung lượng file
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={1}
                        value={addForm.pages}
                        onChange={(e) => setAddForm({ ...addForm, pages: Number(e.target.value) || 1 })}
                        className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                        placeholder="Số trang"
                      />
                      <input
                        type="text"
                        value={addForm.size}
                        onChange={(e) => setAddForm({ ...addForm, size: e.target.value })}
                        className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                        placeholder="Dung lượng"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">
                      Trích yếu &amp; Nội dung văn bản quyết định (Xem trước &amp; AI OCR)
                    </label>
                    <textarea
                      rows={4}
                      value={addForm.previewExcerpt}
                      onChange={(e) => setAddForm({ ...addForm, previewExcerpt: e.target.value })}
                      placeholder="Nhập trích yếu căn cứ và quyết định chỉ đạo..."
                      className="w-full p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-[#004ac6] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Tùy chọn ký số VGCA & OCR */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.isSignedVGCA}
                      onChange={(e) => setAddForm({ ...addForm, isSignedVGCA: e.target.checked })}
                      className="w-4 h-4 rounded text-[#004ac6] focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                      <span>Xác thực chữ ký số công vụ VGCA (Ban Cơ yếu Chính phủ)</span>
                    </span>
                  </label>

                  <span className="text-[11px] font-mono text-slate-400">SHA-256 Auto-Hashing</span>
                </div>

                {/* Modal footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Lưu &amp; Thêm vào hồ sơ xử lý</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* ========================================================================= */}
      {/* 4. MODAL XEM TRƯỚC VĂN BẢN (PREVIEW PDF MODAL)                            */}
      {/* ========================================================================= */}
      {
        showPreviewModal && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[88vh] flex flex-col overflow-hidden animate-scale-up">
              {/* Modal Header */}
              <div className="px-6 py-3.5 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#004ac6] text-[22px]">description</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{selectedDoc.name}</h3>
                      {selectedDoc.soHieu && (
                        <span className="font-mono text-[11px] font-bold bg-slate-200/80 px-1.5 py-0.2 rounded text-slate-800">
                          Số: {selectedDoc.soHieu}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {selectedDoc.category} • {selectedDoc.pages} trang • {selectedDoc.size} • {selectedDoc.uploadDate}
                    </span>
                  </div>
                </div>

                {/* Toolbar zoom & close */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((z) => Math.max(z - 15, 70))}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Thu nhỏ"
                    >
                      <span className="material-symbols-outlined text-base">zoom_out</span>
                    </button>
                    <span className="px-2 text-xs font-mono text-slate-700">{previewZoom}%</span>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((z) => Math.min(z + 15, 160))}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Phóng to"
                    >
                      <span className="material-symbols-outlined text-base">zoom_in</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body: Document Content Preview with Watermark */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-200/70 flex justify-center">
                <div
                  className="bg-white shadow-xl rounded-lg p-10 max-w-2xl w-full border border-slate-300 relative transition-all"
                  style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span className="text-6xl font-extrabold rotate-[-30deg] text-slate-900 tracking-widest uppercase">
                      GOVEX TECH
                    </span>
                  </div>

                  {/* Preformatted text simulating scan/OCR preview */}
                  <div className="font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {selectedDoc.previewExcerpt}
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Trang 1 / {selectedDoc.pages}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <span className="material-symbols-outlined text-[13px]">verified_user</span>
                      <span>Đã kiểm định chữ ký số VGCA</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Người ký: <strong>{selectedDoc.signer}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Tải về ${selectedDoc.name}`)}
                    className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Tải bản gốc</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
