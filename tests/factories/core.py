from datetime import timedelta
from uuid import uuid4

from app.application.dtos.users.jwt import UserJWTData
from app.domain.entities.payment import Payment
from app.domain.entities.server import Server
from app.domain.entities.subscription import Subscription, SubscriptionStatus
from app.domain.entities.user import User
from app.domain.services.utils import now_utc
from app.domain.values.servers import (
    APIConfig,
    APICredits,
    ApiType,
    ProtocolConfig,
    ProtocolType,
    Region,
    SubscriptionConfig,
)
from app.domain.values.subscriptions import SubscriptionId
from app.domain.values.users import UserId, UserRole


def make_user(
    *,
    telegram_id: int = 1000,
    username: str = "tester",
    fullname: str = "Test User",
    role: UserRole = UserRole.USER,
) -> User:
    user = User.create(
        telegram_id=telegram_id,
        username=username,
        fullname=fullname,
    )
    user.role = role
    return user


def make_server(
    *,
    region: Region | None = None,
    limit: int = 10,
    free: int | None = None,
    protocol_types: list[ProtocolType] | None = None,
    with_subscription_config: bool = False,
) -> Server:
    region = region or Region.region_by_code("DE")
    protocol_types = protocol_types or [ProtocolType.VLESS]
    protocol_configs = {
        protocol: ProtocolConfig(
            protocol_type=protocol,
            config={"inbound_id": index + 1, "flow": "xtls-rprx-vision"},
        )
        for index, protocol in enumerate(protocol_types)
    }
    server = Server.create(
        limit=limit,
        region=region,
        api_type=ApiType.x_ui,
        api_config=APIConfig(ip="127.0.0.1", panel_port=2053, panel_path="panel"),
        auth_credits=APICredits(username="user", password="pass"),
        protocol_configs=protocol_configs,
        subscription_config=(
            SubscriptionConfig.from_url("https://sub.example.com/sub/")
            if with_subscription_config
            else None
        ),
    )
    if free is not None:
        server.free = free
    return server


def make_subscription(
    *,
    user_id: UserId | None = None,
    server_id=None,
    region: Region | None = None,
    duration: int = 30,
    device_count: int = 1,
    protocol_types: list[ProtocolType] | None = None,
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
) -> Subscription:
    region = region or Region.region_by_code("DE")
    protocol_types = protocol_types or [ProtocolType.VLESS]
    subscription = Subscription(
        id=SubscriptionId(uuid4()),
        duration=duration,
        start_date=now_utc() - timedelta(days=1),
        device_count=device_count,
        server_id=server_id or uuid4(),
        region=region,
        user_id=user_id or UserId(uuid4()),
        status=status,
        protocol_types=protocol_types,
    )
    return subscription


def make_payment(
    *,
    subscription: Subscription,
    price: float = 100.0,
) -> Payment:
    return Payment.create(
        subscription=subscription,
        user_id=subscription.user_id,
        price=price,
    )


def make_user_jwt_data(
    *,
    user_id: UserId | None = None,
    role: UserRole = UserRole.USER,
) -> UserJWTData:
    return UserJWTData(
        id=str((user_id or UserId(uuid4())).value),
        role=role.value,
    )
