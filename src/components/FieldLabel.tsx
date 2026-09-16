import React from 'react';
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium mb-1.5" style={{ color: "#374151" }}>{children}</div>;
}
export default FieldLabel;