import React, { useState } from 'react';
import { ALL_LUOT_NHAN } from "../constants";
import { LuotNhan, AIJob, Screen, DonDetail } from "../types";

interface NhanDonListProps {
  onNav: (s: Screen) => void;
  onSelect: (ln: LuotNhan) => void;
  onSelectDon?: (don: DonDetail) => void;
  luotNhanList?: LuotNhan[];
}

export default function NhanDonList({
  onNav,
  onSelect,
  onSelectDon,
  luotNhanList,
}: NhanDonListProps) {
  const [q, setQ] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const rawList = luotNhanList && luotNhanList.length > 0 ? luotNhanList : ALL_LUOT_NHAN;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const filtered = rawList.filter(
    (l) =>
      !q ||
      l.id.toLowerCase().includes(q.toLowerCase()) ||
      l.nguoiNop.toLowerCase().includes(q.toLowerCase()) ||
      l.noiDung.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-5 bg-[#f4f7fb]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-bounce text-xs font-medium">
          <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-[#004ac6] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">post_add</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[20px] font-bold text-slate-900 font-headline-md tracking-tight">
                  Tiếp nhận lượt nhận
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#004ac6] font-semibold text-[12px]">
                  {filtered.length} lượt nhận
                </span>
              </div>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                Quản lý và tiếp nhận các lượt nộp đơn thư, hồ sơ TTHC của công dân và tổ chức
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-[13.5px] border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              onClick={() => showToast('Đang xuất file Excel danh sách lượt nhận đơn thư...')}
            >
              <span className="material-symbols-outlined text-[17px] text-slate-500">file_download</span>
              <span>Xuất Excel</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004ac6] hover:bg-[#003ea8] active:scale-95 text-white font-semibold text-[13.5px] shadow-xs hover:shadow-md cursor-pointer transition-all"
              onClick={() => onNav('nhan-don-them')}
              title="Thêm lượt nhận đơn thư mới"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm lượt nhận</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-3.5 border-t border-slate-100 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
              search
            </span>
            <input
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              placeholder="Tìm theo mã lượt nhận, tên người nộp, CCCD..."
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {/* Filter: Time */}
          <div className="md:col-span-2">
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all">
              <option value="">Thời gian: Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng 09/2026</option>
            </select>
          </div>
          {/* Filter: Method */}
          <div className="md:col-span-2">
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all">
              <option value="">Hình thức: Tất cả</option>
              <option value="tructiep">Trực tiếp</option>
              <option value="tructuyen">Trực tuyến (DVC)</option>
              <option value="buudien">Bưu điện</option>
            </select>
          </div>
          {/* Filter: Status */}
          <div className="md:col-span-2">
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all">
              <option value="">Trạng thái: Tất cả</option>
              <option value="analyzing">AI đang phân tích</option>
              <option value="done">AI đã phân tích xong</option>
              <option value="new">Mới nhận</option>
            </select>
          </div>
          {/* Filter: Unit */}
          <div className="md:col-span-2">
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all">
              <option value="">Đơn vị: Tất cả</option>
              <option value="hc">Phòng HC - Tổng hợp</option>
              <option value="tt">Thanh tra tỉnh</option>
              <option value="sxd">Sở Xây dựng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[12px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã lượt nhận</th>
                <th className="py-3 px-4">Ngày nhận</th>
                <th className="py-3 px-4">Người nộp đơn</th>
                <th className="py-3 px-4">Hình thức</th>
                <th className="py-3 px-4 min-w-[240px]">Nội dung chính</th>
                <th className="py-3 px-4">Đơn vị tiếp nhận</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {filtered.map((ln) => {
                const isAnalyzing = ln.aiJob > 0 && ln.aiJob < 5;
                const isDone = ln.aiJob === 5;

                const handleItemClick = () => {
                  if (ln.status === 'da_chuyen') {
                    const dynamicCode = ln.id.startsWith('LN-') ? `Đ-${ln.id.replace('LN-', '')}` : ln.id;
                    const donObj: DonDetail = {
                      id: dynamicCode,
                      code: dynamicCode,
                      title: ln.noiDung || `Hồ sơ ${dynamicCode}`,
                      luotNhanId: ln.id,
                      nguoiNop: ln.nguoiNop,
                      ngayNhan: ln.ngayNhan,
                      loaiDon: ln.loaiDon || 'Đơn phản ánh kiến nghị',
                      type: 'ĐƠN TIẾP NHẬN',
                      statusBadge: 'Đang xác minh thông tin',
                    };
                    if (onSelectDon) onSelectDon(donObj);
                    onNav('don-tiep-nhan');
                    showToast(`Mở màn chi tiết đơn [${dynamicCode}] (Đã tiếp nhận)`);
                  } else {
                    onSelect(ln);
                    onNav('ban-phan-tich');
                  }
                };

                return (
                  <tr
                    key={ln.id}
                    className="hover:bg-blue-50/60 hover:shadow-sm cursor-pointer transition-all group"
                    onClick={handleItemClick}
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#004ac6] text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                        <span>{ln.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-[13px]">
                      {ln.ngayNhan}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-[13.5px]">{ln.nguoiNop}</div>
                      <div className="text-[12px] text-slate-400 font-normal mt-0.5">
                        {ln.id.includes('17') ? 'MST: 0108923412' : 'CCCD: 0123456789'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border ${ln.hinhThuc === 'Bưu điện'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : ln.hinhThuc === 'Trực tuyến'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {ln.hinhThuc === 'Bưu điện'
                            ? 'local_post_office'
                            : ln.hinhThuc === 'Trực tuyến'
                              ? 'language'
                              : 'person'}
                        </span>
                        <span>{ln.hinhThuc}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-normal text-slate-800 leading-relaxed line-clamp-2 text-[13.5px]" title={ln.noiDung}>
                        {ln.noiDung}
                      </p>
                      <span className="text-[12px] text-slate-400 block mt-1">
                        Lĩnh vực: Đất đai • Bồi thường
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-[13.5px]">
                      <span className="font-normal">{ln.donVi}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ln.status === 'da_chuyen' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-semibold">
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                          <span>Đã chuyển xử lý</span>
                        </span>
                      ) : ln.status === 'da_ban_giao' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[12px] font-semibold">
                          <span className="material-symbols-outlined text-[14px] text-amber-600">swap_horiz</span>
                          <span>Đã bàn giao</span>
                        </span>
                      ) : ln.status === 'da_tra_lai' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[12px] font-semibold">
                          <span className="material-symbols-outlined text-[14px] text-rose-600">assignment_return</span>
                          <span>Đã trả lại</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[12px] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          <span>Chờ chuyển</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[#004ac6] text-[#004ac6] hover:text-white font-medium text-[13px] transition-all cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick();
                        }}
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>{ln.status === 'da_chuyen' ? 'Xem đơn' : 'Xem chi tiết'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Footer */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[13px] text-slate-500">
          <div>
            Hiển thị <span className="font-semibold text-slate-800">1 - {filtered.length}</span> của{' '}
            <span className="font-semibold text-slate-800">{filtered.length}</span> lượt nhận
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[12.5px] font-medium"
              disabled
            >
              Trước
            </button>
            <button
              type="button"
              className="px-3.5 py-1 rounded-lg border border-blue-600 bg-[#004ac6] text-white text-[12.5px] font-semibold"
            >
              1
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-[12.5px] font-medium"
              disabled
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}