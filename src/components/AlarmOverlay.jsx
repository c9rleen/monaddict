import { useEffect } from "react";

export default function AlarmOverlay({ failedMembers, onDismiss }) {
  useEffect(() => {
    if (failedMembers.length === 0) return;

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification("🚨 GOAL FAILED — MONADDICT", {
        body: `${failedMembers[failedMembers.length - 1].slice(0, 8)}... didn't make it. The group is not impressed.`,
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    // Auto dismiss after 6 seconds
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [failedMembers.length]);

  if (failedMembers.length === 0) return null;

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(180, 0, 0, 0.92)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "alarmFlash 0.4s infinite alternate",
        cursor: "pointer",
      }}
    >
      <style>{`
        @keyframes alarmFlash {
          from { background: rgba(180, 0, 0, 0.92); }
          to { background: rgba(255, 30, 30, 0.97); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>

      <div style={{ animation: "shake 0.5s infinite", textAlign: "center" }}>
        <div style={{ fontSize: 96, marginBottom: 16 }}>🚨</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: "white", margin: 0, letterSpacing: 4 }}>
          GOAL FAILED
        </h1>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          {failedMembers.map((m) => (
            <p key={m} style={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", fontSize: 18 }}>
              {m.slice(0, 8)}...{m.slice(-6)}
            </p>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 32, fontSize: 14 }}>
          Click anywhere to dismiss
        </p>
      </div>
    </div>
  );
}
