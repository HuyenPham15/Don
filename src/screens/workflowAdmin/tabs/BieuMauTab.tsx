// src/screens/workflowAdmin/tabs/BieuMauTab.tsx
import React, { useState, useMemo } from 'react';
import { BieuMauItem } from '../../../types/businessAdmin';
import { INITIAL_BIEU_MAU_ITEMS } from '../../../constants/businessAdminData';
import { LOAI_DON_OPTIONS } from '../../../constants';

export default function BieuMauTab() {
  const [items, setItems] = useState<BieuMauItem[]>(INITIAL_BIEU_MAU_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoaiDon, setSelectedLoaiDon] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loaiDonId, setLoaiDonId] = useState('all');
  const [stepName, setStepName] = useState('');
  const [format, setFormat] = useState<'DOCX' | 'PDF' | 'XLSX'>('DOCX');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedLoaiDon !== 'all' && item.loaiDonId !== selectedLoaiDon && item.loaiDonId !== 'all') {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const kw = searchTerm.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(kw) ||
        item.code.toLowerCase().includes(kw) ||
        item.applicableStepName.toLowerCase().includes(kw)
      );
    });
  }, [items, searchTerm, selectedLoaiDon]);

  const handleAddBieuMau = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const selectedLd = LOAI_DON_OPTIONS.find((l) => l.id === loaiDonId);

    const newItem: BieuMauItem = {
      id: `bm-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      loaiDonId: loaiDonId,
      loaiDonName: selectedLd ? selectedLd.name : 'Áp dụng chung tất cả loại đơn',
      applicableStepName: stepName.trim() || 'Xác minh & Xử lý',
      fileFormat: format,
      fileSize: '54 KB',
      status: 'active',
      version: 'v1.0',
      updatedAt: 'Hôm nay',
      updatedBy: 'Nguyễn Minh Anh',
    };

    setItems((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setCode('');
    setName('');
    setStepName('');
    showToast(`✓ Đã thêm biểu mẫu "${newItem.code} - ${newItem.name}".`);
  };

  const renderFormatBadge = (fmt: string) => {
    switch (fmt) {
      case 'DOCX':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">DOCX</span>;
      case 'PDF':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">PDF</span>;
      case 'XLSX':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">XLSX</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">{fmt}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-5 overflow-y-auto bg-[#f4f7fb]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">description</span>
            Kho Biểu mẫu điện tử hành chính
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các mẫu văn bản, biên bản, tờ trình, kết luận được đính kèm vào các bước trong quy trình xử lý
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[17px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm biểu mẫu..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <select
            value={selectedLoaiDon}
            onChange={(e) => setSelectedLoaiDon(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="all">Tất cả Loại đơn</option>
            {LOAI_DON_OPTIONS.map((ld) => (
              <option key={ld.id} value={ld.id}>
                {ld.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Thêm biểu mẫu</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11.5px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[130px]">Mã biểu mẫu</th>
                <th className="py-3 px-4 min-w-[260px]">Tên biểu mẫu</th>
                <th className="py-3 px-4 min-w-[170px]">Loại đơn áp dụng</th>
                <th className="py-3 px-4 min-w-[170px]">Bước áp dụng</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Định dạng</th>
                <th className="py-3 px-4 text-center min-w-[90px]">Phiên bản</th>
                <th className="py-3 px-4 min-w-[130px]">Cập nhật</th>
                <th className="py-3 px-4 text-right min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-xs">
                    {item.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors block text-[13px]">
                      {item.name}
                    </span>
                    <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                      Dung lượng: {item.fileSize}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">label</span>
                      {item.loaiDonName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.applicableStepName}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {renderFormatBadge(item.fileFormat)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600">
                    {item.version}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {item.updatedAt}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => showToast(`✓ Đang tải xuống biểu mẫu ${item.code}...`)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Tải xuống biểu mẫu"
                      >
                        <span className="material-symbols-outlined text-[17px]">download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Xem chi tiết biểu mẫu ${item.code}`)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Xem trước"
                      >
                        <span className="material-symbols-outlined text-[17px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Biểu mẫu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Thêm mới biểu mẫu điện tử
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddBieuMau} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mã biểu mẫu *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BM-08/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Định dạng file</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="DOCX">Microsoft Word (.docx)</option>
                    <option value="PDF">Adobe Acrobat (.pdf)</option>
                    <option value="XLSX">Microsoft Excel (.xlsx)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tên biểu mẫu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vd: Giấy triệu tập đương sự..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Loại đơn áp dụng</label>
                <select
                  value={loaiDonId}
                  onChange={(e) => setLoaiDonId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">Áp dụng chung tất cả loại đơn</option>
                  {LOAI_DON_OPTIONS.map((ld) => (
                    <option key={ld.id} value={ld.id}>
                      {ld.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Bước quy trình áp dụng</label>
                <input
                  type="text"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="Vd: Xác minh nội dung tố cáo..."
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
                  Lưu biểu mẫu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-xs animate-in slide-in-from-bottom duration-200">
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
