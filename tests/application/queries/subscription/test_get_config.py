from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.application.exception import ConflictException, ForbiddenException, NotFoundException
from app.application.queries.subscription.get_config import GetConfigQuery, GetConfigQueryHandler
from app.domain.entities.subscription import SubscriptionStatus
from app.domain.values.servers import VPNConfig
from tests.factories import make_server, make_subscription, make_user, make_user_jwt_data


@pytest.mark.asyncio
async def test_get_config_raises_when_subscription_missing(role_access_control):
    handler = GetConfigQueryHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=None)),
        user_repositry=AsyncMock(),
        server_reposiotry=AsyncMock(),
        api_panel=AsyncMock(),
        role_access_control=role_access_control,
    )

    with pytest.raises(NotFoundException):
        await handler.handle(GetConfigQuery(subscription_id=uuid4(), user_jwt_data=make_user_jwt_data()))


@pytest.mark.asyncio
async def test_get_config_raises_for_foreign_subscription(role_access_control):
    subscription = make_subscription(status=SubscriptionStatus.ACTIVE)
    handler = GetConfigQueryHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription)),
        user_repositry=AsyncMock(),
        server_reposiotry=AsyncMock(),
        api_panel=AsyncMock(),
        role_access_control=role_access_control,
    )

    with pytest.raises(ForbiddenException):
        await handler.handle(GetConfigQuery(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data()))


@pytest.mark.asyncio
@pytest.mark.parametrize("status", [SubscriptionStatus.PENDING, SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELED])
async def test_get_config_raises_conflict_for_non_active_subscription(status, role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=status)
    handler = GetConfigQueryHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription)),
        user_repositry=AsyncMock(),
        server_reposiotry=AsyncMock(),
        api_panel=AsyncMock(),
        role_access_control=role_access_control,
    )

    with pytest.raises(ConflictException):
        await handler.handle(
            GetConfigQuery(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
        )


@pytest.mark.asyncio
async def test_get_config_raises_when_user_or_server_missing(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.ACTIVE)
    handler = GetConfigQueryHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription)),
        user_repositry=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        server_reposiotry=SimpleNamespace(get_by_id=AsyncMock(return_value=None)),
        api_panel=AsyncMock(),
        role_access_control=role_access_control,
    )

    with pytest.raises(NotFoundException):
        await handler.handle(
            GetConfigQuery(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
        )


@pytest.mark.asyncio
async def test_get_config_returns_vpn_configs_for_active_subscription(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.ACTIVE)
    server = make_server(with_subscription_config=True)
    configs = [VPNConfig(config="https://sub.example.com/sub/abc", protocol_type=None)]
    api_panel = SimpleNamespace(get_configs_vpn=AsyncMock(return_value=configs))
    handler = GetConfigQueryHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription)),
        user_repositry=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        server_reposiotry=SimpleNamespace(get_by_id=AsyncMock(return_value=server)),
        api_panel=api_panel,
        role_access_control=role_access_control,
    )

    result = await handler.handle(
        GetConfigQuery(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
    )

    api_panel.get_configs_vpn.assert_awaited_once()
    assert result == configs
