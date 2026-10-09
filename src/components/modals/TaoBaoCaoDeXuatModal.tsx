// src/components/modals/TaoBaoCaoDeXuatModal.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SigningDocument, SignerItem } from '../../types/signing';

export interface BaoCaoDeXuatFormData {
  // 1. Thông tin cơ quan & Hành chính
  soBaoCao: string;
  ngayLap: string;
  coQuanCapTren: string;
  coQuanLap: string;
  nguoiLap: string;
  chucVuNguoiLap: string;
  nguoiNhan: string;

  // 2. Thông tin phân công & Đơn
  soPhanCong: string;
  ngayPhanCong: string;
  maDon: string;
  loaiDon: string;
  nguoiGuiDon: string;
  diaChiNguoiGui: string;
  ngayTiepNhan: string;
  noiDungDon: string;

  // 3. I. Kết quả xác minh
  taiLieuThuThap: string;
  noiDungXacMinh: string;

  // 4. II. Nhận xét và đề xuất
  danhGiaNhanXet: string;
  canCuPhapLy: string;
  phuongAnDeXuat: number; // 1 | 2 | 3 | 4
  chiTietPhuongAn?: string;
  vanBanKemTheo?: string;
}

export interface TaoBaoCaoDeXuatModalProps {
  isOpen: boolean;
  onClose: () => void;
  donInfo?: {
    code?: string;
    title?: string;
    luotNhanId?: string;
    nguoiNop?: string;
    loaiDon?: string;
    noiDung?: string;
    ngayNhan?: string;
    canBoTiepNhan?: string;
    chucVuCanBo?: string;
    donViXuLy?: string;
    diaChi?: string;
    cccd?: string;
  };
  currentOfficer?: {
    name: string;
    chucVu: string;
    phongBan?: string;
    coQuan?: string;
  };
  initialHuongXuLy?: string;
  existingSigningDoc?: SigningDocument | null;
  onSaveDraft?: (formData: BaoCaoDeXuatFormData, updatedDoc: SigningDocument) => void;
  onSubmitToLeader?: (formData: BaoCaoDeXuatFormData, updatedDoc: SigningDocument) => void;
}

export const DANH_SACH_PHUONG_AN = [
  {
    id: 1,
    title: 'Phương án 1: Thụ lý đơn',
    desc: 'Đơn đủ điều kiện thụ lý giải quyết theo quy định của pháp luật.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    id: 2,
    title: 'Phương án 2: Chuyển thẩm quyền',
    desc: 'Chuyển đơn, hồ sơ đến cơ quan, đơn vị có đúng thẩm quyền để giải quyết.',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
  },
  {
    id: 3,
    title: 'Phương án 3: Trả lời đơn',
    desc: 'Lập văn bản trả lời, hướng dẫn hoặc giải thích cho công dân/người nộp đơn.',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
  },
  {
    id: 4,
    title: 'Phương án 4: Yêu cầu bổ sung',
    desc: 'Yêu cầu người nộp bổ sung tài liệu, chứng cứ hoặc giải trình làm rõ nội dung.',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
  },
];

/**
 * Hàm ánh xạ toàn bộ dữ liệu người dùng nhập vào biểu mẫu chuẩn:
 * “Báo cáo kết quả xác minh về việc giải quyết đơn (tố giác/tin báo/kiến nghị khởi tố)”
 */
export const buildBaoCaoXacMinhDocumentText = (data: BaoCaoDeXuatFormData): string => {
  const parts = (data.ngayLap || '16/09/2026').split('/');
  const ngayStr = parts[0] || '16';
  const thangStr = parts[1] || '09';
  const namStr = parts[2] || '2026';

  const coQuanCapTren = data.coQuanCapTren || 'CÔNG AN TP. HÀ NỘI';
  const coQuanLap = data.coQuanLap || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA';

  return `${coQuanCapTren}
${coQuanLap}
Số: ${data.soBaoCao}

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Hà Nội, ngày ${ngayStr} tháng ${thangStr} năm ${namStr}

BÁO CÁO KẾT QUẢ XÁC MINH
Về việc giải quyết đơn (tố giác/tin báo/kiến nghị khởi tố) của ông/bà ${data.nguoiGuiDon}

Kính gửi: ${data.nguoiNhan}

Thực hiện Phân công giải quyết nguồn tin về tội phạm số: ${data.soPhanCong || '24/QĐ-CQĐT'} ngày ${data.ngayPhanCong || `${ngayStr}/${thangStr}/${namStr}`} của Thủ trưởng/Phó Thủ trưởng Cơ quan Điều tra;
Hôm nay, ngày ${ngayStr} tháng ${thangStr} năm ${namStr}, Điều tra viên / Cán bộ điều tra: ${data.nguoiLap}
Đơn vị công tác: ${coQuanLap}
Tiến hành báo cáo kết quả xác minh đơn của: ${data.nguoiGuiDon}
Cư trú / Địa chỉ: ${data.diaChiNguoiGui || 'Quận Cầu Giấy, TP. Hà Nội'}
Nội dung đơn phản ánh / tố giác: ${data.noiDungDon}

I. KẾT QUẢ XÁC MINH
1. Các tài liệu, chứng cứ đã thu thập:
${data.taiLieuThuThap}

2. Nội dung diễn biến sự việc được xác minh:
${data.noiDungXacMinh}

II. NHẬN XÉT VÀ ĐỀ XUẤT
1. Đánh giá, nhận xét:
${data.danhGiaNhanXet}
- Căn cứ pháp lý: ${data.canCuPhapLy}

2. Đề xuất xử lý:
Kính đề nghị Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra xem xét, phê duyệt các nội dung sau:
[${data.phuongAnDeXuat === 1 ? 'X' : '  '}] Phương án 1: Thụ lý đơn (Đủ điều kiện thụ lý giải quyết theo quy định của pháp luật).
[${data.phuongAnDeXuat === 2 ? 'X' : '  '}] Phương án 2: Chuyển thẩm quyền (Chuyển đơn, hồ sơ đến cơ quan, đơn vị có đúng thẩm quyền để giải quyết).
[${data.phuongAnDeXuat === 3 ? 'X' : '  '}] Phương án 3: Trả lời đơn (Lập văn bản trả lời, hướng dẫn hoặc giải thích cho công dân/người nộp đơn).
[${data.phuongAnDeXuat === 4 ? 'X' : '  '}] Phương án 4: Yêu cầu bổ sung (Yêu cầu người nộp bổ sung tài liệu, chứng cứ hoặc giải trình làm rõ nội dung).
${data.chiTietPhuongAn ? `\n(Ghi chú phương án đề xuất: ${data.chiTietPhuongAn})` : ''}

Dự thảo các văn bản tố tụng kèm theo bao gồm: ${data.vanBanKemTheo || '(Liệt kê các quyết định, thông báo, bản kết luận... kèm theo).'}
Kính trình Đồng chí phê duyệt./.

Ý KIẾN PHÊ DUYỆT CỦA THỦ TRƯỞNG
(PHÓ THỦ TRƯỞNG)
(Ký, ghi rõ họ tên, ngày... tháng... năm...)




	NGƯỜI LẬP BÁO CÁO
(Điều tra viên / Cán bộ điều tra)
(Ký, ghi rõ họ tên)
${data.nguoiLap}
`;
};

export default function TaoBaoCaoDeXuatModal({
  isOpen,
  onClose,
  donInfo,
  currentOfficer,
  initialHuongXuLy,
  existingSigningDoc,
  onSaveDraft,
  onSubmitToLeader,
}: TaoBaoCaoDeXuatModalProps) {
  const maDon = donInfo?.code || 'Đ-2025-0105';
  const loaiDon = donInfo?.loaiDon?.includes('khiếu nại') ? 'Đơn tố cáo' : (donInfo?.loaiDon || 'Đơn tố giác tội phạm');
  const nguoiGuiDonDefault = donInfo?.nguoiNop || 'Vũ Thị Thanh';
  const diaChiNguoiGuiDefault = donInfo?.diaChi || 'Số 15 đường Cầu Giấy, phường Quan Hoa, quận Cầu Giấy, Hà Nội';
  const ngayTiepNhanDefault = donInfo?.ngayNhan || '16/09/2026 09:30';
  const noiDungDonDefault = donInfo?.title || donInfo?.noiDung || 'Tố giác hành vi vi phạm quy định pháp luật hình sự trong quản lý đất đai và trật tự xây dựng';

  const todayFormatted = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  // 1. Các trường thông tin lập báo cáo
  const [soBaoCao, setSoBaoCao] = useState<string>('24/BC-CQĐT');
  const [ngayLap, setNgayLap] = useState<string>(todayFormatted);
  const [coQuanCapTren, setCoQuanCapTren] = useState<string>('CÔNG AN TP. HÀ NỘI');
  const [coQuanLap, setCoQuanLap] = useState<string>('CƠ QUAN CẢNH SÁT ĐIỀU TRA');
  const [nguoiLap, setNguoiLap] = useState<string>('Nguyễn Minh Anh');
  const [chucVuNguoiLap, setChucVuNguoiLap] = useState<string>('Điều tra viên / Cán bộ điều tra');
  const [nguoiNhan, setNguoiNhan] = useState<string>('Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra');

  // Phân công & Đơn
  const [soPhanCong, setSoPhanCong] = useState<string>('24/QĐ-CQĐT');
  const [ngayPhanCong, setNgayPhanCong] = useState<string>(todayFormatted);
  const [nguoiGuiDon, setNguoiGuiDon] = useState<string>(nguoiGuiDonDefault);
  const [diaChiNguoiGui, setDiaChiNguoiGui] = useState<string>(diaChiNguoiGuiDefault);
  const [noiDungDon, setNoiDungDon] = useState<string>(noiDungDonDefault);

  // I. Kết quả xác minh
  const [taiLieuThuThap, setTaiLieuThuThap] = useState<string>(
    `- Tài liệu, chứng cứ do người nộp đơn cung cấp: Đơn tố giác tội phạm (Bản chính); Bản sao CCCD; Bảng kê chứng từ giao dịch chuyển tiền và các tài liệu, vi bằng, tệp tin ghi âm/ghi hình liên quan đến hành vi bị tố giác.\n- Tài liệu, chứng cứ do Cơ quan Điều tra thu thập: Biên bản tiếp nhận nguồn tin về tội phạm; Biên bản ghi lời khai người tố giác; Báo cáo xác minh hiện trường, nhân thân đối tượng bị tố giác; Công văn xác minh tại cơ quan quản lý chuyên ngành và tổ chức tín dụng.`
  );
  const [noiDungXacMinh, setNoiDungXacMinh] = useState<string>(
    `Tóm tắt trung thực, khách quan diễn biến sự việc: Qua công tác xác minh ban đầu, các nội dung tố giác của công dân có căn cứ thực tế. Đã làm rõ diễn biến hành vi, các giao dịch và tài liệu liên quan đến việc chiếm đoạt tài sản/dấu hiệu vi phạm pháp luật hình sự; các đối tượng liên quan đã được triệu tập, lấy lời khai bước đầu.`
  );

  // II. Nhận xét và đề xuất
  const [danhGiaNhanXet, setDanhGiaNhanXet] = useState<string>(
    `- Về tính chất, mức độ của sự việc: Vụ việc có tính chất nghiêm trọng, gây thiệt hại tài sản lớn, ảnh hưởng đến quyền lợi hợp pháp của công dân và tình hình an ninh trật tự trên địa bàn quản lý.\n- Về dấu hiệu tội phạm: Đã phát hiện đủ căn cứ dấu hiệu tội phạm theo quy định của Bộ luật Hình sự; vụ việc thuộc thẩm quyền thụ lý, giải quyết của Cơ quan Cảnh sát điều tra Công an quận.`
  );
  const [canCuPhapLy, setCanCuPhapLy] = useState<string>(
    `Căn cứ Điều 145, 146, 147 Bộ luật Tố tụng hình sự năm 2015 (sửa đổi, bổ sung 2021); Điều 174 Bộ luật Hình sự 2015.`
  );
  const [phuongAnDeXuat, setPhuongAnDeXuat] = useState<number>(1);
  const [chiTietPhuongAn, setChiTietPhuongAn] = useState<string>(
    `Đơn đủ điều kiện giải quyết theo quy định; đề xuất thụ lý và ban hành thông báo thụ lý giải quyết đơn theo đúng trình tự.`
  );
  const [vanBanKemTheo, setVanBanKemTheo] = useState<string>(
    `Dự thảo Thông báo thụ lý giải quyết đơn; Bản kết luận xác minh bước đầu; Bảng kê danh mục tài liệu hồ sơ.`
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tự động nạp dữ liệu khi modal mở hoặc thay đổi hồ sơ/văn bản đã có
  useEffect(() => {
    if (!isOpen) return;

    if (existingSigningDoc) {
      const savedFormData = (existingSigningDoc as any).formData as BaoCaoDeXuatFormData | undefined;
      if (savedFormData) {
        setSoBaoCao(savedFormData.soBaoCao || existingSigningDoc.soKyHieu || '24/BC-CQĐT');
        setNgayLap(savedFormData.ngayLap || todayFormatted);
        setCoQuanCapTren(savedFormData.coQuanCapTren || 'CÔNG AN TP. HÀ NỘI');
        setCoQuanLap(savedFormData.coQuanLap || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA');
        setNguoiLap(savedFormData.nguoiLap || 'Nguyễn Minh Anh');
        setChucVuNguoiLap(savedFormData.chucVuNguoiLap || 'Điều tra viên / Cán bộ điều tra');
        setNguoiNhan(savedFormData.nguoiNhan || 'Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra');
        setSoPhanCong(savedFormData.soPhanCong || '24/QĐ-CQĐT');
        setNgayPhanCong(savedFormData.ngayPhanCong || todayFormatted);
        setNguoiGuiDon(savedFormData.nguoiGuiDon || nguoiGuiDonDefault);
        setDiaChiNguoiGui(savedFormData.diaChiNguoiGui || diaChiNguoiGuiDefault);
        setNoiDungDon(savedFormData.noiDungDon || noiDungDonDefault);
        setTaiLieuThuThap(savedFormData.taiLieuThuThap || '');
        setNoiDungXacMinh(savedFormData.noiDungXacMinh || '');
        setDanhGiaNhanXet(savedFormData.danhGiaNhanXet || '');
        setCanCuPhapLy(savedFormData.canCuPhapLy || '');
        setPhuongAnDeXuat(savedFormData.phuongAnDeXuat || 1);
        setChiTietPhuongAn(savedFormData.chiTietPhuongAn || '');
        setVanBanKemTheo(savedFormData.vanBanKemTheo || '');
      } else {
        setSoBaoCao(existingSigningDoc.soKyHieu || '24/BC-CQĐT');
        setNgayLap(existingSigningDoc.ngayTao ? existingSigningDoc.ngayTao.split(' ')[0] : todayFormatted);
        setCoQuanLap(existingSigningDoc.donViNguoiLap || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA');
        setNguoiLap(existingSigningDoc.nguoiLap || currentOfficer?.name || 'Nguyễn Minh Anh');
        if (existingSigningDoc.lanhDaoName) {
          setNguoiNhan(`${existingSigningDoc.lanhDaoName} (${existingSigningDoc.lanhDaoChucVu || 'Thủ trưởng CQĐT'})`);
        }

        // Trích xuất phương án nếu có trong nội dung
        if (existingSigningDoc.noiDungChiTiet) {
          if (/\[X\]\s*Phương án 1|Thụ lý/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(1);
          else if (/\[X\]\s*Phương án 2|Chuyển thẩm quyền/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(2);
          else if (/\[X\]\s*Phương án 3|Trả lời đơn/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(3);
          else if (/\[X\]\s*Phương án 4|Yêu cầu bổ sung/i.test(existingSigningDoc.noiDungChiTiet)) setPhuongAnDeXuat(4);
        }
      }
    } else {
      const generatedSo = `${maDon.replace(/\D/g, '') || '24'}/BC-CQĐT`;
      setSoBaoCao(generatedSo);
      setNgayLap(todayFormatted);
      setCoQuanCapTren('CÔNG AN TP. HÀ NỘI');
      setCoQuanLap(donInfo?.donViXuLy || currentOfficer?.phongBan || 'CƠ QUAN CẢNH SÁT ĐIỀU TRA');
      setNguoiLap(currentOfficer?.name || donInfo?.canBoTiepNhan || 'Nguyễn Minh Anh');
      setChucVuNguoiLap(currentOfficer?.chucVu || 'Điều tra viên / Cán bộ điều tra');
      setNguoiNhan('Thủ trưởng (Phó Thủ trưởng) Cơ quan Điều tra');

      setSoPhanCong(`${maDon.replace(/\D/g, '') || '24'}/QĐ-CQĐT`);
      setNgayPhanCong(todayFormatted);
      setNguoiGuiDon(nguoiGuiDonDefault);
      setDiaChiNguoiGui(diaChiNguoiGuiDefault);
      setNoiDungDon(noiDungDonDefault);

      // Khởi tạo phương án theo hướng xử lý hiện tại nếu có
      if (initialHuongXuLy === 'thu_ly') setPhuongAnDeXuat(1);
      else if (initialHuongXuLy === 'ban_giao') setPhuongAnDeXuat(2);
      else if (initialHuongXuLy === 'tra_loi_don') setPhuongAnDeXuat(3);
      else if (initialHuongXuLy === 'yeu_cau_bo_sung') setPhuongAnDeXuat(4);
      else setPhuongAnDeXuat(1);
    }

    setErrors({});
  }, [isOpen, existingSigningDoc, donInfo, currentOfficer, todayFormatted, maDon, initialHuongXuLy]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getCurrentFormData = (): BaoCaoDeXuatFormData => {
    return {
      soBaoCao: soBaoCao.trim(),
      ngayLap: ngayLap.trim(),
      coQuanCapTren: coQuanCapTren.trim(),
      coQuanLap: coQuanLap.trim(),
      nguoiLap: nguoiLap.trim(),
      chucVuNguoiLap: chucVuNguoiLap.trim(),
      nguoiNhan: nguoiNhan.trim(),
      soPhanCong: soPhanCong.trim(),
      ngayPhanCong: ngayPhanCong.trim(),
      maDon,
      loaiDon,
      nguoiGuiDon: nguoiGuiDon.trim(),
      diaChiNguoiGui: diaChiNguoiGui.trim(),
      ngayTiepNhan: ngayTiepNhanDefault,
      noiDungDon: noiDungDon.trim(),
      taiLieuThuThap: taiLieuThuThap.trim(),
      noiDungXacMinh: noiDungXacMinh.trim(),
      danhGiaNhanXet: danhGiaNhanXet.trim(),
      canCuPhapLy: canCuPhapLy.trim(),
      phuongAnDeXuat,
      chiTietPhuongAn: chiTietPhuongAn.trim(),
      vanBanKemTheo: vanBanKemTheo.trim(),
    };
  };

  // Kiểm tra tính hợp lệ của các trường bắt buộc
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!soBaoCao.trim()) newErrors.soBaoCao = 'Vui lòng nhập Số báo cáo.';
    if (!ngayLap.trim()) newErrors.ngayLap = 'Vui lòng nhập Ngày lập báo cáo.';
    if (!coQuanLap.trim()) newErrors.coQuanLap = 'Vui lòng nhập Cơ quan/đơn vị lập báo cáo.';
    if (!nguoiLap.trim()) newErrors.nguoiLap = 'Vui lòng nhập Người lập báo cáo.';
    if (!nguoiNhan.trim()) newErrors.nguoiNhan = 'Vui lòng nhập Người nhận báo cáo (Thủ trưởng/Phó Thủ trưởng).';
    if (!noiDungDon.trim()) newErrors.noiDungDon = 'Vui lòng nhập Nội dung phản ánh / tố giác.';
    if (!taiLieuThuThap.trim()) newErrors.taiLieuThuThap = 'Vui lòng nhập Tài liệu, chứng cứ đã thu thập.';
    if (!noiDungXacMinh.trim()) newErrors.noiDungXacMinh = 'Vui lòng nhập Nội dung, diễn biến sự việc được xác minh.';
    if (!danhGiaNhanXet.trim()) newErrors.danhGiaNhanXet = 'Vui lòng nhập Đánh giá, nhận xét tính chất và dấu hiệu tội phạm.';
    if (!canCuPhapLy.trim()) newErrors.canCuPhapLy = 'Vui lòng nhập Căn cứ pháp lý.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi nhấn "Lưu" (Tạo báo cáo với trạng thái Bản nháp)
  const handleSave = () => {
    if (!validateForm()) {
      showToast('⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc được đánh dấu đỏ!');
      return;
    }

    const formData = getCurrentFormData();
    const docText = buildBaoCaoXacMinhDocumentText(formData);

    const docId = existingSigningDoc?.id || `VB-BC-${Date.now().toString().slice(-4)}`;
    const defaultSigner: SignerItem = {
      id: existingSigningDoc?.lanhDaoId || 'ld-01',
      name: existingSigningDoc?.lanhDaoName || 'Đ/c Trần Văn Hùng',
      chucVu: existingSigningDoc?.lanhDaoChucVu || 'Thủ trưởng / Phó Thủ trưởng Cơ quan Điều tra',
      coQuan: formData.coQuanLap || 'Cơ quan Cảnh sát điều tra',
      vaiTro: 'duyet',
      thuTu: 1,
      status: 'chua_den_luot',
    };

    const updatedDoc: SigningDocument = {
      id: docId,
      soKyHieu: formData.soBaoCao,
      hoSoCode: maDon,
      luotNhanId: donInfo?.luotNhanId || 'LN-2025-0105',
      loaiDon: formData.loaiDon,
      nguoiGuiDon: formData.nguoiGuiDon,
      noiDungDon: formData.noiDungDon,

      tenVanBan: 'Báo cáo kết quả xác minh',
      loaiVanBan: 'bao_cao_de_xuat',
      loaiVanBanLabel: 'Báo cáo đề xuất',
      trichYeu: `V/v Xác minh đơn của ông/bà ${formData.nguoiGuiDon}`,
      noiDungChiTiet: docText,

      nguoiLap: formData.nguoiLap,
      donViNguoiLap: formData.coQuanLap,
      ngayTao: `${formData.ngayLap} 09:00`,

      status: 'nhap', // Trạng thái ban đầu: Bản nháp
      mucDoUuTien: 'thuong',
      hanXuLy: '24 giờ',

      signers: existingSigningDoc?.signers?.length ? existingSigningDoc.signers : [defaultSigner],
      currentSignerIndex: 0,
      lanhDaoId: existingSigningDoc?.lanhDaoId || defaultSigner.id,
      lanhDaoName: existingSigningDoc?.lanhDaoName || defaultSigner.name,
      lanhDaoChucVu: existingSigningDoc?.lanhDaoChucVu || defaultSigner.chucVu,

      tepDinhKem: existingSigningDoc?.tepDinhKem || [
        {
          id: `att-bc-${Date.now()}`,
          tenTep: `Bao_cao_ket_qua_xac_minh_${maDon}.pdf`,
          dungLuong: '380 KB',
          loai: 'du_thao',
        },
      ],

      phienBanHienTai: existingSigningDoc?.phienBanHienTai || 'V1',
      versionHistory: [
        ...(existingSigningDoc?.versionHistory || []),
        {
          version: existingSigningDoc?.phienBanHienTai || 'V1',
          thoiGian: `${formData.ngayLap} 09:00`,
          nguoiTao: formData.nguoiLap,
          trangThaiLucDo: 'Bản nháp',
          ghiChu: 'Lập Báo cáo kết quả xác minh về việc giải quyết đơn',
          noiDungSnapshot: docText,
        },
      ],
      history: [
        ...(existingSigningDoc?.history || []),
        {
          id: `hist-${Date.now()}`,
          time: `${formData.ngayLap} 09:00`,
          actor: formData.nguoiLap,
          action: 'Lập báo cáo kết quả xác minh (Bản nháp)',
        },
      ],
      auditLogs: [
        ...(existingSigningDoc?.auditLogs || []),
        {
          id: `al-${Date.now()}`,
          time: `${formData.ngayLap} 09:00`,
          actor: formData.nguoiLap,
          actorRole: formData.chucVuNguoiLap || 'Điều tra viên',
          action: 'Lập văn bản',
          statusBefore: existingSigningDoc?.status || 'chua_tao',
          statusAfter: 'nhap',
          version: 'V1',
          note: `Phương án đề xuất: ${formData.phuongAnDeXuat}`,
        },
      ],
      stepId: 'STEP-02',
    };

    (updatedDoc as any).formData = formData;

    onSaveDraft?.(formData, updatedDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-body-md">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-slide-in max-w-md">
          <span className="material-symbols-outlined text-amber-400 text-lg shrink-0">warning</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Container modal chính */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* ================= HEADER ================= */}
        <div className="bg-[#004ac6] px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-[#004ac6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Tạo Báo cáo đề xuất
              </h2>
              <p className="text-[11px] text-blue-100 font-normal">
                Báo cáo kết quả xác minh về việc giải quyết đơn (tố giác / tin báo / kiến nghị khởi tố) • Hồ sơ: <strong className="font-mono text-white">{maDon}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Đóng (Hủy)"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* ================= NỘI DUNG FORM ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white text-xs">

          {/* Cảnh báo lỗi chung nếu có */}
          {Object.keys(errors).length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">error</span>
              <span>
                Vui lòng kiểm tra lại các trường đánh dấu <strong>*</strong> bắt buộc trước khi lưu báo cáo.
              </span>
            </div>
          )}

          {/* NHÓM 4: II. NHẬN XÉT VÀ ĐỀ XUẤT */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200/80">
              <span className="material-symbols-outlined text-emerald-600 text-[17px]">gavel</span>
              <span>II. Nhận xét và đề xuất</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                1. Đánh giá, nhận xét (Tính chất mức độ, dấu hiệu tội phạm) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={danhGiaNhanXet}
                onChange={(e) => {
                  setDanhGiaNhanXet(e.target.value);
                  if (errors.danhGiaNhanXet) setErrors((prev) => ({ ...prev, danhGiaNhanXet: '' }));
                }}
                className={`w-full p-2.5 text-slate-800 bg-white border rounded-xl leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.danhGiaNhanXet ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                placeholder="- Về tính chất, mức độ của sự việc: ...\n- Về dấu hiệu tội phạm: ..."
              />
              {errors.danhGiaNhanXet && <p className="text-[10.5px] text-rose-600 mt-1">{errors.danhGiaNhanXet}</p>}
            </div>

            {/* 2. Đề xuất xử lý: 4 phương án chuẩn */}
            <div className="pt-2">
              <label className="block font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                <span>2. Đề xuất xử lý (Chọn 1 trong 4 phương án chuẩn)</span>
                <span className="text-[10.5px] font-normal text-blue-700">Tự động tích dấu [X] vào văn bản</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DANH_SACH_PHUONG_AN.map((pa) => {
                  const isChecked = phuongAnDeXuat === pa.id;
                  return (
                    <div
                      key={pa.id}
                      onClick={() => setPhuongAnDeXuat(pa.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${isChecked
                        ? 'border-[#004ac6] bg-blue-50/80 shadow-xs ring-1 ring-[#004ac6]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="phuongAnDeXuat"
                        checked={isChecked}
                        onChange={() => setPhuongAnDeXuat(pa.id)}
                        className="w-4 h-4 mt-0.5 text-[#004ac6] focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <strong className={`block text-[11.5px] font-bold ${isChecked ? 'text-[#004ac6]' : 'text-slate-800'}`}>
                          {pa.title}
                        </strong>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                          {pa.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ================= FOOTER BUTTONS ================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-98 text-white text-xs font-bold shadow-md cursor-pointer transition"
              title="Kiểm tra thông tin và Lưu báo cáo vào Hồ sơ & Văn bản (Trạng thái: Bản nháp)"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Lưu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
