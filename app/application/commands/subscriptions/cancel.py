from dataclasses import dataclass
from uuid import UUID

from app.application.commands.base import BaseCommand, BaseCommandHandler
from app.application.dtos.subscriptions.subscription import SubscriptionDTO
from app.application.exception import ConflictException, ForbiddenException, NotFoundException
from app.application.services.role_hierarchy import RoleAccessControl
from app.application.dtos.users.jwt import UserJWTData
from app.domain.entities.subscription import SubscriptionStatus
from app.domain.repositories.servers import BaseServerRepository
from app.domain.repositories.subscriptions import BaseSubscriptionRepository
from app.domain.repositories.users import BaseUserRepository
from app.domain.services.ports import ApiClient
from app.domain.values.subscriptions import SubscriptionId
from app.domain.values.users import UserId, UserRole


@dataclass(frozen=True)
class CancelSubscriptionCommand(BaseCommand):
    subscription_id: UUID
    user_jwt_data: UserJWTData


@dataclass(frozen=True)
class CancelSubscriptionCommandHandler(BaseCommandHandler[CancelSubscriptionCommand, SubscriptionDTO]):
    subscription_repository: BaseSubscriptionRepository
    server_repository: BaseServerRepository
    user_repository: BaseUserRepository
    api_panel: ApiClient
    role_access_control: RoleAccessControl

    async def handle(self, command: CancelSubscriptionCommand) -> SubscriptionDTO:
        subscription = await self.subscription_repository.get_by_id(SubscriptionId(command.subscription_id))
        if not subscription:
            raise NotFoundException()

        if not self.role_access_control.can_action(
            UserRole(command.user_jwt_data.role), target_role=UserRole.ADMIN
        ) and UserId(UUID(command.user_jwt_data.id)) != subscription.user_id:
            raise ForbiddenException()

        if subscription.status in (SubscriptionStatus.CANCELED, SubscriptionStatus.EXPIRED):
            return SubscriptionDTO.from_entity(subscription)

        if subscription.status != SubscriptionStatus.ACTIVE:
            raise ConflictException()

        user = await self.user_repository.get_by_id(subscription.user_id)
        server = await self.server_repository.get_by_id(subscription.server_id)
        if not user or not server:
            raise NotFoundException()

        await self.api_panel.delete_client(
            user=user,
            subscription=subscription,
            server=server,
        )

        subscription.cancel()
        await self.subscription_repository.update(subscription=subscription)
        return SubscriptionDTO.from_entity(subscription)
