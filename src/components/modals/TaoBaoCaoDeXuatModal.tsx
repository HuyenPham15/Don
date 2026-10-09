// src/components/modals/TaoBaoCaoDeXuatModal.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SigningDocument, SignerItem } from '../../types/signing';

export interface BaoCaoDeXuatFormData {
  // 1. Thông tin đơn (kế thừa từ hồ sơ tiếp nhận, chỉ đọc)
  maDon: string;
  loaiDon: string;
  nguoiGuiDon: string;
  ngayTiepNhan: string;
  canBoPhuTrach: string;
  donViXuLy?: string;

  // 2. Nội dung biểu mẫu báo cáo
  tomTatNoiDung: string;
  nhanDinhCanBo: string;
  thongTinCanLamRo: string;
  huongXuLyDeXuat: string;
  lyDoCanCuDeXuat: string;
  congViecTiepTheo: string;

  // 3. Thông tin người lập
  nguoiLap: string;
  chucVuNguoiLap: string;
  ngayLap: string;
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
  };
  currentOfficer?: {
    name: string;
    chucVu: string;
    phongBan?: string;
    coQuan?: string;
  };
  existingSigningDoc?: SigningDocument | null;
  onSaveDraft?: (formData: BaoCaoDeXuatFormData, updatedDoc: SigningDocument) => void;
  onSubmitToLeader?: (formData: BaoCaoDeXuatFormData, updatedDoc: SigningDocument) => void;
}

export const DANH_SACH_HUONG_XU_LY = [
  {
    value: 'thu_ly',
    label: 'Thụ lý giải quyết',
    moTa: 'Đơn đủ điều kiện thụ lý giải quyết theo quy định pháp luật (thẩm quyền, chứng cứ ban đầu rõ ràng).',
  },
  {
    value: 'yeu_cau_bo_sung',
    label: 'Yêu cầu bổ sung thông tin, tài liệu',
    moTa: 'Chưa đủ chứng cứ hoặc hồ sơ theo quy định; ban hành thông báo hướng dẫn bổ sung.',
  },
  {
    value: 'chuyen_tham_quyen',
    label: 'Chuyển đơn đến cơ quan có thẩm quyền',
    moTa: 'Đơn không thuộc thẩm quyền giải quyết; ban hành phiếu chuyển đơn đến đúng cơ quan xử lý.',
  },
  {
    value: 'tra_lai_don',
    label: 'Trả lại đơn kèm văn bản hướng dẫn',
    moTa: 'Đơn không đủ điều kiện xử lý; trả lại đơn kèm văn bản hướng dẫn công dân theo quy định.',
  },
  {
    value: 'tra_loi_don',
    label: 'Ban hành văn bản trả lời, giải thích đơn',
    moTa: 'Đơn đã có quyết định/kết luận giải quyết hoặc giải thích rõ căn cứ pháp luật cho công dân.',
  },
];

export default function TaoBaoCaoDeXuatModal({
  isOpen,
  onClose,
  donInfo,
  currentOfficer,
  existingSigningDoc,
  onSaveDraft,
  onSubmitToLeader,
}: TaoBaoCaoDeXuatModalProps) {
  // Thông tin đơn cơ bản (chỉ đọc)
  const maDon = donInfo?.code || 'Đ-2025-0105';
  const loaiDon = donInfo?.loaiDon?.includes('khiếu nại') ? 'Đơn tố cáo' : (donInfo?.loaiDon || 'Đơn tố cáo');
  const nguoiGuiDon = donInfo?.nguoiNop || 'Vũ Thị Thanh';
  const ngayTiepNhan = donInfo?.ngayNhan || '16/09/2026 09:30';
  const canBoPhuTrach = donInfo?.canBoTiepNhan || currentOfficer?.name || 'Nguyễn Minh Anh';
  const donViXuLy = donInfo?.donViXuLy || currentOfficer?.phongBan || 'Phòng Tiếp công dân & Xử lý đơn';

  // Người lập và ngày lập tự động theo hệ thống
  const nguoiLap = currentOfficer?.name || canBoPhuTrach;
  const chucVuNguoiLap = currentOfficer?.chucVu || donInfo?.chucVuCanBo || 'Chuyên viên xử lý đơn';
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  // Form states
  const [tomTatNoiDung, setTomTatNoiDung] = useState<string>('');
  const [nhanDinhCanBo, setNhanDinhCanBo] = useState<string>('');
  const [thongTinCanLamRo, setThongTinCanLamRo] = useState<string>('');
  const [huongXuLyDeXuat, setHuongXuLyDeXuat] = useState<string>('thu_ly');
  const [lyDoCanCuDeXuat, setLyDoCanCuDeXuat] = useState<string>('');
  const [congViecTiepTheo, setCongViecTiepTheo] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{
    tomTatNoiDung?: string;
    nhanDinhCanBo?: string;
    huongXuLyDeXuat?: string;
    lyDoCanCuDeXuat?: string;
  }>({});

  // Cảnh báo xác nhận khi đóng popup có dữ liệu chưa lưu
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Snapshot ban đầu để kiểm tra dirty state
  const initialValuesRef = useRef({
    tomTatNoiDung: '',
    nhanDinhCanBo: '',
    thongTinCanLamRo: '',
    huongXuLyDeXuat: 'thu_ly',
    lyDoCanCuDeXuat: '',
    congViecTiepTheo: '',
  });

  // Tự động nạp dữ liệu khi modal mở hoặc thay đổi hồ sơ/văn bản đã có
  useEffect(() => {
    if (!isOpen) return;

    let initTomTat = '';
    let initNhanDinh = '';
    let initCanLamRo = '';
    let initHuong = 'thu_ly';
    let initLyDo = '';
    let initCongViec = '';

    if (existingSigningDoc) {
      // Nếu đã có văn bản trình ký trước đó (nháp hoặc yêu cầu chỉnh sửa)
      initTomTat = existingSigningDoc.noiDungDon || donInfo?.noiDung || donInfo?.title || 'Tố cáo hành vi lạm quyền, vi phạm trật tự xây dựng và quản lý đất đai';
      initNhanDinh = 'Qua nghiên cứu hồ sơ đơn tố cáo và các tài liệu kèm theo, nhận định nội dung tố cáo có căn cứ ban đầu, thuộc thẩm quyền giải quyết của đơn vị theo Luật Tố cáo năm 2018.';
      initCanLamRo = 'Cần đối chiếu bản gốc Giấy chứng nhận, hồ sơ địa chính và biên bản kiểm tra hiện trạng với cơ quan chuyên môn.';
      initHuong = 'thu_ly';
      initLyDo = 'Căn cứ Điều 12 và Điều 29 Luật Tố cáo năm 2018, Nghị định số 31/2019/NĐ-CP của Chính phủ; đơn tố cáo có đầy đủ thông tin người tố cáo và tài liệu chứng minh ban đầu.';
      initCongViec = 'Dự thảo Quyết định thụ lý giải quyết tố cáo và Quyết định thành lập Tổ xác minh nội dung tố cáo trình Lãnh đạo phê duyệt.';
    } else {
      // Mặc định từ hồ sơ đơn đang mở
      const rawNoiDung = donInfo?.noiDung || donInfo?.title || 'Tố cáo hành vi vi phạm trật tự xây dựng và quản lý đất đai';
      initTomTat = rawNoiDung.startsWith(maDon) ? rawNoiDung.replace(`${maDon}: `, '') : rawNoiDung;

      initNhanDinh = 'Qua nghiên cứu hồ sơ đơn tố cáo và các tài liệu do công dân cung cấp, bước đầu nhận định:\n1. Tư cách người tố cáo: Đơn có họ tên, chữ ký và CCCD rõ ràng, người tố cáo cam kết chịu trách nhiệm trước pháp luật.\n2. Về thẩm quyền: Nội dung tố cáo thuộc thẩm quyền tiếp nhận và thụ lý giải quyết của đơn vị theo quy định tại Điều 12 Luật Tố cáo năm 2018.\n3. Về căn cứ ban đầu: Tài liệu, hình ảnh và chứng cứ kèm theo bước đầu có cơ sở để xem xét, xác minh làm rõ.';
      initCanLamRo = 'Cần kiểm tra đối chiếu thông tin địa chính, hồ sơ quy hoạch và biên bản kiểm tra hiện trạng của cơ quan chuyên môn.';
      initHuong = 'thu_ly';
      initLyDo = 'Căn cứ Điều 12 và Điều 29 Luật Tố cáo năm 2018, Nghị định số 31/2019/NĐ-CP và Thông tư số 05/2021/TT-TTCP; hồ sơ đơn tố cáo đủ điều kiện để thụ lý giải quyết và thành lập Tổ xác minh theo luật định.';
      initCongViec = 'Dự thảo Quyết định thụ lý giải quyết tố cáo và Quyết định thành lập Tổ xác minh nội dung tố cáo trình Lãnh đạo phê duyệt; thông báo cho người tố cáo theo quy định.';
    }

    setTomTatNoiDung(initTomTat);
    setNhanDinhCanBo(initNhanDinh);
    setThongTinCanLamRo(initCanLamRo);
    setHuongXuLyDeXuat(initHuong);
    setLyDoCanCuDeXuat(initLyDo);
    setCongViecTiepTheo(initCongViec);
    setErrors({});
    setShowDiscardConfirm(false);

    initialValuesRef.current = {
      tomTatNoiDung: initTomTat,
      nhanDinhCanBo: initNhanDinh,
      thongTinCanLamRo: initCanLamRo,
      huongXuLyDeXuat: initHuong,
      lyDoCanCuDeXuat: initLyDo,
      congViecTiepTheo: initCongViec,
    };
  }, [isOpen, existingSigningDoc, donInfo, maDon]);

  // Kiểm tra xem dữ liệu có bị thay đổi (isDirty)
  const isDirty = useMemo(() => {
    return (
      tomTatNoiDung !== initialValuesRef.current.tomTatNoiDung ||
      nhanDinhCanBo !== initialValuesRef.current.nhanDinhCanBo ||
      thongTinCanLamRo !== initialValuesRef.current.thongTinCanLamRo ||
      huongXuLyDeXuat !== initialValuesRef.current.huongXuLyDeXuat ||
      lyDoCanCuDeXuat !== initialValuesRef.current.lyDoCanCuDeXuat ||
      congViecTiepTheo !== initialValuesRef.current.congViecTiepTheo
    );
  }, [tomTatNoiDung, nhanDinhCanBo, thongTinCanLamRo, huongXuLyDeXuat, lyDoCanCuDeXuat, congViecTiepTheo]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Xử lý đóng modal an toàn
  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Xác nhận thoát không lưu
  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  // Thu thập dữ liệu form hiện tại
  const getCurrentFormData = (): BaoCaoDeXuatFormData => {
    return {
      maDon,
      loaiDon,
      nguoiGuiDon,
      ngayTiepNhan,
      canBoPhuTrach,
      donViXuLy,
      tomTatNoiDung: tomTatNoiDung.trim(),
      nhanDinhCanBo: nhanDinhCanBo.trim(),
      thongTinCanLamRo: thongTinCanLamRo.trim(),
      huongXuLyDeXuat,
      lyDoCanCuDeXuat: lyDoCanCuDeXuat.trim(),
      congViecTiepTheo: congViecTiepTheo.trim(),
      nguoiLap,
      chucVuNguoiLap,
      ngayLap: todayFormatted,
    };
  };

  // Tạo nội dung văn bản hành chính chi tiết
  const buildVanBanChiTiet = (formData: BaoCaoDeXuatFormData, huongLabel: string): string => {
    return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n-------------------------\n\nBÁO CÁO ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN\nKính gửi: Lãnh đạo đơn vị\n\nI. THÔNG TIN HỒ SƠ ĐƠN TIẾP NHẬN\n- Mã đơn / Số đơn: ${formData.maDon}\n- Loại đơn: ${formData.loaiDon}\n- Người gửi đơn: ${formData.nguoiGuiDon}\n- Thời điểm tiếp nhận: ${formData.ngayTiepNhan}\n- Cán bộ thụ lý ban đầu: ${formData.canBoPhuTrach}\n- Đơn vị thụ lý: ${formData.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn'}\n\nII. TÓM TẮT NỘI DUNG ĐƠN\n${formData.tomTatNoiDung}\n\nIII. NHẬN ĐỊNH BAN ĐẦU CỦA CÁN BỘ THỤ LÝ\n1. Nhận định về nội dung đơn:\n${formData.nhanDinhCanBo}\n\n2. Thông tin còn thiếu hoặc nội dung cần làm rõ:\n${formData.thongTinCanLamRo || '(Không có)'}\n\nIV. NỘI DUNG ĐỀ XUẤT HƯỚNG XỬ LÝ\n1. Hướng xử lý đề xuất: ${huongLabel.toUpperCase()}\n\n2. Lý do và căn cứ đề xuất:\n${formData.lyDoCanCuDeXuat}\n\n3. Công việc tiếp theo cần thực hiện:\n${formData.congViecTiepTheo || '(Thực hiện theo chỉ đạo của Lãnh đạo đơn vị)'}\n\nKính trình Lãnh đạo đơn vị xem xét, cho ý kiến chỉ đạo.\n\nNgười lập báo cáo: ${formData.nguoiLap} (${formData.chucVuNguoiLap})\nNgày lập: ${formData.ngayLap}`;
  };

  // Tạo hoặc cập nhật đối tượng SigningDocument
  const buildSigningDocument = (
    formData: BaoCaoDeXuatFormData,
    status: 'nhap' | 'cho_trinh'
  ): SigningDocument => {
    const huongObj = DANH_SACH_HUONG_XU_LY.find((h) => h.value === formData.huongXuLyDeXuat);
    const huongLabel = huongObj?.label || 'Đề xuất xử lý';

    const docId = existingSigningDoc?.id || `VB-BCDX-${Date.now().toString().slice(-4)}`;
    const soKyHieu = existingSigningDoc?.soKyHieu || `${docId.replace('VB-BCDX-', '')}/BC-ĐX`;
    const isRevision = existingSigningDoc?.status === 'yeu_cau_chinh_sua';
    const nextVersion = isRevision
      ? `V${(parseFloat(existingSigningDoc.phienBanHienTai.replace('V', '') || '1') + 1).toFixed(0)}`
      : existingSigningDoc?.phienBanHienTai || 'V1';

    const chiTiet = buildVanBanChiTiet(formData, huongLabel);

    // Kế thừa signers hiện có hoặc thiết lập mặc định lãnh đạo nhận trình
    const defaultSigner: SignerItem = {
      id: existingSigningDoc?.lanhDaoId || 'ld-01',
      name: existingSigningDoc?.lanhDaoName || 'Đ/c Trần Văn Hùng',
      chucVu: existingSigningDoc?.lanhDaoChucVu || 'Phó Chánh Thanh tra thành phố',
      coQuan: 'Thanh tra Thành phố',
      vaiTro: 'duyet',
      thuTu: 1,
      status: status === 'cho_trinh' ? 'cho_ky' : 'chua_den_luot',
    };

    const updatedDoc: SigningDocument = {
      id: docId,
      soKyHieu,
      hoSoCode: formData.maDon,
      luotNhanId: donInfo?.luotNhanId || 'LN-2025-0105',
      loaiDon: formData.loaiDon,
      nguoiGuiDon: formData.nguoiGuiDon,
      noiDungDon: formData.tomTatNoiDung,

      tenVanBan: `Báo cáo đề xuất hướng xử lý đơn ${formData.maDon}`,
      loaiVanBan: 'bao_cao_de_xuat',
      loaiVanBanLabel: 'Báo cáo đề xuất hướng xử lý',
      trichYeu: `Đề xuất: ${huongLabel} - ${formData.tomTatNoiDung.slice(0, 90)}...`,
      noiDungChiTiet: chiTiet,

      nguoiLap: formData.nguoiLap,
      donViNguoiLap: formData.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      ngayTao: existingSigningDoc?.ngayTao || `${formData.ngayLap} 09:00`,

      nguoiTrinh: status === 'cho_trinh' ? formData.nguoiLap : existingSigningDoc?.nguoiTrinh,
      thoiGianTrinh: status === 'cho_trinh' ? `${formData.ngayLap} 10:15` : existingSigningDoc?.thoiGianTrinh,
      yKienCanBo: `Kính trình Lãnh đạo xem xét phê duyệt Báo cáo đề xuất hướng xử lý đơn số ${formData.maDon} (${huongLabel}).`,

      signers: existingSigningDoc?.signers?.length ? existingSigningDoc.signers : [defaultSigner],
      currentSignerIndex: 0,

      lanhDaoId: existingSigningDoc?.lanhDaoId || defaultSigner.id,
      lanhDaoName: existingSigningDoc?.lanhDaoName || defaultSigner.name,
      lanhDaoChucVu: existingSigningDoc?.lanhDaoChucVu || defaultSigner.chucVu,

      status,
      mucDoUuTien: 'thuong',
      hanXuLy: '24 giờ',

      tepDinhKem: existingSigningDoc?.tepDinhKem || [
        {
          id: `att-bc-${Date.now()}`,
          tenTep: `Bao_cao_de_xuat_${formData.maDon}.pdf`,
          dungLuong: '340 KB',
          loai: 'du_thao',
        },
      ],

      phienBanHienTai: nextVersion,
      versionHistory: [
        ...(existingSigningDoc?.versionHistory || []),
        {
          version: nextVersion,
          thoiGian: `${formData.ngayLap} 10:15`,
          nguoiTao: formData.nguoiLap,
          trangThaiLucDo: status === 'nhap' ? 'Bản nháp' : 'Chờ trình ký',
          ghiChu: isRevision ? 'Cập nhật lại báo cáo theo ý kiến lãnh đạo' : 'Soạn thảo báo cáo đề xuất hướng xử lý đơn',
          noiDungSnapshot: chiTiet,
        },
      ],

      history: [
        ...(existingSigningDoc?.history || []),
        {
          id: `hist-${Date.now()}`,
          time: `${formData.ngayLap} 10:15`,
          actor: formData.nguoiLap,
          action: status === 'nhap' ? 'Lưu nháp báo cáo đề xuất' : 'Hoàn thiện báo cáo và chuyển sang quy trình trình ký',
          note: isRevision ? 'Đã chỉnh sửa theo yêu cầu của Lãnh đạo' : undefined,
        },
      ],

      auditLogs: [
        ...(existingSigningDoc?.auditLogs || []),
        {
          id: `al-${Date.now()}`,
          time: `${formData.ngayLap} 10:15`,
          actor: formData.nguoiLap,
          actorRole: formData.chucVuNguoiLap,
          action: status === 'nhap' ? 'Lưu nháp báo cáo đề xuất' : 'Chuyển trình ký báo cáo',
          statusBefore: existingSigningDoc?.status || 'chua_tao',
          statusAfter: status,
          version: nextVersion,
          note: `Đề xuất hướng xử lý: ${huongLabel}`,
        },
      ],

      stepId: 'STEP-02',
    };

    return updatedDoc;
  };

  // 1. Thao tác Lưu nháp
  const handleSaveDraft = () => {
    const formData = getCurrentFormData();
    const updatedDoc = buildSigningDocument(formData, 'nhap');

    initialValuesRef.current = {
      tomTatNoiDung,
      nhanDinhCanBo,
      thongTinCanLamRo,
      huongXuLyDeXuat,
      lyDoCanCuDeXuat,
      congViecTiepTheo,
    };

    onSaveDraft?.(formData, updatedDoc);
    showToast('✓ Đã lưu nháp Báo cáo đề xuất hướng xử lý đơn thành công (Trạng thái: Bản nháp)!');
  };

  // 2. Thao tác Trình lãnh đạo
  const handleSubmitToLeader = () => {
    const newErrors: {
      tomTatNoiDung?: string;
      nhanDinhCanBo?: string;
      huongXuLyDeXuat?: string;
      lyDoCanCuDeXuat?: string;
    } = {};

    if (!tomTatNoiDung.trim()) {
      newErrors.tomTatNoiDung = 'Vui lòng nhập tóm tắt nội dung đơn báo cáo.';
    }
    if (!nhanDinhCanBo.trim()) {
      newErrors.nhanDinhCanBo = 'Vui lòng nhập nhận định ban đầu của cán bộ.';
    }
    if (!huongXuLyDeXuat) {
      newErrors.huongXuLyDeXuat = 'Vui lòng chọn hướng xử lý đề xuất.';
    }
    if (!lyDoCanCuDeXuat.trim()) {
      newErrors.lyDoCanCuDeXuat = 'Vui lòng nhập lý do và căn cứ pháp lý đề xuất.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const formData = getCurrentFormData();
    // Tạo SigningDocument với trạng thái 'cho_trinh' (Chờ trình ký để cán bộ chọn lãnh đạo nhận trình trong quy trình trình ký)
    const updatedDoc = buildSigningDocument(formData, 'cho_trinh');

    onSubmitToLeader?.(formData, updatedDoc);
    onClose();
  };

  // Thông tin hướng xử lý đang chọn
  const currentHuongInfo = DANH_SACH_HUONG_XU_LY.find((h) => h.value === huongXuLyDeXuat);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-body-md select-none">
      {/* Toast thông báo nhanh */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-slide-in max-w-md">
          <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Container modal chính: 800 - 1000px, max-height 85vh */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">

        {/* ================= HEADER CỐ ĐỊNH PHÍA TRÊN ================= */}
        <div className="bg-[#004ac6] px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#004ac6]">
          <div className="flex items-center gap-3">

            <div>

              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Tạo Báo cáo đề xuất
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Đóng (Hủy)"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* ================= NỘI DUNG BIỂU MẪU (CUỘN ĐỘC LẬP) ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">

          {/* Thông báo nếu có chỉ đạo chỉnh sửa từ Lãnh đạo */}
          {existingSigningDoc?.status === 'yeu_cau_chinh_sua' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
              <span className="material-symbols-outlined text-rose-600 text-xl shrink-0 mt-0.5">error</span>
              <div>
                <strong className="font-bold block text-rose-950 mb-0.5">
                  Lãnh đạo yêu cầu chỉnh sửa báo cáo (Phiên bản trước: {existingSigningDoc.phienBanHienTai}):
                </strong>
                <p className="leading-relaxed">
                  {existingSigningDoc.lyDoTraLai ||
                    existingSigningDoc.auditLogs?.find((a) => a.action.includes('chỉnh sửa'))?.note ||
                    'Vui lòng làm rõ thêm căn cứ pháp lý và bổ sung nội dung xác minh hiện trạng trước khi phê duyệt.'}
                </p>
                <span className="text-[11px] text-rose-700 block mt-1">
                  Cán bộ cập nhật lại các mục dưới đây và nhấn <strong>“Trình lãnh đạo”</strong> để chuyển sang quy trình ký duyệt lại.
                </span>
              </div>
            </div>
          )}

          {/* 1. THÔNG TIN ĐƠN (CHỈ ĐỌC, KẾ THỪA TỪ HỒ SƠ ĐANG MỞ) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">folder_open</span>
                Thông tin hồ sơ đơn tiếp nhận
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Mã đơn / Số đơn:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{maDon}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Loại đơn:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {loaiDon}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Người gửi đơn:</span>
                <span className="font-semibold text-slate-800">{nguoiGuiDon}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Ngày tiếp nhận:</span>
                <span className="font-semibold text-slate-800">{ngayTiepNhan}</span>
              </div>
            </div>


          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>
                1. Tóm tắt nội dung đơn <span className="text-rose-500">*</span>
              </span>

            </label>
            <textarea
              rows={3}
              value={tomTatNoiDung}
              onChange={(e) => {
                setTomTatNoiDung(e.target.value);
                if (errors.tomTatNoiDung) setErrors((prev) => ({ ...prev, tomTatNoiDung: undefined }));
              }}
              className={`w-full text-xs border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 transition ${errors.tomTatNoiDung ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-300'
                }`}
              placeholder="Nhập tóm tắt bản chất hành vi vi phạm bị tố cáo, đối tượng bị tố cáo và yêu cầu của người tố cáo..."
            />
            {errors.tomTatNoiDung && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.tomTatNoiDung}
              </p>
            )}
          </div>

          {/* 3. NHẬN ĐỊNH BAN ĐẦU */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[16px]">psychology</span>
              2. Nhận định ban đầu của cán bộ thụ lý
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2.1. Nhận định về nội dung đơn (dựa trên thông tin, tài liệu hiện có) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={nhanDinhCanBo}
                onChange={(e) => {
                  setNhanDinhCanBo(e.target.value);
                  if (errors.nhanDinhCanBo) setErrors((prev) => ({ ...prev, nhanDinhCanBo: undefined }));
                }}
                className={`w-full text-xs border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 bg-white transition ${errors.nhanDinhCanBo ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-300'
                  }`}
                placeholder="Nhận định sơ bộ về tính chất vụ việc, thẩm quyền, tính có căn cứ ban đầu của yêu cầu/phản ánh..."
              />
              {errors.nhanDinhCanBo && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.nhanDinhCanBo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2.2. Thông tin còn thiếu hoặc nội dung cần làm rõ (nếu có)
              </label>
              <textarea
                rows={2}
                value={thongTinCanLamRo}
                onChange={(e) => setThongTinCanLamRo(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 bg-white"
                placeholder="Ghi nhận các tài liệu chứng minh còn thiếu, các điểm mâu thuẫn hoặc nội dung cần xác minh làm rõ thêm..."
              />
            </div>
          </div>

          {/* 4. NỘI DUNG ĐỀ XUẤT HƯỚNG XỬ LÝ */}
          {/* <div className="space-y-3 p-4 rounded-xl border border-blue-200 bg-blue-50/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px]">recommend</span>
              3. Nội dung đề xuất hướng xử lý
            </h3> */}

          {/* Chọn hướng xử lý đề xuất */}
          {/* <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                3.1. Hướng xử lý đề xuất <span className="text-rose-500">*</span>
              </label>
              <select
                value={huongXuLyDeXuat}
                onChange={(e) => {
                  setHuongXuLyDeXuat(e.target.value);
                  if (errors.huongXuLyDeXuat) setErrors((prev) => ({ ...prev, huongXuLyDeXuat: undefined }));
                }}
                className={`w-full text-xs border rounded-xl px-3 py-2.5 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${errors.huongXuLyDeXuat ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-300'
                  }`}
              >
                {DANH_SACH_HUONG_XU_LY.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {errors.huongXuLyDeXuat && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.huongXuLyDeXuat}
                </p>
              )}
            </div> */}

          {/* Lý do và căn cứ đề xuất */}
          {/* <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                3.2. Lý do và căn cứ pháp lý đề xuất <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={lyDoCanCuDeXuat}
                onChange={(e) => {
                  setLyDoCanCuDeXuat(e.target.value);
                  if (errors.lyDoCanCuDeXuat) setErrors((prev) => ({ ...prev, lyDoCanCuDeXuat: undefined }));
                }}
                className={`w-full text-xs border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 bg-white transition ${errors.lyDoCanCuDeXuat ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-300'
                  }`}
                placeholder="Nêu rõ các điều khoản luật, thông tư hướng dẫn và cơ sở thực tế dẫn đến hướng xử lý đề xuất..."
              />
              {errors.lyDoCanCuDeXuat && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.lyDoCanCuDeXuat}
                </p>
              )}
            </div> */}

          {/* Công việc tiếp theo cần thực hiện */}
          {/* <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              3.3. Công việc tiếp theo cần thực hiện
            </label>
            <textarea
              rows={2}
              value={congViecTiepTheo}
              onChange={(e) => setCongViecTiepTheo(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 bg-white"
              placeholder="Dự kiến các bước tiếp theo sau khi Lãnh đạo cho ý kiến hoặc ký phê duyệt (VD: soạn quyết định, lập tổ xác minh, phát hành văn bản...)"
            />
          </div> */}
          {/* </div> */}

          {/* 5. THÔNG TIN NGƯỜI LẬP (TỰ ĐỘNG TỪ HỆ THỐNG) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-slate-600 text-[16px]">badge</span>
              3. Thông tin cán bộ lập báo cáo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Họ tên cán bộ lập:</label>
                <input
                  type="text"
                  readOnly
                  value={`${nguoiLap} (${chucVuNguoiLap})`}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Ngày lập báo cáo (hệ thống):</label>
                <input
                  type="text"
                  readOnly
                  value={todayFormatted}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= NHÓM NÚT THAO TÁC CỐ ĐỊNH PHÍA DƯỚI ================= */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          {/* Nút Hủy */}
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2.5">
            {/* Nút Lưu nháp */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
              title="Lưu báo cáo với trạng thái Bản nháp"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">save</span>
              <span>Lưu nháp</span>
            </button>

            {/* Nút Trình lãnh đạo: kiểm tra trường bắt buộc, lưu và chuyển quy trình trình ký */}
            <button
              type="button"
              onClick={handleSubmitToLeader}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-98 text-white text-xs font-bold shadow-md cursor-pointer transition"
              title="Kiểm tra các trường bắt buộc, lưu báo cáo và chuyển sang quy trình trình ký hiện có"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Trình lãnh đạo</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= DIALOG XÁC NHẬN KHI CÓ DỮ LIỆU CHƯA LƯU ================= */}
      {
        showDiscardConfirm && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-md space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Xác nhận đóng biểu mẫu</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Bạn có thay đổi chưa lưu trong <strong>Báo cáo đề xuất</strong>. Nếu đóng ngay bây giờ, các nội dung vừa nhập sẽ không được lưu lại. Bạn có chắc chắn muốn đóng không?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Đóng không lưu
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
