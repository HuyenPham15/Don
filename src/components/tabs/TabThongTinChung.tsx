import React, { useState } from 'react';
import { DonDetail } from '../../types';

export interface DuongSuItem {
  id: string;
  hoTen: string;
  loaiDoiTuong: 'ca_nhan' | 'to_chuc';
  phanNhom: 'nguoi_nop' | 'ben_bi_to_giac' | 'lien_quan';
  vaiTro: string;
  vaiTroColor: 'blue' | 'indigo' | 'purple' | 'rose' | 'amber' | 'emerald';
  isPrimary?: boolean;
  dinhDanh: string;
  dinhDanhLabel: string;
  xacThucBadge?: string;
  xacThucColor?: 'emerald' | 'blue' | 'amber' | 'slate';
  tuCach: string;
  sdt?: string;
  email?: string;
  diaChi: string;
  ngaySinh?: string;
  chucVu?: string;
  donVi?: string;
  quanHeLienDoi?: string;
  giayToKemTheo?: string;
  nguonTrichXuat?: string;
  doTinCai?: string;
}

export interface PhanLoaiDonState {
  loaiDon: string;
  linhVuc: string;
  canCuPhapLy: string;
  thamQuyen: string;
  huongXuLy: string;
  doTinCaiAi: string;
  nguonTrichXuatAi: string;
  isModifiedByUser: boolean;
  ngayCapNhat?: string;
  nguoiCapNhat?: string;
  ghiChuCuaCanBo?: string;
}

export const LOAI_DON_SUGGESTIONS = [
  'Đơn tố giác về tội phạm',
  'Đơn tin báo về tội phạm',
  'Đơn kiến nghị khởi tố',
  'Đơn khiếu nại (Lần 1)',
  'Đơn khiếu nại (Lần 2)',
  'Đơn tố cáo',
  'Đơn phản ánh, kiến nghị',
  'Đơn tranh chấp dân sự / khởi kiện',
  'Đơn đề nghị giám đốc thẩm / tái thẩm',
  'Đơn khiếu nại trong hoạt động tố tụng',
];

export const LINH_VUC_SUGGESTIONS = [
  'Hình sự - Kinh tế & Trật tự xã hội (Lừa đảo chiếm đoạt tài sản)',
  'Hình sự - Tham nhũng, chức vụ & Buôn lậu',
  'Hình sự - Trật tự an toàn xã hội',
  'Đất đai - Bồi thường, hỗ trợ, tái định cư khi thu hồi đất',
  'Đất đai - Tranh chấp ranh giới, cấp Giấy chứng nhận QSDĐ',
  'Hành chính - Quản lý trật tự đô thị, cấp phép xây dựng',
  'Dân sự - Hợp đồng kinh doanh thương mại & Tín dụng',
  'Lao động - Tiền lương, bảo hiểm xã hội & Chế độ chính sách',
  'Tư pháp - Hoạt động điều tra, truy tố, xét xử & Thi hành án',
];

export const THAM_QUYEN_SUGGESTIONS = [
  'Thuộc thẩm quyền giải quyết của Cơ quan Cảnh sát điều tra (PC03 / Đội Điều tra tổng hợp) - Công an TP Hà Nội',
  'Thuộc thẩm quyền giải quyết của Cơ quan Cảnh sát điều tra (PC02 / Đội Điều tra TTXH) - Công an TP Hà Nội',
  'Thuộc thẩm quyền giải quyết của Viện kiểm sát nhân dân cấp quận/huyện',
  'Thuộc thẩm quyền giải quyết của Viện kiểm sát nhân dân cấp tỉnh/thành phố',
  'Thuộc thẩm quyền giải quyết của Chủ tịch UBND quận/huyện & Phòng Tài nguyên và Môi trường',
  'Thuộc thẩm quyền giải quyết của Chủ tịch UBND tỉnh/thành phố',
  'Thuộc thẩm quyền giải quyết của Tòa án nhân dân quận/huyện',
  'Thuộc thẩm quyền của Thanh tra tỉnh / Thanh tra sở ngành',
  'Không thuộc thẩm quyền thụ lý (Chuyển đơn hoặc Hướng dẫn đương sự)',
];

export const HUONG_XU_LY_SUGGESTIONS = [
  'Phân công Điều tra viên thụ lý nguồn tin tội phạm, xác minh dòng tiền giao dịch ngân hàng và tiến hành triệu tập đối tượng liên quan để ghi lời khai',
  'Thụ lý giải quyết khiếu nại lần 1, thành lập tổ xác minh thực địa và tổ chức đối thoại trực tiếp với công dân theo luật định',
  'Ban hành Quyết định thụ lý giải quyết đơn và thông báo cho người nộp đơn trong thời hạn 03 ngày làm việc',
  'Chuyển đơn đến Cơ quan Cảnh sát điều tra có thẩm quyền kèm phiếu chuyển đơn theo Thông tư liên tịch 01/2017',
  'Hướng dẫn công dân làm đơn khởi kiện vụ án dân sự tại Tòa án nhân dân có thẩm quyền',
  'Chuyển đơn và toàn bộ hồ sơ đến UBND quận/huyện để giải quyết theo đúng thẩm quyền hành chính',
  'Yêu cầu đương sự bổ sung tài liệu chứng cứ chứng minh nội dung tố giác/khiếu nại trong thời hạn 10 ngày',
  'Lưu đơn do đơn trùng lặp, gửi nhiều nơi hoặc đã có quyết định giải quyết có hiệu lực pháp luật',
];

interface TabThongTinChungProps {
  currentDon?: DonDetail | null;
  onOpenLuotNhan?: () => void;
  onOpenSoDo?: () => void;
}

export default function TabThongTinChung({
  currentDon,
  onOpenLuotNhan,
  onOpenSoDo,
}: TabThongTinChungProps) {
  const isToGiac =
    currentDon?.code?.startsWith('Đ-2026') ||
    currentDon?.nguoiNop === 'Nguyễn Văn A' ||
    currentDon?.title?.includes('tố giác') ||
    currentDon?.title?.includes('lừa đảo');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Dữ liệu danh sách đương sự đa dạng nhiều người và nhiều vai trò từ Lượt nhận & AI đọc từ file ra
  const initialDuongSuList: DuongSuItem[] = isToGiac
    ? [
      {
        id: 'ds-1',
        hoTen: 'Nguyễn Văn A',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'nguoi_nop',
        vaiTro: 'Người làm đơn (Đương sự chính)',
        vaiTroColor: 'blue',
        isPrimary: true,
        dinhDanh: '001088019482',
        dinhDanhLabel: 'CCCD',
        xacThucBadge: 'VNeID Mức 2',
        xacThucColor: 'emerald',
        tuCach: 'Người làm đơn tố giác / Bị hại',
        sdt: '0912 345 678',
        email: 'nguyen.vana@gmail.com',
        diaChi: 'Số 12, ngõ 45, P. Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        ngaySinh: '15/06/1988',
        quanHeLienDoi: 'Ký HĐ góp vốn số 88/2024/HĐGV, thiệt hại 3,5 tỷ VNĐ.',
        nguonTrichXuat: 'Trang 1, dòng 8 - Đơn tố giác.pdf',
        doTinCai: '98%',
      },
      {
        id: 'ds-2',
        hoTen: 'Trần Thị C',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'nguoi_nop',
        vaiTro: 'Đồng đứng đơn (Đồng người tố giác)',
        vaiTroColor: 'indigo',
        dinhDanh: '001190028391',
        dinhDanhLabel: 'CCCD',
        xacThucBadge: 'VNeID Mức 2',
        xacThucColor: 'emerald',
        tuCach: 'Đồng bị hại / Vợ đồng sở hữu tài sản',
        sdt: '0978 654 321',
        email: 'tranthic.hn@gmail.com',
        diaChi: 'Số 12, ngõ 45, P. Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
        ngaySinh: '22/09/1990',
        quanHeLienDoi: 'Đồng chuyển khoản đợt 2 & 3 qua tài khoản ngân hàng.',
        nguonTrichXuat: 'Trang 1, dòng 18 - Đơn tố giác.pdf',
        doTinCai: '95%',
      },
      {
        id: 'ds-3',
        hoTen: 'LS. Lê Quang Đ',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'nguoi_nop',
        vaiTro: 'Người đại diện theo ủy quyền (Luật sư)',
        vaiTroColor: 'purple',
        dinhDanh: 'LS-0928/ĐLS-HN',
        dinhDanhLabel: 'Thẻ LS',
        xacThucBadge: 'Đoàn Luật sư HN',
        xacThucColor: 'blue',
        tuCach: 'Người bảo vệ quyền và lợi ích hợp pháp',
        sdt: '0903 888 999',
        email: 'luatsu.lequangd@anhduonglaw.vn',
        diaChi: 'Văn phòng Luật sư Ánh Dương, Hoàn Kiếm, Hà Nội',
        chucVu: 'Luật sư Trưởng văn phòng',
        donVi: 'Văn phòng Luật sư Ánh Dương & Cộng sự',
        giayToKemTheo: 'Văn bản ủy quyền số 12/2026/UQ',
        quanHeLienDoi: 'Đại diện nộp hồ sơ chứng cứ, tham gia làm việc với CQĐT.',
        nguonTrichXuat: 'Trang 3 - Giấy ủy quyền số 12/2026/UQ',
        doTinCai: '96%',
      },
      {
        id: 'ds-4',
        hoTen: 'Công ty Cổ phần Đầu tư & Phát triển Đô thị X',
        loaiDoiTuong: 'to_chuc',
        phanNhom: 'ben_bi_to_giac',
        vaiTro: 'Tổ chức bị tố giác chính',
        vaiTroColor: 'rose',
        dinhDanh: '0108293847',
        dinhDanhLabel: 'MST',
        xacThucBadge: 'Đang hoạt động',
        xacThucColor: 'blue',
        tuCach: 'Pháp nhân huy động vốn trái quy định pháp luật',
        sdt: '024 3829 5678',
        email: 'contact@dothix.com.vn',
        diaChi: 'Tầng 12, Landmark Tower, Nam Từ Liêm, Hà Nội',
        quanHeLienDoi: 'Bên phát hành HĐ góp vốn số 88/2024/HĐGV tại Dự án KĐT Y.',
        nguonTrichXuat: 'Hợp đồng góp vốn.pdf & Trang 1',
        doTinCai: '99%',
      },
      {
        id: 'ds-5',
        hoTen: 'Ông Trần Văn B',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'ben_bi_to_giac',
        vaiTro: 'Đối tượng bị tố giác trực tiếp',
        vaiTroColor: 'rose',
        dinhDanh: '001075003829',
        dinhDanhLabel: 'CCCD',
        xacThucBadge: 'Đại diện theo PL',
        xacThucColor: 'amber',
        tuCach: 'Cá nhân chủ mưu, người ký hợp đồng',
        sdt: '0988 234 567',
        diaChi: 'Biệt thự BT05, KĐT M, P. Mộ Lao, Q. Hà Đông, Hà Nội',
        ngaySinh: '10/04/1975',
        chucVu: 'Chủ tịch HĐQT kiêm TGĐ',
        donVi: 'Công ty Cổ phần Đầu tư & Phát triển Đô thị X',
        quanHeLienDoi: 'Trực tiếp ký cam kết bàn giao đất ảo, chỉ đạo tẩu tán tiền.',
        nguonTrichXuat: 'Trang 2, dòng 5 - Đơn tố giác.pdf',
        doTinCai: '97%',
      },
      {
        id: 'ds-6',
        hoTen: 'Bà Vũ Mai H',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'lien_quan',
        vaiTro: 'Người có quyền lợi & nghĩa vụ liên quan',
        vaiTroColor: 'amber',
        dinhDanh: '001183002910',
        dinhDanhLabel: 'CCCD',
        xacThucBadge: 'Kế toán trưởng',
        xacThucColor: 'slate',
        tuCach: 'Kế toán trưởng / Thực hiện thu và điều chuyển tiền',
        sdt: '0915 234 567',
        diaChi: 'Căn 1402, Chung cư CT2, Trung Hòa, Cầu Giấy, Hà Nội',
        ngaySinh: '05/11/1983',
        chucVu: 'Kế toán trưởng kiêm Thủ quỹ',
        donVi: 'Công ty Cổ phần Đầu tư & Phát triển Đô thị X',
        quanHeLienDoi: 'Trực tiếp ký phiếu thu 3,5 tỷ VNĐ và lệnh ủy nhiệm chi.',
        nguonTrichXuat: 'Phiếu thu số 45 & Trang 2 HĐGV',
        doTinCai: '92%',
      },
    ]
    : [
      {
        id: 'ds-kn-1',
        hoTen: currentDon?.nguoiNop || 'Lê Văn Hùng',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'nguoi_nop',
        vaiTro: 'Người khiếu nại (Đương sự chính)',
        vaiTroColor: 'blue',
        isPrimary: true,
        dinhDanh: '081089002891',
        dinhDanhLabel: 'CCCD',
        xacThucBadge: 'VNeID Mức 2',
        xacThucColor: 'emerald',
        tuCach: 'Chủ sở hữu Thửa đất số 45 / Người đứng đơn',
        sdt: '0983 847 291',
        email: 'hung.levan@gmail.com',
        diaChi: '142/8 Nguyễn Văn Cừ, Phường An Khánh, Q. Ninh Kiều, TP. Cần Thơ',
        ngaySinh: '12/03/1979',
        quanHeLienDoi: 'Đứng tên Giấy chứng nhận QSDĐ Thửa đất số 45 bị giải tỏa.',
        nguonTrichXuat: 'Trang 1, dòng 5 - Đơn khiếu nại.pdf',
        doTinCai: '98%',
      },
      {
        id: 'ds-kn-2',
        hoTen: 'Bà Nguyễn Thị Mai',
        loaiDoiTuong: 'ca_nhan',
        phanNhom: 'nguoi_nop',
        vaiTro: 'Đồng đứng đơn khiếu nại',
        vaiTroColor: 'indigo',
        dinhDanh: '081182003921',
        dinhDanhLabel: 'CCCD',
        xacThucBadge: 'VNeID Mức 2',
        xacThucColor: 'emerald',
        tuCach: 'Vợ đồng sở hữu quyền sử dụng đất',
        sdt: '0918 374 829',
        diaChi: '142/8 Nguyễn Văn Cừ, Phường An Khánh, Q. Ninh Kiều, TP. Cần Thơ',
        ngaySinh: '18/08/1982',
        quanHeLienDoi: 'Cùng sinh sống và đứng tên tài sản nhà ở trên đất bị thu hồi.',
        nguonTrichXuat: 'Trang 1, dòng 14 - Đơn khiếu nại.pdf',
        doTinCai: '94%',
      },
      {
        id: 'ds-kn-3',
        hoTen: 'Hội đồng Bồi thường, hỗ trợ & TĐC Dự án QL1A',
        loaiDoiTuong: 'to_chuc',
        phanNhom: 'ben_bi_to_giac',
        vaiTro: 'Bên bị khiếu nại (Cơ quan ban hành)',
        vaiTroColor: 'rose',
        dinhDanh: 'QĐ-1422/QĐ-UBND',
        dinhDanhLabel: 'Quyết định',
        xacThucBadge: 'Cơ quan Nhà nước',
        xacThucColor: 'blue',
        tuCach: 'Cơ quan lập phương án và áp giá bồi thường',
        sdt: '0292 383 1122',
        diaChi: 'Số 02 Hòa Bình, Phường Tân An, Q. Ninh Kiều, TP. Cần Thơ',
        donVi: 'UBND thành phố Cần Thơ',
        quanHeLienDoi: 'Cơ quan phê duyệt phương án bồi thường 18,5 triệu/m².',
        nguonTrichXuat: 'QĐ 1422/QĐ-UBND đính kèm',
        doTinCai: '99%',
      },
      {
        id: 'ds-kn-4',
        hoTen: 'Ban QLDA Đầu tư Xây dựng Công trình Giao thông',
        loaiDoiTuong: 'to_chuc',
        phanNhom: 'lien_quan',
        vaiTro: 'Đơn vị có quyền lợi, nghĩa vụ liên quan',
        vaiTroColor: 'amber',
        dinhDanh: '0101928374',
        dinhDanhLabel: 'Mã số',
        xacThucBadge: 'Chủ đầu tư',
        xacThucColor: 'slate',
        tuCach: 'Chủ đầu tư tiếp nhận mặt bằng thi công',
        sdt: '0292 376 4321',
        diaChi: 'Đường 30/4, P. Hưng Lợi, Q. Ninh Kiều, TP. Cần Thơ',
        quanHeLienDoi: 'Đơn vị chi trả kinh phí giải phóng mặt bằng và thi công.',
        nguonTrichXuat: 'Phương án GPMB & QĐ phê duyệt',
        doTinCai: '95%',
      },
    ];

  const [duongSuList, setDuongSuList] = useState<DuongSuItem[]>(initialDuongSuList);
  const [filterTab, setFilterTab] = useState<'all' | 'nguoi_nop' | 'ben_bi_to_giac' | 'lien_quan'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Phân loại đơn gợi ý từ AI & Chức năng cán bộ điều chỉnh
  const aiOriginalPhanLoai: PhanLoaiDonState = isToGiac
    ? {
      loaiDon: 'Đơn tố giác về tội phạm',
      linhVuc: 'Hình sự - Kinh tế & Trật tự xã hội (Lừa đảo chiếm đoạt tài sản)',
      canCuPhapLy:
        'Điều 144, 145 Bộ luật Tố tụng hình sự 2015; Điều 174 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017); Thông tư liên tịch 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC',
      thamQuyen:
        'Thuộc thẩm quyền giải quyết của Cơ quan Cảnh sát điều tra (PC03 / Đội Điều tra tổng hợp) - Công an TP Hà Nội',
      huongXuLy:
        'Phân công Điều tra viên thụ lý nguồn tin tội phạm, xác minh dòng tiền giao dịch ngân hàng và tiến hành triệu tập đối tượng liên quan để ghi lời khai',
      doTinCaiAi: '96.8%',
      nguonTrichXuatAi:
        'Bóc tách từ tiêu đề đơn, nội dung tố giác hành vi lừa dối nhận góp vốn đầu tư 3.500.000.000 VNĐ & tài liệu thỏa thuận hợp tác đính kèm',
      isModifiedByUser: false,
    }
    : {
      loaiDon: 'Đơn khiếu nại (Lần 1)',
      linhVuc: 'Đất đai - Bồi thường, hỗ trợ, tái định cư khi thu hồi đất',
      canCuPhapLy:
        'Luật Khiếu nại 2011; Điều 74, 75, 83 Luật Đất đai 2024; Nghị định số 47/2014/NĐ-CP của Chính phủ về bồi thường, hỗ trợ, tái định cư',
      thamQuyen:
        'Thuộc thẩm quyền giải quyết của Chủ tịch UBND quận/huyện & Phòng Tài nguyên và Môi trường',
      huongXuLy:
        'Thụ lý giải quyết khiếu nại lần 1, thành lập tổ xác minh thực địa và tổ chức đối thoại trực tiếp với công dân theo luật định',
      doTinCaiAi: '95.2%',
      nguonTrichXuatAi:
        'Bóc tách từ Thông báo thu hồi đất số 45/TB-UBND, Quyết định phê duyệt phương án bồi thường và Giấy chứng nhận QSDĐ Thửa đất số 45',
      isModifiedByUser: false,
    };

  const [phanLoai, setPhanLoai] = useState<PhanLoaiDonState>(aiOriginalPhanLoai);
  const [isEditingPhanLoai, setIsEditingPhanLoai] = useState(false);
  const [editPhanLoaiForm, setEditPhanLoaiForm] = useState<PhanLoaiDonState>(aiOriginalPhanLoai);
  const [isCustomLinhVuc, setIsCustomLinhVuc] = useState(false);

  const handleStartEditPhanLoai = () => {
    setEditPhanLoaiForm({ ...phanLoai });
    setIsCustomLinhVuc(!LINH_VUC_SUGGESTIONS.includes(phanLoai.linhVuc));
    setIsEditingPhanLoai(true);
  };

  const handleCancelEditPhanLoai = () => {
    setEditPhanLoaiForm({ ...phanLoai });
    setIsEditingPhanLoai(false);
  };

  const handleRestoreAiPhanLoai = () => {
    setEditPhanLoaiForm({ ...aiOriginalPhanLoai });
    setIsCustomLinhVuc(false);
    showToast('✓ Đã khôi phục các thông số phân loại theo gợi ý ban đầu của AI.');
  };

  const handleSelectLoaiDon = (newLoaiDon: string) => {
    const matched = matchWorkflowByLoaiDon(newLoaiDon);
    let suggestedCanCu = editPhanLoaiForm.canCuPhapLy;
    let suggestedThamQuyen = editPhanLoaiForm.thamQuyen;
    let suggestedHuongXuLy = editPhanLoaiForm.huongXuLy;
    let suggestedLinhVuc = editPhanLoaiForm.linhVuc;

    if (matched.id === 'to-giac') {
      suggestedCanCu =
        'Điều 144, 145 Bộ luật Tố tụng hình sự 2015; Điều 174 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017); Thông tư liên tịch 01/2017/TTLT-BCA-BQP-BTC-BNN&PTNT-VKSNDTC';
      suggestedThamQuyen =
        'Thuộc thẩm quyền giải quyết của Cơ quan Cảnh sát điều tra (PC03 / Đội Điều tra tổng hợp) - Công an TP Hà Nội';
      suggestedHuongXuLy =
        'Phân công Điều tra viên thụ lý nguồn tin tội phạm, xác minh dòng tiền giao dịch ngân hàng và tiến hành triệu tập đối tượng liên quan để ghi lời khai';
      suggestedLinhVuc = 'Hình sự - Kinh tế & Trật tự xã hội (Lừa đảo chiếm đoạt tài sản)';
    } else if (matched.id === 'khieu-nai') {
      suggestedCanCu =
        'Luật Khiếu nại 2011; Điều 74, 75, 83 Luật Đất đai 2024; Nghị định số 47/2014/NĐ-CP của Chính phủ về bồi thường, hỗ trợ, tái định cư';
      suggestedThamQuyen =
        'Thuộc thẩm quyền giải quyết của Chủ tịch UBND quận/huyện & Phòng Tài nguyên và Môi trường';
      suggestedHuongXuLy =
        'Thụ lý giải quyết khiếu nại lần 1, thành lập tổ xác minh thực địa và tổ chức đối thoại trực tiếp với công dân theo luật định';
      suggestedLinhVuc = 'Đất đai - Bồi thường, hỗ trợ, tái định cư khi thu hồi đất';
    } else if (matched.id === 'to-cao') {
      suggestedCanCu =
        'Luật Tố cáo 2018; Nghị định 31/2019/NĐ-CP hướng dẫn thi hành Luật Tố cáo; Thông tư số 05/2021/TT-TTCP';
      suggestedThamQuyen =
        'Người đứng đầu cơ quan, tổ chức có thẩm quyền quản lý cán bộ, công chức bị tố cáo';
      suggestedHuongXuLy =
        'Thụ lý xác minh tố cáo hành vi vi phạm pháp luật trong thực thi công vụ, lập đoàn thanh tra/xác minh nội dung tố cáo';
      suggestedLinhVuc = 'Hành chính - Quản lý trật tự đô thị, cấp phép xây dựng';
    } else if (matched.id === 'kien-nghi') {
      suggestedCanCu =
        'Luật Tiếp công dân 2013; Thông tư 05/2021/TT-TTCP quy định quy trình xử lý đơn khiếu nại, đơn tố cáo, đơn kiến nghị, phản ánh';
      suggestedThamQuyen =
        'Cơ quan hành chính nhà nước, đơn vị chuyên môn phụ trách lĩnh vực được phản ánh';
      suggestedHuongXuLy =
        'Tiếp nhận, phân loại và chuyển văn bản phản ánh, kiến nghị đến cơ quan có thẩm quyền trực tiếp giải quyết và trả lời công dân';
      suggestedLinhVuc = 'Hành chính - Quản lý trật tự đô thị, cấp phép xây dựng';
    }

    setEditPhanLoaiForm((prev) => ({
      ...prev,
      loaiDon: newLoaiDon,
      linhVuc: suggestedLinhVuc,
      canCuPhapLy: suggestedCanCu,
      thamQuyen: suggestedThamQuyen,
      huongXuLy: suggestedHuongXuLy,
    }));
  };

  const handleSavePhanLoai = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const hasChanged =
      editPhanLoaiForm.loaiDon !== aiOriginalPhanLoai.loaiDon ||
      editPhanLoaiForm.linhVuc !== aiOriginalPhanLoai.linhVuc ||
      editPhanLoaiForm.canCuPhapLy !== aiOriginalPhanLoai.canCuPhapLy ||
      editPhanLoaiForm.thamQuyen !== aiOriginalPhanLoai.thamQuyen ||
      editPhanLoaiForm.huongXuLy !== aiOriginalPhanLoai.huongXuLy;

    const updated: PhanLoaiDonState = {
      ...editPhanLoaiForm,
      isModifiedByUser: hasChanged,
      ngayCapNhat: timeStr,
      nguoiCapNhat: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
    };

    setPhanLoai(updated);
    setIsEditingPhanLoai(false);
    showToast('✓ Đã cập nhật và lưu kết quả phân loại đơn thành công!');
  };

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DuongSuItem | null>(null);

  // Form state inside modal
  const [formData, setFormData] = useState<Partial<DuongSuItem>>({
    hoTen: '',
    loaiDoiTuong: 'ca_nhan',
    phanNhom: 'nguoi_nop',
    vaiTro: 'Đồng đứng đơn (Đồng người tố giác)',
    vaiTroColor: 'indigo',
    dinhDanh: '',
    dinhDanhLabel: 'CCCD',
    xacThucBadge: 'VNeID Mức 2',
    xacThucColor: 'emerald',
    tuCach: '',
    sdt: '',
    email: '',
    diaChi: '',
    chucVu: '',
    donVi: '',
    quanHeLienDoi: '',
    nguonTrichXuat: 'Bóc tách bổ sung từ tài liệu đính kèm',
    doTinCai: '95%',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      hoTen: '',
      loaiDoiTuong: 'ca_nhan',
      phanNhom: 'nguoi_nop',
      vaiTro: 'Đồng đứng đơn (Đồng khiếu nại / Tố giác)',
      vaiTroColor: 'indigo',
      dinhDanh: '',
      dinhDanhLabel: 'CCCD',
      xacThucBadge: 'VNeID Mức 2',
      xacThucColor: 'emerald',
      tuCach: 'Người cùng quyền lợi / Đồng đứng đơn',
      sdt: '',
      email: '',
      diaChi: '',
      chucVu: '',
      donVi: '',
      quanHeLienDoi: '',
      nguonTrichXuat: 'Bóc tách từ file tài liệu bổ sung',
      doTinCai: '95%',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: DuongSuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đương sự "${name}" khỏi danh sách vụ việc?`)) {
      setDuongSuList((prev) => prev.filter((d) => d.id !== id));
      showToast(`✓ Đã xóa "${name}" khỏi danh sách đương sự.`);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen?.trim()) {
      alert('Vui lòng nhập Họ tên cá nhân hoặc Tên tổ chức!');
      return;
    }

    if (editingItem) {
      // Cập nhật
      setDuongSuList((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? ({ ...item, ...formData } as DuongSuItem) : item
        )
      );
      showToast(`✓ Đã cập nhật thông tin đương sự "${formData.hoTen}" thành công!`);
    } else {
      // Thêm mới
      const newItem: DuongSuItem = {
        id: `ds-${Date.now()}`,
        hoTen: formData.hoTen || '',
        loaiDoiTuong: formData.loaiDoiTuong || 'ca_nhan',
        phanNhom: formData.phanNhom || 'nguoi_nop',
        vaiTro: formData.vaiTro || 'Đồng đứng đơn',
        vaiTroColor: formData.vaiTroColor || 'indigo',
        dinhDanh: formData.dinhDanh || '',
        dinhDanhLabel: formData.dinhDanhLabel || 'CCCD',
        xacThucBadge: formData.xacThucBadge || 'Chưa xác thực',
        xacThucColor: formData.xacThucColor || 'slate',
        tuCach: formData.tuCach || 'Người tham gia liên quan',
        sdt: formData.sdt || '',
        email: formData.email || '',
        diaChi: formData.diaChi || '',
        chucVu: formData.chucVu || '',
        donVi: formData.donVi || '',
        quanHeLienDoi: formData.quanHeLienDoi || '',
        nguonTrichXuat: formData.nguonTrichXuat || 'Bóc tách từ file tài liệu bổ sung',
        doTinCai: formData.doTinCai || '95%',
      };
      setDuongSuList((prev) => [...prev, newItem]);
      showToast(`✓ Đã thêm "${newItem.hoTen}" vào danh sách đương sự.`);
    }
    setShowModal(false);
  };

  const filteredList = duongSuList.filter((item) => {
    const matchTab = filterTab === 'all' || item.phanNhom === filterTab;
    const matchSearch =
      !searchKeyword.trim() ||
      item.hoTen.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.vaiTro.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.dinhDanh.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.diaChi.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchTab && matchSearch;
  });

  const countNguoiNop = duongSuList.filter((d) => d.phanNhom === 'nguoi_nop').length;
  const countBiToGiac = duongSuList.filter((d) => d.phanNhom === 'ben_bi_to_giac').length;
  const countLienQuan = duongSuList.filter((d) => d.phanNhom === 'lien_quan').length;

  // Dữ liệu tiếp nhận hồ sơ & thông tin nghiệp vụ
  const info = isToGiac
    ? {
      luotNhanGoc: currentDon?.luotNhanId || 'LN-2025-0819',
      ngayNhan: currentDon?.ngayNhan || '16/09/2026 09:15',
      hinhThuc: 'Trực tiếp tại bộ phận Một cửa',
      canBo: 'Nguyễn Minh Anh',
      chucVu: 'Cán bộ thụ lý',
      donViTiepNhan:
        'Cơ quan Cảnh sát điều tra (Công an thành phố Hà Nội) - Bộ phận Tiếp dân & Xử lý đơn',
      tomTatYeuCau: (
        <>
          Người làm đơn đề nghị Cơ quan Cảnh sát điều tra thụ lý xác minh hành vi lừa đảo chiếm đoạt tài sản của{' '}
          <strong>ông Trần Văn B và Công ty Cổ phần X</strong>; cụ thể đề nghị thu hồi và hoàn trả số tiền góp vốn đầu tư{' '}
          <strong className="text-[#004ac6] font-bold">3.500.000.000 VNĐ</strong> và áp dụng biện pháp khẩn cấp phong tỏa tài khoản ngân hàng của Công ty X nhằm ngăn chặn tẩu tán tài sản.
        </>
      ),
      thamQuyen: 'Thuộc thẩm quyền giải quyết của Cơ quan Cảnh sát điều tra (PC03 / Đội Điều tra tổng hợp)',
      huongXuLy: 'Phân công Điều tra viên thụ lý nguồn tin tội phạm, xác minh dòng tiền và tiến hành triệu tập đối tượng liên quan',
    }
    : {
      luotNhanGoc: currentDon?.luotNhanId || 'LN-45/2026-GOVEX',
      ngayNhan: currentDon?.ngayNhan || '15/09/2026 09:15',
      hinhThuc: 'Trực tiếp tại bộ phận Một cửa',
      canBo: 'Nguyễn Minh Anh',
      chucVu: 'Cán bộ thụ lý',
      donViTiepNhan:
        'Công ty Cổ phần Công nghệ GOVEX (Chi nhánh Tiếp công dân Cần Thơ / Bộ phận Một cửa của Sở)',
      tomTatYeuCau: (
        <>
          Người nộp đơn đề nghị cơ quan có thẩm quyền xem xét lại đơn giá bồi thường đất nông nghiệp và đất ở tại{' '}
          <strong>Thửa đất số 45, Tờ bản đồ số 12</strong>; cụ thể đề nghị nâng mức giá bồi thường đất từ{' '}
          <strong className="text-[#004ac6] font-bold">18.500.000đ/m²</strong> lên{' '}
          <strong className="text-emerald-600 font-bold">28.000.000đ/m²</strong> và bố trí 01 nền tái định cư tại chỗ cho gia đình theo đúng quy định hiện hành.
        </>
      ),
      thamQuyen: 'Thuộc thẩm quyền giải quyết của Chủ tịch UBND / Sở Tài nguyên & Môi trường',
      huongXuLy: 'Thụ lý giải quyết khiếu nại, xác minh thực địa và tổ chức đối thoại trực tiếp',
    };

  const getRoleBadgeClasses = (color: DuongSuItem['vaiTroColor']) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-[#004ac6] border-blue-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRoleIcon = (item: DuongSuItem) => {
    if (item.loaiDoiTuong === 'to_chuc') return 'domain';
    if (item.vaiTro.includes('Luật sư') || item.vaiTro.includes('ủy quyền')) return 'balance';
    if (item.phanNhom === 'ben_bi_to_giac') return 'gavel';
    if (item.phanNhom === 'lien_quan') return 'group';
    return 'person';
  };

  const getAvatarBg = (item: DuongSuItem) => {
    if (item.loaiDoiTuong === 'to_chuc') return 'bg-rose-100 text-rose-700';
    if (item.vaiTroColor === 'blue') return 'bg-blue-100 text-[#004ac6]';
    if (item.vaiTroColor === 'indigo') return 'bg-indigo-100 text-indigo-700';
    if (item.vaiTroColor === 'purple') return 'bg-purple-100 text-purple-700';
    if (item.vaiTroColor === 'rose') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-2xl text-xs font-semibold border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHỐI 1: THÔNG TIN TIẾP NHẬN & DANH SÁCH ĐƯƠNG SỰ                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Khối 1 */}
        <div className="px-6 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-white flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
            <h2 className="text-[13px] font-bold text-slate-900 tracking-tight font-headline-md uppercase">
              1. THÔNG TIN TIẾP NHẬN &amp; NGƯỜI NỘP / CÁC ĐƯƠNG SỰ
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#004ac6] text-[11px] font-bold border border-blue-200 font-label-technical ml-1">
              {duongSuList.length} người &amp; đối tượng
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold font-label-technical">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
              Đã xác thực định danh điện tử
            </span>
            <span className="text-[11.5px] text-slate-500 font-medium hidden sm:inline">
              Bộ phận Tiếp dân &amp; Xử lý đơn
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* A. DỮ LIỆU TIẾP NHẬN HỒ SƠ */}
          <div>
            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              A. DỮ LIỆU TIẾP NHẬN HỒ SƠ
            </h3>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Cột 1: Mã lượt nhận gốc */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Mã lượt nhận gốc</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#004ac6] font-label-technical text-[13px]">
                    {info.luotNhanGoc}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenLuotNhan}
                    className="inline-flex items-center gap-0.5 text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                    <span>Xem lượt nhận</span>
                  </button>
                </div>
              </div>

              {/* Cột 2: Ngày giờ tiếp nhận */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Ngày giờ tiếp nhận</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[12.5px]">
                  <span className="material-symbols-outlined text-[15px] text-slate-500">calendar_month</span>
                  <span>{info.ngayNhan}</span>
                </div>
              </div>

              {/* Cột 3: Hình thức nhận */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Hình thức nhận</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-[12.5px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{info.hinhThuc}</span>
                </div>
              </div>

              {/* Cột 4: Cán bộ tiếp nhận */}
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Cán bộ tiếp nhận</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-[12.5px]">{info.canBo}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-semibold">
                    {info.chucVu}
                  </span>
                </div>
              </div>

              {/* Đơn vị tiếp nhận */}
              <div className="md:col-span-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Đơn vị tiếp nhận:</span>
                <span className="font-semibold text-slate-800 text-[12px]">
                  {info.donViTiepNhan}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* B. DANH SÁCH ĐƯƠNG SỰ DẠNG LIST (KẾ THỪA TỪ LƯỢT NHẬN & AI BÓC TÁCH FILE) */}
          {/* =================================================================== */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-[12px] font-bold text-slate-700 uppercase tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]"></span>
                  B. DANH SÁCH ĐƯƠNG SỰ TRONG VỤ VIỆC
                </h3>
                <span className="text-[11px] font-medium text-slate-500">
                  (Từ Lượt nhận &amp; AI đọc từ file văn bản)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenSoDo && (
                  <button
                    type="button"
                    onClick={onOpenSoDo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004ac6] border border-blue-200 transition-colors cursor-pointer"
                    title="Mở Sơ đồ mối quan hệ giữa các đương sự"
                  >
                    <span className="material-symbols-outlined text-[15px]">hub</span>
                    <span>Sơ đồ liên hệ</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  <span>+ Thêm người / Đương sự</span>
                </button>
              </div>
            </div>
            {/* Thanh Phân loại Filter & Tìm kiếm nhanh */}
            <div className="p-2 mb-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-1 flex-wrap w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterTab === 'all'
                    ? 'bg-white text-[#004ac6] shadow-xs border border-blue-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                >
                  Tất cả ({duongSuList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('nguoi_nop')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterTab === 'nguoi_nop'
                    ? 'bg-white text-[#004ac6] shadow-xs border border-blue-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                >
                  Người nộp &amp; Đứng đơn ({countNguoiNop})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('ben_bi_to_giac')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterTab === 'ben_bi_to_giac'
                    ? 'bg-white text-rose-700 shadow-xs border border-rose-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                >
                  Phía Bị tố giác / Khiếu nại ({countBiToGiac})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('lien_quan')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filterTab === 'lien_quan'
                    ? 'bg-white text-amber-800 shadow-xs border border-amber-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                >
                  Người liên quan ({countLienQuan})
                </button>
              </div>

              <div className="relative w-full md:w-60">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm tên, CCCD, vai trò..."
                  className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>

            {/* BẢNG DANH SÁCH ĐƯƠNG SỰ DẠNG LIST */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Họ tên / Tổ chức</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Vai trò trong vụ việc</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Số định danh</th>
                      <th className="py-2.5 px-3 min-w-[190px]">Tư cách tố tụng &amp; Quan hệ</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Thông tin liên hệ &amp; Địa chỉ</th>
                      <th className="py-2.5 px-3 min-w-[170px]">Nguồn đọc từ file (AI)</th>
                      <th className="py-2.5 px-3 text-center w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredList.map((item, idx) => {
                      const roleBadgeClass = getRoleBadgeClasses(item.vaiTroColor);
                      const avatarBg = getAvatarBg(item);
                      const roleIcon = getRoleIcon(item);

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-blue-50/40 transition-colors ${item.isPrimary ? 'bg-blue-50/15' : ''
                            }`}
                        >
                          {/* 1. STT */}
                          <td className="py-3 px-3 text-center font-bold text-slate-400 font-label-technical">
                            {idx + 1}
                          </td>

                          {/* 2. Họ tên & Phân loại */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center shrink-0 shadow-2xs`}
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  {roleIcon}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-[12.5px] leading-tight">
                                  {item.hoTen}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {item.xacThucBadge && (
                                    <span
                                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-semibold border ${item.xacThucColor === 'emerald'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : item.xacThucColor === 'amber'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}
                                    >
                                      <span className="material-symbols-outlined text-[11px]">
                                        {item.xacThucColor === 'emerald' ? 'verified' : 'badge'}
                                      </span>
                                      {item.xacThucBadge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-label-technical">
                                    {item.loaiDoiTuong === 'to_chuc' ? 'Tổ chức' : 'Cá nhân'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Vai trò */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${roleBadgeClass}`}
                            >
                              {item.vaiTro}
                            </span>
                            {item.chucVu && (
                              <div className="text-[10.5px] text-slate-500 mt-0.5">
                                {item.chucVu}
                              </div>
                            )}
                          </td>

                          {/* 4. Số định danh */}
                          <td className="py-3 px-3">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {item.dinhDanhLabel}:
                            </span>
                            <span className="font-semibold text-slate-800 font-label-technical text-[11.5px]">
                              {item.dinhDanh || '—'}
                            </span>
                          </td>

                          {/* 5. Tư cách tố tụng & Quan hệ vụ việc */}
                          <td className="py-3 px-3 text-[11px]">
                            <div className="font-semibold text-slate-800 leading-tight">
                              {item.tuCach}
                            </div>
                            {item.quanHeLienDoi && (
                              <div className="text-[10.5px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                                {item.quanHeLienDoi}
                              </div>
                            )}
                          </td>

                          {/* 6. Liên hệ & Địa chỉ */}
                          <td className="py-3 px-3 text-[11px]">
                            {item.sdt && (
                              <div className="flex items-center gap-1 font-semibold text-slate-800 font-label-technical">
                                <span className="material-symbols-outlined text-[12px] text-slate-400">call</span>
                                <span>{item.sdt}</span>
                              </div>
                            )}
                            <div className="text-[10.5px] text-slate-500 truncate max-w-[220px]" title={item.diaChi}>
                              {item.diaChi}
                            </div>
                          </td>

                          {/* 7. Nguồn AI bóc tách từ file */}
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100/90 text-slate-700 border border-slate-200 text-[10.5px]">
                              <span className="material-symbols-outlined text-[12px] text-blue-600">
                                description
                              </span>
                              <span className="truncate max-w-[140px]" title={item.nguonTrichXuat}>
                                {item.nguonTrichXuat || 'Đơn_to_giac.pdf'}
                              </span>
                              {item.doTinCai && (
                                <span className="font-bold text-emerald-700 font-label-technical pl-0.5">
                                  {item.doTinCai}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 8. Thao tác */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 rounded-md text-slate-500 hover:text-[#004ac6] hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin đương sự"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              {onOpenSoDo && (
                                <button
                                  type="button"
                                  onClick={onOpenSoDo}
                                  className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                  title="Xem trên Sơ đồ"
                                >
                                  <span className="material-symbols-outlined text-[16px]">hub</span>
                                </button>
                              )}
                              {!item.isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id, item.hoTen)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Xóa đương sự"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredList.length === 0 && (
                <div className="text-center py-8 bg-slate-50/50">
                  <span className="material-symbols-outlined text-[32px] text-slate-300 mb-1 block">
                    group_off
                  </span>
                  <p className="text-xs font-semibold text-slate-600">
                    Không tìm thấy đương sự nào phù hợp với bộ lọc hiện tại.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTab('all');
                      setSearchKeyword('');
                    }}
                    className="mt-1.5 text-xs font-bold text-[#004ac6] hover:underline"
                  >
                    Xem tất cả danh sách
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KHỐI 2: THÔNG TIN ĐƠN & PHÂN LOẠI NGHIỆP VỤ                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Header Khối 2 */}
        <div className="px-6 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-white flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#004ac6]"></span>
            <h2 className="text-[13px] font-bold text-slate-900 tracking-tight font-headline-md uppercase">
              2. THÔNG TIN ĐƠN &amp; PHÂN LOẠI NGHIỆP VỤ
            </h2>

          </div>

          <div className="flex items-center gap-2">
            {!isEditingPhanLoai ? (
              <button
                type="button"
                onClick={handleStartEditPhanLoai}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#004ac6] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 transition-colors cursor-pointer shadow-2xs"
                title="Chỉnh sửa hoặc chọn lại loại đơn, thẩm quyền, hướng xử lý do AI gợi ý"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Chỉnh sửa phân loại</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#004ac6] border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Chế độ chỉnh sửa phân loại
                </span>
                <button
                  type="button"
                  onClick={handleCancelEditPhanLoai}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NỘI DUNG KHỐI 2: CHẾ ĐỘ XEM (VIEW MODE) HOẶC CHỈNH SỬA (EDIT MODE)        */}
        {/* ========================================================================= */}
        {!isEditingPhanLoai ? (
          <div className="p-6 space-y-5">
            {/* Banner thông báo nếu cán bộ đã điều chỉnh */}
            {phanLoai.isModifiedByUser && (
              <div className="p-3.5 px-4 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
                <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">verified_user</span>
                <div className="space-y-1 flex-1">
                  <div className="font-bold flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <span>Phân loại nghiệp vụ đã được điều chỉnh bởi cán bộ</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">Đã lưu vết</span>
                    </span>
                    <span className="text-[11px] font-normal text-amber-700 font-label-technical">
                      {phanLoai.nguoiCapNhat} • {phanLoai.ngayCapNhat}
                    </span>
                  </div>
                  {phanLoai.ghiChuCuaCanBo && (
                    <p className="text-amber-800 text-[11.5px] italic bg-white/70 p-2 rounded-lg border border-amber-200/60">
                      "Ghi chú: {phanLoai.ghiChuCuaCanBo}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* HÀNG 1: BẢNG 3 THẺ PHÂN LOẠI CHÍNH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Thẻ 1: Loại đơn */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    PHÂN LOẠI ĐƠN
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-rose-600">gavel</span>
                </div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    {phanLoai.loaiDon}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Xác định tính chất vụ việc tố tụng / hành chính
                </p>
              </div>

              {/* Thẻ 2: Lĩnh vực nghiệp vụ */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    LĨNH VỰC CHUYÊN MÔN
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#004ac6]">category</span>
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">
                  {phanLoai.linhVuc}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Phân nhánh chuyên ban thụ lý giải quyết
                </p>
              </div>

              {/* Thẻ 3: AI Đánh giá & Cơ sở trích xuất */}
              <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200/70 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-tight flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-indigo-600">psychology</span>
                    CƠ SỞ AI GỢI Ý
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100 text-indigo-700 font-label-technical">
                    Độ tin cậy: {phanLoai.doTinCaiAi}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-700 leading-relaxed line-clamp-3">
                  {phanLoai.nguonTrichXuatAi}
                </p>
              </div>
            </div>

            {/* HÀNG 2: THẨM QUYỀN GIẢI QUYẾT & HƯỚNG XỬ LÝ ĐỀ XUẤT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thẩm quyền giải quyết */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#004ac6]">account_balance</span>
                    CƠ QUAN CÓ THẨM QUYỀN GIẢI QUYẾT
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-label-technical">
                    THẨM QUYỀN THỤ LÝ
                  </span>
                </div>
                <div className="text-xs text-slate-800 font-semibold leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60">
                  {phanLoai.thamQuyen}
                </div>
              </div>

              {/* Hướng xử lý đề xuất */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">alt_route</span>
                    HƯỚNG XỬ LÝ ĐỀ XUẤT TIẾP THEO
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider font-label-technical">
                    QUY TRÌNH DỰ KIẾN
                  </span>
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60">
                  {phanLoai.huongXuLy}
                </div>
              </div>
            </div>

            {/* HÀNG 3: CĂN CỨ PHÁP LÝ */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">menu_book</span>
                  CĂN CỨ PHÁP LÝ ÁP DỤNG
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-label-technical">
                  QUY PHẠM PHÁP LUẬT VIỆT NAM
                </span>
              </div>
              <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60">
                {phanLoai.canCuPhapLy}
              </div>
            </div>

            {/* HÀNG 4: TÓM TẮT YÊU CẦU CỦA ĐƯƠNG SỰ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#004ac6]">subject</span>
                  TÓM TẮT YÊU CẦU CỦA ĐƯƠNG SỰ
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-label-technical">
                  TRÍCH XUẤT TỪ NỘI DUNG ĐƠN
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-[12.5px] text-slate-800 leading-relaxed text-justify">
                {info.tomTatYeuCau}
              </div>
            </div>

          </div>
        ) : (
          /* FORM ĐIỀU CHỈNH PHÂN LOẠI NGHIỆP VỤ */
          <form onSubmit={handleSavePhanLoai} className="p-6 space-y-6 bg-slate-50/50">
            {/* Banner hướng dẫn */}
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-xs text-blue-900 shadow-2xs flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px] text-[#004ac6]">psychology</span>
                <span className="font-medium">
                  Cán bộ có thể điều chỉnh loại đơn, lĩnh vực, cơ quan thẩm quyền hoặc hướng xử lý. Mọi thay đổi sẽ được ghi nhận và lưu vết kiểm toán.
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
                Độ tin cậy AI: {editPhanLoaiForm.doTinCaiAi || '96.8%'}
              </span>
            </div>

            {/* KHỐI 1: LOẠI ĐƠN & LĨNH VỰC CHUYÊN MÔN (2 CỘT) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#004ac6]">category</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Phân loại tính chất đơn &amp; Lĩnh vực chuyên môn
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. LOẠI ĐƠN */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>1. Loại đơn</span>
                      <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <select
                    value={editPhanLoaiForm.loaiDon}
                    onChange={(e) => handleSelectLoaiDon(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all cursor-pointer"
                  >
                    {LOAI_DON_SUGGESTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  {/* Quick pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-[10.5px] text-slate-400 font-medium self-center">Chọn nhanh:</span>
                    {[
                      { label: 'Đơn tố giác về tội phạm', color: 'rose' },
                      { label: 'Đơn khiếu nại (Lần 1)', color: 'amber' },
                      { label: 'Đơn tố cáo', color: 'purple' },
                      { label: 'Đơn phản ánh, kiến nghị', color: 'blue' },
                    ].map((chip) => {
                      const isSelected = editPhanLoaiForm.loaiDon === chip.label;
                      const activeClasses =
                        chip.color === 'rose'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold shadow-2xs'
                          : chip.color === 'amber'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-2xs'
                            : chip.color === 'purple'
                              ? 'bg-purple-50 text-purple-700 border-purple-300 font-bold shadow-2xs'
                              : 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs';

                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleSelectLoaiDon(chip.label)}
                          className={`text-[10.5px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${isSelected
                            ? activeClasses
                            : 'bg-slate-50 hover:bg-white text-slate-600 border-slate-200'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${chip.color === 'rose'
                              ? 'bg-rose-500'
                              : chip.color === 'amber'
                                ? 'bg-amber-500'
                                : chip.color === 'purple'
                                  ? 'bg-purple-500'
                                  : 'bg-blue-500'
                              }`}
                          ></span>
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. LĨNH VỰC CHUYÊN MÔN (Single clean control) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>2. Lĩnh vực chuyên môn</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomLinhVuc(!isCustomLinhVuc)}
                      className="text-[11px] text-[#004ac6] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isCustomLinhVuc ? 'list' : 'edit'}
                      </span>
                      <span>{isCustomLinhVuc ? 'Chọn từ danh mục' : 'Tự nhập lĩnh vực'}</span>
                    </button>
                  </div>

                  {!isCustomLinhVuc ? (
                    <select
                      value={LINH_VUC_SUGGESTIONS.includes(editPhanLoaiForm.linhVuc) ? editPhanLoaiForm.linhVuc : 'custom'}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomLinhVuc(true);
                        } else {
                          setEditPhanLoaiForm({ ...editPhanLoaiForm, linhVuc: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all cursor-pointer"
                    >
                      {LINH_VUC_SUGGESTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      <option value="custom">-- Lĩnh vực chuyên môn khác (Tự nhập...) --</option>
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={editPhanLoaiForm.linhVuc}
                        onChange={(e) => setEditPhanLoaiForm({ ...editPhanLoaiForm, linhVuc: e.target.value })}
                        placeholder="Nhập lĩnh vực chuyên môn cụ thể..."
                        autoFocus
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-[#004ac6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Đang ở chế độ tự nhập lĩnh vực chuyên môn.
                      </span>
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-500 mt-2">
                    Xác định phân nhánh nghiệp vụ để chuyển giao đúng bộ phận chuyên môn.
                  </p>
                </div>
              </div>
            </div>

            {/* KHỐI 2: THẨM QUYỀN GIẢI QUYẾT & HƯỚNG XỬ LÝ (2 CỘT) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#004ac6]">account_balance</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Thẩm quyền giải quyết &amp; Hướng xử lý đề xuất
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 3. THẨM QUYỀN GIẢI QUYẾT */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>3. Cơ quan có thẩm quyền giải quyết</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10.5px] text-slate-400">Chọn mẫu:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setEditPhanLoaiForm({ ...editPhanLoaiForm, thamQuyen: e.target.value });
                          }
                        }}
                        className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer max-w-[140px] truncate"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Chọn mẫu --</option>
                        {THAM_QUYEN_SUGGESTIONS.map((item, idx) => (
                          <option key={idx} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={editPhanLoaiForm.thamQuyen}
                    onChange={(e) => setEditPhanLoaiForm({ ...editPhanLoaiForm, thamQuyen: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all leading-relaxed"
                    placeholder="Nhập chi tiết cơ quan, phòng ban có thẩm quyền giải quyết..."
                  />
                  <span className="text-[10.5px] text-slate-400 block mt-1">
                    Có thể chọn mẫu từ danh mục hoặc chỉnh sửa trực tiếp nội dung trên.
                  </span>
                </div>

                {/* 4. HƯỚNG XỬ LÝ ĐỀ XUẤT */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>4. Hướng xử lý đề xuất tiếp theo</span>
                      <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10.5px] text-slate-400">Chọn mẫu:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setEditPhanLoaiForm({ ...editPhanLoaiForm, huongXuLy: e.target.value });
                          }
                        }}
                        className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer max-w-[140px] truncate"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Chọn mẫu --</option>
                        {HUONG_XU_LY_SUGGESTIONS.map((item, idx) => (
                          <option key={idx} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={editPhanLoaiForm.huongXuLy}
                    onChange={(e) => setEditPhanLoaiForm({ ...editPhanLoaiForm, huongXuLy: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all leading-relaxed"
                    placeholder="Nhập nội dung đề xuất phân công, thụ lý, chuyển đơn hoặc hướng dẫn..."
                  />
                  <span className="text-[10.5px] text-slate-400 block mt-1">
                    Đề xuất bước tác nghiệp thụ lý tiếp theo của cơ quan.
                  </span>
                </div>
              </div>
            </div>

            {/* KHỐI 3: CĂN CỨ PHÁP LÝ & LƯU VẾT KIỂM TOÁN */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#004ac6]">menu_book</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Căn cứ pháp lý áp dụng &amp; Ghi chú lưu vết
                </h3>
              </div>

              {/* 5. CĂN CỨ PHÁP LÝ */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    5. Căn cứ pháp lý áp dụng
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10.5px] text-slate-400">Thêm nhanh điều luật:</span>
                    {[
                      'BLTTHS 2015',
                      'BLHS 2015',
                      'Luật Khiếu nại 2011',
                      'Luật Tố cáo 2018',
                      'Luật Đất đai 2024',
                    ].map((law) => {
                      const isIncluded = editPhanLoaiForm.canCuPhapLy.includes(law);
                      return (
                        <button
                          key={law}
                          type="button"
                          onClick={() => {
                            const current = editPhanLoaiForm.canCuPhapLy.trim();
                            if (isIncluded) {
                              const updated = current
                                .replace(new RegExp(`(;\\s*)?${law}(;\\s*)?`, 'g'), '; ')
                                .replace(/^;\s*|;\s*$/g, '')
                                .trim();
                              setEditPhanLoaiForm({ ...editPhanLoaiForm, canCuPhapLy: updated });
                            } else {
                              const addition = current ? `; ${law}` : law;
                              setEditPhanLoaiForm({ ...editPhanLoaiForm, canCuPhapLy: current + addition });
                            }
                          }}
                          className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${isIncluded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {isIncluded ? 'check' : 'add'}
                          </span>
                          <span>{law}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={editPhanLoaiForm.canCuPhapLy}
                  onChange={(e) => setEditPhanLoaiForm({ ...editPhanLoaiForm, canCuPhapLy: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] leading-relaxed transition-all"
                  placeholder="Nhập điều khoản luật, nghị định, thông tư căn cứ..."
                />
              </div>

              {/* 6. LÝ DO / GHI CHÚ ĐIỀU CHỈNH (LƯU VẾT KIỂM TOÁN) */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">verified_user</span>
                  <label className="text-xs font-bold text-amber-900 uppercase tracking-tight">
                    6. Lý do / Ghi chú điều chỉnh của Cán bộ (Lưu vết kiểm toán)
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full font-semibold">
                    Lưu lịch sử
                  </span>
                </div>
                <input
                  type="text"
                  value={editPhanLoaiForm.ghiChuCuaCanBo || ''}
                  onChange={(e) => setEditPhanLoaiForm({ ...editPhanLoaiForm, ghiChuCuaCanBo: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-600 transition-all placeholder:text-slate-400"
                  placeholder="VD: Điều chỉnh từ Tin báo sang Tố giác theo hồ sơ tài liệu xác minh bổ sung..."
                />
                <p className="text-[10.5px] text-amber-800 mt-1.5">
                  Hệ thống tự động lưu kèm họ tên cán bộ thụ lý và mốc thời gian điều chỉnh để phục vụ hậu kiểm.
                </p>
              </div>
            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/90 flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRestoreAiPhanLoai}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-indigo-600">auto_awesome</span>
                <span>Khôi phục gợi ý AI ban đầu</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelEditPhanLoai}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#004ac6] hover:bg-[#003da8] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[17px]">check</span>
                  <span>Xác nhận &amp; Lưu phân loại</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA ĐƯƠNG SỰ VÀ VAI TRÒ                                */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[20px]">
                  {editingItem ? 'edit_note' : 'person_add'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingItem ? 'Chỉnh sửa thông tin & Vai trò đương sự' : 'Thêm người nộp đơn / Đương sự vào vụ việc'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Loại đối tượng <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.loaiDoiTuong}
                    onChange={(e) => {
                      const val = e.target.value as 'ca_nhan' | 'to_chuc';
                      setFormData((prev) => ({
                        ...prev,
                        loaiDoiTuong: val,
                        dinhDanhLabel: val === 'to_chuc' ? 'MST' : 'CCCD',
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#004ac6]"
                  >
                    <option value="ca_nhan">Cá nhân</option>
                    <option value="to_chuc">Cơ quan / Tổ chức / Doanh nghiệp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phân nhóm tham gia <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.phanNhom}
                    onChange={(e) => {
                      const val = e.target.value as 'nguoi_nop' | 'ben_bi_to_giac' | 'lien_quan';
                      let defVaiTro = 'Đồng đứng đơn';
                      let defColor: DuongSuItem['vaiTroColor'] = 'indigo';
                      if (val === 'ben_bi_to_giac') {
                        defVaiTro = formData.loaiDoiTuong === 'to_chuc' ? 'Tổ chức bị tố giác chính' : 'Đối tượng bị tố giác trực tiếp';
                        defColor = 'rose';
                      } else if (val === 'lien_quan') {
                        defVaiTro = 'Người có quyền lợi & nghĩa vụ liên quan';
                        defColor = 'amber';
                      }
                      setFormData((prev) => ({
                        ...prev,
                        phanNhom: val,
                        vaiTro: defVaiTro,
                        vaiTroColor: defColor,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#004ac6]"
                  >
                    <option value="nguoi_nop">Phía Người nộp đơn &amp; Đứng đơn</option>
                    <option value="ben_bi_to_giac">Phía Bị tố giác / Bị khiếu nại</option>
                    <option value="lien_quan">Người có quyền lợi, nghĩa vụ liên quan</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên cá nhân / Tên cơ quan, tổ chức <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hoTen || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hoTen: e.target.value }))}
                    placeholder="VD: Nguyễn Văn A hoặc Công ty Cổ phần X..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vai trò trong vụ việc <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.vaiTro}
                    onChange={(e) => {
                      const val = e.target.value;
                      let color: DuongSuItem['vaiTroColor'] = 'blue';
                      if (val.includes('chính')) color = 'blue';
                      else if (val.includes('Đồng')) color = 'indigo';
                      else if (val.includes('ủy quyền') || val.includes('Luật sư')) color = 'purple';
                      else if (val.includes('tố giác') || val.includes('khiếu nại')) color = 'rose';
                      else color = 'amber';

                      setFormData((prev) => ({
                        ...prev,
                        vaiTro: val,
                        vaiTroColor: color,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#004ac6]"
                  >
                    {formData.phanNhom === 'nguoi_nop' && (
                      <>
                        <option value="Người làm đơn (Đương sự chính)">Người làm đơn (Đương sự chính)</option>
                        <option value="Đồng đứng đơn (Đồng người tố giác)">Đồng đứng đơn (Đồng người tố giác)</option>
                        <option value="Đồng đứng đơn khiếu nại">Đồng đứng đơn khiếu nại</option>
                        <option value="Người đại diện theo ủy quyền (Luật sư)">Người đại diện theo ủy quyền (Luật sư)</option>
                        <option value="Người đại diện theo pháp luật / Giám hộ">Người đại diện theo pháp luật / Giám hộ</option>
                      </>
                    )}
                    {formData.phanNhom === 'ben_bi_to_giac' && (
                      <>
                        <option value="Tổ chức bị tố giác chính">Tổ chức bị tố giác chính</option>
                        <option value="Đối tượng bị tố giác trực tiếp">Đối tượng bị tố giác trực tiếp</option>
                        <option value="Bên bị khiếu nại (Cơ quan ban hành)">Bên bị khiếu nại (Cơ quan ban hành)</option>
                        <option value="Người đại diện pháp luật của bên bị tố giác">Người đại diện pháp luật của bên bị tố giác</option>
                      </>
                    )}
                    {formData.phanNhom === 'lien_quan' && (
                      <>
                        <option value="Người có quyền lợi & nghĩa vụ liên quan">Người có quyền lợi &amp; nghĩa vụ liên quan</option>
                        <option value="Người làm chứng / Biết việc">Người làm chứng / Biết việc</option>
                        <option value="Bên thứ ba có trách nhiệm liên đới">Bên thứ ba có trách nhiệm liên đới</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formData.dinhDanhLabel || 'Số định danh / CCCD'}
                  </label>
                  <input
                    type="text"
                    value={formData.dinhDanh || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dinhDanh: e.target.value }))}
                    placeholder="VD: 001088019482..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-label-technical focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tư cách tố tụng / nghiệp vụ
                  </label>
                  <input
                    type="text"
                    value={formData.tuCach || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tuCach: e.target.value }))}
                    placeholder="VD: Bị hại / Người đại diện / Người bị tố giác..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Trạng thái xác thực
                  </label>
                  <select
                    value={formData.xacThucBadge || 'VNeID Mức 2'}
                    onChange={(e) => {
                      const val = e.target.value;
                      let col: DuongSuItem['xacThucColor'] = 'emerald';
                      if (val.includes('Mức 2') || val.includes('mức 2')) col = 'emerald';
                      else if (val.includes('Doanh nghiệp') || val.includes('Luật sư') || val.includes('hoạt động')) col = 'blue';
                      else if (val.includes('Nhân sự') || val.includes('Chưa')) col = 'slate';
                      else col = 'amber';

                      setFormData((prev) => ({
                        ...prev,
                        xacThucBadge: val,
                        xacThucColor: col,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#004ac6]"
                  >
                    <option value="VNeID Mức 2">VNeID Mức 2</option>
                    <option value="VNeID Mức 1">VNeID Mức 1</option>
                    <option value="Đang hoạt động">Đang hoạt động (Doanh nghiệp)</option>
                    <option value="Đoàn Luật sư HN">Đoàn Luật sư HN</option>
                    <option value="Chưa xác thực">Chưa xác thực</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={formData.sdt || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sdt: e.target.value }))}
                    placeholder="VD: 0912 345 678"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-label-technical focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hộp thư điện tử (Email)</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="VD: email@domain.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Địa chỉ thường trú / Trụ sở chính
                  </label>
                  <input
                    type="text"
                    value={formData.diaChi || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, diaChi: e.target.value }))}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nguồn AI đọc từ file
                  </label>
                  <input
                    type="text"
                    value={formData.nguonTrichXuat || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nguonTrichXuat: e.target.value }))}
                    placeholder="VD: Trang 1, dòng 8 - Đơn tố giác.pdf"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Độ tin cậy AI (%)
                  </label>
                  <input
                    type="text"
                    value={formData.doTinCai || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, doTinCai: e.target.value }))}
                    placeholder="VD: 98%"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-label-technical focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mối quan hệ liên đới trong vụ việc / Ghi chú trách nhiệm
                  </label>
                  <textarea
                    rows={2}
                    value={formData.quanHeLienDoi || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quanHeLienDoi: e.target.value }))}
                    placeholder="Mô tả quan hệ hợp đồng, trách nhiệm, hành vi liên quan..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{editingItem ? 'Lưu thay đổi' : 'Thêm đương sự'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
