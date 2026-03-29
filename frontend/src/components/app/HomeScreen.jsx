import React from 'react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    CreditCard,
    ShieldCheck,
    TimerReset,
    User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TariffsSheet from './TariffsSheet';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useTariffFlow } from '../../hooks/useTariffFlow';
import { useConnectionState } from '../../hooks/useConnectionState';
import { openExternalLink } from '../../utils/telegram';
import { SUPPORT_URL } from '../../utils/config';
import {
    formatRegion,
    formatSubscriptionPlan,
    getDaysLeft,
    getDaysSince,
    getSubscriptionState,
} from '../../utils/subscriptions';

function getUserInitials(user) {
    const first = user?.first_name?.[0] || user?.firstName?.[0] || '';
    const last = user?.last_name?.[0] || user?.lastName?.[0] || '';
    return `${first}${last}`.trim() || 'VPN';
}

function StepCard({ index, title, description, actionLabel, onClick }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Шаг {index}</p>
                    <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
                </div>
                {onClick ? (
                    <button
                        className="shrink-0 rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                        onClick={onClick}
                    >
                        {actionLabel}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function getHeroState(subscription, state, starterPrice, renewalPrice) {
    if (state === 'connected') {
        return {
            tone: 'bg-emerald-400/12 text-emerald-100 ring-emerald-400/30',
            badge: 'VPN уже настроен',
            title: `Активна · ${getDaysLeft(subscription?.expires_at)} дн. осталось`,
            description: 'Доступ открыт. Если нужно, можно заново получить конфиг или перейти в аккаунт.',
            cta: 'Получить конфиг снова',
            secondary: renewalPrice ? `Продление ${renewalPrice}₽` : 'Подписка активна',
            action: '/config',
            icon: ShieldCheck,
        };
    }

    if (state === 'active') {
        return {
            tone: 'bg-emerald-400/12 text-emerald-100 ring-emerald-400/30',
            badge: 'Доступ открыт',
            title: `Активна · ${getDaysLeft(subscription?.expires_at)} дн. осталось`,
            description: 'Следующий шаг один: забрать конфиг и подключить VPN.',
            cta: 'Получить конфиг и подключиться',
            secondary: renewalPrice ? `Продление ${renewalPrice}₽` : 'Подписка уже активна',
            action: '/config',
            icon: ShieldCheck,
        };
    }

    if (state === 'expiring') {
        return {
            tone: 'bg-amber-400/12 text-amber-100 ring-amber-400/30',
            badge: 'Истекает скоро',
            title: `Осталось ${getDaysLeft(subscription?.expires_at)} дн.`,
            description: 'Подключение уже доступно, но продление лучше не откладывать.',
            cta: 'Получить конфиг и подключиться',
            secondary: renewalPrice ? `Продлить можно за ${renewalPrice}₽` : 'Скоро понадобится продление',
            action: '/config',
            icon: AlertTriangle,
        };
    }

    if (state === 'expired' || state === 'inactive') {
        return {
            tone: 'bg-orange-400/12 text-orange-100 ring-orange-400/30',
            badge: 'Доступ закрыт',
            title: subscription?.expires_at
                ? `Истекла ${getDaysSince(subscription.expires_at)} дн. назад`
                : 'Подписка неактивна',
            description: 'Продли доступ и вернись к подключению без лишних шагов.',
            cta: renewalPrice ? `Продлить · ${renewalPrice}₽` : 'Продлить доступ',
            secondary: 'После оплаты конфиг будет доступен сразу',
            action: 'sheet',
            icon: TimerReset,
        };
    }

    if (state === 'pending') {
        return {
            tone: 'bg-sky-400/12 text-sky-100 ring-sky-400/30',
            badge: 'Ожидает оплаты',
            title: 'Заверши оформление',
            description: 'Как только платёж подтвердится, доступ к конфигу откроется автоматически.',
            cta: 'Завершить оформление',
            secondary: 'Если платёж уже прошёл, обнови экран через несколько секунд',
            action: 'sheet',
            icon: CreditCard,
        };
    }

    return {
        tone: 'bg-rose-400/12 text-rose-100 ring-rose-400/30',
        badge: 'Подписки нет',
        title: 'Доступ закрыт',
        description: 'Сразу открой доступ и переходи к настройке VPN без лишних экранов.',
        cta: starterPrice ? `Открыть доступ · от ${starterPrice}₽` : 'Открыть доступ',
        secondary: 'Средний тариф выбран по умолчанию',
        action: 'sheet',
        icon: CreditCard,
    };
}

export default function HomeScreen() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { latestSubscription, isLoading, error } = useSubscriptions();
    const {
        plans,
        selectedPlan,
        selectedPlanId,
        setSelectedPlanId,
        isSubmitting,
        isSheetOpen,
        openSheet,
        closeSheet,
        submitSelectedPlan,
        starterPrice,
        renewalPrice,
        isRenewalFlow,
    } = useTariffFlow();
    const { connectionState } = useConnectionState(latestSubscription);
    const hero = getHeroState(latestSubscription, connectionState, starterPrice, renewalPrice);
    const HeroIcon = hero.icon;
    const baseState = getSubscriptionState(latestSubscription);
    const showConnectionSteps = connectionState !== 'connected' && (baseState === 'active' || baseState === 'expiring');
    const showPurchaseSteps = connectionState === 'none' || baseState === 'expired' || baseState === 'inactive' || baseState === 'pending';

    function handlePrimaryAction() {
        if (hero.action === '/config') {
            navigate('/config');
            return;
        }
        openSheet();
    }

    return (
        <>
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 text-white">
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">NetRunVPN</p>
                        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Один экран, одно решение</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                            Сначала виден статус доступа, сразу под ним — следующее действие. Без параллельной навигации и лишних кликов.
                        </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/12 bg-white/8 text-sm font-semibold text-white/85">
                        {getUserInitials(user)}
                    </div>
                </header>

                {error ? (
                    <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                        {error}
                    </div>
                ) : null}

                <section className={`overflow-hidden rounded-[32px] border p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)] ring-1 ${hero.tone} sm:p-8`}>
                    <div className="flex flex-col gap-8">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                                <HeroIcon size={16} />
                                <span>{hero.badge}</span>
                            </div>
                            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                                {isLoading ? 'Проверяем доступ...' : hero.title}
                            </h2>
                            <p className="mt-4 max-w-xl text-sm leading-6 text-current/80 sm:text-base">{hero.description}</p>
                        </div>

                        <div className="w-full max-w-md">
                            <button
                                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-white px-5 py-4 text-base font-semibold text-slate-950 transition hover:scale-[0.99] disabled:opacity-60"
                                onClick={handlePrimaryAction}
                                disabled={isLoading}
                            >
                                <span>{hero.cta}</span>
                                <ArrowRight size={18} />
                            </button>
                            <p className="mt-3 text-sm text-current/80">{hero.secondary}</p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
                    <section className="rounded-[32px] border border-white/10 bg-black/25 p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Что дальше</p>
                                <h2 className="mt-2 text-2xl font-semibold text-white">
                                    {connectionState === 'connected' ? 'Доступ уже настроен' : 'Следующий шаг всегда виден сразу'}
                                </h2>
                            </div>
                            <BadgeCheck className="text-white/60" size={24} />
                        </div>

                        <div className="mt-5 grid gap-3">
                            {showConnectionSteps ? (
                                <>
                                    <StepCard
                                        index="1"
                                        title="Открой экран конфигурации"
                                        description="Если активная подписка одна, конфиг загрузится автоматически без дополнительного выбора."
                                        actionLabel="Открыть"
                                        onClick={() => navigate('/config')}
                                    />
                                    <StepCard
                                        index="2"
                                        title="Скопируй конфиг"
                                        description="На экране подключения главная кнопка сразу копирует готовую подписочную ссылку."
                                    />
                                    <StepCard
                                        index="3"
                                        title="Открой Hiddify и вставь ссылку"
                                        description="Ссылки на приложение и инструкцию находятся прямо под конфигом."
                                    />
                                </>
                            ) : null}

                            {showPurchaseSteps ? (
                                <>
                                    <StepCard
                                        index="1"
                                        title="Выбери тариф"
                                        description="Четыре понятных карточки без слайдера и лишних аргументов по бокам."
                                        actionLabel="Открыть"
                                        onClick={openSheet}
                                    />
                                    <StepCard
                                        index="2"
                                        title="Оплати доступ"
                                        description="После оплаты пользователь не теряется: следующий шаг сразу ведёт к конфигу."
                                    />
                                    <StepCard
                                        index="3"
                                        title="Подключись через готовый конфиг"
                                        description="Как только подписка станет активной, главный экран переключится в режим подключения."
                                    />
                                </>
                            ) : null}

                            {connectionState === 'connected' ? (
                                <>
                                    <StepCard
                                        index="1"
                                        title="Получи конфиг снова"
                                        description="Если нужно переподключить устройство, конфиг можно открыть заново в один тап."
                                        actionLabel="Открыть"
                                        onClick={() => navigate('/config')}
                                    />
                                    <StepCard
                                        index="2"
                                        title="Продли заранее"
                                        description="Цена продления уже видна на главном экране, чтобы не терять доступ внезапно."
                                        actionLabel="Продлить"
                                        onClick={openSheet}
                                    />
                                </>
                            ) : null}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Детали подписки</p>
                            {latestSubscription ? (
                                <div className="mt-5 space-y-4">
                                    <div>
                                        <p className="text-sm text-white/45">Регион</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{formatRegion(latestSubscription)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-white/45">Тариф</p>
                                            <p className="mt-1 font-medium text-white">{formatSubscriptionPlan(latestSubscription)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/45">Устройства</p>
                                            <p className="mt-1 font-medium text-white">{latestSubscription.device_count || 1}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-5 text-sm leading-6 text-white/65">
                                    Пока подписки нет. Как только доступ появится, здесь покажем регион и параметры тарифа.
                                </p>
                            )}
                        </section>

                        <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Вторичные действия</p>
                            <div className="mt-5 grid gap-3">
                                <button
                                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                                    onClick={() => navigate('/account')}
                                >
                                    <span>Управление / Аккаунт</span>
                                    <User size={16} />
                                </button>
                                <button
                                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                                    onClick={() => openExternalLink(SUPPORT_URL)}
                                >
                                    <span>Написать в поддержку</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {isSheetOpen ? (
                <TariffsSheet
                    plans={plans}
                    selectedPlan={selectedPlan}
                    selectedPlanId={selectedPlanId}
                    setSelectedPlanId={setSelectedPlanId}
                    isSubmitting={isSubmitting}
                    isRenewalFlow={isRenewalFlow}
                    latestSubscription={latestSubscription}
                    onSubmit={submitSelectedPlan}
                    onClose={closeSheet}
                />
            ) : null}
        </>
    );
}
