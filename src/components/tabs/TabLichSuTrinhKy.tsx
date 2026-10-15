// src/components/tabs/TabLichSuTrinhKy.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DonDetail } from '../../types';
import { SigningDocument, CurrentUserAccount } from '../../types/signing';
import { HoSoDocumentItem, LuotTrinhKy } from '../../types/quanLyTrinhKy';
import XemTaiLieuModal from '../../screens/quanLyTrinhKy/XemTaiLieuModal';
import ChiTietLuotTrinhDrawer from '../../screens/quanLyTrinhKy/ChiTietLuotTrinhDrawer';
import { LeaderDocumentDetail } from '../../screens/quanLyTrinhKy/TrinhKyFigmaApp';
import '../../screens/quanLyTrinhKy/trinhKyFigma.css';

interface TabLichSuTrinhKyProps {
  currentDon: DonDetail;
  signingDocuments?: SigningDocument[];
  currentAccount?: CurrentUserAccount;
  onOpenQuyTrinh?: () => void;
  onOpenTaiLieu?: () => void;
}

export interface VanBanTrinhKyItem {
  id: string;
  ngay: string;
  tenVanBan: string;
  soKyHieu?: string;
  loaiVanBan: string;
  dangTrinhToi: string;
  chucVuNguoiNhan?: string;
  tienDoDaQua: number;
  tienDoTong: number;
  trangThai: 'dang_trinh' | 'da_thu_hoi' | 'da_phe_duyet';
  trangThaiLabel: string;
  tepDinhKemCount?: number;
  noiDungTrichYeu?: string;
  nguoiTrinh?: string;
  rawDoc?: HoSoDocumentItem;
}

export default function TabLichSuTrinhKy({
  currentDon,
  signingDocuments = [],
  currentAccount,
  onOpenQuyTrinh,
  onOpenTaiLieu,
}: TabLichSuTrinhKyProps) {
  // Filter States matching the exact Figma screenshot
  const [startDate, setStartDate] = useState<string>('01/10/2026');
  const [endDate, setEndDate] = useState<string>('31/10/2026');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLeader, setFilterLeader] = useState<string>('all');
  const [filterDocType, setFilterDocType] = useState<string>('all');

  // Pagination & Display state
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [selectedDocToView, setSelectedDocToView] = useState<HoSoDocumentItem | null>(null);
  const [isXemDocOpen, setIsXemDocOpen] = useState(false);
  const [selectedLuotTrinh, setSelectedLuotTrinh] = useState<LuotTrinhKy | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingDetailItem, setViewingDetailItem] = useState<VanBanTrinhKyItem | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Base list initialized with the exact sample data from the user screenshot
  // plus dynamic documents from signingDocuments if present
  const [items, setItems] = useState<VanBanTrinhKyItem[]>(() => {
    const list: VanBanTrinhKyItem[] = [
      {
        id: 'VB-TK-01',
        ngay: '12/10/2026',
        tenVanBan: 'Phiếu thông báo chuyển thẩm quyền',
        soKyHieu: '01/TB-CTQ',
        loaiVanBan: 'Phiếu thông báo chuyển thẩm quyền',
        dangTrinhToi: 'Nguyễn Đức Thắng',
        chucVuNguoiNhan: 'Trưởng phòng Tiếp công dân',
        tienDoDaQua: 1,
        tienDoTong: 2,
        trangThai: 'dang_trinh',
        trangThaiLabel: 'Đang trình',
        tepDinhKemCount: 2,
        noiDungTrichYeu: 'Phiếu thông báo chuyển đơn tới cơ quan có thẩm quyền giải quyết theo quy định.',
        nguoiTrinh: 'Nguyễn Minh Anh',
      },
      {
        id: 'VB-TK-02',
        ngay: '09/10/2026',
        tenVanBan: 'Phiếu thông báo chuyển thẩm quyền',
        soKyHieu: '01/TB-CTQ-L1',
        loaiVanBan: 'Phiếu thông báo chuyển thẩm quyền',
        dangTrinhToi: 'Nguyễn Đức Thắng',
        chucVuNguoiNhan: 'Trưởng phòng Tiếp công dân',
        tienDoDaQua: 0,
        tienDoTong: 2,
        trangThai: 'da_thu_hoi',
        trangThaiLabel: 'Đã thu hồi',
        tepDinhKemCount: 1,
        noiDungTrichYeu: 'Đã thu hồi theo yêu cầu rà soát lại thông tin người nhận chuyển tiếp đơn.',
        nguoiTrinh: 'Nguyễn Minh Anh',
      },
    ];

    // Append any matching signing documents from props
    const matchingDocs = signingDocuments.filter(
      (d) => d.hoSoCode === currentDon.code || d.hoSoCode === currentDon.id
    );

    matchingDocs.forEach((doc, idx) => {
      const isApproved = doc.status === 'da_ky' || doc.status === 'hoan_tat';
      const isReturned = doc.status === 'tu_choi';
      const statusKey = isApproved ? 'da_phe_duyet' : isReturned ? 'da_thu_hoi' : 'dang_trinh';
      const statusLabel = isApproved ? 'Đã phê duyệt' : isReturned ? 'Đã thu hồi' : 'Đang trình';

      list.push({
        id: `VB-REAL-${idx + 1}-${doc.id}`,
        ngay: doc.ngayTao || '16/09/2026',
        tenVanBan: doc.tenVanBan,
        soKyHieu: doc.soKyHieu,
        loaiVanBan: doc.loaiVanBanLabel || 'Văn bản đề xuất',
        dangTrinhToi: doc.lanhDaoName || doc.signers?.[0]?.name || 'Nguyễn Đức Thắng',
        chucVuNguoiNhan: doc.lanhDaoChucVu || doc.signers?.[0]?.chucVu || 'Lãnh đạo phê duyệt',
        tienDoDaQua: isApproved ? (doc.signers?.length || 2) : 1,
        tienDoTong: doc.signers?.length || 2,
        trangThai: statusKey,
        trangThaiLabel: statusLabel,
        tepDinhKemCount: doc.tepDinhKem?.length || 1,
        noiDungTrichYeu: doc.trichYeu,
        nguoiTrinh: doc.nguoiLap || 'Nguyễn Minh Anh',
      });
    });

    return list;
  });

  // Filter logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Status filter
      if (filterStatus !== 'all' && item.trangThai !== filterStatus) {
        return false;
      }
      // Leader filter
      if (filterLeader !== 'all' && !item.dangTrinhToi.includes(filterLeader)) {
        return false;
      }
      // Doc type filter
      if (filterDocType !== 'all' && item.loaiVanBan !== filterDocType) {
        return false;
      }
      return true;
    });
  }, [items, filterStatus, filterLeader, filterDocType]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleResetFilters = () => {
    setFilterStatus('all');
    setFilterLeader('all');
    setFilterDocType('all');
    setStartDate('01/10/2026');
    setEndDate('31/10/2026');
    setCurrentPage(1);
    showToast('✓ Đã xóa tất cả bộ lọc');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('✓ Đã tải lại danh sách văn bản trình ký');
    }, 450);
  };

  const handleOpenDoc = (item: VanBanTrinhKyItem) => {
    setViewingDetailItem(item);
  };

  // Status Badge rendering matching Figma
  const renderStatusBadge = (status: VanBanTrinhKyItem['trangThai'], label: string) => {
    if (status === 'dang_trinh') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#f0f7ff] text-[#1967d2] border border-[#d2e3fc] whitespace-nowrap shadow-2xs">
          {label}
        </span>
      );
    }
    if (status === 'da_thu_hoi') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#fef2f2] text-[#c5221f] border border-[#fad2cf] whitespace-nowrap shadow-2xs">
          {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] whitespace-nowrap shadow-2xs">
        {label}
      </span>
    );
  };

  // Nếu người dùng nhấn xem chi tiết văn bản trình ký -> hiển thị màn dành riêng cho cán bộ
  if (viewingDetailItem) {
    const taskForDetail: any = {
      id: viewingDetailItem.id,
      type: viewingDetailItem.loaiVanBan,
      title: 'Dự thảo văn bản trả lời công dân Hoàng Văn',
      description: `${viewingDetailItem.dangTrinhToi} · ${viewingDetailItem.chucVuNguoiNhan || 'Lãnh đạo'}`,
      submitter: viewingDetailItem.nguoiTrinh || 'Nguyễn Minh Anh',
      date: '05/10/2026',
      files: 3,
      requirement: 'Duyệt',
    };

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col overflow-hidden trinh-ky-figma-scope"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#f8fafc',
          zIndex: 99999,
        }}
      >
        <LeaderDocumentDetail
          task={taskForDetail}
          readOnly={true}
          onBack={() => setViewingDetailItem(null)}
          onNotify={showToast}
          onEditFlow={() => {
            showToast('Đang mở chức năng chỉnh sửa lượt trình...');
          }}
        />
      </div>,
      document.body
    );
  }

  return (
    <div className="w-full text-slate-800 pb-10 select-none animate-fade-in text-[13.5px]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-[13px] font-medium animate-fade-in">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Filter & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        {/* Left Filters Group */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Date Range Box */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[13px] font-medium text-slate-700 shadow-2xs">
            <span>{startDate}</span>
            <span className="text-slate-400">→</span>
            <span>{endDate}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400 ml-0.5">
              calendar_today
            </span>
          </div>

          {/* Status Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-7 py-1.5 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="dang_trinh">Đang trình</option>
              <option value="da_thu_hoi">Đã thu hồi</option>
              <option value="da_phe_duyet">Đã phê duyệt</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-[16px] text-slate-400">
              expand_more
            </span>
          </div>

          {/* Leader Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={filterLeader}
              onChange={(e) => {
                setFilterLeader(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-7 py-1.5 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Lãnh đạo: Tất cả</option>
              <option value="Nguyễn Đức Thắng">Nguyễn Đức Thắng</option>
              <option value="Trần Trọng Giáp">Trần Trọng Giáp</option>
              <option value="Đặng Quốc Bảo">Đặng Quốc Bảo</option>
              <option value="Lê Hoàng D">Lê Hoàng D.</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-[16px] text-slate-400">
              expand_more
            </span>
          </div>

          {/* Document Type Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={filterDocType}
              onChange={(e) => {
                setFilterDocType(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-7 py-1.5 text-[13px] text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="all">Loại văn bản: Tất cả</option>
              <option value="Phiếu thông báo chuyển thẩm quyền">Phiếu thông báo chuyển thẩm quyền</option>
              <option value="Báo cáo xác minh">Báo cáo xác minh</option>
              <option value="Tờ trình đề xuất">Tờ trình đề xuất</option>
              <option value="Quyết định thụ lý">Quyết định thụ lý</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-[16px] text-slate-400">
              expand_more
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Xóa bộ lọc
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[13px] font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <span
              className={`material-symbols-outlined text-[15px] text-slate-500 ${isRefreshing ? 'animate-spin' : ''
                }`}
            >
              refresh
            </span>
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header with vertical divider borders */}
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold border-r border-slate-200/80 w-[140px]">
                  Ngày
                </th>
                <th className="py-3 px-4 font-bold border-r border-slate-200/80">
                  Văn bản
                </th>
                <th className="py-3 px-4 font-bold border-r border-slate-200/80 w-[220px]">
                  Đang trình tới
                </th>
                <th className="py-3 px-4 font-bold border-r border-slate-200/80 w-[190px]">
                  Tiến độ
                </th>
                <th className="py-3 px-4 font-bold border-r border-slate-200/80 w-[150px]">
                  Trạng thái
                </th>
                <th className="py-3 px-4 font-bold text-center w-[90px]">
                  Thao tác
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-[13px] font-medium">
                    Không có văn bản trình ký nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDoc(item)}
                      className="hover:bg-slate-50/70 transition-colors h-[54px] cursor-pointer"
                    >
                      {/* Cột 1: Ngày */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 text-[13px] whitespace-nowrap align-middle">
                        {item.ngay}
                      </td>

                      {/* Cột 2: Văn bản */}
                      <td className="py-3.5 px-4 text-slate-900 align-middle">
                        <div className="font-semibold text-[13.5px] text-slate-900 truncate max-w-[440px]" title={item.tenVanBan}>
                          {item.tenVanBan}
                        </div>
                        {item.soKyHieu && (
                          <span className="inline-block text-[11.5px] font-mono text-slate-400 mt-0.5">
                            {item.soKyHieu}
                          </span>
                        )}
                      </td>

                      {/* Cột 3: Đang trình tới */}
                      <td className="py-3.5 px-4 text-slate-800 text-[13px] whitespace-nowrap align-middle">
                        <div className="font-semibold text-slate-800">{item.dangTrinhToi}</div>
                        {item.chucVuNguoiNhan && (
                          <div className="text-[11.5px] text-slate-500 font-normal mt-0.5">{item.chucVuNguoiNhan}</div>
                        )}
                      </td>

                      {/* Cột 4: Tiến độ */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-col gap-1.5 w-[140px]">
                          <span className="text-slate-600 text-[12px] font-medium leading-none">
                            Đã qua {item.tienDoDaQua}/{item.tienDoTong}
                          </span>
                          <div className="flex items-center gap-1.5 w-full">
                            {Array.from({ length: item.tienDoTong }).map((_, segIdx) => {
                              const isCompleted = segIdx < item.tienDoDaQua;
                              return (
                                <div
                                  key={segIdx}
                                  className={`h-1.5 flex-1 rounded-sm ${isCompleted ? 'bg-[#15803d]' : 'bg-slate-200'
                                    }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Cột 5: Trạng thái */}
                      <td className="py-3.5 px-4 align-middle">
                        {renderStatusBadge(item.trangThai, item.trangThaiLabel)}
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleOpenDoc(item)}
                          title="Xem văn bản"
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs mx-auto"
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer matching Figma screenshot */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[13px] text-slate-500 bg-white">
          {/* Left summary text */}
          <div>
            Hiển thị <strong className="font-semibold text-slate-800">{displayedItems.length > 0 ? `1 - ${displayedItems.length}` : '0'}</strong> của{' '}
            <strong className="font-semibold text-slate-800">{totalItems}</strong> văn bản trình ký
          </div>

          {/* Right pagination controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Trang trước"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <div className="w-7 h-7 rounded-full border border-blue-600 bg-blue-50/60 text-[#004ac6] font-bold text-[12.5px] flex items-center justify-center shadow-2xs">
                {currentPage}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Trang sau"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Page Size Select */}
            <div className="relative inline-flex items-center">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[12.5px] text-slate-700 font-medium focus:outline-none cursor-pointer pr-6 shadow-2xs"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 pointer-events-none text-[16px] text-slate-400">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Xem Tài liệu Văn bản */}
      <XemTaiLieuModal
        isOpen={isXemDocOpen}
        onClose={() => {
          setIsXemDocOpen(false);
          setSelectedDocToView(null);
        }}
        document={selectedDocToView}
        maHoSoLienQuan={currentDon.code}
        tieuDeDon={currentDon.title}
      />

      {/* Drawer Xem Chi Tiết Lượt Trình (nếu cần mở rộng) */}
      <ChiTietLuotTrinhDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLuotTrinh(null);
        }}
        luotTrinh={selectedLuotTrinh}
        currentAccount={currentAccount}
        onUpdateLuotTrinh={(updated) => setSelectedLuotTrinh(updated)}
        onOpenQuyTrinh={onOpenQuyTrinh ? () => onOpenQuyTrinh() : undefined}
      />
    </div>
  );
}
