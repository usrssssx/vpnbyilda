from datetime import timedelta

import pytest

from app.domain.entities.subscription import SubscriptionStatus
from app.domain.exception.base import SubscriptionPendingException
from app.domain.services.utils import now_utc
from tests.factories import make_subscription


def test_activate_marks_subscription_active_and_resets_start_date():
    subscription = make_subscription(status=SubscriptionStatus.PENDING)
    old_start = subscription.start_date

    subscription.activate()

    assert subscription.status == SubscriptionStatus.ACTIVE
    assert subscription.start_date >= old_start


def test_cancel_marks_subscription_canceled():
    subscription = make_subscription(status=SubscriptionStatus.ACTIVE)

    subscription.cancel()

    assert subscription.status == SubscriptionStatus.CANCELED


def test_renew_pending_raises():
    subscription = make_subscription(status=SubscriptionStatus.PENDING)

    with pytest.raises(SubscriptionPendingException):
        subscription.renew(30)


def test_renew_active_extends_duration():
    subscription = make_subscription(status=SubscriptionStatus.ACTIVE, duration=30)

    subscription.renew(30)

    assert subscription.duration == 60


def test_renew_expired_resets_start_and_duration():
    subscription = make_subscription(status=SubscriptionStatus.EXPIRED, duration=30)
    subscription.start_date = now_utc() - timedelta(days=90)

    subscription.renew(15)

    assert subscription.duration == 15
    assert subscription.start_date > now_utc() - timedelta(minutes=1)


def test_renew_canceled_resets_start_and_duration():
    subscription = make_subscription(status=SubscriptionStatus.CANCELED, duration=30)
    subscription.start_date = now_utc() - timedelta(days=60)

    subscription.renew(10)

    assert subscription.duration == 10
    assert subscription.start_date > now_utc() - timedelta(minutes=1)
