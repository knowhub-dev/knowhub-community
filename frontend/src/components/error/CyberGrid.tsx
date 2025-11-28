export function CyberGrid({ className }: { className?: string }) {
  return <div className={`cyber-grid-overlay ${className ?? ""}`} aria-hidden />;
}
