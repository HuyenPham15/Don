// src/components/modals/ChinhSuaLuotTrinhModal.tsx
import React, { useState } from 'react';

export type MatrixPermission = 'Xem' | 'Duyệt' | 'Ký số' | 'Bỏ qua';

export interface FlowLeaderItem {
  id: string;
  name: string;
  title: string;
  badgeNumber: number;
  badgeColor: string;
  isFirst?: boolean;
  isProposed?: boolean;
}

export interface ChinhSuaLuotTrinhModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: {
    leaders: FlowLeaderItem[];
    permissions: Record<string, MatrixPermission>;
  }) => void;
  documents?: Array<{ id: string; title?: string; name?: string; code?: string }>;
}

const DEFAULT_DOCUMENTS = [
  { id: 'doc-1', name: 'Hợp đồng cung cấp dịch vụ xác minh hồ sơ' },
  { id: 'doc-2', name: 'Tờ trình phê duyệt kết quả xác minh' },
  { id: 'doc-3', name: 'Báo cáo đánh giá hiện trạng và đề xuất xử lý' },
  { id: 'doc-4', name: 'Dự thảo thông báo kết luận tiếp công dân' },
];

const DEFAULT_LEADERS: FlowLeaderItem[] = [
  {
    id: 'ld-1',
    name: 'Lê Văn A',
    title: 'Trưởng phòng TN&MT',
    badgeNumber: 1,
    badgeColor: 'bg-emerald-600',
    isFirst: true,
  },
  {
    id: 'ld-2',
    name: 'Đỗ Thanh Hải',
    title: 'Phó Trưởng phòng TN&MT',
    badgeNumber: 2,
    badgeColor: 'bg-[#80182a]',
    isProposed: true,
  },
  {
    id: 'ld-3',
    name: 'Nguyễn Văn B',
    title: 'Phó Giám đốc Sở',
    badgeNumber: 3,
    badgeColor: 'bg-[#80182a]',
  },
  {
    id: 'ld-4',
    name: 'Nguyễn Văn C',
    title: 'Giám đốc Sở',
    badgeNumber: 4,
    badgeColor: 'bg-slate-400',
  },
];

const AVAILABLE_EXTRA_LEADERS = [
  { id: 'ld-extra-1', name: 'Trần Hoàng D', title: 'Phó phòng phụ trách' },
  { id: 'ld-extra-2', name: 'Phạm Minh Trí', title: 'Trưởng ban Pháp chế' },
  { id: 'ld-extra-3', name: 'Vũ Quốc Hùng', title: 'Chánh Văn phòng' },
  { id: 'ld-extra-4', name: 'Thượng tá Phạm Đình Trọng', title: 'Phó Thủ trưởng Cơ quan CSĐT' },
  { id: 'ld-extra-5', name: 'Thượng tá Trần Tuấn Nghĩa', title: 'Phó Trưởng Công an quận' },
];

const INITIAL_PERMISSIONS: Record<string, MatrixPermission> = {
  // Doc 1: Hợp đồng cung cấp dịch vụ xác minh hồ sơ
  'doc-1:ld-1': 'Xem',
  'doc-1:ld-2': 'Bỏ qua',
  'doc-1:ld-3': 'Ký số',
  'doc-1:ld-4': 'Xem',

  // Doc 2: Tờ trình phê duyệt kết quả xác minh
  'doc-2:ld-1': 'Duyệt',
  'doc-2:ld-2': 'Duyệt',
  'doc-2:ld-3': 'Duyệt',
  'doc-2:ld-4': 'Xem',

  // Doc 3: Báo cáo đánh giá hiện trạng và đề xuất xử lý
  'doc-3:ld-1': 'Bỏ qua',
  'doc-3:ld-2': 'Bỏ qua',
  'doc-3:ld-3': 'Duyệt',
  'doc-3:ld-4': 'Xem',

  // Doc 4: Dự thảo thông báo kết luận tiếp công dân
  'doc-4:ld-1': 'Xem',
  'doc-4:ld-2': 'Bỏ qua',
  'doc-4:ld-3': 'Xem',
  'doc-4:ld-4': 'Ký số',
};

const PERMISSION_OPTIONS: MatrixPermission[] = ['Ký số', 'Duyệt', 'Xem', 'Bỏ qua'];

export default function ChinhSuaLuotTrinhModal({
  isOpen,
  onClose,
  onSave,
  documents: customDocuments,
}: ChinhSuaLuotTrinhModalProps) {
  const [leaders, setLeaders] = useState<FlowLeaderItem[]>(DEFAULT_LEADERS);
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [permissions, setPermissions] = useState<Record<string, MatrixPermission>>(INITIAL_PERMISSIONS);

  // Danh sách văn bản
  const docs = customDocuments && customDocuments.length > 0
    ? customDocuments.map((d, index) => ({
      id: d.id || `doc-${index + 1}`,
      name: d.name || d.title || `Văn bản ${index + 1}`,
    }))
    : DEFAULT_DOCUMENTS;

  // Lãnh đạo chưa được thêm
  const availableLeaders = AVAILABLE_EXTRA_LEADERS.filter(
    (extra) => !leaders.some((l) => l.name === extra.name)
  );

  const handleAddLeader = () => {
    if (!selectedLeaderId) return;
    const found = AVAILABLE_EXTRA_LEADERS.find((item) => item.id === selectedLeaderId);
    if (!found) return;

    const newIndex = leaders.length + 1;
    const newLeader: FlowLeaderItem = {
      id: `ld-custom-${Date.now()}`,
      name: found.name,
      title: found.title,
      badgeNumber: newIndex,
      badgeColor: 'bg-slate-400',
    };

    setLeaders((prev) => [...prev, newLeader]);
    setPermissions((prev) => {
      const next = { ...prev };
      docs.forEach((doc) => {
        next[`${doc.id}:${newLeader.id}`] = 'Xem';
      });
      return next;
    });
    setSelectedLeaderId('');
  };

  const handleRemoveLeader = (leaderId: string) => {
    setLeaders((prev) => {
      const filtered = prev.filter((l) => l.id !== leaderId);
      // Đánh số lại các cấp
      return filtered.map((item, idx) => ({
        ...item,
        badgeNumber: idx + 1,
      }));
    });
  };

  const handlePermissionChange = (
    docId: string,
    leaderId: string,
    val: MatrixPermission
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [`${docId}:${leaderId}`]: val,
    }));
  };

  const handleConfirm = () => {
    if (onSave) {
      onSave({
        leaders,
        permissions,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs font-sans animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chinh-sua-luot-trinh-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* ================= HEADER ================= */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <h2
            id="chinh-sua-luot-trinh-title"
            className="text-lg font-bold text-slate-900 leading-snug"
          >
            Chỉnh sửa lượt trình
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xl font-light transition cursor-pointer"
            title="Đóng (Esc)"
            aria-label="Đóng popup"
          >
            ×
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-white">
          {/* Thanh công cụ: Chọn lãnh đạo phê duyệt + Nút thêm */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[280px] max-w-sm">
              <select
                value={selectedLeaderId}
                onChange={(e) => setSelectedLeaderId(e.target.value)}
                className="w-full h-9 pl-3.5 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-300 rounded-lg appearance-none focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="">-- Chọn lãnh đạo phê duyệt --</option>
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
              disabled={!selectedLeaderId}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-[#80182a] hover:bg-[#6b1423] rounded-lg transition disabled:opacity-50 flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>+</span>
              <span>Thêm lãnh đạo</span>
            </button>
          </div>

          {/* Bảng ma trận phân quyền văn bản */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs bg-white">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200">
                  {/* Cột 1: DANH SÁCH VĂN BẢN */}
                  <th className="w-[260px] min-w-[240px] px-4 py-3.5 text-center font-bold text-slate-700 text-xs tracking-wider border-r border-slate-200 align-middle">
                    DANH SÁCH VĂN BẢN
                  </th>

                  {/* Các cột lãnh đạo */}
                  {leaders.map((leader, index) => {
                    const isFirst = leader.isFirst ?? index === 0;
                    return (
                      <th
                        key={leader.id}
                        className="w-[185px] min-w-[170px] px-3.5 py-3 text-left border-r border-slate-200 bg-[#f8fafc] align-top relative"
                      >
                        <div className="flex items-start gap-2 pr-5">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-2xs ${leader.badgeColor}`}
                          >
                            {leader.badgeNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <strong
                              className="block text-xs font-bold text-slate-900 leading-snug truncate"
                              title={`${leader.badgeNumber}. ${leader.name}`}
                            >
                              {leader.badgeNumber}. {leader.name}
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

                        {/* Nút xóa lãnh đạo (ngoại trừ lãnh đạo đầu tiên) */}
                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLeader(leader.id)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 w-5 h-5 rounded flex items-center justify-center text-base leading-none cursor-pointer transition"
                            title={`Xóa ${leader.name}`}
                            aria-label={`Xóa ${leader.name}`}
                          >
                            ×
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {docs.map((doc) => (
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

                    {/* Các cột phân quyền lãnh đạo */}
                    {leaders.map((leader, lIndex) => {
                      const key = `${doc.id}:${leader.id}`;
                      const currentPerm = permissions[key] || 'Xem';
                      const isMainSigner = currentPerm === 'Ký số';
                      const isDisabled = leader.isFirst ?? lIndex === 0;

                      return (
                        <td
                          key={key}
                          className="w-[185px] min-w-[170px] px-3.5 py-3 border-r border-slate-200 align-middle"
                        >
                          <div className="relative w-full">
                            <select
                              value={currentPerm}
                              disabled={isDisabled}
                              onChange={(e) =>
                                handlePermissionChange(
                                  doc.id,
                                  leader.id,
                                  e.target.value as MatrixPermission
                                )
                              }
                              className={`w-full h-8 pl-3 pr-7 text-xs font-medium rounded-lg border appearance-none transition focus:outline-none ${
                                isDisabled
                                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : isMainSigner
                                    ? 'bg-white border-rose-300 ring-1 ring-rose-200 text-slate-900 shadow-2xs'
                                    : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 focus:border-blue-400 cursor-pointer'
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-start gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 px-4 text-xs font-semibold text-white bg-[#80182a] hover:bg-[#6b1423] rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>✓</span>
            <span>Trình ký</span>
          </button>
        </div>
      </div>
    </div>
  );
}
