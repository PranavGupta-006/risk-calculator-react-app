import { useState, useEffect } from "react";

const API = "http://localhost:8000";

const RISK_COLOR = {
  "LOW":       { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500",  border: "border-emerald-200" },
  "VERY LOW":  { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-400",  border: "border-emerald-200" },
  "MODERATE":  { bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-400",    border: "border-amber-200"   },
  "MEDIUM":    { bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-400",    border: "border-amber-200"   },
  "MEDIUM-HIGH":{ bg: "bg-orange-50",  text: "text-orange-700",   dot: "bg-orange-500",   border: "border-orange-200"  },
  "HIGH":      { bg: "bg-red-50",      text: "text-red-700",      dot: "bg-red-500",       border: "border-red-200"    },
  "VERY HIGH": { bg: "bg-red-50",      text: "text-red-700",      dot: "bg-red-600",       border: "border-red-200"    },
};

function RiskBadge({ level }) {
  const c = RISK_COLOR[level] || RISK_COLOR["MODERATE"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
}

function MetricRow({ label, value, risk }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono font-medium text-gray-800">
          {typeof value === "number" ? value.toFixed(2) : value}
        </span>
        {risk && <RiskBadge level={risk} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function DistributionBar({ distribution, total }) {
  const order = ["VERY LOW", "LOW", "MEDIUM", "MEDIUM-HIGH", "HIGH"];
  const colors = {
    "VERY LOW":   "bg-emerald-400",
    "LOW":        "bg-emerald-500",
    "MEDIUM":     "bg-amber-400",
    "MEDIUM-HIGH":"bg-orange-500",
    "HIGH":       "bg-red-500",
  };

  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
        {order.map((key) => {
          const pct = total ? ((distribution[key] || 0) / total) * 100 : 0;
          return pct > 0 ? (
            <div key={key} className={`${colors[key]} transition-all`} style={{ width: `${pct}%` }} />
          ) : null;
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {order.map((key) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${colors[key]}`} />
            <span className="text-xs text-gray-500">{key}</span>
            <span className="text-xs font-medium text-gray-700">{distribution[key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, onClick }) {
  const c = RISK_COLOR[user.overall_risk] || RISK_COLOR["MODERATE"];
  return (
    <button
      onClick={() => onClick(user.user_id)}
      className={`w-full text-left bg-white border ${c.border} rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800 font-mono">{user.user_id}</span>
        <RiskBadge level={user.overall_risk} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-400">DTI</p>
          <p className="text-sm font-medium text-gray-700">{user.dti.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Expense Ratio</p>
          <p className="text-sm font-medium text-gray-700">{(user.expense_ratio * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Emergency Cover</p>
          <p className="text-sm font-medium text-gray-700">{user.emergency_coverage.toFixed(1)}x</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Savings Ratio</p>
          <p className="text-sm font-medium text-gray-700">{user.savings_ratio.toFixed(2)}</p>
        </div>
      </div>
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("overview"); // "overview" | "lookup"
  const [userId, setUserId] = useState("UID001");
  const [userResult, setUserResult] = useState(null);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setAllLoading(true);
    try {
      const res = await fetch(`${API}/risk`);
      const data = await res.json();
      setAllData(data);
    } catch (err) {
      console.error("Failed to fetch all users", err);
    }
    setAllLoading(false);
  };

  const fetchUser = async (id) => {
    const target = id || userId;
    setLoading(true);
    setError(null);
    setUserResult(null);
    try {
      const res = await fetch(`${API}/risk/${target}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setUserResult(data);
      setTab("lookup");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const highRiskCount = allData?.risk_distribution?.HIGH || 0;
  const dominantRisk = allData
    ? Object.entries(allData.risk_distribution).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-900 rounded" />
            <span className="text-sm font-semibold text-gray-900">RiskIQ</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Dashboard</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {["overview", "lookup"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-6">

            <div>
              <h1 className="text-xl font-semibold text-gray-900">Portfolio Overview</h1>
              <p className="text-sm text-gray-500 mt-0.5">Financial risk analysis across all users</p>
            </div>

            {allLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
                  ))}
                </div>
              </div>
            ) : allData && (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={allData.total_users} sub="in dataset" />
                  <StatCard label="High Risk" value={highRiskCount} sub={`${((highRiskCount/allData.total_users)*100).toFixed(1)}% of total`} />
                  <StatCard label="Dominant Risk" value={dominantRisk} sub="most common level" />
                  <StatCard
                    label="Safe Users"
                    value={(allData.risk_distribution["LOW"] || 0) + (allData.risk_distribution["VERY LOW"] || 0)}
                    sub="low + very low risk"
                  />
                </div>

                {/* Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Risk Distribution</h2>
                  <DistributionBar distribution={allData.risk_distribution} total={allData.total_users} />
                </div>

                {/* User cards grid */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">All Users</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allData.users.map((u) => (
                      <UserCard key={u.user_id} user={u} onClick={fetchUser} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LOOKUP TAB ── */}
        {tab === "lookup" && (
          <div className="space-y-6 max-w-xl">

            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Lookup</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fetch risk profile for a specific user</p>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUser()}
                placeholder="e.g. UID001"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={() => fetchUser()}
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "..." : "Fetch"}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {userResult && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">User ID</p>
                    <p className="text-lg font-semibold font-mono text-gray-900">{userResult.user_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Overall Risk</p>
                    <RiskBadge level={userResult.overall_risk} />
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Indicators</p>
                  <MetricRow label="Expense Ratio" value={`${(userResult.expense_ratio * 100).toFixed(1)}%`} risk={userResult.expense_risk} />
                  <MetricRow label="Debt-to-Income (DTI)" value={`${userResult.dti.toFixed(1)}%`} risk={userResult.dti_risk} />
                  <MetricRow label="Emergency Coverage" value={`${userResult.emergency_coverage.toFixed(1)}x`} risk={userResult.emergency_risk} />
                  <MetricRow label="Savings Ratio" value={userResult.savings_ratio.toFixed(3)} risk={userResult.savings_risk} />
                  <MetricRow label="Overall Risk Score" value={userResult.overall_risk_value.toFixed(3)} />
                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}