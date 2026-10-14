// src/screens/TaoDonMoiScreen.tsx
import React, { useState } from 'react';
import { Screen, DonDetail } from '../types';
import { CreateCasePage } from './quanLyTrinhKy/TrinhKyFigmaApp';
import './quanLyTrinhKy/trinhKyFigma.css';

export interface TaoDonMoiScreenProps {
  onNav: (s: Screen) => void;
  onAddDirectDon?: (newDon: DonDetail) => void;
}

export default function TaoDonMoiScreen({ onNav, onAddDirectDon }: TaoDonMoiScreenProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleNotify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleCreateDonSubmit = (caseData?: any) => {
    if (onAddDirectDon) {
      const now = new Date();
      const code = `Đ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newDon: DonDetail = {
        id: code,
        code: code,
        title: caseData?.content || 'Đơn tố cáo trong tố tụng hình sự - Tạm giữ vật chứng',
        nguoiNop: caseData?.nguoiNop || 'Nguyễn Văn An',
        ngayNhan: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
        gioNhan: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        loaiDon: caseData?.loaiDon || 'Đơn tố cáo trong tố tụng hình sự',
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: 'Đang xử lý',
        currentStep: 1,
        stepName: 'Tiếp nhận hồ sơ',
        canBoTiepNhan: 'Nguyễn Hoàng Nam',
        donViTiepNhan: 'Công an thành phố Hà Nội',
        noiDung: caseData?.content || 'Người tố cáo đề nghị cơ quan có thẩm quyền kiểm tra việc tiếp nhận, lập biên bản, niêm phong và quản lý thiết bị điện thoại tại thời điểm giao nhận ngày 08/09/2026 để xác định quá trình xử lý có đúng quy định hay không.',
        progress: {
          currentStep: 1,
          totalSteps: 5,
          stepName: 'Tiếp nhận hồ sơ',
          steps: ['Tiếp nhận', 'Phân loại', 'Thẩm tra & Xác minh', 'Trình ký', 'Trả kết quả'],
        },
      };
      onAddDirectDon(newDon);
    }
  };

  return (
    <div className="app-shell trinh-ky-figma-scope w-full h-full flex flex-col overflow-hidden relative">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-slate-900/90 text-white rounded-xl shadow-xl text-xs font-medium animate-fade-in flex items-center gap-2 backdrop-blur-xs">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
      <CreateCasePage
        onBack={() => onNav('cong-viec')}
        onNotify={handleNotify}
        onSubmit={handleCreateDonSubmit}
      />
    </div>
  );
}
