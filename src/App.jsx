import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import CreateGroup from "./components/CreateGroup.jsx";
import GroupDashboard from "./components/GroupDashboard.jsx";
import WallOfShame from "./components/WallOfShame.jsx";
import AlarmOverlay from "./components/AlarmOverlay.jsx";

export default function App() {
  const { isConnected } = useAccount();
  const [page, setPage] = useState("home"); // home | create | dashboard | shame
  const [groupId, setGroupId] = useState(null);
  const [failedMembers, setFailedMembers] = useState([]);

  const handleGroupCreated = (id) => {
    setGroupId(id);
    setPage("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Alarm Overlay */}
      <AlarmOverlay
        failedMembers={failedMembers}
        onDismiss={() => setFailedMembers([])}
      />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => setPage("home")}
          className="text-xl font-bold tracking-widest text-white hover:text-purple-400 transition-colors"
        >
          MONADDICT
        </button>
        <div className="flex items-center gap-4">
          {groupId && (
            <button
              onClick={() => setPage("dashboard")}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              My Group
            </button>
          )}
          <button
            onClick={() => setPage("shame")}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Wall of Shame 🔥
          </button>
          <ConnectButton />
        </div>
      </nav>

      {/* Pages */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {page === "home" && (
          <HomePage
            isConnected={isConnected}
            onStart={() => setPage("create")}
            onViewShame={() => setPage("shame")}
          />
        )}
        {page === "create" && (
          <CreateGroup onGroupCreated={handleGroupCreated} />
        )}
        {page === "dashboard" && groupId !== null && (
          <GroupDashboard
            groupId={groupId}
            onFailed={(member) => setFailedMembers((p) => [...p, member])}
          />
        )}
        {page === "shame" && <WallOfShame />}
      </main>
    </div>
  );
}

function HomePage({ isConnected, onStart }) {
  return (
    <div className="text-center py-20">
      <p className="text-purple-400 mono text-sm tracking-widest mb-4">
        BUILT ON MONAD
      </p>
      <h1 className="text-6xl font-bold mb-4 leading-tight">
        Commit or<br />
        <span className="text-purple-400">Get Rekt.</span>
      </h1>
      <p className="text-white/50 text-lg mb-12 max-w-md mx-auto">
        Stake ETH with your crew. Complete your goals. Split the pool.
        Fail and face the Wall of Shame.
      </p>

      {isConnected ? (
        <button
          onClick={onStart}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all hover:scale-105"
        >
          Create a Group →
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-white/40 text-sm">Connect your wallet to start</p>
          <ConnectButton />
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mt-20 text-left">
        {[
          { icon: "🎯", title: "Set Goals", desc: "Create a group, add friends, set a deadline" },
          { icon: "💰", title: "Stake ETH", desc: "Everyone puts skin in the game" },
          { icon: "🏆", title: "Win or Shame", desc: "Complete it and split the pool. Fail and get rekt." },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="font-bold mb-1">{f.title}</div>
            <div className="text-white/50 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
