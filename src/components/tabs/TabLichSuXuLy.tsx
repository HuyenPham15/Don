import React, { useState, useMemo } from 'react';
import { DonDetail } from '../../types';

export interface ProcessHistoryLog {
  id: string;
  time: string;
  title: string;
  actor: string;
  actorRole?: string;
  actorDept?: string;
  category: 'tiep_nhan' | 'xac_minh' | 'huong_xu_ly' | 'van_ban' | 'quy_trinh' | 'ghi_chu';
  statusBadge?: {
    text: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
  description: string;
  note?: string;
  docInfo?: {
    name: string;
    code?: string;
    type?: string;
  };
}

interface TabLichSuXuLyProps {
  currentDon: DonDetail;
  historyLogs: ProcessHistoryLog[];
  onAddLog: (newLog: Omit<ProcessHistoryLog, 'id' | 'time'>) => void;
  onViewDoc?: (docName: string) => void;
}

export default function TabLichSuXuLy({
  currentDon,
  historyLogs,
  onAddLog,
  onViewDoc,
}: TabLichSuXuLyProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form add log state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProcessHistoryLog['category']>('ghi_chu');
  const [formDescription, setFormDescription] = useState('');
  const [formNote, setFormNote] = useState('');

  const filteredLogs = useMemo(() => {
    return historyLogs.filter((log) => {
      const matchCat = filterCategory === 'all' || log.category === filterCategory;
      const matchSearch =
        !searchQuery.trim() ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.note && log.note.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [historyLogs, filterCategory, searchQuery]);

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    let badge = {
      text: 'Ghi chú nghiệp vụ',
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-700',
      borderClass: 'border-slate-200',
    };

    if (formCategory === 'xac_minh') {
      badge = {
        text: 'Xác minh hồ sơ',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200',
      };
    } else if (formCategory === 'huong_xu_ly') {
      badge = {
        text: 'Hướng xử lý',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
      };
    } else if (formCategory === 'van_ban') {
      badge = {
        text: 'Hồ sơ & Văn bản',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-700',
        borderClass: 'border-purple-200',
      };
    } else if (formCategory === 'quy_trinh') {
      badge = {
        text: 'Tiến độ quy trình',
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-700',
        borderClass: 'border-indigo-200',
      };
    }

    onAddLog({
      title: formTitle.trim(),
      actor: currentDon.canBoXuLy || 'Nguyễn Minh Anh',
      actorRole: currentDon.chucVuCanBo || 'Chuyên viên Tiếp nhận & Xử lý đơn',
      actorDept: currentDon.donViXuLy || 'Phòng Tiếp công dân & Xử lý đơn',
      category: formCategory,
      statusBadge: badge,
      description: formDescription.trim(),
      note: formNote.trim() || undefined,
    });

    setFormTitle('');
    setFormDescription('');
    setFormNote('');
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (category: ProcessHistoryLog['category']) => {
    switch (category) {
      case 'tiep_nhan':
        return 'inbox';
      case 'xac_minh':
        return 'verified_user';
      case 'huong_xu_ly':
        return 'alt_route';
      case 'van_ban':
        return 'description';
      case 'quy_trinh':
        return 'linear_scale';
      default:
        return 'edit_note';
    }
  };

  const getCategoryColor = (category: ProcessHistoryLog['category']) => {
    switch (category) {
      case 'tiep_nhan':
        return 'bg-blue-500 text-white';
      case 'xac_minh':
        return 'bg-amber-500 text-white';
      case 'huong_xu_ly':
        return 'bg-emerald-600 text-white';
      case 'van_ban':
        return 'bg-purple-600 text-white';
      case 'quy_trinh':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── 3. TIMELINE DANH SÁCH SỰ KIỆN ────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Không tìm thấy sự kiện nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[17px] sm:before:left-[21px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {filteredLogs.map((log) => {
              const iconName = getCategoryIcon(log.category);
              const iconColorClass = getCategoryColor(log.category);

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Icon Node */}
                  <div
                    className={`absolute -left-[30px] sm:-left-[35px] top-1 w-7 h-7 rounded-full flex items-center justify-center shadow-xs ring-4 ring-white ${iconColorClass}`}
                    title={log.category}
                  >
                    <span className="material-symbols-outlined text-[15px]">{iconName}</span>
                  </div>

                  {/* Card Event Content */}
                  <div className="bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all">
                    {/* Header: Title + Badge + Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-[13.5px] font-bold text-slate-900">{log.title}</h4>
                        {log.statusBadge && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${log.statusBadge.bgClass} ${log.statusBadge.textClass} ${log.statusBadge.borderClass}`}
                          >
                            {log.statusBadge.text}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                        <span>{log.time}</span>
                      </div>
                    </div>

                    {/* Actor information */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <span className="font-semibold text-slate-800">{log.actor}</span>
                      {log.actorDept && <span className="text-slate-400">• {log.actorDept}</span>}
                    </div>

                    {/* Description */}
                    <div className="mt-2 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                      {log.description}
                    </div>

                    {/* Ghi chú thêm / Căn cứ pháp lý nếu có */}
                    {log.note && (
                      <div className="mt-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11.5px] text-slate-700 flex items-start gap-2">
                        <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0 mt-0.5">
                          quick_reference
                        </span>
                        <div>
                          <strong className="text-blue-900 block font-semibold mb-0.5">Ghi chú nghiệp vụ / Căn cứ:</strong>
                          <span className="leading-relaxed">{log.note}</span>
                        </div>
                      </div>
                    )}

                    {/* Văn bản liên quan nếu có */}
                    {log.docInfo && (
                      <div className="mt-2.5 flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0">
                            picture_as_pdf
                          </span>
                          <span className="font-medium text-slate-800 truncate">{log.docInfo.name}</span>
                          {log.docInfo.code && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {log.docInfo.code}
                            </span>
                          )}
                        </div>
                        {onViewDoc && (
                          <button
                            type="button"
                            onClick={() => onViewDoc(log.docInfo?.name || '')}
                            className="text-[#004ac6] hover:underline font-semibold text-[11px] shrink-0 cursor-pointer ml-2"
                          >
                            Xem văn bản
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL THÊM GHI CHÚ XỬ LÝ MỚI ──────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">edit_note</span>
                <h3 className="font-bold text-slate-900 text-sm">Ghi log xử lý hồ sơ đơn</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề hành động / sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Gọi điện trao đổi với người nộp đơn, Họp xin ý kiến lãnh đạo..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phân loại sự kiện
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-medium bg-white"
                >
                  <option value="ghi_chu">Ghi chú nghiệp vụ / Trao đổi nội bộ</option>
                  <option value="xac_minh">Xác minh thông tin &amp; Làm việc với công dân</option>
                  <option value="huong_xu_ly">Đề xuất / Thay đổi hướng giải quyết</option>
                  <option value="van_ban">Ban hành / Soạn thảo văn bản, quyết định</option>
                  <option value="quy_trinh">Cập nhật bước thực hiện quy trình</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả cụ thể kết quả làm việc, thông tin mới ghi nhận được hoặc ý kiến đề xuất..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Căn cứ pháp lý / Chỉ đạo kèm theo (Không bắt buộc)
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ví dụ: Căn cứ Điều 28 Luật Khiếu nại 2011, Ý kiến chỉ đạo của Trưởng phòng..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] text-white font-semibold shadow-xs cursor-pointer"
                >
                  Lưu vào lịch sử xử lý
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
