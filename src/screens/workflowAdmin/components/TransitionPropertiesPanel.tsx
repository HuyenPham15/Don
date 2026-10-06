// src/screens/workflowAdmin/components/TransitionPropertiesPanel.tsx
import React, { useState } from 'react';
import {
  ProcessTransition,
  ProcessStep,
  ProcessLane,
  TransitionCondition,
  ConditionFieldSource,
  ConditionOperator,
  TransitionDocCheckType,
  TransitionDocCheckMode,
  DocumentCondition,
  RequiredDocumentOnTransition,
  RealDocumentEntity,
} from '../../../types/workflowConfig';
import {
  CONDITION_SOURCES,
  CONDITION_OPERATORS,
  INITIAL_RECORD_DOCUMENTS,
} from '../../../constants/processWorkflows';

export { INITIAL_RECORD_DOCUMENTS };

interface TransitionPropertiesPanelProps {
  transition: ProcessTransition;
  steps: ProcessStep[];
  lanes: ProcessLane[];
  onUpdateTransition: (updated: ProcessTransition) => void;
  onDeleteTransition: (transId: string) => void;
  onClose: () => void;
}

// Mẫu thư viện chuẩn cho Transition
const STANDARD_TRANSITION_TEMPLATES: Record<
  string,
  {
    name: string;
    docCheckType: TransitionDocCheckType;
    docCheckMode: TransitionDocCheckMode;
    documentConditions: DocumentCondition[];
    requiredDocuments: RequiredDocumentOnTransition[];
  }
> = {
  normal: {
    name: 'Mẫu chuyển tiếp thông thường (Không kiểm tra văn bản)',
    docCheckType: 'none',
    docCheckMode: 'all',
    documentConditions: [],
    requiredDocuments: [],
  },
  check_step: {
    name: 'Mẫu chuyển tiếp thẩm tra (Kiểm tra văn bản tại bước)',
    docCheckType: 'check_existing',
    docCheckMode: 'all',
    documentConditions: [
      {
        id: 'dc-1',
        documentType: 'Đơn tố cáo',
        documentName: 'Đơn tố cáo',
        required: true,
        status: 'available',
        documentId: 'DOC-001',
      },
      {
        id: 'dc-2',
        documentType: 'Biên bản tiếp nhận',
        documentName: 'Biên bản tiếp nhận',
        required: true,
        status: 'available',
        documentId: 'DOC-002',
      },
      {
        id: 'dc-3',
        documentType: 'Tài liệu xác minh',
        documentName: 'Tài liệu xác minh',
        required: false,
        status: 'missing',
      },
    ],
    requiredDocuments: [],
  },
  require_submit: {
    name: 'Mẫu chuyển tiếp hoàn tất (Yêu cầu văn bản khi chuyển bước)',
    docCheckType: 'require_on_transition',
    docCheckMode: 'all',
    documentConditions: [],
    requiredDocuments: [
      {
        id: 'rd-1',
        documentType: 'Báo cáo đề xuất',
        documentName: 'Báo cáo đề xuất',
        required: true,
        providerRole: 'Cán bộ xử lý',
      },
      {
        id: 'rd-2',
        documentType: 'Biên bản xác minh',
        documentName: 'Biên bản xác minh',
        required: true,
        providerRole: 'Cán bộ xử lý',
      },
    ],
  },
};

function InheritBadge({ isOverridden }: { isOverridden?: boolean }) {
  if (isOverridden) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Tùy chỉnh riêng
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
      Mặc định
    </span>
  );
}

export default function TransitionPropertiesPanel({
  transition,
  steps,
  lanes,
  onUpdateTransition,
  onDeleteTransition,
  onClose,
}: TransitionPropertiesPanelProps) {
  const fromStep = steps.find((s) => s.id === transition.fromStepId);
  const toStep = steps.find((s) => s.id === transition.toStepId);

  // Kho văn bản thực tế trong hồ sơ (quản lý state mô phỏng)
  const [dossierDocs, setDossierDocs] = useState<RealDocumentEntity[]>(INITIAL_RECORD_DOCUMENTS);

  // 1. Cấu hình kiểm tra văn bản điều kiện chuyển bước
  const docCheckType: TransitionDocCheckType = transition.docCheckType || (
    transition.conditions.some((c) => c.fieldSource === 'van_ban') ? 'check_existing' : 'none'
  );
  const docCheckMode: TransitionDocCheckMode = transition.docCheckMode || 'all';

  // Danh sách điều kiện văn bản đã tồn tại (chế độ check_existing)
  const documentConditions: DocumentCondition[] = transition.documentConditions && transition.documentConditions.length > 0
    ? transition.documentConditions
    : [
        {
          id: 'dc-1',
          documentType: 'Đơn tố cáo',
          documentName: 'Đơn tố cáo',
          required: true,
          status: 'available',
          documentId: 'DOC-001',
        },
        {
          id: 'dc-2',
          documentType: 'Biên bản tiếp nhận',
          documentName: 'Biên bản tiếp nhận',
          required: true,
          status: 'available',
          documentId: 'DOC-002',
        },
        {
          id: 'dc-3',
          documentType: 'Tài liệu xác minh',
          documentName: 'Tài liệu xác minh',
          required: false,
          status: 'missing',
        },
      ];

  // Danh sách văn bản yêu cầu khi chuyển bước (chế độ require_on_transition)
  const requiredDocuments: RequiredDocumentOnTransition[] = transition.requiredDocuments && transition.requiredDocuments.length > 0
    ? transition.requiredDocuments
    : [
        {
          id: 'rd-1',
          documentType: 'Báo cáo đề xuất',
          documentName: 'Báo cáo đề xuất',
          required: true,
          providerRole: 'Cán bộ xử lý',
        },
        {
          id: 'rd-2',
          documentType: 'Biên bản xác minh',
          documentName: 'Biên bản xác minh',
          required: true,
          providerRole: 'Cán bộ xử lý',
        },
      ];

  // Trạng thái Override & Kế thừa
  const isCustomized = Boolean(transition.isCustomized || transition.docConditionsOverride);
  const inheritedName = transition.inheritedFromName || (
    docCheckType === 'check_existing'
      ? STANDARD_TRANSITION_TEMPLATES.check_step.name
      : docCheckType === 'require_on_transition'
      ? STANDARD_TRANSITION_TEMPLATES.require_submit.name
      : STANDARD_TRANSITION_TEMPLATES.normal.name
  );

  // Modal thêm/chọn văn bản kiểm tra
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Đơn tố cáo');
  const [newDocRequired, setNewDocRequired] = useState(true);

  // Modal thêm văn bản yêu cầu khi chuyển bước
  const [isAddReqDocModalOpen, setIsAddReqDocModalOpen] = useState(false);
  const [newReqDocName, setNewReqDocName] = useState('');
  const [newReqDocType, setNewReqDocType] = useState('Báo cáo đề xuất');
  const [newReqDocRole, setNewReqDocRole] = useState('Cán bộ xử lý');
  const [newReqDocRequired, setNewReqDocRequired] = useState(true);

  // Modal chạy thử "Đẩy bước"
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulationState, setSimulationState] = useState<{
    status: 'initial' | 'need_documents' | 'success' | 'error';
    missingDocs?: string[];
    providedDocsMap?: Record<string, boolean>;
    message?: string;
  }>({ status: 'initial' });

  // ── Handlers Điều kiện logic ──
  const handleAddCondition = () => {
    const newCond: TransitionCondition = {
      id: `cond-${Date.now()}`,
      logicOp: 'AND',
      fieldSource: 'ho_so',
      fieldName: '',
      operator: '=',
      value: '',
    };
    onUpdateTransition({
      ...transition,
      conditions: [...transition.conditions, newCond],
      isCustomized: true,
    });
  };

  const handleUpdateCondition = (condId: string, patch: Partial<TransitionCondition>) => {
    onUpdateTransition({
      ...transition,
      conditions: transition.conditions.map((c) => (c.id === condId ? { ...c, ...patch } : c)),
      isCustomized: true,
    });
  };

  const handleRemoveCondition = (condId: string) => {
    onUpdateTransition({
      ...transition,
      conditions: transition.conditions.filter((c) => c.id !== condId),
      isCustomized: true,
    });
  };

  // ── Handlers Kiểm tra văn bản (Doc Check Types) ──
  const handleChangeDocCheckType = (type: TransitionDocCheckType) => {
    onUpdateTransition({
      ...transition,
      docCheckType: type,
      docCheckMode: transition.docCheckMode || 'all',
      documentConditions: type === 'check_existing' ? documentConditions : transition.documentConditions,
      requiredDocuments: type === 'require_on_transition' ? requiredDocuments : transition.requiredDocuments,
      isCustomized: true,
      docConditionsOverride: true,
    });
  };

  const handleChangeDocCheckMode = (mode: TransitionDocCheckMode) => {
    onUpdateTransition({
      ...transition,
      docCheckMode: mode,
      isCustomized: true,
      docConditionsOverride: true,
    });
  };

  // Thêm văn bản kiểm tra tại bước
  const handleConfirmAddDocCondition = () => {
    if (!newDocName.trim()) return;
    // Kiểm tra xem trong hồ sơ đã có văn bản này chưa (tham chiếu, không sinh mới)
    const matchedExisting = dossierDocs.find(
      (d) => d.name.toLowerCase().includes(newDocName.toLowerCase()) || d.documentType === newDocType
    );
    const newCondItem: DocumentCondition = {
      id: `dc-${Date.now()}`,
      documentType: newDocType,
      documentName: newDocName.trim(),
      required: newDocRequired,
      status: matchedExisting ? 'available' : 'missing',
      documentId: matchedExisting?.id,
    };
    const updated = [...documentConditions, newCondItem];
    onUpdateTransition({
      ...transition,
      documentConditions: updated,
      isCustomized: true,
      docConditionsOverride: true,
    });
    setNewDocName('');
    setIsAddDocModalOpen(false);
  };

  // Xóa văn bản kiểm tra tại bước
  const handleRemoveDocCondition = (condId: string) => {
    const updated = documentConditions.filter((c) => c.id !== condId);
    onUpdateTransition({
      ...transition,
      documentConditions: updated,
      isCustomized: true,
      docConditionsOverride: true,
    });
  };

  // Toggle bắt buộc cho văn bản kiểm tra
  const handleToggleDocConditionRequired = (condId: string) => {
    const updated = documentConditions.map((c) => (c.id === condId ? { ...c, required: !c.required } : c));
    onUpdateTransition({
      ...transition,
      documentConditions: updated,
      isCustomized: true,
      docConditionsOverride: true,
    });
  };

  // Thêm văn bản yêu cầu khi chuyển bước
  const handleConfirmAddRequiredDoc = () => {
    if (!newReqDocName.trim()) return;
    const newReqItem: RequiredDocumentOnTransition = {
      id: `rd-${Date.now()}`,
      documentType: newReqDocType,
      documentName: newReqDocName.trim(),
      required: newReqDocRequired,
      providerRole: newReqDocRole,
    };
    const updated = [...requiredDocuments, newReqItem];
    onUpdateTransition({
      ...transition,
      requiredDocuments: updated,
      isCustomized: true,
      docConditionsOverride: true,
    });
    setNewReqDocName('');
    setIsAddReqDocModalOpen(false);
  };

  // Xóa văn bản yêu cầu khi chuyển bước
  const handleRemoveRequiredDoc = (rdId: string) => {
    const updated = requiredDocuments.filter((r) => r.id !== rdId);
    onUpdateTransition({
      ...transition,
      requiredDocuments: updated,
      isCustomized: true,
      docConditionsOverride: true,
    });
  };

  // Toggle bắt buộc cho văn bản yêu cầu
  const handleToggleRequiredDocRequired = (rdId: string) => {
    const updated = requiredDocuments.map((r) => (r.id === rdId ? { ...r, required: !r.required } : r));
    onUpdateTransition({
      ...transition,
      requiredDocuments: updated,
      isCustomized: true,
      docConditionsOverride: true,
    });
  };

  // Khôi phục mặc định cho đường chuyển
  const handleResetToStandard = () => {
    let tplKey = 'normal';
    if (docCheckType === 'check_existing') tplKey = 'check_step';
    if (docCheckType === 'require_on_transition') tplKey = 'require_submit';
    const tpl = STANDARD_TRANSITION_TEMPLATES[tplKey];

    onUpdateTransition({
      ...transition,
      docCheckType: tpl.docCheckType,
      docCheckMode: tpl.docCheckMode,
      documentConditions: [...tpl.documentConditions],
      requiredDocuments: [...tpl.requiredDocuments],
      isCustomized: false,
      docConditionsOverride: false,
      inheritedFromName: tpl.name,
    });
  };

  // ── Interactive Simulation: "ĐẨY BƯỚC THỬ NGHIỆM" ──
  const handleRunTransitionSimulation = () => {
    // 1. Không kiểm tra văn bản
    if (docCheckType === 'none') {
      setSimulationState({
        status: 'success',
        message: 'Đẩy bước thành công! Quy trình không yêu cầu kiểm tra văn bản.',
      });
      setIsSimulateModalOpen(true);
      return;
    }

    // 2. Kiểm tra văn bản tại bước
    if (docCheckType === 'check_existing') {
      const missingList: string[] = [];
      const requiredItems = documentConditions.filter((c) => c.required);

      if (docCheckMode === 'all') {
        requiredItems.forEach((c) => {
          if (c.status !== 'available') {
            missingList.push(c.documentName);
          }
        });
      } else {
        // mode 'any': cần ít nhất 1 cái có sẵn
        const hasAtLeastOne = requiredItems.some((c) => c.status === 'available');
        if (!hasAtLeastOne && requiredItems.length > 0) {
          missingList.push(...requiredItems.map((c) => c.documentName));
        }
      }

      if (missingList.length > 0) {
        setSimulationState({
          status: 'error',
          missingDocs: missingList,
          message: 'Không thể chuyển bước vì còn thiếu văn bản bắt buộc trong hồ sơ.',
        });
      } else {
        setSimulationState({
          status: 'success',
          message: 'Đẩy bước thành công! Tất cả văn bản yêu cầu đã tồn tại trong hồ sơ (tham chiếu đúng bản ghi thực tế, không sinh duplicate).',
        });
      }
      setIsSimulateModalOpen(true);
      return;
    }

    // 3. Yêu cầu văn bản khi chuyển bước
    if (docCheckType === 'require_on_transition') {
      const initialMap: Record<string, boolean> = {};
      requiredDocuments.forEach((rd) => {
        initialMap[rd.id] = false;
      });
      setSimulationState({
        status: 'need_documents',
        providedDocsMap: initialMap,
      });
      setIsSimulateModalOpen(true);
    }
  };

  // Mô phỏng cung cấp văn bản khi chuyển bước
  const handleToggleProvideDoc = (rdId: string) => {
    setSimulationState((prev) => ({
      ...prev,
      providedDocsMap: {
        ...(prev.providedDocsMap || {}),
        [rdId]: !prev.providedDocsMap?.[rdId],
      },
    }));
  };

  // Xác nhận chuyển bước sau khi đã cung cấp đủ văn bản
  const handleConfirmSimulatedTransition = () => {
    // Kiểm tra các văn bản bắt buộc đã cung cấp đủ chưa
    const missingItems = requiredDocuments.filter(
      (rd) => rd.required && !simulationState.providedDocsMap?.[rd.id]
    );

    if (missingItems.length > 0) {
      alert(`Vui lòng cung cấp đầy đủ các văn bản bắt buộc:\n${missingItems.map((m) => `• ${m.documentName}`).join('\n')}`);
      return;
    }

    // LƯU CÁC VĂN BẢN THỰC TẾ VÀO HỒ SƠ (ONE DOCUMENT = ONE ENTITY)
    const newRealDocs: RealDocumentEntity[] = [];
    requiredDocuments.forEach((rd, idx) => {
      if (simulationState.providedDocsMap?.[rd.id]) {
        const newEntity: RealDocumentEntity = {
          id: `DOC-00${dossierDocs.length + idx + 1}`,
          code: `VB-ADD-${Date.now()}-${idx + 1}`,
          name: rd.documentName,
          documentType: rd.documentType,
          status: 'attached',
          fileName: `${rd.documentType.toLowerCase().replace(/\s+/g, '_')}_moi.pdf`,
          fileSize: '1.8 MB',
          createdAt: new Date().toLocaleDateString('vi-VN'),
          createdBy: rd.providerRole,
          stepId: transition.fromStepId,
        };
        newRealDocs.push(newEntity);
      }
    });

    if (newRealDocs.length > 0) {
      setDossierDocs((prev) => [...prev, ...newRealDocs]);
    }

    setSimulationState({
      status: 'success',
      message: `Đẩy bước thành công! Đã lưu ${newRealDocs.length} văn bản thực tế mới vào hồ sơ và hoàn tất chuyển tiếp sang bước tiếp theo.`,
    });
  };

  const renderConditionFormula = () => {
    if (!transition.conditions || transition.conditions.length === 0) return null;
    return (
      <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 leading-relaxed">
        <span className="font-bold text-slate-500 uppercase mr-1">Biểu thức:</span>
        {transition.conditions.map((c, i) => (
          <span key={c.id}>
            {i > 0 && <span className="font-bold text-blue-600 mx-1">{c.logicOp}</span>}
            <span className="text-slate-900 font-semibold">{c.fieldName || `[Trường ${i + 1}]`}</span>
            <span className="text-amber-600 font-bold mx-0.5">{c.operator}</span>
            <span className="text-emerald-700 font-semibold">{`"${c.value || '...'}"`}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <aside className="w-96 bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 shadow-lg select-none z-20 animate-in slide-in-from-right duration-150">
      {/* 1. Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`material-symbols-outlined text-[20px] ${
              transition.type === 'return' ? 'text-amber-600' : 'text-blue-600'
            }`}
          >
            {transition.type === 'return' ? 'undo' : 'trending_flat'}
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate">
              Thuộc tính đường chuyển bước
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <InheritBadge isOverridden={isCustomized} />
              <span className="text-[10px] text-slate-400 font-mono truncate">
                Mã: {transition.id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteTransition(transition.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa đường chuyển này"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Đóng panel"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Banner Kế thừa Thư viện chuẩn */}
        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-slate-500 font-medium">Đang kế thừa từ:</span>
            <InheritBadge isOverridden={isCustomized} />
          </div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-indigo-600">library_books</span>
            <span className="truncate">{inheritedName}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            {!isCustomized ? (
              <button
                type="button"
                onClick={() => onUpdateTransition({ ...transition, isCustomized: true, docConditionsOverride: true })}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">edit_note</span>
                Chỉnh sửa riêng
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetToStandard}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                Khôi phục mặc định
              </button>
            )}
            <span className="text-[10px] text-slate-400">Không sửa thư viện gốc</span>
          </div>
        </div>

        {/* Tên hành động */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Tên hành động / Nhãn đường chuyển <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={transition.actionName}
            onChange={(e) => onUpdateTransition({ ...transition, actionName: e.target.value, isCustomized: true })}
            placeholder="Vd: Chuyển xác minh, Trình lãnh đạo, Trả lại..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Bước nguồn & Bước đích */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Bước nguồn</label>
            <select
              value={transition.fromStepId}
              onChange={(e) => onUpdateTransition({ ...transition, fromStepId: e.target.value, isCustomized: true })}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Bước đích</label>
            <select
              value={transition.toStepId}
              onChange={(e) => onUpdateTransition({ ...transition, toStepId: e.target.value, isCustomized: true })}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tóm tắt trực quan hướng đi */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <span className="font-semibold text-slate-800 truncate max-w-[130px]">
            {fromStep?.name || transition.fromStepId}
          </span>
          <div className="flex items-center gap-1 text-slate-400 shrink-0 px-2">
            <span className="material-symbols-outlined text-[15px] text-blue-600">arrow_forward</span>
          </div>
          <span className="font-semibold text-slate-800 truncate max-w-[130px] text-right">
            {toStep?.name || transition.toStepId}
          </span>
        </div>

        {/* Loại đường chuyển: Bình thường / Trả lại */}
        <div>
          <label className="block font-bold text-slate-800 mb-1.5">Loại đường chuyển</label>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                transition.type === 'normal'
                  ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="transType"
                value="normal"
                checked={transition.type === 'normal'}
                onChange={() => onUpdateTransition({ ...transition, type: 'normal', isCustomized: true })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs">Bình thường</span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                transition.type === 'return'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="transType"
                value="return"
                checked={transition.type === 'return'}
                onChange={() => onUpdateTransition({ ...transition, type: 'return', isCustomized: true })}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs">Trả lại / Quay về</span>
            </label>
          </div>
        </div>

        {/* Nhóm/vai trò được phép thực hiện */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Nhóm / vai trò được phép thực hiện
          </label>
          <input
            type="text"
            value={transition.allowedRoles.join(', ')}
            onChange={(e) =>
              onUpdateTransition({
                ...transition,
                allowedRoles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                isCustomized: true,
              })
            }
            placeholder="Cán bộ thụ lý, Lãnh đạo đơn vị, Văn thư..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Có tạo Task bước tiếp theo hay không & Nhóm nhận Task */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Tạo Task cho bước tiếp</span>
              <span className="text-[11px] text-slate-500">Tự động sinh tác vụ vào danh sách việc cần làm</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={transition.createNextTask}
                onChange={(e) => onUpdateTransition({ ...transition, createNextTask: e.target.checked, isCustomized: true })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {transition.createNextTask && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nhóm nhận Task
              </label>
              <select
                value={transition.taskAssigneeRole}
                onChange={(e) => onUpdateTransition({ ...transition, taskAssigneeRole: e.target.value, isCustomized: true })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                {lanes.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION: ĐIỀU KIỆN CHUYỂN BƯỚC                                 */}
        {/* ============================================================== */}
        <div className="pt-3 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Điều kiện chuyển bước</span>
              </h4>
              <span className="text-[10.5px] text-slate-500">
                Chuẩn hóa kiểm tra dữ liệu logic &amp; văn bản tài liệu
              </span>
            </div>
          </div>

          {/* ── SUB-SECTION: KIỂM TRA VĂN BẢN (CHỌN 1 TRONG 3 LOẠI) ── */}
          <div className="p-3.5 bg-gradient-to-b from-indigo-50/50 to-slate-50/80 border border-indigo-200/80 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[17px]">verified_user</span>
                <span>Cấu hình kiểm tra văn bản</span>
              </span>
              <InheritBadge isOverridden={transition.docConditionsOverride} />
            </div>

            {/* Thông báo trách nhiệm duy nhất của Connector */}
            <div className="p-2.5 bg-blue-50/80 border border-blue-200/90 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
                <span>Nơi DUY NHẤT cấu hình yêu cầu văn bản để chuyển bước</span>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-relaxed">
                Đường chuyển (Connector) là nơi duy nhất quyết định điều kiện văn bản để được chuyển tiếp. Khác với <em>Tài liệu sử dụng tại bước</em> (chỉ mang tính tham chiếu cho cán bộ xem/xử lý), các điều kiện cấu hình tại đây sẽ trực tiếp đối soát hoặc yêu cầu nộp tài liệu để hoàn thành bước.
              </p>
            </div>

            {/* 3 Radio Options */}
            <div className="space-y-2">
              {/* Option 1: Không yêu cầu văn bản */}
              <label
                className={`p-3 rounded-xl border block cursor-pointer transition-all ${
                  docCheckType === 'none'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-2xs'
                    : 'bg-white/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="docCheckType"
                    checked={docCheckType === 'none'}
                    onChange={() => handleChangeDocCheckType('none')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      (1) Không yêu cầu văn bản
                    </span>
                    <span className="text-[10.5px] text-slate-500 block leading-tight mt-0.5">
                      Không yêu cầu và không kiểm tra document. Chỉ sử dụng các điều kiện logic khác nếu có.
                    </span>
                  </div>
                </div>
              </label>

              {/* Option 2: Kiểm tra văn bản đã có */}
              <label
                className={`p-3 rounded-xl border block cursor-pointer transition-all ${
                  docCheckType === 'check_existing'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-2xs'
                    : 'bg-white/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="docCheckType"
                    checked={docCheckType === 'check_existing'}
                    onChange={() => handleChangeDocCheckType('check_existing')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      (2) Kiểm tra văn bản đã có
                    </span>
                    <span className="text-[10.5px] text-slate-500 block leading-tight mt-0.5">
                      Kiểm tra các document hiện có trong hồ sơ (ví dụ: Đơn tố cáo, Biên bản tiếp nhận). Tham chiếu tài liệu có sẵn, <strong>không tạo document mới</strong>.
                    </span>
                  </div>
                </div>
              </label>

              {/* Option 3: Yêu cầu văn bản khi chuyển bước */}
              <label
                className={`p-3 rounded-xl border block cursor-pointer transition-all ${
                  docCheckType === 'require_on_transition'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-2xs'
                    : 'bg-white/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="docCheckType"
                    checked={docCheckType === 'require_on_transition'}
                    onChange={() => handleChangeDocCheckType('require_on_transition')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      (3) Yêu cầu văn bản khi chuyển bước
                    </span>
                    <span className="text-[10.5px] text-slate-500 block leading-tight mt-0.5">
                      Khi bấm &quot;Đẩy bước&quot;, người dùng phải nộp/upload văn bản. Sau khi cung cấp, hệ thống lưu document thực tế vào hồ sơ và cho chuyển bước.
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* ── CHI TIẾT OPTION 2: KIỂM TRA VĂN BẢN TẠI BƯỚC ── */}
            {docCheckType === 'check_existing' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    Văn bản/tài liệu cần kiểm tra
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddDocModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Chọn văn bản
                  </button>
                </div>

                {/* Cách kiểm tra (Tất cả / Chỉ cần một) */}
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-700 block">Cách kiểm tra:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="checkMode"
                        checked={docCheckMode === 'all'}
                        onChange={() => handleChangeDocCheckMode('all')}
                        className="text-blue-600"
                      />
                      <span className={docCheckMode === 'all' ? 'font-bold text-blue-900' : 'text-slate-600'}>
                        Tất cả văn bản phải có
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="checkMode"
                        checked={docCheckMode === 'any'}
                        onChange={() => handleChangeDocCheckMode('any')}
                        className="text-blue-600"
                      />
                      <span className={docCheckMode === 'any' ? 'font-bold text-blue-900' : 'text-slate-600'}>
                        Chỉ cần một trong các văn bản
                      </span>
                    </label>
                  </div>
                </div>

                {/* Bảng danh sách văn bản kiểm tra */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Văn bản</th>
                        <th className="py-2 px-2 text-center">Bắt buộc</th>
                        <th className="py-2 px-2 text-center">Trạng thái</th>
                        <th className="py-2 px-1 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documentConditions.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2.5">
                            <span className="font-semibold text-slate-900 block">{doc.documentName}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono">
                              Loại: {doc.documentType} {doc.documentId && `• Ref: ${doc.documentId}`}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDocConditionRequired(doc.id)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                doc.required
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                              title="Bấm để thay đổi tính bắt buộc"
                            >
                              {doc.required ? 'Có' : 'Không'}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-center">
                            {doc.status === 'available' ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                Đã có
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="material-symbols-outlined text-[12px]">pending</span>
                                Chưa có
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDocCondition(doc.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                              title="Xóa điều kiện này"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-[10.5px] text-amber-900 leading-relaxed">
                  <strong>Nguyên tắc One Document:</strong> Hệ thống chỉ đối chiếu tham chiếu các tệp đã có trong hồ sơ (VD: DOC-001). Tuyệt đối không tự động sinh thêm DOC-002 trùng loại.
                </div>
              </div>
            )}

            {/* ── CHI TIẾT OPTION 3: YÊU CẦU VĂN BẢN KHI CHUYỂN BƯỚC ── */}
            {docCheckType === 'require_on_transition' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    Văn bản yêu cầu khi chuyển bước
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddReqDocModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Thêm văn bản
                  </button>
                </div>

                {/* Bảng danh sách văn bản yêu cầu */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Loại văn bản</th>
                        <th className="py-2 px-2 text-center">Bắt buộc</th>
                        <th className="py-2 px-2">Người cung cấp</th>
                        <th className="py-2 px-1 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requiredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-2.5 font-semibold text-slate-900">
                            {doc.documentName}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRequiredDocRequired(doc.id)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                doc.required
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                              title="Bấm để thay đổi"
                            >
                              {doc.required ? 'Có' : 'Không'}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-slate-700 font-medium">
                            {doc.providerRole}
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRequiredDoc(doc.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                              title="Xóa yêu cầu này"
                            >
                              <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-lg text-[10.5px] text-indigo-900 leading-relaxed">
                  <strong>Hành vi khi Đẩy bước:</strong> Khi người dùng thao tác đẩy bước, hệ thống sẽ mở modal yêu cầu đính kèm các tài liệu trên. Khi đủ tài liệu, hệ thống mới lưu văn bản thực tế vào hồ sơ và cho phép chuyển tiếp.
                </div>
              </div>
            )}
          </div>

          {/* ── SUB-SECTION: ĐIỀU KIỆN LOGIC DỮ LIỆU KHÁC ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-800 text-xs">
                  Điều kiện logic ({transition.conditions.length})
                </h5>
                <span className="text-[10px] text-slate-500">
                  Ràng buộc trường dữ liệu hồ sơ, loại đơn, thẩm quyền...
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                Thêm điều kiện
              </button>
            </div>

            {/* Biểu thức logic preview */}
            {renderConditionFormula()}

            {/* Danh sách điều kiện */}
            <div className="space-y-2.5">
              {transition.conditions.map((cond, idx) => (
                <div
                  key={cond.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {idx > 0 ? (
                        <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateCondition(cond.id, { logicOp: 'AND' })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              cond.logicOp === 'AND' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            AND
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCondition(cond.id, { logicOp: 'OR' })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              cond.logicOp === 'OR' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            OR
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                          Điều kiện #{idx + 1}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Xóa điều kiện này"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>

                  {/* Nguồn điều kiện & Trường dữ liệu */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                        Nguồn điều kiện
                      </label>
                      <select
                        value={cond.fieldSource}
                        onChange={(e) =>
                          handleUpdateCondition(cond.id, { fieldSource: e.target.value as ConditionFieldSource })
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      >
                        {CONDITION_SOURCES.map((src) => (
                          <option key={src.id} value={src.id}>
                            {src.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                        Trường dữ liệu
                      </label>
                      <input
                        type="text"
                        value={cond.fieldName}
                        onChange={(e) => handleUpdateCondition(cond.id, { fieldName: e.target.value })}
                        placeholder="Vd: Loại đơn, Thẩm quyền..."
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Toán tử & Giá trị */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                        Toán tử
                      </label>
                      <select
                        value={cond.operator}
                        onChange={(e) =>
                          handleUpdateCondition(cond.id, { operator: e.target.value as ConditionOperator })
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                      >
                        {CONDITION_OPERATORS.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-semibold text-slate-600 mb-0.5">
                        Giá trị so sánh
                      </label>
                      <input
                        type="text"
                        disabled={cond.operator === 'co_gia_tri' || cond.operator === 'khong_co_gia_tri'}
                        value={
                          cond.operator === 'co_gia_tri' || cond.operator === 'khong_co_gia_tri'
                            ? '(Không cần giá trị)'
                            : cond.value
                        }
                        onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                        placeholder="Nhập giá trị..."
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nội dung cảnh báo khi không đủ điều kiện */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Nội dung cảnh báo khi không đủ điều kiện
          </label>
          <textarea
            rows={2}
            value={transition.warningMessage || ''}
            onChange={(e) => onUpdateTransition({ ...transition, warningMessage: e.target.value, isCustomized: true })}
            placeholder="Ví dụ: Hồ sơ chưa đủ văn bản hoặc thẩm quyền không phù hợp..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* ── NÚT MÔ PHỎNG / KIỂM TRA ĐẨY BƯỚC ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRunTransitionSimulation}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>Chạy thử chuyển bước (Đẩy bước)</span>
          </button>
          <span className="text-[10px] text-slate-400 text-center block mt-1.5">
            Mô phỏng trực tiếp luồng validation theo cấu hình văn bản
          </span>
        </div>
      </div>

      {/* ── MODAL 1: CHỌN VĂN BẢN KIỂM TRA TẠI BƯỚC ── */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">post_add</span>
                <span>Chọn văn bản cần kiểm tra</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại văn bản mẫu</label>
                <select
                  value={newDocType}
                  onChange={(e) => {
                    setNewDocType(e.target.value);
                    if (!newDocName) setNewDocName(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Đơn tố cáo">Đơn tố cáo (Có sẵn trong hồ sơ)</option>
                  <option value="Biên bản tiếp nhận">Biên bản tiếp nhận (Có sẵn trong hồ sơ)</option>
                  <option value="Phiếu kiểm tra">Phiếu kiểm tra điều kiện (Có sẵn trong hồ sơ)</option>
                  <option value="Tài liệu xác minh">Tài liệu xác minh hiện trường (Chưa có)</option>
                  <option value="Biên bản đối thoại">Biên bản đối thoại các bên (Chưa có)</option>
                  <option value="Văn bản khác">Văn bản tùy chỉnh khác...</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên văn bản hiển thị</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="VD: Đơn tố cáo công dân, Biên bản làm việc..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Bắt buộc phải có</span>
                  <span className="text-[10px] text-slate-500">Chặn chuyển bước nếu hồ sơ chưa có</span>
                </div>
                <input
                  type="checkbox"
                  checked={newDocRequired}
                  onChange={(e) => setNewDocRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAddDocCondition}
                disabled={!newDocName.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Thêm vào kiểm tra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THÊM VĂN BẢN YÊU CẦU KHI CHUYỂN BƯỚC ── */}
      {isAddReqDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">upload_file</span>
                <span>Thêm văn bản yêu cầu khi chuyển bước</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddReqDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại văn bản yêu cầu</label>
                <input
                  type="text"
                  value={newReqDocType}
                  onChange={(e) => setNewReqDocType(e.target.value)}
                  placeholder="VD: Báo cáo đề xuất, Biên bản xác minh..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên tài liệu cụ thể</label>
                <input
                  type="text"
                  value={newReqDocName}
                  onChange={(e) => setNewReqDocName(e.target.value)}
                  placeholder="VD: Báo cáo kết quả xác minh nội dung tố cáo..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người / Vai trò cung cấp</label>
                <select
                  value={newReqDocRole}
                  onChange={(e) => setNewReqDocRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Cán bộ xử lý">Cán bộ xử lý / thụ lý</option>
                  <option value="Lãnh đạo đơn vị">Lãnh đạo đơn vị</option>
                  <option value="Công dân">Công dân / Người gửi đơn</option>
                  <option value="Cơ quan phối hợp">Cơ quan phối hợp</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Bắt buộc nộp khi chuyển bước</span>
                  <span className="text-[10px] text-slate-500">Chặn hoàn tất nếu chưa đính kèm tệp</span>
                </div>
                <input
                  type="checkbox"
                  checked={newReqDocRequired}
                  onChange={(e) => setNewReqDocRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddReqDocModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAddRequiredDoc}
                disabled={!newReqDocName.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Thêm yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: MÔ PHỎNG & VALIDATION "ĐẨY BƯỚC" ── */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div
              className={`px-5 py-4 border-b flex items-center justify-between ${
                simulationState.status === 'error'
                  ? 'bg-rose-50 border-rose-200'
                  : simulationState.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-indigo-50 border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    simulationState.status === 'error'
                      ? 'text-rose-600'
                      : simulationState.status === 'success'
                      ? 'text-emerald-600'
                      : 'text-indigo-600'
                  }`}
                >
                  {simulationState.status === 'error'
                    ? 'error'
                    : simulationState.status === 'success'
                    ? 'check_circle'
                    : 'rule'}
                </span>
                <h3
                  className={`text-sm font-extrabold ${
                    simulationState.status === 'error'
                      ? 'text-rose-950'
                      : simulationState.status === 'success'
                      ? 'text-emerald-950'
                      : 'text-indigo-950'
                  }`}
                >
                  {simulationState.status === 'error'
                    ? 'Không thể chuyển bước'
                    : simulationState.status === 'success'
                    ? 'Chuyển bước thành công'
                    : 'Văn bản cần bổ sung để chuyển bước'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5 space-y-4 text-xs">
              {/* Flow info */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <span className="font-bold text-slate-800">{fromStep?.name || transition.fromStepId}</span>
                <span className="material-symbols-outlined text-blue-600 text-[16px]">arrow_forward</span>
                <span className="font-bold text-slate-800">{toStep?.name || transition.toStepId}</span>
              </div>

              {/* State 1: THIẾU VĂN BẢN (Error state - Option 2) */}
              {simulationState.status === 'error' && (
                <div className="space-y-3">
                  <p className="text-slate-700 font-medium leading-relaxed">
                    Hệ thống đã kiểm tra các văn bản đã tồn tại trong hồ sơ nhưng chưa thỏa mãn điều kiện chuyển bước:
                  </p>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-rose-900 block text-xs">Còn thiếu văn bản bắt buộc:</span>
                    <ul className="list-disc list-inside space-y-1 text-rose-800 font-semibold">
                      {simulationState.missingDocs?.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-600">
                    💡 <strong>Nguyên tắc One Document:</strong> Hệ thống không tự ý tạo thêm tài liệu mới để vượt qua điều kiện. Người dùng cần thu thập/bổ sung tài liệu thực tế vào hồ sơ trước khi chuyển bước.
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSimulateModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Quay lại bổ sung
                    </button>
                  </div>
                </div>
              )}

              {/* State 2: YÊU CẦU CUNG CẤP VĂN BẢN (Option 3 - checklist) */}
              {simulationState.status === 'need_documents' && (
                <div className="space-y-3">
                  <p className="text-slate-700 font-medium">
                    Theo cấu hình chuyển bước, người dùng cần cung cấp các văn bản sau để tiếp tục luồng xử lý:
                  </p>

                  <div className="space-y-2">
                    {requiredDocuments.map((rd) => {
                      const isProvided = Boolean(simulationState.providedDocsMap?.[rd.id]);
                      return (
                        <div
                          key={rd.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isProvided
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-white border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isProvided}
                                onChange={() => handleToggleProvideDoc(rd.id)}
                                className="mt-0.5 w-4 h-4 text-indigo-600 rounded"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{rd.documentName}</span>
                                <span className="text-[10px] text-slate-500">
                                  Loại: {rd.documentType} • Người cung cấp: <strong>{rd.providerRole}</strong>
                                </span>
                              </div>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleToggleProvideDoc(rd.id)}
                              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition-colors ${
                                isProvided
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {isProvided ? '✓ Đã đính kèm' : '+ Tải lên tệp'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddReqDocModalOpen(true)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      Thêm văn bản khác
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSimulateModalOpen(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSimulatedTransition}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                      >
                        Xác nhận chuyển bước
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State 3: THÀNH CÔNG (Success state) */}
              {simulationState.status === 'success' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-900 block text-xs">
                      ✓ Đạt tất cả điều kiện chuyển bước!
                    </span>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      {simulationState.message}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                    <span className="font-bold text-slate-800 block">
                      Các tài liệu tham chiếu hiện có trong hồ sơ ({dossierDocs.length}):
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {dossierDocs.map((doc) => (
                        <div key={doc.id} className="p-1.5 bg-white rounded border border-slate-200 flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-blue-700">{doc.id}</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">{doc.name}</span>
                          <span className="text-emerald-600 font-bold">✓ Đã lưu</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSimulateModalOpen(false)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Hoàn tất chạy thử
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
