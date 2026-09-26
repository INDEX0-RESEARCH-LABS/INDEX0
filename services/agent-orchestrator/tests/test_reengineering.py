"""Unit tests for Autonomous Repository Reverse-Engineering & Elevation Engine."""
import pytest
from src.reengineering.models import CrownJewelType
from src.reengineering.extractor import CrownJewelExtractor
from src.reengineering.modernizer import CodeModernizer
from src.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.mark.asyncio
async def test_crown_jewel_extractor():
    extractor = CrownJewelExtractor()
    spec = await extractor.extract_crown_jewels(
        repo_url="https://github.com/xyflow/xyflow",
        goal="Ultra-low-latency node graph canvas"
    )

    assert spec.repo_name == "xyflow"
    assert len(spec.crown_jewels) > 0
    assert len(spec.cruft_eliminated) > 0
    assert len(spec.elevation_strategy) > 0

    jewel = spec.crown_jewels[0]
    assert jewel.symbol_name is not None
    assert jewel.category in [CrownJewelType.SPATIAL_INDEX, CrownJewelType.MATH_ALGORITHM, CrownJewelType.STATE_MACHINE]


@pytest.mark.asyncio
async def test_code_modernizer():
    extractor = CrownJewelExtractor()
    modernizer = CodeModernizer()

    spec = await extractor.extract_crown_jewels(
        repo_url="https://github.com/tldraw/tldraw",
        goal="High performance spatial canvas"
    )
    result = await modernizer.elevate_codebase(spec)

    assert len(result.elevated_files) > 0
    assert len(result.modernizations_applied) > 0
    assert "Float64Array" in str(result.elevated_files) or "Engine" in str(result.elevated_files)


def test_fastapi_reengineer_endpoint():
    payload = {
        "repoUrl": "https://github.com/xyflow/xyflow",
        "goal": "Re-engineer graph layout math into zero-alloc Float64Array pipeline",
        "targetFramework": "react_signals"
    }
    response = client.post("/reengineer/start", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "spec" in data
    assert "elevatedFiles" in data
    assert len(data["elevatedFiles"]) > 0
    assert "estimatedPerfGain" in data
