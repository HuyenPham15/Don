// src/screens/quanLyTrinhKy/QuanLyTrinhKyScreen.tsx
import React from 'react';
import { Screen } from '../../types';
import { CurrentUserAccount } from '../../types/signing';
import TrinhKyFigmaApp from './TrinhKyFigmaApp';

export interface QuanLyTrinhKyScreenProps {
  onNav: (s: Screen) => void;
  currentAccount?: CurrentUserAccount;
  onSwitchAccount?: (role: 'can_bo' | 'lanh_dao') => void;
  onSelectHoSo?: (hoSoCode: string) => void;
  initialLuotTrinhId?: string;
}

/**
 * Màn hình quản lý trình ký tập trung
 * Đồng bộ trực tiếp từ thiết kế chuẩn Figma trong gói Trình ký - Phê duyệt văn bản
 */
export default function QuanLyTrinhKyScreen({
  onNav,
  currentAccount,
  initialLuotTrinhId,
}: QuanLyTrinhKyScreenProps) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <TrinhKyFigmaApp
        currentAccount={currentAccount}
        onNav={onNav}
        initialRole={currentAccount?.role === 'lanh_dao' ? 'leader' : 'officer'}
        initialView="work"
        initialDocId={initialLuotTrinhId}
        hideSidebar={true}
      />
    </div>
  );
}
