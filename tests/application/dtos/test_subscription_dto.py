from app.application.dtos.subscriptions.subscription import SubscriptionDTO
from app.domain.entities.subscription import SubscriptionStatus
from tests.factories import make_subscription


def test_subscription_dto_from_entity_contains_region_and_status():
    subscription = make_subscription(status=SubscriptionStatus.CANCELED)

    dto = SubscriptionDTO.from_entity(subscription)

    assert dto.flag == subscription.region.flag
    assert dto.name == subscription.region.name
    assert dto.code == subscription.region.code
    assert dto.status == SubscriptionStatus.CANCELED.value
    assert dto.protocol_types == subscription.protocol_types
