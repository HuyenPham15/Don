import React, { useState, useMemo } from 'react';
import {
  ASSIGNMENT_TASK_STATUS_CONFIG,
  AssignedVerificationTask,
  AssignmentHistoryEntry,
  AssignmentTaskStatus,
  BaoCaoDeXuatTongHopDraft,
  PhanCongRecord,
  VERIFICATION_ITEM_STATUS_CONFIG,
  VerificationAttachment,
  VerificationItemStatus,
  canUserAssignDon,
  generateAiBaoCaoDeXuatDraft,
  savePhanCongRecord,
} from '../../services/phanCongService';
import { CurrentUserAccount } from '../../types/signing';

interface PhanCongVaXacMinhSectionProps {
  record: PhanCongRecord | null;
  donStatusLabel: string;
  isAwaitingAcceptance?: boolean;
  currentAccount?: CurrentUserAccount;
  onOpenPhanCongModal: () => void;
  onRecordUpdated: (updated: PhanCongRecord) => void;
  onAttachVerificationDocumentToDon?: (attachment: VerificationAttachment, taskTitle: string) => void;
  onSubmitBaoCaoDeXuatToLeader?: (draft: BaoCaoDeXuatTongHopDraft, record: PhanCongRecord) => void;
  onShowToast?: (msg: string) => void;
}

export default function PhanCongVaXacMinhSection({
  record,
  donStatusLabel,
  isAwaitingAcceptance = false,
  currentAccount,
  onOpenPhanCongModal,
  onRecordUpdated,
  onAttachVerificationDocumentToDon,
  onSubmitBaoCaoDeXuatToLeader,
  onShowToast,
}: PhanCongVaXacMinhSectionProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(
    record?.verificationTasks?.[0]?.id || null
  );
  const [showVersionHistoryTaskId, setShowVersionHistoryTaskId] = useState<string | null>(null);
  const [showAttachmentInputTaskId, setShowAttachmentInputTaskId] = useState<string | null>(null);
  const [newAttachmentName, setNewAttachmentName] = useState<string>('');
  const [newAttachmentType, setNewAttachmentType] = useState<
    'bien_ban' | 'hinh_anh' | 'tai_lieu' | 'video' | 'khac'
  >('bien_ban');

  // State bộ soạn thảo Báo cáo đề xuất (Mục 4.D)
  const [activeSubView, setActiveSubView] = useState<
    'xac-minh' | 'bao-cao-de-xuat' | 'lich-su-phan-cong'
  >('xac-minh');
  const [editingDraft, setEditingDraft] = useState<BaoCaoDeXuatTongHopDraft | null>(
    record?.baoCaoDeXuatDraft || null
  );

  // Kiểm tra quyền cập nhật kết quả xác minh (Mục 7: Chỉ cán bộ được giao hoặc được cấp quyền mới được cập nhật kết quả)
  const canUpdateVerification = useMemo(() => {
    if (!record) return false;
    if (!currentAccount) return true;
    // Cho phép cán bộ phụ trách, cán bộ phối hợp hoặc tài khoản cán bộ/lãnh đạo được phân quyền trong phiên làm việc
    const isAssignedOfficer =
      record.canBoPhuTrachName.toLowerCase() === currentAccount.name.toLowerCase() ||
      record.canBoPhoiHop.some(
        (c) => c.officerName.toLowerCase() === currentAccount.name.toLowerCase()
      );
    return isAssignedOfficer || currentAccount.role === 'can_bo' || currentAccount.role === 'lanh_dao';
  }, [record, currentAccount]);

  const canAssign = useMemo(() => canUserAssignDon(currentAccount), [currentAccount]);

  const stats = useMemo(() => {
    if (!record) {
      return { total: 0, completed: 0, inProgress: 0, cannotVerify: 0, notStarted: 0, percent: 0 };
    }
    const total = record.verificationTasks.length;
    const completed = record.verificationTasks.filter((t) => t.status === 'da_hoan_thanh').length;
    const inProgress = record.verificationTasks.filter((t) => t.status === 'dang_thuc_hien').length;
    const cannotVerify = record.verificationTasks.filter(
      (t) => t.status === 'chua_the_thuc_hien'
    ).length;
    const notStarted = record.verificationTasks.filter(
      (t) => t.status === 'chua_thuc_hien'
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, cannotVerify, notStarted, percent };
  }, [record]);

  const formatNow = () => {
    const now = new Date();
    const d = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}/${now.getFullYear()}`;
    const t = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${d} ${t}`;
  };

  // Cán bộ điều tra bấm "Tiếp nhận công việc được giao" (Quy trình bước 4)
  const handleAcceptAssignedWork = () => {
    if (!record) return;
    const timestamp = formatNow();
    const actorName = currentAccount?.name || record.canBoPhuTrachName;
    const updated: PhanCongRecord = {
      ...record,
      taskStatus: 'dang_xu_ly',
      isDraft: false,
      acceptedByInvestigatorAt: timestamp,
      history: [
        {
          id: `hist-acc-${Date.now()}`,
          timestamp,
          actionType: 'cap_nhat_ket_qua',
          title: 'Cán bộ điều tra xác nhận tiếp nhận công việc được giao',
          actorName,
          actorRole: record.vaiTroCanBoPhuTrach,
          leadOfficerName: record.canBoPhuTrachName,
          leadOfficerRole: record.vaiTroCanBoPhuTrach,
          coordinatingOfficers: record.canBoPhoiHop.map((c) => c.officerName),
          deadline: record.thoiHanBaoCao,
          summary: `Đồng chí ${actorName} đã tiếp nhận hồ sơ phân công và bắt đầu thực hiện xác minh ${record.verificationTasks.length} nội dung.`,
        },
        ...record.history,
      ],
    };
    savePhanCongRecord(updated);
    onRecordUpdated(updated);
    onShowToast?.(`✓ Đã tiếp nhận công việc xác minh đơn ${record.donCode}. Trạng thái công việc: Đang xử lý`);
  };

  // Cập nhật trường tạm thời của từng nội dung xác minh trên UI
  const handleFieldChangeOnTask = (
    taskId: string,
    field: 'status' | 'resultText' | 'unverifiedContentAndReason',
    value: string
  ) => {
    if (!record) return;
    const updatedTasks = record.verificationTasks.map((t) =>
      t.id === taskId ? { ...t, [field]: value } : t
    );
    const updated: PhanCongRecord = {
      ...record,
      verificationTasks: updatedTasks,
    };
    onRecordUpdated(updated);
  };

  // Đính kèm tài liệu, biên bản, hình ảnh vào nội dung xác minh (Mục 4.C & Mục 7)
  const handleAddAttachmentToTask = (task: AssignedVerificationTask) => {
    if (!record || !newAttachmentName.trim()) return;
    const timestamp = formatNow();
    const actorName = currentAccount?.name || record.canBoPhuTrachName;
    const cleanName = newAttachmentName.trim().includes('.')
      ? newAttachmentName.trim()
      : `${newAttachmentName.trim()}.pdf`;

    const newAtt: VerificationAttachment = {
      id: `att-xm-${Date.now()}`,
      name: cleanName,
      size: '840 KB',
      docType: newAttachmentType,
      uploadedAt: timestamp,
      uploadedBy: actorName,
    };

    const updatedTasks = record.verificationTasks.map((t) =>
      t.id === task.id ? { ...t, attachments: [...t.attachments, newAtt] } : t
    );

    const updated: PhanCongRecord = {
      ...record,
      verificationTasks: updatedTasks,
    };

    savePhanCongRecord(updated);
    onRecordUpdated(updated);
    onAttachVerificationDocumentToDon?.(newAtt, task.title);
    setNewAttachmentName('');
    setShowAttachmentInputTaskId(null);
    onShowToast?.(`✓ Đã đính kèm tài liệu "${cleanName}" vào mục "${task.title}" và liên kết vào hồ sơ đơn`);
  };

  // Lưu bản nháp hoặc Cập nhật kết quả xác minh của từng nội dung (hỗ trợ cập nhật nhiều lần và lưu lịch sử phiên bản - Mục 4.C & Mục 7)
  const handleSaveTaskVerificationResult = (
    task: AssignedVerificationTask,
    isDraftSave: boolean
  ) => {
    if (!record) return;
    if (!canUpdateVerification) {
      onShowToast?.('Chỉ cán bộ được giao hoặc người có thẩm quyền mới được cập nhật kết quả xác minh.');
      return;
    }

    const timestamp = formatNow();
    const actorName = currentAccount?.name || record.canBoPhuTrachName;
    const actorRole =
      actorName === record.canBoPhuTrachName
        ? record.canBoPhuTrachChucVu
        : currentAccount?.chucVu || 'Cán bộ điều tra';

    const nextVersionNumber = (task.versionHistory?.length || 0) + 1;
    const newVersion = {
      version: nextVersionNumber,
      updatedAt: timestamp,
      updatedBy: actorName,
      updatedByRole: actorRole,
      status: task.status,
      resultText: task.resultText,
      unverifiedContentAndReason: task.unverifiedContentAndReason,
      attachmentsCount: task.attachments.length,
      isDraft: isDraftSave,
    };

    const updatedTasks = record.verificationTasks.map((t) =>
      t.id === task.id
        ? {
          ...t,
          isDraft: isDraftSave,
          updatedAt: timestamp,
          updatedBy: actorName,
          versionHistory: [...(t.versionHistory || []), newVersion],
        }
        : t
    );

    // Tự động chuyển trạng thái công việc sang Đang xử lý hoặc Chờ hoàn thiện báo cáo (Độc lập với trạng thái đơn - Mục 5)
    const allDoneOrExplained = updatedTasks.every(
      (t) => t.status === 'da_hoan_thanh' || t.status === 'chua_the_thuc_hien'
    );
    let nextTaskStatus: AssignmentTaskStatus = record.taskStatus;
    if (record.taskStatus === 'cho_xu_ly') {
      nextTaskStatus = 'dang_xu_ly';
    }
    if (!isDraftSave && allDoneOrExplained && record.taskStatus === 'dang_xu_ly') {
      nextTaskStatus = 'cho_hoan_thien_bao_cao';
    }

    const historyEntry: AssignmentHistoryEntry = {
      id: `hist-xm-${Date.now()}`,
      timestamp,
      actionType: isDraftSave ? 'luu_nhap' : 'cap_nhat_ket_qua',
      title: isDraftSave
        ? `Lưu bản nháp kết quả xác minh: ${task.title}`
        : `Cập nhật kết quả xác minh (Phiên bản v${nextVersionNumber}): ${task.title}`,
      actorName,
      actorRole,
      leadOfficerName: record.canBoPhuTrachName,
      leadOfficerRole: record.vaiTroCanBoPhuTrach,
      coordinatingOfficers: record.canBoPhoiHop.map((c) => c.officerName),
      deadline: record.thoiHanBaoCao,
      summary: `Trạng thái: ${VERIFICATION_ITEM_STATUS_CONFIG[task.status].label}. Kết quả: ${task.resultText || 'Đã ghi nhận'
        }${task.unverifiedContentAndReason
          ? ` | Nội dung chưa xác minh được: ${task.unverifiedContentAndReason}`
          : ''
        }`,
    };

    const updatedRecord: PhanCongRecord = {
      ...record,
      taskStatus: nextTaskStatus,
      verificationTasks: updatedTasks,
      history: [historyEntry, ...record.history],
    };

    savePhanCongRecord(updatedRecord);
    onRecordUpdated(updatedRecord);
    onShowToast?.(
      isDraftSave
        ? `✓ Đã lưu bản nháp kết quả mục "${task.title}"`
        : `✓ Đã cập nhật kết quả xác minh (Phiên bản v${nextVersionNumber}) cho mục "${task.title}"`
    );
  };

  // Khởi tạo / Tổng hợp lại Báo cáo đề xuất bằng AI (Mục 4.D)
  const handleGenerateBaoCaoDeXuat = () => {
    if (!record) return;
    const actorName = currentAccount?.name || record.canBoPhuTrachName;
    const generated = generateAiBaoCaoDeXuatDraft(record, actorName);
    setEditingDraft(generated);
    setActiveSubView('bao-cao-de-xuat');

    const updatedRecord: PhanCongRecord = {
      ...record,
      taskStatus:
        record.taskStatus === 'cho_phe_duyet' || record.taskStatus === 'hoan_thanh'
          ? record.taskStatus
          : 'cho_hoan_thien_bao_cao',
      baoCaoDeXuatDraft: generated,
    };
    savePhanCongRecord(updatedRecord);
    onRecordUpdated(updatedRecord);
    onShowToast?.('✓ AI đã tổng hợp Dự thảo Báo cáo đề xuất từ kết quả xác minh các nội dung được giao');
  };

  // Lưu nháp báo cáo đề xuất
  const handleSaveBaoCaoDraft = () => {
    if (!record || !editingDraft) return;
    const timestamp = formatNow();
    const nextDraft: BaoCaoDeXuatTongHopDraft = {
      ...editingDraft,
      status: 'nhap',
      updatedAt: timestamp,
    };
    const updatedRecord: PhanCongRecord = {
      ...record,
      taskStatus: 'cho_hoan_thien_bao_cao',
      baoCaoDeXuatDraft: nextDraft,
      history: [
        {
          id: `hist-bc-${Date.now()}`,
          timestamp,
          actionType: 'tao_bao_cao',
          title: `Lưu bản nháp Báo cáo đề xuất số ${nextDraft.soKyHieu}`,
          actorName: currentAccount?.name || record.canBoPhuTrachName,
          actorRole: record.canBoPhuTrachChucVu,
          leadOfficerName: record.canBoPhuTrachName,
          leadOfficerRole: record.vaiTroCanBoPhuTrach,
          coordinatingOfficers: record.canBoPhoiHop.map((c) => c.officerName),
          deadline: record.thoiHanBaoCao,
          summary: 'Lưu bản nháp Báo cáo tổng hợp kết quả xác minh và đề xuất hướng xử lý.',
        },
        ...record.history,
      ],
    };
    setEditingDraft(nextDraft);
    savePhanCongRecord(updatedRecord);
    onRecordUpdated(updatedRecord);
    onShowToast?.('✓ Đã lưu bản nháp Báo cáo đề xuất (Chưa tự động trình ký)');
  };

  // Xác nhận trình lãnh đạo xem xét Báo cáo đề xuất (Quy trình bước 7)
  const handleConfirmSubmitBaoCaoToLeader = () => {
    if (!record || !editingDraft) return;
    const timestamp = formatNow();
    const nextDraft: BaoCaoDeXuatTongHopDraft = {
      ...editingDraft,
      status: 'da_trinh_lanh_dao',
      updatedAt: timestamp,
    };
    const updatedRecord: PhanCongRecord = {
      ...record,
      taskStatus: 'cho_phe_duyet',
      baoCaoDeXuatDraft: nextDraft,
      history: [
        {
          id: `hist-trinh-${Date.now()}`,
          timestamp,
          actionType: 'trinh_lanh_dao',
          title: `Trình lãnh đạo xem xét Báo cáo đề xuất (${nextDraft.soKyHieu})`,
          actorName: currentAccount?.name || record.canBoPhuTrachName,
          actorRole: record.canBoPhuTrachChucVu,
          leadOfficerName: record.canBoPhuTrachName,
          leadOfficerRole: record.vaiTroCanBoPhuTrach,
          coordinatingOfficers: record.canBoPhoiHop.map((c) => c.officerName),
          deadline: record.thoiHanBaoCao,
          summary:
            'Đã xác nhận trình Lãnh đạo xem xét Báo cáo tổng hợp kết quả xác minh. Trạng thái công việc chuyển sang Chờ phê duyệt (Trạng thái hồ sơ đơn giữ nguyên độc lập).',
        },
        ...record.history,
      ],
    };
    setEditingDraft(nextDraft);
    savePhanCongRecord(updatedRecord);
    onRecordUpdated(updatedRecord);
    onSubmitBaoCaoDeXuatToLeader?.(nextDraft, updatedRecord);
    onShowToast?.(
      '✓ Đã trình Lãnh đạo xem xét Báo cáo đề xuất. Trạng thái công việc: Chờ phê duyệt'
    );
  };

  // Nếu chưa có bản ghi phân công nào cho đơn này
  if (!record) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#C62828] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[30px]">assignment_ind</span>
        </div>
        <div className="max-w-lg mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Đơn chưa được phân công cán bộ điều tra / xác minh
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sau khi đơn được AI phân tích và cán bộ xác nhận tiếp nhận, người có thẩm quyền thực
            hiện phân công cán bộ điều tra phụ trách, cán bộ phối hợp và giao các nội dung cần xác
            minh cụ thể.
          </p>
        </div>

        {isAwaitingAcceptance ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>
              Chức năng Phân công xử lý chỉ khả dụng sau khi đơn đã được xác nhận tiếp nhận.
            </span>
          </div>
        ) : canAssign ? (
          <div>
            <button
              type="button"
              onClick={onOpenPhanCongModal}
              className="px-5 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Thực hiện Phân công xử lý ngay</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            Tài khoản hiện tại không có quyền phân công đơn.
          </div>
        )}
      </div>
    );
  }

  const taskStatusCfg = ASSIGNMENT_TASK_STATUS_CONFIG[record.taskStatus];

  return (
    <div className="space-y-5">

      {/* ===================================================================== */}
      {/* TAB CON 1: MÀN HÌNH DÀNH CHO CÁN BỘ ĐIỀU TRA (PHẦN A - B - C)         */}
      {/* ===================================================================== */}
      {activeSubView === 'xac-minh' && (
        <div className="space-y-5">
          {/* PHẦN A & B: THÔNG TIN ĐƠN + NỘI DUNG ĐƯỢC PHÂN CÔNG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* A. Thông tin đơn (5 cột) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center">
                    A
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Thông tin đơn & Đối tượng liên quan
                  </h4>
                </div>
                <span className="font-mono font-bold text-xs text-[#C62828]">
                  {record.donCode}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-[10.5px] text-slate-400 block">
                      Người tố giác / Gửi đơn
                    </span>
                    <span className="font-bold text-slate-900">{record.nguoiGuiDon}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                    <span className="text-[10.5px] text-slate-400 block">Ngày tiếp nhận</span>
                    <span className="font-semibold text-slate-800">{record.ngayTiepNhan}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200/80">
                  <span className="text-[10.5px] font-bold text-rose-700 uppercase block">
                    Người bị tố giác / Cá nhân, tổ chức bị phản ánh
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {record.nguoiBiToGiac ||
                      'Các cá nhân, tổ chức liên quan nêu trong nội dung đơn'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10.5px] font-semibold text-slate-400 uppercase block">
                    Nội dung đơn
                  </span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{record.noiDungTomTat}</p>
                </div>

                <div>
                  <span className="text-[10.5px] font-semibold text-slate-400 uppercase block mb-1">
                    Tài liệu đính kèm theo đơn ({record.taiLieuDinhKem.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {record.taiLieuDinhKem.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium"
                      >
                        <span className="material-symbols-outlined text-[13px] text-[#C62828]">
                          attach_file
                        </span>
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* B. Nội dung được phân công (7 cột) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#004ac6] text-white text-[11px] font-bold flex items-center justify-center">
                    B
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Thông tin quyết định phân công & Thời hạn báo cáo
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#C62828] border border-red-200 text-[11px] font-bold font-mono">
                  Hạn báo cáo: {record.thoiHanBaoCao}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                  <span className="text-[10.5px] font-bold text-blue-700 uppercase block">
                    Cán bộ điều tra phụ trách chính
                  </span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">
                    {record.canBoPhuTrachName}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {record.canBoPhuTrachChucVu} • {record.vaiTroCanBoPhuTrach}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase block">
                    Người phân công & Đơn vị xử lý
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {record.nguoiPhanCongName} (Ngày giao: {record.ngayPhanCong})
                  </span>
                  <span className="text-[11px] text-slate-600 block truncate">
                    {record.donViXuLyName}
                  </span>
                </div>
              </div>

              {/* Cán bộ phối hợp */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">
                  Cán bộ phối hợp ({record.canBoPhoiHop.length} cán bộ)
                </span>
                {record.canBoPhoiHop.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {record.canBoPhoiHop.map((co) => (
                      <div
                        key={co.officerId}
                        className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px] text-indigo-600 mt-0.5">
                          group
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{co.officerName}</span>
                          <span className="text-[10.5px] text-slate-500 block">
                            {co.assignedRoleInTask}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px]">Không có cán bộ phối hợp</span>
                )}
              </div>

              {/* Chỉ đạo riêng */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase">
                  <span className="material-symbols-outlined text-[15px]">campaign</span>
                  <span>Chỉ đạo riêng của người phân công:</span>
                </div>
                <p className="text-amber-950 mt-1 leading-relaxed font-medium">
                  {record.chiDaoRieng || 'Thực hiện xác minh đầy đủ các nội dung được giao.'}
                </p>
              </div>
            </div>
          </div>


        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB CON 2: D. TỔNG HỢP KẾT QUẢ & TẠO BÁO CÁO ĐỀ XUẤT (MỤC 4.D)         */}
      {/* ===================================================================== */}
      {activeSubView === 'bao-cao-de-xuat' && editingDraft && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 bg-purple-900 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">summarize</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    D. Tổng hợp kết quả xác minh & Dự thảo Báo cáo đề xuất
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-white/20 text-amber-200 text-[11px] font-mono font-bold">
                    {editingDraft.soKyHieu}
                  </span>
                </div>
                <p className="text-[11px] text-purple-200">
                  Báo cáo được lưu dạng bản nháp, có thể chỉnh sửa và xác nhận trước khi trình lãnh
                  đạo (Không tự động trình ký/phê duyệt khi chưa xác nhận)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateBaoCaoDeXuat}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>AI tổng hợp lại từ kết quả mới nhất</span>
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Số, ký hiệu dự thảo báo cáo
                </label>
                <input
                  type="text"
                  value={editingDraft.soKyHieu}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, soKyHieu: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cán bộ lập báo cáo
                </label>
                <input
                  type="text"
                  value={editingDraft.nguoiLap}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, nguoiLap: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Trạng thái báo cáo đề xuất
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-800">
                  {editingDraft.status === 'da_trinh_lanh_dao'
                    ? 'Đã trình lãnh đạo xem xét'
                    : 'Bản nháp (Có thể chỉnh sửa)'}{' '}
                  • {editingDraft.updatedAt}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  1. Nội dung đơn ban đầu
                </label>
                <textarea
                  rows={3}
                  value={editingDraft.noiDungDonBanDau}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, noiDungDonBanDau: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  2. Nội dung được phân công
                </label>
                <textarea
                  rows={3}
                  value={editingDraft.noiDungDuocPhanCong}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, noiDungDuocPhanCong: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                3. Quá trình xác minh
              </label>
              <textarea
                rows={2}
                value={editingDraft.quaTrinhXacMinh}
                onChange={(e) =>
                  setEditingDraft({ ...editingDraft, quaTrinhXacMinh: e.target.value })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                4. Kết quả xác minh từng nội dung được giao
              </label>
              <textarea
                rows={6}
                value={editingDraft.ketQuaTungNoiDung}
                onChange={(e) =>
                  setEditingDraft({ ...editingDraft, ketQuaTungNoiDung: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono leading-relaxed bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  5. Tài liệu, chứng cứ đã thu thập
                </label>
                <textarea
                  rows={4}
                  value={editingDraft.taiLieuDaThuThap}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, taiLieuDaThuThap: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  6. Nội dung chưa làm rõ & Nguyên nhân
                </label>
                <textarea
                  rows={4}
                  value={editingDraft.noiDungChuaLamRo}
                  onChange={(e) =>
                    setEditingDraft({ ...editingDraft, noiDungChuaLamRo: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                7. Nhận định và kiến nghị hướng xử lý
              </label>
              <textarea
                rows={4}
                value={editingDraft.nhanDinhVaKienNghi}
                onChange={(e) =>
                  setEditingDraft({ ...editingDraft, nhanDinhVaKienNghi: e.target.value })
                }
                className="w-full p-3 border border-purple-300 rounded-lg text-xs leading-relaxed bg-purple-50/30 font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSubView('xac-minh')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                ← Quay lại danh sách xác minh
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveBaoCaoDraft}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu bản nháp báo cáo</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSubmitBaoCaoToLeader}
                  className="px-5 py-2 rounded-xl bg-[#C62828] hover:bg-[#b71c1c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">send</span>
                  <span>Xác nhận Trình lãnh đạo xem xét</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB CON 3: KHU VỰC LỊCH SỬ PHÂN CÔNG & CẬP NHẬT KẾT QUẢ (MỤC 6)        */}
      {/* ===================================================================== */}
      {activeSubView === 'lich-su-phan-cong' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004ac6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">history</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch sử phân công, thay đổi cán bộ & cập nhật kết quả xác minh
                </h3>
                <p className="text-xs text-slate-500">
                  Ghi nhận đầy đủ thời gian phân công, người phân công, cán bộ phụ trách/phối hợp,
                  lý do thay đổi cán bộ và lịch sử cập nhật kết quả
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {record.history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase ${entry.actionType === 'thay_doi_can_bo'
                        ? 'bg-amber-100 text-amber-900'
                        : entry.actionType === 'phan_cong_moi'
                          ? 'bg-indigo-100 text-indigo-900'
                          : entry.actionType === 'trinh_lanh_dao'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                    >
                      {entry.actionType === 'thay_doi_can_bo'
                        ? 'Thay đổi phân công'
                        : entry.actionType === 'phan_cong_moi'
                          ? 'Phân công xử lý'
                          : entry.actionType === 'trinh_lanh_dao'
                            ? 'Trình lãnh đạo'
                            : entry.actionType === 'tao_bao_cao'
                              ? 'Báo cáo đề xuất'
                              : 'Cập nhật kết quả'}
                    </span>
                    <span className="font-bold text-slate-900 text-[13px]">{entry.title}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-500">{entry.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11.5px]">
                  <div>
                    <span className="text-slate-400">Người thực hiện: </span>
                    <strong className="text-slate-800">
                      {entry.actorName} ({entry.actorRole})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Cán bộ phụ trách: </span>
                    <strong className="text-[#004ac6]">{entry.leadOfficerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Thời hạn báo cáo: </span>
                    <strong className="text-[#C62828] font-mono">{entry.deadline}</strong>
                  </div>
                </div>

                {entry.coordinatingOfficers?.length > 0 && (
                  <div className="text-[11.5px]">
                    <span className="text-slate-400">Cán bộ phối hợp: </span>
                    <span className="text-slate-700 font-medium">
                      {entry.coordinatingOfficers.join('; ')}
                    </span>
                  </div>
                )}

                {entry.changeReason && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
                    <strong>
                      Lý do thay đổi phân công (Từ {entry.previousLeadOfficerName} →{' '}
                      {entry.leadOfficerName}):
                    </strong>{' '}
                    {entry.changeReason}
                  </div>
                )}

                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  {entry.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

