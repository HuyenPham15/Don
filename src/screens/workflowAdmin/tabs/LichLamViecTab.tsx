// src/screens/workflowAdmin/tabs/LichLamViecTab.tsx
import React, { useState } from 'react';
import { LichLamViecItem } from '../../../types/businessAdmin';
import { INITIAL_LICH_LAM_VIEC_ITEMS } from '../../../constants/businessAdminData';

export default function LichLamViecTab() {
  const [schedules, setSchedules] = useState<LichLamViecItem[]>(INITIAL_LICH_LAM_VIEC_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [morningHours, setMorningHours] = useState('08:00 - 12:00');
  const [afternoonHours, setAfternoonHours] = useState('13:30 - 17:30');

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSch: LichLamViecItem = {
      id: `sch-${Date.now()}`,
      code: code.trim() || 'LLV-NEW',
      name: name.trim(),
      description: description.trim(),
      workingDays: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
      morningHours,
      afternoonHours,
      isDefault: false,
      applicableDepartments: ['Khối cơ quan chuyên môn'],
      updatedAt: 'Hôm nay',
    };

    setSchedules((prev) => [...prev, newSch]);
    setIsModalOpen(false);
    setName('');
    setCode('');
    setDescription('');
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto bg-[#f4f7fb]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">calendar_month</span>
            Quản trị Lịch làm việc &amp; Định mức thời gian
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>+ Thêm lịch làm việc</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((sch) => (
          <div
            key={sch.id}
            className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 ${sch.isDefault ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200/90'
              }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">{sch.name}</h3>
                    {sch.isDefault && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Mặc định hệ thống
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{sch.code}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{sch.description}</p>

            {/* Time boxes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Buổi sáng
                </span>
                <span className="font-bold text-slate-800 font-mono">{sch.morningHours}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Buổi chiều
                </span>
                <span className="font-bold text-slate-800 font-mono">{sch.afternoonHours}</span>
              </div>
            </div>

            {/* Working days chips */}
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Ngày làm việc áp dụng:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sch.workingDays.map((d, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[240px]">
                Áp dụng: {sch.applicableDepartments.join(', ')}
              </span>
              <span className="text-slate-400 font-mono text-[10.5px]">{sch.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal thêm lịch làm việc */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Thêm mới lịch làm việc
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tên lịch làm việc *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vd: Lịch trực ca đêm..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Mã lịch</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="LLV-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Khung giờ sáng</label>
                  <input
                    type="text"
                    value={morningHours}
                    onChange={(e) => setMorningHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Khung giờ chiều</label>
                  <input
                    type="text"
                    value={afternoonHours}
                    onChange={(e) => setAfternoonHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Ghi chú phạm vi áp dụng</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Áp dụng cho đơn vị..."
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
                  Lưu lịch làm việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
