// src/components/modals/BaoCaoXacMinhModal.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SigningDocument, SignerItem } from '../../types/signing';

export interface BaoCaoXacMinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft?: (data: any) => void;
  onSubmitReport?: (data: any) => void;
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
}

export const DANH_SACH_HUONG_XU_LY = [
  {
    value: 'thu_ly',
    label: 'Thụ lý giải quyết',
    moTa: 'Đơn đủ điều kiện thụ lý giải quyết theo quy định pháp luật (thuộc thẩm quyền, căn cứ ban đầu rõ ràng).',
  },
  {
    value: 'yeu_cau_bo_sung',
    label: 'Yêu cầu bổ sung thông tin, tài liệu',
    moTa: 'Chưa đủ chứng cứ hoặc hồ sơ theo quy định; ban hành thông báo hướng dẫn công dân bổ sung.',
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

export default function BaoCaoXacMinhModal({
  isOpen,
  onClose,
  onSaveDraft,
  onSubmitReport,
  donInfo,
  currentOfficer,
  existingSigningDoc,
}: BaoCaoXacMinhModalProps) {
  // Thông tin đơn (chỉ đọc)
  const maDon = donInfo?.code || 'Đ-2025-0105';
  const loaiDon = donInfo?.loaiDon || 'Đơn khiếu nại';
  const nguoiGuiDon = donInfo?.nguoiNop || 'Công dân';
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

  // Form states cho nội dung báo cáo xác minh
  const [soBaoCao, setSoBaoCao] = useState<string>('');
  const [tieuDeBaoCao, setTieuDeBaoCao] = useState<string>('');
  const [tomTatNoiDung, setTomTatNoiDung] = useState<string>('');
  const [ketQuaXacMinh, setKetQuaXacMinh] = useState<string>('');
  const [thongTinCanLamRo, setThongTinCanLamRo] = useState<string>('');
  const [nhanDinhCanBo, setNhanDinhCanBo] = useState<string>('');
  const [huongXuLyDeXuat, setHuongXuLyDeXuat] = useState<string>('thu_ly');
  const [lyDoCanCuDeXuat, setLyDoCanCuDeXuat] = useState<string>('');
  const [congViecTiepTheo, setCongViecTiepTheo] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{
    tieuDeBaoCao?: string;
    tomTatNoiDung?: string;
    ketQuaXacMinh?: string;
    nhanDinhCanBo?: string;
    huongXuLyDeXuat?: string;
    lyDoCanCuDeXuat?: string;
  }>({});

  // Cảnh báo xác nhận khi đóng popup có dữ liệu chưa lưu
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Snapshot ban đầu để kiểm tra dirty state
  const initialValuesRef = useRef({
    soBaoCao: '',
    tieuDeBaoCao: '',
    tomTatNoiDung: '',
    ketQuaXacMinh: '',
    thongTinCanLamRo: '',
    nhanDinhCanBo: '',
    huongXuLyDeXuat: 'thu_ly',
    lyDoCanCuDeXuat: '',
    congViecTiepTheo: '',
  });

  // Tự động nạp dữ liệu khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    let initSoBaoCao = `${maDon.replace('Đ-', '')}/BC-XM-ĐX`;
    let initTieuDe = `Báo cáo kết quả kiểm tra, xác minh và đề xuất hướng xử lý đơn số ${maDon}`;
    let initTomTat = '';
    let initKetQua = '';
    let initCanLamRo = '';
    let initNhanDinh = '';
    let initHuong = 'thu_ly';
    let initLyDo = '';
    let initCongViec = '';

    if (existingSigningDoc) {
      initSoBaoCao = existingSigningDoc.soKyHieu || initSoBaoCao;
      initTieuDe = existingSigningDoc.tenVanBan || initTieuDe;
      initTomTat = existingSigningDoc.noiDungDon || donInfo?.noiDung || donInfo?.title || '';
      initKetQua = 'Đã tiến hành tra cứu cơ sở dữ liệu tiếp dân và kiểm tra hồ sơ địa chính liên quan; đối chiếu các biên bản làm việc ban đầu cho thấy nội dung phản ánh có cơ sở tiếp nhận.';
      initCanLamRo = 'Cần đối chiếu bản gốc Giấy chứng nhận và biên bản làm việc với cơ quan chuyên môn.';
      initNhanDinh = 'Nội dung đơn thuộc thẩm quyền giải quyết của đơn vị theo quy định pháp luật. Chưa phát hiện tình trạng đơn trùng lặp hoặc khiếu nại quá thời hiệu.';
      initHuong = 'thu_ly';
      initLyDo = 'Căn cứ Luật Khiếu nại, Luật Tiếp công dân và Thông tư 05/2021/TT-TTCP; hồ sơ có đầy đủ thông tin người đứng đơn và tài liệu chứng minh ban đầu.';
      initCongViec = 'Dự thảo Quyết định thụ lý và kế hoạch giải quyết đơn để trình Lãnh đạo phê duyệt.';
    } else {
      const rawNoiDung = donInfo?.noiDung || donInfo?.title || '';
      initTomTat = rawNoiDung.startsWith(maDon) ? rawNoiDung.replace(`${maDon}: `, '') : rawNoiDung;
      initKetQua = 'Đã kiểm tra sơ bộ hồ sơ tiếp nhận ban đầu; rà soát tính hợp lệ của đơn và các tài liệu kèm theo do công dân giao nộp.';
      initCanLamRo = 'Cần kiểm tra đối chiếu thông tin địa chính và văn bản trả lời trước đây của cơ quan chuyên môn liên quan đến vụ việc.';
      initNhanDinh = 'Qua nghiên cứu hồ sơ đơn và các tài liệu kèm theo, bước đầu nhận định: Đơn phản ánh nội dung cụ thể, thuộc thẩm quyền giải quyết của đơn vị. Đơn đủ điều kiện để xem xét xử lý theo quy định.';
      initHuong = 'thu_ly';
      initLyDo = 'Căn cứ quy định của Luật Khiếu nại và Thông tư số 05/2021/TT-TTCP; nội dung đơn có căn cứ và đủ điều kiện để thụ lý giải quyết theo thẩm quyền.';
      initCongViec = 'Phối hợp với bộ phận nghiệp vụ lập Tổ xác minh hoặc phân công cán bộ chuyên môn thụ lý giải quyết theo thời hạn luật định.';
    }

    setSoBaoCao(initSoBaoCao);
    setTieuDeBaoCao(initTieuDe);
    setTomTatNoiDung(initTomTat);
    setKetQuaXacMinh(initKetQua);
    setThongTinCanLamRo(initCanLamRo);
    setNhanDinhCanBo(initNhanDinh);
    setHuongXuLyDeXuat(initHuong);
    setLyDoCanCuDeXuat(initLyDo);
    setCongViecTiepTheo(initCongViec);
    setErrors({});
    setShowDiscardConfirm(false);

    initialValuesRef.current = {
      soBaoCao: initSoBaoCao,
      tieuDeBaoCao: initTieuDe,
      tomTatNoiDung: initTomTat,
      ketQuaXacMinh: initKetQua,
      thongTinCanLamRo: initCanLamRo,
      nhanDinhCanBo: initNhanDinh,
      huongXuLyDeXuat: initHuong,
      lyDoCanCuDeXuat: initLyDo,
      congViecTiepTheo: initCongViec,
    };
  }, [isOpen, existingSigningDoc, donInfo, maDon]);

  // Kiểm tra xem dữ liệu có bị thay đổi (isDirty)
  const isDirty = useMemo(() => {
    return (
      soBaoCao !== initialValuesRef.current.soBaoCao ||
      tieuDeBaoCao !== initialValuesRef.current.tieuDeBaoCao ||
      tomTatNoiDung !== initialValuesRef.current.tomTatNoiDung ||
      ketQuaXacMinh !== initialValuesRef.current.ketQuaXacMinh ||
      thongTinCanLamRo !== initialValuesRef.current.thongTinCanLamRo ||
      nhanDinhCanBo !== initialValuesRef.current.nhanDinhCanBo ||
      huongXuLyDeXuat !== initialValuesRef.current.huongXuLyDeXuat ||
      lyDoCanCuDeXuat !== initialValuesRef.current.lyDoCanCuDeXuat ||
      congViecTiepTheo !== initialValuesRef.current.congViecTiepTheo
    );
  }, [
    soBaoCao,
    tieuDeBaoCao,
    tomTatNoiDung,
    ketQuaXacMinh,
    thongTinCanLamRo,
    nhanDinhCanBo,
    huongXuLyDeXuat,
    lyDoCanCuDeXuat,
    congViecTiepTheo,
  ]);

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

  // Tạo nội dung văn bản hành chính chi tiết
  const buildVanBanChiTiet = (huongLabel: string): string => {
    return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n-------------------------\n\nBÁO CÁO KẾT QUẢ XÁC MINH VÀ ĐỀ XUẤT HƯỚNG XỬ LÝ ĐƠN\nSố: ${soBaoCao}\n\nKính gửi: Lãnh đạo đơn vị\n\nI. THÔNG TIN HỒ SƠ ĐƠN TIẾP NHẬN\n- Mã đơn / Số đơn: ${maDon}\n- Loại đơn: ${loaiDon}\n- Người gửi đơn: ${nguoiGuiDon}\n- Thời điểm tiếp nhận: ${ngayTiepNhan}\n- Cán bộ thụ lý ban đầu: ${canBoPhuTrach}\n- Đơn vị thụ lý: ${donViXuLy}\n\nII. TÓM TẮT NỘI DUNG ĐƠN\n${tomTatNoiDung}\n\nIII. KẾT QUẢ KIỂM TRA, XÁC MINH BAN ĐẦU\n1. Diễn biến và kết quả xác minh làm rõ:\n${ketQuaXacMinh}\n\n2. Thông tin còn thiếu hoặc cần làm rõ thêm:\n${thongTinCanLamRo || '(Không có)'}\n\nIV. NHẬN XÉT, ĐÁNH GIÁ TÍNH CÓ CĂN CỨ CỦA ĐƠN\n${nhanDinhCanBo}\n\nV. NỘI DUNG ĐỀ XUẤT HƯỚNG XỬ LÝ\n1. Hướng xử lý đề xuất: ${huongLabel.toUpperCase()}\n\n2. Lý do và căn cứ pháp lý đề xuất:\n${lyDoCanCuDeXuat}\n\n3. Công việc tiếp theo cần thực hiện:\n${congViecTiepTheo || '(Thực hiện theo chỉ đạo của Lãnh đạo đơn vị)'}\n\nKính trình Lãnh đạo xem xét, phê duyệt.\n\nNgười lập báo cáo: ${nguoiLap} (${chucVuNguoiLap})\nNgày lập: ${todayFormatted}`;
  };

  // Tạo hoặc cập nhật đối tượng SigningDocument
  const buildSigningDocument = (status: 'nhap' | 'cho_trinh'): SigningDocument => {
    const huongObj = DANH_SACH_HUONG_XU_LY.find((h) => h.value === huongXuLyDeXuat);
    const huongLabel = huongObj?.label || 'Đề xuất xử lý';

    const docId = existingSigningDoc?.id || `VB-BCXM-${Date.now().toString().slice(-4)}`;
    const isRevision = existingSigningDoc?.status === 'yeu_cau_chinh_sua';
    const nextVersion = isRevision
      ? `V${(parseFloat(existingSigningDoc.phienBanHienTai.replace('V', '') || '1') + 1).toFixed(0)}`
      : existingSigningDoc?.phienBanHienTai || 'V1';

    const chiTiet = buildVanBanChiTiet(huongLabel);

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
      soKyHieu: soBaoCao,
      hoSoCode: maDon,
      luotNhanId: donInfo?.luotNhanId || 'LN-2025-0105',
      loaiDon,
      nguoiGuiDon,
      noiDungDon: tomTatNoiDung,

      tenVanBan: tieuDeBaoCao || `Báo cáo kết quả xác minh và đề xuất xử lý đơn ${maDon}`,
      loaiVanBan: 'bao_cao_de_xuat',
      loaiVanBanLabel: 'Báo cáo đề xuất hướng xử lý',
      trichYeu: `Đề xuất: ${huongLabel} - ${tomTatNoiDung.slice(0, 90)}...`,
      noiDungChiTiet: chiTiet,

      nguoiLap,
      donViNguoiLap: donViXuLy,
      ngayTao: existingSigningDoc?.ngayTao || `${todayFormatted} 09:00`,

      nguoiTrinh: status === 'cho_trinh' ? nguoiLap : existingSigningDoc?.nguoiTrinh,
      thoiGianTrinh: status === 'cho_trinh' ? `${todayFormatted} 10:15` : existingSigningDoc?.thoiGianTrinh,
      yKienCanBo: `Kính trình Lãnh đạo xem xét phê duyệt Báo cáo kết quả xác minh và đề xuất hướng xử lý đơn số ${maDon} (${huongLabel}).`,

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
          tenTep: `Bao_cao_xac_minh_${maDon}.pdf`,
          dungLuong: '380 KB',
          loai: 'du_thao',
        },
      ],

      phienBanHienTai: nextVersion,
      versionHistory: [
        ...(existingSigningDoc?.versionHistory || []),
        {
          version: nextVersion,
          thoiGian: `${todayFormatted} 10:15`,
          nguoiTao: nguoiLap,
          trangThaiLucDo: status === 'nhap' ? 'Bản nháp' : 'Chờ trình ký',
          ghiChu: isRevision ? 'Cập nhật lại báo cáo theo ý kiến lãnh đạo' : 'Hoàn thiện nội dung báo cáo xác minh & đề xuất xử lý',
          noiDungSnapshot: chiTiet,
        },
      ],

      history: [
        ...(existingSigningDoc?.history || []),
        {
          id: `hist-${Date.now()}`,
          time: `${todayFormatted} 10:15`,
          actor: nguoiLap,
          action: status === 'nhap' ? 'Lưu nháp báo cáo xác minh' : 'Chuyển sang quy trình trình ký lãnh đạo',
          note: isRevision ? 'Đã chỉnh sửa theo yêu cầu của Lãnh đạo' : undefined,
        },
      ],

      auditLogs: [
        ...(existingSigningDoc?.auditLogs || []),
        {
          id: `al-${Date.now()}`,
          time: `${todayFormatted} 10:15`,
          actor: nguoiLap,
          actorRole: chucVuNguoiLap,
          action: status === 'nhap' ? 'Lưu nháp báo cáo' : 'Chuyển trình ký báo cáo',
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
    const updatedDoc = buildSigningDocument('nhap');

    initialValuesRef.current = {
      soBaoCao,
      tieuDeBaoCao,
      tomTatNoiDung,
      ketQuaXacMinh,
      thongTinCanLamRo,
      nhanDinhCanBo,
      huongXuLyDeXuat,
      lyDoCanCuDeXuat,
      congViecTiepTheo,
    };

    onSaveDraft?.(updatedDoc);
    showToast('✓ Đã lưu nháp Báo cáo xác minh thành công (Trạng thái: Bản nháp)!');
  };

  // 2. Thao tác Trình lãnh đạo / Trình ký
  const handleSubmitToLeader = () => {
    const newErrors: {
      tieuDeBaoCao?: string;
      tomTatNoiDung?: string;
      ketQuaXacMinh?: string;
      nhanDinhCanBo?: string;
      huongXuLyDeXuat?: string;
      lyDoCanCuDeXuat?: string;
    } = {};

    if (!tieuDeBaoCao.trim()) {
      newErrors.tieuDeBaoCao = 'Vui lòng nhập tiêu đề báo cáo.';
    }
    if (!tomTatNoiDung.trim()) {
      newErrors.tomTatNoiDung = 'Vui lòng nhập tóm tắt nội dung đơn tiếp nhận.';
    }
    if (!ketQuaXacMinh.trim()) {
      newErrors.ketQuaXacMinh = 'Vui lòng nhập kết quả kiểm tra, xác minh ban đầu.';
    }
    if (!nhanDinhCanBo.trim()) {
      newErrors.nhanDinhCanBo = 'Vui lòng nhập nhận xét, đánh giá tính có căn cứ của đơn.';
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
    const updatedDoc = buildSigningDocument('cho_trinh');

    onSubmitReport?.(updatedDoc);
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
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                  Nghiệp vụ Quản lý Đơn
                </span>
                {existingSigningDoc?.status === 'yeu_cau_chinh_sua' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-900/80 text-rose-200 border border-rose-500/40">
                    <span className="material-symbols-outlined text-[13px]">replay</span>
                    Chỉnh sửa theo ý kiến Lãnh đạo ({existingSigningDoc.phienBanHienTai} → V2)
                  </span>
                ) : existingSigningDoc?.status === 'nhap' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <span className="material-symbols-outlined text-[13px]">edit_note</span>
                    Bản nháp
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    <span className="material-symbols-outlined text-[13px]">assignment</span>
                    Báo cáo xác minh
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Số đơn: <strong className="text-white font-mono">{maDon}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Nội dung Báo cáo xác minh và Trình ký
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

        {/* ================= NỘI DUNG BIỂU MẪU (CUỘN ĐỘC LẬP - HIỂN THỊ TRỰC TIẾP, KHÔNG CHIA TAB) ================= */}
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
                  Cán bộ cập nhật lại nội dung dưới đây và nhấn <strong>“Trình lãnh đạo”</strong> để chuyển sang quy trình ký duyệt lại.
                </span>
              </div>
            </div>
          )}

          {/* THÔNG TIN HỒ SƠ ĐƠN TIẾP NHẬN (CHỈ ĐỌC) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">folder_open</span>
                Thông tin hồ sơ đơn tiếp nhận
              </h3>
              <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[13px] text-slate-400">lock</span>
                Dữ liệu chỉ đọc từ hồ sơ
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Mã đơn / Số đơn:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{maDon}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Loại đơn:</span>
                <span className="font-semibold text-slate-800">{loaiDon}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Người gửi đơn:</span>
                <span className="font-semibold text-slate-800">{nguoiGuiDon}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[11px] mb-0.5">Thời điểm tiếp nhận:</span>
                <span className="font-semibold text-slate-800">{ngayTiepNhan}</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Cán bộ phụ trách:</span>
                <strong className="text-slate-800">{canBoPhuTrach}</strong>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Đơn vị:</span>
                <span className="text-slate-700">{donViXuLy}</span>
              </div>
              <span className="text-[11px] text-blue-700 italic">
                * Dữ liệu tự động kế thừa, cán bộ không phải nhập lại
              </span>
            </div>
          </div>

          {/* SỐ KÝ HIỆU & TIÊU ĐỀ BÁO CÁO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Số / Ký hiệu báo cáo
              </label>
              <input
                type="text"
                value={soBaoCao}
                onChange={(e) => setSoBaoCao(e.target.value)}
                className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="VD: 08/BC-XM-ĐX"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tiêu đề báo cáo xác minh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tieuDeBaoCao}
                onChange={(e) => {
                  setTieuDeBaoCao(e.target.value);
                  if (errors.tieuDeBaoCao) setErrors((prev) => ({ ...prev, tieuDeBaoCao: undefined }));
                }}
                className={`w-full text-xs border rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${errors.tieuDeBaoCao ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-300'
                  }`}
                placeholder="Nhập tiêu đề báo cáo xác minh..."
              />
              {errors.tieuDeBaoCao && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.tieuDeBaoCao}</p>
              )}
            </div>
          </div>

          {/* 1. TÓM TẮT NỘI DUNG ĐƠN TIẾP NHẬN */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>
                1. Tóm tắt nội dung đơn tiếp nhận <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Biên tập cho báo cáo, không làm thay đổi nội dung đơn gốc
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
              placeholder="Nhập tóm tắt bản chất nội dung khiếu nại/tố cáo/kiến nghị của công dân..."
            />
            {errors.tomTatNoiDung && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.tomTatNoiDung}
              </p>
            )}
          </div>

          {/* 2. KẾT QUẢ KIỂM TRA, XÁC MINH BAN ĐẦU */}
          <div className="space-y-3 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">fact_check</span>
              2. Kết quả kiểm tra, xác minh ban đầu
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2.1. Diễn biến và nội dung đã kiểm tra, xác minh làm rõ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={ketQuaXacMinh}
                onChange={(e) => {
                  setKetQuaXacMinh(e.target.value);
                  if (errors.ketQuaXacMinh) setErrors((prev) => ({ ...prev, ketQuaXacMinh: undefined }));
                }}
                className={`w-full text-xs border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 bg-white transition ${errors.ketQuaXacMinh ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-300'
                  }`}
                placeholder="Ghi nhận rõ các thông tin, tài liệu và kết quả làm việc đã xác minh được..."
              />
              {errors.ketQuaXacMinh && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.ketQuaXacMinh}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2.2. Thông tin còn thiếu hoặc nội dung cần làm rõ thêm (nếu có)
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

          {/* 3. NHẬN XÉT, ĐÁNH GIÁ TÍNH CÓ CĂN CỨ CỦA ĐƠN */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>
                3. Nhận xét, đánh giá tính có căn cứ của đơn <span className="text-rose-500">*</span>
              </span>

            </label>
            <textarea
              rows={3}
              value={nhanDinhCanBo}
              onChange={(e) => {
                setNhanDinhCanBo(e.target.value);
                if (errors.nhanDinhCanBo) setErrors((prev) => ({ ...prev, nhanDinhCanBo: undefined }));
              }}
              className={`w-full text-xs border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 transition ${errors.nhanDinhCanBo ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-300'
                }`}
              placeholder="Nhận định của cán bộ về tính chất vụ việc, thẩm quyền, tính có căn cứ ban đầu của yêu cầu/phản ánh..."
            />
            {errors.nhanDinhCanBo && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.nhanDinhCanBo}
              </p>
            )}
          </div>

          {/* 4. NỘI DUNG ĐỀ XUẤT HƯỚNG XỬ LÝ */}
          <div className="space-y-3 p-4 rounded-xl border border-blue-200 bg-blue-50/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px]">recommend</span>
              4. Nội dung đề xuất hướng xử lý
            </h3>

            {/* Chọn hướng xử lý đề xuất */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                4.1. Hướng xử lý đề xuất <span className="text-rose-500">*</span>
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
              {currentHuongInfo && (
                <div className="text-[11px] text-blue-900 mt-1.5 flex items-start gap-1 bg-blue-100/60 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[14px] text-blue-700 shrink-0 mt-0.5">info</span>
                  <span>{currentHuongInfo.moTa}</span>
                </div>
              )}
              {errors.huongXuLyDeXuat && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.huongXuLyDeXuat}
                </p>
              )}
            </div>

            {/* Lý do và căn cứ đề xuất */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                4.2. Lý do và căn cứ pháp lý đề xuất <span className="text-rose-500">*</span>
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
            </div>

            {/* Công việc tiếp theo cần thực hiện */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                4.3. Công việc tiếp theo cần thực hiện
              </label>
              <textarea
                rows={2}
                value={congViecTiepTheo}
                onChange={(e) => setCongViecTiepTheo(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800 bg-white"
                placeholder="Dự kiến các bước tiếp theo sau khi Lãnh đạo cho ý kiến hoặc ký phê duyệt (VD: soạn quyết định thụ lý, thành lập tổ xác minh, phát hành văn bản...)"
              />
            </div>
          </div>

          {/* 5. THÔNG TIN NGƯỜI LẬP (TỰ ĐỘNG TỪ HỆ THỐNG) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-slate-600 text-[16px]">badge</span>
              5. Thông tin cán bộ lập báo cáo
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

            {/* Nút Trình lãnh đạo / Trình ký */}
            <button
              type="button"
              onClick={handleSubmitToLeader}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-98 text-white text-xs font-bold shadow-md cursor-pointer transition"
              title="Kiểm tra các trường bắt buộc, lưu báo cáo và chuyển sang quy trình trình ký hiện có"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Trình lãnh đạo (Trình ký)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= DIALOG XÁC NHẬN KHI CÓ DỮ LIỆU CHƯA LƯU ================= */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Xác nhận đóng biểu mẫu</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bạn có thay đổi chưa lưu trong <strong>Báo cáo xác minh</strong>. Nếu đóng ngay bây giờ, các nội dung vừa nhập sẽ không được lưu lại. Bạn có chắc chắn muốn đóng không?
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
      )}
    </div>
  );
}
