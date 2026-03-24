from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.application.commands.subscriptions.create import CreateSubscriptionCommand, CreateSubscriptionCommandHandler
from app.application.exception import NotFoundException
from app.application.services.payment import DisabledPaymentService
from app.configs.app import app_settings
from app.domain.values.servers import ProtocolType
from tests.factories import make_server, make_user, make_user_jwt_data


@pytest.mark.asyncio
async def test_create_subscription_raises_when_server_not_found():
    handler = CreateSubscriptionCommandHandler(
        payment_repository=AsyncMock(),
        server_repository=SimpleNamespace(get_by_max_free=AsyncMock(return_value=None)),
        subscription_repository=AsyncMock(),
        user_repository=AsyncMock(),
        subs_price_service=SimpleNamespace(calculate=AsyncMock(return_value=100)),
        payment_service=AsyncMock(),
        api_panel=AsyncMock(),
        event_bus=AsyncMock(),
    )
    command = CreateSubscriptionCommand(
        duration=30,
        device_count=1,
        protocol_types=[ProtocolType.VLESS.value],
        user_jwt_data=make_user_jwt_data(),
    )

    with pytest.raises(NotFoundException):
        await handler.handle(command)


@pytest.mark.asyncio
async def test_create_subscription_in_test_mode_activates_and_returns_internal_url(monkeypatch):
    monkeypatch.setattr(app_settings, "ALLOW_TEST_SUBSCRIPTIONS", True)
    server = make_server(region=None)
    user = make_user()
    payment_repository = SimpleNamespace(create=AsyncMock())
    subscription_repository = SimpleNamespace(update=AsyncMock())
    api_panel = SimpleNamespace(create_or_upgrade_subscription=AsyncMock())
    event_bus = SimpleNamespace(publish=AsyncMock())
    handler = CreateSubscriptionCommandHandler(
        payment_repository=payment_repository,
        server_repository=SimpleNamespace(get_by_max_free=AsyncMock(return_value=server)),
        subscription_repository=subscription_repository,
        user_repository=SimpleNamespace(get_by_id=AsyncMock(return_value=user)),
        subs_price_service=SimpleNamespace(calculate=AsyncMock(return_value=100)),
        payment_service=DisabledPaymentService(),
        api_panel=api_panel,
        event_bus=event_bus,
    )
    command = CreateSubscriptionCommand(
        duration=30,
        device_count=1,
        protocol_types=[ProtocolType.VLESS.value],
        user_jwt_data=make_user_jwt_data(user_id=user.id),
    )

    result = await handler.handle(command)

    subscription = subscription_repository.update.await_args.kwargs["subscription"]
    payment = payment_repository.create.await_args.kwargs["payment"]
    assert subscription.status.value == "active"
    assert payment.payment_id.startswith("test-")
    api_panel.create_or_upgrade_subscription.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
    assert result.url == f"/subscriptions/{subscription.id.as_generic_type()}"


@pytest.mark.asyncio
async def test_create_subscription_in_normal_mode_uses_payment_service(monkeypatch):
    monkeypatch.setattr(app_settings, "ALLOW_TEST_SUBSCRIPTIONS", False)
    server = make_server()
    payment_repository = SimpleNamespace(create=AsyncMock())
    subscription_repository = SimpleNamespace(update=AsyncMock())
    event_bus = SimpleNamespace(publish=AsyncMock())
    payment_service = SimpleNamespace(create=AsyncMock(return_value=SimpleNamespace(payment_id="pay-1", url="https://pay.test")))
    handler = CreateSubscriptionCommandHandler(
        payment_repository=payment_repository,
        server_repository=SimpleNamespace(get_by_max_free=AsyncMock(return_value=server)),
        subscription_repository=subscription_repository,
        user_repository=SimpleNamespace(get_by_id=AsyncMock()),
        subs_price_service=SimpleNamespace(calculate=AsyncMock(return_value=150)),
        payment_service=payment_service,
        api_panel=SimpleNamespace(create_or_upgrade_subscription=AsyncMock()),
        event_bus=event_bus,
    )
    command = CreateSubscriptionCommand(
        duration=30,
        device_count=1,
        protocol_types=[ProtocolType.VLESS.value],
        user_jwt_data=make_user_jwt_data(),
    )

    result = await handler.handle(command)

    payment_service.create.assert_awaited_once()
    payment_repository.create.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
    subscription_repository.update.assert_not_awaited()
    assert result.url == "https://pay.test"
