import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contract/index.js";

export default function CreateGroup({ onGroupCreated }) {
  const { address } = useAccount();
  const [members, setMembers] = useState([""]);
  const [deadline, setDeadline] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.01");
  const [mode, setMode] = useState(null); // null | "social" | "stake"
  const [step, setStep] = useState(1); // 1: setup, 2: vote mode

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addMember = () => setMembers([...members, ""]);
  const updateMember = (i, val) => {
    const updated = [...members];
    updated[i] = val;
    setMembers(updated);
  };
  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!mode || !deadline) return;

    const allMembers = [address, ...members.filter((m) => m.trim() !== "")];
    const deadlineTs = Math.floor(new Date(deadline).getTime() / 1000);
    const stakeWei = mode === "stake" ? parseEther(stakeAmount) : 0n;
    const modeEnum = mode === "social" ? 0 : 1;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createGroup",
      args: [allMembers, BigInt(deadlineTs), stakeWei, modeEnum],
    });
  };

  // After tx confirmed, extract groupId from event or just use groupCount-1
  // For hackathon simplicity, we'll store the groupId from local state
  if (isSuccess) {
    // groupId will be 0 for first group — in production parse from event logs
    onGroupCreated(0);
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Create a Group</h2>
      <p className="text-white/50 mb-8">Set up your accountability pact.</p>

      {step === 1 && (
        <div className="space-y-6">
          {/* Members */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Members (wallet addresses)
            </label>
            <p className="text-xs text-white/40 mb-3">You are automatically added as creator.</p>
            {members.map((m, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="0x..."
                  value={m}
                  onChange={(e) => updateMember(i, e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm mono focus:outline-none focus:border-purple-500"
                />
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(i)}
                    className="text-white/30 hover:text-red-400 transition-colors px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addMember}
              className="text-purple-400 text-sm hover:text-purple-300 transition-colors mt-1"
            >
              + Add member
            </button>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-white"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!deadline || members.every((m) => !m.trim())}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all"
          >
            Next: Choose Mode →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-white/60 mb-4">
              Vote on accountability mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode("social")}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  mode === "social"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className="text-2xl mb-2">📢</div>
                <div className="font-bold mb-1">Social Mode</div>
                <div className="text-white/50 text-sm">
                  Fail and the whole group gets a loud alarm. Free.
                </div>
              </button>

              <button
                onClick={() => setMode("stake")}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  mode === "stake"
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-bold mb-1">Stake Mode</div>
                <div className="text-white/50 text-sm">
                  Put ETH on the line. Winners split the pool.
                </div>
              </button>
            </div>
          </div>

          {mode === "stake" && (
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Stake amount per member (MON)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm mono focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
            >
              ← Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!mode || isPending || isConfirming}
              className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all"
            >
              {isPending || isConfirming ? "Creating..." : "Create Pact 🤝"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
