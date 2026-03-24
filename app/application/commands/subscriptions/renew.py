from dataclasses import dataclass
import logging
from uuid import UUID

from app.application.commands.base import BaseCommand, BaseCommandHandler
from app.application.dtos.payments.url import PaymentData
from app.application.dtos.users.jwt import UserJWTData
from app.domain.entities.payment import Payment
from app.domain.repositories.payment import BasePaymentRepository
from app.domain.repositories.servers import BaseServerRepository
from app.domain.repositories.subscriptions import BaseSubscriptionRepository
from app.domain.repositories.users import BaseUserRepository
from app.domain.services.ports import ApiClient
from app.domain.services.subscription import SubscriptionPricingService
from app.domain.values.subscriptions import SubscriptionId
from app.domain.values.users import UserId
from app.application.services.payment import BasePaymentService, DisabledPaymentService
from app.configs.app import app_settings
from app.application.exception import NotFoundException, ForbiddenException
from app.infrastructure.mediator.event import BaseEventBus


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RenewSubscriptionCommand(BaseCommand):
    subscription_id: UUID
    duration: int
    user_jwt_data: UserJWTData


@dataclass(frozen=True)
class RenewSubscriptionCommandHandler(BaseCommandHandler[RenewSubscriptionCommand, PaymentData]):
    payment_repository: BasePaymentRepository
    subscription_repository: BaseSubscriptionRepository
    server_repository: BaseServerRepository
    user_repository: BaseUserRepository
    subs_price_service: SubscriptionPricingService
    payment_service: BasePaymentService
    api_panel: ApiClient
    event_bus: BaseEventBus

    async def handle(self, command: RenewSubscriptionCommand) -> PaymentData:
        subscription = await self.subscription_repository.get_by_id(id=SubscriptionId(command.subscription_id))
        if not subscription:
            raise NotFoundException()

        if subscription.user_id != UserId(UUID(command.user_jwt_data.id)):
            raise ForbiddenException()


        subscription.renew(command.duration)
        new_price = await self.subs_price_service.culculate_by_field(
            duration=command.duration,
            device_count=subscription.device_count,
            region=subscription.region,
            protocol_types=subscription.protocol_types
        )

        payment = Payment.create(
            subscription=subscription,
            user_id=subscription.user_id,
            price=new_price
        )

        if (
            isinstance(self.payment_service, DisabledPaymentService)
            and app_settings.ALLOW_TEST_SUBSCRIPTIONS
        ):
            user = await self.user_repository.get_by_id(id=subscription.user_id)
            if user is None:
                raise NotFoundException()

            server = await self.server_repository.get_by_id(server_id=subscription.server_id)
            if server is None:
                raise NotFoundException()

            payment.payment_id = f"test-{payment.id}"
            payment.paid()
            subscription.activate()

            await self.subscription_repository.update(subscription=subscription)
            await self.payment_repository.create(payment=payment)

            await self.api_panel.create_or_upgrade_subscription(
                user=user,
                subscription=subscription,
                server=server
            )

            await self.event_bus.publish(payment.pull_events())

            logger.info(
                "Renew subscription in test mode",
                extra={"subscription": subscription, "payment_id": payment.payment_id}
            )

            return PaymentData(
                url=f"/subscriptions/{subscription.id.as_generic_type()}",
                price=new_price
            )

        payment_data = await self.payment_service.create(order=payment)
        payment.payment_id = payment_data.payment_id

        await self.payment_repository.create(payment=payment)
        logger.info("Renew subscription", extra={"subscription": subscription})

        return PaymentData(url=payment_data.url, price=new_price)
