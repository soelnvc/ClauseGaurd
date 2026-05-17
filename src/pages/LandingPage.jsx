import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useScrollReveal } from "../hooks/useScrollReveal";
import ScrollSequence from "../components/animation/ScrollSequence";
import SplineScene from "../components/common/SplineScene";
import Button from "../components/common/Button";
import "./LandingPage.css";

// Reusable component to handle the scroll reveal logic cleanly
function RevealBlock({
  children,
  direction = "up",
  className = "",
  delayClass = "",
  style = {},
}) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal-${direction} ${delayClass} ${isVisible ? "is-visible" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Higher-end graphic for Claim Rejection Reality
function ClaimRejectionGraphic() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`claim-reality-graphic reveal-graphic ${isVisible ? "is-visible" : ""}`}
    >
      <div className="claim-reality-header">
        <h3>1 in 4 ❌</h3>
        <p style={{ fontSize: "var(--text-body-sm)" }}>
          contracts hide exploitative clauses. Don't sign blindly.
        </p>
      </div>

      <div className="claim-grid">
        <div className="claim-card"></div>
        <div className="claim-card"></div>
        <div className="claim-card"></div>
        <div className="claim-card claim-card--rejected"></div>
      </div>
    </div>
  );
}

// 90% Understanding Gap Graphic
function UnderstandingGapGraphic() {
  const { ref, isVisible } = useScrollReveal();
  const [isClicked, setIsClicked] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = 90;
      const duration = 2000; // Match CSS transition
      const increment = 1;
      const stepTime = duration / end;

      const timer = setInterval(() => {
        start += 1;
        if (start <= end) {
          setDisplayCount(start);
        } else {
          clearInterval(timer);
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setDisplayCount(0);
    }
  }, [isVisible]);
  
  return (
    <div 
      ref={ref} 
      className={`understanding-gap-graphic reveal-graphic ${isVisible ? 'is-visible' : ''}`}
      onClick={() => setIsClicked(!isClicked)}
    >
      <div className="gauge-container">
        <svg className="gauge-svg" viewBox="0 0 120 120">
          <circle className="gauge-bg" cx="60" cy="60" r="50" />
          {/* Base Yellow Layer */}
          <circle className="gauge-fill" cx="60" cy="60" r="50" />
          {/* Interactive Blue Overlay Layer */}
          <circle 
            className={`gauge-fill gauge-fill--blue ${isClicked ? 'is-active' : ''}`} 
            cx="60" cy="60" r="50" 
          />
        </svg>
        <div className="gauge-text" style={{ color: isClicked ? '#00d2ff' : 'var(--snow)', transition: 'color 0.5s' }}>
          {displayCount}%
        </div>
      </div>
      
      <div className="gap-info">
        <h4>Understanding Gap</h4>
        <p>Most people sign agreements without understanding the hidden traps.</p>
      </div>
    </div>
  );
}

function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/workspace');
    } else {
      navigate('/login');
    }
  };

  // Enforce Dark Page Context & Scroll Snap natively on the HTML element
  useEffect(() => {
    document.body.classList.add("is-dark-page");
    document.documentElement.classList.add("snap-scroll-active");

    return () => {
      document.body.classList.remove("is-dark-page");
      document.documentElement.classList.remove("snap-scroll-active");
    };
  }, []);

  return (
    <div className="landing-page">
      {/* ── SCREEN 1: HERO (Cinematic Sequence) ── */}
      <section className="hero-track">
        <div className="hero-sticky">
          {/* Sheer interactive background containing beautiful neon glows and micro-particles */}
          <div className="hero-animated-background">
            <div className="mesh-gradient" />
            <div className="particle-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 15}s`,
                    animationDuration: `${15 + Math.random() * 20}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Accent Circle (Hides watermark + Architectural Border) */}
          <div className="hero-accent-circle" />

          {/* Glassmorphed Get Started Button and Tagline */}
          <div className="hero-action-container">
            <h1 style={{ color: "var(--snow)", fontSize: "2rem", marginBottom: "var(--space-md)", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Know the risk before you agree.</h1>
            <button className="hero-glass-btn" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ── SCREEN 2: THE PROBLEM ── */}
      <section className="snap-section">
        {/* Mirror Circle for Shared Decor Effect */}
        <div className="shared-circle-screen2" />

        <div className="container section-grid">
          <RevealBlock direction="left" delayClass="delay-100">
            <p
              className="text-overline"
              style={{
                color: "var(--accent-red)",
                marginBottom: "var(--space-sm)",
              }}
            >
              THE PROBLEM
            </p>
            <h2
              className="landing-headline"
              style={{ fontSize: "var(--text-h1)" }}
            >
              Hidden traps in the fine print
            </h2>
            <p className="landing-subheadline">
              Corporations bury exploitative clauses, hidden liabilities, and legal traps deep
              within multi-page agreements, offer letters, and online terms. You shouldn't need a law degree to protect your interests.
            </p>
          </RevealBlock>

          <RevealBlock direction="right" delayClass="delay-200">
            <div className="problem-graphics-stack">
              <ClaimRejectionGraphic />
              <UnderstandingGapGraphic />
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREEN 3: THE SOLUTION ── */}
      <section className="snap-section">
        <div className="container section-grid">
          <RevealBlock direction="left" delayClass="delay-200">
            <div className="spline-container-mask">
              <SplineScene scene="https://prod.spline.design/5r0R1IdHYuhH74Zs/scene.splinecode" />
              {/* Decorative AI indicator covering the watermark */}
              <div className="spline-watermark-mask">
                <span className="ai-dot" />
                <span className="ai-label">AI</span>
              </div>
            </div>
          </RevealBlock>

          <RevealBlock direction="right" delayClass="delay-100">
            <p
              className="text-overline"
              style={{
                color: "var(--accent-green)",
                marginBottom: "var(--space-sm)",
              }}
            >
              THE SOLUTION
            </p>
            <h2
              className="landing-headline"
              style={{ fontSize: "var(--text-h1)" }}
            >
              Adversarial AI protecting your signature
            </h2>
            <p className="landing-subheadline">
              ClauseGuard AI deploys an adversarial multi-agent system to scrutinize your contracts, offer letters, quotations, ticket terms, and online policies. It exposes unfair clauses, ambiguous terms, and hidden risks before they become legally binding.
            </p>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREEN 4: HOW TO USE ── */}
      <section className="snap-section">
        <div className="container section-grid">
          <RevealBlock direction="left" delayClass="delay-100">
            <p
              className="text-overline"
              style={{
                color: "var(--text-tertiary)",
                marginBottom: "var(--space-sm)",
              }}
            >
              WORKFLOW
            </p>
            <h2
              className="landing-headline"
              style={{ fontSize: "var(--text-h1)" }}
            >
              How to use
            </h2>
            <div
              style={{
                marginTop: "var(--space-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <div style={{ display: "flex", gap: "var(--space-md)" }}>
                <span style={{ fontSize: "1.5rem", color: "var(--snow)" }}>
                  1.
                </span>
                <p
                  className="landing-subheadline"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  Drag and drop your document into the secure portal. We support:
                  <br />
                  <span style={{ fontSize: "0.9em", color: "var(--text-tertiary)" }}>
                    Contracts • Offer letters • Quotations • Ticket terms • Online policies • Refund policies • Subscription terms • Service agreements
                  </span>
                </p>
              </div>
              <div style={{ display: "flex", gap: "var(--space-md)" }}>
                <span style={{ fontSize: "1.5rem", color: "var(--snow)" }}>
                  2.
                </span>
                <p
                  className="landing-subheadline"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  Wait 5 seconds for AI to process the document.
                </p>
              </div>
              <div style={{ display: "flex", gap: "var(--space-md)" }}>
                <span style={{ fontSize: "1.5rem", color: "var(--snow)" }}>
                  3.
                </span>
                <p
                  className="landing-subheadline"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  Review your generated risk dashboard and coverage score.
                </p>
              </div>
            </div>
          </RevealBlock>

          <RevealBlock direction="right" delayClass="delay-200">
            <div className="scan-mockup-card">
              <div className="scan-mockup-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="scan-mockup-title">adversarial_audit.log</span>
              </div>
              <div className="scan-mockup-body">
                <div className="scan-line-active"></div>
                <div className="terminal-log">
                  <p className="terminal-green">$ initialize clauseguard-audit-pipeline</p>
                  <p className="terminal-dim">[INFO] Ingesting contract_freelance_2026.pdf...</p>
                  <p className="terminal-dim">[INFO] Running 8-Agent Adversarial stress-test...</p>
                  <div className="agent-scan-row">
                    <span className="agent-tag-scan extractor">Extractor</span>
                    <span className="terminal-text">Extracted 42 active clauses.</span>
                  </div>
                  <div className="agent-scan-row">
                    <span className="agent-tag-scan danger">Risk Detector</span>
                    <span className="terminal-text text-danger">FLAGGED (High Risk): Predatory indemnity clause found at L124!</span>
                  </div>
                  <div className="agent-scan-row">
                    <span className="agent-tag-scan advocate">Devil's Advocate</span>
                    <span className="terminal-text text-warning">WARNING: Vague IP ownership transfer loophole detected.</span>
                  </div>
                  <p className="terminal-green">$ compile-verdict</p>
                  <p className="terminal-bold text-success">VERDICT: MODERATE RISK (Score: 35/100). Safe to sign with modifications.</p>
                </div>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ── SCREEN 5: CAPABILITIES & FOOTER ALIGNMENT ── */}
      <section className="snap-section snap-section--auto">
        <div
          className="container"
          style={{ paddingBottom: "var(--space-4xl)" }}
        >
          <RevealBlock
            direction="up"
            delayClass="delay-100"
            className="text-center"
            style={{ textAlign: "center" }}
          >
            <h2
              className="landing-headline"
              style={{ fontSize: "var(--text-h2)" }}
            >
              Advanced Adversarial Capabilities
            </h2>
            <p className="landing-subheadline" style={{ margin: "0 auto" }}>
              Engineered to level the legal playing field.
            </p>
          </RevealBlock>

          <div className="feature-grid">
            <RevealBlock direction="up" delayClass="delay-200">
              <div className="feature-card">
                <h3>Adversarial Multi-Agent Audit</h3>
                <p>
                  Deploys specialized agents to stress-test your documents under custom threat models, exposing exploitative terms.
                </p>
              </div>
            </RevealBlock>
            <RevealBlock direction="up" delayClass="delay-300">
              <div className="feature-card">
                <h3>Multi-Policy Benchmark</h3>
                <p>
                  Compare two competing offer letters, SaaS terms, or agreements clause-by-clause, mathematically exposing hidden liabilities.
                </p>
              </div>
            </RevealBlock>
            <RevealBlock direction="up" delayClass="delay-400">
              <div className="feature-card">
                <h3>Jargon & Ambiguity Decoder</h3>
                <p>
                  Instantly translates complex legal terminology and highlights vague phrasing designed to limit your rights.
                </p>
              </div>
            </RevealBlock>
          </div>

          <RevealBlock
            direction="up"
            delayClass="delay-400"
            className="flex-center"
            style={{ marginTop: "var(--space-3xl)" }}
          >
            <Link to="/workspace">
              <Button
                variant="primary"
                size="lg"
                style={{
                  background: "var(--snow)",
                  color: "var(--onyx)",
                  fontWeight: "bold",
                }}
              >
                Join the Beta
              </Button>
            </Link>
          </RevealBlock>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
