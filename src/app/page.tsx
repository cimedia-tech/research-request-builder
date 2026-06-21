"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import "./paywall.css";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ExpansionQuestion {
  id: string;
  question: string;
  type: "select" | "multiselect" | "text" | "scale";
  options?: string[];
  purpose: string;
  default?: string;
}

interface ExpansionData {
  detected_division: string;
  detected_topic: string;
  initial_assessment: string;
  expansion_questions: ExpansionQuestion[];
}

type Step = 1 | 2 | 3;

/* ═══════════════════════════════════════════════════════════════
   CONTOUR FIELD BACKGROUND — static topographic SVG
   ═══════════════════════════════════════════════════════════════ */

function ContourField() {
  // Pre-rendered organic contour lines resembling topographic elevation maps
  const paths = useMemo(() => {
    const lines: string[] = [];
    const seed = 42;
    for (let i = 0; i < 28; i++) {
      const yBase = (i / 28) * 100;
      const amplitude = 3 + (((seed * (i + 1) * 17) % 100) / 100) * 8;
      const freq = 0.8 + (((seed * (i + 1) * 31) % 100) / 100) * 1.2;
      const phase = ((seed * (i + 1) * 13) % 100) / 100 * Math.PI * 2;
      
      let d = `M -5 ${yBase}`;
      for (let x = 0; x <= 105; x += 2) {
        const y = yBase + 
          Math.sin((x * freq * 0.05) + phase) * amplitude +
          Math.sin((x * freq * 0.03) + phase * 1.5) * (amplitude * 0.6) +
          Math.cos((x * freq * 0.07) + phase * 0.7) * (amplitude * 0.3);
        d += ` L ${x} ${y.toFixed(2)}`;
      }
      lines.push(d);
    }
    return lines;
  }, []);

  return (
    <div className="contour-field" aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTOUR RING — sidebar progress SVG (6 concentric rings)
   ═══════════════════════════════════════════════════════════════ */

function ContourRing({ step, answeredCount, totalQuestions }: {
  step: Step;
  answeredCount: number;
  totalQuestions: number;
}) {
  const cx = 90;
  const cy = 90;
  const rings = [
    { r: 78, class: "ring-1" },
    { r: 66, class: "ring-2" },
    { r: 54, class: "ring-3" },
    { r: 42, class: "ring-4" },
    { r: 30, class: "ring-5" },
    { r: 18, class: "ring-6" },
  ];

  // Calculate how many rings to activate based on progress
  const getProgress = () => {
    if (step === 1) return 1;
    if (step === 2) {
      const questionProgress = totalQuestions > 0 ? answeredCount / totalQuestions : 0;
      return 1 + questionProgress * 4; // rings 1-5
    }
    return 6; // all rings for step 3
  };

  const progress = getProgress();

  return (
    <div className="contour-ring-container">
      <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        {rings.map((ring, i) => {
          const circumference = 2 * Math.PI * ring.r;
          const ringIndex = i + 1;
          const isCompleted = ringIndex <= Math.floor(progress);
          const isActive = ringIndex === Math.ceil(progress) && !isCompleted;
          const fillAmount = isCompleted 
            ? 1 
            : isActive 
              ? progress - Math.floor(progress) 
              : 0;
          const dashOffset = circumference * (1 - fillAmount);

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={ring.r}
              className={`contour-ring ${ring.class} ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ 
                transition: "stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          );
        })}
        {/* Center indicator */}
        <circle cx={cx} cy={cy} r="6" fill={step === 3 ? "#2A6B6B" : "#C1694F"} opacity="0.8">
          <animate
            attributeName="r"
            values="5;7;5"
            dur="3.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER LOGO SVG
   ═══════════════════════════════════════════════════════════════ */

function HeaderLogo() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Terrain contour icon */}
      <circle cx="16" cy="16" r="14" stroke="#C1694F" strokeWidth="1.2" opacity="0.4" />
      <circle cx="16" cy="16" r="10" stroke="#C1694F" strokeWidth="1" opacity="0.6" />
      <circle cx="16" cy="16" r="6" stroke="#C1694F" strokeWidth="0.8" opacity="0.8" />
      <circle cx="16" cy="16" r="2.5" fill="#C1694F" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUESTION CARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function QuestionCard({
  question,
  index,
  answer,
  onAnswer,
}: {
  question: ExpansionQuestion;
  index: number;
  answer: any;
  onAnswer: (id: string, value: string) => void;
}) {
  const answerStr = answer !== undefined && answer !== null ? String(answer) : "";
  const isAnswered = answerStr !== "";

  const handleMultiSelect = (option: string) => {
    const currentSelections = answerStr ? answerStr.split(", ").filter(Boolean) : [];
    const isSelected = currentSelections.includes(option);
    const newSelections = isSelected
      ? currentSelections.filter((s) => s !== option)
      : [...currentSelections, option];
    onAnswer(question.id, newSelections.join(", "));
  };

  return (
    <div className={`question-card ${isAnswered ? "answered" : ""}`}>
      <div className="question-card-number">Q{String(index + 1).padStart(2, "0")}</div>
      <div className="question-card-text">{question.question}</div>
      <div className="question-card-purpose">{question.purpose}</div>

      {question.type === "select" && question.options && (
        <select
          className="select-field"
          value={answerStr || String(question.default || "")}
          onChange={(e) => onAnswer(question.id, e.target.value)}
        >
          <option value="">Select an option</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {question.type === "multiselect" && question.options && (
        <div className="chip-group">
          {question.options.map((opt) => {
            const currentSelections = answerStr ? answerStr.split(", ").filter(Boolean) : [];
            const isSelected = currentSelections.includes(opt);
            return (
              <button
                key={opt}
                className={`chip ${isSelected ? "selected" : ""}`}
                onClick={() => handleMultiSelect(opt)}
                type="button"
              >
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "text" && (
        <input
          type="text"
          className="input-field"
          placeholder={question.default || "Type your answer..."}
          value={answerStr || ""}
          onChange={(e) => onAnswer(question.id, e.target.value)}
        />
      )}

      {question.type === "scale" && (
        <div>
          <input
            type="range"
            className="scale-slider"
            min="1"
            max="10"
            value={answerStr || String(question.default || "5")}
            onChange={(e) => onAnswer(question.id, e.target.value)}
          />
          <div className="scale-labels">
            <span>1 — Minimal</span>
            <span>{answerStr || String(question.default || "5")}</span>
            <span>10 — Maximum</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientDashboard({
  email,
  jobs,
  isLoading,
  onBack,
  onSelectJob
}: {
  email: string;
  jobs: any[];
  isLoading: boolean;
  onBack: () => void;
  onSelectJob: (job: any) => void;
}) {
  return (
    <div className="dashboard-view" style={{ animation: "emerge var(--dur-emerge) var(--ease-emerge)", color: "var(--text-primary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--terracotta)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Client Intelligence Portal</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--text-primary)", marginTop: "0.25rem" }}>Research Expedition Catalog</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Logged in as: <strong style={{ color: "var(--text-primary)" }}>{email}</strong></p>
        </div>
        <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }} onClick={onBack}>
          ← Back to Request Builder
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--text-secondary)" }}>
          <LoadingDots /> Loading your research portfolio...
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: "3rem", border: "1px dashed var(--border)", borderRadius: "8px", textAlign: "center", color: "var(--text-secondary)" }}>
          No research expeditions found for this email address yet.
          <br />
          <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={onBack}>
            Initiate First Research
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {jobs.map((job) => {
            const isCompleted = job.status === "completed";
            const isApproved = job.status === "approved";
            const statusColor = isCompleted ? "var(--success)" : isApproved ? "var(--teal-glow)" : "var(--warning)";
            const statusText = isCompleted ? "✓ Completed" : isApproved ? "⚡ Gathering Evidence" : "🚦 Awaiting Approval";

            return (
              <div
                key={job.jobId}
                style={{
                  padding: "1.5rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      ID: {job.jobId} · {new Date(job.createdTime).toLocaleDateString()}
                    </span>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.25rem" }}>
                      {job.topic}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: statusColor,
                      border: `1px solid ${statusColor}`,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(0,0,0,0.2)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {statusText}
                  </span>
                </div>

                <div style={{ padding: "0.75rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--terracotta)" }}>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.25rem" }}>
                    Executive Catalog Summary
                  </span>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                    {job.oneParagraphSummary || "No summary available."}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                    Type: <strong style={{ color: "var(--text-secondary)" }}>{job.researchType || "General Investigation"}</strong>
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                      onClick={() => onSelectJob(job)}
                    >
                      Inspect Brief
                    </button>
                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                      >
                        📁 Open Workspace
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ManagerDashboard({
  jobs,
  researchTypes,
  isLoading,
  onBack,
  onApprove,
  onSelectJob,
  isApprovingId
}: {
  jobs: any[];
  researchTypes: any[];
  isLoading: boolean;
  onBack: () => void;
  onApprove: (jobId: string) => void;
  onSelectJob: (job: any) => void;
  isApprovingId: string;
}) {
  const [activeTab, setActiveTab] = useState<"jobs" | "types">("jobs");

  return (
    <div className="dashboard-view" style={{ animation: "emerge var(--dur-emerge) var(--ease-emerge)", color: "var(--text-primary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--teal-glow)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Director Operations Control</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--text-primary)", marginTop: "0.25rem" }}>Research Machine Dashboard</h2>
        </div>
        <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }} onClick={onBack}>
          ← Back to Scoper
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem", paddingBottom: "0.5rem" }}>
        <button
          style={{
            background: "none",
            border: "none",
            color: activeTab === "jobs" ? "var(--teal-glow)" : "var(--text-tertiary)",
            borderBottom: activeTab === "jobs" ? "2px solid var(--teal-glow)" : "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem"
          }}
          onClick={() => setActiveTab("jobs")}
        >
          Research Jobs Catalog ({jobs.length})
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: activeTab === "types" ? "var(--teal-glow)" : "var(--text-tertiary)",
            borderBottom: activeTab === "types" ? "2px solid var(--teal-glow)" : "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem"
          }}
          onClick={() => setActiveTab("types")}
        >
          AI Research Types & Rubrics ({researchTypes.length})
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "var(--text-secondary)" }}>
          <LoadingDots /> Loading director operations data...
        </div>
      ) : activeTab === "jobs" ? (
        jobs.length === 0 ? (
          <div style={{ padding: "3rem", border: "1px dashed var(--border)", borderRadius: "8px", textAlign: "center", color: "var(--text-secondary)" }}>
            No research requests registered in database yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {jobs.map((job) => {
              const isCompleted = job.status === "completed";
              const isApproved = job.status === "approved";
              const isPending = job.status === "pending_approval";
              const statusColor = isCompleted ? "var(--success)" : isApproved ? "var(--teal-glow)" : "var(--warning)";
              const statusText = isCompleted ? "✓ Completed" : isApproved ? "⚡ Gathering Evidence" : "🚦 Pending Director Approval";

              return (
                <div
                  key={job.jobId}
                  style={{
                    padding: "1.5rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        ID: {job.jobId} · {new Date(job.timestamp).toLocaleString()}
                      </span>
                      <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.25rem" }}>
                        {job.topic}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        Requestor: <strong style={{ color: "var(--text-primary)" }}>{job.requestorName}</strong> ({job.requestorEmail})
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: statusColor,
                        border: `1px solid ${statusColor}`,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        background: "rgba(0,0,0,0.2)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", margin: "0.5rem 0" }}>
                    <div style={{ padding: "0.75rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--terracotta)" }}>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.25rem" }}>
                        AI Catalog Summary
                      </span>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                        {job.oneParagraphSummary || "No summary generated."}
                      </p>
                    </div>

                    <div style={{ padding: "0.75rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--teal-glow)" }}>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.25rem" }}>
                        Vetting Rubric (Quality Control)
                      </span>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0, whiteSpace: "pre-line" }}>
                        {job.rubric || "- Verify primary data sources\n- Review methodology"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                      Type: <strong style={{ color: "var(--text-secondary)" }}>{job.researchType || "General Investigation"}</strong>
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                        onClick={() => onSelectJob(job)}
                      >
                        Inspect Brief
                      </button>
                      {job.gdriveFolderLink && (
                        <a
                          href={job.gdriveFolderLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                        >
                          📁 Open Workspace
                        </a>
                      )}
                      {isPending && (
                        <button
                          className="btn-primary"
                          style={{ padding: "0.4rem 1rem", fontSize: "0.75rem", background: "var(--success)", borderColor: "var(--success)" }}
                          onClick={() => onApprove(job.jobId)}
                          disabled={isApprovingId === job.jobId}
                        >
                          {isApprovingId === job.jobId ? <LoadingDots /> : "⚡ Approve & Dispatch"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {researchTypes.map((type) => (
            <div
              key={type.name}
              style={{
                padding: "1.5rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-primary)" }}>{type.name}</h3>
                <span style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.3)", padding: "0.2rem 0.6rem", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  {type.count || 0} request(s)
                </span>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "1rem" }}>{type.description}</p>
              
              <div style={{ padding: "0.75rem", background: "var(--bg)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--teal)" }}>
                <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Continuous Quality Rubric (Refined by AI)
                </span>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                  {type.rubric}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ResearchRequestBuilder() {
  /* ── State ────────────────────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [researchQuestion, setResearchQuestion] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [expansionData, setExpansionData] = useState<ExpansionData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPrompt, setFinalPrompt] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [pastJobs, setPastJobs] = useState<any[]>([]);
  const [isLoadingPastJobs, setIsLoadingPastJobs] = useState(false);
  const [gdriveFolderLink, setGdriveFolderLink] = useState("");
  const [viewDashboard, setViewDashboard] = useState<"client" | "manager" | null>(null);
  const [allManagerJobs, setAllManagerJobs] = useState<any[]>([]);
  const [researchTypes, setResearchTypes] = useState<any[]>([]);
  const [isLoadingManagerData, setIsLoadingManagerData] = useState(false);
  const [isApprovingId, setIsApprovingId] = useState("");

  /* ── Toast ────────────────────────────────────────────────── */
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  /* ── Manager Backdoor ────────────────────────────────────── */
  // 1. URL param: ?access=VANTAGE_ADMIN_2026
  // 2. Keyboard: Shift+Ctrl+M anywhere on the page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessKey = params.get("access");
    if (accessKey === "VANTAGE_ADMIN_2026") {
      setIsManagerMode(true);
      // Clean the URL so the key isn't visible in screen shares
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }

    const emailParam = params.get("email");
    const jobIdParam = params.get("jobId");
    const payParam = params.get("pay");

    if (emailParam) {
      setSubmitterEmail(emailParam);
      
      if (jobIdParam) {
        setIsLoading(true);
        fetch(`/api/client-jobs?email=${encodeURIComponent(emailParam)}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.jobs) {
              const matchedJob = data.jobs.find((j: any) => j.jobId === jobIdParam);
              if (matchedJob) {
                const folderId = matchedJob.link ? matchedJob.link.split("/").pop() : "";
                return fetch(`/api/client-jobs/load?jobFolderId=${folderId}`)
                  .then(res => res.ok ? res.json() : null)
                  .then(briefData => {
                    if (briefData) {
                      setFinalPrompt(briefData.prompt);
                      setPreviewContent(briefData.preview);
                      setJobId(matchedJob.jobId);
                      setGdriveFolderLink(matchedJob.link);
                      setResearchQuestion(matchedJob.topic);
                      setCurrentStep(3);
                      showToast(`✓ Loaded research job: ${matchedJob.jobId}`);
                      
                      // Auto-trigger payment if pay=true is set
                      if (payParam === "true") {
                        setTimeout(() => {
                          const confirmed = window.confirm(
                            "This will simulate a $297 payment for the Full Research Package.\n\nIn production, this triggers Stripe Checkout.\n\nProceed?"
                          );
                          if (confirmed) {
                            setHasPaid(true);
                            showToast("✓ Payment confirmed — Full report package unlocked!");
                          }
                        }, 500);
                      }
                    }
                  });
              }
            }
          })
          .catch(err => {
            console.error("Error loading job from URL:", err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }

    const handleKeydown = (e: KeyboardEvent) => {
      // Shift + Ctrl + M = Manager mode toggle
      if (e.shiftKey && e.ctrlKey && e.key === "M") {
        setIsManagerMode((prev) => {
          const next = !prev;
          // Show a subtle console message (not a toast — avoid leaking in demos)
          console.log(`%c[Vantage] Manager mode ${next ? "ON" : "OFF"}`, "color: #C1694F; font-weight: bold;");
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [showToast]);

  /* ── Derived ──────────────────────────────────────────────── */
  const totalQuestions = Array.isArray(expansionData?.expansion_questions) ? expansionData.expansion_questions.length : 0;
  const answeredCount = Object.values(answers).filter((v) => v !== "").length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const fetchManagerData = useCallback(async () => {
    setIsLoadingManagerData(true);
    try {
      const res = await fetch("/api/manager");
      if (res.ok) {
        const data = await res.json();
        setAllManagerJobs(data.jobs || []);
        setResearchTypes(data.researchTypes || []);
      }
    } catch (err) {
      console.error("Failed to fetch manager data:", err);
    } finally {
      setIsLoadingManagerData(false);
    }
  }, []);

  const handleApproveJob = useCallback(async (jobId: string) => {
    setIsApprovingId(jobId);
    showToast("Approving and dispatching job...");
    try {
      const res = await fetch("/api/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        showToast("Job approved & dispatched to the 32-agent team!");
        fetchManagerData();
      } else {
        showToast("Failed to approve job.");
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast("Error approving job.");
    } finally {
      setIsApprovingId("");
    }
  }, [fetchManagerData, showToast]);

  useEffect(() => {
    if (isManagerMode) {
      fetchManagerData();
    }
  }, [isManagerMode, fetchManagerData]);

  // Look up client history when email changes
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submitterEmail)) {
      setPastJobs([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoadingPastJobs(true);
      try {
        const res = await fetch(`/api/client-jobs?email=${encodeURIComponent(submitterEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setPastJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Failed to fetch client history:", err);
      } finally {
        setIsLoadingPastJobs(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [submitterEmail]);

  // Load a selected past brief from Google Drive
  const handleSelectPastJob = useCallback(async (job: any) => {
    setIsLoading(true);
    showToast("Retrieving selected brief...");
    setSampleSent(false);
    setIsSendingSample(false);
    try {
      const folderId = job.folderId || (job.link ? job.link.split("/").pop() : "") || (job.gdriveFolderLink ? job.gdriveFolderLink.split("/").pop() : "");
      const res = await fetch(`/api/client-jobs/load?jobFolderId=${folderId}`);
      if (!res.ok) throw new Error("Failed to load brief data");
      const data = await res.json();
      
      setFinalPrompt(data.prompt);
      setPreviewContent(data.preview);
      setJobId(job.jobId);
      setGdriveFolderLink(job.link || job.gdriveFolderLink);
      setResearchQuestion(job.topic);
      setHasPaid(false);
      setCurrentStep(3);
    } catch (err) {
      console.error("Error loading selected job:", err);
      showToast("Failed to load the selected brief from Google Drive.");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /* ── Initialize default answers when expansion data arrives ─ */
  useEffect(() => {
    const questions = expansionData?.expansion_questions;
    if (Array.isArray(questions)) {
      const defaults: Record<string, string> = {};
      for (const q of questions) {
        if (q.default !== undefined && q.default !== null) {
          defaults[q.id] = String(q.default);
        } else if (q.type === "scale") {
          defaults[q.id] = "5";
        } else {
          defaults[q.id] = "";
        }
      }
      setAnswers(defaults);
    }
  }, [expansionData]);

  /* ── API: Expand question → follow-ups ────────────────────── */
  const handleExpand = useCallback(async () => {
    if (!researchQuestion.trim()) {
      showToast("Please enter a research question.");
      return;
    }
    if (!submitterName.trim()) {
      showToast("Please enter your name.");
      const nameInput = document.querySelector('input[placeholder="E.g., Jane Doe"]') as HTMLInputElement;
      if (nameInput) nameInput.focus();
      return;
    }
    if (!submitterEmail.trim()) {
      showToast("Please enter your email.");
      const emailInput = document.querySelector('input[placeholder="E.g., jane@example.com"]') as HTMLInputElement;
      if (emailInput) emailInput.focus();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(submitterEmail.trim())) {
      showToast("Please enter a valid email address.");
      const emailInput = document.querySelector('input[placeholder="E.g., jane@example.com"]') as HTMLInputElement;
      if (emailInput) emailInput.focus();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "expand", question: researchQuestion }),
      });

      if (!res.ok) throw new Error("API error");

      const data: ExpansionData = await res.json();
      setExpansionData(data);
      setCurrentStep(2);
    } catch (err) {
      console.error("Expand error:", err);
      showToast("Failed to analyze research question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [researchQuestion, submitterName, submitterEmail, showToast]);

  /* ── API: Build final prompt ──────────────────────────────── */
  const handleBuildPrompt = useCallback(async () => {
    if (!allAnswered) {
      showToast("Please answer all follow-up questions first.");
      return;
    }

    setIsLoading(true);

    try {
      const formattedAnswers: Record<string, string> = {};
      const questions = expansionData?.expansion_questions;
      if (Array.isArray(questions)) {
        for (const q of questions) {
          formattedAnswers[q.question] = answers[q.id] || q.default || "";
        }
      }

      const res = await fetch("/api/expand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "build",
          question: researchQuestion,
          answers: formattedAnswers,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setFinalPrompt(data.prompt);
      setPreviewContent(data.preview);
      setCurrentStep(3);
    } catch (err) {
      console.error("Build error:", err);
      showToast("Failed to build research brief. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [allAnswered, answers, expansionData, researchQuestion, showToast]);

  /* ── Answer handler ───────────────────────────────────────── */
  const handleAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  /* ── Copy to clipboard ───────────────────────────────────── */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(finalPrompt);
      showToast("Copied to clipboard");
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = finalPrompt;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast("Copied to clipboard");
    }
  }, [finalPrompt, showToast]);

  /* ── Download as .md ──────────────────────────────────────── */
  const handleDownload = useCallback(() => {
    const blob = new Blob([finalPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-brief-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded research brief");
  }, [finalPrompt, showToast]);

  /* ── Start new request ────────────────────────────────────── */
  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setResearchQuestion("");
    setSubmitterName("");
    setSubmitterEmail("");
    setExpansionData(null);
    setAnswers({});
    setFinalPrompt("");
    setPreviewContent("");
    setHasPaid(false);
    setJobId("");
    setIsSubmitting(false);
    setGdriveFolderLink("");
    setPastJobs([]);
    setSampleSent(false);
    setIsSendingSample(false);
    // Note: isManagerMode persists across resets intentionally
  }, []);

  /* ── Payment / preview state ──────────────────────────────── */
  const [hasPaid, setHasPaid] = useState(false);
  const [jobId, setJobId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingSample, setIsSendingSample] = useState(false);
  const [sampleSent, setSampleSent] = useState(false);

  /* ── Simulate payment (Stripe will replace this) ──────────── */
  const handlePayment = useCallback(async () => {
    // TODO: Replace with real Stripe Checkout session creation
    // For now, simulate a payment confirmation dialog
    const confirmed = window.confirm(
      "This will simulate a $297 payment for the Full Research Package.\n\nIn production, this triggers Stripe Checkout.\n\nProceed?"
    );
    if (!confirmed) return;
    setHasPaid(true);
    showToast("✓ Payment confirmed — Full report package unlocked!");
  }, [showToast]);

  /* ── Submit to Research Machine ───────────────────────────── */
  const handleSubmit = useCallback(async () => {
    if (!finalPrompt || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          preview: previewContent,
          division: expansionData?.detected_division,
          question: researchQuestion,
          name: submitterName,
          email: submitterEmail,
          answers: answers,
          questions: expansionData?.expansion_questions || [],
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();
      setJobId(data.jobId);
      if (data.gdriveFolderLink) {
        setGdriveFolderLink(data.gdriveFolderLink);
      }
      showToast(`✓ Submitted! Job ID: ${data.jobId} — Research Machine activated.`);
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [finalPrompt, expansionData, researchQuestion, submitterName, submitterEmail, answers, previewContent, isSubmitting, showToast]);

  /* ── Deliver Sample Brief via Email ──────────────────────── */
  const handleDeliverSample = useCallback(async () => {
    if (!submitterEmail || !jobId || isSendingSample) return;
    setIsSendingSample(true);
    try {
      const res = await fetch("/api/deliver-sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submitterEmail,
          name: submitterName || "Valued Client",
          jobId: jobId,
          topic: researchQuestion,
          sampleContent: previewContent || "No preview content generated."
        })
      });
      if (res.ok) {
        setSampleSent(true);
        showToast("✓ Sample report delivered to your email!");
      } else {
        throw new Error("Failed to deliver sample email");
      }
    } catch (err) {
      console.error("Error delivering sample:", err);
      showToast("Failed to deliver sample email. Please try again.");
    } finally {
      setIsSendingSample(false);
    }
  }, [submitterEmail, submitterName, jobId, researchQuestion, previewContent, isSendingSample, showToast]);

  /* ── Step label for sidebar ───────────────────────────────── */
  const stepLabels: Record<Step, string> = {
    1: "Terrain Survey",
    2: "Refining Coordinates",
    3: "Expedition Brief Ready",
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <>
      <ContourField />

      <div className="expedition-layout">
        {/* ── Header ──────────────────────────────────────────── */}
        <header className="expedition-header">
          <div className="header-brand">
            <div className="header-logo">
              <HeaderLogo />
            </div>
            <span className="header-title">
              <strong>Vantage</strong> Intelligence Group
            </span>
          </div>
          <div className="header-status">
            {isManagerMode && (
              <button
                onClick={() => setViewDashboard((prev) => (prev === "manager" ? null : "manager"))}
                style={{
                  marginRight: "1rem",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                  background: "var(--teal)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--teal-glow)",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.2s",
                }}
              >
                {viewDashboard === "manager" ? "Close Ops Control" : "🛠️ Ops Control"}
              </button>
            )}
            <span className="status-dot" />
            <span>v3.0 — 32 agents online</span>
          </div>
        </header>

        {/* ── Mobile Progress Bar ─────────────────────────────── */}
        <div className="mobile-progress">
          <div className="mobile-progress-bar">
            <div className={`mobile-progress-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "done" : ""}`} />
            <div className={`mobile-progress-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "done" : ""}`} />
            <div className={`mobile-progress-step ${currentStep >= 3 ? "active" : ""}`} />
          </div>
          <div className="mobile-progress-label">{stepLabels[currentStep]}</div>
        </div>

        {/* ── Main Content ────────────────────────────────────── */}
        <main className="expedition-main">
          {viewDashboard === "client" ? (
            <ClientDashboard
              email={submitterEmail}
              jobs={pastJobs}
              isLoading={isLoadingPastJobs}
              onBack={() => setViewDashboard(null)}
              onSelectJob={handleSelectPastJob}
            />
          ) : viewDashboard === "manager" ? (
            <ManagerDashboard
              jobs={allManagerJobs}
              researchTypes={researchTypes}
              isLoading={isLoadingManagerData}
              onBack={() => setViewDashboard(null)}
              onApprove={handleApproveJob}
              onSelectJob={handleSelectPastJob}
              isApprovingId={isApprovingId}
            />
          ) : (
            <>
              {/* ──────── STEP 1: Research Question Input ──────── */}
          <section
            className={`step-section ${currentStep > 1 ? "completed" : ""}`}
            style={{ display: currentStep >= 1 ? "block" : "none" }}
          >
            {currentStep === 1 && (
              <>
                <h1 className="step-hero-text">
                  The Research Machine™
                </h1>
                <h3 style={{ fontSize: "var(--text-lg)", color: "var(--accent-counter)", marginBottom: "1rem", fontFamily: "Georgia, serif" }}>
                  Intelligence Engineered for Decision Makers
                </h3>
                <p className="step-subtitle">
                  Ask a question. Receive an executive-grade intelligence brief complete with BLUF findings, strategic analysis, actionable recommendations, and ROI-focused insights.
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                  Built by <strong>Vantage Intelligence Group</strong>.
                </p>

                <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label" style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Your Name</label>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: "100%", padding: "0.75rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}
                    placeholder="E.g., Jane Doe"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label" style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Your Email</label>
                  <input
                    type="email"
                    className="input-field"
                    style={{ width: "100%", padding: "0.75rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}
                    placeholder="E.g., jane@example.com"
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  {isLoadingPastJobs && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <LoadingDots /> Checking client history...
                    </div>
                  )}
                </div>

                {pastJobs.length > 0 && (
                  <div className="past-jobs-container" style={{ margin: "1.5rem 0", padding: "1.25rem", border: "1px dashed var(--border-active)", borderRadius: "8px", background: "var(--bg-raised)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", margin: 0, fontWeight: 600 }}>
                        📁 Existing Research Briefs Found
                      </h3>
                      <button
                        onClick={() => setViewDashboard("client")}
                        style={{
                          background: "var(--teal)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--teal-glow)",
                          fontSize: "0.7rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        type="button"
                      >
                        📂 Open Dashboard Catalog
                      </button>
                    </div>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: "1.4" }}>
                      We found {pastJobs.length} existing research brief(s) under this email. Select one to proceed to checkout/preview, or continue below to build a new request.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {pastJobs.map((job) => (
                        <div key={job.jobId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxWidth: "70%" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.topic}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ID: {job.jobId} · {new Date(job.createdTime).toLocaleDateString()}</span>
                          </div>
                          <button
                            className="btn-ghost"
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderColor: "var(--accent-counter)", color: "var(--accent-counter)", background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
                            onClick={() => handleSelectPastJob(job)}
                            type="button"
                          >
                            Load Brief →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="input-label" style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Research Question</label>
                  <textarea
                    className="research-input"
                    placeholder="What do you want to research?"
                    value={researchQuestion}
                    onChange={(e) => setResearchQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) handleExpand();
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="btn-group">
                  <button
                    className="btn-primary"
                    onClick={handleExpand}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <LoadingDots />
                        Charting terrain...
                      </>
                    ) : (
                      <>Chart This Territory →</>
                    )}
                  </button>
                </div>

                {isLoading && (
                  <div className="loading-terrain">
                    <div className="loading-bar" />
                    <span className="loading-text">
                      Analyzing research question with AI...
                    </span>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ──────── STEP 2: Follow-up Questions ─────────── */}
          {currentStep >= 2 && expansionData && (
            <section
              className={`step-section ${currentStep > 2 ? "completed" : ""}`}
            >
              {currentStep === 2 && (
                <>
                  {/* Assessment */}
                  <div className="division-badge">
                    <span className="division-badge-dot" />
                    {expansionData.detected_division}
                  </div>

                  <h2 className="step-section-header">Refining the Terrain</h2>
                  <p className="step-section-desc">
                    {expansionData.initial_assessment}
                  </p>

                  {/* Answer progress */}
                  <div className="answer-progress">
                    <span className="answer-progress-count">
                      {answeredCount}/{totalQuestions}
                    </span>
                    <span>questions answered</span>
                    <div style={{ flex: 1 }}>
                      <div className="completeness-track">
                        <div
                          className="completeness-fill"
                          style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question cards */}
                  <div>
                    {Array.isArray(expansionData.expansion_questions) && expansionData.expansion_questions.map((q, i) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={i}
                        answer={answers[q.id] || ""}
                        onAnswer={handleAnswer}
                      />
                    ))}
                  </div>

                  <div className="btn-group">
                    <button
                      className="btn-primary"
                      onClick={handleBuildPrompt}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <LoadingDots />
                          Building brief...
                        </>
                      ) : (
                        <>Build Research Brief →</>
                      )}
                    </button>
                    <button className="btn-ghost" onClick={handleReset}>
                      ← Start over
                    </button>
                  </div>

                  {isLoading && (
                    <div className="loading-terrain">
                      <div className="loading-bar" />
                      <span className="loading-text">
                        Constructing your research expedition brief...
                      </span>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* ──────── STEP 3: Final Prompt Output ─────────── */}
          {currentStep === 3 && finalPrompt && (
            <section className="step-section">
              <h2 className="step-section-header">
                Your Research Expedition Brief
              </h2>
              <p className="step-section-desc">
                Your precision-engineered research brief is ready. Copy it
                directly into the Research Machine™.
              </p>

              {/* Division + Completeness */}
              {expansionData && (
                <>
                  <div className="division-badge">
                    <span className="division-badge-dot" />
                    {expansionData.detected_division} Division
                  </div>
                  <div className="completeness-bar">
                    <span className="completeness-label">Prompt completeness</span>
                    <div className="completeness-track">
                      <div
                        className="completeness-fill"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <span className="completeness-label">100%</span>
                  </div>
                </>
              )}

              {/* Prompt output */}
              <div className="prompt-output">
                <div className="prompt-output-header">
                  <span className="prompt-output-header-label">
                    Research Engagement Brief — {expansionData?.detected_topic}
                  </span>
                  <button className="btn-ghost" onClick={handleCopy}>
                    <CopyIcon /> Copy
                  </button>
                </div>
                <div className="prompt-output-body">{finalPrompt}</div>
              </div>

              {/* Actions */}
              <div className="prompt-actions">
                <button className="btn-primary" onClick={handleCopy}>
                  <CopyIcon />
                  Copy to Clipboard
                </button>
                <button className="btn-secondary" onClick={handleDownload}>
                  <DownloadIcon />
                  Download as .md
                </button>
                <button className="btn-ghost" onClick={handleReset}>
                  Start New Request
                </button>
              </div>

              {/* ── Submit to Research Machine ─────────────────── */}
              <div className="submit-section">
                <button
                  className="btn-submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !!jobId}
                >
                  {isSubmitting ? (
                    <><LoadingDots /> Dispatching...</>
                  ) : jobId ? (
                    <>✓ Dispatched</>
                  ) : (
                    <>⚡ Submit to Research Machine</>
                  )}
                </button>
                {jobId ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <span className="submit-job-id">Job {jobId}</span>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                      {gdriveFolderLink && (
                        <a
                          href={gdriveFolderLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                        >
                          📁 Open Google Drive Folder
                        </a>
                      )}
                      <button
                        onClick={handleDeliverSample}
                        disabled={isSendingSample || sampleSent}
                        className="btn-secondary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.8rem", cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-raised)", color: "var(--text-primary)", borderRadius: "4px" }}
                      >
                        {isSendingSample ? "⏳ Delivering..." : sampleSent ? "✓ Sample Delivered!" : "📧 Email Sample Report"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="submit-status">Sends brief directly to the 32-agent research team via Telegram</span>
                )}
              </div>

              {/* ── Preview / Paywall Section ──────────────────── */}
              <div className="preview-section">
                <div className="preview-section-header">
                  <div className="preview-section-eyebrow">What you&apos;ll receive</div>
                  <h2 className="preview-section-title">Your Full Research Package</h2>
                  <p className="preview-section-subtitle">
                    Your research brief has been engineered. Below is a preview of the 9-deliverable package the Research Machine will produce — unlock the full package to receive every asset.
                  </p>
                </div>

                {/* Asset Grid */}
                <div className="asset-grid">
                  {[
                    { icon: "📄", cls: "report", name: "Full Research Report", desc: "15-25 page evidence-based analysis with citations", free: true },
                    { icon: "⚡", cls: "brief", name: "Executive Brief", desc: "1-page board-level decision memo", free: true },
                    { icon: "📊", cls: "data", name: "Data Tables", desc: "Standalone statistics and key metrics reference", free: false },
                    { icon: "🔧", cls: "solutions", name: "AI Solutions Framework", desc: "Implementation specs with ROI estimates", free: false },
                    { icon: "🌐", cls: "web", name: "Interactive Web Report", desc: "Premium site deployed to Vercel", free: false },
                    { icon: "📓", cls: "notebook", name: "NotebookLM Notebook", desc: "AI-powered source companion with 5-15 sources", free: false },
                  ].map((asset) => (
                    <div
                      key={asset.name}
                      className={`asset-card ${!asset.free && !hasPaid ? "asset-card--locked" : ""}`}
                    >
                      <span className={`asset-card-badge ${asset.free ? "asset-card-badge--free" : "asset-card-badge--locked"}`}>
                        {asset.free ? "Preview" : hasPaid ? "✓ Unlocked" : "Locked"}
                      </span>
                      <div className={`asset-card-icon asset-card-icon--${asset.cls}`}>{asset.icon}</div>
                      <div className="asset-card-name">{asset.name}</div>
                      <div className="asset-card-desc">{asset.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Sample Preview */}
                <div className="sample-preview">
                  <div className="sample-preview-header">
                    <span className="sample-preview-title">📄 Tailored Expedition Outline</span>
                    <span className="sample-preview-meta">Free Initial Analysis & Agent Alignment</span>
                  </div>
                  <div className="sample-preview-body" style={{ maxHeight: "450px", overflowY: "auto", position: "relative", padding: "1.5rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                    <div className="preview-markdown" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-wrap", textAlign: "left", fontFamily: "var(--font-body)" }}>
                      {previewContent || `EXECUTIVE BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vantage Intelligence Group — The Research Machine™
Topic: ${expansionData?.detected_topic || researchQuestion.slice(0, 60)}
Division: ${expansionData?.detected_division || "Pending"}
Classification: Research Engagement Brief
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOTTOM LINE UP FRONT
${expansionData?.initial_assessment || "The Research Machine will transform your question into a comprehensive, evidence-based research engagement using 32+ specialized agents across 7 operational layers."}

KEY FINDINGS PREVIEW
• Root cause analysis across 6 analytical dimensions
• Benchmarking against top-performing peer institutions
• AI & intelligent machine solution recommendations
• Phased implementation roadmap with ROI projections
• Risk matrix with mitigation strategies

[FULL REPORT CONTINUES — UNLOCK TO ACCESS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}
                    </div>
                    {!(hasPaid || isManagerMode) && (
                      <div className="sample-preview-locked" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-surface) 90%)" }}>
                        <span className="sample-preview-locked-label">🔒 Complete 9-Asset Deliverable Stack Locked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paywall CTA or Success State */}
                {isManagerMode ? (
                  <div className="paywall-cta" style={{ borderColor: "var(--accent-counter)", background: "oklch(0.45 0.07 195 / 0.06)" }}>
                    <div className="paywall-cta-left">
                      <div className="paywall-cta-badge" style={{ color: "var(--accent-counter)" }}>👁 Manager Preview Mode</div>
                      <h3 className="paywall-cta-title">Full Package — Manager View</h3>
                      <p className="paywall-cta-desc">
                        You are viewing all 9 deliverables as a manager. Customers see a locked paywall at $297. Press <kbd style={{fontFamily:"var(--font-mono)",fontSize:"0.7rem",padding:"0.1rem 0.4rem",background:"var(--bg-raised)",borderRadius:"4px",border:"1px solid var(--border-active)"}}>Shift+Ctrl+M</kbd> to toggle this view.
                      </p>
                    </div>
                    <div className="paywall-cta-right">
                      <div className="paywall-price">
                        <div className="paywall-price-amount" style={{ color: "var(--accent-counter)" }}>$297</div>
                        <div className="paywall-price-label">customer price · all deliverables</div>
                      </div>
                      <button className="btn-submit" onClick={() => setIsManagerMode(false)}>
                        Exit Manager View
                      </button>
                    </div>
                  </div>
                ) : !hasPaid ? (
                  <div className="paywall-cta">
                    <div className="paywall-cta-left">
                      <div className="paywall-cta-badge">⭐ Full Research Package</div>
                      <h3 className="paywall-cta-title">Unlock Your Complete Deliverables</h3>
                      <p className="paywall-cta-desc">
                        Get all 9 deliverables: full report, data tables, solutions framework, interactive web report, NotebookLM notebook, Google Drive folder, and Telegram delivery.
                      </p>
                    </div>
                    <div className="paywall-cta-right">
                      <div className="paywall-price">
                        <div className="paywall-price-amount">$297</div>
                        <div className="paywall-price-label">one-time · all deliverables included</div>
                      </div>
                      <button className="btn-paywall" onClick={handlePayment}>
                        🔓 Unlock Full Package
                      </button>
                      <span className="paywall-guarantee">🛡️ 100% satisfaction guarantee · Delivered within 48h</span>
                    </div>
                  </div>
                ) : (
                  <div className="payment-success">
                    <div className="payment-success-icon">🎉</div>
                    <div className="payment-success-title">Full Package Unlocked!</div>
                    <p className="payment-success-desc">
                      Your research package is being prepared by the Research Machine. You&apos;ll receive all 9 deliverables within 48 hours via Telegram and Google Drive.
                    </p>
                    <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting || !!jobId}>
                      {isSubmitting ? <><LoadingDots /> Dispatching...</> : jobId ? <>✓ Research Machine Activated</> : <>⚡ Dispatch to Research Machine</>}
                    </button>
                    {jobId && (
                      <div style={{marginTop: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"}}>
                        <span className="submit-job-id">Job {jobId}</span>
                        {gdriveFolderLink && (
                          <a
                            href={gdriveFolderLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                          >
                            📁 Open Google Drive Folder
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
            </>
          )}
        </main>

        {/* ── Sidebar (Desktop) ───────────────────────────────── */}
        <aside className="expedition-sidebar">
          <ContourRing
            step={currentStep}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
          />
          <div className="contour-ring-label">Expedition Progress</div>
          <div className="contour-ring-step">{stepLabels[currentStep]}</div>

          {/* Expedition Summary */}
          <div className="sidebar-summary">
            <div className="sidebar-summary-title">Expedition Log</div>

            <div className="sidebar-summary-item">
              <span className="sidebar-summary-item-label">Step</span>
              <span className="sidebar-summary-item-value">
                {currentStep} of 3
              </span>
            </div>

            {researchQuestion && (
              <div className="sidebar-summary-item">
                <span className="sidebar-summary-item-label">Topic</span>
                <span className="sidebar-summary-item-value">
                  {expansionData?.detected_topic ||
                    researchQuestion.slice(0, 60) +
                      (researchQuestion.length > 60 ? "..." : "")}
                </span>
              </div>
            )}

            {expansionData && (
              <div className="sidebar-summary-item">
                <span className="sidebar-summary-item-label">Division</span>
                <span className="sidebar-summary-item-value">
                  {expansionData.detected_division}
                </span>
              </div>
            )}

            {currentStep >= 2 && (
              <div className="sidebar-summary-item">
                <span className="sidebar-summary-item-label">Answers</span>
                <span className="sidebar-summary-item-value">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
            )}

            {currentStep === 3 && (
              <div className="sidebar-summary-item">
                <span className="sidebar-summary-item-label">Status</span>
                <span className="sidebar-summary-item-value" style={{ color: "var(--teal-glow)" }}>
                  Brief ready
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Toast ─────────────────────────────────────────────── */}
      <div className={`toast ${toastVisible ? "visible" : ""}`}>
        {toastMessage}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INLINE SVG ICON COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function LoadingDots() {
  return (
    <span className="loading-dots" aria-hidden="true">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </span>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect
        x="5"
        y="5"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M11 3H4.5A1.5 1.5 0 003 4.5V11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M8 2v8m0 0L5 7.5M8 10l3-2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12h10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
