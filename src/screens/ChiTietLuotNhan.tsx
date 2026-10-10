import React, { useState, useRef } from 'react';
import { LuotNhan, Screen, UploadedFile, DonDetail } from '../types';
import ChuyenTiepNhanModal, { ChuyenTiepNhanSubmitData } from '../components/modals/ChuyenTiepNhanModal';
import { TiepNhanDonItem } from '../constants/departments';

interface ChiTietLuotNhanProps {
  luotNhan: LuotNhan;
  onNav: (screen: Screen) => void;
  onUpdateLuotNhan?: (updated: LuotNhan) => void;
  onChuyenTiepNhan?: (item: TiepNhanDonItem, isDirect: boolean, assignedOfficerName?: string) => void;
  onSelectDon?: (don: DonDetail) => void;
  isJustCreated?: boolean;
}

export default function ChiTietLuotNhan({
  luotNhan,
  onNav,
  onUpdateLuotNhan,
  onChuyenTiepNhan,
  onSelectDon,
  isJustCreated = true,
}: ChiTietLuotNhanProps) {
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'lich-su'>('thong-tin');
  const [currentLuotNhan, setCurrentLuotNhan] = useState<LuotNhan>(luotNhan);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(
    luotNhan.files && luotNhan.files.length > 0 ? luotNhan.files[0] : null
  );
  const [isChuyenModalOpen, setIsChuyenModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit form state
  const [editNguoiNop, setEditNguoiNop] = useState(luotNhan.nguoiNop || '');
  const [editDonVi, setEditDonVi] = useState(luotNhan.donVi || 'Công an thành phố Hà Nội');
  const [editHinhThuc, setEditHinhThuc] = useState(luotNhan.hinhThuc || 'Trực tiếp');
  const [editNoiDung, setEditNoiDung] = useState(luotNhan.noiDung || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Upload tệp
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      const newUploadedFiles: UploadedFile[] = fileList.map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        category: 'attach',
      }));

      const updatedFiles = [...(currentLuotNhan.files || []), ...newUploadedFiles];
      const updated: LuotNhan = {
        ...currentLuotNhan,
        files: updatedFiles,
        hasFile: true,
        fileCount: updatedFiles.length,
        historyLogs: [
          ...(currentLuotNhan.historyLogs || []),
          {
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
            action: 'Tải lên tài liệu đính kèm',
            actor: 'Lê Ngọc Mai',
            note: `Đã thêm ${newUploadedFiles.length} tệp tài liệu: ${newUploadedFiles.map(f => f.name).join(', ')}`,
          },
        ],
      };

      setCurrentLuotNhan(updated);
      setSelectedFile(newUploadedFiles[0]);
      if (onUpdateLuotNhan) onUpdateLuotNhan(updated);
      showToast(`Đã tải lên thành công ${newUploadedFiles.length} tệp tài liệu!`);
    }
  };

  // Quét tài liệu giả lập
  const handleScanDoc = () => {
    setIsScanModalOpen(false);
    const scannedFile: UploadedFile = {
      name: `Tài_liệu_quét_${Date.now().toString().slice(-4)}.pdf`,
      size: '2.4 MB',
      category: 'attach',
    };
    const updatedFiles = [...(currentLuotNhan.files || []), scannedFile];
    const updated: LuotNhan = {
      ...currentLuotNhan,
      files: updatedFiles,
      hasFile: true,
      fileCount: updatedFiles.length,
      historyLogs: [
        ...(currentLuotNhan.historyLogs || []),
        {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
          action: 'Quét tài liệu từ máy quét',
          actor: 'Lê Ngọc Mai',
          note: `Đã số hóa và lưu tệp ${scannedFile.name}`,
        },
      ],
    };
    setCurrentLuotNhan(updated);
    setSelectedFile(scannedFile);
    if (onUpdateLuotNhan) onUpdateLuotNhan(updated);
    showToast(`Đã quét và tải tài liệu ${scannedFile.name} thành công!`);
  };

  // Lưu chỉnh sửa thông tin lượt nhận
  const handleSaveEdit = () => {
    const updated: LuotNhan = {
      ...currentLuotNhan,
      nguoiNop: editNguoiNop.trim() || 'Chưa rõ',
      donVi: editDonVi,
      hinhThuc: editHinhThuc,
      noiDung: editNoiDung,
      historyLogs: [
        ...(currentLuotNhan.historyLogs || []),
        {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
          action: 'Chỉnh sửa thông tin lượt nhận',
          actor: 'Lê Ngọc Mai',
          note: 'Cập nhật lại các thông tin tiếp nhận',
        },
      ],
    };
    setCurrentLuotNhan(updated);
    if (onUpdateLuotNhan) onUpdateLuotNhan(updated);
    setIsEditModalOpen(false);
    showToast('Cập nhật thông tin lượt nhận thành công!');
  };

  // Chuyển xử lý
  const handleChuyenTiepNhanSubmit = (data: ChuyenTiepNhanSubmitData) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    const updated: LuotNhan = {
      ...currentLuotNhan,
      status: 'da_chuyen',
      ngayChuyenXuLy: nowStr,
      historyLogs: [
        ...(currentLuotNhan.historyLogs || []),
        {
          time: nowStr,
          action: data.hinhThuc === 'truc_tiep'
            ? `Chuyển xử lý trực tiếp cho cán bộ ${data.canBoNhan?.name || 'Nguyễn Minh Anh'} (${data.donViTiepNhanName})`
            : `Chuyển xử lý vào hàng chờ đơn vị ${data.donViTiepNhanName}`,
          actor: 'Lê Ngọc Mai',
          note: data.ghiChu || 'Chuyển đơn vị thụ lý giải quyết',
        },
      ],
    };

    setCurrentLuotNhan(updated);
    if (onUpdateLuotNhan) onUpdateLuotNhan(updated);

    if (onChuyenTiepNhan) {
      const dynamicCode = currentLuotNhan.id.startsWith('LN-') ? `Đ-${currentLuotNhan.id.replace('LN-', '')}` : currentLuotNhan.id;
      const item: TiepNhanDonItem = {
        id: `TN-${currentLuotNhan.id}`,
        code: dynamicCode,
        luotNhanId: currentLuotNhan.id,
        nguoiNop: currentLuotNhan.nguoiNop || 'Chưa rõ',
        loaiDon: currentLuotNhan.loaiDon || 'Đơn phản ánh kiến nghị',
        ngayNhan: currentLuotNhan.ngayNhan,
        ngayChuyenDen: nowStr,
        donViHienTai: currentLuotNhan.donVi || 'Công an thành phố Hà Nội',
        donViTiepNhanId: data.donViTiepNhanId,
        donViTiepNhan: data.donViTiepNhanName,
        hanXuLy: '15 ngày',
        hanXuLyFull: '23/10/2026',
        trangThai: data.hinhThuc === 'truc_tiep' ? 'dang_xu_ly' : 'cho_phan_cong',
        noiDungTomTat: currentLuotNhan.noiDung || 'Đơn tiếp nhận mới vào hệ thống',
        ghiChuChuyen: data.ghiChu,
        nguoiChuyen: 'Lê Ngọc Mai',
        canBoXuLy: data.canBoNhan?.name,
        canBoXuLyId: data.canBoNhan?.id,
        chucVuCanBo: data.canBoNhan?.role,
      };
      onChuyenTiepNhan(item, data.hinhThuc === 'truc_tiep', data.canBoNhan?.name);
    }

    setIsChuyenModalOpen(false);
    showToast(`Đã chuyển xử lý thành công lượt nhận ${currentLuotNhan.id}!`);

    // Tự động chuyển tiếp sang Bàn phân tích hoặc Đơn tiếp nhận
    setTimeout(() => {
      const dynamicCode = currentLuotNhan.id.startsWith('LN-') ? `Đ-${currentLuotNhan.id.replace('LN-', '')}` : currentLuotNhan.id;
      const donObj: DonDetail = {
        id: dynamicCode,
        code: dynamicCode,
        title: currentLuotNhan.noiDung || `Hồ sơ ${dynamicCode}`,
        luotNhanId: currentLuotNhan.id,
        nguoiNop: currentLuotNhan.nguoiNop,
        ngayNhan: currentLuotNhan.ngayNhan,
        loaiDon: currentLuotNhan.loaiDon || 'Đơn phản ánh kiến nghị',
        type: 'ĐƠN TIẾP NHẬN',
        statusBadge: 'Đang xác minh thông tin',
      };
      if (onSelectDon) onSelectDon(donObj);
      onNav('don-tiep-nhan');
    }, 1200);
  };

  const isDaChuyen = currentLuotNhan.status === 'da_chuyen';
  const ngayNhanFormatted = currentLuotNhan.ngayNhan.includes(':')
    ? currentLuotNhan.ngayNhan
    : `${currentLuotNhan.ngayNhan} ${currentLuotNhan.gioNhan || '19:41:00'}`;
  const nguoiThaoTac = currentLuotNhan.nguoiThaoTacGanNhat || `Lê Ngọc Mai – ${ngayNhanFormatted.split(' ')[0]} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden w-full font-sans">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-bounce text-xs font-medium">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
      />

      {/* ─── 1. HEADER BAR TRÊN CÙNG (THEO MẪU ẢNH) ─────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Cụm Trái: Breadcrumb + Mã Lượt Nhận + Badges */}
          <div className="flex flex-col gap-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-normal">
              <button
                type="button"
                onClick={() => onNav('nhan-don-list')}
                className="hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>← Quay lại</span>
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => onNav('nhan-don-list')}
                className="hover:text-blue-700 cursor-pointer transition-colors"
              >
                Nhận đơn
              </button>
              <span>/</span>
              <span className="text-slate-400">Chi tiết lượt nhận</span>
            </div>

            {/* Title Mã lượt nhận & Tag trạng thái */}
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">
                {currentLuotNhan.id}
              </h1>

              {/* Tag Trạng thái */}
              {isDaChuyen ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Đã chuyển xử lý
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#eef5fc] text-[#0066cc] border border-[#d0e4ff]">
                  Chưa chuyển
                </span>
              )}

              {/* Tag Hình thức */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f1f3f5] text-[#495057] border border-[#e9ecef]">
                {currentLuotNhan.hinhThuc || 'Trực tiếp'}
              </span>
            </div>
          </div>

          {/* Cụm Phải: Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setEditNguoiNop(currentLuotNhan.nguoiNop || '');
                setEditDonVi(currentLuotNhan.donVi || 'Công an thành phố Hà Nội');
                setEditHinhThuc(currentLuotNhan.hinhThuc || 'Trực tiếp');
                setEditNoiDung(currentLuotNhan.noiDung || '');
                setIsEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-[12px] font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-slate-500">edit</span>
              <span>Chỉnh sửa</span>
            </button>

            <button
              type="button"
              onClick={() => setIsChuyenModalOpen(true)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#004ac6] hover:bg-[#003ea8] cursor-pointer active:scale-95 text-white text-[12px] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[15px] rotate-[-25deg]">send</span>
              <span>Chuyển xử lý</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN CONTENT (BỐ CỤC 2 CỘT NHƯ TRONG ẢNH) ─────────────────── */}
      <div className="flex-1 p-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* ─── CỘT TRÁI (W: 450px, CHI TIẾT THÔNG TIN VÀ TÀI LIỆU) ─────────────────── */}
        <div className="w-full lg:w-[460px] shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden h-full">
          {/* Card Tabs Header */}
          <div className="flex items-center border-b border-slate-200 px-4 pt-1 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('thong-tin')}
              className={`flex items-center gap-1.5 py-2.5 px-2 text-[13px] font-semibold transition-colors cursor-pointer border-b-2 ${activeTab === 'thong-tin'
                ? 'border-[#8b1515] text-[#8b1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Thông tin chung</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lich-su')}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-[13px] font-semibold transition-colors cursor-pointer border-b-2 ml-2 ${activeTab === 'lich-su'
                ? 'border-[#8b1515] text-[#8b1515]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Lịch sử xử lý</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {activeTab === 'thong-tin' ? (
              <div className="space-y-4">
                {/* Bảng thuộc tính Key - Value */}
                <div className="divide-y divide-slate-100 text-[12.5px]">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Ngày nhận</span>
                    <span className="text-slate-900 font-medium text-right">{ngayNhanFormatted}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Đơn vị nhận</span>
                    <span className="text-slate-900 font-medium text-right">{currentLuotNhan.donVi || 'Công an thành phố Hà Nội'}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Người nộp</span>
                    <span className="text-slate-900 font-medium text-right">
                      {currentLuotNhan.nguoiNop && currentLuotNhan.nguoiNop !== 'Chưa xác định danh tính (Khuyết danh)'
                        ? currentLuotNhan.nguoiNop
                        : 'Chưa rõ'}
                    </span>
                  </div>

                  {/* <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Ngày chuyển xử lý</span>
                    <span className="text-slate-600 font-normal text-right">
                      {currentLuotNhan.ngayChuyenXuLy || (isDaChuyen ? 'Đã chuyển' : 'Chưa chuyển xử lý')}
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Người thao tác gần nhất</span>
                    <span className="text-slate-900 font-medium text-right">{nguoiThaoTac}</span>
                  </div> */}
                </div>

                {/* Section Tài liệu đính kèm */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-slate-800">Tài liệu đính kèm</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsScanModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-[11.5px] font-medium shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] text-slate-500">crop_free</span>
                        <span>Quét tài liệu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white text-[11.5px] font-medium rounded-md shadow-2xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">upload</span>
                        <span>Tải tệp</span>
                      </button>
                    </div>
                  </div>

                  {/* Vùng tài liệu đính kèm */}
                  {currentLuotNhan.files && currentLuotNhan.files.length > 0 ? (
                    <div className="space-y-2">
                      {currentLuotNhan.files.map((file, idx) => {
                        const isSelected = selectedFile?.name === file.name;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedFile(file)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${isSelected
                              ? 'bg-red-50/40 border-red-200 text-slate-900 font-medium shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
                                picture_as_pdf
                              </span>
                              <div className="truncate">
                                <div className="truncate font-medium">{file.name}</div>
                                <div className="text-[10px] text-slate-400">{file.size}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile(file);
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 cursor-pointer"
                                title="Xem tài liệu"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Trạng thái trống như ảnh đính kèm */
                    <div className="border border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-slate-50/40">
                      <span className="material-symbols-outlined text-[24px] text-slate-400 mb-1">
                        crop_portrait
                      </span>
                      <p className="text-[12px] text-slate-500 font-normal">
                        Chưa có tài liệu nào được nộp kèm.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Tab Lịch sử xử lý */
              <div className="space-y-4">
                <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 text-xs">
                  {currentLuotNhan.historyLogs && currentLuotNhan.historyLogs.length > 0 ? (
                    currentLuotNhan.historyLogs.map((log, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white" />
                        <div className="text-[11px] text-slate-400 font-label-technical">{log.time}</div>
                        <div className="font-semibold text-slate-800 text-[12.5px] mt-0.5">{log.action}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Thực hiện: <span className="font-medium text-slate-700">{log.actor}</span></div>
                        {log.note && (
                          <div className="mt-1 text-[11.5px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                            {log.note}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="relative group">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white" />
                      <div className="text-[11px] text-slate-400 font-label-technical">{ngayNhanFormatted}</div>
                      <div className="font-semibold text-slate-800 text-[12.5px] mt-0.5">Ghi nhận lượt nhận</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Thực hiện: <span className="font-medium text-slate-700">Lê Ngọc Mai</span></div>
                      <div className="mt-1 text-[11.5px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        Đã ghi nhận lượt nhận vào hệ thống một cửa CATP Hà Nội.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── CỘT PHẢI (NỘI DUNG TÀI LIỆU) ─────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden h-full">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-white shrink-0">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
              <span className="material-symbols-outlined text-[16px] text-[#8b1515]">description</span>
              <span>Nội dung tài liệu</span>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => showToast('Đang tải xuống tài liệu...')}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 cursor-pointer"
                  title="Tải xuống"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </button>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-white">
            {selectedFile ? (
              /* Hiển thị Document Previewer khi có file */
              <div className="w-full h-full flex flex-col bg-slate-50 rounded-lg border border-slate-200 p-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-xl">picture_as_pdf</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedFile.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">Trang 1 / 1</span>
                </div>

                <div className="bg-white p-6 shadow-xs border border-slate-200 rounded mx-auto max-w-2xl w-full text-slate-800 space-y-4 text-xs leading-relaxed font-sans">
                  <div className="text-center font-bold text-sm tracking-wide uppercase">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
                    <span className="font-normal text-xs normal-case">Độc lập - Tự do - Hạnh phúc</span>
                  </div>
                  <div className="border-b border-slate-300 w-32 mx-auto my-2" />

                  <div className="text-center font-bold text-base text-slate-900 mt-4 uppercase">
                    {currentLuotNhan.loaiDon || 'ĐƠN TIẾP NHẬN YÊU CẦU / PHẢN ÁNH'}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p><strong>Kính gửi:</strong> {currentLuotNhan.donVi || 'Công an thành phố Hà Nội'}</p>
                    <p><strong>Người làm đơn:</strong> {currentLuotNhan.nguoiNop || 'Chưa rõ'}</p>
                    {currentLuotNhan.cccd && <p><strong>Số CCCD:</strong> {currentLuotNhan.cccd}</p>}
                    {currentLuotNhan.sdt && <p><strong>Số điện thoại:</strong> {currentLuotNhan.sdt}</p>}
                    {currentLuotNhan.diaChi && <p><strong>Địa chỉ cư trú:</strong> {currentLuotNhan.diaChi}</p>}
                  </div>

                  <div className="pt-2">
                    <p className="font-bold mb-1">Nội dung trình bày:</p>
                    <p className="text-slate-700 bg-slate-50/80 p-3 rounded border border-slate-200 leading-relaxed">
                      {currentLuotNhan.noiDung || 'Hồ sơ tài liệu tiếp nhận tại bộ phận một cửa. Đang chờ chuyển giao đơn vị chuyên môn thụ lý và thẩm tra theo đúng thẩm quyền quy định.'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end pt-8">
                    <div className="text-slate-400 text-[11px] italic">
                      Mã số biên nhận: {currentLuotNhan.id}<br />
                      Thời điểm số hóa: {ngayNhanFormatted}
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Người nộp đơn</p>
                      <p className="text-[11px] text-slate-400 italic mb-10">(Ký và ghi rõ họ tên)</p>
                      <p className="font-semibold text-slate-700">{currentLuotNhan.nguoiNop || 'Chưa rõ'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Trạng thái trống như ảnh đính kèm */
              <div className="flex flex-col items-center justify-center text-center my-auto">
                <span className="material-symbols-outlined text-[44px] text-slate-300 mb-2">
                  inbox
                </span>
                <p className="text-[12px] text-slate-500 font-normal">
                  Chưa có nội dung để xem
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL CHUYỂN XỬ LÝ ─────────────────── */}
      {isChuyenModalOpen && (
        <ChuyenTiepNhanModal
          isOpen={isChuyenModalOpen}
          onClose={() => setIsChuyenModalOpen(false)}
          onSubmit={handleChuyenTiepNhanSubmit}
          currentDepartmentId="tiep-dan"
          donInfo={{
            code: currentLuotNhan.id,
            loaiDon: currentLuotNhan.loaiDon || 'Đơn phản ánh kiến nghị',
            nguoiNop: currentLuotNhan.nguoiNop || 'Chưa rõ',
            ngayNhan: ngayNhanFormatted,
            donViHienTai: currentLuotNhan.donVi || 'Công an thành phố Hà Nội',
            noiDungTomTat: currentLuotNhan.noiDung,
          }}
        />
      )}

      {/* ─── MODAL CHỈNH SỬA THÔNG TIN ─────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-base">edit</span>
                <span>Chỉnh sửa thông tin lượt nhận {currentLuotNhan.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Người nộp đơn</label>
                <input
                  type="text"
                  value={editNguoiNop}
                  onChange={(e) => setEditNguoiNop(e.target.value)}
                  placeholder="Nhập họ và tên người nộp (hoặc để Chưa rõ)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn vị nhận</label>
                <input
                  type="text"
                  value={editDonVi}
                  onChange={(e) => setEditDonVi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hình thức tiếp nhận</label>
                <select
                  value={editHinhThuc}
                  onChange={(e) => setEditHinhThuc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="Trực tiếp">Trực tiếp</option>
                  <option value="Bưu chính">Bưu chính</option>
                  <option value="Trực tuyến">Trực tuyến</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung ghi chú</label>
                <textarea
                  rows={3}
                  value={editNoiDung}
                  onChange={(e) => setEditNoiDung(e.target.value)}
                  placeholder="Ghi chú tóm tắt nội dung đơn..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg bg-[#004ac6] hover:bg-[#003ea8] text-white font-semibold cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL QUÉT TÀI LIỆU (SIMULATOR) ─────────────────── */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-600 text-base">crop_free</span>
                <span>Quét tài liệu từ máy scan</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 mx-auto flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-3xl">document_scanner</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Máy quét sẵn sàng: <strong className="text-slate-900">Canon DR-M160II (USB)</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Đặt tài liệu vào khay nạp và nhấn nút Quét để số hóa tự động với độ phân giải 300 DPI.
              </p>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleScanDoc}
                className="px-4 py-1.5 rounded-lg bg-[#8b1515] hover:bg-[#731212] text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>Bắt đầu quét</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
