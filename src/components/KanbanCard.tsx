import React from 'react';
import { JOB_LABELS } from '../constants';
import { LuotNhan } from '../types';

export interface KanbanCardProps {
  card: LuotNhan;
  onOpen: () => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onPhanCong?: (card: LuotNhan) => void;
  assignedOfficerName?: string;
}

function KanbanCard({
  card,
  onOpen,
  selected = false,
  onToggleSelect,
  onPhanCong,
  assignedOfficerName,
}: KanbanCardProps) {
  const done = card.aiJob === 5;
  const running = card.aiJob > 0 && card.aiJob < 5;
  const pct = (card.aiJob / 5) * 100;

  return (
    <div
      className={`bg-white rounded-lg border p-3 cursor-pointer transition-all slide-in ${selected ? 'ring-2 ring-[#004ac6]/30 bg-blue-50/20' : ''
        }`}
      style={{ borderColor: selected ? '#004ac6' : '#E2E8F0' }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (!selected) el.style.borderColor = '#94A3B8';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = selected ? '#004ac6' : '#E2E8F0';
        el.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onToggleSelect(card.id)}
              title="Chọn để phân công nhiều hồ sơ cùng lúc"
              className="rounded border-slate-300 text-[#004ac6] focus:ring-[#004ac6] w-3.5 h-3.5 cursor-pointer"
            />
          )} */}
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: 9 }}
          >
            LƯỢT NHẬN
          </span>
        </div>
        {done && (
          <span className="text-xs font-medium" style={{ color: '#15803D' }}>
            ✓ Xong
          </span>
        )}
        {running && (
          <span className="text-xs font-medium ai-pulse" style={{ color: '#B45309' }}>
            {card.aiJob}/6
          </span>
        )}
      </div>

      <div className="mono text-xs font-semibold mb-1" style={{ color: '#C62828' }}>
        {card.id}
      </div>
      <div className="text-sm font-medium mb-0.5">{card.nguoiNop}</div>
      <div className="text-xs mb-2" style={{ color: '#94A3B8' }}>
        {card.ngayNhan}
      </div>

      {assignedOfficerName && (
        <div className="text-[11px] px-2 py-1 rounded mb-2 bg-blue-50 text-[#004ac6] font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">person</span>
          <span className="truncate">CB xử lý: {assignedOfficerName}</span>
        </div>
      )}

      {running && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-1.5 h-1.5 rounded-full ai-pulse flex-shrink-0"
              style={{ background: '#F59E0B' }}
            />
            <span className="text-xs truncate" style={{ color: '#B45309' }}>
              Đang {JOB_LABELS[card.aiJob].toLowerCase()}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#FEF3C7' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ background: '#F59E0B', width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      {done && (
        <div
          className="text-xs px-2 py-1 rounded mb-2"
          style={{ background: '#F0FDF4', color: '#15803D' }}
        >
          AI đã phân tích xong · 6/6 bước
        </div>
      )}
      {card.aiJob === 0 && (
        <div
          className="text-xs px-2 py-1 rounded mb-2"
          style={{ background: '#F8FAFC', color: '#94A3B8' }}
        >
          Chờ phân tích AI
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex-1 text-xs py-1.5 rounded border font-medium hover:bg-slate-50 cursor-pointer"
          style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          Xem chi tiết
        </button>
        {onPhanCong && (
          <button
            type="button"
            className="px-2.5 py-1.5 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#004ac6] text-xs font-bold flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onPhanCong(card);
            }}
            title="Phân công lượt nhận cho cán bộ"
          >
            <span className="material-symbols-outlined text-[13px]">assignment_ind</span>
            <span>Phân công</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default KanbanCard;
