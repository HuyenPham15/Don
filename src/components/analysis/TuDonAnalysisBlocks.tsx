import React from 'react';

interface TuDonAnalysisBlocksProps {
  checklistDieuKienThuLy: Record<string, boolean>;
  setChecklistDieuKienThuLy: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checklistXacMinhDonThu: Record<string, boolean>;
  setChecklistXacMinhDonThu: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  huongXuLyDonThu: 'thu_ly' | 'chuyen_don' | 'huong_dan' | 'luu_don';
  setHuongXuLyDonThu: (val: 'thu_ly' | 'chuyen_don' | 'huong_dan' | 'luu_don') => void;
  officerNoteDonThu: string;
  setOfficerNoteDonThu: (val: string) => void;
  showToast: (msg: string) => void;
  onOpenSubmitModal: () => void;
}

export const TuDonAnalysisBlocks: React.FC<TuDonAnalysisBlocksProps> = ({
  checklistDieuKienThuLy,
  setChecklistDieuKienThuLy,
  checklistXacMinhDonThu,
  setChecklistXacMinhDonThu,
  huongXuLyDonThu,
  setHuongXuLyDonThu,
  officerNoteDonThu,
  setOfficerNoteDonThu,
  showToast,
  onOpenSubmitModal,
}) => {
  return (
    <>
      {/* BANNER NGHIỆP VỤ: TIẾP NHẬN TỪ ĐƠN ĐÍNH KÈM TÀI LIỆU */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[19px]">description</span>
            </span>
            <div>
              <h4 className="text-[13.5px] font-bold text-blue-950 font-headline-md tracking-tight flex items-center gap-2">
                <span>Trường hợp 1: Tiếp nhận Từ Đơn (Công dân nhập thông tin & Tải tệp số hóa)</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Đơn đã có thông tin khai báo & đính kèm <strong>03 tệp tài liệu số hóa</strong> (Đơn scan, Trích lục địa chính 1/500, Biên bản TDP 4)
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">task_alt</span>
            <span>Đã bóc tách OCR đa tầng (v2.0)</span>
          </span>
        </div>
      </div>

      {/* THẨM ĐỊNH TÍNH HỢP LỆ & ĐIỀU KIỆN THỤ LÝ ĐƠN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#004ac6]">verified_user</span>
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                Thẩm định Tính hợp lệ &amp; Điều kiện Thụ lý Đơn thư
              </h3>
              <p className="text-[11px] text-slate-500">
                Căn cứ Luật Khiếu nại 2011, Luật Tố cáo 2018, Luật Đất đai &amp; Thông tư 05/2021/TT-TTCP
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span>ĐỦ ĐIỀU KIỆN TIẾP NHẬN (4/4 TIÊU CHÍ)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Tiêu chí 1 */}
          <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
            checklistDieuKienThuLy.coChuKy ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklistDieuKienThuLy.coChuKy}
              onChange={(e) => setChecklistDieuKienThuLy((p) => ({ ...p, coChuKy: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">1. Chữ ký &amp; Thông tin nhân thân</strong>
                <span className="text-[10px] font-bold text-emerald-700">Đạt</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Có chữ ký tươi của ông Đỗ Viết Thắng; đầy đủ CCCD 001065009182, địa chỉ rõ ràng tại số 14 ngõ 35 phố Nghĩa Đô.
              </p>
            </div>
          </label>

          {/* Tiêu chí 2 */}
          <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
            checklistDieuKienThuLy.dungThamQuyen ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklistDieuKienThuLy.dungThamQuyen}
              onChange={(e) => setChecklistDieuKienThuLy((p) => ({ ...p, dungThamQuyen: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">2. Thẩm quyền giải quyết ban đầu</strong>
                <span className="text-[10px] font-bold text-emerald-700">Đạt</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Tranh chấp ngõ đi chung cơ sở thuộc thẩm quyền tiếp nhận và chuyển UBND cấp xã/phường hòa giải (Điều 202 Luật Đất đai).
              </p>
            </div>
          </label>

          {/* Tiêu chí 3 */}
          <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
            checklistDieuKienThuLy.conThoiHieu ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklistDieuKienThuLy.conThoiHieu}
              onChange={(e) => setChecklistDieuKienThuLy((p) => ({ ...p, conThoiHieu: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">3. Thời hiệu &amp; Tình trạng thụ lý</strong>
                <span className="text-[10px] font-bold text-emerald-700">Đạt</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Hành vi lấn chiếm phát sinh tháng 08-09/2026; còn thời hiệu theo luật; chưa có bản án/quyết định có hiệu lực của Tòa án.
              </p>
            </div>
          </label>

          {/* Tiêu chí 4 */}
          <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
            checklistDieuKienThuLy.duTaiLieuChungCu ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <input
              type="checkbox"
              checked={checklistDieuKienThuLy.duTaiLieuChungCu}
              onChange={(e) => setChecklistDieuKienThuLy((p) => ({ ...p, duTaiLieuChungCu: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">4. Hồ sơ tài liệu chứng cứ kèm theo</strong>
                <span className="text-[10px] font-bold text-emerald-700">Đạt</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Kèm theo 03 tệp scan: Đơn gốc, Bản trích lục bản đồ địa chính tỷ lệ 1/500, Biên bản hòa giải TDP 4 ngày 05/09/2026.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* MỤC 5.1: TÓM TẮT NỘI DUNG ĐƠN & YÊU CẦU CỦA NGƯỜI LÀM ĐƠN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#004ac6]">summarize</span>
            <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
              5.1. Tóm tắt nội dung đơn &amp; Yêu cầu của người làm đơn (AI bóc tách từ hồ sơ số hóa)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              const summary = `TÓM TẮT ĐƠN PHẢN ÁNH TRANH CHẤP ĐẤT ĐAI NGÕ ĐI CHUNG:\n- Người đứng đơn: Ông Đỗ Viết Thắng (CCCD: 001065009182, Trú tại: Số 14 ngõ 35 phố Nghĩa Đô, Cầu Giấy, Hà Nội).\n- Đối tượng bị phản ánh: Hộ gia đình ông Bùi Thế Vinh (thửa đất số 43 liền kề).\n- Nội dung: Tự ý lấn chiếm 1.2m x 6m ngõ đi chung để xây tường gạch và bậc tam cấp kiên cố, thu hẹp ngõ từ 2.8m xuống còn 1.6m, cản trở lối đi sinh hoạt và xe cứu hỏa.\n- Yêu cầu của người làm đơn: 1. Đo đạc xác định chỉ giới ngõ; 2. Yêu cầu tháo dỡ công trình lấn chiếm; 3. Tổ chức hòa giải chính thức tại UBND phường Nghĩa Đô.`;
              navigator.clipboard?.writeText(summary);
              showToast('✓ Đã sao chép tóm tắt nội dung đơn và yêu cầu của người làm đơn!');
            }}
            className="text-xs text-[#004ac6] hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
            <span>Sao chép tóm tắt đơn</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 leading-relaxed space-y-3">
          <p className="font-medium text-[13px] text-slate-900 leading-relaxed">
            Ông <strong>Đỗ Viết Thắng</strong> (đại diện cho 08 hộ dân sinh sống tại ngõ 35 phố Nghĩa Đô) gửi đơn phản ánh việc hộ gia đình ông <strong>Bùi Thế Vinh</strong> (chủ sử dụng thửa đất số 43 liền kề) có hành vi tự ý lấn chiếm phần diện tích ngõ đi chung khoảng <strong>1.2m × 6m (khoảng 7.2 m²)</strong> để xây dựng tường gạch bao quanh và bậc tam cấp bê tông kiên cố, làm thu hẹp chiều rộng ngõ đi chung từ <strong>2.8m</strong> xuống chỉ còn <strong>1.6m</strong>. Vụ việc đã được Tổ dân phố số 4 tổ chức hòa giải cơ sở ngày 05/09/2026 nhưng không thành do hộ ông Vinh không chấp thuận tháo dỡ.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-100/90">
            <div className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px] shrink-0">calendar_month</span>
              <div>
                <span className="text-slate-500 font-medium">Thời điểm phát sinh: </span>
                <strong className="text-slate-800">Tháng 08/2026 – Nay</strong>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px] shrink-0">location_on</span>
              <div>
                <span className="text-slate-500 font-medium">Vị trí tranh chấp: </span>
                <strong className="text-slate-800">Ngõ 35 phố Nghĩa Đô, Cầu Giấy, Hà Nội (Thửa 42 &amp; 43, Tờ BĐ số 18)</strong>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px] shrink-0">person_alert</span>
              <div>
                <span className="text-slate-500 font-medium">Bên bị phản ánh: </span>
                <strong className="text-rose-700">Hộ ông Bùi Thế Vinh (Thửa đất số 43)</strong>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="material-symbols-outlined text-[#004ac6] text-[16px] shrink-0">warning</span>
              <div>
                <span className="text-slate-500 font-medium">Hậu quả thực tế: </span>
                <strong className="text-amber-800">Ngõ hẹp còn 1.6m, xe cứu hỏa không thể tiếp cận, cản trở 8 hộ dân</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3 YÊU CẦU CỤ THỂ CỦA NGƯỜI LÀM ĐƠN */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#004ac6]">checklist</span>
            <strong className="text-slate-900 text-xs">3 Yêu cầu cụ thể của người làm đơn (Trích xuất từ đơn):</strong>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/80">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#004ac6] flex items-center justify-center text-[10.5px] font-bold shrink-0">1</span>
              <p className="leading-relaxed">
                <strong>Đo đạc xác định chỉ giới ngõ đi chung: </strong>
                Đề nghị UBND phường và Cán bộ Địa chính tiến hành đo đạc thực địa đối chiếu với bản đồ địa chính tỷ lệ 1/500 năm 2004 để xác định tim đường và mốc giới quy hoạch ngõ 2.8m.
              </p>
            </div>
            <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/80">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#004ac6] flex items-center justify-center text-[10.5px] font-bold shrink-0">2</span>
              <p className="leading-relaxed">
                <strong>Buộc tháo dỡ công trình lấn chiếm: </strong>
                Yêu cầu hộ gia đình ông Bùi Thế Vinh tự nguyện tháo dỡ toàn bộ tường gạch bao chiếm 1.2m và bậc tam cấp bê tông; nếu không chấp hành đề nghị cơ quan chức năng lập biên bản xử phạt vi phạm hành chính và cưỡng chế trả lại hiện trạng ngõ đi chung.
              </p>
            </div>
            <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200/80">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#004ac6] flex items-center justify-center text-[10.5px] font-bold shrink-0">3</span>
              <p className="leading-relaxed">
                <strong>Tổ chức phiên hòa giải chính thức: </strong>
                Đề nghị UBND phường Nghĩa Đô thành lập Hội đồng hòa giải tranh chấp đất đai cấp xã/phường theo quy định tại Điều 202 Luật Đất đai để giải quyết dứt điểm mâu thuẫn giữa hai gia đình.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MỤC 5.2: MÔ HÌNH PHÂN TÍCH 3 TẦNG THÔNG TIN ĐƠN THƯ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#004ac6]">layers</span>
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                5.2. Mô hình Phân tích 3 Tầng Thông tin Đơn thư (Administrative Petition AI Model)
              </h3>
              <p className="text-[11px] text-slate-500">
                Phân định rõ: Tầng 1 (Dữ kiện Fact từ đơn &amp; hồ sơ) — Tầng 2 (Cần xác minh thực địa) — Tầng 3 (Nhận định &amp; Đề xuất AI theo Luật Đất đai)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ Dữ liệu bóc tách từ 03 tệp số hóa
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* TẦNG 1: DỮ KIỆN FACT */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                <span>TẦNG 1: DỮ KIỆN FACT (TRÍCH XUẤT TỪ ĐƠN &amp; TÀI LIỆU SCAN)</span>
              </span>
              <span className="text-[10.5px] font-semibold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                Độ tin cậy: Xác thực từ văn bản có chữ ký
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 block text-[10.5px]">Người đứng đơn / Đại diện:</span>
                <p className="font-semibold text-slate-900">Ông Đỗ Viết Thắng (SN: 1978)</p>
                <p className="text-[11px] text-slate-600">CCCD: <span className="font-mono">001065009182</span> | SĐT: <span className="font-mono">0913 229 118</span></p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 block text-[10.5px]">Chủ thể bị phản ánh:</span>
                <p className="font-semibold text-rose-800">Hộ gia đình ông Bùi Thế Vinh</p>
                <p className="text-[11px] text-slate-600">Chủ sử dụng thửa đất liền kề số 43, Tờ bản đồ 18</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 block text-[10.5px]">Vị trí &amp; Kích thước tranh chấp:</span>
                <p className="font-medium text-slate-800">Ngõ 35 phố Nghĩa Đô, P. Nghĩa Đô</p>
                <p className="text-[11px] text-slate-700">Ngõ quy hoạch rộng <strong>2.8m</strong>; phần lấn chiếm <strong>1.2m × 6m (7.2 m²)</strong></p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-1">
                <span className="text-slate-400 block text-[10.5px]">Chứng cứ đính kèm trong hồ sơ:</span>
                <p className="font-semibold text-slate-900">03 tệp số hóa hợp lệ</p>
                <p className="text-[11px] text-slate-600">1. Đơn scan; 2. Sơ đồ 1/500; 3. Biên bản TDP 4 (05/09/2026)</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10.5px] text-blue-900 font-medium pt-0.5">
              <span className="material-symbols-outlined text-[14px] text-blue-600">verified</span>
              <span>Dữ kiện bóc tách trực tiếp từ hồ sơ tài liệu do công dân nộp — Tuyệt đối không tự ý suy diễn.</span>
            </div>
          </div>

          {/* TẦNG 2: THÔNG TIN CHƯA XÁC MINH CẦN KIỂM TRA */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                <span>TẦNG 2: THÔNG TIN CHƯA XÁC MINH (CẦN KIỂM TRA THỰC ĐỊA &amp; CSDL)</span>
              </span>
              <span className="text-[10.5px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                Cán bộ Địa chính cần đối soát hồ sơ gốc
              </span>
            </div>

            <div className="space-y-2 text-slate-800">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                <strong className="text-amber-900 block text-[11px]">1. Kiểm tra hồ sơ cấp GCNQSDĐ (Sổ đỏ) của thửa đất số 43:</strong>
                <p className="text-slate-700 text-[11.5px]">
                  Cần tra cứu hồ sơ lưu trữ tại Chi nhánh Văn phòng Đăng ký đất đai quận Cầu Giấy để xác định ranh giới thửa 43 được cấp Giấy chứng nhận quyền sử dụng đất có trùm lên phần diện tích ngõ đi 1.2m hay không.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                <strong className="text-amber-900 block text-[11px]">2. Đo đạc mốc giới hiện trạng bằng thiết bị chuyên dụng:</strong>
                <p className="text-slate-700 text-[11.5px]">
                  Hiện tại mới có bản vẽ trích lục sơ đồ 1/500 do người dân cung cấp. Cán bộ Địa chính - Xây dựng phường Nghĩa Đô cần tổ chức kiểm tra thực địa, đo đạc hiện trạng và lập Biên bản kiểm tra hiện trạng có chữ ký của hai bên.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                <strong className="text-amber-900 block text-[11px]">3. Lấy ý kiến các hộ dân lân cận về lịch sử sử dụng ngõ:</strong>
                <p className="text-slate-700 text-[11.5px]">
                  Chưa có biên bản lấy ý kiến của 07 hộ dân còn lại trong ngõ 35 để xác định quá trình sử dụng lối đi chung qua các thời kỳ (đối chiếu bản đồ địa chính năm 1993 và 2004).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10.5px] text-amber-900 font-medium pt-0.5">
              <span className="material-symbols-outlined text-[14px] text-amber-600">notification_important</span>
              <span>Cần thẩm tra các nội dung trên trong quá trình chuẩn bị phiên hòa giải tại UBND phường Nghĩa Đô.</span>
            </div>
          </div>

          {/* TẦNG 3: NHẬN ĐỊNH & ĐỀ XUẤT AI */}
          <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                <span>TẦNG 3: NHẬN ĐỊNH &amp; ĐỀ XUẤT AI (THEO QUY ĐỊNH PHÁP LUẬT)</span>
              </span>
              <span className="text-[10.5px] font-semibold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200">
                Căn cứ Điều 202 Luật Đất đai &amp; Thông tư 05/2021/TT-TTCP
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-purple-200/80 space-y-2 text-slate-800">
              <div>
                <span className="text-purple-900 font-bold block text-[11px]">Căn cứ quy định pháp luật:</span>
                <p className="text-[11.5px] text-slate-700 mt-0.5">
                  Điều 202 Luật Đất đai (Hòa giải tranh chấp đất đai là thủ tục tiền tố tụng bắt buộc tại UBND cấp xã nơi có đất trước khi khởi kiện ra Tòa án); Điều 26, 28 Thông tư 05/2021/TT-TTCP quy định quy trình xử lý đơn khiếu nại, phản ánh, kiến nghị.
                </p>
              </div>

              <div className="pt-1 border-t border-purple-100">
                <span className="text-purple-900 font-bold block text-[11px]">Đề xuất hướng xử lý nghiệp vụ:</span>
                <p className="text-[11.5px] text-slate-700 mt-0.5">
                  Tiếp nhận đơn phản ánh và lập <strong>Phiếu chuyển đơn kèm toàn bộ 03 tài liệu số hóa</strong> đến UBND phường Nghĩa Đô để Chủ tịch UBND phường thành lập Hội đồng hòa giải tranh chấp đất đai và tiến hành hòa giải trong thời hạn không quá 45 ngày theo quy định.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MỤC 5.3: TRA CỨU ĐƠN TRÙNG & LỊCH SỬ GỬI ĐƠN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#004ac6]">travel_explore</span>
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
                5.3. Tra cứu Đơn trùng &amp; Lịch sử gửi đơn (CSDL Đơn thư GOVEX)
              </h3>
              <p className="text-[11px] text-slate-500">Đối chiếu trường thông tin xác thực: CCCD người nộp, Địa bàn thửa đất, Nội dung phản ánh</p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            Đủ điều kiện thụ lý mới (Không trùng lặp đang giải quyết)
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <strong className="text-blue-700 font-mono text-[13px]">ĐT-2026/08-019</strong>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Cùng địa bàn ngõ 35 Nghĩa Đô
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Nộp ngày 12/08/2026</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Đã chuyển UBND phường
              </span>
            </div>

            <p className="text-slate-700 text-[11.5px]">
              <strong>Người đứng đơn trước: </strong>Ông Lê Văn C (hộ số 16 cùng ngõ) phản ánh việc hộ ông Vinh xây dựng tường rào. Hồ sơ thời điểm đó chưa có Biên bản hòa giải cơ sở TDP 4.
            </p>

            <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-600">
              <strong>Đánh giá của AI: </strong>Đơn của ông Đỗ Viết Thắng hiện tại là vụ việc tiếp nối, có cung cấp tài liệu chứng cứ mới (Biên bản hòa giải TDP 4 ngày 05/09/2026 xác nhận hòa giải không thành). Vì vậy không thuộc trường hợp đơn trùng lặp bị trả lại; đủ căn cứ tiếp nhận tạo hồ sơ chuyển chính thức.
            </div>
          </div>
        </div>
      </div>

      {/* MỤC 5.4: CHECKLIST NHIỆM VỤ CỦA CÁN BỘ XỬ LÝ ĐƠN */}
      <div className="bg-white rounded-2xl border border-blue-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-[#004ac6]">assignment</span>
            <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
              5.4. Checklist nhiệm vụ của cán bộ tiếp nhận &amp; xử lý đơn
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Quy trình xử lý theo Thông tư 05/2021/TT-TTCP
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
            <input
              type="checkbox"
              checked={checklistXacMinhDonThu.xm1}
              onChange={(e) => setChecklistXacMinhDonThu((p) => ({ ...p, xm1: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-[#004ac6] rounded border-slate-300"
            />
            <div className="flex-1">
              <strong className="text-slate-800">1. Đối chiếu bản vẽ trích lục địa chính 1/500 với CSDL Đất đai:</strong>
              <p className="text-slate-500 text-[11px]">Kiểm tra ranh giới quy hoạch ngõ đi chung 2.8m trên bản đồ địa chính số hóa phường Nghĩa Đô.</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
            <input
              type="checkbox"
              checked={checklistXacMinhDonThu.xm2}
              onChange={(e) => setChecklistXacMinhDonThu((p) => ({ ...p, xm2: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-[#004ac6] rounded border-slate-300"
            />
            <div className="flex-1">
              <strong className="text-slate-800">2. Trao đổi với Cán bộ Địa chính - Xây dựng UBND phường Nghĩa Đô:</strong>
              <p className="text-slate-500 text-[11px]">Nắm tiến độ tiếp nhận cơ sở và tình hình mâu thuẫn ranh giới thực tế giữa hai hộ gia đình.</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
            <input
              type="checkbox"
              checked={checklistXacMinhDonThu.xm3}
              onChange={(e) => setChecklistXacMinhDonThu((p) => ({ ...p, xm3: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-[#004ac6] rounded border-slate-300"
            />
            <div className="flex-1">
              <strong className="text-slate-800">3. Lập Dự thảo Phiếu chuyển đơn kèm hồ sơ chứng cứ:</strong>
              <p className="text-slate-500 text-[11px]">Chuyển hồ sơ đến Chủ tịch UBND phường Nghĩa Đô để lập Hội đồng hòa giải tranh chấp đất đai.</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70">
            <input
              type="checkbox"
              checked={checklistXacMinhDonThu.xm4}
              onChange={(e) => setChecklistXacMinhDonThu((p) => ({ ...p, xm4: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-[#004ac6] rounded border-slate-300"
            />
            <div className="flex-1">
              <strong className="text-slate-800">4. Soạn Giấy biên nhận tiếp nhận hồ sơ đơn thư &amp; Phiếu hẹn công dân:</strong>
              <p className="text-slate-500 text-[11px]">Giao biên nhận cho ông Đỗ Viết Thắng kèm mã tra cứu tình trạng giải quyết trên cổng dịch vụ công.</p>
            </div>
          </label>
        </div>
      </div>

      {/* MỤC 5.5: ĐỀ XUẤT 4 HƯỚNG XỬ LÝ ĐƠN THƯ THEO THÔNG TƯ 05/2021/TT-TTCP */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-emerald-600">alt_route</span>
            <h3 className="text-[14px] font-bold text-slate-900 font-headline-md tracking-tight">
              5.5. Đề xuất bước xử lý tiếp theo (AI gợi ý theo Luật Đất đai &amp; Thông tư 05/2021/TT-TTCP)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Cán bộ lựa chọn quyết định</span>
        </div>

        {/* 4 HƯỚNG XỬ LÝ ĐƠN THƯ */}
        <div className="space-y-2.5 text-xs">
          {/* Hướng 1: Thụ lý tiếp nhận & Chuyển UBND phường hòa giải (Gợi ý ưu tiên) */}
          <div
            onClick={() => {
              setHuongXuLyDonThu('thu_ly');
              setOfficerNoteDonThu('Căn cứ Điều 202 Luật Đất đai: Đơn tranh chấp ngõ đi chung đủ điều kiện tiếp nhận. Đề xuất Tiếp nhận và chuyển UBND phường Nghĩa Đô lập Hội đồng hòa giải tranh chấp đất đai theo quy định.');
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
              huongXuLyDonThu === 'thu_ly'
                ? 'border-[#004ac6] bg-blue-50/40 shadow-xs ring-1 ring-blue-200'
                : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-[13px] text-slate-900">Hướng 1: Thụ lý tiếp nhận &amp; Chuyển UBND cấp xã/phường chủ trì hòa giải</strong>
                  <span className="text-[10.5px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-[#004ac6]">Gợi ý ưu tiên</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Căn cứ: </strong>Khoản 2 Điều 202 Luật Đất đai. Tranh chấp đất đai bắt buộc phải qua hòa giải tại UBND phường Nghĩa Đô trước khi khởi kiện tại Tòa án. Tiếp nhận đơn và lập Phiếu chuyển đơn kèm 03 tệp tài liệu số hóa cho UBND phường.
                </p>
              </div>
              <span className="material-symbols-outlined text-[#004ac6] text-xl shrink-0">
                {huongXuLyDonThu === 'thu_ly' ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
            </div>
          </div>

          {/* Hướng 2: Chuyển cơ quan có thẩm quyền chuyên môn */}
          <div
            onClick={() => {
              setHuongXuLyDonThu('chuyen_don');
              setOfficerNoteDonThu('Căn cứ Điều 28 Thông tư 05/2021/TT-TTCP: Vụ việc có dấu hiệu lấn chiếm đất công ngõ đi chung cần thanh tra hiện trạng. Đề xuất chuyển Phòng Tài nguyên & Môi trường quận Cầu Giấy kiểm tra xử lý vi phạm trật tự xây dựng.');
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
              huongXuLyDonThu === 'chuyen_don'
                ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-200'
                : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-[13px] text-slate-900">Hướng 2: Chuyển cơ quan có thẩm quyền chuyên môn (Phòng TN&amp;MT quận Cầu Giấy)</strong>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Căn cứ: </strong>Điều 28 Thông tư 05/2021/TT-TTCP. Chuyển cơ quan chuyên môn kiểm tra hành vi vi phạm trật tự xây dựng, lấn chiếm lối đi công cộng và ban hành quyết định xử phạt vi phạm hành chính.
                </p>
              </div>
              <span className="material-symbols-outlined text-indigo-600 text-xl shrink-0">
                {huongXuLyDonThu === 'chuyen_don' ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
            </div>
          </div>

          {/* Hướng 3: Hướng dẫn công dân */}
          <div
            onClick={() => {
              setHuongXuLyDonThu('huong_dan');
              setOfficerNoteDonThu('Căn cứ Khoản 1 Điều 203 Luật Đất đai: Trong trường hợp các bên đã có Giấy chứng nhận QSDĐ và hòa giải cơ sở không thành, hướng dẫn công dân nộp đơn khởi kiện vụ án dân sự tại Tòa án nhân dân quận Cầu Giấy.');
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
              huongXuLyDonThu === 'huong_dan'
                ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-200'
                : 'border-slate-200 hover:border-amber-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-[13px] text-slate-900">Hướng 3: Ban hành Phiếu hướng dẫn công dân khởi kiện tại TAND quận Cầu Giấy</strong>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Căn cứ: </strong>Điều 27 Thông tư 05/2021/TT-TTCP &amp; Khoản 1 Điều 203 Luật Đất đai. Nếu các bên đương sự đã có Giấy chứng nhận QSDĐ và đã có biên bản hòa giải không thành, cơ quan hành chính ban hành văn bản hướng dẫn đương sự gửi đơn khởi kiện đến TAND có thẩm quyền.
                </p>
              </div>
              <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">
                {huongXuLyDonThu === 'huong_dan' ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
            </div>
          </div>

          {/* Hướng 4: Lưu đơn theo dõi */}
          <div
            onClick={() => {
              setHuongXuLyDonThu('luu_don');
              setOfficerNoteDonThu('Đơn không đủ điều kiện xử lý hoặc đã được thụ lý giải quyết dứt điểm. Đề xuất lưu đơn theo dõi theo quy định tại Điều 29 Thông tư 05/2021/TT-TTCP.');
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
              huongXuLyDonThu === 'luu_don'
                ? 'border-slate-600 bg-slate-100/60 shadow-xs ring-1 ring-slate-300'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-[13px] text-slate-900">Hướng 4: Lưu đơn theo dõi (Không thụ lý)</strong>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Căn cứ: </strong>Điều 29 Thông tư 05/2021/TT-TTCP. Áp dụng khi đơn không đủ điều kiện xử lý, đơn nặc danh hoặc đã có văn bản giải quyết có hiệu lực pháp luật.
                </p>
              </div>
              <span className="material-symbols-outlined text-slate-600 text-xl shrink-0">
                {huongXuLyDonThu === 'luu_don' ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
            </div>
          </div>
        </div>

        {/* Ý KIẾN CÁN BỘ & NÚT HÀNH ĐỘNG */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1">
              Ý kiến đề xuất của cán bộ thụ lý đơn:
            </label>
            <textarea
              rows={2}
              value={officerNoteDonThu}
              onChange={(e) => setOfficerNoteDonThu(e.target.value)}
              placeholder="Nhập ý kiến chuyên môn của cán bộ tiếp nhận đơn..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => showToast('Đã lưu nháp ý kiến cán bộ.')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Lưu nháp
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  showToast('✓ Đã xuất Phiếu chuyển đơn & Giấy biên nhận tiếp nhận hồ sơ thành công!');
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>In Phiếu chuyển đơn / Hướng dẫn</span>
              </button>

              <button
                type="button"
                onClick={onOpenSubmitModal}
                className="px-4.5 py-2.5 rounded-xl bg-[#004ac6] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Tiếp nhận tạo Đơn mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default TuDonAnalysisBlocks;
