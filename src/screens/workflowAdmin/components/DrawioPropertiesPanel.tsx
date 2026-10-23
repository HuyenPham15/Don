// src/screens/workflowAdmin/components/DrawioPropertiesPanel.tsx
import React, { useState } from 'react';
import {
  ProcessStep,
  ProcessTransition,
  DocumentCondition,
  StepComparisonCondition,
} from '../../../types/workflowConfig';
import { INITIAL_RECORD_DOCUMENTS } from '../../../constants/processWorkflows';

interface DrawioPropertiesPanelProps {
  selectedStep: ProcessStep | null;
  selectedTransition: ProcessTransition | null;
  allSteps: ProcessStep[];
  onUpdateStep: (updated: ProcessStep) => void;
  onDeleteStep: (stepId: string) => void;
  onUpdateTransition: (updated: ProcessTransition) => void;
  onDeleteTransition: (transId: string) => void;
  onClose: () => void;
  onSave?: () => void;
  hasUnsavedChanges?: boolean;
  isReadOnly?: boolean;
}

const COMMON_ROLES = [
  'Cán bộ Chuyên môn',
  'Cán bộ Tiếp nhận',
  'Lãnh đạo đơn vị',
  'Ban Tiếp công dân',
  'Tổ xác minh vụ việc',
  'Văn thư cơ quan',
  'Chuyên viên thẩm định',
];

const COMMON_DOCUMENTS = [
  'Đơn khiếu nại / Đơn tố cáo',
  'Biên bản tiếp nhận hồ sơ',
  'Giấy tờ tùy thân người nộp (CCCD/Hộ chiếu)',
  'Tài liệu / Chứng cứ ban đầu',
  'Văn bản ủy quyền (nếu có)',
  'Báo cáo đề xuất thụ lý / xử lý',
  'Quyết định thụ lý giải quyết',
  'Thông báo thụ lý gửi người tố cáo',
  'Biên bản làm việc với các bên liên quan',
  'Báo cáo kết quả xác minh nội dung',
  'Dự thảo Kết luận giải quyết',
  'Kết luận giải quyết chính thức',
  'Thông báo kết quả giải quyết',
];

const DOCUMENT_CATEGORIES = [
  'Đơn thư / Đơn khiếu nại - tố cáo',
  'Biên bản tiếp nhận hồ sơ',
  'Biên bản làm việc / đối thoại',
  'Phiếu kiểm tra / đề xuất thụ lý',
  'Báo cáo kết quả xác minh',
  'Quyết định thụ lý / giải quyết',
  'Kết luận nội dung giải quyết',
  'Thông báo thụ lý / thông báo kết quả',
  'Tài liệu chứng cứ / hồ sơ xác minh',
  'Giấy tờ tùy thân / Văn bản ủy quyền',
  'Văn bản khác',
];

const PROVIDER_ROLES = [
  'Cán bộ thụ lý chuyên môn',
  'Cán bộ tiếp công dân',
  'Lãnh đạo đơn vị ký ban hành',
  'Văn thư cơ quan',
  'Tổ xác minh vụ việc',
  'Công dân / Người gửi đơn',
];

const COMMON_BUSINESS_CONDITIONS = [
  'Đúng thẩm quyền thụ lý giải quyết',
  'Người nộp đơn có đầy đủ năng lực hành vi dân sự',
  'Đơn thư có chữ ký hoặc điểm chỉ hợp lệ',
  'Còn trong thời hiệu theo quy định pháp luật',
  'Nội dung chưa được giải quyết bằng bản án/quyết định có hiệu lực',
  'Đã tiếp nhận hồ sơ hợp lệ từ bước trước',
  'Đúng phạm vi phân công chuyên môn',
  'Đã hoàn thành xác minh hiện trường / tài liệu',
  'Đã lấy ý kiến giải trình của các bên liên quan',
  'Dự thảo kết luận đã thẩm định tính pháp lý',
  'Không có tranh chấp trùng lặp đang thụ lý',
  'Trong thời hạn xử lý còn hiệu lực',
];

const COMMON_CHECK_FIELDS = [
  'Thẩm quyền thụ lý',
  'Loại đơn',
  'Thời hạn giải quyết',
  'Hồ sơ hợp lệ',
  'Kết quả xác minh',
  'Trạng thái đơn thư',
  'Địa bàn phát sinh',
  'Kiểm tra văn bản hồ sơ',
];

const COMPARISON_OPERATORS = [
  { value: '=', label: 'Bằng (=)' },
  { value: '≠', label: 'Khác (≠)' },
  { value: '>', label: 'Lớn hơn (>)' },
  { value: '<', label: 'Nhỏ hơn (<)' },
  { value: '>=', label: 'Lớn hơn hoặc bằng (>=)' },
  { value: '<=', label: 'Nhỏ hơn hoặc bằng (<=)' },
  { value: 'chua', label: 'Chứa từ khóa' },
  { value: 'co_gia_tri', label: 'Có dữ liệu / Hợp lệ' },
  { value: 'khong_co_gia_tri', label: 'Chưa có / Thiếu' },
];

const FIELD_VALUE_SUGGESTIONS: Record<string, string[]> = {
  'Thẩm quyền thụ lý': ['Thuộc thẩm quyền', 'Không thuộc thẩm quyền', 'Chuyển đơn vị khác'],
  'Loại đơn': ['Khiếu nại', 'Tố cáo', 'Kiến nghị, phản ánh', 'Tranh chấp đất đai'],
  'Hồ sơ hợp lệ': ['Hợp lệ', 'Thiếu thành phần', 'Không hợp lệ'],
  'Thời hạn giải quyết': ['10 ngày', '15 ngày', '30 ngày', '45 ngày', '60 ngày'],
  'Kết quả xác minh': ['Đúng', 'Đúng một phần', 'Sai toàn bộ', 'Chưa rõ'],
  'Trạng thái đơn thư': ['Mới tiếp nhận', 'Đang xử lý', 'Đã thẩm tra', 'Đã ban hành kết luận'],
  'Địa bàn phát sinh': ['Thuộc địa phương', 'Ngoài địa phương'],
};

const COMMON_PRESET_CONDITIONS: { fieldName: string; operator: string; value: string; label: string }[] = [
  { fieldName: 'Thẩm quyền thụ lý', operator: '=', value: 'Thuộc thẩm quyền', label: 'Thẩm quyền thụ lý = Thuộc thẩm quyền' },
  { fieldName: 'Hồ sơ hợp lệ', operator: '=', value: 'Hợp lệ', label: 'Hồ sơ hợp lệ = Hợp lệ' },
  { fieldName: 'Thời hạn giải quyết', operator: '<=', value: '30 ngày', label: 'Thời hạn giải quyết <= 30 ngày' },
  { fieldName: 'Loại đơn', operator: '=', value: 'Khiếu nại', label: 'Loại đơn = Khiếu nại' },
  { fieldName: 'Loại đơn', operator: '=', value: 'Tố cáo', label: 'Loại đơn = Tố cáo' },
  { fieldName: 'Kết quả xác minh', operator: '≠', value: 'Chưa rõ', label: 'Kết quả xác minh ≠ Chưa rõ' },
  { fieldName: 'Kiểm tra văn bản hồ sơ', operator: 'co_gia_tri', value: '', label: 'Văn bản hồ sơ = Có dữ liệu' },
];

const FIELD_TYPES = [
  'Văn bản ngắn',
  'Văn bản dài',
  'Số nguyên / Tiền tệ',
  'Ngày tháng',
  'Lựa chọn (Dropdown)',
  'Tệp đính kèm / Hồ sơ',
  'Hộp kiểm (Checkbox)',
];

export default function DrawioPropertiesPanel({
  selectedStep,
  selectedTransition,
  allSteps,
  onUpdateStep,
  onDeleteStep,
  onUpdateTransition,
  onDeleteTransition,
  onClose,
  onSave,
  hasUnsavedChanges = false,
  isReadOnly = false,
}: DrawioPropertiesPanelProps) {
  // Field state cho Nhóm thông tin
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('Văn bản ngắn');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // Tab switcher giữa 2 trạng thái: VĂN BẢN (hồ sơ) & ĐIỀU KIỆN (nghiệp vụ)
  const [stepReqTab, setStepReqTab] = useState<'DOCUMENTS' | 'CONDITIONS' | 'BOTH'>('BOTH');

  // State điều kiện văn bản
  const [newDocName, setNewDocName] = useState('');
  const [newDocRequired, setNewDocRequired] = useState(true);

  // State xem chi tiết văn bản (Popup Văn bản thể thức hành chính)
  const [viewingDocCond, setViewingDocCond] = useState<DocumentCondition | null>(null);
  const [viewingDocSource, setViewingDocSource] = useState<'step' | 'transition'>('step');
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);

  // State điều kiện so sánh
  const [newCondField, setNewCondField] = useState('Thẩm quyền thụ lý');
  const [isCustomCondField, setIsCustomCondField] = useState(false);
  const [customCondFieldName, setCustomCondFieldName] = useState('');
  const [newCondOp, setNewCondOp] = useState('=');
  const [newCondValue, setNewCondValue] = useState('Thuộc thẩm quyền');
  const [newCondLogicOp, setNewCondLogicOp] = useState<'AND' | 'OR'>('AND');

  const handleSelectCondField = (field: string) => {
    if (field === '__CUSTOM__') {
      setIsCustomCondField(true);
      setNewCondField(customCondFieldName || '');
    } else {
      setIsCustomCondField(false);
      setNewCondField(field);
      const suggestions = FIELD_VALUE_SUGGESTIONS[field];
      if (suggestions && suggestions.length > 0) {
        setNewCondValue(suggestions[0]);
      }
    }
  };

  // Danh sách điều kiện văn bản hiện tại của bước (kết hợp cả documentConditions và usedDocuments nếu có)
  const currentStepDocConditions: DocumentCondition[] =
    selectedStep?.documentConditions && selectedStep.documentConditions.length > 0
      ? selectedStep.documentConditions
      : (selectedStep?.usedDocuments || []).map((name, i) => ({
        id: `dc-init-${i}-${name.replace(/\s+/g, '-').slice(0, 10)}`,
        documentType: 'Văn bản',
        documentName: name,
        required: true,
        status: 'available' as const,
      }));

  // Đổi trạng thái Bắt buộc / Tùy chọn của điều kiện văn bản bước
  const handleToggleDocRequired = (docId: string) => {
    if (!selectedStep) return;
    const updated = currentStepDocConditions.map((dc) =>
      dc.id === docId ? { ...dc, required: !dc.required } : dc
    );
    onUpdateStep({
      ...selectedStep,
      documentConditions: updated,
    });
  };

  // Xóa điều kiện văn bản khỏi bước
  const handleRemoveDocCondition = (docId: string) => {
    if (!selectedStep) return;
    const itemToRemove = currentStepDocConditions.find((dc) => dc.id === docId);
    const updated = currentStepDocConditions.filter((dc) => dc.id !== docId);
    const updatedUsed = (selectedStep.usedDocuments || []).filter(
      (name) => name !== itemToRemove?.documentName
    );
    onUpdateStep({
      ...selectedStep,
      documentConditions: updated,
      usedDocuments: updatedUsed,
    });
  };

  // Thêm điều kiện văn bản vào bước
  const handleAddDocCondition = (docName: string, required: boolean = true) => {
    if (!docName.trim() || !selectedStep) return;
    const trimmed = docName.trim();
    const exists = currentStepDocConditions.some(
      (d) => d.documentName.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;
    const newDoc: DocumentCondition = {
      id: `dc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      documentType: 'Văn bản',
      documentName: trimmed,
      required,
      status: 'available',
    };
    onUpdateStep({
      ...selectedStep,
      documentConditions: [...currentStepDocConditions, newDoc],
      usedDocuments: [...(selectedStep.usedDocuments || []).filter((d) => d !== trimmed), trimmed],
    });
    setNewDocName('');
  };

  // Mở popup toàn văn văn bản theo thể thức hành chính chuẩn
  const handleOpenDocDetail = (docCond: DocumentCondition, source: 'step' | 'transition') => {
    setViewingDocCond(docCond);
    setViewingDocSource(source);
    setCopiedCodeToast(false);
  };

  // Danh sách điều kiện so sánh nghiệp vụ hiện tại của bước
  const currentStepComparisonConditions: StepComparisonCondition[] =
    selectedStep?.stepComparisonConditions && selectedStep.stepComparisonConditions.length > 0
      ? selectedStep.stepComparisonConditions
      : (selectedStep?.conditions || []).map((condStr, idx) => {
        let logicOp: 'AND' | 'OR' = 'AND';
        let remaining = condStr.trim();
        if (remaining.startsWith('HOẶC ') || remaining.startsWith('OR ')) {
          logicOp = 'OR';
          remaining = remaining.replace(/^(HOẶC|OR)\s+/i, '');
        } else if (remaining.startsWith('VÀ ') || remaining.startsWith('AND ')) {
          logicOp = 'AND';
          remaining = remaining.replace(/^(VÀ|AND)\s+/i, '');
        }

        const opMatch = remaining.match(/^(.+?)\s*(>=|<=|!=|≠|=|>|<|chứa|có dữ liệu|rỗng|co_gia_tri|khong_co_gia_tri)\s*(.*)$/i);
        if (opMatch) {
          let op = opMatch[2].trim();
          if (op === '!=') op = '≠';
          if (op === 'có dữ liệu') op = 'co_gia_tri';
          if (op === 'rỗng') op = 'khong_co_gia_tri';
          return {
            id: `scc-init-${idx}`,
            logicOp,
            fieldName: opMatch[1].trim(),
            operator: op,
            value: opMatch[3]?.trim().replace(/^["']|["']$/g, '') || '',
          };
        }

        return {
          id: `scc-init-${idx}`,
          logicOp,
          fieldName: remaining,
          operator: '=',
          value: 'Đạt yêu cầu',
        };
      });

  const syncComparisonConditions = (newConditions: StepComparisonCondition[]) => {
    if (!selectedStep) return;
    const readableConditions = newConditions.map((c, i) => {
      const opText =
        c.operator === 'co_gia_tri'
          ? 'có giá trị'
          : c.operator === 'khong_co_gia_tri'
            ? 'không có dữ liệu'
            : c.operator;
      const valText =
        c.operator === 'co_gia_tri' || c.operator === 'khong_co_gia_tri' ? '' : ` "${c.value}"`;
      const prefix = i === 0 ? '' : `${c.logicOp === 'OR' ? 'HOẶC' : 'VÀ'} `;
      return `${prefix}${c.fieldName} ${opText}${valText}`.trim();
    });

    onUpdateStep({
      ...selectedStep,
      stepComparisonConditions: newConditions,
      conditions: readableConditions,
      conditionsOverride: true,
      isCustomized: true,
    });
  };

  // Thêm điều kiện so sánh
  const handleAddComparisonCondition = (
    fieldName: string,
    operator: string,
    value: string,
    logicOp: 'AND' | 'OR' = 'AND'
  ) => {
    if (!fieldName.trim() || !selectedStep) return;
    const newCond: StepComparisonCondition = {
      id: `scc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      logicOp,
      fieldName: fieldName.trim(),
      operator,
      value: (operator === 'co_gia_tri' || operator === 'khong_co_gia_tri') ? '' : value.trim(),
    };
    syncComparisonConditions([...currentStepComparisonConditions, newCond]);
  };

  // Xóa điều kiện so sánh
  const handleRemoveComparisonCondition = (condId: string) => {
    if (!selectedStep) return;
    const updated = currentStepComparisonConditions.filter((c) => c.id !== condId);
    syncComparisonConditions(updated);
  };

  // Đổi toán tử logic VÀ / HOẶC giữa các điều kiện
  const handleToggleCondLogicOp = (condId: string) => {
    if (!selectedStep) return;
    const updated = currentStepComparisonConditions.map((c) =>
      c.id === condId ? { ...c, logicOp: (c.logicOp === 'AND' ? 'OR' : 'AND') as 'AND' | 'OR' } : c
    );
    syncComparisonConditions(updated);
  };

  // Handlers điều kiện văn bản cho Transition (đường nối)
  const handleAddTransDocCondition = (docName: string, required: boolean = true) => {
    if (!docName.trim() || !selectedTransition) return;
    const trimmed = docName.trim();
    const currentList = selectedTransition.documentConditions || [];
    const exists = currentList.some((d) => d.documentName.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const newDoc: DocumentCondition = {
      id: `trans-dc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      documentType: 'Văn bản',
      documentName: trimmed,
      required,
      status: 'available',
    };
    onUpdateTransition({
      ...selectedTransition,
      docCheckType: selectedTransition.docCheckType || 'check_existing',
      documentConditions: [...currentList, newDoc],
    });
  };

  const handleToggleTransDocRequired = (docId: string) => {
    if (!selectedTransition) return;
    const updated = (selectedTransition.documentConditions || []).map((dc) =>
      dc.id === docId ? { ...dc, required: !dc.required } : dc
    );
    onUpdateTransition({
      ...selectedTransition,
      documentConditions: updated,
    });
  };

  const handleRemoveTransDocCondition = (docId: string) => {
    if (!selectedTransition) return;
    const updated = (selectedTransition.documentConditions || []).filter((dc) => dc.id !== docId);
    onUpdateTransition({
      ...selectedTransition,
      documentConditions: updated,
    });
  };

  // Modal hiển thị toàn văn văn bản theo quy chuẩn thể thức hành chính Nhà nước (Popup Văn bản)
  const renderDocumentDetailModal = () => {
    if (!viewingDocCond) return null;

    // Tìm thực thể tài liệu liên kết trong INITIAL_RECORD_DOCUMENTS
    const matchedEntity = INITIAL_RECORD_DOCUMENTS.find(
      (d) =>
        (viewingDocCond.documentId && d.id === viewingDocCond.documentId) ||
        d.name.toLowerCase() === viewingDocCond.documentName.toLowerCase() ||
        d.documentType.toLowerCase() === (viewingDocCond.documentType || '').toLowerCase()
    );

    const docCode =
      matchedEntity?.code ||
      viewingDocCond.documentId ||
      `VB-${(selectedStep?.order || 1).toString().padStart(2, '0')}-${viewingDocCond.id.slice(-4).toUpperCase()}`;

    const fileName =
      matchedEntity?.fileName ||
      `${viewingDocCond.documentName
        .toLowerCase()
        .replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi, '_')
        .slice(0, 32)}.pdf`;
    const fileSize = matchedEntity?.fileSize || '2.4 MB';
    const signerName = matchedEntity?.createdBy || 'Nguyễn Minh Anh (Cán bộ thụ lý)';
    const signedDate = matchedEntity?.createdAt || '23/10/2026 14:30';

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => setViewingDocCond(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Toolbar */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate" title={viewingDocCond.documentName}>
                  {viewingDocCond.documentName}
                </h4>
                <div className="flex items-center gap-2 text-[10.5px] text-slate-300 mt-0.5 flex-wrap">
                  <span className="font-mono text-slate-200">{docCode}</span>
                  <span>•</span>
                  <span>{viewingDocCond.documentType || 'Văn bản hành chính'}</span>
                  <span>•</span>
                  <span className={viewingDocCond.required ? 'text-rose-300 font-semibold' : 'text-slate-300'}>
                    {viewingDocCond.required ? '★ Bắt buộc trong hồ sơ' : '○ Tùy chọn bổ sung'}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    {viewingDocSource === 'step'
                      ? `Bước: ${selectedStep?.name || 'Hiện tại'}`
                      : `Luồng: ${selectedTransition?.label || 'Chuyển bước'}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                title="In văn bản"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                <span>In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopiedCodeToast(true);
                  setTimeout(() => setCopiedCodeToast(false), 2000);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Tải văn bản đính kèm"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>{copiedCodeToast ? 'Đang tải...' : 'Tải file'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingDocCond(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                title="Đóng văn bản (Esc)"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Document Content - Giấy trắng A4 theo thể thức hành chính Nhà nước */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-100/70 select-text">
            <div className="bg-white p-7 sm:p-10 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-6">
              {/* Tiêu ngữ & Quốc hiệu */}
              <div className="grid grid-cols-2 gap-4 text-center pb-4 border-b border-slate-200">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase text-slate-700 tracking-wider">
                    ỦY BAN NHÂN DÂN TỈNH
                  </div>
                  <div className="text-[11px] font-bold uppercase text-blue-900 underline decoration-slate-400">
                    BỘ PHẬN TIẾP NHẬN &amp; GIẢI QUYẾT ĐƠN
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Số: {docCode}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase text-slate-900 tracking-tight">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 underline decoration-slate-400">
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                  <div className="text-[10px] text-slate-500 italic mt-1 font-sans">
                    Hà Nội, ngày 23 tháng 10 năm 2026
                  </div>
                </div>
              </div>

              {/* Tiêu đề văn bản */}
              <div className="text-center space-y-1 py-1 font-sans">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  {viewingDocCond.documentName}
                </h3>
                <p className="text-xs text-slate-600 italic">
                  V/v: {selectedStep?.name ? `Phục vụ công tác tại bước "${selectedStep.name}"` : 'Quy trình tiếp nhận và giải quyết đơn thư'}
                </p>
              </div>

              {/* Căn cứ pháp lý */}
              <div className="text-xs space-y-1 text-slate-700 font-sans italic border-l-2 border-blue-500 pl-3.5 bg-blue-50/40 py-2.5 rounded-r-lg">
                <div>- Căn cứ Luật Khiếu nại số 02/2011/QH13 ngày 11 tháng 11 năm 2011;</div>
                <div>- Căn cứ Luật Tố cáo số 25/2018/QH14 ngày 12 tháng 6 năm 2018;</div>
                <div>- Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/03/2020 của Chính phủ về công tác văn thư;</div>
                <div>- Căn cứ Thông tư 05/2021/TT-TTCP quy định quy trình xử lý đơn khiếu nại, tố cáo, kiến nghị, phản ánh;</div>
                <div>- Căn cứ quy chuẩn thành phần hồ sơ quy định tại quy trình số hóa nghiệp vụ.</div>
              </div>

              {/* Toàn văn nội dung hành chính chuẩn */}
              <div className="text-xs leading-relaxed text-slate-800 space-y-3.5 font-sans">
                <div>
                  <h5 className="font-bold text-slate-900 mb-1">
                    Điều 1. Nội dung và mục đích ban hành
                  </h5>
                  <p>
                    Văn bản <strong>"{viewingDocCond.documentName}"</strong> được thiết lập, kiểm tra và xác nhận tính hợp pháp theo đúng trình tự, thủ tục quy định của pháp luật trong quá trình giải quyết hồ sơ vụ việc.
                    Tài liệu này là căn cứ pháp lý để cán bộ chuyên môn thực hiện kiểm tra, xác minh, đối chiếu chứng cứ và lập hồ sơ nghiệp vụ.
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 mb-1">
                    Điều 2. Quy chuẩn thành phần hồ sơ tại bước
                  </h5>
                  <p>
                    1. Tài liệu được số hóa từ văn bản gốc, định dạng chuẩn <strong>PDF/A điện tử</strong>, dung lượng <strong>{fileSize}</strong>, đảm bảo nguyên vẹn và đầy đủ con dấu, chữ ký của cơ quan hoặc cá nhân có thẩm quyền.
                  </p>
                  <p className="mt-1">
                    2. Tính chất yêu cầu tại bước "{selectedStep?.name || 'Hiện tại'}":{' '}
                    <span className={`font-semibold ${viewingDocCond.required ? 'text-rose-700' : 'text-slate-700'}`}>
                      {viewingDocCond.required
                        ? '★ BẮT BUỘC: Hồ sơ bắt buộc phải có tài liệu này thì mới đủ điều kiện chuyển bước tiếp theo.'
                        : '○ TÙY CHỌN: Tài liệu bổ sung, đính kèm khi phát sinh tình huống nghiệp vụ thực tế.'}
                    </span>
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 mb-1">
                    Điều 3. Trách nhiệm thực hiện và lưu trữ
                  </h5>
                  <p>
                    Cán bộ thụ lý và các bộ phận liên quan chịu trách nhiệm cập nhật, lưu trữ tài liệu vào kho hồ sơ điện tử của hệ thống. Nghiêm cấm mọi hành vi sửa đổi, làm sai lệch nội dung văn bản sau khi đã được thẩm tra và tích hợp chứng thư số chuyên dùng.
                  </p>
                </div>
              </div>

              {/* Khối chữ ký số điện tử & Nơi nhận */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 font-sans text-xs">
                <div className="text-[10.5px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700">Nơi nhận:</div>
                  <div>- Lãnh đạo cơ quan (để báo cáo);</div>
                  <div>- Ban Tiếp công dân / Bộ phận một cửa;</div>
                  <div>- Cán bộ thụ lý hồ sơ;</div>
                  <div>- Người gửi đơn (để phối hợp);</div>
                  <div>- Lưu: Hồ sơ nghiệp vụ điện tử.</div>
                </div>

                <div className="text-center space-y-2">
                  <div className="font-bold uppercase text-slate-800 text-[11px]">
                    {selectedStep?.name?.toLowerCase().includes('lãnh đạo') || selectedStep?.name?.toLowerCase().includes('phê duyệt')
                      ? 'LÃNH ĐẠO CÓ THẨM QUYỀN'
                      : 'CÁN BỘ THỤ LÝ CHUYÊN MÔN'}
                  </div>
                  <div className="p-3 rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50/70 space-y-1 inline-block text-left w-full shadow-2xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                      <span>CHỮ KÝ SỐ CA HỢP LỆ</span>
                    </div>
                    <div className="text-[10px] text-slate-700">
                      Người ký: <strong>{signerName}</strong>
                    </div>
                    <div className="text-[9.5px] text-slate-500">
                      Thời gian: {signedDate} • Ban Cơ yếu Chính phủ (VGCA)
                    </div>
                    <div className="text-[9px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Toàn vẹn, không bị sửa đổi sau khi ký
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 font-sans">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-rose-500 shrink-0">picture_as_pdf</span>
              <span className="truncate">
                Tệp đính kèm: <strong className="text-slate-800">{fileName}</strong> ({fileSize} • PDF điện tử)
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCopiedCodeToast(true);
                  setTimeout(() => setCopiedCodeToast(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>{copiedCodeToast ? 'Đang tải file...' : 'Tải file PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingDocCond(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tìm danh sách tất cả các nhóm thông tin hiện có trong quy trình
  const infoGroupNodes = allSteps.filter((s) => s.nodeType === 'INFO_GROUP');

  // Nếu không chọn thành phần nào: hiển thị hướng dẫn ngắn gọn
  if (!selectedStep && !selectedTransition) {
    return (
      <aside className="w-[280px] bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20 p-5 items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-[26px]">touch_app</span>
        </div>
        <h4 className="text-xs font-bold text-slate-700">Chưa chọn thành phần</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-[200px]">
          Nhấp chuột vào một khối hoặc đường nối trên canvas để xem và tùy chỉnh thuộc tính.
        </p>
      </aside>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. THUỘC TÍNH ĐƯỜNG NỐI (TRANSITION / CONNECTOR)
  // ──────────────────────────────────────────────────────────────────────────
  if (selectedTransition) {
    const fromStep = allSteps.find((s) => s.id === selectedTransition.fromStepId);
    const toStep = allSteps.find((s) => s.id === selectedTransition.toStepId);
    const isFromCondition = fromStep?.nodeType === 'CHECK';

    return (
      <>
        <aside className="w-[280px] bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20">
          {/* Header */}
          <div className="h-11 px-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">trending_flat</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate">
                Thuộc tính đường nối
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Đóng panel"
            >
              <span className="material-symbols-outlined text-[17px]">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Nhãn đường nối */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Nhãn hiển thị</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={selectedTransition.label || selectedTransition.name || ''}
                onChange={(e) =>
                  onUpdateTransition({
                    ...selectedTransition,
                    label: e.target.value,
                    name: e.target.value,
                    actionName: e.target.value,
                  })
                }
                placeholder="Ví dụ: Chuyển bước, Đúng, Sai..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Nút đổi nhanh nhãn Đúng / Sai nếu nối từ khối Điều kiện */}
            {isFromCondition && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Gán nhánh điều kiện</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() =>
                      onUpdateTransition({
                        ...selectedTransition,
                        label: 'Đúng',
                        name: 'Đúng',
                        actionName: 'Đúng',
                      })
                    }
                    className={`py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${selectedTransition.label === 'Đúng'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                  >
                    ✓ Đúng (True)
                  </button>
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() =>
                      onUpdateTransition({
                        ...selectedTransition,
                        label: 'Sai',
                        name: 'Sai',
                        actionName: 'Sai',
                      })
                    }
                    className={`py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${selectedTransition.label === 'Sai'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                  >
                    ✕ Sai (False)
                  </button>
                </div>
              </div>
            )}

            {/* Loại đường nối: Bình thường hay Trả lại */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">Tính chất luồng</label>
              <select
                disabled={isReadOnly}
                value={selectedTransition.type || 'normal'}
                onChange={(e) =>
                  onUpdateTransition({
                    ...selectedTransition,
                    type: e.target.value as any,
                  })
                }
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="normal">Chuyển tiếp bước tiếp theo</option>
                <option value="return">Quay lại / Trả lại hồ sơ</option>
              </select>
            </div>

            {/* Điều kiện văn bản chuyển bước */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">description</span>
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Đ/k văn bản chuyển bước
                  </label>
                </div>
                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200/80 rounded text-[9.5px] font-bold">
                  {selectedTransition.documentConditions?.length || 0}
                </span>
              </div>

              {/* Danh sách văn bản yêu cầu trên đường nối */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                {(!selectedTransition.documentConditions ||
                  selectedTransition.documentConditions.length === 0) ? (
                  <p className="text-[10.5px] text-slate-400 italic text-center py-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                    Không yêu cầu văn bản để chuyển bước.
                  </p>
                ) : (
                  selectedTransition.documentConditions.map((docCond) => (
                    <div
                      key={docCond.id}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-1.5 text-[11px] hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                    >
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => handleOpenDocDetail(docCond, 'transition')}
                        title="Nhấn để xem toàn văn văn bản"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-semibold text-slate-800 block truncate group-hover:text-blue-600 transition-colors"
                            title={docCond.documentName}
                          >
                            {docCond.documentName}
                          </span>
                          <span className="material-symbols-outlined text-[13px] text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-blue-600 transition-all shrink-0">
                            visibility
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleToggleTransDocRequired(docCond.id)}
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold cursor-pointer transition-colors ${docCond.required
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                            title="Đổi trạng thái Bắt buộc / Tùy chọn"
                          >
                            {docCond.required ? '★ Bắt buộc' : '○ Tùy chọn'}
                          </button>
                          <span className="text-[9.5px] text-slate-400 truncate">
                            {docCond.documentType || 'Văn bản'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenDocDetail(docCond, 'transition')}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Xem toàn văn văn bản"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                        </button>

                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTransDocCondition(docCond.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Xóa điều kiện văn bản này"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Thêm nhanh từ danh mục mẫu */}
              {!isReadOnly && (
                <div className="pt-1">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTransDocCondition(e.target.value, true);
                      }
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">+ Thêm văn bản điều kiện từ mẫu...</option>
                    {COMMON_DOCUMENTS.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Thông tin nối giữa 2 khối */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-[11px]">
              <div>
                <span className="text-slate-400 block font-medium text-[10px]">Khối nguồn:</span>
                <strong className="text-slate-800">{fromStep?.name || selectedTransition.fromStepId}</strong>
              </div>
              <div className="pt-1.5 border-t border-slate-200/80">
                <span className="text-slate-400 block font-medium text-[10px]">Khối đích:</span>
                <strong className="text-slate-800">{toStep?.name || selectedTransition.toStepId}</strong>
              </div>
            </div>

            {/* Nút xóa */}
            {!isReadOnly && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onDeleteTransition(selectedTransition.id)}
                  className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Xóa đường nối</span>
                </button>
              </div>
            )}

            {/* Nút Lưu quy trình */}
            {onSave && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onSave}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${hasUnsavedChanges
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  title="Lưu lại sơ đồ quy trình (Ctrl+S)"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu quy trình</span>
                </button>
              </div>
            )}
          </div>
        </aside>
        {renderDocumentDetailModal()}
      </>
    );
  }

  if (!selectedStep) return null;

  return (
    <>
      <aside className="w-[280px] bg-white border-l border-slate-200/90 flex flex-col h-full shrink-0 select-none shadow-2xs z-20">
        {/* Header */}
        <div className="h-11 px-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">
              {selectedStep.nodeType === 'START'
                ? 'play_circle'
                : selectedStep.nodeType === 'END'
                  ? 'stop_circle'
                  : selectedStep.nodeType === 'CHECK'
                    ? 'alt_route'
                    : selectedStep.nodeType === 'INFO_GROUP'
                      ? 'folder_open'
                      : selectedStep.nodeType === 'DATA_FIELD'
                        ? 'short_text'
                        : 'task_alt'}
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate">
              {selectedStep.nodeType === 'CHECK'
                ? 'Điều kiện'
                : selectedStep.nodeType === 'INFO_GROUP'
                  ? 'Nhóm thông tin'
                  : selectedStep.nodeType === 'DATA_FIELD'
                    ? 'Trường dữ liệu'
                    : 'Thuộc tính bước'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Đóng panel"
          >
            <span className="material-symbols-outlined text-[17px]">close</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* ============================================================== */}
          {/* LOẠI 1: BƯỚC XỬ LÝ (HOẶC BẮT ĐẦU / KẾT THÚC)                   */}
          {/* ============================================================== */}
          {(selectedStep.nodeType === 'TASK' ||
            selectedStep.nodeType === 'START' ||
            selectedStep.nodeType === 'END' ||
            !selectedStep.nodeType) && (
              <>
                {/* 1. Tên bước */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Tên bước xử lý</label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={selectedStep.name}
                    onChange={(e) => onUpdateStep({ ...selectedStep, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                    placeholder="Nhập tên bước xử lý..."
                  />
                </div>

                {/* 2. Người / nhóm xử lý */}
                {selectedStep.nodeType !== 'END' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Người / nhóm xử lý</label>
                    <select
                      disabled={isReadOnly}
                      value={selectedStep.assigneeRole || 'Cán bộ Chuyên môn'}
                      onChange={(e) => onUpdateStep({ ...selectedStep, assigneeRole: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      {COMMON_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-2.5 pt-1">
                  {/* ============================================================== */}
                  {/* TRẠNG THÁI 1: VĂN BẢN / HỒ SƠ YÊU CẦU                           */}
                  {/* ============================================================== */}
                  {(stepReqTab === 'DOCUMENTS' || stepReqTab === 'BOTH') && (
                    <div className="space-y-1.5 bg-blue-50/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-blue-600">
                            description
                          </span>
                          <span className="text-[11px] font-bold text-slate-800">
                            Văn bản / Hồ sơ yêu cầu
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {currentStepDocConditions.length}
                        </span>
                      </div>

                      {/* Danh sách văn bản */}
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {currentStepDocConditions.length === 0 ? (
                          <div className="p-2 rounded-lg border border-dashed border-slate-200 bg-white text-center">
                            <p className="text-[10px] text-slate-400 italic">
                              Chưa có văn bản hồ sơ nào cho bước này.
                            </p>
                          </div>
                        ) : (
                          currentStepDocConditions.map((docCond) => (
                            <div
                              key={docCond.id}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-1.5 text-[11px] hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
                            >
                              <div
                                className="min-w-0 flex-1 cursor-pointer"
                                onClick={() => handleOpenDocDetail(docCond, 'step')}
                                title="Nhấn để xem toàn văn văn bản"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="font-semibold text-slate-800 block truncate group-hover:text-blue-600 transition-colors"
                                    title={docCond.documentName}
                                  >
                                    {docCond.documentName}
                                  </span>
                                  {/* <span
                                    className="material-symbols-outlined text-[13px] text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-blue-600 transition-all shrink-0"
                                    title="Xem toàn văn văn bản"
                                  >
                                    visibility
                                  </span> */}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => handleToggleDocRequired(docCond.id)}
                                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold transition-all cursor-pointer ${docCond.required
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                      }`}
                                    title="Đổi trạng thái Bắt buộc / Tùy chọn"
                                  >
                                    {docCond.required ? '★ Bắt buộc' : '○ Tùy chọn'}
                                  </button>
                                  <span className="text-[9.5px] text-slate-400 truncate">
                                    {docCond.documentType || 'Văn bản'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDocDetail(docCond, 'step')}
                                  className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-400 transition-colors cursor-pointer"
                                  title="Xem toàn văn văn bản"
                                >
                                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                                </button>

                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDocCondition(docCond.id)}
                                    className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 transition-colors cursor-pointer"
                                    title="Xóa văn bản này"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Form thêm văn bản mới */}
                      {!isReadOnly && (
                        <div className="space-y-1.5 pt-1 border-t border-blue-100">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddDocCondition(e.target.value, true);
                              }
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] text-slate-700 focus:outline-none focus:border-blue-500"
                          >
                            <option value="">+ Thêm văn bản từ danh mục mẫu...</option>
                            {COMMON_DOCUMENTS.map((doc) => (
                              <option key={doc} value={doc}>
                                {doc}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={newDocName}
                              onChange={(e) => setNewDocName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newDocName.trim()) {
                                  e.preventDefault();
                                  handleAddDocCondition(newDocName.trim(), newDocRequired);
                                }
                              }}
                              placeholder="Hoặc tự gõ tên văn bản..."
                              className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              disabled={!newDocName.trim()}
                              onClick={() => {
                                if (!newDocName.trim()) return;
                                handleAddDocCondition(newDocName.trim(), newDocRequired);
                              }}
                              className={`px-2 py-1 rounded text-[10.5px] font-bold transition-all shrink-0 ${newDocName.trim()
                                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                              + Thêm
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ============================================================== */}
                  {/* ============================================================== */}
                  {/* TRẠNG THÁI 2: ĐIỀU KIỆN SO SÁNH (BẰNG, HOẶC,...)               */}
                  {/* ============================================================== */}
                  {(stepReqTab === 'CONDITIONS' || stepReqTab === 'BOTH') && (
                    <div className="space-y-2 bg-indigo-50/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-indigo-600">
                            balance
                          </span>
                          <span className="text-[11px] font-bold text-slate-800">
                            Điều kiện so sánh (Bằng, hoặc,...)
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-200">
                          {currentStepComparisonConditions.length}
                        </span>
                      </div>

                      {/* Danh sách điều kiện so sánh */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                        {currentStepComparisonConditions.length === 0 ? (
                          <div className="p-2.5 rounded-lg border border-dashed border-slate-200 bg-white text-center">
                            <p className="text-[10.5px] text-slate-400 italic">
                              Chưa có điều kiện so sánh nào cho bước này.
                            </p>
                            <p className="text-[9.5px] text-slate-400 mt-0.5">
                              Thêm quy tắc so sánh (=, ≠, &gt;, &lt;, VÀ, HOẶC) bên dưới.
                            </p>
                          </div>
                        ) : (
                          currentStepComparisonConditions.map((cond, idx) => (
                            <div key={cond.id || idx} className="space-y-1">
                              {/* Nút chuyển đổi VÀ / HOẶC giữa các điều kiện */}
                              {idx > 0 && (
                                <div className="flex items-center justify-center my-0.5">
                                  <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => handleToggleCondLogicOp(cond.id)}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all shadow-2xs border cursor-pointer flex items-center gap-1 ${cond.logicOp === 'OR'
                                      ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                                      : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                                      }`}
                                    title="Nhấn để đổi giữa VÀ (tất cả phải thỏa mãn) và HOẶC (một trong các điều kiện)"
                                  >
                                    <span>{cond.logicOp === 'OR' ? 'HOẶC (OR)' : 'VÀ (AND)'}</span>
                                    <span className="material-symbols-outlined text-[10px]">sync_alt</span>
                                  </button>
                                </div>
                              )}

                              {/* Thẻ điều kiện so sánh */}
                              <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-1.5 text-[11px] hover:border-indigo-300 transition-colors">
                                <div className="flex flex-wrap items-center gap-1 min-w-0 flex-1">
                                  <span
                                    className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[110px]"
                                    title={cond.fieldName}
                                  >
                                    {cond.fieldName}
                                  </span>
                                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200 text-[10px]">
                                    {cond.operator === 'co_gia_tri'
                                      ? 'có dữ liệu'
                                      : cond.operator === 'khong_co_gia_tri'
                                        ? 'rỗng'
                                        : cond.operator}
                                  </span>
                                  {cond.operator !== 'co_gia_tri' && cond.operator !== 'khong_co_gia_tri' && (
                                    <span
                                      className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate max-w-[105px]"
                                      title={cond.value}
                                    >
                                      "{cond.value}"
                                    </span>
                                  )}
                                </div>

                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveComparisonCondition(cond.id)}
                                    className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 transition-colors cursor-pointer shrink-0"
                                    title="Xóa điều kiện này"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Form thêm điều kiện so sánh mới */}
                      {!isReadOnly && (
                        <div className="space-y-1.5 pt-1.5 border-t border-indigo-100">
                          {/* 1. Mẫu chọn nhanh */}
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const preset = COMMON_PRESET_CONDITIONS.find(
                                  (p) => p.label === e.target.value
                                );
                                if (preset) {
                                  handleAddComparisonCondition(
                                    preset.fieldName,
                                    preset.operator,
                                    preset.value,
                                    newCondLogicOp
                                  );
                                }
                              }
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[10px] text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            <option value="">+ Chọn mẫu điều kiện so sánh thường dùng...</option>
                            {COMMON_PRESET_CONDITIONS.map((p) => (
                              <option key={p.label} value={p.label}>
                                {p.label}
                              </option>
                            ))}
                          </select>

                          {/* 2. Thiết lập điều kiện tùy chỉnh */}
                          <div className="space-y-1.5">
                            {/* Phép nối logic nếu đã có điều kiện trước đó */}
                            {currentStepComparisonConditions.length > 0 && (
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-medium">Nối với điều kiện trước:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setNewCondLogicOp('AND')}
                                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border cursor-pointer transition-all ${newCondLogicOp === 'AND'
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}
                                  >
                                    VÀ (AND)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setNewCondLogicOp('OR')}
                                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border cursor-pointer transition-all ${newCondLogicOp === 'OR'
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}
                                  >
                                    HOẶC (OR)
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Chọn trường so sánh */}
                            <div className="space-y-0.5">
                              <label className="text-[9.5px] font-bold text-slate-500 block">
                                Trường so sánh
                              </label>
                              <select
                                value={isCustomCondField ? '__CUSTOM__' : newCondField}
                                onChange={(e) => handleSelectCondField(e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                              >
                                {COMMON_CHECK_FIELDS.map((f) => (
                                  <option key={f} value={f}>
                                    {f}
                                  </option>
                                ))}
                                <option value="__CUSTOM__">+ Tự nhập tên trường khác...</option>
                              </select>

                              {isCustomCondField && (
                                <input
                                  type="text"
                                  value={customCondFieldName}
                                  onChange={(e) => {
                                    setCustomCondFieldName(e.target.value);
                                    setNewCondField(e.target.value);
                                  }}
                                  placeholder="Nhập tên trường..."
                                  className="w-full px-2 py-1 mt-1 bg-white border border-indigo-300 rounded text-[10.5px] focus:outline-none focus:border-indigo-500"
                                />
                              )}
                            </div>

                            {/* Chọn toán tử & giá trị */}
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="space-y-0.5">
                                <label className="text-[9.5px] font-bold text-slate-500 block">
                                  Toán tử
                                </label>
                                <select
                                  value={newCondOp}
                                  onChange={(e) => setNewCondOp(e.target.value)}
                                  className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[10px] text-slate-800 focus:outline-none focus:border-indigo-500 font-bold font-mono"
                                >
                                  {COMPARISON_OPERATORS.map((op) => (
                                    <option key={op.value} value={op.value}>
                                      {op.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-0.5">
                                <label className="text-[9.5px] font-bold text-slate-500 block">
                                  Giá trị
                                </label>
                                <input
                                  type="text"
                                  disabled={newCondOp === 'co_gia_tri' || newCondOp === 'khong_co_gia_tri'}
                                  value={
                                    newCondOp === 'co_gia_tri' || newCondOp === 'khong_co_gia_tri'
                                      ? '(không cần)'
                                      : newCondValue
                                  }
                                  onChange={(e) => setNewCondValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const field = isCustomCondField
                                        ? customCondFieldName.trim()
                                        : newCondField;
                                      if (field) {
                                        handleAddComparisonCondition(
                                          field,
                                          newCondOp,
                                          newCondValue,
                                          newCondLogicOp
                                        );
                                      }
                                    }
                                  }}
                                  placeholder="Giá trị..."
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] text-slate-800 focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                                />
                              </div>
                            </div>

                            {/* Gợi ý giá trị nhanh nếu có */}
                            {FIELD_VALUE_SUGGESTIONS[newCondField] &&
                              newCondOp !== 'co_gia_tri' &&
                              newCondOp !== 'khong_co_gia_tri' && (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  <span className="text-[9px] text-slate-400">Gợi ý:</span>
                                  {FIELD_VALUE_SUGGESTIONS[newCondField].map((val) => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => setNewCondValue(val)}
                                      className={`text-[9px] px-1.5 py-0.2 rounded border transition-colors cursor-pointer ${newCondValue === val
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300 font-bold'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                              )}

                            {/* Nút thêm điều kiện */}
                            <button
                              type="button"
                              disabled={
                                isCustomCondField
                                  ? !customCondFieldName.trim()
                                  : !newCondField.trim()
                              }
                              onClick={() => {
                                const field = isCustomCondField
                                  ? customCondFieldName.trim()
                                  : newCondField;
                                if (!field) return;
                                handleAddComparisonCondition(
                                  field,
                                  newCondOp,
                                  newCondValue,
                                  newCondLogicOp
                                );
                              }}
                              className={`w-full py-1.5 rounded-lg text-[10.5px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 ${(isCustomCondField ? customCondFieldName.trim() : newCondField.trim())
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-600/20'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">add</span>
                              <span>Thêm điều kiện so sánh</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Thời hạn xử lý (SLA) */}
                {selectedStep.nodeType !== 'END' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Thời hạn xử lý (ngày)</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      disabled={isReadOnly}
                      value={selectedStep.timeLimitDays || 1}
                      onChange={(e) =>
                        onUpdateStep({ ...selectedStep, timeLimitDays: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                )}
              </>
            )}

          {/* ============================================================== */}
          {/* LOẠI 2: ĐIỀU KIỆN RẼ NHÁNH (CHECK)                             */}
          {/* ============================================================== */}
          {selectedStep.nodeType === 'CHECK' && (
            <>
              {/* Tên điều kiện */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tên điều kiện</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedStep.name}
                  onChange={(e) => onUpdateStep({ ...selectedStep, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  placeholder="Ví dụ: Kiểm tra thẩm quyền..."
                />
              </div>

              {/* Trường cần kiểm tra */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Trường cần kiểm tra</label>
                <select
                  disabled={isReadOnly}
                  value={selectedStep.conditionConfig?.fieldName || 'Thẩm quyền thụ lý'}
                  onChange={(e) =>
                    onUpdateStep({
                      ...selectedStep,
                      conditionConfig: {
                        fieldName: e.target.value,
                        operator: selectedStep.conditionConfig?.operator || '=',
                        compareValue: selectedStep.conditionConfig?.compareValue || '',
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {COMMON_CHECK_FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toán tử */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Toán tử so sánh</label>
                <select
                  disabled={isReadOnly}
                  value={selectedStep.conditionConfig?.operator || '='}
                  onChange={(e) =>
                    onUpdateStep({
                      ...selectedStep,
                      conditionConfig: {
                        fieldName: selectedStep.conditionConfig?.fieldName || 'Thẩm quyền thụ lý',
                        operator: e.target.value,
                        compareValue: selectedStep.conditionConfig?.compareValue || '',
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {COMPARISON_OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Giá trị so sánh */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  {selectedStep.conditionConfig?.fieldName === 'Kiểm tra văn bản hồ sơ'
                    ? 'Văn bản cần kiểm tra'
                    : 'Giá trị so sánh'}
                </label>
                {selectedStep.conditionConfig?.fieldName === 'Kiểm tra văn bản hồ sơ' ? (
                  <div className="space-y-1.5">
                    <select
                      disabled={isReadOnly}
                      value={selectedStep.conditionConfig?.compareValue || ''}
                      onChange={(e) =>
                        onUpdateStep({
                          ...selectedStep,
                          conditionConfig: {
                            fieldName: 'Kiểm tra văn bản hồ sơ',
                            operator: selectedStep.conditionConfig?.operator || 'co_gia_tri',
                            compareValue: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="">-- Chọn văn bản từ danh mục mẫu --</option>
                      {COMMON_DOCUMENTS.map((doc) => (
                        <option key={doc} value={doc}>
                          {doc}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={selectedStep.conditionConfig?.compareValue || ''}
                      onChange={(e) =>
                        onUpdateStep({
                          ...selectedStep,
                          conditionConfig: {
                            fieldName: 'Kiểm tra văn bản hồ sơ',
                            operator: selectedStep.conditionConfig?.operator || 'co_gia_tri',
                            compareValue: e.target.value,
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="Hoặc tự gõ tên văn bản khác..."
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={selectedStep.conditionConfig?.compareValue || ''}
                    onChange={(e) =>
                      onUpdateStep({
                        ...selectedStep,
                        conditionConfig: {
                          fieldName: selectedStep.conditionConfig?.fieldName || 'Thẩm quyền thụ lý',
                          operator: selectedStep.conditionConfig?.operator || '=',
                          compareValue: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập giá trị cần đối chiếu..."
                  />
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* LOẠI 3: NHÓM THÔNG TIN (INFO_GROUP)                             */}
          {/* ============================================================== */}
          {selectedStep.nodeType === 'INFO_GROUP' && (
            <>
              {/* Tên nhóm */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tên nhóm thông tin</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedStep.name}
                  onChange={(e) => onUpdateStep({ ...selectedStep, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  placeholder="Ví dụ: Thông tin người nộp đơn..."
                />
              </div>

              {/* Danh sách trường dữ liệu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Danh sách trường ({selectedStep.dataFields?.length || 0})
                  </label>
                </div>

                {/* Danh sách các trường hiện tại */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(!selectedStep.dataFields || selectedStep.dataFields.length === 0) ? (
                    <p className="text-[10.5px] text-slate-400 italic text-center py-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                      Chưa có trường dữ liệu nào trong nhóm này.
                    </p>
                  ) : (
                    selectedStep.dataFields.map((field, idx) => (
                      <div
                        key={field.id || idx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-1.5 text-[11px]"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-800 block truncate">{field.name}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{field.type}</span>
                            <span>•</span>
                            <span className={field.required ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                              {field.required ? 'Bắt buộc' : 'Tùy chọn'}
                            </span>
                          </div>
                        </div>

                        {/* Nút điều hướng thứ tự & xóa */}
                        {!isReadOnly && (
                          <div className="flex items-center gap-0.5">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(selectedStep.dataFields || [])];
                                  const temp = list[idx - 1];
                                  list[idx - 1] = list[idx];
                                  list[idx] = temp;
                                  onUpdateStep({ ...selectedStep, dataFields: list });
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Di chuyển lên"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                              </button>
                            )}
                            {idx < (selectedStep.dataFields?.length || 0) - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(selectedStep.dataFields || [])];
                                  const temp = list[idx + 1];
                                  list[idx + 1] = list[idx];
                                  list[idx] = temp;
                                  onUpdateStep({ ...selectedStep, dataFields: list });
                                }}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Di chuyển xuống"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const list = selectedStep.dataFields?.filter((_, i) => i !== idx);
                                onUpdateStep({ ...selectedStep, dataFields: list });
                              }}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600 ml-1"
                              title="Xóa trường này"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Form thêm trường mới */}
                {!isReadOnly && (
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2 mt-2">
                    <span className="text-[10.5px] font-bold text-purple-900 block">Thêm trường mới vào nhóm</span>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="Tên trường (vd: Số CCCD, Họ tên...)"
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] focus:outline-none focus:border-purple-500"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-[10.5px] focus:outline-none focus:border-purple-500"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center gap-1.5 text-[10.5px] text-slate-700 cursor-pointer pl-1">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        <span>Bắt buộc</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={!newFieldName.trim()}
                      onClick={() => {
                        if (!newFieldName.trim()) return;
                        const newField = {
                          id: `field-${Date.now()}`,
                          name: newFieldName.trim(),
                          type: newFieldType,
                          required: newFieldRequired,
                        };
                        onUpdateStep({
                          ...selectedStep,
                          dataFields: [...(selectedStep.dataFields || []), newField],
                        });
                        setNewFieldName('');
                        setNewFieldRequired(false);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${newFieldName.trim()
                        ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      + Thêm trường
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* LOẠI 4: TRƯỜNG DỮ LIỆU ĐỘC LẬP (DATA_FIELD)                    */}
          {/* ============================================================== */}
          {selectedStep.nodeType === 'DATA_FIELD' && (
            <>
              {/* Tên trường */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tên trường dữ liệu</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedStep.name}
                  onChange={(e) => onUpdateStep({ ...selectedStep, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-semibold"
                  placeholder="Ví dụ: Số CCCD, Họ tên..."
                />
              </div>

              {/* Loại dữ liệu */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Loại dữ liệu</label>
                <select
                  disabled={isReadOnly}
                  value={selectedStep.fieldType || 'Văn bản ngắn'}
                  onChange={(e) => onUpdateStep({ ...selectedStep, fieldType: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bắt buộc / Không bắt buộc */}
              <div className="pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/70">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={Boolean(selectedStep.required)}
                    onChange={(e) => onUpdateStep({ ...selectedStep, required: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-semibold text-slate-800 text-[11px]">Bắt buộc phải điền</span>
                </label>
              </div>
            </>
          )}

          {/* Nút xóa khối */}
          {!isReadOnly && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onDeleteStep(selectedStep.id)}
                className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Xóa khối này</span>
              </button>
            </div>
          )}

          {/* Nút Lưu quy trình */}
          {onSave && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onSave}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                title="Lưu lại sơ đồ quy trình (Ctrl+S)"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Lưu quy trình</span>
              </button>
            </div>
          )}
        </div>
      </aside>
      {renderDocumentDetailModal()}
    </>
  );
}
