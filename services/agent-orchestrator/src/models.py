"""Pydantic Models matching @index0/contracts for Coordination & Review-Loop."""
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AgentRole(str, Enum):
    ARCHITECT = "architect"
    DEVELOPER = "developer"
    CRITIC = "critic"
    QA = "qa"


class ReviewVerdictDecision(str, Enum):
    APPROVE = "approve"
    REQUEST_CHANGES = "request_changes"
    REJECT = "reject"


class ReviewFindingSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class PostcardMessageType(str, Enum):
    PLAN_PROPOSAL = "plan_proposal"
    PLAN_APPROVAL = "plan_approval"
    IMPLEMENTATION = "implementation"
    REVIEW_REQUEST = "review_request"
    REVIEW_VERDICT = "review_verdict"
    TEST_REQUEST = "test_request"
    TEST_RESULT = "test_result"
    HANDOFF = "handoff"
    ESCALATION = "escalation"
    ACKNOWLEDGMENT = "acknowledgment"


class AgentIdentity(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    agent_id: str = Field(..., alias="agentId")
    role: AgentRole
    display_name: str = Field(..., alias="displayName")
    model: Optional[str] = None


class PostcardEnvelope(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    version: str = "1.0"
    id: str
    from_agent: AgentIdentity = Field(..., alias="from")
    to_agent: Any = Field(..., alias="to")  # AgentIdentity or "*"
    type: PostcardMessageType
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    parent_id: Optional[str] = Field(None, alias="parentId")
    ttl: Optional[int] = None
    signatures: Optional[List[str]] = None


class ReviewFinding(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    file_path: str = Field(..., alias="filePath")
    line: Optional[int] = None
    severity: ReviewFindingSeverity
    category: str
    message: str
    suggested_fix: Optional[str] = Field(None, alias="suggestedFix")


class SASTScanSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_findings: int = Field(..., alias="totalFindings")
    by_severity: Dict[str, int] = Field(..., alias="bySeverity")
    passed: bool
    scanner: str
    duration_ms: float = Field(..., alias="durationMs")


class ReviewVerdict(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    cycle_id: str = Field(..., alias="cycleId")
    reviewer: AgentIdentity
    decision: ReviewVerdictDecision
    comments: str
    findings: List[ReviewFinding] = Field(default_factory=list)
    sast_results: Optional[SASTScanSummary] = Field(None, alias="sastResults")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CycleStartRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    task_id: str = Field(..., alias="taskId")
    user_prompt: str = Field(..., alias="userPrompt")
    repository_root: Optional[str] = Field(".", alias="repositoryRoot")
    max_iterations: int = Field(5, alias="maxIterations")
    context_files: List[str] = Field(default_factory=list, alias="contextFiles")


class CycleStatusResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    cycle_id: str = Field(..., alias="cycleId")
    task_id: str = Field(..., alias="taskId")
    status: str
    current_role: Optional[AgentRole] = Field(None, alias="currentRole")
    iteration: int
    max_iterations: int = Field(..., alias="maxIterations")
    architecture_plan: Optional[str] = Field(None, alias="architecturePlan")
    implementation_diff: Optional[str] = Field(None, alias="implementationDiff")
    critic_verdict: Optional[ReviewVerdict] = Field(None, alias="criticVerdict")
    qa_results: Optional[Dict[str, Any]] = Field(None, alias="qaResults")
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")


class AlgorithmicHypothesis(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    hypothesis_id: str = Field(..., alias="hypothesisId")
    name: str
    rationale: str
    tradeoffs: str
    implementation_strategy: str = Field(..., alias="implementationStrategy")


class ArchitectSpec(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    task_id: str = Field(..., alias="taskId")
    summary: str
    target_symbols: List[str] = Field(default_factory=list, alias="targetSymbols")
    pre_conditions: List[str] = Field(default_factory=list, alias="preConditions")
    post_conditions: List[str] = Field(default_factory=list, alias="postConditions")
    invariants: List[str] = Field(default_factory=list)
    hypotheses: List[AlgorithmicHypothesis] = Field(default_factory=list)
    blast_radius_files: List[str] = Field(default_factory=list, alias="blastRadiusFiles")
    verification_strategy: str = Field("fuzzing_and_sast", alias="verificationStrategy")

