import React, { useState, useEffect } from 'react';
import { DonDetail } from '../../types';
import { VanBanXacMinhItem } from '../modals/XacMinhVaDeXuatModal';

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
  loaiVanBan?: 'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac';
  nguoiNhan?: string;
  diaDiem?: string;
  thoiGianHen?: string;
  trichYeu?: string;
  noiDungChiTiet?: string;
  trangThai?: 'du_thao' | 'da_ban_hanh' | 'da_dinh_kem';
  fromXacMinh?: boolean;
}

export default function TabTaiLieu({
  currentDon,
  onDocCountChange,
  initialEditingDoc,
  onClearInitialEditingDoc,
  onReturnToXacMinh,
  sharedVanBanList,
  onUpdateSharedVanBanList,
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
  const [editLoaiVanBan, setEditLoaiVanBan] = useState<'giay_moi' | 'bien_ban' | 'cong_van' | 'quyet_dinh' | 'thong_bao' | 'khac'>('giay_moi');
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

  // Mở trình soạn thảo trực tiếp cho một văn bản
  const handleStartEdit = (doc: DocItem) => {
    setActiveEditingDoc(doc);
    setEditSoHieu(doc.soHieu || `${Math.floor(10 + Math.random() * 89)}/VB`);
    setEditTenVanBan(doc.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    setEditLoaiVanBan(
      doc.loaiVanBan ||
      (doc.name.toLowerCase().includes('giay_moi')
        ? 'giay_moi'
        : doc.name.toLowerCase().includes('bien_ban')
          ? 'bien_ban'
          : doc.name.toLowerCase().includes('cong_van')
            ? 'cong_van'
            : 'quyet_dinh')
    );
    setEditCategory(doc.category);
    setEditNgayLap(doc.uploadDate ? doc.uploadDate.split(' ')[0] : '16/09/2026');
    setEditCoQuanBanHanh(doc.coQuanBanHanh || 'Phòng Tiếp công dân & Xử lý đơn');
    setEditCoQuanCapTren('ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY');
    setEditNguoiNhan(doc.nguoiNhan || currentDon.nguoiNop || 'Nguyễn Văn A');
    setEditThoiGianHen(doc.thoiGianHen || '08:30 ngày 18/09/2026');
    setEditDiaDiem(doc.diaDiem || 'Phòng Tiếp công dân & Xử lý đơn (Phòng 102, Trụ sở UBND quận)');
    setEditTrichYeu(doc.trichYeu || `V/v Xác minh làm rõ nội dung đơn số ${currentDon.code}`);
    setEditNoiDungChiTiet(doc.noiDungChiTiet || doc.previewExcerpt);
    setEditSigner(doc.signer ? doc.signer.replace(/\s*\(.*\)/, '') : 'Nguyễn Minh Anh');
    setEditChucVuSigner('CÁN BỘ THỤ LÝ XÁC MINH');
    setEditTrangThai(doc.trangThai === 'da_ban_hanh' ? 'da_ban_hanh' : 'du_thao');
    setEditFromXacMinh(Boolean(doc.fromXacMinh));
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

    showToast(`✓ Đã lưu thành công văn bản ${editSoHieu} vào Hồ sơ & Văn bản của đơn!`);
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
              name: `${xm.tenVanBan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
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
          name: `${initialEditingDoc.tenVanBan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
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
        /* TRÌNH SOẠN THẢO & CHỈNH SỬA VĂN BẢN TRỰC TIẾP (DIRECT A4 DOCUMENT EDITOR)  */
        /* ========================================================================= */
        <div className="space-y-4 animate-fade-in">
          {/* 1. TOP HEADER & ACTION CONTROLS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleExitDirectEdit}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer hover:border-slate-300"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">arrow_back</span>
                <span>Quay lại danh mục</span>
              </button>

              {onReturnToXacMinh && (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveDirectEdit();
                    onReturnToXacMinh();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Lưu các văn bản đã soạn và mở lại cửa sổ Xác minh thông tin & Đề xuất"
                >
                  <span className="material-symbols-outlined text-[17px] text-amber-700">fact_check</span>
                  <span>← Tiếp tục Xác minh &amp; Đề xuất</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900">
                  Soạn thảo A4: <span className="text-[#004ac6]">{editSoHieu || activeEditingDoc.name}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${editLoaiVanBan === 'giay_moi'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : editLoaiVanBan === 'bien_ban'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : editLoaiVanBan === 'cong_van'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                >
                  {editLoaiVanBan === 'giay_moi'
                    ? 'Giấy mời xác minh'
                    : editLoaiVanBan === 'bien_ban'
                      ? 'Biên bản làm việc'
                      : editLoaiVanBan === 'cong_van'
                        ? 'Công văn phối hợp'
                        : editLoaiVanBan === 'thong_bao'
                          ? 'Thông báo bổ sung'
                          : 'Văn bản hành chính'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Zoom Controls */}
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

              {/* In ấn A4 */}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="In trang A4 chuẩn theo Nghị định 30/2020/NĐ-CP"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">print</span>
                <span className="hidden md:inline">In A4</span>
              </button>

              {/* Tải DOCX */}
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `✓ Đang xuất tệp "${editSoHieu.replace(/[^a-zA-Z0-9]/g, '_')}.docx" chuẩn thể thức!`
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Tải tệp tin Word .docx"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-600">description</span>
                <span className="hidden md:inline">Tải .DOCX</span>
              </button>

              {/* Lưu vào hồ sơ */}
              <button
                type="button"
                onClick={handleSaveDirectEdit}
                className="px-4 py-1.5 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">save</span>
                <span>Lưu văn bản</span>
              </button>
            </div>
          </div>

          {/* 2. THANH CHUYỂN ĐỔI NHIỀU VĂN BẢN XÁC MINH & CỤM NÚT TẠO THÊM TRỰC TIẾP */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 rounded-2xl border border-blue-200/90 p-3.5 shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">library_books</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Tập văn bản phục vụ xác minh
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10.5px] font-bold bg-[#004ac6] text-white">
                      {verificationDocs.length} văn bản
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    Nhấp vào văn bản để chuyển đổi soạn thảo tức thì hoặc tạo thêm các văn bản khác bên cạnh:
                  </p>
                </div>
              </div>

              {/* Cụm 4 nút tạo nhanh văn bản xác minh mới trực tiếp trong Tab */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden lg:inline">Tạo thêm:</span>
                <button
                  type="button"
                  onClick={() => handleCreateNewXacMinhDoc('giay_moi')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-[#004ac6] border border-blue-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Tạo thêm Giấy mời làm việc mới và mở soạn thảo ngay"
                >
                  <span className="material-symbols-outlined text-[15px]">mail</span>
                  <span>+ Giấy mời</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateNewXacMinhDoc('bien_ban')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Tạo thêm Biên bản làm việc / xác minh mới và mở soạn thảo ngay"
                >
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  <span>+ Biên bản</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateNewXacMinhDoc('cong_van')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Tạo thêm Công văn đề nghị phối hợp mới và mở soạn thảo ngay"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>+ Công văn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateNewXacMinhDoc('thong_bao')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="Tạo thêm Thông báo bổ sung tài liệu mới và mở soạn thảo ngay"
                >
                  <span className="material-symbols-outlined text-[15px]">campaign</span>
                  <span>+ Thông báo</span>
                </button>
              </div>
            </div>

            {/* Danh sách tabs của các văn bản xác minh */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {verificationDocs.map((doc, idx) => {
                const isActive = activeEditingDoc.id === doc.id || (doc.soHieu && doc.soHieu === editSoHieu);
                const isGiayMoi = doc.loaiVanBan === 'giay_moi' || doc.name.toLowerCase().includes('giay_moi');
                const isBienBan = doc.loaiVanBan === 'bien_ban' || doc.name.toLowerCase().includes('bien_ban');
                const isCongVan = doc.loaiVanBan === 'cong_van' || doc.name.toLowerCase().includes('cong_van');
                const isThongBao = doc.loaiVanBan === 'thong_bao' || doc.name.toLowerCase().includes('thong_bao');

                return (
                  <button
                    key={doc.id || idx}
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        handleSaveDirectEdit();
                        handleStartEdit(doc);
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${isActive
                      ? 'bg-[#004ac6] text-white border-[#004ac6] shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${isActive
                        ? 'text-white'
                        : isGiayMoi
                          ? 'text-blue-600'
                          : isBienBan
                            ? 'text-emerald-600'
                            : isCongVan
                              ? 'text-purple-600'
                              : 'text-amber-600'
                        }`}
                    >
                      {isGiayMoi ? 'mail' : isBienBan ? 'edit_note' : isCongVan ? 'send' : 'campaign'}
                    </span>
                    <span className="font-mono">{doc.soHieu || `VB-${idx + 1}`}</span>
                    <span className="text-[11px] font-medium opacity-90 max-w-[130px] truncate">
                      {isGiayMoi ? 'Giấy mời' : isBienBan ? 'Biên bản' : isCongVan ? 'Công văn' : isThongBao ? 'Thông báo' : doc.category}
                    </span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    ) : (
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-normal">
                        Xem
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Editor Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* CỘT TRÁI (4 cols): Thiết lập thuộc tính văn bản & Mẫu nhanh */}
            <div className="lg:col-span-4 space-y-4">
              {/* Chọn mẫu nhanh */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#004ac6] text-[18px]">auto_stories</span>
                    <span>Mẫu văn bản chuẩn:</span>
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                    1-Click áp dụng
                  </span>
                </div>
                <div className="space-y-1.5">
                  {DIRECT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => {
                        setEditTenVanBan(tpl.ten);
                        setEditSoHieu(tpl.soHieu);
                        setEditLoaiVanBan(tpl.type);
                        setEditTrichYeu(tpl.trichYeu);
                        setEditThoiGianHen(tpl.thoiGian);
                        setEditDiaDiem(tpl.diaDiem);
                        setEditNguoiNhan(tpl.nguoiNhan);
                        setEditNoiDungChiTiet(tpl.noiDung);
                        showToast(`Đã áp dụng mẫu "${tpl.title}"`);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${editSoHieu === tpl.soHieu
                        ? 'border-[#004ac6] bg-blue-50/70 text-[#004ac6] font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold block truncate">{tpl.title}</span>
                        <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                          {tpl.soHieu}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">{tpl.trichYeu}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form cấu hình nhanh các trường */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-slate-600 text-[16px]">tune</span>
                  <span>Thuộc tính &amp; Thông tin hành chính</span>
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên văn bản</label>
                  <input
                    type="text"
                    value={editTenVanBan}
                    onChange={(e) => setEditTenVanBan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số ký hiệu</label>
                    <input
                      type="text"
                      value={editSoHieu}
                      onChange={(e) => setEditSoHieu(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Loại văn bản</label>
                    <select
                      value={editLoaiVanBan}
                      onChange={(e) => setEditLoaiVanBan(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    >
                      <option value="giay_moi">Giấy mời làm việc</option>
                      <option value="bien_ban">Biên bản xác minh / Làm việc</option>
                      <option value="cong_van">Công văn phối hợp</option>
                      <option value="thong_bao">Thông báo hành chính</option>
                      <option value="quyet_dinh">Quyết định tố tụng / giải quyết</option>
                      <option value="khac">Văn bản khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày lập</label>
                    <input
                      type="text"
                      value={editNgayLap}
                      onChange={(e) => setEditNgayLap(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                    <select
                      value={editTrangThai}
                      onChange={(e) => setEditTrangThai(e.target.value as any)}
                      className={`w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none ${editTrangThai === 'da_ban_hanh'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                    >
                      <option value="du_thao">Dự thảo văn bản</option>
                      <option value="da_ban_hanh">Đã ban hành chính thức</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người nhận / Đối tượng</label>
                  <input
                    type="text"
                    value={editNguoiNhan}
                    onChange={(e) => setEditNguoiNhan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian làm việc / Hạn phản hồi</label>
                  <input
                    type="text"
                    value={editThoiGianHen}
                    onChange={(e) => setEditThoiGianHen(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa điểm làm việc / Hình thức gửi</label>
                  <input
                    type="text"
                    value={editDiaDiem}
                    onChange={(e) => setEditDiaDiem(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trích yếu nội dung</label>
                  <textarea
                    rows={2}
                    value={editTrichYeu}
                    onChange={(e) => setEditTrichYeu(e.target.value)}
                    className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                {/* Ký số VGCA checkbox */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsSignedVGCA}
                      onChange={(e) => setEditIsSignedVGCA(e.target.checked)}
                      className="w-4 h-4 rounded text-[#004ac6] focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800 text-[11.5px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
                      <span>Ký số chứng thư công vụ VGCA</span>
                    </span>
                  </label>
                  <p className="text-[10.5px] text-slate-500 pl-6 mt-0.5">
                    Gắn con dấu điện tử chứng thực và mã băm SHA-256 vào chân văn bản
                  </p>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (8 cols): TỜ GIẤY A4 WYSIWYG TRỰC TIẾP */}
            <div className="lg:col-span-8 flex flex-col items-center">

              <div className="w-full bg-slate-200/80 rounded-2xl p-4 sm:p-8 flex justify-center border border-slate-300 overflow-x-auto shadow-inner">
                <div
                  className="bg-white shadow-2xl rounded-sm border border-slate-300 w-full max-w-[820px] min-h-[1100px] p-8 sm:p-12 text-slate-900 font-serif relative transition-transform origin-top flex flex-col justify-between"
                  style={{ transform: `scale(${editorZoom / 100})` }}
                >
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

                    {/* Phần 4: NỘI DUNG VĂN BẢN CHÍNH (CHỈNH SỬA TRỰC TIẾP TẠI ĐÂY) */}
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
                  {filteredDocs.map((doc, idx) => (
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
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${doc.isProcessDoc
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                              }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {doc.isProcessDoc ? 'gavel' : 'picture_as_pdf'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="font-bold text-slate-900 hover:text-[#004ac6] cursor-pointer leading-tight truncate max-w-[340px]"
                                onClick={() => handleStartEdit(doc)}
                                title={`Nhấp để mở chỉnh sửa trực tiếp: ${doc.name}`}
                              >
                                {doc.name}
                              </span>
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
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10.5px]">
                              {doc.soHieu && (
                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  Số: {doc.soHieu}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 font-medium border border-slate-200">
                                {doc.category}
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
                        <div className="flex items-center justify-end gap-1">
                          {/* NÚT CHỈNH SỬA TRỰC TIẾP */}
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
                        </div>
                      </td>
                    </tr>
                  ))}
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
