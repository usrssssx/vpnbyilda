from app.domain.entities.subscription import SubscriptionStatus
from app.infrastructure.db.convertors.subscription import (
    convert_subscription_document_to_entity,
    convert_subscription_entity_to_document,
)
from tests.factories import make_subscription


def test_subscription_convertor_roundtrip_preserves_canceled_status():
    subscription = make_subscription(status=SubscriptionStatus.CANCELED)

    document = convert_subscription_entity_to_document(subscription)
    restored = convert_subscription_document_to_entity(document)

    assert document["status"] == SubscriptionStatus.CANCELED.value
    assert restored.status == SubscriptionStatus.CANCELED
    assert restored.region.code == subscription.region.code
    assert restored.end_date == subscription.end_date
