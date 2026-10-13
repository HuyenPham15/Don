// src/screens/VanBanChoKyScreen.tsx
import React from 'react';
import { Screen } from '../types';
import { SigningDocument, CurrentUserAccount } from '../types/signing';
import TrinhKyFigmaApp from './quanLyTrinhKy/TrinhKyFigmaApp';

export interface VanBanChoKyScreenProps {
  onNav: (s: Screen) => void;
  documents?: SigningDocument[];
  onUpdateDocuments?: (docs: SigningDocument[]) => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  isEmbedded?: boolean;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
  initialDocId?: string;
  onBackToKanban?: () => void;
  currentAccount?: CurrentUserAccount;
}

/**
 * Màn hình xem và ký duyệt văn bản của Lãnh đạo
 * Đồng bộ trực tiếp từ thiết kế chuẩn Figma trong gói Trình ký - Phê duyệt văn bản
 */
export default function VanBanChoKyScreen({
  onNav,
  initialDocId,
  onBackToKanban,
  currentAccount,
}: VanBanChoKyScreenProps) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <TrinhKyFigmaApp
        currentAccount={currentAccount}
        onNav={onNav}
        initialRole="leader"
        initialView="leader-detail"
        initialDocId={initialDocId}
        onBackToKanban={onBackToKanban}
        hideSidebar={true}
      />
    </div>
  );
}
