// src/components/IdleWarningModal.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useAuthStore from '../store/useAuthStore';

export default function IdleWarningModal({
  isOpen,
  onStayLoggedIn,
  onForceLogout,
  warningDurationSec = 60,
}) {
  const [secondsLeft, setSecondsLeft] = useState(warningDurationSec);
  const skipIdleWarning = useAuthStore((s) => s.skipIdleWarning);
  const setSkipIdleWarning = useAuthStore((s) => s.setSkipIdleWarning);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(warningDurationSec);
    const iv = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(iv);
          onForceLogout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isOpen, warningDurationSec, onForceLogout]);

  // don't render at all if user opted out
  if (!isOpen || skipIdleWarning) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onStayLoggedIn()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
        </DialogHeader>
        <p className="py-4">
          You’ll be logged out in <strong>{secondsLeft}</strong> second
          {secondsLeft !== 1 && 's'}. Stay logged in?
        </p>
        <div className="flex items-center mb-4">
          <input
            id="skip-warning"
            type="checkbox"
            checked={skipIdleWarning}
            onChange={(e) => setSkipIdleWarning(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="skip-warning" className="text-sm">
            Don’t show this warning again
          </label>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onForceLogout}>
            Logout Now
          </Button>
          <Button onClick={onStayLoggedIn}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
