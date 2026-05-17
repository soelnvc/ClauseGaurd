import React from "react";
import { motion } from "framer-motion";
import Card from "../common/Card";

const ResultsArea = ({ analysis, activeTab, setActiveTab }) => {
  if (!analysis) return null;

  return (
    <motion.div 
      className="workspace__results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── TOP SECTION: Score & Overview ── */}
      <div className="workspace__results-top" style={{ display: 'flex', gap: 'var(--space-md)' }}>
        
        {/* SCORE DIAL */}
        <Card variant="lifted" className="workspace__score-card" style={{ flex: '1', textAlign: 'center' }}>
          <p className="text-overline" style={{ marginBottom: "var(--space-md)" }}>
            OVERALL RISK SCORE
          </p>
          <div className="workspace__score-dial" style={{ padding: '2rem 0' }}>
            <h1 style={{ 
              fontSize: '64px', 
              color: analysis.overallRiskScore > 70 ? 'var(--accent-red)' : analysis.overallRiskScore > 30 ? 'var(--accent-yellow)' : 'var(--accent-green)',
              textShadow: 'none'
            }}>
              {analysis.overallRiskScore}
            </h1>
            <p style={{ fontSize: 'var(--text-h3)', marginTop: '0.5rem', fontWeight: '600' }}>
              {analysis.riskLevel}
            </p>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-body-sm)' }}>
            Confidence: {analysis.confidence}
          </p>
        </Card>
        
        {/* EXECUTIVE SUMMARY & RED FLAGS */}
        <Card variant="lifted" className="workspace__overview-card" style={{ flex: '2' }}>
          <p className="text-overline" style={{ marginBottom: "var(--space-md)" }}>
            EXECUTIVE SUMMARY
          </p>
          <p className="workspace__summary-text" style={{ fontSize: 'var(--text-body)', lineHeight: '1.6' }}>
            {analysis.executiveSummary}
          </p>
          
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <p className="text-overline" style={{ marginBottom: "var(--space-sm)", color: 'var(--accent-red)' }}>
              TOP RED FLAGS
            </p>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
              {analysis.topRedFlags?.map((flag, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{flag}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* ── TABS FOR DEEP DIVES ── */}
      <div className="workspace__tabs" style={{ marginTop: 'var(--space-xl)' }}>
        <button
          className={`workspace__tab ${activeTab === "clauses" ? "workspace__tab--active" : ""}`}
          onClick={() => setActiveTab("clauses")}
        >
          Exploitative Clauses
          <span className="workspace__tab-count">{analysis.clauseAnalysis?.length || 0}</span>
        </button>
        <button
          className={`workspace__tab ${activeTab === "hidden" ? "workspace__tab--active" : ""}`}
          onClick={() => setActiveTab("hidden")}
        >
          Hidden Traps
          <span className="workspace__tab-count">
            {(analysis.hiddenLiabilities?.length || 0) + (analysis.ambiguousTerms?.length || 0)}
          </span>
        </button>
        <button
          className={`workspace__tab ${activeTab === "rights" ? "workspace__tab--active" : ""}`}
          onClick={() => setActiveTab("rights")}
        >
          User Rights
        </button>
        <button
          className={`workspace__tab ${activeTab === "actions" ? "workspace__tab--active" : ""}`}
          onClick={() => setActiveTab("actions")}
        >
          Action Plan
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="workspace__tab-content" style={{ marginTop: 'var(--space-md)' }}>
        
        {/* TAB 1: CLAUSE ANALYSIS */}
        {activeTab === "clauses" && (
          <div className="workspace__exclusions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysis.clauseAnalysis?.map((clause, i) => (
              <Card key={i} variant="lifted" className="workspace__exclusion-card" style={{ borderLeft: `4px solid ${clause.severity === 'high' ? 'var(--accent-red)' : clause.severity === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)'}` }}>
                <div className="workspace__exclusion-header" style={{ marginBottom: '1rem' }}>
                  <span className={`workspace__severity workspace__severity--${clause.severity}`}>
                    {clause.severity.toUpperCase()} SEVERITY
                  </span>
                </div>
                <h4 className="workspace__exclusion-title" style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  "{clause.quote}"
                </h4>
                <p className="workspace__exclusion-detail" style={{ fontWeight: '500' }}>
                  <strong style={{ color: 'var(--accent-red)' }}>Devil's Critique:</strong> {clause.critique}
                </p>
              </Card>
            ))}
            {(!analysis.clauseAnalysis || analysis.clauseAnalysis.length === 0) && (
              <p style={{ color: 'var(--text-tertiary)' }}>No exploitative clauses detected.</p>
            )}
          </div>
        )}

        {/* TAB 2: HIDDEN TRAPS (Liabilities & Ambiguities) */}
        {activeTab === "hidden" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Hidden Liabilities</h3>
              {analysis.hiddenLiabilities?.map((liability, i) => (
                <div key={i} className="workspace__term-item" style={{ background: 'var(--onyx-light)', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'var(--accent-yellow)', marginBottom: '0.25rem' }}>{liability.issue}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{liability.detail}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Ambiguous Terms</h3>
              {analysis.ambiguousTerms?.map((ambiguity, i) => (
                <div key={i} className="workspace__term-item" style={{ background: 'var(--onyx-light)', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.25rem' }}>"{ambiguity.term}"</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{ambiguity.implication}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: USER RIGHTS */}
        {activeTab === "rights" && (
          <Card variant="lifted">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Rights Impact Analysis</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
              {analysis.userRightsImpact}
            </p>
          </Card>
        )}

        {/* TAB 4: ACTIONS & NEGOTIATION */}
        {activeTab === "actions" && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <Card variant="lifted">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Recommended Actions</h3>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                {analysis.recommendedActions?.map((action, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{action}</li>
                ))}
              </ul>
            </Card>
            <Card variant="lifted">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Negotiation Suggestions</h3>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                {analysis.negotiationSuggestions?.map((suggestion, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{suggestion}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>

      {/* ── FOOTER: DISCLAIMERS ── */}
      <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
          <strong>Limitations:</strong> {analysis.limitations}
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          <strong>Legal Disclaimer:</strong> {analysis.legalDisclaimer}
        </p>
      </div>

    </motion.div>
  );
};

export default ResultsArea;
