// src/screens/workflowAdmin/CreateWorkflowScreen.tsx
import React, { useState } from 'react';
import { ProcessWorkflow } from '../../types/workflowConfig';
import { LOAI_DON_OPTIONS } from '../../constants';

interface CreateWorkflowScreenProps {
  onCancel: () => void;
  onCreateAndDesign: (newWf: ProcessWorkflow) => void;
  existingWorkflowsCount: number;
  existingWorkflows?: ProcessWorkflow[];
}

export default function CreateWorkflowScreen({
  onCancel,
  onCreateAndDesign,
  existingWorkflowsCount,
  existingWorkflows = [],
}: CreateWorkflowScreenProps) {
  // Tự sinh mã quy trình
  const defaultCode = `QT-QD-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`;

  const [name, setName] = useState('');
  const [code, setCode] = useState(defaultCode);
  const [loaiDonId, setLoaiDonId] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [errors, setErrors] = useState<{ name?: string; loaiDonId?: string }>({});

  // Tìm quy trình đang áp dụng hiện tại của Loại đơn đã chọn
  const currentActiveWorkflow = existingWorkflows.find(
    (w) => w.loaiDonId === loaiDonId && w.status === 'published' && w.isLatestForLoaiDon
  ) || existingWorkflows.find(
    (w) => w.loaiDonId === loaiDonId && w.status === 'published'
  ) || existingWorkflows.find(
    (w) => w.loaiDonId === loaiDonId
  );

  const handleLoaiDonChange = (id: string) => {
    setLoaiDonId(id);
    if (errors.loaiDonId) {
      setErrors((prev) => ({ ...prev, loaiDonId: undefined }));
    }

    // Tự sinh mã theo loại đơn
    let prefix = 'QT-QD';
    if (id === 'to-cao') prefix = 'QT-TC';
    else if (id === 'khieu-nai') prefix = 'QT-KN';
    else if (id === 'kien-nghi') prefix = 'QT-KNPA';
    else if (id === 'tranh-chap') prefix = 'QT-DC';

    setCode(`${prefix}-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`);
  };

  const handleRegenerateCode = () => {
    let prefix = 'QT-QD';
    if (loaiDonId === 'to-cao') prefix = 'QT-TC';
    else if (loaiDonId === 'khieu-nai') prefix = 'QT-KN';
    else if (loaiDonId === 'kien-nghi') prefix = 'QT-KNPA';
    else if (loaiDonId === 'tranh-chap') prefix = 'QT-DC';

    setCode(`${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; loaiDonId?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên quy trình xử lý.';
    }
    if (!loaiDonId) {
      newErrors.loaiDonId = 'Quy trình bắt buộc phải gắn với 01 loại đơn cụ thể.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedLoaiDon = LOAI_DON_OPTIONS.find((l) => l.id === loaiDonId);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Khởi tạo các nhóm trách nhiệm và giai đoạn mặc định chuẩn Gov
    const newWorkflow: ProcessWorkflow = {
      id: `wf-${Date.now()}`,
      code: code.trim() || defaultCode,
      name: name.trim(),
      loaiDonId: loaiDonId,
      loaiDonName: selectedLoaiDon?.name || 'Chưa xác định',
      version: version.trim() || 'v1.0',
      status: 'draft',
      description: description.trim(),
      updatedAt: dateStr,
      updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
      lanes: [
        { id: 'lane-vt', name: 'Văn thư', code: 'VT', order: 1, description: 'Tiếp nhận, vào sổ, phát hành' },
        { id: 'lane-cm', name: 'Chuyên môn', code: 'CM', order: 2, description: 'Xác minh, thẩm định, đề xuất' },
        { id: 'lane-ld', name: 'Lãnh đạo', code: 'LD', order: 3, description: 'Phê duyệt, kết luận, ký quyết định' },
      ],
      stages: [
        { id: 'stg-1', name: 'Tiếp nhận đơn', order: 1 },
        { id: 'stg-2', name: 'Xác minh & Xử lý', order: 2 },
        { id: 'stg-3', name: 'Đề xuất & Báo cáo', order: 3 },
        { id: 'stg-4', name: 'Phê duyệt & Kết luận', order: 4 },
        { id: 'stg-5', name: 'Thông báo & Lưu hồ sơ', order: 5 },
      ],
      steps: [
        {
          id: `step-${Date.now()}-1`,
          code: 'STEP-01',
          name: 'Tiếp nhận & Vào sổ hồ sơ',
          laneId: 'lane-vt',
          stageId: 'stg-1',
          description: 'Tiếp nhận ban đầu và cấp mã theo dõi hồ sơ.',
          isStart: true,
          isEnd: false,
          timeLimitDays: 1,
          workHours: 8,
          warningBeforeHours: 2,
          workSchedule: 'Giờ hành chính (8h-17h, Thứ 2 - Thứ 6)',
          storedDocuments: ['Giấy biên nhận hồ sơ'],
          stepForms: [],
          statusChangeDoc: '',
        },
      ],
      transitions: [],
      versionHistory: [
        {
          version: version.trim() || 'v1.0',
          publishedAt: 'Bản nháp khởi tạo',
          publishedBy: 'Nguyễn Minh Anh',
          notes: 'Khởi tạo quy trình mới',
          isCurrentActive: true,
        },
      ],
    };

    onCreateAndDesign(newWorkflow);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7fb] overflow-y-auto">
      {/* 1. HEADER & BREADCRUMB */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Quản trị nghiệp vụ
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-slate-800 transition-colors cursor-pointer"
          >
            Quy trình xử lý
          </button>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-blue-700 font-semibold">Tạo quy trình</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-blue-600 text-[26px]">post_add</span>
          Tạo mới Quy trình xử lý
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Khai báo thông tin định danh ban đầu và gắn quy trình với một Loại đơn trong hệ thống GOVEX
        </p>
      </div>

      {/* 2. FORM BODY */}
      <div className="p-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Thông tin quy trình
              </h2>
            </div>

            {/* Row 1: Tên quy trình */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tên quy trình <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ví dụ: Quy trình giải quyết đơn tố cáo sai phạm đất đai..."
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                  errors.name ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                } rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all`}
              />
              {errors.name && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Row 2: Mã quy trình & Loại đơn áp dụng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mã quy trình */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Mã quy trình <span className="text-slate-400 font-normal">(Hệ thống tự sinh)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">autorenew</span>
                    Sinh mã mới
                  </button>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  Mã duy nhất dùng để tra cứu và định danh trong toàn hệ thống
                </span>
              </div>

              {/* Loại đơn áp dụng */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Loại đơn áp dụng <span className="text-rose-600">*</span>
                </label>
                <select
                  value={loaiDonId}
                  onChange={(e) => handleLoaiDonChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                    errors.loaiDonId ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                  } rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition-all cursor-pointer`}
                >
                  <option value="">-- Chọn 01 Loại đơn áp dụng trong hệ thống --</option>
                  {LOAI_DON_OPTIONS.map((ld) => (
                    <option key={ld.id} value={ld.id}>
                      {ld.name}
                    </option>
                  ))}
                </select>
                {errors.loaiDonId ? (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.loaiDonId}
                  </span>
                ) : (
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    Mỗi quy trình khi tạo phải được gắn chặt với 01 loại đơn cụ thể
                  </span>
                )}

                {/* Hộp thông tin tự động liên kết phiên bản mới nhất */}
                {loaiDonId && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-800">
                      <span className="material-symbols-outlined text-[15px] text-blue-600">sync_alt</span>
                      Cơ chế cập nhật phiên bản tự động:
                    </div>
                    {currentActiveWorkflow ? (
                      <p className="text-slate-600 leading-relaxed">
                        Loại đơn này hiện đang gắn với quy trình: <strong className="text-slate-900">{currentActiveWorkflow.name}</strong> ({currentActiveWorkflow.code} • Phiên bản <span className="font-mono font-bold text-blue-700">{currentActiveWorkflow.version}</span>). Khi bạn thiết kế và phát hành quy trình mới này, loại đơn sẽ <strong>tự động chuyển sang áp dụng phiên bản mới nhất</strong> cho toàn bộ hồ sơ phát sinh mới.
                      </p>
                    ) : (
                      <p className="text-slate-600 leading-relaxed">
                        Loại đơn này chưa có quy trình hiệu lực. Quy trình này sau khi phát hành sẽ trở thành phiên bản mặc định đầu tiên áp dụng cho loại đơn.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Phiên bản & Trạng thái */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Phiên bản
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Trạng thái khởi tạo
                </label>
                <div className="px-3.5 py-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold text-amber-800">Bản nháp (Mặc định)</span>
                  <span className="text-[11px] text-amber-700/80 ml-auto">Chưa áp dụng cho hồ sơ thực tế</span>
                </div>
              </div>
            </div>

            {/* Row 4: Mô tả */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Mô tả chi tiết quy trình
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi chú phạm vi áp dụng, căn cứ pháp luật (Luật, Nghị định, Thông tư liên quan)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* 3. ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>Tạo &amp; thiết kế</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
