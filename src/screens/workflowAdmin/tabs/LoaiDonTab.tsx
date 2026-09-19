// src/screens/workflowAdmin/tabs/LoaiDonTab.tsx
import React, { useState, useMemo } from 'react';
import { LoaiDonItem } from '../../../types/businessAdmin';
import { INITIAL_LOAI_DON_ITEMS } from '../../../constants/businessAdminData';

interface LoaiDonTabProps {
  onNavigateToWorkflow?: (workflowId: string) => void;
}

export default function LoaiDonTab({ onNavigateToWorkflow }: LoaiDonTabProps) {
  const [items, setItems] = useState<LoaiDonItem[]>(INITIAL_LOAI_DON_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [days, setDays] = useState(30);
  const [description, setDescription] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const kw = searchTerm.toLowerCase().trim();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(kw) ||
        i.code.toLowerCase().includes(kw) ||
        (i.activeWorkflowName && i.activeWorkflowName.toLowerCase().includes(kw))
    );
  }, [items, searchTerm]);

  const handleAddLoaiDon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: LoaiDonItem = {
      id: `ld-${Date.now()}`,
      code: code.trim() || `LD-${name.substring(0, 2).toUpperCase()}`,
      name: name.trim(),
      description: description.trim(),
      standardProcessingDays: Number(days) || 30,
      status: 'active',
      updatedAt: 'Hôm nay',
      updatedBy: 'Nguyễn Minh Anh',
    };

    setItems((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setName('');
    setCode('');
    setDescription('');
    setDays(30);
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto bg-[#f4f7fb]">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">category</span>
            Danh mục Loại đơn &amp; Quy trình áp dụng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi loại đơn liên kết trực tiếp với 01 quy trình xử lý hiệu lực theo phiên bản mới nhất
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[17px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm loại đơn..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Thêm loại đơn</span>
          </button>
        </div>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-extrabold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                  {item.name}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 shrink-0">
                  {item.code}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description || 'Chưa có diễn giải quy định.'}
              </p>
            </div>

            {/* Quy trình mới nhất đang gắn */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
                Quy trình hiệu lực gắn kèm:
              </span>

              {item.activeWorkflowName ? (
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-950 truncate max-w-[190px]">
                      {item.activeWorkflowName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-blue-600 text-white shadow-2xs shrink-0">
                      ★ {item.activeWorkflowVersion}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-blue-700/80 font-mono block">
                    {item.activeWorkflowCode}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs italic text-center">
                  Chưa gắn quy trình xử lý
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                  Thời hạn: <strong>{item.standardProcessingDays} ngày</strong>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đang áp dụng
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Loại đơn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Thêm mới loại đơn
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddLoaiDon} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tên loại đơn *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vd: Khiếu nại đất đai đợt 2..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mã loại đơn</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="LD-..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Thời hạn giải quyết (ngày)</label>
                  <input
                    type="number"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-bold text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Diễn giải pháp luật</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Căn cứ áp dụng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Lưu loại đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
