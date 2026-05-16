import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/index.js";

function useCountdown(deadline) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(deadline) - now;
      if (diff <= 0) {
        setTimeLeft("DEADLINE PASSED");
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return timeLeft;
}

export default function GroupDashboard({ groupId, onFailed }) {
  const { address } = useAccount();
  const [txHash, setTxHash] = useState(null);

  // Read group data
  const { data: members } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getMembers",
    args: [BigInt(groupId)],
  });

  const { data: groupData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "groups",
    args: [BigInt(groupId)],
  });

  const { data: hasCompleted, refetch: refetchCompleted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasCompleted",
    args: [BigInt(groupId), address],
  });

  const { data: hasDeposited, refetch: refetchDeposited } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasDeposited",
    args: [BigInt(groupId), address],
  });

  const deadline = groupData?.[1];
  const stakeAmount = groupData?.[2];
  const mode = groupData?.[3]; // 0 = social, 1 = stake
  const finalized = groupData?.[4];
  const timeLeft = useCountdown(deadline);
  const isPastDeadline = deadline && Math.floor(Date.now() / 1000) >= Number(deadline);

  const { writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  // Listen for GoalFailed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: "GoalFailed",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.groupId?.toString() === groupId.toString()) {
          onFailed(log.args.member);
        }
      });
    },
  });

  const handleMarkComplete = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "markComplete",
      args: [BigInt(groupId)],
    });
    setTimeout(() => refetchCompleted(), 3000);
  };

  const handleDeposit = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "deposit",
      args: [BigInt(groupId)],
      value: stakeAmount,
    });
    setTimeout(() => refetchDeposited(), 3000);
  };

  const handleFinalize = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "finalize",
      args: [BigInt(groupId)],
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-1">Group Dashboard</h2>
          <p className="text-white/50 mono text-sm">Group #{groupId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          mode === 1 ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"
        }`}>
          {mode === 1 ? "💰 Stake Mode" : "📢 Social Mode"}
        </div>
      </div>

      {/* Countdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 text-center">
        <p className="text-white/40 text-sm mb-1">Time Remaining</p>
        <p className={`text-4xl font-bold mono ${isPastDeadline ? "text-red-400" : "text-white"}`}>
          {timeLeft || "Loading..."}
        </p>
        {stakeAmount > 0n && (
          <p className="text-white/40 text-sm mt-2">
            Stake: {formatEther(stakeAmount)} MON per member
          </p>
        )}
      </div>

      {/* Members */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h3 className="font-bold mb-4">Members</h3>
        <MemberList groupId={groupId} members={members} />
      </div>

      {/* Actions */}
      {!finalized && (
        <div className="space-y-3">
          {mode === 1 && !hasDeposited && !isPastDeadline && (
            <button
              onClick={handleDeposit}
              disabled={isPending || isConfirming}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-30 text-white font-bold py-4 rounded-xl transition-all"
            >
              {isPending ? "Depositing..." : `Deposit ${stakeAmount ? formatEther(stakeAmount) : "?"} MON 💰`}
            </button>
          )}

          {!hasCompleted && !isPastDeadline && (
            <button
              onClick={handleMarkComplete}
              disabled={isPending || isConfirming}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-30 text-white font-bold py-4 rounded-xl transition-all"
            >
              {isPending ? "Marking..." : "✅ Mark Goal Complete"}
            </button>
          )}

          {hasCompleted && (
            <div className="w-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold py-4 rounded-xl text-center">
              ✅ You marked your goal complete
            </div>
          )}

          {isPastDeadline && (
            <button
              onClick={handleFinalize}
              disabled={isPending || isConfirming}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white font-bold py-4 rounded-xl transition-all"
            >
              {isPending ? "Finalizing..." : "⚡ Finalize Group"}
            </button>
          )}
        </div>
      )}

      {finalized && (
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
          <p className="text-purple-400 font-bold text-lg">Group Finalized ✓</p>
          <p className="text-white/50 text-sm mt-1">Funds have been distributed.</p>
        </div>
      )}
    </div>
  );
}

function MemberList({ groupId, members }) {
  if (!members) return <p className="text-white/30 text-sm">Loading members...</p>;

  return (
    <div className="space-y-2">
      {members.map((member, i) => (
        <MemberRow key={member} groupId={groupId} member={member} index={i} />
      ))}
    </div>
  );
}

function MemberRow({ groupId, member, index }) {
  const { data: completed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasCompleted",
    args: [BigInt(groupId), member],
  });

  const { data: deposited } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "hasDeposited",
    args: [BigInt(groupId), member],
  });

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-xs mono text-purple-400">
          {index + 1}
        </div>
        <span className="mono text-sm text-white/70">
          {member.slice(0, 6)}...{member.slice(-4)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {deposited && <span className="text-xs text-yellow-400">💰</span>}
        {completed ? (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Done ✓</span>
        ) : (
          <span className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">Pending</span>
        )}
      </div>
    </div>
  );
}
