"use client";

import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   SVG CUSTOM INLINE ICONS
   ═══════════════════════════════════════════════════════════════ */

function IconIphone({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x={5} y={2} width={14} height={20} rx={2} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
    </svg>
  );
}

function IconMonitor({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x={3} y={3} width={18} height={12} rx={2} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5m-4 0h8" />
    </svg>
  );
}

function IconCompass({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={12} r={10} />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconPresentation({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x={3} y={3} width={18} height={12} rx={2} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5M3 12h18" />
    </svg>
  );
}

function IconZap({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconActivity({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconMail({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconDatabase({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <ellipse cx={12} cy={5} rx={9} ry={3} />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function IconShieldAlert({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1={12} y1={8} x2={12} y2={12} />
      <line x1={12} y1={16} x2={12.01} y2={16} />
    </svg>
  );
}

function IconX({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  );
}

function IconChevronDown({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconLoader({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1={12} y1={2} x2={12} y2={6} />
      <line x1={12} y1={18} x2={12} y2={22} />
      <line x1={4.93} y1={4.93} x2={7.76} y2={7.76} />
      <line x1={16.24} y1={16.24} x2={19.07} y2={19.07} />
      <line x1={2} y1={12} x2={6} y2={12} />
      <line x1={18} y1={12} x2={22} y2={12} />
      <line x1={4.93} y1={19.07} x2={7.76} y2={16.24} />
      <line x1={16.24} y1={7.76} x2={19.07} y2={4.93} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SLIDES DATA (19 SLIDES FROM corporate-reporting)
   ═══════════════════════════════════════════════════════════════ */

interface Slide {
  slideNumber: number;
  headline: string;
  category: string;
  points: { title: string; desc: string; isHighlighted?: boolean }[];
  visualCue: string;
  speakerNotes: string;
}

const SLIDES_DECK: Slide[] = [
  {
    slideNumber: 1,
    headline: "The Research Machine v3.0: Walkthrough & Technical Accomplishments",
    category: "Cover Slide",
    points: [
      { title: "Prepared By", desc: "CIMedia Client Presentation Intelligence Team (The Amplifier)" },
      { title: "Classification", desc: "Company Confidential — Internal Use Only" },
      { title: "Core Goal", desc: "Bridging Search Integrity with Executive Clarity" }
    ],
    visualCue: "Elegant layout with solid Deep Navy theme, thin gold divider, and editorial typography.",
    speakerNotes: "Today we review the completed technical expansions of The Research Machine v3.0. This presentation deconstructs our new mobile-first walkthrough and the core engineering updates that solve prior bottlenecks."
  },
  {
    slideNumber: 2,
    headline: "Three Inefficiencies Stand Between Raw Data and Boardroom Actions",
    category: "Bottom Line Up Front (BLUF)",
    points: [
      { title: "45-Second Latency", desc: "Slow manual directory crawling blocked past client history searches, delaying onboarding.", isHighlighted: true },
      { title: "35% Error Rate", desc: "Automated AI outputs lacked governance, leading to scoping gaps and rework.", isHighlighted: true },
      { title: "Digital Disorganization", desc: "Inconsistent folder naming schemas caused asset confusion and library entropy.", isHighlighted: true }
    ],
    visualCue: "3-column layout grid. Large 28pt serif numbers in Gold, body in Public Sans.",
    speakerNotes: "Raw AI capability is useless without speed, organization, and human governance. We identified three core friction points in our previous iteration: folder crawl latency, lack of scoping validation, and naming disorganization."
  },
  {
    slideNumber: 3,
    headline: "45-Second Folder Crawling Causes Operational Inefficiency",
    category: "The Problem",
    points: [
      { title: "Direct Operational Pain", desc: "Querying past client jobs required crawling nested directories on Google Drive." },
      { title: "Latency Impact", desc: "This slow crawl blocked dashboard loading, resulting in connection dropouts during client pitches." },
      { title: "Audit Baseline", desc: "45 seconds average fetch time mapped across client workspaces (Audit, June 2026)." }
    ],
    visualCue: "Left column displays massive '45s' metric in Crimson Alert red. Right column carries explanatory context.",
    speakerNotes: "Folder crawling is a critical blocker for client trust. Every time a client visited their history page, the app spent three-quarters of a minute fetching data. It was slow and insecure."
  },
  {
    slideNumber: 4,
    headline: "Inefficient Handoffs Will Cost CIMedia $180K in Wasted API Tokens",
    category: "Cost of Inaction",
    points: [
      { title: "High Token Overhead", desc: "Without automated database caching and human review gates, researchers run duplicate briefs." },
      { title: "Developer Drag", desc: "Custom configuration setups must be rewritten manually for each new notebook.", isHighlighted: true },
      { title: "Projected Cost", desc: "Loss of $180K projected by 2027 based on current token burn and manual overhead." }
    ],
    visualCue: "50/50 vertical division with a thin red accent border. Massive '$180K' metric displayed on the right.",
    speakerNotes: "Inaction carries a heavy, quantifiable price tag. Duplicate runs, manual configuration errors, and slow dashboard loading times waste hours. At scale, this translates to $180,000 in losses."
  },
  {
    slideNumber: 5,
    headline: "Database Syncing Reduces Client History Loading Time by 98%",
    category: "The Evidence",
    points: [
      { title: "Traditional Drive Crawl", desc: "Average speed: 45.2s. Suffered constant API throttling." },
      { title: "Synchronized Local DB", desc: "Average speed: 0.8s. Deliverables are cached instantly.", isHighlighted: true },
      { title: "Net Gain", desc: "98% reduction in latency. Bypasses Google Drive API rate limits entirely." }
    ],
    visualCue: "High-contrast comparison cards side-by-side. Metrics shown in large 64pt bold JetBrains Mono.",
    speakerNotes: "Local database caching delivers instantaneous history loading. By syncing Google Drive records to a local JSON database on submit, we cut loading times from 45 seconds to under 800 milliseconds."
  },
  {
    slideNumber: 6,
    headline: "Disconnected Pipelines Fragment Research Deliverables",
    category: "Root Cause Map",
    points: [
      { title: "Stage A: Client Submission", desc: "Brief ingested without structured classification." },
      { title: "Stage B: Unregulated AI Synthesis", desc: "No quality rubrics applied, resulting in a 35% scoping error rate." },
      { title: "Stage C: Manual Storage", desc: "Files saved under generic names, triggering slow folder crawls." }
    ],
    visualCue: "Linear node flowchart diagram: Ingest -> Unregulated Synthesis -> Manual Storage -> Client Friction.",
    speakerNotes: "A broken chain yields broken deliverables. The systems map tracks a brief’s journey. The lack of validation and database synchronization introduced friction points at every step."
  },
  {
    slideNumber: 7,
    headline: "35% of Autonomous AI Briefs Contain Scoping Gaps",
    category: "The Evidence (Validation Gap)",
    points: [
      { title: "Validation Gaps", desc: "Without human-in-the-loop validation, raw AI models hallucinate research scopes." },
      { title: "Filing Mismatches", desc: "AI misclassifies industry divisions or omits crucial geographic focus areas.", isHighlighted: true },
      { title: "Quality Check Results", desc: "35% of raw briefs failed to align with client-specific rubrics (QC Audit, 150 runs)." }
    ],
    visualCue: "Donut chart highlighting 35% in Gold and 65% in Slate Gray on a clean white background.",
    speakerNotes: "Raw AI output requires a human governance gate. 35% of autonomous briefs failed to capture the exact business context needed. We need a way to check and verify before execution."
  },
  {
    slideNumber: 8,
    headline: "Top-Performing Research Agencies Enforce Quality Gates",
    category: "Benchmarks",
    points: [
      { title: "Gate 1: Automated Triage", desc: "Ingesting and mapping briefs to divisions immediately on submission." },
      { title: "Gate 2: Human-in-the-Loop", desc: "Reviewing rubrics and scheduling runner queues before multi-agent execution.", isHighlighted: true },
      { title: "Gate 3: Standardized Configs", desc: "Applying dynamic naming schemas for clean Google Drive organization." }
    ],
    visualCue: "Three horizontal progression blocks with Success Green accent checkboxes.",
    speakerNotes: "Governance is the secret weapon of high-quality agencies. Benchmarking shows that elite agencies do not let AI run wild. They apply triage at intake, human approvals in the middle, and standardization at packaging."
  },
  {
    slideNumber: 9,
    headline: "The Path to Automated Integrity: A Unified Walkthrough System",
    category: "The Opportunity (Gap Analysis)",
    points: [
      { title: "Legacy State (Friction-Heavy)", desc: "Slow crawls, unverified submissions, naming inconsistency, and delayed alerts." },
      { title: "Target State (Integrity-Centered)", desc: "Cached catalog, triaged rubrics, Ops Center manager controls, and secure token alerting.", isHighlighted: true }
    ],
    visualCue: "Split two-column comparison grid. Left side slate gray (old way), right side gold (new way).",
    speakerNotes: "The new walkthrough system solves speed, governance, and alerting. The gap is closed. We moved from manual latency and unverified briefs to instant dashboards, rubrics, and automated alerts."
  },
  {
    slideNumber: 10,
    headline: "The 5-Stage Research Machine Walkthrough App",
    category: "Solution Framework",
    points: [
      { title: "1. Submission", desc: "Client submits brief via interactive portal." },
      { title: "2. AI Triage", desc: "Automatic classification, summary, and rubric creation." },
      { title: "3. Governance", desc: "Floating Ops Center manager approval drawer.", isHighlighted: true },
      { title: "4. Execution", desc: "Multi-agent research run and NotebookLM naming." },
      { title: "5. Delivery", desc: "Secure Gmail (Base64) & Telegram alerts, Google Drive sync." }
    ],
    visualCue: "Horizontal progress timeline line with 5 color-coded numbered nodes.",
    speakerNotes: "The 5 stages form a closed-loop system. This represents the pipeline map of our new Next.js route. It maps the intake, triage, human approval, execution, and delivery loops."
  },
  {
    slideNumber: 11,
    headline: "Ingestion & Triage: Instant Classification & Automated Rubric Creation",
    category: "Solution Deep Dive #1",
    points: [
      { title: "AI Improvement Loop", desc: "Submission triggers an automatic AI loop to classify the research division, write a catalog summary, and devise a custom quality rubric." },
      { title: "Client Directory Reuse", desc: "System checks for past history and groups new jobs inside the client's existing folder hierarchy automatically." }
    ],
    visualCue: "Two-panel split. Left column details features. Right column displays a JSON schema model representing the triaged brief.",
    speakerNotes: "At submission, briefs are automatically triaged. The client submits a brief. The backend runs an AI loop to generate a quality rubric and classification, registering it as pending."
  },
  {
    slideNumber: 12,
    headline: "HITL Governance: Floating Ops Center & Dynamic NotebookLM",
    category: "Solution Deep Dive #2",
    points: [
      { title: "Floating Ops Center", desc: "A glowing header button alerts managers to pending actions, opening a side drawer to dispatch runner queues.", isHighlighted: true },
      { title: "Dynamic NotebookLM Titles", desc: "Instruction templates programmatically extract brief headers to label books as '[Subject] — [JobId] — CIMedia Research'." }
    ],
    visualCue: "Two-column grid layout. Left lists UI controls, right details config fields.",
    speakerNotes: "Human oversight meets automated directory structuring. Managers review the AI rubric and click approve. The runner queue dispatches the job, creating a Google Notebook with a standardized title."
  },
  {
    slideNumber: 13,
    headline: "Delivery & Handoff: OAuth Gmail Alerting & Interactive Vercel Builds",
    category: "Solution Deep Dive #3",
    points: [
      { title: "Base64 Gmail Messaging", desc: "Dispatches direct system notifications to operators using OAuth credentials under secure RFC-2822 formatting." },
      { title: "Link Injection", desc: "Injects an 'Interactive Web Report' shortcut doc as the top file in the Google Drive folder.", isHighlighted: true },
      { title: "Telegram Sync", desc: "Simultaneously alerts Telegram channels on job completion." }
    ],
    visualCue: "Linear workflow flowchart from runner execution to email alert to Vercel build compilation.",
    speakerNotes: "Security-hardened alerting and multi-channel deliverables. Once complete, secure Gmail alerts are fired. The Vercel app updates, and a top-level link document is written directly into the client folder."
  },
  {
    slideNumber: 14,
    headline: "Fully Verified 3-Step Deployment Architecture",
    category: "Implementation Roadmap",
    points: [
      { title: "Phase 1: Environment", desc: "Gmail refresh token setup, agent.json dynamic configurations (100% COMPLETE)." },
      { title: "Phase 2: DB Sync", desc: "Local JSON database cataloging, submission AI loop triggers, manager endpoints (100% COMPLETE)." },
      { title: "Phase 3: Front-End", desc: "Client/Manager dashboards, floating Ops Center dispatch drawer (100% COMPLETE).", isHighlighted: true }
    ],
    visualCue: "Stage-by-stage progression list. Clean monospace names like /api/manager and /api/submit.",
    speakerNotes: "All components are verified and compile with zero errors. The build process was verified with npm run build. TypeScript checks passed with 0 errors in 18.6s, confirming build stability."
  },
  {
    slideNumber: 15,
    headline: "98% Latency Reduction and Zero-Leak Security Audit",
    category: "ROI Projection",
    points: [
      { title: "Latency Reduction", desc: "From 45.2 seconds down to 0.8 seconds (98% gain)." },
      { title: "Wasted Hours Saved", desc: "Bypassing manual configuration saves 15+ developer hours per week.", isHighlighted: true },
      { title: "Token Mitigation", desc: "HITL approval gate prevents duplicate runs, cutting redundant token costs by $45K/year." },
      { title: "Zero Leak Security", desc: "OAuth refresh flows secure sensitive API keys, eliminating hardcoded token variables." }
    ],
    visualCue: "Two-panel grid display with massive success-green indicators and percentages.",
    speakerNotes: "The investment results in faster speeds, lower costs, and zero risk. Local database syncing gives a 98% speedup. The HITL gate saves $45K in annual token waste by catching scoping errors before execution."
  },
  {
    slideNumber: 16,
    headline: "Mitigating Operational Failure Modes",
    category: "Risk Matrix",
    points: [
      { title: "API Token Burn", desc: "Risk: Concurrency run limits. Mitigation: Ops Center queues jobs sequentially." },
      { title: "OAuth Token Expiration", desc: "Risk: Expired credentials halt email alerts. Mitigation: Automatic refresh flows check tokens on alert.", isHighlighted: true },
      { title: "Database Sync Misses", desc: "Risk: Cache mismatch. Mitigation: Fallback crawler executes on registry error." }
    ],
    visualCue: "2x2 grid layout with thin, light-gray dividers and red/amber indicators.",
    speakerNotes: "Every operational risk has a built-in fallback. We analyzed potential failure modes including token exhaustion, credential expiration, database mismatch, and UI breaks."
  },
  {
    slideNumber: 17,
    headline: "Five Actions to Solidify CIMedia Operational Leadership",
    category: "Priority Recommendations",
    points: [
      { title: "1. Enforce HITL Gate", desc: "Mandate manager approval for all multi-agent research briefs." },
      { title: "2. Bypass Drive Crawls", desc: "Route history queries exclusively through the synchronized JSON database." },
      { title: "3. Lock Title Configurations", desc: "Ensure dynamic title extractors remain locked inside agent.json." },
      { title: "4. Monitor Refresh Tokens", desc: "Schedule automated token audits weekly to prevent alert dropouts." },
      { title: "5. Scale Walkthroughs", desc: "Include the interactive walkthrough link inside all new client onboarding folders." }
    ],
    visualCue: "Editorial left-aligned numbered list with elegant, bold serif numbers in Gold.",
    speakerNotes: "Immediate actions to capture the full value of the system. We recommend mandating the HITL gate, standardizing NotebookLM titles, auditing refresh tokens, and deploying the walkthrough link."
  },
  {
    slideNumber: 18,
    headline: "Operational Handoff Plan and Immediate Owners",
    category: "Next Steps",
    points: [
      { title: "Uptime Monitoring Setup", desc: "Verify OAuth token alert endpoints (Owner: Priya, Ops | Date: June 23, 2026)." },
      { title: "Onboarding Link Integration", desc: "Add walkthrough page to client folders (Owner: Grace, CS | Date: June 24, 2026)." },
      { title: "Token Auditing Routine", desc: "Establish monthly API cost audit reports (Owner: Tomoko, Finance | Date: July 1, 2026)." }
    ],
    visualCue: "A clean, structured table with thin gold grid lines.",
    speakerNotes: "Handoff steps are mapped to specific owners and dates. The roadmap defines three immediate milestones: setting up uptime checks, rolling out the client links, and auditing token costs."
  },
  {
    slideNumber: 19,
    headline: "Experience the Live Interactive Walkthrough Web App",
    category: "Thank You + CTA",
    points: [
      { title: "Interactive Walkthrough App", desc: "Access the walkthrough dashboard to run live simulations and inspect metrics." },
      { title: "Ops Center Portal", desc: "Review rubrics, dispatch queues, and watch real-time database JSON changes." },
      { title: "Schedule Review Call", desc: "Schedule a 30-minute review call this week." }
    ],
    visualCue: "Gold CTA card layout, CIMedia Logo bottom-right, large QR code placeholder.",
    speakerNotes: "The interactive URL is in your handoff pack. Scan the code to experience the mobile-first walkthrough app and test the sandbox. What questions do you have about the technical implementations?"
  }
];

/* ═══════════════════════════════════════════════════════════════
   REACT CLIENT MAIN ELEMENT
   ═══════════════════════════════════════════════════════════════ */

export default function WalkthroughPage() {
  const [activeTab, setActiveTab] = useState<"walkthrough" | "presentation" | "simulator" | "verification">("walkthrough");
  const [viewMode, setViewMode] = useState<"phone" | "fullscreen">("phone");

  // ── WALKTHROUGH STATE ──
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false
  });
  const [completedNodes, setCompletedNodes] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });

  const toggleNodeExpand = (step: number) => {
    setExpandedNodes(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const toggleNodeCompleted = (step: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedNodes(prev => ({ ...prev, [step]: !prev[step] }));
  };

  // Calculate timeline track fill percentage based on highest completed index
  const timelineFillPercentage = useMemo(() => {
    const total = 4;
    let highestIndex = 0;
    for (let i = 1; i <= total; i++) {
      if (completedNodes[i]) {
        highestIndex = i;
      }
    }
    if (highestIndex === 0) return 0;
    return ((highestIndex - 1) / (total - 1)) * 100;
  }, [completedNodes]);

  // ── PRESENTATION STATE ──
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const activeSlide = useMemo(() => SLIDES_DECK[currentSlideIndex], [currentSlideIndex]);

  const nextSlide = () => {
    setCurrentSlideIndex(prev => (prev + 1) % SLIDES_DECK.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex(prev => (prev - 1 + SLIDES_DECK.length) % SLIDES_DECK.length);
  };

  // ── SIMULATOR STATE MACHINE ──
  const [simSubject, setSimSubject] = useState("Machine Learning in Crop Yield Analysis");
  const [simJobId, setSimJobId] = useState("CIM-2026-902");
  
  const [simRunning, setSimRunning] = useState(false);
  const [simSteps, setSimSteps] = useState<Record<number, "idle" | "active" | "done">>({
    1: "idle",
    2: "idle",
    3: "idle",
    4: "idle"
  });

  const [simTitleText, setSimTitleText] = useState("Waiting for brief submission...");
  const [simDBText, setSimDBText] = useState("Status: None");
  const [simEmailText, setSimEmailText] = useState("No alert dispatched yet.");
  const [simOpsText, setSimOpsText] = useState("Awaiting manager inspection.");

  const [dbJSON, setDbJSON] = useState<any>({
    status: "idle",
    catalog: []
  });

  const [gmailAlert, setGmailAlert] = useState<{ show: boolean; subject: string; body: string }>({
    show: false,
    subject: "",
    body: ""
  });

  const [opsCenterOpen, setOpsCenterOpen] = useState(false);
  const [opsCenterHasAction, setOpsCenterHasAction] = useState(false);
  const [isJobApproved, setIsJobApproved] = useState(false);

  const resetSimulator = () => {
    setSimSteps({ 1: "idle", 2: "idle", 3: "idle", 4: "idle" });
    setSimTitleText("Waiting for brief submission...");
    setSimDBText("Status: None");
    setSimEmailText("No alert dispatched yet.");
    setSimOpsText("Awaiting manager inspection.");
    setDbJSON({ status: "idle", catalog: [] });
    setGmailAlert({ show: false, subject: "", body: "" });
    setOpsCenterHasAction(false);
    setIsJobApproved(false);
  };

  const runSimulation = () => {
    if (!simSubject || !simJobId) {
      alert("Please enter a research subject and Job ID.");
      return;
    }

    resetSimulator();
    setSimRunning(true);

    // Timeline logic delays
    // Step 1: Config (1.2s delay)
    setTimeout(() => {
      setSimSteps(prev => ({ ...prev, 1: "active" }));
      const createdTitle = `${simSubject} — ${simJobId} — CIMedia Research`;
      setSimTitleText(`Created Title:\n${createdTitle}`);
      setSimSteps(prev => ({ ...prev, 1: "done" }));

      // Step 2: DB Sync (2.2s delay)
      setTimeout(() => {
        setSimSteps(prev => ({ ...prev, 2: "active" }));
        setSimDBText(`Written to JSON index under pending_approval`);
        setDbJSON({
          status: "active_jobs",
          catalog: [
            {
              jobId: simJobId,
              subject: simSubject,
              title: createdTitle,
              status: "pending_approval",
              catalogSummary: "AI-generated classification: agricultural machine learning analysis model."
            }
          ]
        });
        setSimSteps(prev => ({ ...prev, 2: "done" }));

        // Step 3: Secure Gmail Alert (3.4s delay)
        setTimeout(() => {
          setSimSteps(prev => ({ ...prev, 3: "active" }));
          setSimEmailText("Secure base64-encoded RFC-2822 payload sent.");
          setSimSteps(prev => ({ ...prev, 3: "done" }));
          
          // Trigger email pop-up alert
          setGmailAlert({
            show: true,
            subject: "Research Request: pending_approval",
            body: `Brief ${simJobId} (${simSubject.substring(0, 20)}...) registered successfully. Awaiting manager approval.`
          });
          
          setTimeout(() => {
            setGmailAlert(prev => ({ ...prev, show: false }));
          }, 4500);

          // Step 4: Manager Approval Dashboard Request (4.6s delay)
          setTimeout(() => {
            setSimSteps(prev => ({ ...prev, 4: "active" }));
            setSimOpsText("Awaiting Manager Approval in Ops Center");
            setOpsCenterHasAction(true);
            setSimRunning(false);
          }, 1200);

        }, 1200);

      }, 1000);

    }, 1200);
  };

  const approveJobInOps = () => {
    if (simRunning) return;
    
    // Set variables
    setIsJobApproved(true);
    setOpsCenterHasAction(false);
    
    // Update DB
    setDbJSON({
      status: "active_jobs",
      catalog: [
        {
          jobId: simJobId,
          subject: simSubject,
          title: `${simSubject} — ${simJobId} — CIMedia Research`,
          status: "dispatched",
          catalogSummary: "AI-generated classification: agricultural machine learning analysis model."
        }
      ]
    });

    // Update Step 4 status
    setSimOpsText("Dispatched to dispatch-queue/ (Manager Approved)");
    setSimSteps(prev => ({ ...prev, 4: "done" }));

    // Show success dialog popup
    setGmailAlert({
      show: true,
      subject: "Job Dispatched to Runner Queue",
      body: `Brief ${simJobId} approved by manager and sent to research agent runner.`
    });

    setTimeout(() => {
      setGmailAlert(prev => ({ ...prev, show: false }));
    }, 4500);

    setOpsCenterOpen(false);
  };

  return (
    <div className="walkthrough-theme">
      {/* ── STYLING SYSTEM ── */}
      <style jsx global>{`
        :root {
          /* Local theme variables */
          --wt-bg: #FAF8F5;
          --wt-surface: #FFFFFF;
          --wt-raised: #F5F0E6;
          --wt-elevated: #ECE7DF;
          --wt-text-primary: #2A2724;
          --wt-text-secondary: #5E5750;
          --wt-text-muted: #8A8178;
          --wt-border: #ECE7DF;
          --wt-border-accent: #C1694F;

          /* Accent colors */
          --wt-terracotta: #C1694F;
          --wt-terracotta-bg: #FFF5F2;
          --wt-emerald: #2F6A6A;
          --wt-emerald-bg: #F0F7F7;
          --wt-amber: #C89E3A;
          --wt-amber-bg: #FCF8EE;
        }

        .walkthrough-theme {
          background-color: var(--wt-bg);
          color: var(--wt-text-primary);
          font-family: 'Schibsted Grotesk', system-ui, sans-serif;
          min-height: 100vh;
          width: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-x: hidden;
        }

        /* Desktop split container */
        .wt-desktop-shell {
          display: flex;
          width: 100%;
          max-width: 1200px;
          padding: 40px 20px;
          gap: 60px;
          align-items: center;
          justify-content: center;
        }

        .wt-info-panel {
          flex: 1;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .wt-brand-eyebrow {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--wt-terracotta);
        }

        .wt-info-panel h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 450;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          line-height: 1.15;
          color: var(--wt-text-primary);
          letter-spacing: -0.02em;
        }

        .wt-info-panel h1 em {
          font-style: italic;
          font-weight: 300;
          color: var(--wt-emerald);
        }

        .wt-info-panel p {
          font-size: 1.05rem;
          color: var(--wt-text-secondary);
          line-height: 1.6;
        }

        .wt-view-toggle-container {
          display: flex;
          gap: 12px;
          margin-top: 15px;
        }

        .wt-btn-toggle {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          color: var(--wt-text-secondary);
          padding: 10px 18px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.015);
        }

        .wt-btn-toggle.active {
          background: var(--wt-text-primary);
          border-color: var(--wt-text-primary);
          color: var(--wt-bg);
        }

        .wt-btn-toggle:hover:not(.active) {
          border-color: var(--wt-border-accent);
          color: var(--wt-text-primary);
          transform: translateY(-1px);
        }

        /* Device container frame */
        .wt-device-wrapper {
          position: relative;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-phone-frame {
          width: 390px;
          height: 844px;
          background-color: var(--wt-bg);
          border: 11px solid #1a1917;
          border-radius: 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 40px rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-status-bar {
          height: 44px;
          padding: 0 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--wt-text-primary);
          background: var(--wt-bg);
          z-index: 100;
          position: relative;
          user-select: none;
        }

        .wt-notch {
          width: 110px;
          height: 30px;
          background: #1a1917;
          border-radius: 20px;
          position: absolute;
          top: 7px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 101;
        }

        .wt-status-icons {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        /* Fullscreen View Overrides */
        .wt-fullscreen-mode .wt-phone-frame {
          width: 100vw;
          height: 100vh;
          max-width: 500px;
          max-height: 900px;
          border: none;
          border-radius: 0;
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }

        .wt-fullscreen-mode .wt-status-bar,
        .wt-fullscreen-mode .wt-notch {
          display: none;
        }

        /* Inside-Device App Shell */
        .wt-app-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .wt-app-header {
          background: var(--wt-bg);
          border-bottom: 1px solid var(--wt-border);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 90;
        }

        .wt-logo-group {
          display: flex;
          flex-direction: column;
        }

        .wt-logo-group .main {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--wt-text-primary);
          letter-spacing: -0.01em;
        }

        .wt-logo-group .sub {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 750;
          letter-spacing: 0.12em;
          color: var(--wt-text-secondary);
          margin-top: 1px;
        }

        /* Floating Ops Center header toggle */
        .wt-btn-ops-header {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--wt-terracotta-bg);
          border: 1px solid rgba(193, 105, 79, 0.2);
          color: var(--wt-terracotta);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-btn-ops-header.glowing {
          background: var(--wt-emerald-bg);
          border-color: rgba(47, 106, 106, 0.3);
          color: var(--wt-emerald);
          animation: wt-pulse-emerald 2s infinite ease-in-out;
        }

        @keyframes wt-pulse-emerald {
          0% { box-shadow: 0 0 0 0 rgba(47, 106, 106, 0.25); }
          70% { box-shadow: 0 0 0 8px rgba(47, 106, 106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(47, 106, 106, 0); }
        }

        .wt-ops-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: currentColor;
        }

        /* Scrollable Viewport */
        .wt-app-viewport {
          flex: 1;
          overflow-y: auto;
          background: var(--wt-bg);
          position: relative;
          display: flex;
          flex-direction: column;
          -webkit-overflow-scrolling: touch;
        }

        .wt-tab-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: wt-fade-slide 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes wt-fade-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wt-panel-intro h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.7rem;
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--wt-text-primary);
        }

        .wt-panel-intro p {
          font-size: 0.85rem;
          color: var(--wt-text-secondary);
          margin-top: 6px;
          line-height: 1.45;
        }

        /* Bottom Tab Bar */
        .wt-tab-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: var(--wt-surface);
          border-top: 1px solid var(--wt-border);
          height: 64px;
          z-index: 90;
        }

        .wt-tab-btn {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--wt-text-secondary);
          font-size: 0.65rem;
          font-weight: 600;
          gap: 4px;
          cursor: pointer;
          transition: color 0.2s ease;
          position: relative;
        }

        .wt-tab-btn.active {
          color: var(--wt-terracotta);
        }

        .wt-tab-btn svg {
          width: 18px;
          height: 18px;
          stroke-width: 2.2px;
          transition: transform 0.2s ease;
        }

        .wt-tab-btn.active svg {
          transform: scale(1.1);
        }

        .wt-tab-active-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--wt-terracotta);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── TAB 1: TIMELINE WALKTHROUGH ── */
        .wt-timeline {
          position: relative;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .wt-timeline-track {
          position: absolute;
          left: 19px;
          top: 15px;
          bottom: 25px;
          width: 2px;
          background-color: var(--wt-border);
          z-index: 1;
        }

        .wt-timeline-track-fill {
          position: absolute;
          left: 19px;
          top: 15px;
          width: 2px;
          background-color: var(--wt-emerald);
          z-index: 2;
          transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-timeline-node {
          display: flex;
          gap: 16px;
          position: relative;
          z-index: 3;
        }

        .wt-node-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--wt-surface);
          border: 2px solid var(--wt-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--wt-text-secondary);
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.01);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-timeline-node.completed .wt-node-dot {
          background: var(--wt-emerald-bg);
          border-color: var(--wt-emerald);
          color: var(--wt-emerald);
        }

        .wt-timeline-node.active .wt-node-dot {
          background: var(--wt-terracotta-bg);
          border-color: var(--wt-terracotta);
          color: var(--wt-terracotta);
        }

        .wt-node-card {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 18px;
          padding: 18px;
          flex: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .wt-node-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: transparent;
          transition: background-color 0.3s ease;
        }

        .wt-timeline-node.completed .wt-node-card::after {
          background-color: var(--wt-emerald);
        }

        .wt-timeline-node.active .wt-node-card::after {
          background-color: var(--wt-terracotta);
        }

        .wt-node-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.025);
          transform: translateY(-1px);
        }

        .wt-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .wt-step-tag {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--wt-text-muted);
        }

        .wt-status-pill {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .wt-status-pill.completed {
          background: var(--wt-emerald-bg);
          color: var(--wt-emerald);
        }

        .wt-status-pill.pending {
          background: var(--wt-terracotta-bg);
          color: var(--wt-terracotta);
        }

        .wt-card-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--wt-text-primary);
          line-height: 1.3;
        }

        .wt-card-desc {
          font-size: 0.82rem;
          color: var(--wt-text-secondary);
          line-height: 1.45;
        }

        .wt-expand-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--wt-emerald);
          margin-top: 4px;
        }

        .wt-expand-bar svg {
          width: 12px;
          height: 12px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-timeline-node.expanded .wt-expand-bar svg {
          transform: rotate(180deg);
        }

        .wt-node-details {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease-in-out;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wt-timeline-node.expanded .wt-node-details {
          max-height: 500px;
          margin-top: 10px;
          border-top: 1px dashed var(--wt-border);
          padding-top: 12px;
          overflow-y: auto;
        }

        .wt-detail-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--wt-text-primary);
        }

        .wt-code-block {
          background: var(--wt-raised);
          border: 1px solid var(--wt-border);
          border-radius: 10px;
          padding: 12px;
          font-family: var(--font-mono), monospace;
          font-size: 0.72rem;
          overflow-x: auto;
          white-space: pre-wrap;
          color: var(--wt-text-primary);
          line-height: 1.45;
        }

        .wt-code-comment { color: var(--wt-text-muted); font-style: italic; }
        .wt-code-keyword { color: var(--wt-terracotta); font-weight: 600; }
        .wt-code-string { color: var(--wt-emerald); }

        /* ── TAB 2: PRESENTATION VIEWER ── */
        .wt-slide-shell {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 480px;
          position: relative;
        }

        .wt-slide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--wt-border);
          padding-bottom: 12px;
        }

        .wt-slide-cat {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--wt-terracotta);
          letter-spacing: 0.1em;
        }

        .wt-slide-num {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--wt-text-muted);
        }

        .wt-slide-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          justify-content: center;
        }

        .wt-slide-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 500;
          line-height: 1.25;
          color: var(--wt-text-primary);
          letter-spacing: -0.01em;
        }

        .wt-slide-points {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 6px;
        }

        .wt-slide-point-item {
          background: var(--wt-bg);
          border: 1px solid var(--wt-border);
          border-radius: 12px;
          padding: 12px;
          transition: border-color 0.2s ease;
        }

        .wt-slide-point-item.highlighted {
          border-left: 3px solid var(--wt-terracotta);
          background: var(--wt-terracotta-bg);
        }

        .wt-slide-point-title {
          font-weight: 750;
          font-size: 0.8rem;
          color: var(--wt-text-primary);
          margin-bottom: 2px;
        }

        .wt-slide-point-desc {
          font-size: 0.78rem;
          color: var(--wt-text-secondary);
          line-height: 1.4;
        }

        .wt-slide-notes-box {
          background: var(--wt-raised);
          border: 1px solid var(--wt-border);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wt-slide-notes-title {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--wt-text-muted);
          letter-spacing: 0.05em;
        }

        .wt-slide-notes-text {
          font-size: 0.75rem;
          color: var(--wt-text-secondary);
          line-height: 1.45;
        }

        .wt-slide-cue-text {
          font-size: 0.72rem;
          color: var(--wt-emerald);
          font-style: italic;
          line-height: 1.4;
        }

        .wt-slide-nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .wt-slide-btn {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--wt-text-primary);
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.01);
        }

        .wt-slide-btn:hover {
          border-color: var(--wt-terracotta);
          color: var(--wt-terracotta);
        }

        /* ── TAB 3: SIMULATOR ── */
        .wt-sim-card {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.015);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .wt-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .wt-form-group label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--wt-text-muted);
          letter-spacing: 0.08em;
        }

        .wt-form-input {
          background: var(--wt-bg);
          border: 1px solid var(--wt-border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.88rem;
          color: var(--wt-text-primary);
          outline: none;
          transition: all 0.2s ease;
        }

        .wt-form-input:focus {
          border-color: var(--wt-terracotta);
          background: var(--wt-surface);
        }

        .wt-btn-primary {
          background: var(--wt-terracotta);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          padding: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(193, 105, 79, 0.15);
        }

        .wt-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(193, 105, 79, 0.25);
        }

        .wt-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .wt-sim-steps-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 5px;
        }

        .wt-sim-step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0.35;
          transition: opacity 0.3s ease;
        }

        .wt-sim-step-item.active {
          opacity: 1;
        }

        .wt-sim-step-item.done {
          opacity: 1;
        }

        .wt-sim-step-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--wt-raised);
          border: 1px solid var(--wt-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--wt-text-secondary);
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .wt-sim-step-item.active .wt-sim-step-badge {
          border-color: var(--wt-terracotta);
          background: var(--wt-terracotta-bg);
          color: var(--wt-terracotta);
        }

        .wt-sim-step-item.done .wt-sim-step-badge {
          border-color: var(--wt-emerald);
          background: var(--wt-emerald-bg);
          color: var(--wt-emerald);
        }

        .wt-sim-step-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .wt-sim-step-lbl {
          font-weight: 750;
          font-size: 0.78rem;
          color: var(--wt-text-secondary);
        }

        .wt-sim-step-item.active .wt-sim-step-lbl {
          color: var(--wt-text-primary);
        }

        .wt-sim-step-val {
          font-size: 0.72rem;
          color: var(--wt-text-muted);
          white-space: pre-wrap;
          margin-top: 2px;
          font-family: var(--font-mono), monospace;
        }

        /* DB Sandbox panel */
        .wt-db-sandbox {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wt-db-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .wt-db-title {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--wt-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wt-db-viewer {
          background: var(--wt-raised);
          border: 1px solid var(--wt-border);
          border-radius: 12px;
          padding: 12px;
          font-family: var(--font-mono), monospace;
          font-size: 0.72rem;
          color: var(--wt-text-primary);
          overflow-x: auto;
          max-height: 180px;
          line-height: 1.4;
        }

        /* ── TAB 4: VERIFICATION ── */
        .wt-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .wt-metric-card {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wt-metric-lbl {
          font-size: 0.65rem;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--wt-text-muted);
        }

        .wt-metric-val {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.8rem;
          font-weight: 500;
          color: var(--wt-text-primary);
        }

        .wt-metric-val span {
          font-size: 0.9rem;
          font-family: 'Schibsted Grotesk', sans-serif;
          color: var(--wt-text-secondary);
          margin-left: 2px;
        }

        .wt-metric-footer {
          font-size: 0.7rem;
          color: var(--wt-emerald);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 650;
          margin-top: 2px;
        }

        .wt-chart-card {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wt-chart-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .wt-chart-bar-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .wt-chart-lbl {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .wt-chart-badge {
          font-weight: 750;
          font-size: 0.72rem;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .wt-chart-badge.fast {
          background: var(--wt-emerald-bg);
          color: var(--wt-emerald);
        }

        .wt-chart-badge.slow {
          background: var(--wt-terracotta-bg);
          color: var(--wt-terracotta);
        }

        .wt-bar-bg {
          height: 10px;
          background: var(--wt-raised);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .wt-bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-bar-fill.fast {
          background: var(--wt-emerald);
          width: 4%;
        }

        .wt-bar-fill.slow {
          background: var(--wt-terracotta);
          width: 95%;
        }

        .wt-checklist-card {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.015);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .wt-check-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wt-check-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .wt-check-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--wt-emerald-bg);
          color: var(--wt-emerald);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wt-check-dot svg {
          width: 12px;
          height: 12px;
          stroke-width: 3px;
        }

        .wt-check-info {
          display: flex;
          flex-direction: column;
        }

        .wt-check-title {
          font-weight: 750;
          font-size: 0.82rem;
          color: var(--wt-text-primary);
        }

        .wt-check-sub {
          font-size: 0.75rem;
          color: var(--wt-text-secondary);
          margin-top: 1px;
        }

        /* ── MOCK SYSTEM POPUPS & DRAWER ── */
        .wt-gmail-popup {
          background: #FFFFFF;
          border: 1px solid var(--wt-border);
          border-left: 4px solid var(--wt-terracotta);
          border-radius: 12px;
          padding: 12px 14px;
          position: absolute;
          bottom: 80px;
          left: 20px;
          right: 20px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          transform: translateY(150%);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 150;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .wt-gmail-popup.show {
          transform: translateY(0);
          opacity: 1;
        }

        .wt-gmail-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--wt-terracotta-bg);
          color: var(--wt-terracotta);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wt-gmail-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .wt-gmail-sender {
          font-weight: 750;
          font-size: 0.75rem;
          color: var(--wt-text-primary);
        }

        .wt-gmail-sub {
          font-weight: 600;
          font-size: 0.72rem;
          color: var(--wt-terracotta);
        }

        .wt-gmail-body {
          font-size: 0.7rem;
          color: var(--wt-text-secondary);
          margin-top: 2px;
          line-height: 1.35;
        }

        /* Ops Center Modal Drawer Overlay */
        .wt-drawer-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26, 25, 23, 0.4);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .wt-drawer-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .wt-drawer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--wt-surface);
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -10px 32px rgba(0,0,0,0.06);
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1001;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 80%;
          overflow-y: auto;
        }

        .wt-drawer.open {
          transform: translateY(0);
        }

        .wt-drawer-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--wt-border);
          padding-bottom: 12px;
        }

        .wt-drawer-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--wt-text-primary);
        }

        .wt-drawer-title svg {
          color: var(--wt-terracotta);
        }

        .wt-btn-close-drawer {
          background: var(--wt-raised);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--wt-text-secondary);
          transition: all 0.2s ease;
        }

        .wt-btn-close-drawer:hover {
          background: var(--wt-elevated);
          color: var(--wt-text-primary);
        }

        .wt-ops-job-box {
          border: 1px solid var(--wt-border);
          background: var(--wt-raised);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wt-job-card-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .wt-job-card-title {
          font-weight: 750;
          font-size: 0.82rem;
          color: var(--wt-text-primary);
        }

        .wt-job-card-rubric {
          font-size: 0.75rem;
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          padding: 8px 10px;
          border-radius: 8px;
          color: var(--wt-text-secondary);
          line-height: 1.4;
        }

        .wt-job-actions {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .wt-btn-reject {
          background: var(--wt-surface);
          border: 1px solid var(--wt-border);
          color: var(--wt-text-secondary);
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wt-btn-reject:hover {
          border-color: var(--wt-terracotta);
          color: var(--wt-terracotta);
        }

        .wt-btn-approve {
          flex: 1;
          background: var(--wt-emerald);
          color: white;
          border: none;
          padding: 8px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(47, 106, 106, 0.15);
          transition: all 0.2s ease;
        }

        .wt-btn-approve:hover {
          box-shadow: 0 4px 10px rgba(47, 106, 106, 0.25);
        }

        .spinning {
          animation: wt-spin 1.2s linear infinite;
        }
        @keyframes wt-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="wt-desktop-shell">
        {/* ── LEFT COLUMN: DESKTOP INFO PANEL ── */}
        <div className="wt-info-panel">
          <span className="wt-brand-eyebrow">Aether Collective Design Panel</span>
          <h1>Interactive <em>Pipeline</em> Walkthrough & Sandbox</h1>
          <p>
            A premium, mobile-first design mockup illustrating the backend enhancements implemented in the <strong>CIMedia Research Machine v3.0</strong>.
          </p>
          <p>
            Use the bottom navigation within the simulated viewport to review accomplishments, browse the slide presentation deck, run live pipeline simulations, and verify build metrics.
          </p>
          
          <div className="wt-view-toggle-container">
            <button
              className={`wt-btn-toggle ${viewMode === "phone" ? "active" : ""}`}
              onClick={() => setViewMode("phone")}
            >
              <IconIphone className="w-4 h-4" /> Device Frame
            </button>
            <button
              className={`wt-btn-toggle ${viewMode === "fullscreen" ? "active" : ""}`}
              onClick={() => setViewMode("fullscreen")}
            >
              <IconMonitor className="w-4 h-4" /> Viewport Only
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: DEVICE SIMULATOR ── */}
        <div className={`wt-device-wrapper ${viewMode === "fullscreen" ? "wt-fullscreen-mode" : ""}`}>
          <div className="wt-phone-frame">
            
            {/* Status Bar Mockup */}
            <div className="wt-status-bar">
              <div>09:41</div>
              <div className="wt-notch" />
              <div className="wt-status-icons">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.13 19.57 10.53 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <rect x="2" y="17" width="3" height="3" rx="0.5" />
                  <rect x="7" y="13" width="3" height="7" rx="0.5" />
                  <rect x="12" y="9" width="3" height="11" rx="0.5" />
                  <rect x="17" y="5" width="3" height="15" rx="0.5" />
                </svg>
                <IconMail className="w-3 h-3" />
              </div>
            </div>

            {/* Main Application Shell Inside Phone */}
            <div className="wt-app-container">
              
              {/* Header */}
              <header className="wt-app-header">
                <div className="wt-logo-group">
                  <span className="main">CIMedia Ops</span>
                  <span className="sub">Pipeline Core</span>
                </div>

                {/* Floating Ops Control Button */}
                <button
                  className={`wt-btn-ops-header ${opsCenterHasAction ? "glowing" : ""}`}
                  onClick={() => setOpsCenterOpen(true)}
                >
                  <span className="wt-ops-dot" />
                  <span>{opsCenterHasAction ? "1 Action" : "0 Actions"}</span>
                </button>
              </header>

              {/* Viewport content */}
              <main className="wt-app-viewport">
                
                {/* ════════════════════════════════════════════════════════
                     TAB 1: TIMELINE WALKTHROUGH
                     ════════════════════════════════════════════════════════ */}
                {activeTab === "walkthrough" && (
                  <div className="wt-tab-panel">
                    <div className="wt-panel-intro">
                      <h2>Accomplishments</h2>
                      <p>Detailed breakdown of pipeline upgrades. Tap cards to inspect code, schemas, and specifications.</p>
                    </div>

                    <div className="wt-timeline">
                      {/* Timeline connecting track lines */}
                      <div className="wt-timeline-track" />
                      <div
                        className="wt-timeline-track-fill"
                        style={{ height: `${timelineFillPercentage}%` }}
                      />

                      {/* Timeline Node 1 */}
                      <div className={`wt-timeline-node ${completedNodes[1] ? "completed" : "active"} ${expandedNodes[1] ? "expanded" : ""}`}>
                        <div className="wt-node-dot" onClick={(e) => toggleNodeCompleted(1, e)}>
                          {completedNodes[1] ? <IconCheck className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="wt-node-card" onClick={() => toggleNodeExpand(1)}>
                          <div className="wt-card-meta">
                            <span className="wt-step-tag">Phase 01</span>
                            <span
                              className={`wt-status-pill ${completedNodes[1] ? "completed" : "pending"}`}
                              onClick={(e) => toggleNodeCompleted(1, e)}
                            >
                              {completedNodes[1] ? "Completed" : "Pending"}
                            </span>
                          </div>
                          <h3 className="wt-card-title">Dynamic NotebookLM Naming</h3>
                          <p className="wt-card-desc">
                            Modified agent configurations to programmatically structure NotebookLM labels based on brief headers.
                          </p>
                          <div className="wt-expand-bar">
                            <IconChevronDown className="w-3.5 h-3.5" />
                            <span>Inspect JSON Template</span>
                          </div>
                          <div className="wt-node-details">
                            <span className="wt-detail-title">Configuration Delta</span>
                            <pre className="wt-code-block">
                              <span className="wt-code-comment">// C:\Users\Augustus\.gemini\config\plugins\...</span>{"\n"}
                              {"{"}{"\n"}
                              {"  "}<span className="wt-code-keyword">"integration"</span>: <span className="wt-code-string">"Google NotebookLM"</span>,{"\n"}
                              {"  "}<span className="wt-code-keyword">"namingRules"</span>: {"{"}{"\n"}
                              {"    "}<span className="wt-code-keyword">"pattern"</span>: <span className="wt-code-string">"[Subject] — [JobId] — CIMedia Research"</span>,{"\n"}
                              {"    "}<span className="wt-code-keyword">"extractors"</span>: [<span className="wt-code-string">"headers.subject"</span>, <span className="wt-code-string">"headers.clientJobId"</span>]{"\n"}
                              {"  "}{"}"}{"\n"}
                              {"}"}
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Node 2 */}
                      <div className={`wt-timeline-node ${completedNodes[2] ? "completed" : "active"} ${expandedNodes[2] ? "expanded" : ""}`}>
                        <div className="wt-node-dot" onClick={(e) => toggleNodeCompleted(2, e)}>
                          {completedNodes[2] ? <IconCheck className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="wt-node-card" onClick={() => toggleNodeExpand(2)}>
                          <div className="wt-card-meta">
                            <span className="wt-step-tag">Phase 02</span>
                            <span
                              className={`wt-status-pill ${completedNodes[2] ? "completed" : "pending"}`}
                              onClick={(e) => toggleNodeCompleted(2, e)}
                            >
                              {completedNodes[2] ? "Completed" : "Pending"}
                            </span>
                          </div>
                          <h3 className="wt-card-title">Base64 RFC-2822 Gmail Alerts</h3>
                          <p className="wt-card-desc">
                            Integrated secure refresh tokens to dispatch direct system notifications to operators via raw HTTPS fetch.
                          </p>
                          <div className="wt-expand-bar">
                            <IconChevronDown className="w-3.5 h-3.5" />
                            <span>Inspect Gmail Utility</span>
                          </div>
                          <div className="wt-node-details">
                            <span className="wt-detail-title">src/lib/gmail.ts excerpt</span>
                            <pre className="wt-code-block">
                              <span className="wt-code-comment">// Base64 RFC-2822 formatting</span>{"\n"}
                              <span className="wt-code-keyword">const</span> rawMsg = [{"\n"}
                              {"  "}<span className="wt-code-string">`To: cimedia316@gmail.com`</span>,{"\n"}
                              {"  "}<span className="wt-code-string">`Subject: =?utf-8?B?`</span> + b64Sub + <span className="wt-code-string">`?=`</span>,{"\n"}
                              {"  "}<span className="wt-code-string">`Content-Type: text/html; charset=utf-8`</span>,{"\n"}
                              {"  "}<span className="wt-code-string">""</span>,{"\n"}
                              {"  "}htmlContent{"\n"}
                              ].join(<span className="wt-code-string">"\\n"</span>);{"\n"}{"\n"}
                              <span className="wt-code-keyword">const</span> encoded = btoa(rawMsg){"\n"}
                              {"  "}.replace(<span className="wt-code-keyword">/\\+/g</span>, <span className="wt-code-string">'-'</span>){"\n"}
                              {"  "}.replace(<span className="wt-code-keyword">/\\//g</span>, <span className="wt-code-string">'_'</span>);
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Node 3 */}
                      <div className={`wt-timeline-node ${completedNodes[3] ? "completed" : "active"} ${expandedNodes[3] ? "expanded" : ""}`}>
                        <div className="wt-node-dot" onClick={(e) => toggleNodeCompleted(3, e)}>
                          {completedNodes[3] ? <IconCheck className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="wt-node-card" onClick={() => toggleNodeExpand(3)}>
                          <div className="wt-card-meta">
                            <span className="wt-step-tag">Phase 03</span>
                            <span
                              className={`wt-status-pill ${completedNodes[3] ? "completed" : "pending"}`}
                              onClick={(e) => toggleNodeCompleted(3, e)}
                            >
                              {completedNodes[3] ? "Completed" : "Pending"}
                            </span>
                          </div>
                          <h3 className="wt-card-title">JSON Database Sync</h3>
                          <p className="wt-card-desc">
                            Syncing briefs directly to a centralized JSON catalogue instead of using expensive file crawls on Google Drive.
                          </p>
                          <div className="wt-expand-bar">
                            <IconChevronDown className="w-3.5 h-3.5" />
                            <span>Inspect DB Schema</span>
                          </div>
                          <div className="wt-node-details">
                            <span className="wt-detail-title">database.json Model</span>
                            <pre className="wt-code-block">
                              {"{"}{"\n"}
                              {"  "}<span className="wt-code-keyword">"jobs"</span>: [{"\n"}
                              {"    "}<span className="wt-code-keyword">"jobId"</span>: <span className="wt-code-string">"JOB-042"</span>,{"\n"}
                              {"    "}<span className="wt-code-keyword">"subject"</span>: <span className="wt-code-string">"AI Ethics Overview"</span>,{"\n"}
                              {"    "}<span className="wt-code-keyword">"status"</span>: <span className="wt-code-string">"pending_approval"</span>,{"\n"}
                              {"    "}<span className="wt-code-keyword">"catalogSummary"</span>: <span className="wt-code-string">"Overview of ethical models..."</span>{"\n"}
                              {"  "}{"}"}{"]"}{"\n"}
                              {"}"}
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Node 4 */}
                      <div className={`wt-timeline-node ${completedNodes[4] ? "completed" : "active"} ${expandedNodes[4] ? "expanded" : ""}`}>
                        <div className="wt-node-dot" onClick={(e) => toggleNodeCompleted(4, e)}>
                          {completedNodes[4] ? <IconCheck className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="wt-node-card" onClick={() => toggleNodeExpand(4)}>
                          <div className="wt-card-meta">
                            <span className="wt-step-tag">Phase 04</span>
                            <span
                              className={`wt-status-pill ${completedNodes[4] ? "completed" : "pending"}`}
                              onClick={(e) => toggleNodeCompleted(4, e)}
                            >
                              {completedNodes[4] ? "Completed" : "Pending"}
                            </span>
                          </div>
                          <h3 className="wt-card-title">Human-In-The-Loop Control</h3>
                          <p className="wt-card-desc">
                            Exposed Client & Manager dashboards with action toggles to review quality rubrics before queue dispatching.
                          </p>
                          <div className="wt-expand-bar">
                            <IconChevronDown className="w-3.5 h-3.5" />
                            <span>Inspect Dashboard Controllers</span>
                          </div>
                          <div className="wt-node-details">
                            <span className="wt-detail-title">Endpoint Route Handler</span>
                            <pre className="wt-code-block">
                              <span className="wt-code-comment">// src/app/api/manager/route.ts</span>{"\n"}
                              <span className="wt-code-keyword">export async function</span> POST(req) {"{"}{"\n"}
                              {"  "}<span className="wt-code-keyword">const</span> {"{"} jobId {"}"} = <span className="wt-code-keyword">await</span> req.json();{"\n"}
                              {"  "}<span className="wt-code-keyword">await</span> dispatchToAgentQueue(jobId);{"\n"}
                              {"  "}<span className="wt-code-keyword">await</span> updateJobStatus(jobId, <span className="wt-code-string">"dispatched"</span>);{"\n"}
                              {"  "}<span className="wt-code-keyword">return</span> NextResponse.json({"{"} success: <span className="wt-code-keyword">true</span> {"}"});{"\n"}
                              {"}"}
                            </pre>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                     TAB 2: PRESENTATION VIEWER
                     ════════════════════════════════════════════════════════ */}
                {activeTab === "presentation" && (
                  <div className="wt-tab-panel">
                    <div className="wt-panel-intro">
                      <h2>Executive Presentation</h2>
                      <p>Complete slide deconstruction from corporate-reporting. Swipe or click to present.</p>
                    </div>

                    <div className="wt-slide-shell">
                      <div className="wt-slide-header">
                        <span className="wt-slide-cat">{activeSlide.category}</span>
                        <span className="wt-slide-num">Slide {String(activeSlide.slideNumber).padStart(2, "0")} / 19</span>
                      </div>

                      <div className="wt-slide-body">
                        <h3 className="wt-slide-headline">{activeSlide.headline}</h3>

                        <div className="wt-slide-points">
                          {activeSlide.points.map((point, index) => (
                            <div key={index} className={`wt-slide-point-item ${point.isHighlighted ? "highlighted" : ""}`}>
                              <div className="wt-slide-point-title">{point.title}</div>
                              <div className="wt-slide-point-desc">{point.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="wt-slide-notes-box">
                        <span className="wt-slide-notes-title">Visual Presentation Cues</span>
                        <span className="wt-slide-cue-text">{activeSlide.visualCue}</span>
                        
                        <span className="wt-slide-notes-title" style={{ marginTop: "6px" }}>Speaker Notes</span>
                        <span className="wt-slide-notes-text">{activeSlide.speakerNotes}</span>
                      </div>
                    </div>

                    <div className="wt-slide-nav-bar">
                      <button className="wt-slide-btn" onClick={prevSlide} title="Previous Slide">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>

                      <div className="flex gap-1.5 justify-center flex-wrap max-w-[200px]" style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        {SLIDES_DECK.map((_, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            style={{ 
                              backgroundColor: idx === currentSlideIndex ? "var(--wt-terracotta)" : "var(--wt-elevated)",
                              width: idx === currentSlideIndex ? "16px" : "8px",
                              height: "8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          />
                        ))}
                      </div>

                      <button className="wt-slide-btn" onClick={nextSlide} title="Next Slide">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                     TAB 3: PIPELINE SIMULATOR
                     ════════════════════════════════════════════════════════ */}
                {activeTab === "simulator" && (
                  <div className="wt-tab-panel">
                    <div className="wt-panel-intro">
                      <h2>Pipeline Simulator</h2>
                      <p>Submit a mock brief, watch the stages execute in real-time, see local DB write, and approve via the Ops Drawer.</p>
                    </div>

                    {/* Ingestion Brief Form */}
                    <div className="wt-sim-card">
                      <div className="wt-form-group">
                        <label htmlFor="simSubject">Research Subject</label>
                        <input
                          id="simSubject"
                          type="text"
                          className="wt-form-input"
                          value={simSubject}
                          onChange={(e) => setSimSubject(e.target.value)}
                          disabled={simRunning}
                        />
                      </div>

                      <div className="wt-form-group">
                        <label htmlFor="simJobId">Client Job ID</label>
                        <input
                          id="simJobId"
                          type="text"
                          className="wt-form-input"
                          value={simJobId}
                          onChange={(e) => setSimJobId(e.target.value)}
                          disabled={simRunning}
                        />
                      </div>

                      <button
                        className="wt-btn-primary"
                        onClick={runSimulation}
                        disabled={simRunning}
                      >
                        {simRunning ? (
                          <>
                            <IconLoader className="w-4 h-4 spinning" />
                            <span>Processing Ingestion Loop...</span>
                          </>
                        ) : (
                          <>
                            <IconZap className="w-4 h-4" />
                            <span>Execute Submission</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step Execution Logs */}
                    <div className="wt-sim-card">
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--wt-text-primary)" }}>Active Processing Steps</h3>
                      
                      <div className="wt-sim-steps-list">
                        
                        {/* Sim Step 1 */}
                        <div className={`wt-sim-step-item ${simSteps[1] !== "idle" ? "active" : ""} ${simSteps[1] === "done" ? "done" : ""}`}>
                          <div className="wt-sim-step-badge">1</div>
                          <div className="wt-sim-step-info">
                            <span className="wt-sim-step-lbl">Dynamic Title Configuration</span>
                            <span className="wt-sim-step-val">{simTitleText}</span>
                          </div>
                        </div>

                        {/* Sim Step 2 */}
                        <div className={`wt-sim-step-item ${simSteps[2] !== "idle" ? "active" : ""} ${simSteps[2] === "done" ? "done" : ""}`}>
                          <div className="wt-sim-step-badge">2</div>
                          <div className="wt-sim-step-info">
                            <span className="wt-sim-step-lbl">Database Sync & Registry</span>
                            <span className="wt-sim-step-val">{simDBText}</span>
                          </div>
                        </div>

                        {/* Sim Step 3 */}
                        <div className={`wt-sim-step-item ${simSteps[3] !== "idle" ? "active" : ""} ${simSteps[3] === "done" ? "done" : ""}`}>
                          <div className="wt-sim-step-badge">3</div>
                          <div className="wt-sim-step-info">
                            <span className="wt-sim-step-lbl">Secure Gmail Alert Dispatch</span>
                            <span className="wt-sim-step-val">{simEmailText}</span>
                          </div>
                        </div>

                        {/* Sim Step 4 */}
                        <div className={`wt-sim-step-item ${simSteps[4] !== "idle" ? "active" : ""} ${simSteps[4] === "done" ? "done" : ""}`}>
                          <div className="wt-sim-step-badge">4</div>
                          <div className="wt-sim-step-info">
                            <span className="wt-sim-step-lbl">Human-in-the-Loop Governance</span>
                            <span className="wt-sim-step-val">{simOpsText}</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* DB JSON Sandbox */}
                    <div className="wt-db-sandbox">
                      <div className="wt-db-header">
                        <span className="wt-db-title">
                          <IconDatabase className="w-3.5 h-3.5" />
                          <span>research_machine_database.json</span>
                        </span>
                        <span className="wt-status-pill completed" style={{ fontSize: "0.6rem" }}>Healthy</span>
                      </div>
                      <pre className="wt-db-viewer">
                        {JSON.stringify(dbJSON, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                     TAB 4: VERIFICATION
                     ════════════════════════════════════════════════════════ */}
                {activeTab === "verification" && (
                  <div className="wt-tab-panel">
                    <div className="wt-panel-intro">
                      <h2>Build & Speed Metrics</h2>
                      <p>Audited performance benchmarks and typescript validation results for deployment stability.</p>
                    </div>

                    <div className="wt-metrics-grid">
                      <div className="wt-metric-card">
                        <span className="wt-metric-lbl">TypeScript Checks</span>
                        <div className="wt-metric-val">18.6<span>s</span></div>
                        <div className="wt-metric-footer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>0 Compilation Errors</span>
                        </div>
                      </div>

                      <div className="wt-metric-card">
                        <span className="wt-metric-lbl">Build Speed</span>
                        <div className="wt-metric-val">29.8<span>s</span></div>
                        <div className="wt-metric-footer">
                          <IconZap className="w-3.5 h-3.5" />
                          <span>Turbopack Enabled</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Card */}
                    <div className="wt-chart-card">
                      <h3 style={{ fontSize: "1.05rem", fontFamily: "Fraunces, serif", fontWeight: 500 }}>Catalogue Query Resolution</h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--wt-text-secondary)", lineHeight: 1.4 }}>
                        Comparison of direct local JSON database querying vs. recursive crawling of the Google Drive folder hierarchy.
                      </p>

                      <div className="wt-chart-bars">
                        {/* Bar 1 */}
                        <div className="wt-chart-bar-group">
                          <div className="wt-chart-lbl">
                            <span>Sync Database Query (New)</span>
                            <span className="wt-chart-badge fast">Instant (4.2ms)</span>
                          </div>
                          <div className="wt-bar-bg">
                            <div className="wt-bar-fill fast" />
                          </div>
                        </div>

                        {/* Bar 2 */}
                        <div className="wt-chart-bar-group">
                          <div className="wt-chart-lbl">
                            <span>Drive Folder Crawler (Old)</span>
                            <span className="wt-chart-badge slow">Slow (2450ms)</span>
                          </div>
                          <div className="wt-bar-bg">
                            <div className="wt-bar-fill slow" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checklist Card */}
                    <div className="wt-checklist-card">
                      <h3 style={{ fontSize: "1.05rem", fontFamily: "Fraunces, serif", fontWeight: 500 }}>Compiled Production Endpoints</h3>
                      <div className="wt-check-list">
                        
                        <div className="wt-check-item">
                          <div className="wt-check-dot"><IconCheck className="w-3 h-3" /></div>
                          <div className="wt-check-info">
                            <span className="wt-check-title">/api/client-jobs/route.ts</span>
                            <span className="wt-check-sub">Serves client history from cached JSON registry.</span>
                          </div>
                        </div>

                        <div className="wt-check-item">
                          <div className="wt-check-dot"><IconCheck className="w-3 h-3" /></div>
                          <div className="wt-check-info">
                            <span className="wt-check-title">/api/submit/route.ts</span>
                            <span className="wt-check-sub">Triggers cataloging & AI improvement loop.</span>
                          </div>
                        </div>

                        <div className="wt-check-item">
                          <div className="wt-check-dot"><IconCheck className="w-3 h-3" /></div>
                          <div className="wt-check-info">
                            <span className="wt-check-title">/api/manager/route.ts</span>
                            <span className="wt-check-sub">Facilitates POST approvals & rubrics retrieval.</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </main>

              {/* Bottom Tab Bar Switcher */}
              <nav className="wt-tab-bar">
                <button
                  className={`wt-tab-btn ${activeTab === "walkthrough" ? "active" : ""}`}
                  onClick={() => setActiveTab("walkthrough")}
                >
                  {activeTab === "walkthrough" && <div className="wt-tab-active-bar" />}
                  <IconCompass />
                  <span>Walkthrough</span>
                </button>

                <button
                  className={`wt-tab-btn ${activeTab === "presentation" ? "active" : ""}`}
                  onClick={() => setActiveTab("presentation")}
                >
                  {activeTab === "presentation" && <div className="wt-tab-active-bar" />}
                  <IconPresentation />
                  <span>Presentation</span>
                </button>

                <button
                  className={`wt-tab-btn ${activeTab === "simulator" ? "active" : ""}`}
                  onClick={() => setActiveTab("simulator")}
                >
                  {activeTab === "simulator" && <div className="wt-tab-active-bar" />}
                  <IconZap />
                  <span>Simulator</span>
                </button>

                <button
                  className={`wt-tab-btn ${activeTab === "verification" ? "active" : ""}`}
                  onClick={() => setActiveTab("verification")}
                >
                  {activeTab === "verification" && <div className="wt-tab-active-bar" />}
                  <IconActivity />
                  <span>Verification</span>
                </button>
              </nav>

            </div>

            {/* ── DRAWER OVERLAYS & ALERTS ── */}
            {/* Ops Center Drawer */}
            <div
              className={`wt-drawer-overlay ${opsCenterOpen ? "open" : ""}`}
              onClick={() => setOpsCenterOpen(false)}
            />
            
            <div className={`wt-drawer ${opsCenterOpen ? "open" : ""}`}>
              <div className="wt-drawer-hdr">
                <h3 className="wt-drawer-title">
                  <IconShieldAlert className="w-5 h-5" />
                  <span>Ops Center Portal</span>
                </h3>
                <button className="wt-btn-close-drawer" onClick={() => setOpsCenterOpen(false)}>
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--wt-text-secondary)", lineHeight: 1.4 }}>
                A waiting request has been captured in the pipeline database with state <code>pending_approval</code>. Review its details and dispatch to the runner queue.
              </p>

              {opsCenterHasAction ? (
                <div className="wt-ops-job-box">
                  <div className="wt-job-card-hdr">
                    <span className="wt-job-card-title">{simSubject} — {simJobId} — CIMedia Research</span>
                    <span className="wt-status-pill pending">Pending</span>
                  </div>
                  
                  <div className="wt-job-card-rubric">
                    <strong>AI Quality Rubric:</strong><br />
                    - Classification: Technical Analysis Brief<br />
                    - Accuracy requirement: HIGH (verify formulas)<br />
                    - Required outputs: Graph visualizations, data-schema documentation.
                  </div>

                  <div className="wt-job-actions">
                    <button className="wt-btn-reject" onClick={() => setOpsCenterOpen(false)}>Cancel</button>
                    <button className="wt-btn-approve" onClick={approveJobInOps}>
                      <IconCheck className="w-3.5 h-3.5 text-white" />
                      <span>Approve & Dispatch</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <div className="w-12 h-12 rounded-full bg-[#F0F7F7] text-[#2F6A6A] flex items-center justify-center" style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#F0F7F7", color: "#2F6A6A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconCheck className="w-6 h-6" />
                  </div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--wt-text-primary)", marginTop: "4px" }}>No Action Needed</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--wt-text-secondary)" }}>
                    {isJobApproved ? "The submitted brief was successfully approved and dispatched." : "Submit a brief in the Simulator tab to run the pipeline."}
                  </p>
                </div>
              )}
            </div>

            {/* Gmail Alert Card Popup */}
            <div className={`wt-gmail-popup ${gmailAlert.show ? "show" : ""}`}>
              <div className="wt-gmail-icon-box">
                <IconMail className="w-4 h-4" />
              </div>
              <div className="wt-gmail-content">
                <span className="wt-gmail-sender">System Mailer (cimedia316@gmail.com)</span>
                <span className="wt-gmail-sub">{gmailAlert.subject}</span>
                <span className="wt-gmail-body">{gmailAlert.body}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
