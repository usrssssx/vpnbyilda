from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.application.commands.subscriptions.cancel import CancelSubscriptionCommand, CancelSubscriptionCommandHandler
from app.application.exception import ConflictException, ForbiddenException, NotFoundException
from app.domain.entities.subscription import SubscriptionStatus
from tests.factories import make_server, make_subscription, make_user, make_user_jwt_data


@pytest.mark.asyncio
async def test_cancel_raises_when_subscription_not_found(role_access_control):
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=None)),
        server_repository=AsyncMock(),
        user_repository=AsyncMock(),
        api_panel=AsyncMock(),
        role_access_control=role_access_control,
    )

    with pytest.raises(NotFoundException):
        await handler.handle(CancelSubscriptionCommand(subscription_id=uuid4(), user_jwt_data=make_user_jwt_data()))


@pytest.mark.asyncio
async def test_cancel_raises_for_foreign_subscription(role_access_control):
    subscription = make_subscription()
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription)),
        server_repository=AsyncMock(),
        user_repository=AsyncMock(),
        api_panel=AsyncMock(),
        role_access_control=role_access_control,
    )

    with pytest.raises(ForbiddenException):
        await handler.handle(
            CancelSubscriptionCommand(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data())
        )


@pytest.mark.asyncio
async def test_cancel_expired_is_idempotent(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.EXPIRED)
    api_panel = SimpleNamespace(delete_client=AsyncMock())
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock()),
        server_repository=SimpleNamespace(get_by_id=AsyncMock()),
        user_repository=SimpleNamespace(get_by_id=AsyncMock()),
        api_panel=api_panel,
        role_access_control=role_access_control,
    )

    result = await handler.handle(
        CancelSubscriptionCommand(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
    )

    api_panel.delete_client.assert_not_awaited()
    assert result.status == SubscriptionStatus.EXPIRED.value


@pytest.mark.asyncio
async def test_cancel_canceled_is_idempotent(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.CANCELED)
    api_panel = SimpleNamespace(delete_client=AsyncMock())
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock()),
        server_repository=SimpleNamespace(get_by_id=AsyncMock()),
        user_repository=SimpleNamespace(get_by_id=AsyncMock()),
        api_panel=api_panel,
        role_access_control=role_access_control,
    )

    result = await handler.handle(
        CancelSubscriptionCommand(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
    )

    api_panel.delete_client.assert_not_awaited()
    assert result.status == SubscriptionStatus.CANCELED.value


@pytest.mark.asyncio
async def test_cancel_pending_raises_conflict(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.PENDING)
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock()),
        server_repository=SimpleNamespace(get_by_id=AsyncMock()),
        user_repository=SimpleNamespace(get_by_id=AsyncMock()),
        api_panel=SimpleNamespace(delete_client=AsyncMock()),
        role_access_control=role_access_control,
    )

    with pytest.raises(ConflictException):
        await handler.handle(
            CancelSubscriptionCommand(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
        )


@pytest.mark.asyncio
async def test_cancel_active_revokes_access_and_updates_status(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.ACTIVE)
    server = make_server()
    update = AsyncMock()
    api_panel = SimpleNamespace(delete_client=AsyncMock())
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=update),
        server_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=server)),
        user_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        api_panel=api_panel,
        role_access_control=role_access_control,
    )

    result = await handler.handle(
        CancelSubscriptionCommand(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
    )

    api_panel.delete_client.assert_awaited_once()
    update.assert_awaited_once()
    assert subscription.status == SubscriptionStatus.CANCELED
    assert result.status == SubscriptionStatus.CANCELED.value


@pytest.mark.asyncio
async def test_cancel_active_without_user_or_server_raises_not_found(role_access_control):
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.ACTIVE)
    handler = CancelSubscriptionCommandHandler(
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock()),
        server_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=None)),
        user_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        api_panel=SimpleNamespace(delete_client=AsyncMock()),
        role_access_control=role_access_control,
    )

    with pytest.raises(NotFoundException):
        await handler.handle(
            CancelSubscriptionCommand(subscription_id=subscription.id.value, user_jwt_data=make_user_jwt_data(user_id=user.id))
        )
