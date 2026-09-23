/**
 * Self-Evolving Review Loop Contracts — @index0/contracts/v1/review-loop
 * Authoritative schema definitions for the LangGraph 4-tier review cycle,
 * TextGrad feedback propagation, and Semgrep/Trivy security scanning results.
 */

// ---------------------------------------------------------------------------
// Review Cycle Lifecycle
// ---------------------------------------------------------------------------

/**
 * Stages in the 4-tier review loop.
 * Each agent run cycles through: architect → developer → critic → qa
 */
export type ReviewStage = "architect" | "developer" | "critic" | "qa";

export type ReviewCycleStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected"
  | "max_iterations_reached";

export interface IReviewCycle {
  /** Unique review cycle identifier. */
  id: string;

  /** Associated agent run ID. */
  agentRunId: string;

  /** Workspace ID for context. */
  workspaceId: string;

  /** Current stage in the cycle. */
  currentStage: ReviewStage;

  /** Overall cycle status. */
  status: ReviewCycleStatus;

  /** Current iteration number (increments on each developer → critic loop). */
  iteration: number;

  /** Maximum allowed iterations before force-stopping. */
  maxIterations: number;

  /** Results from each completed stage. */
  stageResults: IReviewStageResult[];

  /** ISO-8601 timestamp of cycle creation. */
  createdAt: string;

  /** ISO-8601 timestamp of cycle completion. */
  completedAt?: string;

  /** Total cycle duration in milliseconds. */
  totalDurationMs?: number;
}

// ---------------------------------------------------------------------------
// Stage Results
// ---------------------------------------------------------------------------

export type StageResultStatus = "success" | "failure" | "skipped";

export interface IReviewStageResult {
  /** Review cycle this result belongs to. */
  cycleId: string;

  /** Stage that produced this result. */
  stage: ReviewStage;

  /** Iteration number when this result was produced. */
  iteration: number;

  /** Stage execution status. */
  status: StageResultStatus;

  /** Stage output content (plan, code, review, test results). */
  output: Record<string, unknown>;

  /** Token consumption for this stage. */
  tokensUsed: number;

  /** Stage execution duration in milliseconds. */
  durationMs: number;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Architect Stage Output
// ---------------------------------------------------------------------------

export interface IArchitectOutput {
  /** High-level plan description. */
  planSummary: string;

  /** Ordered plan steps. */
  steps: IArchitectPlanStep[];

  /** Files targeted for modification. */
  fileTargets: string[];

  /** Identified constraints and risks. */
  constraints: string[];

  /** Estimated complexity (1-10 scale). */
  estimatedComplexity: number;
}

export interface IArchitectPlanStep {
  /** Step identifier within the plan. */
  id: string;

  /** Step title. */
  title: string;

  /** Detailed step description. */
  description: string;

  /** File paths this step will modify. */
  affectedFiles: string[];

  /** Dependencies on other steps (by ID). */
  dependsOn: string[];
}

// ---------------------------------------------------------------------------
// Developer Stage Output
// ---------------------------------------------------------------------------

export interface IDeveloperOutput {
  /** Generated code changes as unified diffs. */
  diffs: ICodeDiff[];

  /** New files created. */
  newFiles: INewFile[];

  /** Files deleted. */
  deletedFiles: string[];

  /** Developer's rationale for the implementation. */
  rationale: string;
}

export interface ICodeDiff {
  /** File path relative to repository root. */
  filePath: string;

  /** Unified diff content. */
  diff: string;

  /** Number of lines added. */
  linesAdded: number;

  /** Number of lines removed. */
  linesRemoved: number;
}

export interface INewFile {
  /** File path relative to repository root. */
  filePath: string;

  /** File content. */
  content: string;

  /** Programming language. */
  language: string;
}

// ---------------------------------------------------------------------------
// Critic Stage Output
// ---------------------------------------------------------------------------

export interface ICriticOutput {
  /** Overall review decision. */
  decision: "approve" | "request_changes" | "reject";

  /** Review summary. */
  summary: string;

  /** Detailed review findings. */
  findings: ICriticFinding[];

  /** SAST scan results from Semgrep. */
  semgrepResults?: ISemgrepScanResult;

  /** Vulnerability scan results from Trivy. */
  trivyResults?: ITrivyScanResult;

  /** Whether the code passes all security gates. */
  securityGatePassed: boolean;
}

export interface ICriticFinding {
  /** Finding type. */
  type: "bug" | "style" | "performance" | "security" | "logic" | "documentation";

  /** Severity level. */
  severity: "info" | "warning" | "error" | "critical";

  /** File path. */
  filePath: string;

  /** Line number (1-indexed). */
  line?: number;

  /** End line number for multi-line findings. */
  endLine?: number;

  /** Finding description. */
  message: string;

  /** Suggested fix or improvement. */
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// QA Stage Output
// ---------------------------------------------------------------------------

export interface IQAOutput {
  /** Overall QA verdict. */
  verdict: "pass" | "fail";

  /** Test execution results. */
  testResults: ITestResult[];

  /** Code coverage percentage (0-100). */
  coveragePercent?: number;

  /** QA summary notes. */
  notes: string;

  /** Whether all acceptance criteria are met. */
  acceptanceCriteriaMet: boolean;
}

export interface ITestResult {
  /** Test name or description. */
  name: string;

  /** Test file path. */
  filePath: string;

  /** Test outcome. */
  status: "passed" | "failed" | "skipped" | "error";

  /** Failure message (if status is "failed" or "error"). */
  failureMessage?: string;

  /** Test execution duration in milliseconds. */
  durationMs: number;
}

// ---------------------------------------------------------------------------
// TextGrad — Textual Backpropagation Feedback
// ---------------------------------------------------------------------------

export interface ITextGradFeedback {
  /** Unique feedback identifier. */
  id: string;

  /** Review cycle that generated this feedback. */
  cycleId: string;

  /** Stage that failed, triggering feedback generation. */
  failedStage: ReviewStage;

  /** Iteration when the failure occurred. */
  iteration: number;

  /** Structured loss description (what went wrong). */
  lossDescription: string;

  /** Computed gradient (what to change in the prompt). */
  gradientText: string;

  /** Specific prompt modifications to apply. */
  promptUpdates: IPromptUpdate[];

  /** Whether this feedback has been applied. */
  applied: boolean;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

export interface IPromptUpdate {
  /** Target stage whose prompt should be updated. */
  targetStage: ReviewStage;

  /** Section of the prompt to modify. */
  section: string;

  /** Original prompt text (for diff tracking). */
  originalText: string;

  /** Updated prompt text. */
  updatedText: string;

  /** Confidence score of the update (0.0 – 1.0). */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Semgrep SAST Scan Results
// ---------------------------------------------------------------------------

export interface ISemgrepScanResult {
  /** Total number of findings. */
  totalFindings: number;

  /** Individual Semgrep findings. */
  findings: ISemgrepFinding[];

  /** Rule packs applied during the scan. */
  rulePacks: string[];

  /** Scan duration in milliseconds. */
  durationMs: number;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

export interface ISemgrepFinding {
  /** Semgrep rule identifier (e.g., "python.lang.security.audit.exec-detected"). */
  ruleId: string;

  /** Finding severity. */
  severity: "INFO" | "WARNING" | "ERROR";

  /** File path. */
  filePath: string;

  /** Start line number (1-indexed). */
  startLine: number;

  /** End line number (1-indexed). */
  endLine: number;

  /** Matched code snippet. */
  matchedCode: string;

  /** Human-readable message. */
  message: string;

  /** Fix suggestion (if available). */
  fix?: string;

  /** CWE identifier (if applicable). */
  cwe?: string[];

  /** OWASP category (if applicable). */
  owasp?: string[];
}

// ---------------------------------------------------------------------------
// Trivy Vulnerability Scan Results
// ---------------------------------------------------------------------------

export interface ITrivyScanResult {
  /** Total number of vulnerabilities found. */
  totalVulnerabilities: number;

  /** Individual vulnerability findings. */
  vulnerabilities: ITrivyVulnerability[];

  /** Scan target (e.g., filesystem path, container image). */
  target: string;

  /** Scan duration in milliseconds. */
  durationMs: number;

  /** ISO-8601 timestamp. */
  timestamp: string;
}

export interface ITrivyVulnerability {
  /** CVE identifier (e.g., "CVE-2024-1234"). */
  vulnerabilityId: string;

  /** Affected package name. */
  pkgName: string;

  /** Installed version. */
  installedVersion: string;

  /** Fixed version (if available). */
  fixedVersion?: string;

  /** Vulnerability severity. */
  severity: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  /** Human-readable title. */
  title: string;

  /** Detailed description. */
  description: string;

  /** Reference URLs. */
  references: string[];
}
