// src/screens/workflowAdmin/ProcessWorkflowModule.tsx
import React, { useState } from 'react';
import { Screen } from '../../types';
import { ProcessWorkflow, ProcessStatus } from '../../types/workflowConfig';
import { INITIAL_PROCESS_WORKFLOWS } from '../../constants/processWorkflows';
import ProcessWorkflowList from './ProcessWorkflowList';
import CreateWorkflowScreen from './CreateWorkflowScreen';
import WorkflowDesignerScreen from './WorkflowDesignerScreen';

interface ProcessWorkflowModuleProps {
  onNav: (s: Screen) => void;
}

type ModuleView = 'list' | 'create' | 'designer';

export default function ProcessWorkflowModule({ onNav }: ProcessWorkflowModuleProps) {
  const [workflows, setWorkflows] = useState<ProcessWorkflow[]>(INITIAL_PROCESS_WORKFLOWS);
  const [currentView, setCurrentView] = useState<ModuleView>('list');
  const [editingWorkflow, setEditingWorkflow] = useState<ProcessWorkflow | null>(null);
  const [designerMode, setDesignerMode] = useState<'edit' | 'view'>('edit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Mở màn tạo mới
  const handleOpenCreate = () => {
    setCurrentView('create');
  };

  // Tạo & vào thiết kế
  const handleCreateAndDesign = (newWf: ProcessWorkflow) => {
    setWorkflows((prev) => [newWf, ...prev]);
    setEditingWorkflow(newWf);
    setDesignerMode('edit');
    setCurrentView('designer');
    showToast(`✓ Đã tạo quy trình "${newWf.name}".`);
  };

  // Mở màn thiết kế để xem hoặc chỉnh sửa
  const handleEditWorkflow = (wf: ProcessWorkflow, mode: 'edit' | 'view' = 'edit') => {
    setEditingWorkflow(wf);
    setDesignerMode(mode);
    setCurrentView('designer');
  };

  // Sao chép quy trình
  const handleDuplicateWorkflow = (wf: ProcessWorkflow) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const duplicated: ProcessWorkflow = {
      ...wf,
      id: `wf-${Date.now()}`,
      code: `${wf.code}-COPY`,
      name: `${wf.name} (Bản sao)`,
      version: 'v1.0',
      status: 'draft',
      updatedAt: dateStr,
      updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
      versionHistory: [
        {
          version: 'v1.0',
          publishedAt: 'Bản sao chép',
          publishedBy: 'Nguyễn Minh Anh',
          notes: `Sao chép từ quy trình gốc ${wf.code} (${wf.name})`,
          isCurrentActive: true,
        },
      ],
    };

    setWorkflows((prev) => [duplicated, ...prev]);
    showToast(`✓ Đã nhân bản quy trình thành "${duplicated.name}".`);
  };

  // Tạo phiên bản mới từ quy trình đã phát hành (Requirement 8)
  const handleCreateNewVersion = (baseWf: ProcessWorkflow) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Tính số phiên bản tiếp theo
    const currentVerNum = parseFloat(baseWf.version.replace('v', '')) || 1.0;
    const nextVer = `v${(currentVerNum + 0.1).toFixed(1)}`;

    const newVersionWf: ProcessWorkflow = {
      ...baseWf,
      id: `wf-${Date.now()}`,
      version: nextVer,
      status: 'draft',
      updatedAt: dateStr,
      updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
      effectiveDate: undefined,
      versionHistory: [
        {
          version: nextVer,
          publishedAt: 'Bản nháp đang chỉnh sửa',
          publishedBy: 'Nguyễn Minh Anh',
          notes: `Khởi tạo phiên bản mới từ phiên bản ${baseWf.version}`,
          isCurrentActive: true,
        },
        ...baseWf.versionHistory.map((v) => ({ ...v, isCurrentActive: false })),
      ],
    };

    setWorkflows((prev) => [newVersionWf, ...prev]);
    setEditingWorkflow(newVersionWf);
    setDesignerMode('edit');
    setCurrentView('designer');
    showToast(`✓ Đã tạo phiên bản mới ${nextVer} (Bản nháp) để tiếp tục chỉnh sửa.`);
  };

  // Lưu bản nháp
  const handleSaveWorkflow = (updatedWf: ProcessWorkflow) => {
    setWorkflows((prev) => prev.map((w) => (w.id === updatedWf.id ? updatedWf : w)));
    setEditingWorkflow(updatedWf);
  };

  // Phát hành - Cập nhật loại đơn gắn theo version mới nhất của quy trình
  const handlePublishWorkflow = (workflowId: string, effectiveDate: string, notes: string) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let publishedTargetName = '';
    let publishedLoaiDonName = '';
    let publishedVersion = '';

    setWorkflows((prev) => {
      const target = prev.find((w) => w.id === workflowId);
      if (!target) return prev;

      publishedTargetName = target.name;
      publishedLoaiDonName = target.loaiDonName;
      publishedVersion = target.version;

      return prev.map((w) => {
        // Cập nhật quy trình được phát hành thành phiên bản mới nhất cho loại đơn
        if (w.id === workflowId) {
          const newHistoryItem = {
            version: w.version,
            publishedAt: effectiveDate,
            publishedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
            notes: notes || `Phát hành chính thức phiên bản ${w.version}. Tự động gắn loại đơn ${w.loaiDonName} theo phiên bản mới nhất này.`,
            isCurrentActive: true,
          };

          return {
            ...w,
            status: 'published' as const,
            isLatestForLoaiDon: true, // Đánh dấu là phiên bản mới nhất đang áp dụng cho loại đơn này
            effectiveDate,
            updatedAt: dateStr,
            updatedBy: 'Nguyễn Minh Anh (Cán bộ thụ lý)',
            versionHistory: [
              newHistoryItem,
              ...w.versionHistory.map((vh) => ({ ...vh, isCurrentActive: false })),
            ],
          };
        }

        // Nếu cùng Loại đơn mà là phiên bản khác thì hạ cờ isLatestForLoaiDon
        if (w.loaiDonId === target.loaiDonId && w.id !== workflowId) {
          return {
            ...w,
            isLatestForLoaiDon: false, // Phiên bản cũ / bản nháp không còn là bản hiệu lực chính
          };
        }

        return w;
      });
    });

    // Cập nhật workflow đang mở nếu đúng
    if (editingWorkflow && editingWorkflow.id === workflowId) {
      setEditingWorkflow((prev) =>
        prev
          ? {
              ...prev,
              status: 'published',
              isLatestForLoaiDon: true,
              effectiveDate,
            }
          : null
      );
    }

    showToast(`✓ Đã phát hành quy trình! Loại đơn "${publishedLoaiDonName}" đã được cập nhật gắn theo phiên bản mới nhất (${publishedVersion}).`);
  };

  // Thay đổi trạng thái (Ngừng áp dụng / Kích hoạt lại)
  const handleToggleStatus = (wfId: string, nextStatus: ProcessStatus) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === wfId) {
          return {
            ...w,
            status: nextStatus,
          };
        }
        return w;
      })
    );
    showToast(`✓ Đã cập nhật trạng thái quy trình thành "${nextStatus === 'archived' ? 'Ngừng áp dụng' : 'Bản nháp'}".`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f7fb]">
      {currentView === 'list' && (
        <ProcessWorkflowList
          workflows={workflows}
          onCreateNew={handleOpenCreate}
          onEditWorkflow={handleEditWorkflow}
          onDuplicateWorkflow={handleDuplicateWorkflow}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {currentView === 'create' && (
        <CreateWorkflowScreen
          onCancel={() => setCurrentView('list')}
          onCreateAndDesign={handleCreateAndDesign}
          existingWorkflowsCount={workflows.length}
          existingWorkflows={workflows}
        />
      )}

      {currentView === 'designer' && editingWorkflow && (
        <WorkflowDesignerScreen
          initialWorkflow={editingWorkflow}
          onSaveWorkflow={handleSaveWorkflow}
          onPublishWorkflow={handlePublishWorkflow}
          onCreateNewVersion={handleCreateNewVersion}
          onBackToList={() => {
            setCurrentView('list');
            setEditingWorkflow(null);
          }}
          initialMode={designerMode}
        />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-xs animate-in slide-in-from-bottom duration-200">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
