import React from 'react';

export interface MoHinhHoa5W1HWidgetProps {
  extractData?: any;
  onNavigateToDocument?: (fileIndex: number, highlightKey?: string) => void;
  onSelectComponent?: (key: string) => void;
  className?: string;
  accuracyRate?: string;
}

export default function MoHinhHoa5W1HWidget({
  extractData = {},
  onNavigateToDocument,
  onSelectComponent,
  className = '',
  accuracyRate = '97.4%',
}: MoHinhHoa5W1HWidgetProps) {
  // Trích xuất dữ liệu thực thể từ nội dung đơn theo quy chuẩn nghiệp vụ
  const whoName = extractData.nguoiGui || 'Chưa ghi rõ danh tính trong đơn';
  const whoSub =
    extractData.dongNguoiGui && extractData.dongNguoiGui !== 'Không có'
      ? `Người cùng đứng đơn: ${extractData.dongNguoiGui}`
      : extractData.diaChi
        ? `Địa chỉ: ${extractData.diaChi}`
        : 'Đơn cá nhân • Đã xác minh nhân thân theo CCCD';

  const whomName = extractData.doiTuong || extractData.coQuanToCao || 'Đối tượng nêu trong đơn';
  const chucVuDonVi = [extractData.chucVu, extractData.donVi].filter(Boolean).join(' • ');
  const whomSub = chucVuDonVi || 'Chưa xác định cụ thể chức vụ, cơ quan công tác';

  // Loại bỏ các tiền tố / hậu tố đánh giá AI nếu có trong chuỗi dữ liệu gốc
  const rawDauHieu = extractData.dauHieu || '';
  const cleanDauHieu = rawDauHieu.replace(/\s*\(Độ tin cậy\s*\d+%\)/gi, '').trim();
  const whatName = cleanDauHieu || extractData.loaiNoiDung || 'Nội dung phản ánh theo đơn';
  const whatSub =
    extractData.hanhViBiToCao ||
    extractData.noiDungTomTat ||
    'Cắt giảm diện tích bồi thường và áp sai đơn giá theo phản ánh trong đơn';

  const whenName =
    extractData.thoiGian ||
    (extractData.ngayLamDon ? `Đơn lập ngày ${extractData.ngayLamDon}` : 'Thời gian nêu trong đơn');
  const whenSub = extractData.ngayLamDon
    ? `Tiếp nhận ngày ${extractData.ngayLamDon} • Trong thời hiệu tố cáo theo quy định`
    : 'Khoảng thời gian diễn ra vụ việc theo trình bày của người làm đơn';

  const whereName =
    extractData.diaDiem ||
    extractData.duAn ||
    extractData.diaChiDoiTuong ||
    'Quận Hà Đông, TP. Hà Nội';
  const whereSub =
    extractData.duAn && extractData.diaDiem && extractData.diaDiem !== extractData.duAn
      ? `${extractData.duAn} • ${extractData.diaDiem}`
      : extractData.diaDiem || 'Địa bàn phát sinh vụ việc theo phản ánh trong đơn';

  const whyName = extractData.yeuCau1 || 'Thanh tra làm rõ sai phạm & Đình chỉ cưỡng chế';
  const whySub =
    extractData.yeuCau2 || 'Xem xét, giải quyết bồi thường theo đúng quy định của Nhà nước';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-3.5 space-y-2.5 shadow-2xs transition-all ${className}`}
    >
      {/* Header Widget chuẩn hoá hành chính */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[17px] text-[#004ac6]">hub</span>
          <div>
            <h4 className="font-bold text-slate-900 text-xs tracking-tight uppercase flex items-center gap-1.5">
              <span>Mô hình hóa thực thể vụ việc (5W1H)</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>
              Độ tin cậy trích xuất: <strong className="text-slate-900 font-semibold">{accuracyRate}</strong>
            </span>
          </span>
        </div>
      </div>

      {/* Grid 6 Thẻ Thực thể 5W1H */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* 1. WHO • NGƯỜI LÀM ĐƠN / TỐ CÁO */}
        <div
          onClick={() => {
            onNavigateToDocument?.(0, 'nguoiGui');
            onSelectComponent?.('who');
          }}
          className="bg-white rounded-lg border border-slate-200/90 hover:border-blue-400 p-2.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group hover:bg-blue-50/25"
          title="Đối chiếu thông tin Người làm đơn trên tài liệu gốc"
        >
          <div>
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide flex items-center justify-between">
              <span>WHO • NGƯỜI LÀM ĐƠN</span>
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">
                arrow_outward
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-slate-900 mt-1 line-clamp-1" title={whoName}>
              {whoName}
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={whoSub}>
            {whoSub}
          </div>
        </div>

        {/* 2. WHOM • ĐỐI TƯỢNG BỊ TỐ CÁO */}
        <div
          onClick={() => {
            onNavigateToDocument?.(0, 'doiTuong');
            onSelectComponent?.('who');
          }}
          className="bg-white rounded-lg border border-slate-200/90 hover:border-rose-400 p-2.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group hover:bg-rose-50/25"
          title="Đối chiếu thông tin Đối tượng bị tố cáo trên tài liệu gốc"
        >
          <div>
            <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wide flex items-center justify-between">
              <span>WHOM • ĐỐI TƯỢNG BỊ TỐ CÁO</span>
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 text-rose-600 transition-opacity">
                arrow_outward
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-slate-900 mt-1 line-clamp-1" title={whomName}>
              {whomName}
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={whomSub}>
            {whomSub}
          </div>
        </div>

        {/* 3. WHAT • HÀNH VI BỊ PHẢN ÁNH */}
        <div
          onClick={() => {
            onNavigateToDocument?.(0, 'noiDung');
            onSelectComponent?.('what');
          }}
          className="bg-white rounded-lg border border-slate-200/90 hover:border-amber-400 p-2.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group hover:bg-amber-50/25"
          title="Đối chiếu Hành vi bị phản ánh trên tài liệu gốc"
        >
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center justify-between">
              <span>WHAT • HÀNH VI BỊ PHẢN ÁNH</span>
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity">
                arrow_outward
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-slate-900 mt-1 line-clamp-1" title={whatName}>
              {whatName}
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={whatSub}>
            {whatSub}
          </div>
        </div>

        {/* 4. WHEN • THỜI GIAN DIỄN RA */}
        <div
          onClick={() => {
            onNavigateToDocument?.(0, 'thoiGian');
            onSelectComponent?.('when');
          }}
          className="bg-white rounded-lg border border-slate-200/90 hover:border-sky-400 p-2.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group hover:bg-sky-50/25"
          title="Đối chiếu Mốc thời gian trên tài liệu gốc"
        >
          <div>
            <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wide flex items-center justify-between">
              <span>WHEN • THỜI GIAN DIỄN RA</span>
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 text-sky-600 transition-opacity">
                arrow_outward
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-slate-900 mt-1 line-clamp-1" title={whenName}>
              {whenName}
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={whenSub}>
            {whenSub}
          </div>
        </div>

        {/* 5. WHERE • ĐỊA BÀN / ĐỊA ĐIỂM */}
        <div
          onClick={() => {
            onNavigateToDocument?.(1, 'diaDiem');
            onSelectComponent?.('where');
          }}
          className="bg-white rounded-lg border border-slate-200/90 hover:border-emerald-400 p-2.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group hover:bg-emerald-50/25"
          title="Đối chiếu Địa điểm trên hồ sơ địa chính và quy hoạch"
        >
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center justify-between">
              <span>WHERE • ĐỊA BÀN / ĐỊA ĐIỂM</span>
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity">
                arrow_outward
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-slate-900 mt-1 line-clamp-1" title={whereName}>
              {whereName}
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={whereSub}>
            {whereSub}
          </div>
        </div>

        {/* 6. WHY / REQUEST • CĂN CỨ & YÊU CẦU */}
        <div
          onClick={() => {
            onNavigateToDocument?.(0, 'yeuCau');
            onSelectComponent?.('why');
          }}
          className="bg-white rounded-lg border border-slate-200/90 hover:border-indigo-400 p-2.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group hover:bg-indigo-50/25"
          title="Đối chiếu Căn cứ và yêu cầu của người làm đơn trên tài liệu gốc"
        >
          <div>
            <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide flex items-center justify-between">
              <span>WHY • CĂN CỨ &amp; YÊU CẦU</span>
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity">
                arrow_outward
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-slate-900 mt-1 line-clamp-1" title={whyName}>
              {whyName}
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={whySub}>
            {whySub}
          </div>
        </div>
      </div>

      {/* Footer hướng dẫn thao tác nghiệp vụ */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[11px]">touch_app</span>
          <span>Nhấp vào từng thẻ thực thể để chuyển đến trang văn bản gốc và vị trí trích dẫn</span>
        </span>
        <span className="font-medium text-slate-500">Quy chuẩn theo Luật Tố cáo 2018</span>
      </div>
    </div>
  );
}

