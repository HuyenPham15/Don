// src/screens/workflowAdmin/components/CreateWorkflowModal.tsx
import React, { useState, useEffect } from 'react';
import { ProcessWorkflow } from '../../../types/workflowConfig';
import { LOAI_DON_OPTIONS } from '../../../constants';
import { WORKFLOW_TEMPLATES, WorkflowTemplateMeta } from '../templates/workflowTemplates';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAndDesign: (newWf: ProcessWorkflow) => void;
  existingWorkflowsCount: number;
}

export default function CreateWorkflowModal({
  isOpen,
  onClose,
  onCreateAndDesign,
  existingWorkflowsCount,
}: CreateWorkflowModalProps) {
  const [creationMode, setCreationMode] = useState<'BLANK' | 'TEMPLATE'>('BLANK');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-basic');

  const defaultCode = `QT-QD-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`;

  const [name, setName] = useState('');
  const [code, setCode] = useState(defaultCode);
  const [loaiDonId, setLoaiDonId] = useState(LOAI_DON_OPTIONS[0]?.id || 'to-cao');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [errors, setErrors] = useState<{ name?: string; loaiDonId?: string }>({});

  // Reset form khi modal mở ra
  useEffect(() => {
    if (isOpen) {
      setCreationMode('BLANK');
      setName('');
      const initLoaiDon = LOAI_DON_OPTIONS[0]?.id || 'to-cao';
      setLoaiDonId(initLoaiDon);
      setCode(generateCodeForLoaiDon(initLoaiDon));
      setDescription('');
      setVersion('v1.0');
      setErrors({});
    }
  }, [isOpen, existingWorkflowsCount]);

  if (!isOpen) return null;

  function generateCodeForLoaiDon(id: string) {
    let prefix = 'QT-QD';
    if (id === 'to-cao') prefix = 'QT-TC';
    else if (id === 'khieu-nai') prefix = 'QT-KN';
    else if (id === 'kien-nghi') prefix = 'QT-KNPA';
    else if (id === 'van-ban') prefix = 'QT-VB';
    else if (id === 'tranh-chap') prefix = 'QT-DC';

    return `${prefix}-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`;
  }

  const handleLoaiDonChange = (id: string) => {
    setLoaiDonId(id);
    if (errors.loaiDonId) {
      setErrors((prev) => ({ ...prev, loaiDonId: undefined }));
    }
    setCode(generateCodeForLoaiDon(id));
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

  const handleSelectTemplate = (tpl: WorkflowTemplateMeta) => {
    setSelectedTemplateId(tpl.id);
    setName(tpl.name);
    setCode(`${tpl.codePrefix}-2026-${String(existingWorkflowsCount + 1).padStart(3, '0')}`);
    setLoaiDonId(tpl.loaiDonId);
    setDescription(tpl.description);
    setErrors({});
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

    const selectedTemplate = WORKFLOW_TEMPLATES.find((t) => t.id === selectedTemplateId) || WORKFLOW_TEMPLATES[0];

    if (creationMode === 'TEMPLATE' && selectedTemplate) {
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
      // Khung vẽ trống (Blank)
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
          { id: 'lane-cm', name: 'Cán bộ Chuyên môn', code: 'CM', order: 1, description: 'Thụ lý và xử lý nghiệp vụ' },
          { id: 'lane-ld', name: 'Lãnh đạo phê duyệt', code: 'LD', order: 2, description: 'Ký số và ban hành kết quả' },
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
            laneId: 'lane-cm',
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
            notes: 'Khởi tạo quy trình mới từ khung vẽ ban đầu',
            isCurrentActive: true,
          },
        ],
      };
    }

    onClose();
    onCreateAndDesign(newWorkflow);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Thêm mới quy trình xử lý</h3>
              <p className="text-xs text-slate-500">
                Khởi tạo thông tin quy trình mới và thiết lập liên kết với loại đơn / hồ sơ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

          {creationMode === 'TEMPLATE' && (
            <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 space-y-2">
              <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                Chọn mẫu quy trình mẫu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {WORKFLOW_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${isSelected
                        ? 'border-indigo-600 bg-white shadow-2xs ring-1 ring-indigo-400'
                        : 'border-indigo-200/60 bg-white/70 hover:bg-white hover:border-indigo-300'
                        }`}
                    >
                      <div className="font-bold text-xs text-slate-800 truncate">{tpl.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{tpl.stepsCount} bước</span>
                        <span>•</span>
                        <span>{tpl.lanesCount} nhóm</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium">{tpl.loaiDonName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tên quy trình */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên quy trình xử lý <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ví dụ: Quy trình thụ lý và giải quyết đơn khiếu nại đất đai..."
              className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${errors.name
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-blue-500'
                }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>
                {errors.name}
              </p>
            )}
          </div>
          {/* Mã quy trình */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mã quy trình
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-blue-700 font-mono font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={handleRegenerateCode}
                title="Tạo mã ngẫu nhiên mới"
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">autorenew</span>
                <span>Đổi mã</span>
              </button>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mô tả quy trình
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả phạm vi áp dụng, căn cứ pháp lý, thời gian giải quyết..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-blue-600">info</span>
            <span>Hệ thống sẽ mở ngay khung vẽ thiết kế sau khi tạo</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">design_services</span>
              <span>Tạo & Mở thiết kế</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
