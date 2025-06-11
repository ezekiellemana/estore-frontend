// src/components/ui/dialog.jsx
import React from 'react';

/**
 * Stubbed Dialog components so imports resolve.
 * Swap these for your real UI library later.
 */

export function Dialog({ children, open, onOpenChange }) {
  return <>{children}</>;
}

export function DialogContent({ children, className = '', ...props }) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-4 pb-2 border-b ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '', ...props }) {
  return (
    <h2 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h2>
  );
}

// ← Add this stub:
export function DialogDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function DialogFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-4 pt-2 border-t flex justify-end ${className}`} {...props}>
      {children}
    </div>
  );
}
