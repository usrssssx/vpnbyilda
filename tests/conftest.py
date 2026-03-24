from pathlib import Path
import sys
from unittest.mock import AsyncMock

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.application.services.role_hierarchy import RoleAccessControl


@pytest.fixture
def role_access_control() -> RoleAccessControl:
    return RoleAccessControl()


@pytest.fixture
def async_mock():
    return AsyncMock
