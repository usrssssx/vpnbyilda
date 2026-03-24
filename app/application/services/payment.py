from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from app.application.exception import BadRequestException
from app.domain.entities.payment import Payment



@dataclass(frozen=True)
class PaymentAnswer:
    url: str
    payment_id: str


@dataclass
class BasePaymentService(ABC):

    @abstractmethod
    async def create(self, order: Payment) -> PaymentAnswer: ...

    @abstractmethod
    async def check(self, payment_id: UUID) -> dict[str, Any]: ...

    @abstractmethod
    async def handle_webhook(self, playload: dict[str, Any], headers: dict[str, Any]) -> UUID: ...


@dataclass
class DisabledPaymentService(BasePaymentService):
    message: str = "YooKassa is not configured"

    async def create(self, order: Payment) -> PaymentAnswer:
        raise BadRequestException()

    async def check(self, payment_id: UUID) -> dict[str, Any]:
        raise BadRequestException()

    async def handle_webhook(self, playload: dict[str, Any], headers: dict[str, Any]) -> UUID:
        raise BadRequestException()
