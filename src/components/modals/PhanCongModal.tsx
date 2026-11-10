import React, { useState, useMemo, useEffect } from 'react';
import {
  DEPARTMENTS,
  OFFICERS,
  Officer,
  TiepNhanDonItem,
} from '../../constants/departments';
import {
  AssignedVerificationTask,
  AssignmentHistoryEntry,
  CoordiOfficerAssignment,
  PhanCongRecord,
  calculateConfiguredDeadlineDate,
  getAiSuggestedVerificationTemplates,
  getAuthorizedDepartmentsForDon,
  getOfficersByAuthorizedDepartment,
  getPhanCongRecordByDonCode,
  savePhanCongRecord,
} from '../../services/phanCongService';

export interface PhanCongSubmitData {
  itemIds: string[];
  canBo: Officer;
  ghiChu: string;
  phanCongRecord?: PhanCongRecord;
  isDraft?: boolean;
}

interface PhanCongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PhanCongSubmitData) => void;
  itemsToAssign: TiepNhanDonItem[];
  currentDepartmentId?: string;
  departmentName?: string;
  existingRecord?: PhanCongRecord | null;
  taiLieuDinhKem?: { name: string; size: string }[];
  nguoiPhanCongName?: string;
  nguoiPhanCongChucVu?: string;
  nguoiBiToGiac?: string;
  onSaveRecord?: (record: PhanCongRecord, isDraft: boolean) => void;
}

interface EditableVerificationItem {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  aiSuggested: boolean;
  isEditing?: boolean;
}

export default function PhanCongModal({
  isOpen,
  onClose,
  onSubmit,
  itemsToAssign,
  currentDepartmentId = 'pc03',
  existingRecord: externalExistingRecord,
  taiLieuDinhKem,
  nguoiPhanCongName = 'Trần Văn Hùng',
  nguoiPhanCongChucVu = 'Thủ trưởng / Lãnh đạo đơn vị có thẩm quyền phân công',
  nguoiBiToGiac,
  onSaveRecord,
}: PhanCongModalProps) {
  const singleItem = itemsToAssign[0];
  const isBulk = itemsToAssign.length > 1;
  const isLuotNhanItem = useMemo(() => {
    const code = (singleItem?.code || '').toUpperCase();
    const loai = (singleItem?.loaiDon || '').toLowerCase();
    return code.startsWith('LN') || code.startsWith('LR') || loai.includes('lượt nhận');
  }, [singleItem?.code, singleItem?.loaiDon]);

  // Lấy bản ghi phân công hiện có (nếu có) để hỗ trợ thay đổi phân công mà không mất kết quả xác minh
  const existingRecord = useMemo(() => {
    if (externalExistingRecord !== undefined) return externalExistingRecord;
    if (singleItem?.code) return getPhanCongRecordByDonCode(singleItem.code);
    return null;
  }, [externalExistingRecord, singleItem?.code, isOpen]);

  // Danh sách đơn vị hợp lệ từ hệ thống
  const authorizedDepartments = useMemo(
    () => getAuthorizedDepartmentsForDon(singleItem?.loaiDon),
    [singleItem?.loaiDon]
  );

  // State B: Thông tin phân công
  const [selectedDeptId, setSelectedDeptId] = useState<string>(currentDepartmentId);
  const [selectedLeadOfficerId, setSelectedLeadOfficerId] = useState<string>('');
  const [leadOfficerRoleInTask, setLeadOfficerRoleInTask] = useState<string>(
    'Cán bộ điều tra phụ trách chính (Chủ trì xác minh)'
  );
  const [coordOfficers, setCoordOfficers] = useState<CoordiOfficerAssignment[]>([]);
  const [coordDeptFilterId, setCoordDeptFilterId] = useState<string>('ALL');
  const [searchOfficerQuery, setSearchOfficerQuery] = useState<string>('');

  const todayFormatted = useMemo(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  }, []);

  const [ngayPhanCong, setNgayPhanCong] = useState<string>(todayFormatted);
  const [thoiHanBaoCao, setThoiHanBaoCao] = useState<string>('');
  const [mucDoUuTien, setMucDoUuTien] = useState<'thuong' | 'khan' | 'hoa_toc'>('khan');
  const [lyDoThayDoiCanBo, setLyDoThayDoiCanBo] = useState<string>('');

  // State C: Nội dung phân công & yêu cầu xử lý
  const [loaiMauNghiepVuOverride, setLoaiMauNghiepVuOverride] = useState<string>('');
  const [verificationItems, setVerificationItems] = useState<EditableVerificationItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [showAddTaskForm, setShowAddTaskForm] = useState<boolean>(false);
  const [chiDaoRieng, setChiDaoRieng] = useState<string>('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Gợi ý AI dựa trên loại đơn hoặc lượt nhận
  const aiSuggestionPack = useMemo(() => {
    const effectiveLoaiDon =
      loaiMauNghiepVuOverride ||
      (isLuotNhanItem ? 'Lượt nhận hồ sơ' : singleItem?.loaiDon || '');
    return getAiSuggestedVerificationTemplates(
      effectiveLoaiDon,
      singleItem?.noiDungTomTat,
      singleItem?.nguoiNop
    );
  }, [
    loaiMauNghiepVuOverride,
    isLuotNhanItem,
    singleItem?.loaiDon,
    singleItem?.noiDungTomTat,
    singleItem?.nguoiNop,
  ]);

  // Khởi tạo dữ liệu khi mở popup
  useEffect(() => {
    if (!isOpen || !singleItem) return;
    setValidationError(null);
    setLyDoThayDoiCanBo('');

    if (existingRecord) {
      setSelectedDeptId(existingRecord.donViXuLyId);
      setSelectedLeadOfficerId(existingRecord.canBoPhuTrachId);
      setLeadOfficerRoleInTask(existingRecord.vaiTroCanBoPhuTrach);
      setCoordOfficers(existingRecord.canBoPhoiHop || []);
      setNgayPhanCong(existingRecord.ngayPhanCong || todayFormatted);
      setThoiHanBaoCao(existingRecord.thoiHanBaoCao);
      setMucDoUuTien(existingRecord.mucDoUuTien || 'khan');
      setChiDaoRieng(existingRecord.chiDaoRieng || '');
      setVerificationItems(
        existingRecord.verificationTasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          selected: true,
          aiSuggested: t.aiSuggested,
        }))
      );
    } else {
      // Nếu là lượt nhận thì ưu tiên Phòng Tiếp công dân, nếu đơn tố giác tội phạm thì ưu tiên PC03
      const isToGiac =
        !isLuotNhanItem &&
        ((singleItem.loaiDon || '').toLowerCase().includes('tố giác') ||
          (singleItem.loaiDon || '').toLowerCase().includes('tội phạm') ||
          (singleItem.noiDungTomTat || '').toLowerCase().includes('tố giác'));
      const defaultDept = isLuotNhanItem
        ? currentDepartmentId || 'tiep-dan'
        : isToGiac
          ? 'pc03'
          : currentDepartmentId || 'tiep-dan';
      setSelectedDeptId(defaultDept);

      const deptOfficers = getOfficersByAuthorizedDepartment(defaultDept);
      const defaultOfficer =
        deptOfficers.find((o) => !o.isLeader) || deptOfficers[0] || null;
      setSelectedLeadOfficerId(defaultOfficer ? defaultOfficer.id : '');
      setLeadOfficerRoleInTask(
        isLuotNhanItem
          ? 'Cán bộ tiếp nhận & phân loại lượt nhận hồ sơ'
          : isToGiac
            ? 'Điều tra viên thụ lý chính (Chủ trì xác minh nguồn tin)'
            : 'Cán bộ chuyên môn phụ trách chính (Chủ trì xác minh)'
      );
      setCoordOfficers([]);
      setNgayPhanCong(todayFormatted);

      const pack = getAiSuggestedVerificationTemplates(
        isLuotNhanItem ? 'Lượt nhận hồ sơ' : singleItem.loaiDon,
        singleItem.noiDungTomTat,
        singleItem.nguoiNop
      );
      const calculatedDeadline = calculateConfiguredDeadlineDate(
        pack.soNgayQuyDinh,
        todayFormatted
      );
      setThoiHanBaoCao(calculatedDeadline);
      setMucDoUuTien(isToGiac ? 'khan' : 'thuong');
      setChiDaoRieng(
        isLuotNhanItem
          ? `Đề nghị cán bộ được phân công kiểm tra kết quả bóc tách OCR, phân loại tài liệu của lượt nhận ${singleItem.code} (${singleItem.nguoiNop}) và xác nhận tiếp nhận/ghép đơn đúng thời hạn.`
          : `Đề nghị cán bộ phụ trách chủ trì phối hợp xác minh làm rõ các nội dung được giao đối với đơn ${singleItem.code} của ông/bà ${singleItem.nguoiNop}, lập báo cáo đề xuất trình lãnh đạo đúng thời hạn quy định.`
      );
      setVerificationItems(
        pack.templates.map((tpl) => ({
          id: tpl.id,
          title: tpl.title,
          description: tpl.description,
          selected: tpl.defaultSelected,
          aiSuggested: true,
        }))
      );
    }
  }, [isOpen, singleItem?.code, existingRecord]);

  // Lọc cán bộ thuộc đúng đơn vị xử lý đã chọn (Mục 3.B & Mục 7: Chỉ hiển thị cán bộ thuộc đơn vị được phép nhận phân công)
  const departmentOfficers = useMemo(() => {
    return getOfficersByAuthorizedDepartment(selectedDeptId);
  }, [selectedDeptId]);

  const filteredLeadOfficers = useMemo(() => {
    if (!searchOfficerQuery.trim()) return departmentOfficers;
    const q = searchOfficerQuery.toLowerCase().trim();
    return departmentOfficers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q) ||
        (o.phone && o.phone.includes(q))
    );
  }, [departmentOfficers, searchOfficerQuery]);

  const selectedDepartmentObj = useMemo(
    () => authorizedDepartments.find((d) => d.id === selectedDeptId) || authorizedDepartments[0],
    [authorizedDepartments, selectedDeptId]
  );

  const selectedLeadOfficerObj = useMemo(
    () => departmentOfficers.find((o) => o.id === selectedLeadOfficerId) || null,
    [departmentOfficers, selectedLeadOfficerId]
  );

  // Danh sách cán bộ có thể chọn làm cán bộ phối hợp (loại trừ cán bộ phụ trách chính)
  const availableCoordOfficers = useMemo(() => {
    return OFFICERS.filter((o) => {
      if (o.id === selectedLeadOfficerId) return false;
      if (coordDeptFilterId !== 'ALL' && o.departmentId !== coordDeptFilterId) return false;
      return true;
    });
  }, [selectedLeadOfficerId, coordDeptFilterId]);

  // Kiểm tra xem có đang thay đổi cán bộ phụ trách so với phân công trước đó không
  const isChangingLeadOfficer = useMemo(() => {
    if (!existingRecord || existingRecord.isDraft) return false;
    return (
      Boolean(existingRecord.canBoPhuTrachId) &&
      Boolean(selectedLeadOfficerId) &&
      existingRecord.canBoPhuTrachId !== selectedLeadOfficerId
    );
  }, [existingRecord, selectedLeadOfficerId]);

  // Khi đổi đơn vị xử lý, kiểm tra cán bộ phụ trách có thuộc đơn vị mới không
  const handleSelectDepartment = (newDeptId: string) => {
    setSelectedDeptId(newDeptId);
    const nextOfficers = getOfficersByAuthorizedDepartment(newDeptId);
    if (!nextOfficers.some((o) => o.id === selectedLeadOfficerId)) {
      const firstValid = nextOfficers.find((o) => !o.isLeader) || nextOfficers[0];
      setSelectedLeadOfficerId(firstValid ? firstValid.id : '');
    }
    setValidationError(null);
  };

  // Áp dụng bộ mẫu nội dung xác minh theo loại đơn
  const handleSwitchTemplatePack = (mode: string) => {
    setLoaiMauNghiepVuOverride(mode);
    const pack = getAiSuggestedVerificationTemplates(
      mode,
      singleItem?.noiDungTomTat,
      singleItem?.nguoiNop
    );
    setVerificationItems(
      pack.templates.map((tpl) => ({
        id: tpl.id,
        title: tpl.title,
        description: tpl.description,
        selected: true,
        aiSuggested: true,
      }))
    );
    setThoiHanBaoCao(calculateConfiguredDeadlineDate(pack.soNgayQuyDinh, ngayPhanCong));
  };

  // Bật/tắt cán bộ phối hợp
  const handleToggleCoordOfficer = (officer: Officer) => {
    setCoordOfficers((prev) => {
      const exists = prev.some((c) => c.officerId === officer.id);
      if (exists) {
        return prev.filter((c) => c.officerId !== officer.id);
      }
      return [
        ...prev,
        {
          officerId: officer.id,
          officerName: officer.name,
          officerRole: officer.role,
          departmentId: officer.departmentId,
          departmentName: officer.departmentName,
          assignedRoleInTask: 'Cán bộ điều tra / Chuyên viên phối hợp xác minh',
        },
      ];
    });
  };

  const handleUpdateCoordRole = (officerId: string, newRole: string) => {
    setCoordOfficers((prev) =>
      prev.map((c) => (c.officerId === officerId ? { ...c, assignedRoleInTask: newRole } : c))
    );
  };

  // Thao tác trên danh sách nội dung xác minh (Mục 3.C)
  const handleToggleVerificationItem = (id: string) => {
    setVerificationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
    setValidationError(null);
  };

  const handleUpdateVerificationItem = (
    id: string,
    field: 'title' | 'description',
    value: string
  ) => {
    setVerificationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleToggleEditItem = (id: string) => {
    setVerificationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item))
    );
  };

  const handleAddVerificationItem = () => {
    if (!newTaskTitle.trim()) return;
    const nextOrder = verificationItems.length + 1;
    const formattedTitle = /^\d+\./.test(newTaskTitle.trim())
      ? newTaskTitle.trim()
      : `${nextOrder}. ${newTaskTitle.trim()}`;

    setVerificationItems((prev) => [
      ...prev,
      {
        id: `custom-vt-${Date.now()}`,
        title: formattedTitle,
        description:
          newTaskDesc.trim() ||
          'Nội dung xác minh bổ sung theo yêu cầu của người có thẩm quyền phân công.',
        selected: true,
        aiSuggested: false,
      },
    ]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskForm(false);
    setValidationError(null);
  };

  const selectedVerificationItems = useMemo(
    () => verificationItems.filter((item) => item.selected),
    [verificationItems]
  );

  const displayAttachments = useMemo(() => {
    if (taiLieuDinhKem && taiLieuDinhKem.length > 0) return taiLieuDinhKem;
    if (existingRecord?.taiLieuDinhKem && existingRecord.taiLieuDinhKem.length > 0) {
      return existingRecord.taiLieuDinhKem;
    }
    return [
      { name: `Don_goc_${singleItem?.code || 'HS'}.pdf`, size: '1.5 MB' },
      { name: 'Tai_lieu_chung_cu_kem_theo.pdf', size: '2.4 MB' },
    ];
  }, [taiLieuDinhKem, existingRecord, singleItem?.code]);

  // Lưu nháp hoặc Xác nhận phân công (Mục 3.D & Mục 7)
  const handleFinalizeAssignment = (isDraftMode: boolean) => {
    // 1. Kiểm tra cán bộ phụ trách bắt buộc
    if (!selectedLeadOfficerId || !selectedLeadOfficerObj) {
      setValidationError(
        'Bắt buộc phải chọn Cán bộ điều tra / Cán bộ phụ trách thuộc đơn vị xử lý hợp lệ.'
      );
      return;
    }

    // 2. Kiểm tra cán bộ phụ trách thuộc đúng đơn vị được phép nhận phân công
    if (selectedLeadOfficerObj.departmentId !== selectedDeptId) {
      setValidationError(
        'Cán bộ phụ trách được chọn không thuộc đơn vị xử lý hiện tại. Vui lòng chọn cán bộ hợp lệ.'
      );
      return;
    }

    // 3. Kiểm tra phải có ít nhất 1 nội dung xác minh được chọn
    if (!isDraftMode && selectedVerificationItems.length === 0) {
      setValidationError(
        'Vui lòng chọn ít nhất 01 nội dung xác minh / yêu cầu xử lý trước khi xác nhận phân công.'
      );
      return;
    }

    // 4. Nếu thay đổi cán bộ phụ trách so với phân công trước đó, bắt buộc nhập lý do thay đổi
    if (!isDraftMode && isChangingLeadOfficer && !lyDoThayDoiCanBo.trim()) {
      setValidationError(
        'Đơn đã được phân công trước đó cho cán bộ khác. Vui lòng nhập rõ Lý do thay đổi cán bộ phụ trách.'
      );
      return;
    }

    if (!thoiHanBaoCao.trim()) {
      setValidationError('Vui lòng nhập hoặc chọn Thời hạn thực hiện / báo cáo.');
      return;
    }

    const nowTimestamp = `${todayFormatted} ${new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    // Bảo toàn 100% kết quả xác minh đã cập nhật trước đó (Mục 7: Không làm mất kết quả xác minh khi thay đổi cán bộ)
    const existingTaskMap = new Map<string, AssignedVerificationTask>();
    if (existingRecord?.verificationTasks) {
      existingRecord.verificationTasks.forEach((t) => {
        existingTaskMap.set(t.id, t);
        existingTaskMap.set(t.title.toLowerCase(), t);
      });
    }

    const mergedVerificationTasks: AssignedVerificationTask[] = (
      selectedVerificationItems.length > 0 ? selectedVerificationItems : verificationItems.slice(0, 1)
    ).map((item, idx) => {
      const prevTask =
        existingTaskMap.get(item.id) || existingTaskMap.get(item.title.toLowerCase());
      return {
        id: prevTask?.id || item.id,
        order: idx + 1,
        title: item.title,
        description: item.description,
        aiSuggested: item.aiSuggested,
        status: prevTask ? prevTask.status : 'chua_thuc_hien',
        resultText: prevTask ? prevTask.resultText : '',
        unverifiedContentAndReason: prevTask ? prevTask.unverifiedContentAndReason : '',
        attachments: prevTask ? prevTask.attachments : [],
        updatedAt: prevTask?.updatedAt,
        updatedBy: prevTask?.updatedBy,
        versionHistory: prevTask ? prevTask.versionHistory : [],
      };
    });

    const newHistoryEntry: AssignmentHistoryEntry = {
      id: `hist-pc-${Date.now()}`,
      timestamp: nowTimestamp,
      actionType: isDraftMode
        ? 'luu_nhap'
        : isChangingLeadOfficer
          ? 'thay_doi_can_bo'
          : 'phan_cong_moi',
      title: isDraftMode
        ? 'Lưu bản nháp thông tin phân công xử lý đơn'
        : isChangingLeadOfficer
          ? `Thay đổi cán bộ phụ trách từ ${existingRecord?.canBoPhuTrachName} sang ${selectedLeadOfficerObj.name}`
          : 'Phân công xử lý & giao nhiệm vụ xác minh đơn',
      actorName: nguoiPhanCongName,
      actorRole: nguoiPhanCongChucVu,
      leadOfficerName: selectedLeadOfficerObj.name,
      leadOfficerRole: `${selectedLeadOfficerObj.role} - ${leadOfficerRoleInTask}`,
      previousLeadOfficerName: isChangingLeadOfficer
        ? existingRecord?.canBoPhuTrachName
        : undefined,
      changeReason: isChangingLeadOfficer ? lyDoThayDoiCanBo.trim() : undefined,
      coordinatingOfficers: coordOfficers.map(
        (c) => `${c.officerName} (${c.assignedRoleInTask})`
      ),
      deadline: thoiHanBaoCao,
      summary: isDraftMode
        ? `Lưu nháp phân công cho đ/c ${selectedLeadOfficerObj.name} (${mergedVerificationTasks.length} nội dung xác minh).`
        : `Giao ${mergedVerificationTasks.length} nội dung xác minh cho đ/c ${selectedLeadOfficerObj.name} chủ trì${coordOfficers.length > 0 ? ` và ${coordOfficers.length} cán bộ phối hợp` : ''
        }. Hạn báo cáo: ${thoiHanBaoCao}.`,
    };

    const nextRecord: PhanCongRecord = {
      id: existingRecord?.id || `PC-2026-${singleItem.code.replace(/[^0-9]/g, '') || '001'}`,
      donCode: singleItem.code,
      luotNhanId: singleItem.luotNhanId,
      loaiDon: singleItem.loaiDon,
      nguoiGuiDon: singleItem.nguoiNop,
      ngayTiepNhan: singleItem.ngayNhan,
      noiDungTomTat: singleItem.noiDungTomTat || '',
      donViTiepNhan: singleItem.donViTiepNhan || 'Phòng Tiếp công dân & Xử lý đơn',
      taiLieuDinhKem: displayAttachments,
      nguoiBiToGiac:
        nguoiBiToGiac ||
        existingRecord?.nguoiBiToGiac ||
        'Các cá nhân, tổ chức bị phản ánh/tố giác nêu trong nội dung đơn',
      donViXuLyId: selectedDeptId,
      donViXuLyName: selectedDepartmentObj?.name || 'Đơn vị nghiệp vụ',
      canBoPhuTrachId: selectedLeadOfficerObj.id,
      canBoPhuTrachName: selectedLeadOfficerObj.name,
      canBoPhuTrachChucVu: selectedLeadOfficerObj.role,
      vaiTroCanBoPhuTrach: leadOfficerRoleInTask,
      canBoPhoiHop: coordOfficers,
      nguoiPhanCongName,
      nguoiPhanCongChucVu,
      ngayPhanCong,
      thoiHanBaoCao,
      quyDinhThoiHanText: aiSuggestionPack.canCuPhapLyThoiHan,
      mucDoUuTien,
      chiDaoRieng,
      verificationTasks: mergedVerificationTasks,
      taskStatus: existingRecord?.taskStatus || 'cho_xu_ly',
      isDraft: isDraftMode,
      acceptedByInvestigatorAt: existingRecord?.acceptedByInvestigatorAt,
      baoCaoDeXuatDraft: existingRecord?.baoCaoDeXuatDraft,
      history: [newHistoryEntry, ...(existingRecord?.history || [])],
    };

    savePhanCongRecord(nextRecord);
    if (itemsToAssign.length > 1) {
      itemsToAssign.slice(1).forEach((extraItem) => {
        const extraRec: PhanCongRecord = {
          ...nextRecord,
          id: `PC-2026-${extraItem.code.replace(/[^0-9]/g, '') || Date.now().toString().slice(-3)}`,
          donCode: extraItem.code,
          luotNhanId: extraItem.luotNhanId,
          loaiDon: extraItem.loaiDon,
          nguoiGuiDon: extraItem.nguoiNop,
          ngayTiepNhan: extraItem.ngayNhan,
          noiDungTomTat: extraItem.noiDungTomTat || '',
        };
        savePhanCongRecord(extraRec);
      });
    }
    if (onSaveRecord) {
      onSaveRecord(nextRecord, isDraftMode);
    }

    onSubmit({
      itemIds: itemsToAssign.map((it) => it.id),
      canBo: selectedLeadOfficerObj,
      ghiChu: chiDaoRieng,
      phanCongRecord: nextRecord,
      isDraft: isDraftMode,
    });
  };

  if (!isOpen || itemsToAssign.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================================================================== */}
        {/* HEADER POPUP PHÂN CÔNG XỬ LÝ                                         */}
        {/* ===================================================================== */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C62828] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">assignment_ind</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold tracking-tight uppercase">
                  {isBulk
                    ? `Phân công xử lý hàng loạt (${itemsToAssign.length} hồ sơ)`
                    : existingRecord && !existingRecord.isDraft
                      ? 'Điều chỉnh / Phân công lại cán bộ xử lý'
                      : isLuotNhanItem
                        ? 'Phân công xử lý Lượt nhận cho cán bộ'
                        : 'Phân công xử lý & Xác minh đơn'}
                </h2>
                <span className="px-2 py-0.5 rounded bg-white/15 text-amber-300 font-mono text-[11px] font-bold">
                  {singleItem.code}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-300 mt-0.5">
                Quy trình GOVEX: Giao đơn vị xử lý, phân công cán bộ điều tra/chuyên môn phụ trách, cán bộ phối hợp và các nội dung cần xác minh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* BODY POPUP (4 NHÓM THÔNG TIN A - B - C - D)                            */}
        {/* ===================================================================== */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 bg-slate-50/50">
          {/* ----------------------------------------------------------------- */}
          {/* NHÓM A. THÔNG TIN ĐƠN (CHỈ ĐỌC - MỤC 3.A)                         */}
          {/* ----------------------------------------------------------------- */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 text-white font-bold text-[11px] flex items-center justify-center">
                  A
                </span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isBulk
                    ? `Danh sách Đơn / Lượt nhận phân công hàng loạt (${itemsToAssign.length} hồ sơ)`
                    : isLuotNhanItem
                    ? 'Thông tin Lượt nhận tiếp nhận'
                    : 'Thông tin đơn tiếp nhận'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-600 text-[10.5px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                Chỉ đọc (Lấy từ hồ sơ đã tiếp nhận)
              </span>
            </div>

            {isBulk ? (
              <div className="p-4 space-y-2">
                <div className="max-h-44 overflow-y-auto divide-y divide-slate-200/80 border border-slate-200 rounded-xl bg-slate-50">
                  {itemsToAssign.map((it, idx) => {
                    const isLn =
                      it.code.toUpperCase().startsWith('LN') ||
                      it.code.toUpperCase().startsWith('LR');
                    return (
                      <div
                        key={it.id}
                        className="p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase shrink-0 ${
                              isLn
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            {isLn ? 'LƯỢT NHẬN' : 'ĐƠN'}
                          </span>
                          <span className="font-mono font-bold text-[#C62828] text-xs shrink-0">
                            {it.code}
                          </span>
                          <span className="font-bold text-slate-900 text-xs shrink-0">
                            • {it.nguoiNop}
                          </span>
                          <span className="text-slate-600 text-[11px] truncate">
                            — {it.noiDungTomTat || it.loaiDon}
                          </span>
                        </div>
                        <span className="text-[10.5px] font-medium text-slate-500 shrink-0">
                          {it.ngayNhan}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                  Mã đơn / Mã lượt nhận
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                  {singleItem.code}{' '}
                  {singleItem.luotNhanId ? `(${singleItem.luotNhanId})` : ''}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                  Loại đơn
                </span>
                <span className="font-bold text-[#C62828] text-xs mt-0.5 block">
                  {singleItem.loaiDon || 'Đơn tố giác, tin báo về tội phạm'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                  Người gửi đơn
                </span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                  {singleItem.nguoiNop}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                  Ngày tiếp nhận
                </span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {singleItem.ngayNhan || todayFormatted}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 md:col-span-2">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                  Đơn vị tiếp nhận
                </span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {singleItem.donViTiepNhan || 'Phòng Tiếp công dân & Xử lý đơn'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 md:col-span-3">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                  Nội dung tóm tắt
                </span>
                <p className="text-xs text-slate-800 leading-relaxed mt-1 font-medium">
                  {singleItem.noiDungTomTat ||
                    'Nội dung đơn yêu cầu cơ quan có thẩm quyền xác minh, làm rõ hành vi vi phạm pháp luật và bảo vệ quyền, lợi ích hợp pháp.'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 md:col-span-3">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase block mb-1.5">
                  Tài liệu đính kèm ({displayAttachments.length} tệp)
                </span>
                <div className="flex flex-wrap gap-2">
                  {displayAttachments.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#C62828]">
                        description
                      </span>
                      <span>{file.name}</span>
                      <span className="text-slate-400 text-[10px]">({file.size})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            )}
          </section>

          {/* ----------------------------------------------------------------- */}
          {/* NHÓM B. THÔNG TIN PHÂN CÔNG (MỤC 3.B)                             */}
          {/* ----------------------------------------------------------------- */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#004ac6] text-white font-bold text-[11px] flex items-center justify-center">
                  B
                </span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Thông tin phân công cán bộ xử lý / điều tra
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Dữ liệu cán bộ & đơn vị trích xuất trực tiếp từ danh mục phân quyền hệ thống GOVEX
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Hàng 1: Đơn vị xử lý + Ngày phân công + Thời hạn báo cáo + Mức độ ưu tiên */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Đơn vị xử lý được phân công <span className="text-[#C62828]">*</span>
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => handleSelectDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#004ac6]"
                  >
                    {authorizedDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.code} — {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ngày phân công
                  </label>
                  <input
                    type="text"
                    value={ngayPhanCong}
                    onChange={(e) => setNgayPhanCong(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Thời hạn thực hiện / báo cáo <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={thoiHanBaoCao}
                    onChange={(e) => setThoiHanBaoCao(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#C62828] focus:outline-none focus:border-[#C62828]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={mucDoUuTien}
                    onChange={(e) =>
                      setMucDoUuTien(e.target.value as 'thuong' | 'khan' | 'hoa_toc')
                    }
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value="thuong">Thường</option>
                    <option value="khan">Khẩn</option>
                    <option value="hoa_toc">Hỏa tốc</option>
                  </select>
                </div>
              </div>

              {/* Căn cứ thời hạn theo quy định pháp luật */}
              <div className="px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-[11px] text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#004ac6]">
                    gavel
                  </span>
                  <span>
                    <strong>Căn cứ tính thời hạn:</strong> {aiSuggestionPack.canCuPhapLyThoiHan}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setThoiHanBaoCao(
                      calculateConfiguredDeadlineDate(
                        aiSuggestionPack.soNgayQuyDinh,
                        ngayPhanCong
                      )
                    )
                  }
                  className="text-[#004ac6] hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                >
                  Tính lại ({aiSuggestionPack.soNgayQuyDinh} ngày)
                </button>
              </div>

              {/* Hàng 2: Chọn Cán bộ điều tra phụ trách (Bắt buộc) & Cán bộ phối hợp (Nhiều người) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                {/* Cột trái: Cán bộ điều tra phụ trách (Bắt buộc) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        1. Cán bộ điều tra / Chuyên môn phụ trách{' '}
                        <span className="text-[#C62828]">* (Bắt buộc)</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Chỉ hiển thị cán bộ thuộc {selectedDepartmentObj?.shortName} theo phân quyền
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-[#004ac6] font-bold text-[10.5px]">
                      {departmentOfficers.length} cán bộ hợp lệ
                    </span>
                  </div>

                  {/* Tìm kiếm cán bộ trong đơn vị */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchOfficerQuery}
                      onChange={(e) => setSearchOfficerQuery(e.target.value)}
                      placeholder="Lọc theo họ tên, chức vụ cán bộ..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {filteredLeadOfficers.map((officer) => {
                      const isSelected = selectedLeadOfficerId === officer.id;
                      return (
                        <div
                          key={officer.id}
                          onClick={() => {
                            setSelectedLeadOfficerId(officer.id);
                            setCoordOfficers((prev) =>
                              prev.filter((c) => c.officerId !== officer.id)
                            );
                            setValidationError(null);
                          }}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? 'bg-blue-50 border-[#004ac6] ring-1 ring-[#004ac6]/30'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ${isSelected
                                ? 'bg-[#004ac6] text-white'
                                : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {officer.name
                                .split(' ')
                                .slice(-2)
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs truncate">
                                  {officer.name}
                                </span>
                                {officer.isLeader && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9.5px] font-bold">
                                    Lãnh đạo
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {officer.role} • {officer.phone || 'Nội bộ'}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold shrink-0">
                            {officer.workloadCount} việc
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vai trò của cán bộ phụ trách */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Vai trò nhiệm vụ của Cán bộ phụ trách
                    </label>
                    <input
                      type="text"
                      value={leadOfficerRoleInTask}
                      onChange={(e) => setLeadOfficerRoleInTask(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                    />
                  </div>

                  {/* Nếu thay đổi cán bộ phụ trách so với lần phân công trước: bắt buộc nhập lý do */}
                  {isChangingLeadOfficer && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                        <span className="material-symbols-outlined text-[16px] text-amber-700">
                          swap_horiz
                        </span>
                        <span>
                          Phát hiện thay đổi Cán bộ phụ trách (Từ:{' '}
                          {existingRecord?.canBoPhuTrachName} → {selectedLeadOfficerObj?.name})
                        </span>
                      </div>
                      <p className="text-[10.5px] text-amber-800">
                        Hệ thống sẽ <strong>giữ nguyên 100% kết quả xác minh</strong> đã cập nhật
                        trước đó và ghi nhận lịch sử chuyển giao nhiệm vụ.
                      </p>
                      <input
                        type="text"
                        value={lyDoThayDoiCanBo}
                        onChange={(e) => {
                          setLyDoThayDoiCanBo(e.target.value);
                          setValidationError(null);
                        }}
                        placeholder="Nhập lý do thay đổi cán bộ phụ trách (Bắt buộc)..."
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-400 rounded-md text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Cột phải: Cán bộ phối hợp (Không bắt buộc, chọn nhiều người + vai trò từng người) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        2. Cán bộ phối hợp{' '}
                        <span className="text-slate-400 font-normal">
                          (Không bắt buộc, chọn nhiều người)
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Hỗ trợ chọn cán bộ cùng phòng hoặc phối hợp liên phòng
                      </span>
                    </div>
                    <select
                      value={coordDeptFilterId}
                      onChange={(e) => setCoordDeptFilterId(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-700"
                    >
                      <option value="ALL">Tất cả đơn vị</option>
                      {authorizedDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Danh sách chọn nhanh cán bộ phối hợp */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {availableCoordOfficers.map((officer) => {
                      const assigned = coordOfficers.find((c) => c.officerId === officer.id);
                      return (
                        <div
                          key={officer.id}
                          onClick={() => handleToggleCoordOfficer(officer)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${assigned
                            ? 'bg-indigo-50/80 border-indigo-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={Boolean(assigned)}
                              onChange={() => { }}
                              className="rounded border-slate-300 text-indigo-600"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 text-xs block truncate">
                                {officer.name}
                              </span>
                              <span className="text-[10.5px] text-slate-500 block truncate">
                                {officer.role} • {officer.departmentName}
                              </span>
                            </div>
                          </div>
                          {assigned && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold shrink-0">
                              Đã chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Vai trò của từng cán bộ phối hợp đã chọn */}
                  {coordOfficers.length > 0 ? (
                    <div className="space-y-2 pt-1 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Vai trò của từng cán bộ phối hợp ({coordOfficers.length} người):
                      </span>
                      {coordOfficers.map((co) => (
                        <div
                          key={co.officerId}
                          className="p-2 rounded-lg bg-white border border-slate-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11.5px]">
                              {co.officerName}{' '}
                              <span className="font-normal text-slate-500">
                                ({co.officerRole})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setCoordOfficers((prev) =>
                                  prev.filter((x) => x.officerId !== co.officerId)
                                )
                              }
                              className="text-slate-400 hover:text-[#C62828] cursor-pointer"
                              title="Bỏ chọn"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                close
                              </span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={co.assignedRoleInTask}
                            onChange={(e) =>
                              handleUpdateCoordRole(co.officerId, e.target.value)
                            }
                            placeholder="Nhập vai trò phối hợp cụ thể..."
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-white border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                      Chưa chọn cán bộ phối hợp (Tích chọn ở danh sách trên nếu cần phối hợp)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-[#C62828] font-bold text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* FOOTER ACTIONS: HỦY / LƯU NHÁP / XÁC NHẬN PHÂN CÔNG                   */}
        {/* ===================================================================== */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleFinalizeAssignment(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Lưu nháp</span>
            </button>

            <button
              type="button"
              onClick={() => handleFinalizeAssignment(false)}
              className="px-5 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
              <span>Xác nhận phân công</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
