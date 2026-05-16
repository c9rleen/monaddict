// ─── BetsPage.jsx ─────────────────────────────────────────────────────────────
// Accountability bets: propose, accept, settle.
// Wire createBet / acceptBet / settleBet to contract calls when ready.

import { useState } from "react";
import { ensName, Modal } from "../Constants.jsx";

// ─── Create Bet Modal ─────────────────────────────────────────────────────────
function CreateBetModal({ onClose, onCreate, state, preGoalId }) {
  const [against,   setAgainst]   = useState(state.friends[0]?.address || "");
  const [amount,    setAmount]    = useState("");
  const [condition, setCondition] = useState("");
  const [goalId,    setGoalId]    = useState(preGoalId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = against && Number(amount) > 0 && condition.trim() && !isSubmitting;

  async function submit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const created = await onCreate({
      groupId:
        state.goals.find((g) => g.id === goalId)?.groupId ||
        state.groups[0]?.id,
      goalId,
      creator: state.account,
      against,
      amount,
      token: "MON",
      condition: condition.trim(),
      creatorWins: "goal achieved",
      againstWins: "goal missed",
    });
    setIsSubmitting(false);
    if (created) onClose();
  }

  return (
    <Modal
      title="New Bet"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-rose" disabled={!canSubmit} onClick={submit}>
            {isSubmitting ? "Confirming..." : "Propose Bet"}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </>
      }
    >
      {/* Challenge */}
      <div className="field">
        <label className="label">Challenge</label>
        <select
          className="select"
          value={against}
          onChange={(e) => setAgainst(e.target.value)}
        >
          {state.friends.length === 0 && (
            <option value="">Add friends first</option>
          )}
          {state.friends.map((f) => (
            <option key={f.address} value={f.address}>
              {f.ens}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="field">
        <label className="label">Stake Amount (MON)</label>
        <input
          className="input"
          type="number"
          placeholder="0.5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* Condition */}
      <div className="field">
        <label className="label">Condition</label>
        <textarea
          className="textarea"
          placeholder="e.g. 'Deploy contract by end of month'"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
      </div>

      {/* Link to goal */}
      {state.goals.length > 0 && (
        <div className="field">
          <label className="label">Link to Goal (optional)</label>
          <select
            className="select"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
          >
            <option value="">— None —</option>
            {state.goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Warning */}
      <div
        style={{
          background: "var(--cream)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          padding: "12px 14px",
          fontSize: 13,
          color: "var(--muted)",
          fontStyle: "italic",
        }}
      >
        Stakes are locked on-chain the moment both parties accept. Winner takes all.
      </div>
    </Modal>
  );
}

// ─── Bet Card ─────────────────────────────────────────────────────────────────
function BetCard({ bet, account, friends, onAccept, onSettle, pendingAction }) {
  const isMine       = bet.creator === account;
  const counterparty = isMine
    ? ensName(bet.against, friends)
    : ensName(bet.creator, friends);

  const accentColor =
    bet.status === "settled"        ? "sage"  :
    bet.status === "active"         ? "amber" :
    "muted";

  const tagClass =
    bet.status === "settled"        ? "tag-sage"  :
    bet.status === "active"         ? "tag-amber" :
    "tag-muted";

  return (
    <div className="card">
      <div className={`card-accent ${accentColor}`} />
      <div style={{ paddingLeft: 8 }}>
        <div className="card-row" style={{ alignItems: "flex-start" }}>
          {/* Left: amount + condition */}
          <div className="card-body">
            <div className="bet-amount">
              {bet.amount} {bet.token}
            </div>
            <div className="bet-vs">vs {counterparty}</div>
            <div className="bet-condition">{bet.condition}</div>
            {bet.winner && (
              <div style={{ marginTop: 8 }}>
                <span className="tag tag-sage">
                  Winner: {ensName(bet.winner, friends)}
                </span>
              </div>
            )}
            <TxHash label="Proposed" hash={bet.txHash} />
            <TxHash label="Accepted" hash={bet.acceptTxHash} />
            <TxHash label="Settled" hash={bet.settleTxHash} />
          </div>

          {/* Right: status + actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <span className={`tag ${tagClass}`}>{bet.status}</span>

            {/* Counterparty can accept pending bets */}
            {bet.status === "pending_accept" && !isMine && (
              <button
                className="btn btn-amber btn-sm"
                onClick={() => onAccept(bet.id)}
                disabled={!!pendingAction}
              >
                {pendingAction === `accept:${bet.id}` ? "Confirming..." : "Accept Bet"}
              </button>
            )}

            {/* Active bet — settle as winner or concede */}
            {bet.status === "active" && isMine && (
              <button
                className="btn btn-sage btn-sm"
                onClick={() => onSettle(bet.id, account)}
                disabled={!!pendingAction}
              >
                {pendingAction === `settle:${bet.id}` ? "Confirming..." : "I Won"}
              </button>
            )}
            {bet.status === "active" && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  onSettle(
                    bet.id,
                    isMine ? bet.against : bet.creator
                  )
                }
                disabled={!!pendingAction}
              >
                {pendingAction === `settle:${bet.id}` ? "Confirming..." : "They Won"}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          Created {new Date(bet.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function TxHash({ label, hash }) {
  if (!hash) return null;

  return (
    <div className="bet-tx">
      {label}: {hash.slice(0, 10)}...{hash.slice(-6)}
    </div>
  );
}

// ─── Bets Page ────────────────────────────────────────────────────────────────
export default function BetsPage({
  state,
  acceptBet,
  settleBet,
  createBet,
  preGoalId,   // optional: pre-link a goal when opened from GoalsPage
}) {
  const [filter,    setFilter]    = useState("active");
  const [showModal, setShowModal] = useState(!!preGoalId);
  const [pendingAction, setPendingAction] = useState("");

  const FILTERS = [
    ["active",         "Active"],
    ["pending_accept", "Pending"],
    ["settled",        "Settled"],
    ["all",            "All"],
  ];

  const displayed =
    filter === "all"
      ? state.bets
      : state.bets.filter((b) => b.status === filter);

  const incomingPending = state.bets.filter(
    (b) => b.status === "pending_accept" && b.against === state.account
  );

  const transactions = [...(state.transactions || [])].sort(
    (a, b) => b.createdAt - a.createdAt
  );
  const gained = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const lost = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const net = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const totalStaked = state.bets
    .filter((b) => b.status !== "settled")
    .reduce((s, b) => s + money(b.amount), 0)
    .toFixed(2);

  return (
    <div className="page">
      <div className="page-eyebrow">Accountability</div>
      <div className="page-title">Bets</div>
      <div className="page-sub">Put MON on the line. Keep each other honest.</div>

      {/* ── Stats ── */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num amber">
            {state.bets.filter((b) => b.status === "active").length}
          </div>
          <div className="stat-lbl">Active</div>
        </div>
        <div className="stat-box">
          <div className="stat-num rose">
            {state.bets.filter((b) => b.status === "pending_accept").length}
          </div>
          <div className="stat-lbl">Pending</div>
        </div>
        <div className="stat-box">
          <div className={`stat-num ${net < 0 ? "rose" : "sage"}`}>
            {net.toFixed(2)}
          </div>
          <div className="stat-lbl">Net P/L</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{totalStaked}</div>
          <div className="stat-lbl">MON at stake</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num sage">{gained.toFixed(2)}</div>
          <div className="stat-lbl">Gained MON</div>
        </div>
        <div className="stat-box">
          <div className="stat-num rose">{lost.toFixed(2)}</div>
          <div className="stat-lbl">Lost / Locked MON</div>
        </div>
        <div className="stat-box">
          <div className="stat-num sage">
            {state.bets.filter((b) => b.status === "settled").length}
          </div>
          <div className="stat-lbl">Settled</div>
        </div>
      </div>

      {incomingPending.length > 0 && (
        <>
          <div className="section-head">
            <div className="section-label">Pending for you</div>
            <span className="section-count">{incomingPending.length} waiting</span>
          </div>
          <div className="card-list" style={{ marginBottom: 24 }}>
            {incomingPending.map((b) => (
              <BetCard
                key={b.id}
                bet={b}
                account={state.account}
                friends={state.friends}
                pendingAction={pendingAction}
                onAccept={async (betId) => {
                  setPendingAction(`accept:${betId}`);
                  await acceptBet(betId);
                  setPendingAction("");
                }}
                onSettle={async (betId, winner) => {
                  setPendingAction(`settle:${betId}`);
                  await settleBet(betId, winner);
                  setPendingAction("");
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Filter tabs + CTA ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {FILTERS.map(([v, l]) => (
          <button
            key={v}
            className={`btn btn-sm ${filter === v ? "btn-ink" : "btn-ghost"}`}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
        <button
          className="btn btn-rose btn-sm"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowModal(true)}
        >
          + New Bet
        </button>
      </div>

      {/* ── Bet cards ── */}
      {displayed.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">⬡</div>
          <div className="empty-text">No bets in this view</div>
        </div>
      ) : (
        <div className="card-list">
          {displayed.map((b) => (
            <BetCard
              key={b.id}
              bet={b}
              account={state.account}
              friends={state.friends}
              pendingAction={pendingAction}
              onAccept={async (betId) => {
                setPendingAction(`accept:${betId}`);
                await acceptBet(betId);
                setPendingAction("");
              }}
              onSettle={async (betId, winner) => {
                setPendingAction(`settle:${betId}`);
                await settleBet(betId, winner);
                setPendingAction("");
              }}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <CreateBetModal
          state={state}
          preGoalId={preGoalId}
          onClose={() => setShowModal(false)}
          onCreate={createBet}
        />
      )}

      <hr className="divider" />
      <div className="section-head">
        <div className="section-label">Transaction History</div>
        <span className="section-count">{transactions.length} records</span>
      </div>
      {transactions.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">◇</div>
          <div className="empty-text">No transaction records yet</div>
        </div>
      ) : (
        <div className="history-list">
          {transactions.map((tx) => (
            <div className="history-row" key={tx.id}>
              <div>
                <div className="history-title">{tx.label}</div>
                <div className="history-meta">
                  {new Date(tx.createdAt).toLocaleString()} · {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                </div>
              </div>
              <div className={`history-amount ${tx.amount < 0 ? "loss" : "gain"}`}>
                {signedMon(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
