import React, { useState } from 'react';
import { WorkflowDefinition } from '../../types/workflow';

interface ThongBaoBoSungModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (soHieu: string, danhSachBoSung: string[]) => void;
  workflow: WorkflowDefinition;
  donCode: string;
  donTitle: string;
  nguoiNop: string;
  loaiDon: string;
}

export default function ThongBaoBoSungModal({
  isOpen,
  onClose,
  onSuccess,
  workflow,
  donCode,
  nguoiNop,
}: ThongBaoBoSungModalProps) {
  if (!isOpen) return null;

  // Danh mục tài liệu cần bổ sung mặc định theo loại đơn
  const defaultItems =
    workflow.potentialMissingInfo && workflow.potentialMissingInfo.length > 0
      ? workflow.potentialMissingInfo.map((m) => m.title)
      : workflow.id === 'to-giac'
      ? [
          'Bản sao kê tài khoản ngân hàng chính thức có đóng dấu xác nhận giao dịch',
          'Văn bản ủy quyền cho người đại diện / Luật sư có công chứng, chứng thực',
          'Các chứng từ chuyển khoản, thỏa thuận gốc đối chiếu',
        ]
      : [
          'Bản sao có chứng thực Quyết định hành chính hoặc thông báo bị khiếu nại',
          'Giấy tờ, tài liệu chứng minh quyền và lợi ích hợp pháp bị xâm phạm',
          'Bản sao CCCD / Định danh điện tử của người đứng đơn',
        ];

  const [soHieu, setSoHieu] = useState(`TB-BS/${new Date().getFullYear()}/TB-TD`);
  const [thoiHanNgay, setThoiHanNgay] = useState('10 ngày làm việc');
  const [missingChecklist, setMissingChecklist] = useState<string[]>(defaultItems);
  const [selectedItems, setSelectedItems] = useState<string[]>(defaultItems);
  const [customItemInput, setCustomItemInput] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  const handleToggleItem = (itemText: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemText) ? prev.filter((i) => i !== itemText) : [...prev, itemText]
    );
  };

  const handleAddCustomItem = () => {
    if (!customItemInput.trim()) return;
    const newItem = customItemInput.trim();
    if (!missingChecklist.includes(newItem)) {
      setMissingChecklist((prev) => [...prev, newItem]);
      setSelectedItems((prev) => [...prev, newItem]);
    }
    setCustomItemInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(soHieu, selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header: Gọn gàng, rõ ràng */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-lg">note_add</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Yêu cầu bổ sung hồ sơ, tài liệu
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Đơn <span className="font-semibold text-slate-700">{donCode}</span> • Người nộp: <strong className="text-slate-800">{nguoiNop}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body: Chỉ giữ thông tin quan trọng */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Thông tin số hiệu & thời hạn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Số hiệu thông báo <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={soHieu}
                onChange={(e) => setSoHieu(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời hạn bổ sung</label>
              <select
                value={thoiHanNgay}
                onChange={(e) => setThoiHanNgay(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
              >
                <option value="07 ngày làm việc">07 ngày làm việc</option>
                <option value="10 ngày làm việc">10 ngày làm việc (Luật định)</option>
                <option value="15 ngày làm việc">15 ngày làm việc</option>
                <option value="20 ngày làm việc">20 ngày làm việc</option>
              </select>
            </div>
          </div>

          {/* Danh mục tài liệu cần bổ sung - Trọng tâm */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-600">checklist</span>
                <span>Tài liệu, thông tin cần bổ sung ({selectedItems.length} mục đã chọn):</span>
              </label>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 max-h-48 overflow-y-auto">
              {missingChecklist.map((item, idx) => {
                const isChecked = selectedItems.includes(item);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                      isChecked
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleItem(item)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="leading-snug text-xs flex-1">{item}</span>
                  </label>
                );
              })}
            </div>

            {/* Thêm mục bổ sung tùy chỉnh nhanh */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomItem();
                  }
                }}
                placeholder="Nhập thêm tài liệu cần yêu cầu bổ sung khác..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#004ac6]"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Thêm mục</span>
              </button>
            </div>
          </div>

          {/* Ghi chú thêm (Tùy chọn) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ghi chú / Hướng dẫn thêm <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập hướng dẫn hoặc lưu ý đặc biệt cho công dân (nếu có)..."
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={selectedItems.length === 0}
              className={`px-4 py-2 rounded-xl text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs active:scale-95 ${
                selectedItems.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">send</span>
              <span>Ban hành thông báo bổ sung</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
