import React from 'react';
function AIInsightSummary({ onOpen }: { onOpen: (d: DrawerState) => void }) {
  const items: { icon: string; label: string; color: string; drawer: DrawerState }[] = [
    { icon: "👤", label: "01 người gửi đã xác định", color: "#1E40AF", drawer: { type: "nguoi-gui" } },
    { icon: "📁", label: "02 lượt gửi trước", color: "#1E40AF", drawer: { type: "nguoi-gui" } },
    { icon: "🔗", label: "03 đơn liên quan", color: "#6D28D9", drawer: { type: "don-lien-quan" } },
    { icon: "⚖️", label: "01 vụ việc liên quan", color: "#6D28D9", drawer: { type: "vu-viec" } },
    { icon: "📊", label: "01 nội dung tương đồng 86%", color: "#B45309", drawer: { type: "so-sanh" } },
    { icon: "⚠️", label: "02 vấn đề cần kiểm tra", color: "#C62828", drawer: { type: "mau-thuan" } },
    { icon: "💡", label: "01 hướng xử lý được đề xuất", color: "#15803D", drawer: { type: "vu-viec" } },
  ];
  return (
    <div className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3 flex-wrap" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#15803D" }}>AI ĐÃ TÌM THẤY:</span>
      {items.map((it) => (
        <button key={it.label} onClick={() => onOpen(it.drawer)}
          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-70"
          style={{ background: "#fff", color: it.color, border: "1px solid #E2E8F0" }}>
          {it.icon} {it.label}
        </button>
      ))}
    </div>
  );
}
export default AIInsightSummary;