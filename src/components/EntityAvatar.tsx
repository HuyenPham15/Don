import React from 'react';
function EntityAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
      style={{ background: color }}>{initials}</div>
  );
}
export default EntityAvatar;