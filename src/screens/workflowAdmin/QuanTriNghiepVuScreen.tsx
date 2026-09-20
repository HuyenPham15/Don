import React, { useState, useEffect } from 'react';
import { Screen } from '../../types';
import { BusinessAdminTab } from '../../types/businessAdmin';
import ProcessWorkflowModule from './ProcessWorkflowModule';
import LoaiDonTab from './tabs/LoaiDonTab';
import LichLamViecTab from './tabs/LichLamViecTab';
import BieuMauTab from './tabs/BieuMauTab';

interface QuanTriNghiepVuScreenProps {
  onNav: (s: Screen) => void;
  initialTab?: BusinessAdminTab;
}

export default function QuanTriNghiepVuScreen({
  onNav,
  initialTab = 'quy-trinh',
}: QuanTriNghiepVuScreenProps) {
  const [activeTab, setActiveTab] = useState<BusinessAdminTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f4f7fb]">
      {activeTab === 'quy-trinh' && <ProcessWorkflowModule onNav={onNav} />}
      {activeTab === 'loai-don' && <LoaiDonTab onNavigateToWorkflow={() => setActiveTab('quy-trinh')} />}
      {activeTab === 'lich-lam-viec' && <LichLamViecTab />}
      {activeTab === 'bieu-mau' && <BieuMauTab />}
    </div>
  );
}
