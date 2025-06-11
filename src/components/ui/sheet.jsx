import React from 'react';

/**
 * Stubbed Sheet components so imports resolve.
 * Swap these for your real UI library later.
 */

export function Sheet({ children }) {
  return <>{children}</>;
}

export function SheetTrigger({ children }) {
  return <>{children}</>;
}

export function SheetContent({ children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 p-4">
      {children}
    </div>
  );
}

export function SheetClose({ children }) {
  return <>{children}</>;
}
