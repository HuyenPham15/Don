// src/components/modals/TaoLuotTrinhModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';

export interface LeaderOption {
  id: string;
  name: string;
  title: string;
  department?: string;
  isProposed?: boolean;
}

export type Permission = 'Xem' | 'Ký số' | 'Duyệt' | 'Bỏ qua';

export const DEFAULT_LEADERS: LeaderOption[] = [
  { id: 'lanh_dao_hung', name: 'Trần Văn Hùng', title: 'Phó Chánh Thanh tra thành phố', department: 'Ban Lãnh đạo Thanh tra', isProposed: true },
  { id: 'lanh_dao_cuong', name: 'Trần Văn Cường', title: 'Phó Chánh Thanh tra thành phố', department: 'Ban Lãnh đạo Thanh tra' },
  { id: 'lanh-dao-1', name: 'Lê Văn A', title: 'Trưởng phòng TN&MT', department: 'Phòng Tài nguyên & Môi trường' },
  { id: 'lanh-dao-hai', name: 'Đỗ Thanh Hải', title: 'Phó Trưởng phòng TN&MT', department: 'Phòng Tài nguyên & Môi trường' },
  { id: 'lanh-dao-2', name: 'Nguyễn Văn B', title: 'Phó Giám đốc Sở', department: 'Ban Giám đốc Sở' },
  { id: 'lanh-dao-3', name: 'Nguyễn Văn C', title: 'Giám đốc Sở', department: 'Ban Giám đốc Sở' },
  { id: 'lanh-dao-4', name: 'Trần Hoàng D', title: 'Phó phòng phụ trách', department: 'Phòng Tiếp công dân & Xử lý đơn' },
  { id: 'lanh-dao-5', name: 'Phạm Minh Trí', title: 'Trưởng ban Pháp chế', department: 'Ban Pháp chế' },
  { id: 'lanh-dao-6', name: 'Vũ Quốc Hùng', title: 'Chánh Văn phòng', department: 'Văn phòng Sở' },
];

export const PERMISSION_OPTIONS: Permission[] = ['Ký số', 'Duyệt', 'Xem', 'Bỏ qua'];

export interface SelectedDocumentItem {
  id: string;
  name: string;
  soHieu?: string;
  yeuCau?: string;
}

export interface TaoLuotTrinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SelectedDocumentItem[];
  onSubmit: (
    configuredLeaders: LeaderOption[],
    permissions: Record<string, Permission>
  ) => void | Promise<void>;
  customLeaders?: LeaderOption[];
}

export default function TaoLuotTrinhModal({
  isOpen,
  onClose,
  documents,
  onSubmit,
  customLeaders,
}: TaoLuotTrinhModalProps) {
  // Danh sách lãnh đạo nguồn (ưu tiên customLeaders nếu được truyền vào)
  const sourceLeaders = useMemo(
    () => (customLeaders && customLeaders.length > 0 ? customLeaders : DEFAULT_LEADERS),
    [customLeaders]
  );

  // Danh sách lãnh đạo trong lượt trình
  const [leaders, setLeaders] = useState<LeaderOption[]>([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');

  // Ma trận phân quyền: key dạng `docId:leaderId`
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});

  // Trạng thái xử lý gửi trình ký
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset & Tự động gợi ý lãnh đạo đề xuất khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    // Tự động thêm lãnh đạo đề xuất (isProposed hoặc lãnh đạo đầu tiên)
    const proposed = sourceLeaders.find((l) => l.isProposed) || sourceLeaders[0];
    if (proposed) {
      setLeaders([proposed]);
      const initialPerms: Record<string, Permission> = {};
      documents.forEach((doc) => {
        initialPerms[`${doc.id}:${proposed.id}`] = 'Ký số';
      });
      setPermissions(initialPerms);
    } else {
      setLeaders([]);
      setPermissions({});
    }

    setSelectedLeaderId('');
    setIsSubmitting(false);
    setSubmitError(null);
  }, [isOpen, documents, sourceLeaders]);

  // Xử lý phím Esc để đóng modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Danh sách lãnh đạo chưa được chọn vào lượt trình
  const availableLeaders = useMemo(() => {
    return sourceLeaders.filter(
      (item) => !leaders.some((selected) => selected.id === item.id)
    );
  }, [sourceLeaders, leaders]);

  // Thêm một lãnh đạo vào ma trận
  const handleAddLeader = useCallback(() => {
    if (!selectedLeaderId) return;
    const leaderToAdd = sourceLeaders.find((item) => item.id === selectedLeaderId);
    if (!leaderToAdd) return;

    // Tránh thêm trùng
    if (leaders.some((l) => l.id === leaderToAdd.id)) return;

    setLeaders((prev) => [...prev, leaderToAdd]);

    // Gán quyền mặc định là 'Xem' cho lãnh đạo mới trên tất cả các văn bản
    // Giữ nguyên toàn bộ các quyền đã cấu hình trước đó của các lãnh đạo khác
    setPermissions((prev) => {
      const next = { ...prev };
      documents.forEach((doc) => {
        const key = `${doc.id}:${leaderToAdd.id}`;
        if (!next[key]) {
          next[key] = 'Xem';
        }
      });
      return next;
    });

    setSelectedLeaderId('');
    setSubmitError(null);
  }, [selectedLeaderId, sourceLeaders, leaders, documents]);

  // Xóa lãnh đạo khỏi lượt trình (giữ nguyên quyền của các lãnh đạo còn lại)
  const handleRemoveLeader = useCallback((leaderId: string) => {
    setLeaders((prev) => prev.filter((item) => item.id !== leaderId));
    // Dọn bớt key của leader bị xóa khỏi ma trận
    setPermissions((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.endsWith(`:${leaderId}`)) {
          delete next[key];
        }
      });
      return next;
    });
    setSubmitError(null);
  }, []);

  // Cập nhật quyền của 1 ô trong ma trận
  const handlePermissionChange = useCallback(
    (docId: string, leaderId: string, newPerm: Permission) => {
      setPermissions((prev) => ({
        ...prev,
        [`${docId}:${leaderId}`]: newPerm,
      }));
      setSubmitError(null);
    },
    []
  );

  // Kiểm tra điều kiện nghiệp vụ trước khi cho phép trình ký:
  // 1. Phải có ít nhất 01 lãnh đạo
  // 2. Mỗi văn bản trong lượt trình phải có ít nhất 01 lãnh đạo có quyền 'Ký số' hoặc 'Duyệt'
  const validation = useMemo(() => {
    if (leaders.length === 0) {
      return {
        isValid: false,
        warningMessage: 'Vui lòng chọn và thêm ít nhất 01 lãnh đạo phê duyệt để thiết lập lượt trình.',
      };
    }

    if (documents.length === 0) {
      return {
        isValid: false,
        warningMessage: 'Không có văn bản nào trong lượt trình.',
      };
    }

    // Tìm văn bản chưa được phân quyền ký số hoặc duyệt
    const docMissingSigner = documents.find((doc) => {
      const hasSignerOrApprover = leaders.some((ldr) => {
        const perm = permissions[`${doc.id}:${ldr.id}`];
        return perm === 'Ký số' || perm === 'Duyệt';
      });
      return !hasSignerOrApprover;
    });

    if (docMissingSigner) {
      return {
        isValid: false,
        warningMessage: `Văn bản "${docMissingSigner.name}" chưa có lãnh đạo nào được phân quyền "Ký số" hoặc "Duyệt". Vui lòng chọn thẩm quyền xử lý chính.`,
      };
    }

    return { isValid: true, warningMessage: null };
  }, [leaders, documents, permissions]);

  // Xác nhận trình ký
  const handleConfirm = async () => {
    if (!validation.isValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit(leaders, permissions);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Có lỗi xảy ra khi gửi yêu cầu trình ký. Vui lòng thử lại!';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tao-luot-trinh-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* ================= HEADER ================= */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-[#991b1b] flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
              ⌘
            </div>
            <div>
              <h2
                id="tao-luot-trinh-title"
                className="text-base font-bold text-slate-900 leading-snug"
              >
                Tạo lượt trình &amp; Ma trận phân quyền văn bản
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {documents.length} văn bản đã chọn · Cấu hình thứ tự trình ký và phân quyền xử lý từng văn bản
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xl font-light transition cursor-pointer disabled:opacity-50"
            title="Đóng (Esc)"
            aria-label="Đóng popup"
          >
            ×
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-white">
          {/* Thanh công cụ: Chọn lãnh đạo phê duyệt + Nút thêm */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-md">
                <select
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  disabled={isSubmitting || availableLeaders.length === 0}
                  className="w-full h-9 pl-3.5 pr-8 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#991b1b]/20 focus:border-[#991b1b] transition cursor-pointer appearance-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {availableLeaders.length === 0
                      ? 'Đã thêm tất cả lãnh đạo khả dụng vào lượt trình'
                      : '-- Chọn lãnh đạo phê duyệt --'}
                  </option>
                  {availableLeaders.map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      {leader.name} - {leader.title}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                  arrow_drop_down
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddLeader}
                disabled={!selectedLeaderId || isSubmitting}
                className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs ${selectedLeaderId && !isSubmitting
                  ? 'bg-[#991b1b] hover:bg-[#7f1d1d] text-white active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <span className="text-base font-bold leading-none">+</span>
                <span>Thêm lãnh đạo</span>
              </button>
            </div>

            {/* Thông tin nhanh số lượng lãnh đạo đã thêm */}
            <div className="text-xs font-medium text-slate-500">
              Đã thêm: <strong className="text-slate-900">{leaders.length}</strong> lãnh đạo
            </div>
          </div>

          {/* Cảnh báo lỗi gửi API nếu có */}
          {submitError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 animate-fade-in">
              <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">
                error
              </span>
              <span className="flex-1 font-medium">{submitError}</span>
            </div>
          )}

          {/* Bảng ma trận phân quyền văn bản */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs bg-white">
            <table className="w-full border-collapse text-xs">
              {/* Định nghĩa chiều rộng các cột */}
              <colgroup>
                {/* Cột 1: Danh sách văn bản cố định */}
                <col style={{ width: '260px' }} />
                {leaders.length === 0 ? (
                  /* Khi chưa có lãnh đạo: cột thông báo chiếm toàn bộ không gian còn lại */
                  <col style={{ width: 'auto' }} />
                ) : (
                  <>
                    {leaders.map((leader) => (
                      <col key={leader.id} style={{ width: '185px' }} />
                    ))}
                    {/* Cột đệm khi có ít hơn 3 lãnh đạo để các cột không bị phình to */}
                    {leaders.length < 3 && <col style={{ width: 'auto' }} />}
                  </>
                )}
              </colgroup>

              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200">
                  {/* Cột 1: DANH SÁCH VĂN BẢN */}
                  <th className="w-[260px] min-w-[240px] px-4 py-3.5 text-center font-bold text-slate-700 text-xs tracking-wider border-r border-slate-200 align-middle">
                    DANH SÁCH VĂN BẢN
                  </th>

                  {leaders.length === 0 ? (
                    <th className="px-5 text-center font-normal text-slate-400 text-xs italic bg-[#f8fafc] align-middle">
                      Chưa có lãnh đạo nào được thêm vào lượt trình.
                    </th>
                  ) : (
                    <>
                      {leaders.map((leader, index) => {
                        const badgeBg =
                          index === 0
                            ? 'bg-emerald-600'
                            : index < 3
                              ? 'bg-[#80182a]'
                              : 'bg-slate-400';

                        return (
                          <th
                            key={leader.id}
                            className="w-[185px] min-w-[170px] px-3.5 py-3 text-left border-r border-slate-200 bg-[#f8fafc] align-top relative"
                          >
                            <div className="flex items-start gap-2 pr-5">
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-2xs ${badgeBg}`}
                              >
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <strong
                                  className="block text-xs font-bold text-slate-900 leading-snug truncate"
                                  title={`${index + 1}. ${leader.name}`}
                                >
                                  {index + 1}. {leader.name}
                                </strong>
                                <span
                                  className="block text-[11px] text-slate-500 font-normal mt-0.5 truncate"
                                  title={leader.title}
                                >
                                  {leader.title}
                                </span>

                                {/* Huy hiệu Được đề xuất */}
                                {leader.isProposed && (
                                  <div className="flex items-center gap-1 mt-1 text-[#b45309] text-[10.5px] font-medium leading-tight">
                                    <span>Được đề xuất</span>
                                    <span className="w-4 h-4 rounded-full bg-[#f59e0b] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs shrink-0">
                                      T
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Nút xóa lãnh đạo */}
                            <button
                              type="button"
                              onClick={() => handleRemoveLeader(leader.id)}
                              disabled={isSubmitting}
                              className="absolute top-2.5 right-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 w-5 h-5 rounded flex items-center justify-center text-base leading-none cursor-pointer transition disabled:opacity-40"
                              title={`Xóa ${leader.name} khỏi lượt trình`}
                              aria-label={`Xóa ${leader.name}`}
                            >
                              ×
                            </button>
                          </th>
                        );
                      })}
                      {leaders.length < 3 && <th className="bg-[#f8fafc]"></th>}
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {documents.map((doc, docIndex) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Cột 1: Thông tin văn bản */}
                    <td className="w-[260px] min-w-[240px] px-4 py-3.5 border-r border-slate-200 align-middle">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-slate-500 text-base leading-none shrink-0 mt-0.5">
                          description
                        </span>
                        <strong
                          className="block text-xs font-semibold text-slate-900 leading-snug break-words"
                          title={doc.name}
                        >
                          {doc.name}
                        </strong>
                      </div>
                    </td>

                    {/* Các cột lãnh đạo */}
                    {leaders.length === 0 ? (
                      docIndex === 0 ? (
                        <td
                          rowSpan={documents.length}
                          className="px-6 py-8 text-center text-slate-400 align-middle bg-slate-50/30"
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                            <span className="material-symbols-outlined text-3xl text-slate-300">
                              person_add
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              Chưa có lãnh đạo nào trong lượt trình
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Chọn lãnh đạo phê duyệt ở danh sách phía trên và bấm &quot;+ Thêm lãnh đạo&quot; để cấu hình
                            </span>
                          </div>
                        </td>
                      ) : null
                    ) : (
                      <>
                        {leaders.map((leader) => {
                          const key = `${doc.id}:${leader.id}`;
                          const currentPerm = permissions[key] || 'Xem';
                          const isMainSigner = currentPerm === 'Ký số';
                          const isDismissed = currentPerm === 'Bỏ qua';

                          return (
                            <td
                              key={key}
                              className="w-[185px] min-w-[170px] px-3.5 py-3 border-r border-slate-200 align-middle"
                            >
                              <div className="relative w-full">
                                <select
                                  value={currentPerm}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      doc.id,
                                      leader.id,
                                      e.target.value as Permission
                                    )
                                  }
                                  disabled={isSubmitting}
                                  className={`w-full h-8.5 pl-3 pr-7 text-xs font-medium rounded-lg border appearance-none transition focus:outline-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${isMainSigner
                                    ? 'bg-white border-rose-300 ring-1 ring-rose-200 text-slate-900 shadow-2xs'
                                    : isDismissed
                                      ? 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'
                                      : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 focus:border-blue-400'
                                    }`}
                                  aria-label={`Quyền của ${leader.name} với ${doc.name}`}
                                >
                                  {PERMISSION_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                                  arrow_drop_down
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        {leaders.length < 3 && <td className="bg-white"></td>}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs disabled:opacity-50"
            >
              Đóng
            </button>

            <button
              type="button"
              disabled={!validation.isValid || isSubmitting}
              onClick={handleConfirm}
              className={`px-5 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-sm transition ${validation.isValid && !isSubmitting
                ? 'bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-98 cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"></span>
                  <span>Đang gửi trình ký...</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold">✓</span>
                  <span>Trình ký</span>
                </>
              )}
            </button>
          </div>

          {/* <div className="text-[11.5px] text-slate-400 font-normal hidden sm:block">
            * Mỗi văn bản cần tối thiểu 01 lãnh đạo phân quyền Ký số hoặc Duyệt
          </div> */}
        </div>
      </div>
    </div>
  );
}
