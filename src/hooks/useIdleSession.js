// src/hooks/useIdleSession.js
import { useEffect, useRef } from 'react';

/**
 * @param {Object} params
 * @param {number} params.timeout       – total idle time before logout (ms)
 * @param {number} params.warningTime   – how long before timeout to warn (ms)
 * @param {Function} params.onWarning   – called when warningTime hits
 * @param {Function} params.onLogout    – called when total timeout hits
 */
export function useIdleSession({
  timeout = 10 * 60 * 1000,
  warningTime = 60 * 1000,
  onWarning = () => {},
  onLogout = () => {},
}) {
  const warningTimer = useRef(null);
  const logoutTimer = useRef(null);

  const resetTimers = () => {
    clearTimeout(warningTimer.current);
    clearTimeout(logoutTimer.current);

    // schedule the warning
    warningTimer.current = setTimeout(() => {
      onWarning();
    }, timeout - warningTime);

    // schedule the actual logout
    logoutTimer.current = setTimeout(() => {
      onLogout();
    }, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimers));

    resetTimers(); // kick things off

    return () => {
      clearTimeout(warningTimer.current);
      clearTimeout(logoutTimer.current);
      events.forEach((evt) => window.removeEventListener(evt, resetTimers));
    };
  }, [timeout, warningTime, onWarning, onLogout]);
}
