// src/hooks/useSessionTimer.js
import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessTokenExpiryMs } from "../utils/jwt";

export function useSessionTimer({ onExpire } = {}) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const timerRef = useRef(null);

  const tick = useCallback(() => {
    const expMs = getAccessTokenExpiryMs();
    if (!expMs) { setSecondsLeft(null); return; }
    const diff = Math.floor((expMs - Date.now()) / 1000);
    setSecondsLeft(diff >= 0 ? diff : 0);
    if (diff <= 0 && onExpire) onExpire();
  }, [onExpire]);

  useEffect(() => {
    // 1) 시작 즉시 1회
    tick();
    // 2) 1초 간격
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [tick]);

  // 탭 비활성→활성 시 즉시 갱신
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [tick]);

  const format = (s) => {
    if (s == null) return "--:--";
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  return { secondsLeft, label: format(secondsLeft) };
}
