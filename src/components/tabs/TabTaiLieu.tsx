import React, { useState, useEffect } from 'react';
import { DonDetail } from '../../types';

interface TabTaiLieuProps {
  currentDon: DonDetail;
  onDocCountChange?: (count: number) => void;
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
}

export default function TabTaiLieu({ currentDon, onDocCountChange }: TabTaiLieuProps) {
  const isToGiac = currentDon.code.startsWith('Đ-2026') || currentDon.nguoiNop === 'Nguyễn Văn A';

  const initialDocs: DocItem[] = isToGiac
    ? [
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
      title: 'Biên bản làm việc / Ghi lời khai đương sự',
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

      {/* 1. Header Overview Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-[#004ac6] flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">folder_special</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[14px] sm:text-base font-bold text-slate-900 tracking-tight uppercase font-headline-md">
                  DANH MỤC HỒ SƠ, VĂN BẢN &amp; TÀI LIỆU XỬ LÝ
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold font-label-technical">
                  {documents.length} tệp tin số hóa
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-bold">
                  {processDocsCount} văn bản / quyết định trong quá trình xử lý
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Toàn bộ văn bản quyết định và tài liệu chứng cứ đều được bóc tách nội dung bằng AI OCR, gắn mã băm SHA-256 và kiểm tra chữ ký số công vụ VGCA.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => alert(`Đang tạo gói ZIP tải xuống toàn bộ ${documents.length} tệp tin...`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">download</span>
              <span>Tải trọn bộ (.ZIP)</span>
            </button>

            {/* NÚT CHÍNH: THÊM VĂN BẢN / QUYẾT ĐỊNH CHO QUÁ TRÌNH XỬ LÝ */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">post_add</span>
              <span>Thêm văn bản / Quyết định xử lý</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'all'
                  ? 'bg-white text-[#004ac6] shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Tất cả hồ sơ</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700">
                {documents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('process')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'process'
                  ? 'bg-white text-purple-700 shadow-2xs font-bold border border-purple-200'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              <span>Văn bản &amp; Quyết định xử lý</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
                {processDocsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('initial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'initial'
                  ? 'bg-white text-slate-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Hồ sơ nộp ban đầu</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700">
                {initialDocsCount}
              </span>
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên file, số hiệu, người ký..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004ac6] transition-all"
            />
          </div>
        </div>
      </div>

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
                  className={`hover:bg-blue-50/40 transition-colors ${
                    doc.isProcessDoc ? 'bg-purple-50/15' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                          doc.isProcessDoc
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
                            onClick={() => handleOpenPreview(doc)}
                            title={doc.name}
                          >
                            {doc.name}
                          </span>
                          {doc.isProcessDoc && (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                              Quy trình xử lý
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
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(doc)}
                        className="p-1.5 rounded-lg text-[#004ac6] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                        title="Xem trước văn bản"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Đang tải tệp: ${doc.name}`)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Tải tệp xuống"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>
                      {doc.isProcessDoc && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id, doc.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa văn bản này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
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
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[18px]">lock</span>
            <span>
              Tài liệu được lưu trữ an toàn trên kho lưu trữ điện tử chính phủ GOVEX Cloud, đáp ứng tiêu chuẩn an toàn thông tin cấp độ 3.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">SHA-256 Verified • RSA-2048</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL THÊM VĂN BẢN / QUYẾT ĐỊNH CHO QUÁ TRÌNH XỬ LÝ                     */}
      {/* ========================================================================= */}
      {showAddModal && (
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
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                        addForm.soHieu === tpl.soHieu
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
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL XEM TRƯỚC VĂN BẢN (PREVIEW PDF MODAL)                            */}
      {/* ========================================================================= */}
      {showPreviewModal && selectedDoc && (
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
      )}
    </div>
  );
}
