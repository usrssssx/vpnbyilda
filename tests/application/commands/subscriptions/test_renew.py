from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.application.commands.subscriptions.renew import RenewSubscriptionCommand, RenewSubscriptionCommandHandler
from app.application.exception import ForbiddenException, NotFoundException
from app.application.services.payment import DisabledPaymentService
from app.configs.app import app_settings
from app.domain.entities.subscription import SubscriptionStatus
from tests.factories import make_server, make_subscription, make_user, make_user_jwt_data


@pytest.mark.asyncio
async def test_renew_raises_when_subscription_missing():
    handler = RenewSubscriptionCommandHandler(
        payment_repository=AsyncMock(),
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=None)),
        server_repository=AsyncMock(),
        user_repository=AsyncMock(),
        subs_price_service=AsyncMock(),
        payment_service=AsyncMock(),
        api_panel=AsyncMock(),
        event_bus=AsyncMock(),
    )
    command = RenewSubscriptionCommand(subscription_id=uuid4(), duration=30, user_jwt_data=make_user_jwt_data())

    with pytest.raises(NotFoundException):
        await handler.handle(command)


@pytest.mark.asyncio
async def test_renew_raises_for_foreign_subscription():
    subscription = make_subscription()
    handler = RenewSubscriptionCommandHandler(
        payment_repository=AsyncMock(),
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription)),
        server_repository=AsyncMock(),
        user_repository=AsyncMock(),
        subs_price_service=AsyncMock(),
        payment_service=AsyncMock(),
        api_panel=AsyncMock(),
        event_bus=AsyncMock(),
    )
    command = RenewSubscriptionCommand(subscription_id=subscription.id.value, duration=30, user_jwt_data=make_user_jwt_data())

    with pytest.raises(ForbiddenException):
        await handler.handle(command)


@pytest.mark.asyncio
async def test_renew_active_in_test_mode_reuses_internal_url(monkeypatch):
    monkeypatch.setattr(app_settings, "ALLOW_TEST_SUBSCRIPTIONS", True)
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.ACTIVE)
    server = make_server()
    payment_repository = SimpleNamespace(create=AsyncMock())
    subscription_repository = SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock())
    api_panel = SimpleNamespace(create_or_upgrade_subscription=AsyncMock())
    event_bus = SimpleNamespace(publish=AsyncMock())
    handler = RenewSubscriptionCommandHandler(
        payment_repository=payment_repository,
        subscription_repository=subscription_repository,
        server_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=server)),
        user_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        subs_price_service=SimpleNamespace(culculate_by_field=AsyncMock(return_value=90)),
        payment_service=DisabledPaymentService(),
        api_panel=api_panel,
        event_bus=event_bus,
    )
    command = RenewSubscriptionCommand(
        subscription_id=subscription.id.value,
        duration=30,
        user_jwt_data=make_user_jwt_data(user_id=user.id),
    )

    result = await handler.handle(command)

    payment_repository.create.assert_awaited_once()
    api_panel.create_or_upgrade_subscription.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
    assert result.url == f"/subscriptions/{subscription.id.as_generic_type()}"


@pytest.mark.asyncio
async def test_renew_canceled_in_test_mode_reactivates_subscription(monkeypatch):
    monkeypatch.setattr(app_settings, "ALLOW_TEST_SUBSCRIPTIONS", True)
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.CANCELED)
    server = make_server()
    handler = RenewSubscriptionCommandHandler(
        payment_repository=SimpleNamespace(create=AsyncMock()),
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock()),
        server_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=server)),
        user_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        subs_price_service=SimpleNamespace(culculate_by_field=AsyncMock(return_value=90)),
        payment_service=DisabledPaymentService(),
        api_panel=SimpleNamespace(create_or_upgrade_subscription=AsyncMock()),
        event_bus=SimpleNamespace(publish=AsyncMock()),
    )
    command = RenewSubscriptionCommand(
        subscription_id=subscription.id.value,
        duration=30,
        user_jwt_data=make_user_jwt_data(user_id=user.id),
    )

    await handler.handle(command)

    assert subscription.status == SubscriptionStatus.ACTIVE


@pytest.mark.asyncio
async def test_renew_in_normal_mode_uses_payment_service(monkeypatch):
    monkeypatch.setattr(app_settings, "ALLOW_TEST_SUBSCRIPTIONS", False)
    user = make_user()
    subscription = make_subscription(user_id=user.id, status=SubscriptionStatus.ACTIVE)
    payment_service = SimpleNamespace(create=AsyncMock(return_value=SimpleNamespace(payment_id="pay-2", url="https://renew.test")))
    payment_repository = SimpleNamespace(create=AsyncMock())
    handler = RenewSubscriptionCommandHandler(
        payment_repository=payment_repository,
        subscription_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=subscription), update=AsyncMock()),
        server_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=make_server())),
        user_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        subs_price_service=SimpleNamespace(culculate_by_field=AsyncMock(return_value=120)),
        payment_service=payment_service,
        api_panel=SimpleNamespace(create_or_upgrade_subscription=AsyncMock()),
        event_bus=SimpleNamespace(publish=AsyncMock()),
    )
    command = RenewSubscriptionCommand(
        subscription_id=subscription.id.value,
        duration=30,
        user_jwt_data=make_user_jwt_data(user_id=user.id),
    )

    result = await handler.handle(command)

    payment_service.create.assert_awaited_once()
    payment_repository.create.assert_awaited_once()
    assert result.url == "https://renew.test"
