import React from 'react';
export function IcoFilePdf() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#1E40AF" strokeWidth="1.5">
      <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M12 2v4h4" />
    </svg>
  );
}

export function IcoArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function SparkleIcon({ color = "#1D4ED8", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M8 0l1.6 4.2L14 6l-4.4 1.8L8 12 6.4 7.8 2 6l4.4-1.8L8 0z" />
      <path d="M13 10l.7 1.8L15.5 12.5l-1.8.7L13 15l-.7-1.8L10.5 12.5l1.8-.7L13 10z" opacity="0.7" />
    </svg>
  );
}

export function IcoBriefcase() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="10" height="8" rx="1.5" /><path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" /><line x1="3" y1="10" x2="13" y2="10" /></svg>; }

export function IcoInbox() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9h3l1.5 2h3L11 9h3" /><rect x="2" y="3" width="12" height="11" rx="1.5" /></svg>; }

export function IcoBook() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h7a2 2 0 012 2v9a2 2 0 01-2 2H3" /><path d="M3 2a2 2 0 00-2 2v9a2 2 0 002 2" /></svg>; }

export function IcoChart() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="9" width="3" height="5" rx="0.5" /><rect x="6.5" y="5" width="3" height="9" rx="0.5" /><rect x="11" y="2" width="3" height="12" rx="0.5" /></svg>; }

export function IcoSearch() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>; }

export function IcoUpload() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13V7M7 10l3-3 3 3" /><path d="M4 15a3 3 0 01-.5-5.95A5 5 0 0114 7.5a3.5 3.5 0 011.5 6.7" /></svg>; }

export function IcoFile() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h5l3 3v9H4V2z" /><path d="M9 2v3h3" /></svg>; }

export function IcoScan() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5V3a1 1 0 011-1h2M11 2h2a1 1 0 011 1v2M14 11v2a1 1 0 01-1 1h-2M5 14H3a1 1 0 01-1-1v-2" /><line x1="2" y1="8" x2="14" y2="8" /></svg>; }

export function IcoSend() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8l12-5-5 12-2-4-5-3z" /></svg>; }

export function IcoInfo() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 7v4M8 5.5v.5" /></svg>; }

