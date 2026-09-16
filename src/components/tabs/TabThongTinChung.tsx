import React, { useState, useEffect } from 'react';
import { LOAI_DON_OPTIONS } from '../../constants';

const IconRefresh = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const IconDoc = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconRobot = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconInbox = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconSparkles = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M17 8l-10 8"></path><path d="M7 8l10 8"></path></svg>;

const MOCK_DATA_BY_LOAI = {
  'khieu-nai': {
    loaiDonStr: 'Khiếu nại về bồi thường, hỗ trợ tái định cư thu hồi đất QL1A',
    loaiVuViec: 'Hành chính / Đất đai (Dân sự sơ thẩm)',
    quanHePhapLuat: 'Bồi thường thiệt hại và bố trí tái định cư giải phóng mặt bằng',
    noiDung: 'Đề nghị cơ quan có thẩm quyền xem xét nâng mức áp giá bồi thường đất ở từ 18.500.000đ/m2 lên 28.000.000đ/m2 theo bảng giá thị trường tại thời điểm thu hồi, đồng thời bố trí suất tái định cư tại chỗ do toàn bộ diện tích 162m2 nhà ở đã bị giải tỏa trắng.',
    hinhThuc: 'Trực tiếp tại Bộ phận Một cửa'
  },
  'to-cao': {
    loaiDonStr: 'Tố cáo hành vi vi phạm pháp luật',
    loaiVuViec: 'Hành chính / Cán bộ, công chức',
    quanHePhapLuat: 'Tố cáo hành vi nhũng nhiễu trong quản lý hành chính',
    noiDung: 'Công dân tố cáo cán bộ địa chính xã ABC có hành vi nhũng nhiễu, cố tình làm khó dễ và có dấu hiệu vòi vĩnh khi người dân đến làm thủ tục xin cấp Giấy chứng nhận quyền sử dụng đất.',
    hinhThuc: 'Gửi qua đường bưu điện'
  },
  'kien-nghi': {
    loaiDonStr: 'Kiến nghị, phản ánh về trật tự đô thị',
    loaiVuViec: 'Hành chính / Trật tự xây dựng',
    quanHePhapLuat: 'Kiến nghị xử lý vi phạm trật tự đô thị, xây dựng',
    noiDung: 'Người dân khu phố 4 phản ánh tình trạng một cơ sở kinh doanh vật liệu xây dựng lấn chiếm lòng lề đường, thường xuyên bốc dỡ hàng hóa gây tiếng ồn lớn vào ban đêm và cản trở giao thông.',
    hinhThuc: 'Cổng Dịch vụ công Quốc gia'
  },
  'tranh-chap': {
    loaiDonStr: 'Tranh chấp đất đai giữa các hộ liền kề',
    loaiVuViec: 'Dân sự / Tranh chấp quyền sử dụng đất',
    quanHePhapLuat: 'Tranh chấp ranh giới quyền sử dụng đất',
    noiDung: 'Yêu cầu giải quyết tranh chấp ranh giới đất ở với hộ ông Trần Văn B. Hộ ông B đã tự ý xây dựng tường rào lấn sang phần đất của gia đình tôi 0.5m dọc theo chiều dài 20m.',
    hinhThuc: 'Trực tiếp tại Bộ phận Một cửa'
  }
};

export default function TabThongTinChung() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [loaiDonId, setLoaiDonId] = useState('khieu-nai');
  const [formData, setFormData] = useState(MOCK_DATA_BY_LOAI['khieu-nai']);
  const [aiGeneratedMessage, setAiGeneratedMessage] = useState('');

  // Handle changing "Loại đơn"
  const handleLoaiDonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value as keyof typeof MOCK_DATA_BY_LOAI;
    setLoaiDonId(newVal);

    // Simulate AI processing
    setIsAiProcessing(true);
    setAiGeneratedMessage('');

    setTimeout(() => {
      setFormData(MOCK_DATA_BY_LOAI[newVal] || MOCK_DATA_BY_LOAI['khieu-nai']);
      setIsAiProcessing(false);
      setAiGeneratedMessage('Trợ lý AI đã tự động điền các thông tin theo quy trình nghiệp vụ mới. Vui lòng kiểm tra lại.');
    }, 1500);
  };

  const handleSave = () => {
    setIsEditing(false);
    setAiGeneratedMessage('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsAiProcessing(false);
    setAiGeneratedMessage('');
    // Optionally reset data, but keeping it simple
  };

  return (
    <>
      {/* Card 1: THÔNG TIN HỒ SƠ TIẾP NHẬN */}
      <div className={`bg-white rounded-xl border shadow-sm transition-all duration-300 ${isEditing ? 'ring-2 ring-red-500/20 border-red-200' : ''}`} style={{ borderColor: isEditing ? "#FECACA" : "#E2E8F0" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "#F1F5F9" }}>
          <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wide">
            <span className="text-red-600"><IconDoc /></span>
            THÔNG TIN HỒ SƠ TIẾP NHẬN
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md border transition-colors"
              style={{ borderColor: "#E2E8F0" }}
            >
              <IconEdit /> Chỉnh sửa
            </button>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              Đang chỉnh sửa
            </span>
          )}
        </div>

        {/* AI Loading Overlay */}
        {isAiProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-red-100">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 animate-bounce">
              <IconSparkles />
            </div>
            <h3 className="text-sm font-bold text-slate-800">AI đang xử lý...</h3>
            <p className="text-xs text-slate-500 mt-1">Trợ lý AI đang trích xuất lại hồ sơ và điền form theo quy trình mới.</p>
          </div>
        )}

        {/* Body */}
        <div className="p-6 relative">

          {aiGeneratedMessage && isEditing && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <div className="text-blue-600 mt-0.5"><IconRobot /></div>
              <div className="text-[13px] text-blue-800 font-medium">
                {aiGeneratedMessage}
              </div>
            </div>
          )}

          <div className="flex gap-16">
            {/* Cột Trái */}
            <div className="flex-1 space-y-5">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Phân loại đơn (Quyết định Quy trình)</div>
                {isEditing ? (
                  <select
                    value={loaiDonId}
                    onChange={handleLoaiDonChange}
                    className="w-full text-[13px] font-bold text-slate-800 bg-white border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-shadow"
                    style={{ borderColor: "#CBD5E1" }}
                  >
                    {LOAI_DON_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[13px] font-bold text-slate-800">{formData.loaiDonStr}</div>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Loại vụ việc</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.loaiVuViec}
                    onChange={e => setFormData({ ...formData, loaiVuViec: e.target.value })}
                    className="w-full text-[13px] text-slate-700 font-medium bg-slate-50 border rounded-lg px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    style={{ borderColor: "#E2E8F0" }}
                  />
                ) : (
                  <div className="text-[13px] text-slate-700 font-medium">{formData.loaiVuViec}</div>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Quan hệ pháp luật</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.quanHePhapLuat}
                    onChange={e => setFormData({ ...formData, quanHePhapLuat: e.target.value })}
                    className="w-full text-[13px] text-slate-700 font-medium bg-slate-50 border rounded-lg px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    style={{ borderColor: "#E2E8F0" }}
                  />
                ) : (
                  <div className="text-[13px] text-slate-700 font-medium">{formData.quanHePhapLuat}</div>
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Đơn vị tiếp nhận</div>
                <div className="text-[13px] text-slate-700 font-medium bg-slate-50/50 p-2 rounded border border-transparent">Công ty Cổ phần Công nghệ GOVEX - Chi nhánh phối hợp</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Ngày tiếp nhận</div>
                <div className="text-[13px] text-slate-700 font-medium bg-slate-50/50 p-2 rounded border border-transparent">15/09/2026 09:15:22</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-2 flex justify-between items-center">
                  <span>Nội dung đơn</span>
                  {isEditing && <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1"><IconSparkles /> AI tạo</span>}
                </div>
                {isEditing ? (
                  <textarea
                    value={formData.noiDung}
                    onChange={e => setFormData({ ...formData, noiDung: e.target.value })}
                    rows={4}
                    className="w-full text-[13px] text-slate-700 leading-relaxed bg-white border p-4 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                    style={{ borderColor: "#CBD5E1" }}
                  />
                ) : (
                  <div className="text-[13px] text-slate-700 leading-relaxed bg-slate-50 border p-4 rounded-lg" style={{ borderColor: "#E2E8F0" }}>
                    {formData.noiDung}
                  </div>
                )}
              </div>
            </div>

            {/* Cột Phải */}
            <div className="flex-1 space-y-5">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Trạng thái thụ lý</div>
                <div className="inline-flex items-center text-[12px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border" style={{ borderColor: "#FDE68A" }}>
                  Chưa cập nhật thụ lý chính thức
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Hình thức tiếp nhận</div>
                <div className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 p-2 bg-slate-50/50 rounded border border-transparent">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {formData.hinhThuc}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Tên việc / Mã số nhận</div>
                <div className="text-[13px] font-bold text-red-600 p-2 bg-slate-50/50 rounded border border-transparent">Đơn lượt nhận LN-45/2026-GOVEX</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Ngày làm đơn</div>
                <div className="text-[13px] text-slate-700 font-medium p-2 bg-slate-50/50 rounded border border-transparent">03/09/2026</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Thông tin người nộp đơn (Đương sự)</div>
                <div className="text-[13px] text-slate-600 bg-white leading-relaxed p-3 border rounded-lg" style={{ borderColor: "#E2E8F0" }}>
                  <div className="font-bold text-slate-800">Lê Văn Hùng (Sinh năm: 1968)</div>
                  <div>Số CCCD: <span className="font-medium text-slate-800">001089002891</span> - Điện thoại: <span className="font-medium text-slate-800">0903 847 291</span></div>
                  <div>Địa chỉ: Số 142/8 đường Nguyễn Văn Cừ, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-0.5">Cán bộ thụ lý đề xuất</div>
                <div className="text-[13px] text-slate-700 font-medium p-2 bg-slate-50/50 rounded border border-transparent">Nguyễn Minh Anh (Chuyên viên Phòng Tổng hợp & Kiểm tra Đơn thư)</div>
              </div>
            </div>

          </div>
        </div>

        {/* Actions Footer */}
        {isEditing && (
          <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl" style={{ borderColor: "#E2E8F0" }}>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-[13px] font-bold text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#BE123C" }}
            >
              Xác nhận cập nhật
            </button>
          </div>
        )}
      </div>
    </>
  );
}
