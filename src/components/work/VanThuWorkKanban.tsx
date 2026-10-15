import React, { useState, useMemo } from 'react';
import { Screen, LuotNhan, DonDetail, UploadedFile } from '../../types';

interface VanThuWorkItem {
  id: string;
  code: string;
  badge: string;
  nguoiNop: string;
  cccd?: string;
  sdt?: string;
  diaChi?: string;
  canBoNhan?: string;
  donViNhan?: string;
  hinhThuc: string;
  ngayNhan: string;
  gioNhan?: string;
  status: 'chua_chuyen' | 'da_chuyen_can_bo' | 'da_chuyen_don_vi';
  noiDung?: string;
  loaiDon?: string;
  files?: UploadedFile[];
  historyLogs?: { time: string; action: string; actor: string; note?: string }[];
}

const INITIAL_VAN_THU_ITEMS: VanThuWorkItem[] = [
  {
    id: 'LN-305',
    code: 'LN-305/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Nguyễn Văn Tuấn',
    cccd: '001085012399',
    sdt: '0912 345 678',
    diaChi: 'Số 18 phố Tràng Thi, Hàng Trống, Hoàn Kiếm, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '08:30:00',
    status: 'chua_chuyen',
    noiDung: 'Tiếp nhận hồ sơ đơn phản ánh kiến nghị trực tiếp tại bộ phận một cửa về việc cấp phép cải tạo nhà ở',
    loaiDon: 'Đơn phản ánh kiến nghị',
    files: [
      { name: 'Don_kien_nghi_LN-305.pdf', size: '2.1 MB', category: 'main' },
      { name: 'Can_cuoc_cong_dan_NguyenVanTuan.pdf', size: '750 KB', category: 'attach' },
      { name: 'Giay_xac_nhan_hien_trang.pdf', size: '1.4 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 08:30:00', action: 'Tiếp nhận hồ sơ trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Công dân nộp trực tiếp tại quầy 03, đã kiểm tra đủ 03 tệp tài liệu gốc' },
      { time: '13/10/2026 08:45:00', action: 'Số hóa và lập mã lượt nhận LN-305/2026-CATPHN', actor: 'Lê Ngọc Mai', note: 'Chờ phân luồng chuyển cán bộ chuyên môn thụ lý' },
    ],
  },
  {
    id: 'LN-291',
    code: 'LN-291/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Trần Thị Mai',
    cccd: '001190008765',
    sdt: '0983 221 445',
    diaChi: 'Số 55 ngõ 12 phố Đào Tấn, Cống Vị, Ba Đình, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '09:15:00',
    status: 'chua_chuyen',
    noiDung: 'Đơn kiến nghị về trật tự giao thông và tình trạng lấn chiếm quy hoạch hè phố tại khu dân cư',
    loaiDon: 'Đơn kiến nghị',
    files: [
      { name: 'Don_kien_nghi_trat_tu_do_thi_LN-291.pdf', size: '1.9 MB', category: 'main' },
      { name: 'Hinh_anh_hien_truong_lan_chiem.pdf', size: '3.2 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 09:15:00', action: 'Tiếp nhận hồ sơ trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Tiếp nhận đơn và hình ảnh hiện trường vi phạm' },
    ],
  },
  {
    id: 'LN-280',
    code: 'LN-280/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Hoàng Đức Hùng',
    cccd: '001088019876',
    sdt: '0904 556 789',
    diaChi: 'Số 102 đường Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '09:40:00',
    status: 'chua_chuyen',
    noiDung: 'Phản ánh tiếng ồn và vi phạm xả thải ban đêm của cơ sở kinh doanh dịch vụ ăn uống',
    loaiDon: 'Đơn phản ánh',
    files: [
      { name: 'Don_phan_anh_tieng_on_LN-280.pdf', size: '1.6 MB', category: 'main' },
      { name: 'Bien_ban_do_kiem_am_thanh.pdf', size: '2.8 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 09:40:00', action: 'Tiếp nhận hồ sơ trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Ghi nhận đơn và tài liệu bằng chứng kèm theo' },
    ],
  },
  {
    id: 'LN-242',
    code: 'LN-242/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Lê Đình Toàn',
    cccd: '001092003456',
    sdt: '0913 889 900',
    diaChi: 'Xã Tân Triều, Thanh Trì, TP. Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '10:05:00',
    status: 'chua_chuyen',
    noiDung: 'Đơn đề nghị hướng dẫn thủ tục hành chính về đăng ký tạm trú cho người lao động thuê nhà',
    loaiDon: 'Đơn đề nghị',
    files: [
      { name: 'Don_de_nghi_huong_dan_LN-242.pdf', size: '1.2 MB', category: 'main' },
    ],
    historyLogs: [
      { time: '13/10/2026 10:05:00', action: 'Tiếp nhận hồ sơ trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Tiếp nhận phiếu đề nghị hướng dẫn thủ tục hành chính' },
    ],
  },

  // Cột 2: Đã chuyển cán bộ
  {
    id: 'LN-315',
    code: 'LN-315/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Phạm Thu Hằng',
    canBoNhan: 'Nguyễn Hoàng Nam',
    cccd: '001194002341',
    sdt: '0978 112 233',
    diaChi: 'Số 88 đường Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '08:15:00',
    status: 'da_chuyen_can_bo',
    noiDung: 'Đã phân công cán bộ thụ lý kiểm tra tính hợp lệ hồ sơ khiếu nại đất đai',
    loaiDon: 'Đơn khiếu nại',
    files: [
      { name: 'Don_khieu_nai_dat_dai_LN-315.pdf', size: '2.5 MB', category: 'main' },
      { name: 'Trich_luc_ban_do_dia_chinh.pdf', size: '3.1 MB', category: 'attach' },
      { name: 'Giay_chung_nhan_quyen_su_dung_dat.pdf', size: '1.8 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 08:15:00', action: 'Tiếp nhận hồ sơ trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Tiếp nhận đơn khiếu nại và bản đồ địa chính kèm theo' },
      { time: '13/10/2026 09:30:00', action: 'Phân luồng & Chuyển cán bộ thụ lý', actor: 'Lê Ngọc Mai', note: 'Đã chuyển trực tiếp cho cán bộ Nguyễn Hoàng Nam phụ trách địa bàn Cầu Giấy' },
    ],
  },
  {
    id: 'LN-313',
    code: 'LN-313/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Đỗ Văn Nam',
    canBoNhan: 'Nguyễn Hoàng Nam',
    cccd: '001089015678',
    sdt: '0966 334 455',
    diaChi: 'Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '09:00:00',
    status: 'da_chuyen_can_bo',
    noiDung: 'Đã chuyển cán bộ xác minh nội dung phản ánh bồi thường giải phóng mặt bằng',
    loaiDon: 'Đơn phản ánh kiến nghị',
    files: [
      { name: 'Don_phan_anh_giai_phong_mat_bang_LN-313.pdf', size: '2.3 MB', category: 'main' },
      { name: 'Phuong_an_boi_thuong_so_bo.pdf', size: '1.5 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 09:00:00', action: 'Tiếp nhận trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Tiếp nhận đơn phản ánh và hồ sơ đính kèm' },
      { time: '13/10/2026 10:15:00', action: 'Chuyển cán bộ thụ lý', actor: 'Lê Ngọc Mai', note: 'Đã chuyển cán bộ Nguyễn Hoàng Nam xác minh hồ sơ' },
    ],
  },
  {
    id: 'LN-314',
    code: 'LN-314/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Trương Minh Châu',
    canBoNhan: 'Nguyễn Hoàng Nam',
    cccd: '001095014321',
    sdt: '0934 667 889',
    diaChi: 'Số 45 phố Lạc Long Quân, Nghĩa Đô, Cầu Giấy, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '09:20:00',
    status: 'da_chuyen_can_bo',
    noiDung: 'Chờ cán bộ thụ lý lập đề xuất xử lý đơn tố cáo vi phạm quy chế quản lý trật tự',
    loaiDon: 'Đơn tố cáo',
    files: [
      { name: 'Don_to_cao_LN-314.pdf', size: '1.7 MB', category: 'main' },
      { name: 'Bang_chung_hinh_anh.pdf', size: '2.4 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 09:20:00', action: 'Tiếp nhận trực tiếp tại Một cửa', actor: 'Lê Ngọc Mai', note: 'Tiếp nhận đơn tố cáo và bằng chứng kèm theo' },
      { time: '13/10/2026 10:40:00', action: 'Chuyển cán bộ thụ lý', actor: 'Lê Ngọc Mai', note: 'Chuyển cán bộ Nguyễn Hoàng Nam lập đề xuất thụ lý' },
    ],
  },
  {
    id: 'LN-311',
    code: 'LN-311/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Nguyễn Thị Hạnh',
    canBoNhan: 'Nguyễn Minh Anh',
    cccd: '001191007654',
    sdt: '0903 222 111',
    diaChi: 'Thị trấn Đông Anh, huyện Đông Anh, Hà Nội',
    hinhThuc: 'Bưu chính',
    ngayNhan: '12/10/2026',
    gioNhan: '14:30:00',
    status: 'da_chuyen_can_bo',
    noiDung: 'Đơn gửi bưu điện đã chuyển cán bộ tiếp nhận kiểm tra điều kiện thụ lý',
    loaiDon: 'Đơn phản ánh kiến nghị',
    files: [
      { name: 'Don_gui_buu_dien_LN-311.pdf', size: '2.0 MB', category: 'main' },
      { name: 'Phieu_gui_buu_dien_EMS.pdf', size: '600 KB', category: 'attach' },
    ],
    historyLogs: [
      { time: '12/10/2026 14:30:00', action: 'Tiếp nhận qua đường bưu điện', actor: 'Lê Ngọc Mai', note: 'Bưu tá giao đơn gửi theo đường bưu điện' },
      { time: '12/10/2026 15:10:00', action: 'Chuyển cán bộ thụ lý', actor: 'Lê Ngọc Mai', note: 'Đã giao chuyên viên Nguyễn Minh Anh phụ trách' },
    ],
  },
  {
    id: 'LN-310',
    code: 'LN-310/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Vũ Đình Khoa',
    donViNhan: 'Công an thành phố Hà Nội',
    cccd: '001083009988',
    sdt: '0989 778 899',
    diaChi: 'Phường Hàng Bông, Hoàn Kiếm, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '08:00:00',
    status: 'da_chuyen_don_vi',
    noiDung: 'Đã chuyển đơn vị chuyên trách thụ lý theo thẩm quyền về an ninh kinh tế',
    loaiDon: 'Đơn phản ánh',
    files: [
      { name: 'Don_chuyen_don_vi_LN-310.pdf', size: '2.2 MB', category: 'main' },
      { name: 'Phieu_chuyen_don_so_104.pdf', size: '920 KB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 08:00:00', action: 'Tiếp nhận trực tiếp', actor: 'Lê Ngọc Mai', note: 'Tiếp nhận tại quầy tiếp công dân' },
      { time: '13/10/2026 09:10:00', action: 'Lập phiếu chuyển đơn vị', actor: 'Lê Ngọc Mai', note: 'Đã lập phiếu chuyển tiếp về Công an TP Hà Nội thụ lý' },
    ],
  },
  {
    id: 'LN-306',
    code: 'LN-306/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Lý Quang Minh',
    donViNhan: 'Công an thành phố Hà Nội',
    cccd: '001096001234',
    sdt: '0915 443 322',
    diaChi: 'Phường Ô Chợ Dừa, Đống Đa, Hà Nội',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '08:50:00',
    status: 'da_chuyen_don_vi',
    noiDung: 'Chuyển Phòng Cảnh sát kinh tế (PC03) xem xét dấu hiệu vi phạm kinh doanh đa cấp',
    loaiDon: 'Đơn tố giác',
    files: [
      { name: 'Don_to_giac_PC03_LN-306.pdf', size: '2.8 MB', category: 'main' },
      { name: 'Chung_tu_giao_dich_ngan_hang.pdf', size: '1.9 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 08:50:00', action: 'Tiếp nhận đơn tố giác', actor: 'Lê Ngọc Mai', note: 'Công dân nộp đơn và sao kê giao dịch ngân hàng' },
      { time: '13/10/2026 10:00:00', action: 'Chuyển Phòng PC03', actor: 'Lê Ngọc Mai', note: 'Chuyển Phòng Cảnh sát kinh tế theo thẩm quyền nghiệp vụ' },
    ],
  },
  {
    id: 'LN-308',
    code: 'LN-308/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Ngô Bá Thắng',
    donViNhan: 'Công an tỉnh Tuyên Quang',
    cccd: '001087016543',
    sdt: '0942 556 677',
    diaChi: 'Phường Phan Thiết, TP. Tuyên Quang, Tuyên Quang',
    hinhThuc: 'Trực tiếp',
    ngayNhan: '13/10/2026',
    gioNhan: '09:10:00',
    status: 'da_chuyen_don_vi',
    noiDung: 'Phiếu chuyển đơn liên tỉnh theo thẩm quyền địa bàn phát sinh vụ việc',
    loaiDon: 'Đơn chuyển cơ quan có thẩm quyền',
    files: [
      { name: 'Don_lien_tinh_LN-308.pdf', size: '1.8 MB', category: 'main' },
      { name: 'Phieu_chuyen_CATuyenQuang.pdf', size: '850 KB', category: 'attach' },
    ],
    historyLogs: [
      { time: '13/10/2026 09:10:00', action: 'Tiếp nhận đơn', actor: 'Lê Ngọc Mai', note: 'Xem xét thẩm quyền địa giới hành chính' },
      { time: '13/10/2026 10:20:00', action: 'Phát hành phiếu chuyển liên tỉnh', actor: 'Lê Ngọc Mai', note: 'Gửi chuyển tiếp phát hành đến Công an tỉnh Tuyên Quang' },
    ],
  },
  {
    id: 'LN-302',
    code: 'LN-302/2026-CATPHN',
    badge: 'Lượt nhận',
    nguoiNop: 'Bùi Thị Thu',
    donViNhan: 'Sở Xây dựng Hà Nội',
    cccd: '001193005432',
    sdt: '0977 889 900',
    diaChi: 'Số 12 phố Huế, Hàng Bài, Hoàn Kiếm, Hà Nội',
    hinhThuc: 'Trực tuyến',
    ngayNhan: '12/10/2026',
    gioNhan: '16:00:00',
    status: 'da_chuyen_don_vi',
    noiDung: 'Chuyển đơn vị quản lý trật tự xây dựng giải quyết kiến nghị cấp phép',
    loaiDon: 'Đơn phản ánh kiến nghị',
    files: [
      { name: 'Don_truc_tuyen_SXD_LN-302.pdf', size: '1.5 MB', category: 'main' },
      { name: 'Ho_so_thiet_ke_xay_dung.pdf', size: '4.5 MB', category: 'attach' },
    ],
    historyLogs: [
      { time: '12/10/2026 16:00:00', action: 'Tiếp nhận qua Cổng Dịch vụ công', actor: 'Lê Ngọc Mai', note: 'Hồ sơ đồng bộ từ Cổng Dịch vụ công trực tuyến' },
      { time: '13/10/2026 08:30:00', action: 'Chuyển đơn vị quản lý trật tự xây dựng', actor: 'Lê Ngọc Mai', note: 'Chuyển Sở Xây dựng Hà Nội giải quyết theo chức năng' },
    ],
  },
];

interface VanThuWorkKanbanProps {
  onNav: (s: Screen) => void;
  onSelect?: (ln: LuotNhan) => void;
  onSelectDon?: (don: DonDetail) => void;
  onSwitchAccount?: () => void;
}

export default function VanThuWorkKanban({
  onNav,
  onSelect,
  onSelectDon,
}: VanThuWorkKanbanProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterStatus, setActiveFilterStatus] = useState<'all' | 'chua_chuyen' | 'da_chuyen_can_bo' | 'da_chuyen_don_vi'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const filteredItems = useMemo(() => {
    return INITIAL_VAN_THU_ITEMS.filter((item) => {
      if (activeFilterStatus !== 'all' && item.status !== activeFilterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.nguoiNop.toLowerCase().includes(q) ||
          (item.canBoNhan && item.canBoNhan.toLowerCase().includes(q)) ||
          (item.donViNhan && item.donViNhan.toLowerCase().includes(q)) ||
          (item.noiDung && item.noiDung.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [searchQuery, activeFilterStatus]);

  const colChuaChuyen = useMemo(
    () => filteredItems.filter((i) => i.status === 'chua_chuyen'),
    [filteredItems]
  );
  const colDaChuyenCanBo = useMemo(
    () => filteredItems.filter((i) => i.status === 'da_chuyen_can_bo'),
    [filteredItems]
  );
  const colDaChuyenDonVi = useMemo(
    () => filteredItems.filter((i) => i.status === 'da_chuyen_don_vi'),
    [filteredItems]
  );

  const handleChuyenXuLy = (item: VanThuWorkItem) => {
    const defaultFiles: UploadedFile[] = item.files && item.files.length > 0
      ? item.files
      : [
        { name: `Don_tiep_nhan_${item.id}.pdf`, size: '2.1 MB', category: 'main' },
        { name: 'Can_cuoc_cong_dan.pdf', size: '850 KB', category: 'attach' },
        { name: 'Tai_lieu_kem_theo.pdf', size: '1.4 MB', category: 'attach' },
      ];

    const defaultLogs = item.historyLogs && item.historyLogs.length > 0
      ? item.historyLogs
      : [
        {
          time: `${item.ngayNhan} ${item.gioNhan || '08:30:00'}`,
          action: 'Tiếp nhận hồ sơ trực tiếp tại Bộ phận Một cửa',
          actor: 'Lê Ngọc Mai',
          note: `Công dân ${item.nguoiNop} nộp trực tiếp tại quầy Một cửa CATP Hà Nội`,
        },
      ];

    if (item.status === 'da_chuyen_can_bo' || item.status === 'da_chuyen_don_vi') {
      const dynamicCode = `Đ-${item.code.replace('LN-', '')}`;
      const mockDon: DonDetail = {
        id: dynamicCode,
        code: dynamicCode,
        title: item.noiDung || `Hồ sơ ${item.code}`,
        luotNhanId: item.code,
        nguoiNop: item.nguoiNop,
        cccd: item.cccd,
        sdt: item.sdt,
        diaChi: item.diaChi,
        ngayNhan: item.ngayNhan,
        loaiDon: item.loaiDon || 'Đơn phản ánh kiến nghị',
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: 'Đang xử lý',
      };
      if (onSelectDon) onSelectDon(mockDon);
      onNav('don-tiep-nhan');
      showToast(`Mở chi tiết đơn [${dynamicCode}]`);
      return;
    }

    if (onSelect) {
      const mockLn: LuotNhan = {
        id: item.code,
        nguoiNop: item.nguoiNop,
        cccd: item.cccd,
        sdt: item.sdt,
        diaChi: item.diaChi,
        hinhThuc: item.hinhThuc,
        ngayNhan: item.ngayNhan,
        gioNhan: item.gioNhan || '08:30:00',
        noiDung: item.noiDung || `Lượt nhận hồ sơ ${item.code}`,
        donVi: item.donViNhan || 'Công an thành phố Hà Nội',
        canBoNhan: item.canBoNhan,
        loaiDon: item.loaiDon || 'Đơn phản ánh kiến nghị',
        aiJob: 3,
        status: 'cho_chuyen',
        hasFile: true,
        fileCount: defaultFiles.length,
        files: defaultFiles,
        historyLogs: defaultLogs,
        ghiChu: 'cong-viec',
      };
      onSelect(mockLn);
    }
    onNav('ban-phan-tich');
    showToast(`Mở phân tích & chuyển xử lý hồ sơ [${item.code}]`);
  };

  const handleXemChiTiet = (item: VanThuWorkItem) => {
    const defaultFiles: UploadedFile[] = item.files && item.files.length > 0
      ? item.files
      : [
        { name: `Don_tiep_nhan_${item.id}.pdf`, size: '2.1 MB', category: 'main' },
        { name: 'Can_cuoc_cong_dan.pdf', size: '850 KB', category: 'attach' },
        { name: 'Tai_lieu_dinh_kem.pdf', size: '1.4 MB', category: 'attach' },
      ];

    const defaultLogs = item.historyLogs && item.historyLogs.length > 0
      ? item.historyLogs
      : [
        {
          time: `${item.ngayNhan} ${item.gioNhan || '08:30:00'}`,
          action: 'Tiếp nhận hồ sơ trực tiếp tại Bộ phận Một cửa',
          actor: 'Lê Ngọc Mai',
          note: `Công dân ${item.nguoiNop} nộp trực tiếp tại quầy Một cửa CATP Hà Nội`,
        },
        ...(item.status === 'da_chuyen_can_bo' ? [
          {
            time: `${item.ngayNhan} 09:45:00`,
            action: `Chuyển xử lý trực tiếp cho cán bộ ${item.canBoNhan || 'Nguyễn Hoàng Nam'}`,
            actor: 'Lê Ngọc Mai',
            note: 'Đã phân công thụ lý kiểm tra tính hợp lệ của hồ sơ',
          }
        ] : []),
        ...(item.status === 'da_chuyen_don_vi' ? [
          {
            time: `${item.ngayNhan} 10:15:00`,
            action: `Chuyển hồ sơ về ${item.donViNhan || 'Công an thành phố Hà Nội'}`,
            actor: 'Lê Ngọc Mai',
            note: 'Chuyển đơn vị chuyên môn thụ lý theo thẩm quyền',
          }
        ] : []),
      ];

    if (onSelect) {
      const mockLn: LuotNhan = {
        id: item.code,
        nguoiNop: item.nguoiNop,
        cccd: item.cccd,
        sdt: item.sdt,
        diaChi: item.diaChi,
        hinhThuc: item.hinhThuc,
        ngayNhan: item.ngayNhan,
        gioNhan: item.gioNhan || '08:30:00',
        noiDung: item.noiDung || `Lượt nhận hồ sơ ${item.code}`,
        donVi: item.donViNhan || 'Công an thành phố Hà Nội',
        canBoNhan: item.canBoNhan,
        loaiDon: item.loaiDon || 'Đơn phản ánh kiến nghị',
        aiJob: 3,
        status: item.status === 'chua_chuyen' ? 'cho_chuyen' : 'da_chuyen',
        hasFile: true,
        fileCount: defaultFiles.length,
        files: defaultFiles,
        historyLogs: defaultLogs,
        ghiChu: 'cong-viec',
      };
      onSelect(mockLn);
    }
    if (onSelectDon) {
      const mockDon: DonDetail = {
        id: `Đ-${item.code.replace('LN-', '')}`,
        code: `Đ-${item.code.replace('LN-', '')}`,
        title: item.noiDung || `Hồ sơ ${item.code}`,
        luotNhanId: item.code,
        nguoiNop: item.nguoiNop,
        cccd: item.cccd,
        sdt: item.sdt,
        diaChi: item.diaChi,
        ngayNhan: item.ngayNhan,
        loaiDon: item.loaiDon || 'Đơn phản ánh kiến nghị',
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: item.status === 'chua_chuyen'
          ? 'Chưa chuyển xử lý'
          : item.status === 'da_chuyen_can_bo'
            ? `Đã chuyển CB ${item.canBoNhan}`
            : `Đã chuyển ${item.donViNhan}`,
      };
      onSelectDon(mockDon);
    }
    onNav('chi-tiet-luot-nhan');
    showToast(`Mở chi tiết lượt nhận [${item.code}]`);
  };

  return (
    <div className="flex-1 p-4 sm:p-5 w-full flex flex-col space-y-4 font-body-md bg-[#f4f7fb] min-h-screen">
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[17px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Bar: Tiêu đề + Role pill + Nút "+ Tiếp nhận" */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">inbox</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-headline-md tracking-tight">
                Không gian làm việc Văn thư - Tiếp nhận
              </h1>
              {/* <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                BỘ PHẬN MỘT CỬA
              </span> */}
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Theo dõi lượt nhận, phân luồng chuyển cán bộ thụ lý và chuyển tiếp đơn vị liên ngành
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNav('nhan-don-them')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003da6] active:scale-95 text-white font-bold text-xs sm:text-[13px] shadow-xs cursor-pointer transition-all"
            title="Tạo mới lượt nhận / Tiếp nhận đơn"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Tiếp nhận mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh tìm kiếm và bộ lọc */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã lượt nhận, người nộp, cán bộ nhận, đơn vị nhận..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15 transition-all font-normal shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setActiveFilterStatus('all');
            showToast('Đã xóa bộ lọc tìm kiếm');
          }}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          Xóa lọc
        </button>

        <button
          type="button"
          onClick={() => showToast('Đã làm mới dữ liệu lượt nhận')}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
          title="Làm mới danh sách"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
        </button>
      </div>

      {/* 3. Hàng 4 thẻ KPI thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tổng công việc */}
        <div
          onClick={() => setActiveFilterStatus('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${activeFilterStatus === 'all'
            ? 'bg-blue-50/80 border-[#004ac6] ring-2 ring-[#004ac6]/20'
            : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
            <span className="material-symbols-outlined text-[17px] text-[#004ac6]">folder</span>
            <span>Tổng lượt nhận</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5 font-headline-md">
            208
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Toàn bộ hồ sơ lượt nhận Một cửa
          </p>
        </div>

        {/* Card 2: Chưa chuyển xử lý */}
        <div
          onClick={() => setActiveFilterStatus(activeFilterStatus === 'chua_chuyen' ? 'all' : 'chua_chuyen')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${activeFilterStatus === 'chua_chuyen'
            ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
            : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Chưa chuyển xử lý</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 leading-tight mt-1.5 font-headline-md">
            17
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cần phân loại &amp; chuyển thụ lý
          </p>
        </div>

        {/* Card 3: Đã chuyển cán bộ */}
        <div
          onClick={() => setActiveFilterStatus(activeFilterStatus === 'da_chuyen_can_bo' ? 'all' : 'da_chuyen_can_bo')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${activeFilterStatus === 'da_chuyen_can_bo'
            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
            : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Đã chuyển cán bộ</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5 font-headline-md">
            151
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Đã giao chuyên viên thụ lý
          </p>
        </div>

        {/* Card 4: Đã chuyển về đơn vị */}
        <div
          onClick={() => setActiveFilterStatus(activeFilterStatus === 'da_chuyen_don_vi' ? 'all' : 'da_chuyen_don_vi')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${activeFilterStatus === 'da_chuyen_don_vi'
            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
            : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
        >
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Đã chuyển đơn vị</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight mt-1.5 font-headline-md">
            40
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Chuyển tiếp cơ quan liên ngành
          </p>
        </div>
      </div>

      {/* 4. Kanban 3 Cột: Chưa chuyển xử lý | Đã chuyển cán bộ | Đã chuyển về đơn vị */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* CỘT 1: CHƯA CHUYỂN XỬ LÝ (17) */}
        <div className="bg-white border border-rose-200/90 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xs min-h-[580px] max-h-[calc(100vh-280px)] overflow-y-auto">
          <div className="flex items-center justify-between px-1.5 sticky top-0 bg-white pb-2 z-10 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <h2 className="text-[13.5px] font-bold text-slate-900">
                Chưa chuyển xử lý
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold shadow-2xs">
              {colChuaChuyen.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {colChuaChuyen.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-rose-200 text-center text-xs text-slate-500">
                Không có hồ sơ nào
              </div>
            ) : (
              colChuaChuyen.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleXemChiTiet(item)}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 p-3.5 space-y-2.5 shadow-2xs hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200/60 inline-block">
                        {item.badge}
                      </span>
                      {/* {item.files && item.files.length > 0 && (
                        <span className="text-[10.5px] text-slate-400 font-medium flex items-center gap-0.5" title={`${item.files.length} tệp đính kèm`}>
                          <span className="material-symbols-outlined text-[13px] text-slate-400">attach_file</span>
                          {item.files.length}
                        </span>
                      )} */}
                    </div>
                    <span className="text-[11px] text-slate-400 font-label-technical">
                      {item.ngayNhan}
                    </span>
                  </div>

                  <h3 className="text-[13.5px] font-bold text-slate-900 tracking-tight font-label-technical group-hover:text-[#004ac6] transition-colors">
                    {item.code}
                  </h3>

                  <p className="text-[12px] text-slate-600 line-clamp-2">
                    {item.noiDung}
                  </p>

                  <div className="space-y-1 text-[11.5px] pt-1.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người nộp:</span>
                      <span className="font-semibold text-slate-800 text-right">{item.nguoiNop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hình thức nhận:</span>
                      <span className="font-medium text-slate-700 text-right">{item.hinhThuc}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {/* <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleXemChiTiet(item);
                      }}
                      className="py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 active:scale-98 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-2xs flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px] text-slate-500">visibility</span>
                      <span>Xem chi tiết</span>
                    </button> */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChuyenXuLy(item);
                      }}
                      className="py-2 bg-[#004ac6] hover:bg-[#003da6] active:scale-98 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center shadow-xs flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">send</span>
                      <span>Chuyển xử lý</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT 2: ĐÃ CHUYỂN CÁN BỘ (151) */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xs min-h-[580px] max-h-[calc(100vh-280px)] overflow-y-auto">
          <div className="flex items-center justify-between px-1.5 sticky top-0 bg-white pb-2 z-10 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-[13.5px] font-bold text-slate-900">
                Đã chuyển cán bộ
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold shadow-2xs">
              {colDaChuyenCanBo.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {colDaChuyenCanBo.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-amber-200 text-center text-xs text-slate-500">
                Không có hồ sơ nào
              </div>
            ) : (
              colDaChuyenCanBo.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleXemChiTiet(item)}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-amber-300 p-3.5 space-y-2.5 shadow-2xs hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 inline-block">
                        {item.badge}
                      </span>
                      {/* {item.files && item.files.length > 0 && (
                        <span className="text-[10.5px] text-slate-400 font-medium flex items-center gap-0.5" title={`${item.files.length} tệp đính kèm`}>
                          <span className="material-symbols-outlined text-[13px] text-slate-400">attach_file</span>
                          {item.files.length}
                        </span>
                      )} */}
                    </div>
                    <span className="text-[11px] text-slate-400 font-label-technical">
                      {item.ngayNhan}
                    </span>
                  </div>

                  <h3 className="text-[13.5px] font-bold text-[#004ac6] tracking-tight font-label-technical group-hover:underline">
                    {item.code}
                  </h3>

                  <p className="text-[12px] text-slate-600 line-clamp-2">
                    {item.noiDung}
                  </p>

                  <div className="space-y-1 text-[11.5px] pt-1.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người nộp:</span>
                      <span className="font-semibold text-slate-800 text-right">{item.nguoiNop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cán bộ nhận:</span>
                      <span className="font-bold text-[#004ac6] text-right">{item.canBoNhan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hình thức nhận:</span>
                      <span className="font-medium text-slate-700 text-right">{item.hinhThuc}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleXemChiTiet(item);
                    }}
                    className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 active:scale-98 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">visibility</span>
                    <span>Xem chi tiết lượt nhận</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT 3: ĐÃ CHUYỂN VỀ ĐƠN VỊ (40) */}
        <div className="bg-white border border-blue-200/90 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xs min-h-[580px] max-h-[calc(100vh-280px)] overflow-y-auto">
          <div className="flex items-center justify-between px-1.5 sticky top-0 bg-white pb-2 z-10 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-[13.5px] font-bold text-slate-900">
                Đã chuyển về đơn vị
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200 text-[11px] font-bold shadow-2xs">
              {colDaChuyenDonVi.length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {colDaChuyenDonVi.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-blue-200 text-center text-xs text-slate-500">
                Không có hồ sơ nào
              </div>
            ) : (
              colDaChuyenDonVi.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleXemChiTiet(item)}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 p-3.5 space-y-2.5 shadow-2xs hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 inline-block">
                        {item.badge}
                      </span>
                      {/* {item.files && item.files.length > 0 && (
                        <span className="text-[10.5px] text-slate-400 font-medium flex items-center gap-0.5" title={`${item.files.length} tệp đính kèm`}>
                          <span className="material-symbols-outlined text-[13px] text-slate-400">attach_file</span>
                          {item.files.length}
                        </span>
                      )} */}
                    </div>
                    <span className="text-[11px] text-slate-400 font-label-technical">
                      {item.ngayNhan}
                    </span>
                  </div>

                  <h3 className="text-[13.5px] font-bold text-slate-900 tracking-tight font-label-technical group-hover:text-[#004ac6] transition-colors">
                    {item.code}
                  </h3>

                  <p className="text-[12px] text-slate-600 line-clamp-2">
                    {item.noiDung}
                  </p>

                  <div className="space-y-1 text-[11.5px] pt-1.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người nộp:</span>
                      <span className="font-semibold text-slate-800 text-right">{item.nguoiNop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Đơn vị nhận:</span>
                      <span className="font-bold text-indigo-800 text-right">{item.donViNhan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Hình thức nhận:</span>
                      <span className="font-medium text-slate-700 text-right">{item.hinhThuc}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleXemChiTiet(item);
                    }}
                    className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 active:scale-98 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-slate-500">visibility</span>
                    <span>Xem chi tiết lượt nhận</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
