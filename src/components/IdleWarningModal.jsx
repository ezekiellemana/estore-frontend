import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  // Only show for authenticated users
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const [secondsLeft, setSecondsLeft] = useState(warningDurationSec);
  const intervalRef = useRef(null);

  // pull skip flag from persistent auth store
  const skip = useAuthStore((s) => s.skipIdleWarning);
  const setSkip = useAuthStore((s) => s.setSkipIdleWarning);

  // If skip is enabled, don't render
  if (skip) return null;

  // reset countdown each time it opens
  useEffect(() => {
    if (!isOpen) return;

    setSecondsLeft(warningDurationSec);
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onForceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isOpen, warningDurationSec, onForceLogout]);

  // handler for “Stay Logged In”
  const handleStay = useCallback(() => {
    clearInterval(intervalRef.current);
    onStayLoggedIn();
  }, [onStayLoggedIn]);

  // compute progress bar width
  const progressPct = (secondsLeft / warningDurationSec) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleStay()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Heads up! You’re about to be logged out</DialogTitle>
          <DialogDescription className="mt-2">
            You’ll be logged out in{' '}
            <strong className="font-mono">{secondsLeft}s</strong>
          </DialogDescription>
        </DialogHeader>

        {/* visual countdown bar */}
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden my-4">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* “Don't show again” */}
        <div className="flex items-center mb-6">
          <input
            id="skip-warning"
            type="checkbox"
            checked={skip}
            onChange={(e) => setSkip(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="skip-warning" className="text-sm">
            Don’t show again
          </label>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onForceLogout}>
            Logout Now
          </Button>
          <Button onClick={handleStay}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
