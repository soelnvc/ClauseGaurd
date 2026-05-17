import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { getUserPolicies, deletePolicyAnalysis } from "../services/dbService";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import ConfirmModal from "../components/common/ConfirmModal";
import "./DashboardPage.css";

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const location = useLocation();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    policyId: null,
  });

  const initiateDelete = (e, policyId) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({ isOpen: true, policyId });
  };

  const executeDelete = async () => {
    const policyId = confirmModal.policyId;
    if (!policyId) return;

    try {
      await deletePolicyAnalysis(user.uid, policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
      addToast("Policy safely removed from your portfolio.", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete policy.", "error");
    } finally {
      setConfirmModal({ isOpen: false, policyId: null });
    }
  };

  const handleViewPolicy = (policy) => {
    navigate("/workspace", { state: { policy } });
  };

  const handleViewRisk = (risk) => {
    navigate("/workspace", {
      state: { policy: risk.parentPolicy, initialTab: "risks" },
    });
  };

  const firstName = user?.displayName?.split(" ")[0] || "there";

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;
      try {
        const data = await getUserPolicies(user.uid);
        setPolicies(data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    if (!loading && location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [loading, location]);

  // Derived Statistics
  const data = useMemo(() => {
    if (!policies || policies.length === 0) return null;

    let totalRisk = 0;
    let totalRisks = 0;
    let totalTraps = 0;
    const allRisks = [];
    const typeCount = { Employment: 0, "Service Agrmt": 0, "Online Policies": 0, "Consumer/Refund": 0, Other: 0 };
    const typeScore = { Employment: 0, "Service Agrmt": 0, "Online Policies": 0, "Consumer/Refund": 0, Other: 0 };

    policies.forEach((p) => {
      // Risk is either direct overallRiskScore or inverted coverageScore
      const riskVal = p.overallRiskScore || Math.max(0, 100 - (p.coverageScore || 0));
      totalRisk += riskVal;

      const clauses = p.exploitativeClauses || p.clauseAnalysis || [];
      totalRisks += clauses.length;
      
      const traps = (p.hiddenLiabilities || []).length + (p.ambiguousTerms || []).length;
      totalTraps += traps;

      clauses.forEach((c) =>
        allRisks.push({
          flag: c.quote || c.clauseText || c.clause || "High Risk Clause",
          level: (c.severity || "warning").toLowerCase(),
          policyName: p.policyOverview?.name,
          parentPolicy: p,
        })
      );

      let cType = p.policyOverview?.type || p.type || "Other";
      const normalized = cType.toLowerCase();
      if (normalized.includes("offer") || normalized.includes("employment") || normalized.includes("nda") || normalized.includes("job") || normalized.includes("work")) {
        cType = "Employment";
      } else if (normalized.includes("service") || normalized.includes("agreement") || normalized.includes("contract") || normalized.includes("saas")) {
        cType = "Service Agrmt";
      } else if (normalized.includes("online") || normalized.includes("privacy") || normalized.includes("terms") || normalized.includes("subscription")) {
        cType = "Online Policies";
      } else if (normalized.includes("refund") || normalized.includes("ticket") || normalized.includes("quotation") || normalized.includes("consumer") || normalized.includes("policy")) {
        cType = "Consumer/Refund";
      } else {
        cType = "Other";
      }

      if (!typeCount[cType]) {
        typeCount[cType] = 0;
        typeScore[cType] = 0;
      }
      typeCount[cType]++;
      typeScore[cType] += riskVal;
    });

    const avgRisk = Math.round(totalRisk / policies.length);
    const avgProtection = Math.max(0, 100 - avgRisk);
    let grade = "—";
    if (avgProtection >= 85) grade = "A";
    else if (avgProtection >= 70) grade = "B";
    else if (avgProtection >= 50) grade = "C";
    else grade = "F";

    // Sort risks (Critical -> Warning -> Info)
    const severityMap = { critical: 4, high: 3, warning: 2, info: 1 };
    allRisks.sort((a, b) => (severityMap[b.level] || 0) - (severityMap[a.level] || 0));

    // Categories Breakdown
    const categories = [
      { category: "Employment", color: "#6366f1", icon: "💼" },
      { category: "Service Agrmt", color: "#3b82f6", icon: "⚙️" },
      { category: "Online Policies", color: "#10b981", icon: "🌐" },
      { category: "Consumer/Refund", color: "#f59e0b", icon: "🎟️" },
    ].map((cat) => ({
      ...cat,
      policies: typeCount[cat.category] || 0,
      score:
        typeCount[cat.category] > 0
          ? Math.round(typeScore[cat.category] / typeCount[cat.category])
          : 0,
    }));

    return {
      stats: {
        totalPolicies: policies.length,
        avgRisk,
        openRisks: totalRisks,
        totalTraps,
      },
      portfolioScore: avgProtection,
      portfolioGrade: grade,
      categoryBreakdown: categories,
      recentAnalyses: policies.slice(0, 5),
      topRisks: allRisks.slice(0, 4),
    };
  }, [policies]);

  if (loading) {
    return (
      <div
        className="theme-main page-content page-enter"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <Loader variant="orb" />
      </div>
    );
  }

  const isEmpty = !data;

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="theme-main page-content page-enter">
      <div className="dashboard">
        {/* Full-Width Header Banner */}
        <motion.div
          className="dashboard__banner"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="container">
            <div className="dashboard__header">
              <div>
                <p
                  className="text-overline"
                  style={{ marginBottom: "0.25rem" }}
                >
                  DASHBOARD
                </p>
                <h1 className="dashboard__title">
                  Welcome back,{" "}
                  <span className="text-gradient--spectrum">{firstName}</span>
                </h1>
                <p className="dashboard__subtitle">
                  {isEmpty
                    ? "Your contract vault is waiting to be built."
                    : "Here's an overview of your contract vault."}
                </p>
              </div>
              <Link to="/workspace">
                <Button
                  variant="primary"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  }
                >
                  New Analysis
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="container"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* ── Empty State ── */}
          {isEmpty ? (
            <motion.div className="dashboard__empty" variants={itemVariants}>
              <Card variant="lifted" className="dashboard__empty-card">
                <div className="dashboard__empty-icon">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                </div>
                <h2 className="dashboard__empty-title">
                  No contracts analyzed yet
                </h2>
                <p className="dashboard__empty-desc">
                  Upload your first contract to get a comprehensive
                  AI-powered breakdown with risk scores, hidden liabilities, and
                  decoded jargon.
                </p>
                <Link to="/workspace">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    }
                  >
                    Analyze Your First Contract
                  </Button>
                </Link>

                {/* Empty state feature grid */}
                <div className="dashboard__empty-features">
                  <div className="dashboard__empty-feature">
                    <span className="dashboard__empty-feature-icon">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                    <div>
                      <p className="dashboard__empty-feature-title">
                        Risk Scoring
                      </p>
                      <p className="dashboard__empty-feature-desc">
                        Know exactly how protected you are
                      </p>
                    </div>
                  </div>
                  <div className="dashboard__empty-feature">
                    <span className="dashboard__empty-feature-icon">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </span>
                    <div>
                      <p className="dashboard__empty-feature-title">
                        Risk Detection
                      </p>
                      <p className="dashboard__empty-feature-desc">
                        Spot hidden dangers before they cost you
                      </p>
                    </div>
                  </div>
                  <div className="dashboard__empty-feature">
                    <span className="dashboard__empty-feature-icon">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="2" y="4" width="8" height="16" rx="1" />
                        <rect x="14" y="4" width="8" height="16" rx="1" />
                      </svg>
                    </span>
                    <div>
                      <p className="dashboard__empty-feature-title">
                        Contract Comparison
                      </p>
                      <p className="dashboard__empty-feature-desc">
                        Side-by-side gap analysis
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* ── Stats Row ── */}
              <div className="dashboard__stats">
                {[
                  {
                    label: "Contracts Analyzed",
                    value: data.stats.totalPolicies,
                    icon: (
                      <>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </>
                    ),
                  },
                  {
                    label: "Avg. Risk Score",
                    value: `${data.stats.avgRisk}%`,
                    colorClass: data.stats.avgRisk >= 75 ? "dashboard__stat-value--risk" : data.stats.avgRisk < 35 ? "dashboard__stat-value--green" : "",
                    icon: (
                      <>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </>
                    ),
                  },
                  {
                    label: "Exploitative Clauses",
                    value: data.stats.openRisks,
                    colorClass: data.stats.openRisks > 0 ? "dashboard__stat-value--risk" : "",
                    icon: (
                      <>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </>
                    ),
                  },
                  {
                    label: "Hidden Traps",
                    value: data.stats.totalTraps,
                    colorClass: data.stats.totalTraps > 0 ? "dashboard__stat-value--risk" : "",
                    icon: (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ),
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    style={{ height: "100%" }}
                  >
                    <Card
                      variant="lifted"
                      className="dashboard__stat-card"
                      hoverable={true}
                    >
                      <div className="dashboard__stat-content">
                        <p className="dashboard__stat-label">{stat.label}</p>
                        <p
                          className={`dashboard__stat-value ${stat.colorClass || ""}`}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div className="dashboard__stat-icon">
                        <svg
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {stat.icon}
                        </svg>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* ── Main Row: Portfolio Health + Top Risks ── */}
              <motion.div
                className="dashboard__main-row"
                variants={itemVariants}
              >
                {/* Portfolio Health Card (larger) */}
                <Card id="portfolio-overview" variant="lifted" className="dashboard__portfolio-card">
                  <div className="dashboard__portfolio-top">
                    <div>
                      <p
                        className="text-overline"
                        style={{ marginBottom: "var(--space-sm)" }}
                      >
                        PORTFOLIO PROTECTION INDEX
                      </p>
                      <p className="dashboard__portfolio-desc">
                        Your overall protection rating is based on{" "}
                        {data.stats.totalPolicies} analyzed contracts.
                        {data.portfolioScore >= 80
                          ? " Extremely secure. Your rights are well protected."
                          : data.portfolioScore >= 60
                            ? " Moderately safe. Some questionable clauses present."
                            : " Action recommended. Exploitative terms detected."}
                      </p>
                    </div>
                    <div className="dashboard__portfolio-dial">
                      <svg
                        viewBox="0 0 100 100"
                        className="dashboard__dial-svg"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="rgba(0,0,0,0.05)"
                          strokeWidth="7"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke={
                            data.portfolioScore >= 80
                              ? "#2ecc71"
                              : data.portfolioScore >= 60
                                ? "#f39c12"
                                : "#e74c3c"
                          }
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${(data.portfolioScore / 100) * 264} 264`}
                          transform="rotate(-90 50 50)"
                          className="dashboard__dial-ring"
                        />
                      </svg>
                      <div className="dashboard__dial-center">
                        <span className="dashboard__dial-number">
                          {data.portfolioScore}
                        </span>
                        <span className="dashboard__dial-grade">
                          {data.portfolioGrade}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div id="category-breakdown" className="dashboard__categories">
                    {data.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="dashboard__category">
                        <div className="dashboard__category-header">
                          <span className="dashboard__category-icon">
                            {cat.icon}
                          </span>
                          <span className="dashboard__category-name">
                            {cat.category}
                          </span>
                          <span className="dashboard__category-score">
                            {cat.policies > 0 ? `${cat.score}% Risk` : "—"}
                          </span>
                        </div>
                        <div className="dashboard__category-bar">
                          <div
                            className="dashboard__category-fill"
                            style={{
                              width: cat.policies > 0 ? `${cat.score}%` : "0%",
                              background: cat.color,
                            }}
                          />
                        </div>
                        <p className="dashboard__category-meta">
                          {cat.policies > 0
                            ? `${cat.policies} contract`
                            : "No contract analyzed"}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Risk Alerts (smaller, right) */}
                <Card id="critical-risks" variant="lifted" className="dashboard__risks-card">
                  <p
                    className="text-overline"
                    style={{ marginBottom: "var(--space-md)" }}
                  >
                    TOP RISK ALERTS
                  </p>
                  {data.topRisks.length === 0 ? (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      No major risks detected across your portfolio!
                    </p>
                  ) : (
                    <div className="dashboard__risk-list">
                      {data.topRisks.map((risk, i) => (
                        <div
                          key={i}
                          className={`dashboard__risk-item dashboard__risk-item--${risk.level} dashboard__risk-item--clickable`}
                          onClick={() => handleViewRisk(risk)}
                        >
                          <span
                            className="dashboard__risk-caution"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: "3px",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={
                                risk.level === "critical" || risk.level === "high"
                                  ? "#e74c3c"
                                  : risk.level === "warning" || risk.level === "medium"
                                    ? "#f39c12"
                                    : "#3498db"
                              }
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </span>
                          <div className="dashboard__risk-info">
                            <p className="dashboard__risk-flag">{risk.flag}</p>
                            <p className="dashboard__risk-policy">
                              {risk.policyName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* ── Recent Analyses — Full Width ── */}
              <motion.div variants={itemVariants}>
                <Card variant="lifted" className="dashboard__recent-card">
                  <div className="dashboard__recent-header">
                    <p className="text-overline">RECENT ANALYSES</p>
                    <Link to="/policies" className="dashboard__see-all">
                      View all
                    </Link>
                  </div>
                  <div className="dashboard__recent-list">
                    {data.recentAnalyses.map((analysis) => {
                      const protectionScore = analysis.overallRiskScore !== undefined 
                        ? Math.max(0, 100 - analysis.overallRiskScore) 
                        : (analysis.coverageScore || 0);
                      return (
                        <div
                          key={analysis.id}
                          className="dashboard__recent-item dashboard__recent-item--clickable"
                          onClick={() => handleViewPolicy(analysis)}
                        >
                          <div className="dashboard__recent-score-ring">
                            <svg
                              viewBox="0 0 36 36"
                              className="dashboard__mini-dial"
                            >
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                stroke="rgba(0,0,0,0.05)"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                stroke={
                                  protectionScore >= 80
                                    ? "#2ecc71"
                                    : protectionScore >= 60
                                      ? "#f39c12"
                                      : "#e74c3c"
                                }
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${((protectionScore || 0) / 100) * 94.2} 94.2`}
                                transform="rotate(-90 18 18)"
                              />
                            </svg>
                            <span className="dashboard__mini-score">
                              {protectionScore}
                            </span>
                          </div>
                        <div className="dashboard__recent-info">
                          <p className="dashboard__recent-name">
                            {analysis.policyOverview?.name || "Unknown Contract"}
                          </p>
                          <p className="dashboard__recent-meta">
                            {analysis.policyOverview?.type || "Contract"} ·{" "}
                            {analysis.capturedDate || "Recent"}
                          </p>
                        </div>
                        <div className="dashboard__recent-actions">
                          {(analysis.riskFlags?.length || 0) > 0 && (
                            <span className="dashboard__recent-risks">
                              {analysis.riskFlags.length} risks
                            </span>
                          )}
                          <button
                            className="dashboard__recent-delete"
                            onClick={(e) => initiateDelete(e, analysis.id)}
                            aria-label="Delete analysis"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>

              {/* ── Quick Actions — 3 Cards Row ── */}
              <div className="dashboard__actions-row">
                {[
                  {
                    to: "/workspace",
                    label: "Upload New Contract",
                    icon: (
                      <>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </>
                    ),
                  },
                  {
                    to: "/compare",
                    label: "Compare Contracts",
                    icon: (
                      <>
                        <rect x="2" y="4" width="8" height="16" rx="1" />
                        <rect x="14" y="4" width="8" height="16" rx="1" />
                      </>
                    ),
                  },
                  {
                    to: "/policies",
                    label: "View All Contracts",
                    icon: (
                      <>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </>
                    ),
                  },
                ].map((action, i) => {
                  const MotionLink = motion(Link);
                  const actionCardVariants = {
                    initial: {
                      y: 0,
                      scale: 1,
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    },
                    hover: {
                      y: -10,
                      scale: 1.02,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    },
                  };

                  const actionIconVariants = {
                    initial: { backgroundColor: "#f5f5f7", color: "#1d1d1f" },
                    hover: {
                      backgroundColor: "#1d1d1f",
                      color: "#ffffff",
                      transition: { duration: 0.2 },
                    },
                  };

                  return (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      style={{ height: "100%" }}
                    >
                      <Card
                        variant="lifted"
                        className="dashboard__action-card"
                        variants={actionCardVariants}
                        initial="initial"
                        whileHover="hover"
                      >
                        <MotionLink
                          to={action.to}
                          className="dashboard__action-link"
                        >
                          <motion.span
                            className="dashboard__action-icon"
                            variants={actionIconVariants}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              {action.icon}
                            </svg>
                          </motion.span>
                          <span className="dashboard__action-label">
                            {action.label}
                          </span>
                        </MotionLink>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Remove Policy"
        message="Are you sure you want to remove this policy from your portfolio? This action is permanent and cannot be undone."
        confirmText="Remove Policy"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ isOpen: false, policyId: null })}
      />
    </div>
  );
}

export default DashboardPage;
