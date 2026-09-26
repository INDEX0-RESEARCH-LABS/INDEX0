"""Data models for Autonomous Repository Reverse-Engineering & Elevation."""
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CrownJewelType(str, Enum):
    SPATIAL_INDEX = "spatial_index"
    STATE_MACHINE = "state_machine"
    MATH_ALGORITHM = "math_algorithm"
    DATA_STRUCTURE = "data_structure"
    RENDERING_PIPELINE = "rendering_pipeline"
    CONCURRENCY_PRIMITIVE = "concurrency_primitive"


class CrownJewelComponent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol_name: str = Field(..., alias="symbolName")
    source_file: str = Field(..., alias="sourceFile")
    category: CrownJewelType
    description: str
    code_snippet: str = Field(..., alias="codeSnippet")
    complexity_rank: str = Field("O(N log N)", alias="complexityRank")


class ReverseEngineeringSpec(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    repo_url: str = Field(..., alias="repoUrl")
    repo_name: str = Field(..., alias="repoName")
    executive_summary: str = Field(..., alias="executiveSummary")
    crown_jewels: List[CrownJewelComponent] = Field(default_factory=list, alias="crownJewels")
    cruft_eliminated: List[str] = Field(default_factory=list, alias="cruftEliminated")
    elevation_strategy: List[str] = Field(default_factory=list, alias="elevationStrategy")


class ReEngineerRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    repo_url: str = Field(..., alias="repoUrl")
    goal: Optional[str] = Field(None)
    target_framework: str = Field("react_signals", alias="targetFramework")
    target_path: Optional[str] = Field("src/elevated", alias="targetPath")


class ElevatedCodeResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    spec: ReverseEngineeringSpec
    elevated_files: Dict[str, str] = Field(default_factory=dict, alias="elevatedFiles")
    modernizations_applied: List[str] = Field(default_factory=list, alias="modernizationsApplied")
    estimated_perf_gain: str = Field("5x - 10x throughput improvement", alias="estimatedPerfGain")
