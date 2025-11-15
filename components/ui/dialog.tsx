import * as React from 'react';
import { createPortal } from 'react-dom';

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 w-full max-w-[500px] rounded-lg bg-white p-6 shadow-xl">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={() => onOpenChange(false)}
          aria-label="Chiudi"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
