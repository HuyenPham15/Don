import React, { useState } from 'react';
function PdfPane({
  highlight,
  onClearHighlight,
  onHighlight,
}: {
  highlight: string | null;
  onClearHighlight: () => void;
  onHighlight?: (k: string) => void;
}) {
  const [zoom, setZoom] = useState(100);

  const hlMap: Record<string, { label: string; text: string; color: string; border: string }> = {
    "nguoi-gui": { label: "Người gửi", text: "Nguyễn Văn A", color: "#DBEAFE", border: "#93C5FD" },
    "doi-tuong": { label: "Đối tượng", text: "Công ty TNHH Xây dựng ABC", color: "#FEF3C7", border: "#FCD34D" },
    "co-quan": { label: "Cơ quan", text: "UBND tỉnh XYZ", color: "#E0E7FF", border: "#A5B4FC" },
    "du-an": { label: "Dự án", text: "Dự án Khu dân cư X", color: "#F3E8FF", border: "#D8B4FE" },
    "noi-dung": { label: "Nội dung", text: "bồi thường giải phóng mặt bằng", color: "#FEE2E2", border: "#FCA5A5" },
    "yeu-cau": { label: "Yêu cầu", text: "Quyết định 45/2024/QĐ-UBND", color: "#DCFCE7", border: "#86EFAC" },
  };

  const hl = highlight ? hlMap[highlight] : null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 border-r" style={{ borderColor: "#E2E8F0" }}>
      {/* Top document bar */}
      <div className="px-4 py-2.5 bg-white border-b flex items-center justify-between gap-3 flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FEE2E2", color: "#DC2626" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">TÀI LIỆU GỐC (HỒ SƠ ĐÍNH KÈM)</div>
            <div className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
              <span>Don_khieu_nai_NguyenVanA.pdf</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium text-slate-500 bg-slate-100">1.4 MB · Trang 1/1</span>
            </div>
          </div>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex items-center rounded-lg border bg-slate-50 p-0.5" style={{ borderColor: "#E2E8F0" }}>
            <button
              onClick={() => setZoom((z) => Math.max(80, z - 10))}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white text-xs font-bold"
              title="Thu nhỏ">
              −
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700 select-none">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white text-xs font-bold"
              title="Phóng to">
              +
            </button>
          </div>

          {hl && (
            <button
              onClick={onClearHighlight}
              className="text-xs px-2.5 py-1 rounded-lg border font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1"
              style={{ borderColor: "#E2E8F0" }}>
              <span>✕ Xóa HL</span>
            </button>
          )}
        </div>
      </div>

      {/* Highlights Quick Bar */}
      {/* <div className="px-4 py-2 bg-slate-50 border-b flex items-center gap-2 flex-wrap overflow-x-auto text-xs" style={{ borderColor: "#E2E8F0" }}>
        <span className="text-slate-500 font-medium flex-shrink-0">Điểm bóc tách:</span>
        {Object.entries(hlMap).map(([key, item]) => {
          const isActive = highlight === key;
          return (
            <button
              key={key}
              onClick={() => (isActive ? onClearHighlight() : onHighlight?.(key))}
              className={`px-2 py-0.5 rounded-md border text-xs font-medium transition-all flex items-center gap-1 ${isActive ? "shadow-xs font-bold ring-1 ring-offset-1" : "hover:opacity-90"
                }`}
              style={{
                background: item.color,
                borderColor: item.border,
                color: "#1E293B",
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.border }} />
              <span>{item.label}: <strong>{item.text}</strong></span>
            </button>
          );
        })}
      </div> */}

      {/* Scrollable PDF Document Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center bg-slate-200/70">
        <div
          className="bg-white rounded-lg shadow-lg border p-8 sm:p-10 w-full transition-all"
          style={{
            maxWidth: 720,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            borderColor: "#CBD5E1",
            fontFamily: "'Times New Roman', Times, serif",
            color: "#111827",
            lineHeight: 1.8,
            minHeight: 880,
          }}>
          {/* Quốc hiệu tiêu ngữ */}
          <div className="text-center mb-6">
            <div className="font-bold text-sm tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="font-semibold text-xs mt-0.5">Độc lập – Tự do – Hạnh phúc</div>
            <div className="text-xs mt-1 text-slate-500">---------o0o---------</div>
          </div>

          <div className="text-right text-xs italic mb-4 text-slate-600">
            TP. XYZ, ngày 10 tháng 09 năm 2026
          </div>

          <div className="text-center font-bold text-lg mb-6 tracking-wide text-slate-900">
            ĐƠN KHIẾU NẠI
            <div className="text-xs font-normal italic text-slate-600 mt-1">
              (V/v: Yêu cầu xem xét lại mức bồi thường giải phóng mặt bằng Dự án Khu dân cư X)
            </div>
          </div>

          <div className="mb-4 text-sm font-semibold text-slate-800">
            Kính gửi:{" "}
            <span
              className="px-1.5 py-0.5 rounded transition-colors"
              style={{
                background: hl?.text === "UBND tỉnh XYZ" ? hl.color : "transparent",
                border: hl?.text === "UBND tỉnh XYZ" ? `1px solid ${hl.border}` : "none",
              }}>
              Ủy ban nhân dân tỉnh XYZ
            </span>
          </div>

          <div className="space-y-3 text-sm text-justify">
            <p>
              Tên tôi là:{" "}
              <strong
                className="px-1.5 py-0.5 rounded transition-colors"
                style={{
                  background: hl?.text === "Nguyễn Văn A" ? hl.color : "transparent",
                  border: hl?.text === "Nguyễn Văn A" ? `1px solid ${hl.border}` : "none",
                }}>
                Nguyễn Văn A
              </strong>
              , sinh năm: 1978.
            </p>
            <p>
              Số CCCD: <strong className="font-mono">079075012345</strong> cấp ngày 12/04/2021 tại Cục CSQLHC về TTXH.
            </p>
            <p>
              Địa chỉ thường trú: Số 45 Đường Lê Lợi, Phường 3, Thành phố XYZ. Điện thoại: 0912.345.678.
            </p>

            <div className="my-2 border-t border-dashed" style={{ borderColor: "#E2E8F0" }} />

            <p>
              Tôi xin trình bày nội dung khiếu nại đối với:{" "}
              <strong
                className="px-1.5 py-0.5 rounded transition-colors"
                style={{
                  background: hl?.text === "Công ty TNHH Xây dựng ABC" ? hl.color : "transparent",
                  border: hl?.text === "Công ty TNHH Xây dựng ABC" ? `1px solid ${hl.border}` : "none",
                }}>
                Công ty TNHH Xây dựng ABC
              </strong>{" "}
              (Chủ đầu tư dự án) và Hội đồng bồi thường, hỗ trợ tái định cư:
            </p>

            <p>
              Gia đình tôi hiện đang sở hữu hợp pháp thửa đất số 45, tờ bản đồ số 12 tại địa bàn dự án. Vừa qua, trong quá trình thực hiện công tác{" "}
              <span
                className="font-semibold px-1.5 py-0.5 rounded transition-colors"
                style={{
                  background: hl?.text === "bồi thường giải phóng mặt bằng" ? hl.color : "transparent",
                  border: hl?.text === "bồi thường giải phóng mặt bằng" ? `1px solid ${hl.border}` : "none",
                }}>
                bồi thường giải phóng mặt bằng
              </span>{" "}
              tại{" "}
              <strong
                className="px-1.5 py-0.5 rounded transition-colors"
                style={{
                  background: hl?.text === "Dự án Khu dân cư X" ? hl.color : "transparent",
                  border: hl?.text === "Dự án Khu dân cư X" ? `1px solid ${hl.border}` : "none",
                }}>
                Dự án Khu dân cư X
              </strong>
              , phương án bồi thường áp giá đối với đất nông nghiệp và cây trồng trên đất chưa thỏa đáng, thấp hơn nhiều so với giá thị trường và chưa đảm bảo quyền lợi hợp pháp của công dân.
            </p>

            <p className="font-semibold text-slate-800">Tôi làm đơn này đề nghị Quý cơ quan:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Kiểm tra, rà soát lại toàn bộ hồ sơ bồi thường, hỗ trợ tái định cư của gia đình tôi.</li>
              <li>
                Xem xét, điều chỉnh lại đơn giá bồi thường theo đúng quy định tại{" "}
                <strong
                  className="px-1.5 py-0.5 rounded transition-colors"
                  style={{
                    background: hl?.text === "Quyết định 45/2024/QĐ-UBND" ? hl.color : "transparent",
                    border: hl?.text === "Quyết định 45/2024/QĐ-UBND" ? `1px solid ${hl.border}` : "none",
                  }}>
                  Quyết định 45/2024/QĐ-UBND
                </strong>{" "}
                của UBND tỉnh và Luật Đất đai hiện hành.
              </li>
              <li>Tổ chức đối thoại trực tiếp để làm rõ các vướng mắc của người dân trước khi ban hành quyết định thu hồi đất.</li>
            </ul>

            <p>Tôi cam đoan toàn bộ nội dung trình bày trên là đúng sự thật và hoàn toàn chịu trách nhiệm trước pháp luật.</p>
          </div>

          <div className="mt-8 flex justify-between items-start text-sm">
            <div className="italic text-xs text-slate-500">
              * Hồ sơ gửi kèm:
              <br />- Bản sao Giấy chứng nhận QSDĐ
              <br />- Biên bản kiểm đếm hiện trạng
              <br />- Bản sao CCCD
            </div>
            <div className="text-center pr-4">
              <div className="font-bold">Người làm đơn</div>
              <div className="text-xs italic text-slate-500 mb-8">(Ký và ghi rõ họ tên)</div>
              <div className="font-bold text-slate-900 text-base">Nguyễn Văn A</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PdfPane;