// src/screens/workflowAdmin/CreateWorkflowScreen.tsx
import React, { useState } from 'react';
import { ProcessWorkflow } from '../../types/workflowConfig';
import { LOAI_DON_OPTIONS } from '../../constants';
import { WORKFLOW_TEMPLATES, WorkflowTemplateMeta } from './templates/workflowTemplates';

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
  const [creationMode, setCreationMode] = useState<'TEMPLATE' | 'BLANK'>('TEMPLATE');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-basic');

  // Tự sinh mã quy trình
  const defaultCode = `QT-QD-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`;

  const selectedTemplate = WORKFLOW_TEMPLATES.find((t) => t.id === selectedTemplateId) || WORKFLOW_TEMPLATES[0];

  const [name, setName] = useState(selectedTemplate?.name || '');
  const [code, setCode] = useState(selectedTemplate?.codePrefix ? `${selectedTemplate.codePrefix}-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}` : defaultCode);
  const [loaiDonId, setLoaiDonId] = useState(selectedTemplate?.loaiDonId || '');
  const [description, setDescription] = useState(selectedTemplate?.description || '');
  const [version, setVersion] = useState('v1.0');
  const [errors, setErrors] = useState<{ name?: string; loaiDonId?: string }>({});

  const isBasicInfoFilled = Boolean(name.trim() && loaiDonId);

  const handleSelectTemplate = (tpl: WorkflowTemplateMeta) => {
    setSelectedTemplateId(tpl.id);
    setName(tpl.name);
    setCode(`${tpl.codePrefix}-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`);
    setLoaiDonId(tpl.loaiDonId);
    setDescription(tpl.description);
    setErrors({});
  };

  const handleLoaiDonChange = (id: string) => {
    setLoaiDonId(id);
    if (errors.loaiDonId) {
      setErrors((prev) => ({ ...prev, loaiDonId: undefined }));
    }

    let prefix = 'QT-QD';
    if (id === 'to-cao') prefix = 'QT-TC';
    else if (id === 'khieu-nai') prefix = 'QT-KN';
    else if (id === 'kien-nghi') prefix = 'QT-KNPA';
    else if (id === 'van-ban') prefix = 'QT-VB';
    else if (id === 'tranh-chap') prefix = 'QT-DC';

    setCode(`${prefix}-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`);
  };

  const handleRegenerateCode = () => {
    let prefix = 'QT-QD';
    if (loaiDonId === 'to-cao') prefix = 'QT-TC';
    else if (loaiDonId === 'khieu-nai') prefix = 'QT-KN';
    else if (loaiDonId === 'kien-nghi') prefix = 'QT-KNPA';
    else if (loaiDonId === 'van-ban') prefix = 'QT-VB';
    else if (loaiDonId === 'tranh-chap') prefix = 'QT-DC';

    setCode(`${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newErrors: { name?: string; loaiDonId?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Vui lòng nhập tên quy trình xử lý.';
    }
    if (!loaiDonId) {
      newErrors.loaiDonId = 'Quy trình bắt buộc phải gắn với 01 loại đơn / hồ sơ.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedLoaiDon = LOAI_DON_OPTIONS.find((l) => l.id === loaiDonId);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let newWorkflow: ProcessWorkflow;

    if (creationMode === 'TEMPLATE' && selectedTemplate) {
      // Clone từ template mẫu mà không thay đổi template gốc
      newWorkflow = {
        ...JSON.parse(JSON.stringify(selectedTemplate.workflow)),
        id: `wf-${Date.now()}`,
        code: code.trim() || defaultCode,
        name: name.trim(),
        loaiDonId: loaiDonId,
        loaiDonName: selectedLoaiDon?.name || selectedTemplate.loaiDonName,
        version: version.trim() || 'v1.0',
        status: 'draft',
        description: description.trim(),
        updatedAt: dateStr,
        updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
        versionHistory: [
          {
            version: version.trim() || 'v1.0',
            publishedAt: 'Bản nháp khởi tạo từ mẫu',
            publishedBy: 'Nguyễn Minh Anh',
            notes: `Khởi tạo từ mẫu "${selectedTemplate.name}"`,
            isCurrentActive: true,
          },
        ],
      };
    } else {
      // Khởi tạo quy trình từ đầu (Blank)
      newWorkflow = {
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
          { id: 'lane-vt', name: 'Tiếp nhận / Văn thư', code: 'VT', order: 1, description: 'Tiếp nhận, vào sổ ban đầu' },
          { id: 'lane-cm', name: 'Cán bộ Chuyên môn', code: 'CM', order: 2, description: 'Thụ lý và xử lý nghiệp vụ' },
          { id: 'lane-ld', name: 'Lãnh đạo phê duyệt', code: 'LD', order: 3, description: 'Ký số và ban hành kết quả' },
        ],
        stages: [
          { id: 'stg-1', name: 'Tiếp nhận', order: 1 },
          { id: 'stg-2', name: 'Xử lý', order: 2 },
          { id: 'stg-3', name: 'Phê duyệt & Ban hành', order: 3 },
        ],
        steps: [
          {
            id: `step-${Date.now()}-1`,
            code: 'STEP-01',
            name: 'Tiếp nhận hồ sơ',
            nodeType: 'START',
            laneId: 'lane-vt',
            stageId: 'stg-1',
            description: 'Tiếp nhận và khởi tạo hồ sơ trên hệ thống.',
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
            notes: 'Khởi tạo quy trình mới từ đầu',
            isCurrentActive: true,
          },
        ],
      };
    }

    onCreateAndDesign(newWorkflow);
  };

  return (
    <div className="bg-[#f4f7fb]">
      {/* 1. HEADER & BREADCRUMB */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
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
              Thiết kế quy trình linh hoạt cho mọi loại nghiệp vụ hành chính: Tố cáo, Khiếu nại, Kiến nghị, Văn bản và Phê duyệt
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              <span>Đi tới màn thiết kế quy trình</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FORM BODY */}
      <div className="p-6 mx-auto w-full space-y-6">
        {/* Phương thức tạo: Template vs Blank */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Chọn phương thức khởi tạo
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bạn có thể tạo nhanh dựa trên mẫu quy trình chuẩn hóa hoặc bắt đầu thiết kế từ sơ đồ trống
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCreationMode('TEMPLATE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${creationMode === 'TEMPLATE'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                <span>Dùng mẫu quy trình ({WORKFLOW_TEMPLATES.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCreationMode('BLANK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${creationMode === 'BLANK'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Tạo từ đầu (Trống)</span>
              </button>
            </div>
          </div>

          {/* Grid of Templates if TEMPLATE mode */}
          {creationMode === 'TEMPLATE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-150">
              {WORKFLOW_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tpl.badgeColor}`}>
                          {tpl.loaiDonName}
                        </span>

                      </div>

                      <h3 className="font-bold text-slate-900 text-xs leading-snug mb-1">
                        {tpl.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        Mã tiền tố: {tpl.codePrefix}
                      </span>
                      {isSelected ? (
                        <span className="font-bold text-blue-700 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          Đã chọn
                        </span>
                      ) : (
                        <span className="text-slate-400 group-hover:text-slate-600">Chọn mẫu này</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form thông tin chi tiết */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  2. Thông tin cơ bản quy trình
                </h2>
              </div>
              {isBasicInfoFilled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Đã đủ thông tin cơ bản</span>
                </span>
              )}
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
                placeholder="Ví dụ: Quy trình tiếp nhận và thụ lý xử lý hồ sơ..."
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.name ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                  } rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all`}
              />
              {errors.name && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Row 2: Mã quy trình & Loại hồ sơ áp dụng */}
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
              </div>

              {/* Loại đơn / văn bản áp dụng */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Loại nghiệp vụ / Đơn áp dụng <span className="text-rose-600">*</span>
                </label>
                <select
                  value={loaiDonId}
                  onChange={(e) => handleLoaiDonChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.loaiDonId ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                    } rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none transition-all cursor-pointer`}
                >
                  <option value="">-- Chọn loại đơn / nghiệp vụ áp dụng --</option>
                  <option value="don-chung">Đơn thư thông thường</option>
                  <option value="to-cao">Đơn tố cáo</option>
                  <option value="khieu-nai">Đơn khiếu nại</option>
                  <option value="kien-nghi">Kiến nghị, phản ánh</option>
                  <option value="van-ban">Văn bản hành chính / Phê duyệt</option>
                  <option value="tranh-chap">Tranh chấp đất đai</option>
                </select>
                {errors.loaiDonId && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {errors.loaiDonId}
                  </span>
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
                placeholder="Ghi chú phạm vi áp dụng, căn cứ pháp lý, quy chế nội bộ hoặc văn bản chỉ đạo liên quan..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Nút/Banner điều hướng đi tới màn thiết kế quy trình sau khi nhập thông tin cơ bản */}
          <div
            className={`p-4 rounded-2xl border transition-all ${isBasicInfoFilled
              ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 border-blue-200 shadow-2xs'
              : 'bg-slate-50 border-slate-200/90'
              }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${isBasicInfoFilled ? 'bg-[#004ac6] text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                >
                  <span className="material-symbols-outlined text-[22px]">account_tree</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xs font-bold uppercase tracking-wide ${isBasicInfoFilled ? 'text-blue-950' : 'text-slate-700'
                        }`}
                    >
                      {isBasicInfoFilled ? 'Thông tin cơ bản đã sẵn sàng' : 'Tiếp tục bước thiết kế sơ đồ'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isBasicInfoFilled
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                    >
                      {isBasicInfoFilled ? 'Sẵn sàng thiết kế' : 'Cần nhập Tên & Loại đơn'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isBasicInfoFilled
                      ? 'Thông tin cơ bản đã được thiết lập đầy đủ. Bấm nút bên cạnh để chuyển sang giao diện Canvas thiết kế luồng, phân làn và cấu hình chi tiết.'
                      : 'Sau khi điền Tên quy trình và chọn Loại nghiệp vụ áp dụng, bạn có thể chuyển ngay sang màn hình Thiết kế sơ đồ.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSubmit()}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 ${isBasicInfoFilled
                  ? 'bg-[#004ac6] hover:bg-[#003ea8] text-white hover:shadow-md'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span>Đi tới màn thiết kế quy trình</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* 3. ACTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
              <span>Hệ thống sẽ lưu bản nháp và chuyển tiếp ngay sang màn hình Thiết kế sơ đồ quy trình.</span>
            </div>

            <div className="flex items-center gap-3">
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
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span>Đi tới màn thiết kế quy trình</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
