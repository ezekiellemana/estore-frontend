// src/components/IdleWarningModal.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useAuthStore from '../store/useAuthStore';

export default function IdleWarningModal({ isOpen, onStayLoggedIn, onForceLogout, warningDurationSec = 60 }) {
  const [sec, setSec] = useState(warningDurationSec);
  const skip = useAuthStore((s) => s.skipIdleWarning);
  const setSkip = useAuthStore((s) => s.setSkipIdleWarning);

  useEffect(() => {
    if (!isOpen) return;
    setSec(warningDurationSec);
    const iv = setInterval(() => {
      setSec((s) => (s <= 1 ? (clearInterval(iv), onForceLogout(), 0) : s - 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [isOpen, warningDurationSec, onForceLogout]);

  if (!isOpen || skip) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onStayLoggedIn()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
          <DialogDescription>You’ll be logged out in <strong>{sec}</strong> second{sec !== 1 && 's'}.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center mb-4">
          <input id="skip" type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} className="mr-2" />
          <label htmlFor="skip" className="text-sm">Don’t show again</label>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onForceLogout}>Logout Now</Button>
          <Button onClick={onStayLoggedIn}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
