import { useWatchContractEvent } from "wagmi";
import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/index.js";

const SHAME_LABELS = [
  "Professional Excuse Maker",
  "Certified No-Show",
  "Motivation Missing",
  "Skipped Leg Day Again",
  "Serial Quitter",
  "Commitment Issues",
];

export default function WallOfShame() {
  const [shameList, setShameList] = useState([]);

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "GoalFailed",
    onLogs: (logs) => {
      logs.forEach((log) => {
        const member = log.args.member;
        const groupId = log.args.groupId?.toString();
        const label = SHAME_LABELS[Math.floor(Math.random() * SHAME_LABELS.length)];
        const timestamp = new Date().toLocaleString();

        setShameList((prev) => {
          if (prev.find((e) => e.member === member && e.groupId === groupId)) return prev;
          return [{ member, groupId, label, timestamp }, ...prev];
        });
      });
    },
  });

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2">Wall of Shame 🔥</h2>
        <p className="text-white/40">Those who made promises they couldn't keep.</p>
      </div>

      {shameList.length === 0 ? (
        <div className="text-center py-20 text-white/20">
          <div className="text-5xl mb-4">😇</div>
          <p>No failures yet. Impressive.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shameList.map((entry, i) => (
            <div
              key={i}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-center gap-4"
            >
              <div className="text-3xl">💀</div>
              <div className="flex-1">
                <p className="mono text-sm text-white/70">
                  {entry.member.slice(0, 8)}...{entry.member.slice(-6)}
                </p>
                <p className="text-red-400 font-bold">{entry.label}</p>
                <p className="text-white/30 text-xs mt-1">
                  Group #{entry.groupId} · {entry.timestamp}
                </p>
              </div>
              <div className="text-2xl">🚨</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
