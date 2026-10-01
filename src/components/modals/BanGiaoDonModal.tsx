import React, { useState, useMemo } from 'react';
import { DEPARTMENTS, OFFICERS, Officer } from '../../constants/departments';

export interface TaiLieuBanGiaoItem {
  id: string;
  tenTaiLieu: string;
  loaiBan: 'ban_chinh' | 'ban_sao_chung_thuc' | 'ban_chup' | 'file_so_hoa';
  soLuong: number;
  tinhTrang: string;
  selected: boolean;
}

export interface BanGiaoDonSubmitData {
  stepId: 'STEP-03C';
  huongXuLy: 'ban_giao';
  banGiaoType: 'don_vi_khac' | 'can_bo_noi_bo';
  // Đơn vị nhận (nếu đơn vị khác)
  donViNhanId?: string;
  donViNhanName?: string;
  phongBanNhan?: string;
  canBoDauMoi?: string;
  phuongThucChuyen: 'lien_thong_dien_tu' | 'buu_chinh_cong_ich' | 'truc_tiep_ho_so_giay';
  // Cán bộ nhận (nếu nội bộ)
  canBoNhanId?: string;
  canBoNhan?: Officer;
  // Dữ liệu bàn giao bắt buộc
  lyDoBanGiao: string;
  canCuPhapLy: string;
  ghiChuBanGiao?: string;
  thoiHanTiepNhan: string;
  danhMucTaiLieu: TaiLieuBanGiaoItem[];
  // Cấu hình sản phẩm / văn bản bàn giao
  cauHinhVanBan: {
    taoVanBan: boolean;
    loaiVanBan: 'phieu_chuyen_don_to_cao' | 'bien_ban_ban_giao' | 'phieu_chuyen_don';
    soKyHieu: string;
    ngayLap: string;
    nguoiLap: string;
  };
}

export interface BanGiaoDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BanGiaoDonSubmitData) => void;
  currentOfficerName?: string;
  currentDepartmentName?: string;
  donInfo?: {
    code?: string;
    luotNhanId?: string;
    nguoiNop?: string;
    cccd?: string;
    sdt?: string;
    diaChi?: string;
    loaiDon?: string;
    noiDung?: string;
    ngayNhan?: string;
    suggestedDeptId?: string;
  };
}

// Danh mục các lý do chuyển thẩm quyền xử lý đơn tố cáo chuẩn hóa theo Điều 12, 26 Luật Tố cáo 2018 & TT 05/2021/TT-TTCP
const TRANSFER_REASONS = [
  {
    id: 'khong_thuoc_tham_quyen',
    label: '1. Không thuộc thẩm quyền giải quyết (Thuộc cơ quan, tổ chức hoặc cấp khác)',
    targetDeptId: 'pc03',
    shortReason: 'Không thuộc thẩm quyền giải quyết',
    lyDo: 'Nội dung đơn tố cáo hành vi vi phạm pháp luật thuộc về cơ quan, tổ chức hoặc cấp khác mà người tiếp nhận đơn không có thẩm quyền xử lý. Căn cứ Điều 26 Luật Tố cáo 2018, chuyển hồ sơ đến cơ quan có thẩm quyền giải quyết theo quy định.',
    canCu: 'Điều 12, Điều 26 Luật Tố cáo 2018; Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ.',
  },
  {
    id: 'thay_doi_co_cau_dia_gioi',
    label: '2. Thay đổi cơ cấu tổ chức hoặc địa giới hành chính (Sáp nhập, chia tách, hợp nhất, giải thể)',
    targetDeptId: 'ubnd-quan',
    shortReason: 'Thay đổi cơ cấu tổ chức hoặc địa giới hành chính',
    lyDo: 'Sau khi sáp nhập, chia tách, hợp nhất, giải thể hoặc sắp xếp lại đơn vị hành chính, thẩm quyền giải quyết vụ việc được chuyển giao cho cơ quan, tổ chức kế thừa hợp pháp thụ lý giải quyết theo quy định.',
    canCu: 'Khoản 4, 5 Điều 12 Luật Tố cáo 2018; Nghị quyết của UBTV Quốc hội về việc sắp xếp đơn vị hành chính; Thông tư 05/2021/TT-TTCP.',
  },
  {
    id: 'can_bo_chuyen_cong_tac',
    label: '3. Cán bộ, công chức, viên chức bị tố cáo đã chuyển công tác (Xác định lại thẩm quyền)',
    targetDeptId: 'ubnd-quan',
    shortReason: 'Cán bộ bị tố cáo đã chuyển công tác',
    lyDo: 'Việc xác định lại cơ quan chủ trì giải quyết thay đổi theo chức vụ mới hoặc vị trí công tác mới tại thời điểm xem xét, chuyển đơn đến cơ quan có thẩm quyền quản lý hiện tại hoặc cấp trên trực tiếp.',
    canCu: 'Khoản 3 Điều 12 Luật Tố cáo 2018; Điều 26 Luật Tố cáo 2018; Thông tư số 05/2021/TT-TTCP.',
  },
  {
    id: 'quan_ly_cap_duoi_truc_tiep',
    label: '4. Người bị tố cáo thuộc thẩm quyền quản lý cấp dưới trực tiếp (Đơn gửi vượt cấp)',
    targetDeptId: 'ubnd-quan',
    shortReason: 'Người bị tố cáo thuộc quản lý cấp dưới trực tiếp',
    lyDo: 'Đơn được gửi vượt cấp hoặc đúng cơ quan cấp trên nhưng cần phân định lại trách nhiệm cho cơ quan trực tiếp quản lý cán bộ vi phạm thụ lý theo đúng nguyên tắc phân cấp quản lý cán bộ.',
    canCu: 'Khoản 1 Điều 12, Điều 26 Luật Tố cáo 2018; Quy định về phân cấp quản lý cán bộ, công chức, viên chức.',
  },
  {
    id: 'to_cao_dang_vien',
    label: '5. Tố cáo đối với đảng viên vi phạm Điều lệ Đảng (Chuyển cơ quan có thẩm quyền của Đảng)',
    targetDeptId: 'ubkt-dang',
    shortReason: 'Tố cáo đảng viên vi phạm Điều lệ Đảng',
    lyDo: 'Đơn tố cáo đối với đảng viên vi phạm Điều lệ Đảng, chủ trương, nghị quyết, chỉ thị, quy định của Đảng, chuyển đến Ủy ban Kiểm tra Đảng ủy có thẩm quyền để xem xét xử lý theo quy định của Đảng.',
    canCu: 'Điều lệ Đảng Cộng sản Việt Nam; Quy định số 22-QĐ/TW của BCH Trung ương; Thông tư số 05/2021/TT-TTCP.',
  },
  {
    id: 'nguy_co_thiet_hai_nghiem_trong',
    label: '6. Hành vi vi phạm gây thiệt hại hoặc đe dọa gây thiệt hại nghiêm trọng (Chuyển ngăn chặn khẩn cấp)',
    targetDeptId: 'pc03',
    shortReason: 'Đe dọa gây thiệt hại nghiêm trọng đến lợi ích Nhà nước',
    lyDo: 'Hành vi vi phạm bị tố cáo có dấu hiệu gây thiệt hại hoặc đe dọa gây thiệt hại nghiêm trọng đến lợi ích của Nhà nước, quyền và lợi ích hợp pháp của tổ chức, cá nhân; khẩn cấp chuyển cơ quan thẩm quyền áp dụng biện pháp ngăn chặn kịp thời.',
    canCu: 'Khoản 2 Điều 26 Luật Tố cáo 2018; Thông tư số 05/2021/TT-TTCP ngày 01/10/2021.',
  },
  {
    id: 'vi_pham_thu_tuc_khieu_nai',
    label: '7. Tố cáo người giải quyết khiếu nại vi phạm thủ tục (Không thụ lý, hướng dẫn khởi kiện Tòa án)',
    targetDeptId: 'toaan-quan',
    shortReason: 'Vi phạm trình tự, thủ tục giải quyết khiếu nại',
    lyDo: 'Đơn tố cáo người giải quyết khiếu nại vi phạm thẩm quyền, trình tự, thủ tục (không có chứng cứ hành vi cản trở, đe dọa, bao che). Không thụ lý tố cáo theo Luật Tố cáo, chuyển/hướng dẫn công dân khiếu nại tiếp hoặc khởi kiện vụ án hành chính tại Tòa án.',
    canCu: 'Mục 2.2 Quy trình xử lý đơn tố cáo; Luật Khiếu nại 2011; Luật Tố tụng Hành chính 2015; Thông tư 05/2021/TT-TTCP.',
  },
  {
    id: 'toi_pham_dieu_tra',
    label: '8. Có dấu hiệu tội phạm hình sự, chuyển Cơ quan CSĐT theo Đ.145 BLTTHS',
    targetDeptId: 'pc03',
    shortReason: 'Dấu hiệu tội phạm hình sự (Đ.145, 146 BLTTHS)',
    lyDo: 'Hồ sơ có dấu hiệu tội phạm lừa đảo chiếm đoạt tài sản số tiền lớn, thuộc thẩm quyền điều tra của Cơ quan Cảnh sát điều tra Công an thành phố (PC03) theo quy định tại Điều 145, 146 Bộ luật Tố tụng Hình sự 2015.',
    canCu: 'Điều 26 Luật Tố cáo 2018; Thông tư liên tịch số 01/2017/TTLT; Điều 145, 146 BLTTHS 2015.',
  },
  {
    id: 'phan_cong_noi_bo',
    label: '9. Bàn giao nội bộ / Phân công lại chuyên viên cùng phòng thụ lý',
    targetDeptId: 'can_bo_noi_bo',
    shortReason: 'Phân công lại chuyên viên cùng phòng',
    lyDo: 'Bàn giao nội bộ do thay đổi phân công công tác hoặc chuyển chuyên viên có chuyên môn phù hợp trực tiếp thụ lý hồ sơ.',
    canCu: 'Quy chế làm việc nội bộ của Ban Tiếp công dân; Thông tư 05/2021/TT-TTCP.',
  },
  {
    id: 'ly_do_khac',
    label: '10. Lý do chuyển thẩm quyền khác...',
    targetDeptId: '',
    shortReason: 'Chuyển theo thẩm quyền quy định',
    lyDo: 'Hồ sơ thuộc thẩm quyền giải quyết của cơ quan chức năng theo quy định pháp luật. Chuyển hồ sơ giải quyết theo đúng thẩm quyền.',
    canCu: 'Luật Khiếu nại 2011; Luật Tố cáo 2018; Thông tư số 05/2021/TT-TTCP.',
  },
];

export default function BanGiaoDonModal({
  isOpen,
  onClose,
  onSubmit,
  currentOfficerName = 'Nguyễn Minh Anh',
  currentDepartmentName = 'Phòng Tiếp công dân & Xử lý đơn',
  donInfo = {
    code: 'Đ-2026-00125',
    luotNhanId: 'LN-2026-0819',
    nguoiNop: 'Nguyễn Văn A',
    cccd: '001088012345',
    sdt: '0983 123 456',
    diaChi: 'Số 12, ngõ 45, Cầu Giấy, Hà Nội',
    loaiDon: 'Đơn tố giác tội phạm',
    noiDung: 'Tố giác vi phạm lừa đảo chiếm đoạt tài sản qua hình thức huy động vốn',
    ngayNhan: '16/09/2026',
    suggestedDeptId: 'pc03',
  },
}: BanGiaoDonModalProps) {
  // Tabs: 'form' (Lập thông tin bàn giao) vs 'preview' (Xem trước Phiếu chuyển đơn / Biên bản)
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Hướng bàn giao: 'don_vi_khac' (liên đơn vị) vs 'can_bo_noi_bo' (nội bộ phòng)
  const [banGiaoType, setBanGiaoType] = useState<'don_vi_khac' | 'can_bo_noi_bo'>('don_vi_khac');

  // Đơn vị nhận (khác)
  const [selectedDonViId, setSelectedDonViId] = useState<string>(donInfo.suggestedDeptId || 'pc03');
  const [phongBanNhan, setPhongBanNhan] = useState<string>('Bộ phận Tiếp nhận & Thụ lý');
  const [canBoDauMoi, setCanBoDauMoi] = useState<string>('');
  const [phuongThucChuyen, setPhuongThucChuyen] = useState<'lien_thong_dien_tu' | 'buu_chinh_cong_ich' | 'truc_tiep_ho_so_giay'>('lien_thong_dien_tu');

  // Cán bộ nội bộ nhận
  const [selectedCanBoNoiBoId, setSelectedCanBoNoiBoId] = useState<string>('cb-02');

  // Dropdown lý do chuyển thẩm quyền (Mặc định lý do 1)
  const [selectedReasonKey, setSelectedReasonKey] = useState<string>('khong_thuoc_tham_quyen');

  // Thông tin bàn giao bắt buộc (Hệ thống tự động điền sẵn hợp lệ)
  const [lyDoChiTiet, setLyDoChiTiet] = useState<string>(
    TRANSFER_REASONS[0].lyDo
  );
  const [canCuPhapLy, setCanCuPhapLy] = useState<string>(
    TRANSFER_REASONS[0].canCu
  );
  const [thoiHanTiepNhan, setThoiHanTiepNhan] = useState<string>('03 ngày làm việc (kể từ ngày chuyển hồ sơ)');
  const [ghiChuBanGiao, setGhiChuBanGiao] = useState<string>(
    'Đề nghị cơ quan tiếp nhận thông báo kết quả giải quyết ban đầu bằng văn bản cho Ban Tiếp công dân để theo dõi tiến độ theo quy định.'
  );

  // Danh mục tài liệu bàn giao (mặc định đã chọn đầy đủ 4 tài liệu số hóa)
  const [taiLieuList, setTaiLieuList] = useState<TaiLieuBanGiaoItem[]>([
    {
      id: 'doc-1',
      tenTaiLieu: 'Đơn tố giác / phản ánh bản gốc có chữ ký của người nộp',
      loaiBan: 'ban_chinh',
      soLuong: 1,
      tinhTrang: 'Nguyên vẹn, đầy đủ chữ ký công dân',
      selected: true,
    },
    {
      id: 'doc-2',
      tenTaiLieu: 'Bản sao thẻ CCCD có chứng thực của người gửi đơn',
      loaiBan: 'ban_sao_chung_thuc',
      soLuong: 1,
      tinhTrang: 'Rõ nét, số 001088012345',
      selected: true,
    },
    {
      id: 'doc-3',
      tenTaiLieu: 'Tài liệu, hợp đồng huy động vốn, chứng từ chuyển khoản kèm theo',
      loaiBan: 'ban_sao_chung_thuc',
      soLuong: 12,
      tinhTrang: 'Tập chứng cứ gồm 12 trang có dấu giáp lai',
      selected: true,
    },
    {
      id: 'doc-4',
      tenTaiLieu: 'Phiếu phân loại & Báo cáo kết quả rà soát bước đầu của AI GOVEX',
      loaiBan: 'file_so_hoa',
      soLuong: 1,
      tinhTrang: 'Đã đính kèm trên hệ thống phần mềm',
      selected: true,
    },
  ]);

  // Cấu hình sản phẩm / văn bản bàn giao (Chuẩn hóa Mẫu số 03/TT-TTCP: Phiếu chuyển đơn tố cáo)
  const [taoVanBan, setTaoVanBan] = useState<boolean>(true);
  const [loaiVanBan, setLoaiVanBan] = useState<'phieu_chuyen_don_to_cao' | 'bien_ban_ban_giao' | 'phieu_chuyen_don'>('phieu_chuyen_don_to_cao');
  const [soKyHieu, setSoKyHieu] = useState<string>('15/PC-TCD');
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // Trạng thái thu gọn/mở rộng Tùy chỉnh chi tiết nâng cao
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Danh sách các cơ quan nhận
  const recipientDepartments = useMemo(() => {
    return [
      ...DEPARTMENTS,
      {
        id: 'ubnd-quan',
        name: 'UBND Quận / Huyện (Bộ phận Một cửa)',
        shortName: 'UBND Quận',
        code: 'UBND-Q',
        leaderName: 'Đ/c Nguyễn Hoàng Nam',
        officerCount: 8,
      },
      {
        id: 'tt-thanh-pho',
        name: 'Thanh tra Thành phố',
        shortName: 'Thanh tra TP',
        code: 'TT-TP',
        leaderName: 'Lê Hồng Minh',
        officerCount: 6,
      },
      {
        id: 'toaan-quan',
        name: 'Tòa án nhân dân Quận / Huyện',
        shortName: 'TAND Quận',
        code: 'TAND-Q',
        leaderName: 'Vũ Đức Thành',
        officerCount: 5,
      },
      {
        id: 'so-xaydung',
        name: 'Sở Xây dựng Thành phố (Thanh tra Sở)',
        shortName: 'Sở Xây dựng',
        code: 'SXD-TP',
        leaderName: 'Trần Văn Long',
        officerCount: 4,
      },
      {
        id: 'so-tnmt',
        name: 'Sở Tài nguyên và Môi trường (Thanh tra Sở)',
        shortName: 'Sở TN&MT',
        code: 'STNMT-TP',
        leaderName: 'Đặng Quốc Huy',
        officerCount: 4,
      },
      {
        id: 'ubkt-dang',
        name: 'Ủy ban Kiểm tra Quận ủy / Thành ủy',
        shortName: 'UBKT Đảng ủy',
        code: 'UBKT-DU',
        leaderName: 'Nguyễn Tiến Dũng',
        officerCount: 4,
      },
    ];
  }, []);

  // Cán bộ nội bộ trong phòng Tiếp dân
  const noiBoOfficers = useMemo(() => {
    return OFFICERS.filter((o) => o.departmentId === 'tiep-dan' && !o.isCurrentUser);
  }, []);

  // Đơn vị đang được chọn
  const currentSelectedDept = useMemo(() => {
    return recipientDepartments.find((d) => d.id === selectedDonViId) || recipientDepartments[0];
  }, [recipientDepartments, selectedDonViId]);

  // Cán bộ nội bộ đang được chọn
  const currentSelectedOfficer = useMemo(() => {
    return noiBoOfficers.find((o) => o.id === selectedCanBoNoiBoId) || noiBoOfficers[0];
  }, [noiBoOfficers, selectedCanBoNoiBoId]);

  // Handler: Khi thay đổi Dropdown Cơ quan tiếp nhận
  const handleSelectAgency = (deptId: string) => {
    if (deptId === 'can_bo_noi_bo') {
      setBanGiaoType('can_bo_noi_bo');
      setSelectedReasonKey('phan_cong_noi_bo');
      setLyDoChiTiet(`Bàn giao hồ sơ nội bộ cho cán bộ ${currentSelectedOfficer?.name || 'chuyên viên'} trực tiếp thụ lý giải quyết theo phân công nhiệm vụ của phòng.`);
      setCanCuPhapLy('Quy chế làm việc nội bộ của Ban Tiếp công dân; Thông tư 05/2021/TT-TTCP.');
      return;
    }

    setBanGiaoType('don_vi_khac');
    setSelectedDonViId(deptId);

    // Tự động tìm lý do tương ứng với cơ quan được chọn
    const matchedReason = TRANSFER_REASONS.find((r) => r.targetDeptId === deptId);
    if (matchedReason) {
      setSelectedReasonKey(matchedReason.id);
      setLyDoChiTiet(matchedReason.lyDo);
      setCanCuPhapLy(matchedReason.canCu);
    } else {
      const dept = recipientDepartments.find((d) => d.id === deptId);
      if (dept) {
        setLyDoChiTiet(`Hồ sơ thuộc thẩm quyền giải quyết của ${dept.name}. Căn cứ Điều 12, Điều 26 Luật Tố cáo 2018 và Thông tư 05/2021/TT-TTCP, chuyển toàn bộ tài liệu để thụ lý giải quyết theo thẩm quyền.`);
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.donVi;
      delete next.canBo;
      return next;
    });
  };

  // Handler: Khi thay đổi Dropdown Lý do chuyển thẩm quyền
  const handleSelectReason = (reasonId: string) => {
    setSelectedReasonKey(reasonId);
    const item = TRANSFER_REASONS.find((r) => r.id === reasonId);
    if (!item) return;

    setLyDoChiTiet(item.lyDo);
    setCanCuPhapLy(item.canCu);

    // Nếu lý do tương ứng với cơ quan cụ thể, tự động đồng bộ sang cơ quan đó
    if (item.targetDeptId === 'can_bo_noi_bo') {
      setBanGiaoType('can_bo_noi_bo');
    } else if (item.targetDeptId) {
      setBanGiaoType('don_vi_khac');
      setSelectedDonViId(item.targetDeptId);
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.lyDo;
      return next;
    });
  };

  // Toggle chọn tài liệu
  const handleToggleTaiLieu = (id: string) => {
    setTaiLieuList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  // Cập nhật số lượng tài liệu
  const handleUpdateSoLuong = (id: string, qty: number) => {
    setTaiLieuList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, soLuong: Math.max(1, qty) } : it))
    );
  };

  // Kiểm tra ràng buộc dữ liệu bắt buộc (Validation)
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (banGiaoType === 'don_vi_khac') {
      if (!selectedDonViId) {
        errs.donVi = 'Vui lòng chọn cơ quan / đơn vị tiếp nhận bàn giao.';
      }
    } else {
      if (!selectedCanBoNoiBoId) {
        errs.canBo = 'Vui lòng chọn cán bộ chuyên môn trong phòng nhận bàn giao.';
      }
    }

    if (!lyDoChiTiet.trim()) {
      errs.lyDo = 'Bắt buộc nhập lý do và căn cứ bàn giao hồ sơ đơn.';
    }

    const selectedDocs = taiLieuList.filter((d) => d.selected);
    if (selectedDocs.length === 0) {
      errs.taiLieu = 'Bắt buộc chọn ít nhất 01 tài liệu trong danh mục hồ sơ bàn giao.';
    }

    if (taoVanBan && !soKyHieu.trim()) {
      errs.soKyHieu = 'Vui lòng nhập số / ký hiệu văn bản bàn giao.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Xử lý xác nhận bàn giao
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveTab('form');
      return;
    }

    setIsSubmitting(true);

    const selectedCanBo = noiBoOfficers.find((o) => o.id === selectedCanBoNoiBoId);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        stepId: 'STEP-03C',
        huongXuLy: 'ban_giao',
        banGiaoType,
        donViNhanId: banGiaoType === 'don_vi_khac' ? selectedDonViId : undefined,
        donViNhanName: banGiaoType === 'don_vi_khac' ? currentSelectedDept.name : undefined,
        phongBanNhan: banGiaoType === 'don_vi_khac' ? phongBanNhan : undefined,
        canBoDauMoi: banGiaoType === 'don_vi_khac' ? canBoDauMoi : undefined,
        phuongThucChuyen,
        canBoNhanId: banGiaoType === 'can_bo_noi_bo' ? selectedCanBoNoiBoId : undefined,
        canBoNhan: selectedCanBo,
        lyDoBanGiao: lyDoChiTiet.trim(),
        canCuPhapLy: canCuPhapLy.trim(),
        ghiChuBanGiao: ghiChuBanGiao.trim(),
        thoiHanTiepNhan,
        danhMucTaiLieu: taiLieuList.filter((d) => d.selected),
        cauHinhVanBan: {
          taoVanBan,
          loaiVanBan,
          soKyHieu: soKyHieu.trim(),
          ngayLap: todayStr,
          nguoiLap: currentOfficerName,
        },
      });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== HEADER ===================== */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wider font-label-technical">
                  STEP-03C
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                  Cán bộ chuyên môn
                </span>
                <span className="text-xs text-amber-700 font-semibold hidden sm:inline-block">
                  • Hướng xử lý: Chuyển thẩm quyền
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline-md tracking-tight mt-0.5">
                Chuyển thẩm quyền xử lý đơn tố cáo (Mẫu số 03/TT-TTCP)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher: Lập thông tin vs Xem trước văn bản */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'form'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Thông tin chuyển</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'preview'
                  ? 'bg-white text-amber-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Xem trước Phiếu chuyển (Mẫu 03)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ===================== HỒ SƠ TÓM TẮT BANNER ===================== */}
        <div className="bg-amber-50/60 border-b border-amber-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-950 font-label-technical flex items-center gap-1">
              <span className="material-symbols-outlined text-amber-700 text-[16px]">folder_open</span>
              {donInfo.code || donInfo.luotNhanId}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700">
              Người nộp: <strong className="text-slate-900">{donInfo.nguoiNop}</strong> ({donInfo.sdt || '0983 123 456'})
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-700 hidden sm:inline truncate max-w-xs">
              Loại: <strong className="text-slate-900">{donInfo.loaiDon}</strong>
            </span>
          </div>
          <div className="text-[11px] text-amber-800 font-medium">
            Cán bộ lập: <strong>{currentOfficerName}</strong> ({currentDepartmentName})
          </div>
        </div>

        {/* ===================== BODY CONTENT ===================== */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Thông tin đơn tố cáo và cơ quan tiếp nhận
                    </h3>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[17px] text-amber-700">account_balance</span>
                      <span>Cơ quan / Đơn vị tiếp nhận thẩm quyền:</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Chọn đúng thẩm quyền theo phân cấp</span>
                  </div>

                  <select
                    value={banGiaoType === 'can_bo_noi_bo' ? 'can_bo_noi_bo' : selectedDonViId}
                    onChange={(e) => handleSelectAgency(e.target.value)}
                    className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
                  >
                    <optgroup label="Đề xuất phù hợp với hồ sơ">
                      <option value="pc03">
                        Cơ quan CSĐT (PC03) - Công an TP. Hà Nội
                      </option>
                    </optgroup>

                    <optgroup label="Cơ quan Điều tra &amp; Tư pháp">
                      <option value="pc03">Cơ quan CSĐT (PC03) - Công an Thành phố</option>
                      <option value="toaan-quan">Tòa án nhân dân Quận / Huyện (Tố tụng Dân sự / Hành chính)</option>
                    </optgroup>

                    <optgroup label="Cơ quan Hành chính &amp; Quản lý Nhà nước">
                      <option value="ubnd-quan">UBND Quận / Huyện (Bộ phận Một cửa - Quản lý CBCCVC cấp dưới)</option>
                    </optgroup>

                    <optgroup label="Thanh tra các cấp">
                      <option value="tt-thanh-pho">Thanh tra Thành phố (Thanh tra liên cấp, phức tạp)</option>
                    </optgroup>

                    <optgroup label="Sở ngành chuyên môn">
                      <option value="so-xaydung">Sở Xây dựng Thành phố (Thanh tra Sở)</option>
                      <option value="so-tnmt">Sở Tài nguyên và Môi trường (Thanh tra Sở)</option>
                    </optgroup>

                    <optgroup label="Cơ quan của Đảng">
                      <option value="ubkt-dang">Ủy ban Kiểm tra Quận ủy / Thành ủy (Tố cáo đảng viên)</option>
                    </optgroup>

                    <optgroup label="Nội bộ Ban Tiếp công dân">
                      <option value="can_bo_noi_bo">
                        Cán bộ chuyên môn cùng phòng (Bàn giao nội bộ)
                      </option>
                    </optgroup>
                  </select>


                </div>

                {banGiaoType === 'can_bo_noi_bo' && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 animate-fade-in">
                    <label className="block text-xs font-bold text-amber-950 mb-1.5">
                      Chọn chuyên viên cùng phòng nhận thụ lý:
                    </label>
                    <select
                      value={selectedCanBoNoiBoId}
                      onChange={(e) => {
                        const officerId = e.target.value;
                        setSelectedCanBoNoiBoId(officerId);
                        const officer = noiBoOfficers.find((o) => o.id === officerId);
                        if (officer) {
                          setLyDoChiTiet(`Bàn giao hồ sơ nội bộ cho cán bộ ${officer.name} (${officer.role}) trực tiếp thụ lý giải quyết theo phân công nhiệm vụ chuyên môn của phòng.`);
                        }
                      }}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {noiBoOfficers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} - {o.role} ({o.workloadCount} việc đang xử lý)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dropdown 2: Lý do chuyển thẩm quyền xử lý theo quy định thực tế */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[17px] text-amber-700">fact_check</span>
                      <span>Lý do chuyển thẩm quyền xử lý đơn tố cáo:</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Chọn 1 lý do (Tự động điền căn cứ Điều 12 Luật Tố cáo)</span>
                  </div>

                  <select
                    value={selectedReasonKey}
                    onChange={(e) => handleSelectReason(e.target.value)}
                    className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
                  >
                    {TRANSFER_REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                  className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-[18px]">tune</span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Tùy chỉnh chi tiết nâng cao (Nhấp để mở rộng nếu cần sửa)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                      Tùy chọn
                    </span>
                  </div>
                  <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform duration-200 ${showAdvancedConfig ? 'rotate-180' : ''
                    }`}>
                    expand_more
                  </span>
                </button>

                {showAdvancedConfig && (
                  <div className="p-2 space-y-4 bg-white text-xs animate-fade-in">
                    {/* Danh mục tài liệu bàn giao */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-700">inventory_2</span>
                          <span>Danh mục tài liệu chuyển kèm ({taiLieuList.filter((d) => d.selected).length}/{taiLieuList.length})</span>
                        </label>
                        <span className="text-[11px] text-slate-500">Được in trong Phiếu chuyển đơn</span>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                              <th className="p-2 pl-3 w-10 text-center">Chọn</th>
                              <th className="p-2">Tên tài liệu / Hồ sơ</th>
                              <th className="p-2 w-28">Loại bản</th>
                              <th className="p-2 w-16 text-center">Số lượng</th>
                              <th className="p-2 hidden sm:table-cell">Tình trạng niêm phong</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {taiLieuList.map((doc) => (
                              <tr
                                key={doc.id}
                                className={`hover:bg-slate-50/80 transition-colors ${doc.selected ? 'bg-amber-50/30' : 'opacity-60'
                                  }`}
                              >
                                <td className="p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={doc.selected}
                                    onChange={() => handleToggleTaiLieu(doc.id)}
                                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-2 font-medium text-slate-800">
                                  <span onClick={() => handleToggleTaiLieu(doc.id)} className="cursor-pointer">
                                    {doc.tenTaiLieu}
                                  </span>
                                </td>
                                <td className="p-2 text-slate-600">
                                  {doc.loaiBan === 'ban_chinh' && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10.5px]">
                                      Bản chính
                                    </span>
                                  )}
                                  {doc.loaiBan === 'ban_sao_chung_thuc' && (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium text-[10.5px]">
                                      Sao chứng thực
                                    </span>
                                  )}
                                  {doc.loaiBan === 'file_so_hoa' && (
                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-medium text-[10.5px]">
                                      Số hóa PDF
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={doc.soLuong}
                                    onChange={(e) => handleUpdateSoLuong(doc.id, parseInt(e.target.value) || 1)}
                                    className="w-12 p-1 text-center bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-amber-500 font-semibold"
                                  />
                                </td>
                                <td className="p-2 text-slate-500 text-[11px] hidden sm:table-cell">
                                  {doc.tinhTrang}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* ===================== TAB 2: XEM TRƯỚC VĂN BẢN (A4 DOCUMENT PREVIEW THEO MẪU SỐ 03/TT-TTCP) ===================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-xl">print</span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Xem trước bản in thể thức chuẩn: Phiếu chuyển đơn tố cáo (Mẫu số 03 - Thông tư số 05/2021/TT-TTCP)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>In biểu mẫu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                </div>
              </div>

              {/* Tờ A4 Mockup Chuẩn Mẫu số 03 - Thông tư 05/2021/TT-TTCP */}
              <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-3xl mx-auto font-serif text-slate-900 space-y-6 text-sm leading-relaxed">
                {/* Quốc hiệu tiêu ngữ */}
                <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-300">
                  <div>
                    <p className="font-bold text-xs uppercase">{currentDepartmentName.toUpperCase()}</p>
                    <p className="font-bold text-xs">BỘ PHẬN TIẾP DÂN &amp; XỬ LÝ ĐƠN</p>
                    <p className="text-[11px] font-sans mt-1">Số: {soKyHieu || '...../PC-TCD'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs underline decoration-1 underline-offset-4">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic font-sans mt-1">Hà Nội, ngày {todayStr.split('/')[0]} tháng {todayStr.split('/')[1]} năm {todayStr.split('/')[2]}</p>
                  </div>
                </div>

                {/* Tiêu đề văn bản */}
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                    PHIẾU CHUYỂN ĐƠN TỐ CÁO
                  </h1>
                  <p className="text-[11px] italic font-sans text-slate-500">
                    (Mẫu số 03 ban hành kèm theo Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ)
                  </p>
                </div>

                {/* Kính gửi */}
                <div className="text-center font-sans font-bold text-xs">
                  <p>Kính gửi: {banGiaoType === 'don_vi_khac' ? currentSelectedDept.name.toUpperCase() : 'LÃNH ĐẠO PHÒNG TIẾP CÔNG DÂN'}</p>
                </div>

                {/* Nội dung Phiếu chuyển */}
                <div className="space-y-3 font-sans text-xs text-justify">
                  <p>
                    Ngày {donInfo.ngayNhan || '16/09/2026'}, {currentDepartmentName} nhận được đơn của ông/bà <strong>{donInfo.nguoiNop}</strong> (Số CCCD: {donInfo.cccd || '001088012345'}, cư trú tại: {donInfo.diaChi || 'Cầu Giấy, Hà Nội'}).
                  </p>

                  <p>
                    Nội dung đơn: <em>&quot;{donInfo.noiDung}&quot;</em>.
                  </p>

                  <p>
                    Căn cứ Luật Tố cáo năm 2018 và Thông tư số 05/2021/TT-TTCP ngày 01/10/2021 của Thanh tra Chính phủ quy định quy trình xử lý đơn khiếu nại, tố cáo, kiến nghị, phản ánh;
                  </p>

                  <p>
                    Sau khi xem xét nội dung đơn, căn cứ quy định về thẩm quyền giải quyết tố cáo tại <strong>{canCuPhapLy}</strong>, {currentDepartmentName} nhận thấy đơn tố cáo nêu trên thuộc thẩm quyền giải quyết của Quý cơ quan.
                  </p>

                  <div className="p-3 bg-slate-50 border-l-2 border-amber-500 rounded-r text-slate-800 italic leading-relaxed">
                    <strong>Lý do chuyển đơn: </strong> &quot;{lyDoChiTiet}&quot;
                  </div>

                  <p>
                    {currentDepartmentName} chuyển đơn tố cáo của ông/bà {donInfo.nguoiNop} cùng các tài liệu kèm theo đến <strong>{banGiaoType === 'don_vi_khac' ? currentSelectedDept.name : currentSelectedOfficer?.name}</strong> để xem xét, giải quyết theo quy định của pháp luật và thông báo kết quả giải quyết cho cơ quan chuyển đơn được biết.
                  </p>
                </div>

                {/* Danh mục tài liệu gửi kèm */}
                <div className="font-sans text-xs space-y-1 pt-1">
                  <strong>Tài liệu kèm theo chuyển gồm:</strong>
                  <ul className="list-disc list-inside pl-2 space-y-0.5 text-slate-700">
                    {taiLieuList.filter((d) => d.selected).map((doc, idx) => (
                      <li key={idx}>
                        {doc.tenTaiLieu} ({doc.loaiBan === 'ban_chinh' ? 'Bản chính' : 'Bản sao'}, {doc.soLuong} bản)
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lưu ý nghiệp vụ & Chữ ký */}
                <div className="grid grid-cols-2 gap-8 pt-6 font-sans">
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p className="font-bold text-xs text-slate-800">Nơi nhận:</p>
                    <p>- Như trên (để giải quyết);</p>
                    <p>- Người gửi đơn (để biết);</p>
                    <p>- Lãnh đạo Ban (để báo cáo);</p>
                    <p>- Lưu: VT, Hồ sơ ({soKyHieu}).</p>
                    <p className="pt-2 text-[10px] text-slate-400 italic">
                      * Giữ bí mật thông tin người tố cáo theo quy định pháp luật.
                    </p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="font-bold text-xs uppercase">NGƯỜI XỬ LÝ ĐƠN / LÃNH ĐẠO PHÒNG</p>
                    <p className="text-[11px] italic text-slate-500">(Ký số, xác thực điện tử)</p>
                    <div className="h-16 flex items-center justify-center">
                      <div className="px-3 py-1 bg-amber-50 border border-dashed border-amber-300 text-amber-800 text-[10.5px] rounded font-mono font-bold leading-tight">
                        <div>ĐÃ KÝ SỐ ĐIỆN TỬ VGCA</div>
                        <div className="text-[9.5px] text-slate-500 mt-0.5">{currentOfficerName} • {todayStr}</div>
                      </div>
                    </div>
                    <p className="font-bold text-xs text-slate-900">{currentOfficerName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER BUTTONS ===================== */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-600">bolt</span>
            <span>Chế độ 1 chạm: Đã điền sẵn đầy đủ căn cứ, Phiếu chuyển Mẫu 03 và chữ ký số.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy bỏ
            </button>

            {activeTab === 'preview' ? (
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Quay lại biểu mẫu
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (validateForm()) setActiveTab('preview');
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Xem trước Mẫu 03</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">forward</span>
              <span>{isSubmitting ? 'Đang chuyển hồ sơ...' : 'Xác nhận chuyển thẩm quyền'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
