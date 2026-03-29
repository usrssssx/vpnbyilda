import React from 'react';
import { ArrowRight, LifeBuoy, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SUPPORT_URL } from '../../utils/config';
import { openExternalLink } from '../../utils/telegram';
import { formatRegion, formatSubscriptionStatus, getSubscriptionState } from '../../utils/subscriptions';

function getDisplayName(user) {
    return [user?.first_name || user?.firstName, user?.last_name || user?.lastName]
        .filter(Boolean)
        .join(' ') || 'Пользователь';
}

export default function AccountScreen() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { latestSubscription, isLoading, error } = useSubscriptions();
    const state = getSubscriptionState(latestSubscription);
    const hasAccess = state === 'active' || state === 'expiring';

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 text-white">
            <section className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[28px] border border-white/12 bg-white/10">
                        <User size={26} className="text-white/80" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Аккаунт</p>
                        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{getDisplayName(user)}</h1>
                        <p className="mt-2 text-sm text-white/65">@{user?.username || 'telegram-user'}</p>
                    </div>
                </div>
            </section>

            {error ? (
                <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Статус доступа</p>
                {isLoading ? (
                    <p className="mt-4 text-sm text-white/65">Загружаем данные...</p>
                ) : latestSubscription ? (
                    <div className="mt-5 space-y-4">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <p className="text-sm text-white/45">Текущий статус</p>
                            <p className="mt-1 text-xl font-semibold text-white">{formatSubscriptionStatus(latestSubscription)}</p>
                            <p className="mt-3 text-sm text-white/60">{formatRegion(latestSubscription)}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                className="flex items-center justify-between rounded-[24px] border border-white/10 px-4 py-4 text-left text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                                onClick={() => navigate(hasAccess ? '/config' : '/tariffs')}
                            >
                                <span>{hasAccess ? 'Получить конфиг снова' : 'Продлить / изменить'}</span>
                                <ShieldCheck size={16} />
                            </button>
                            <button
                                className="flex items-center justify-between rounded-[24px] border border-white/10 px-4 py-4 text-left text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                                onClick={() => openExternalLink(SUPPORT_URL)}
                            >
                                <span>Написать в поддержку</span>
                                <LifeBuoy size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
                        Подписка пока не оформлена. Основное действие сейчас: открыть тарифы и активировать доступ.
                    </div>
                )}
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Быстрые действия</p>
                <div className="mt-4 grid gap-3">
                    <button
                        className="flex items-center justify-between rounded-[24px] border border-white/10 px-4 py-4 text-left text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                        onClick={() => navigate(hasAccess ? '/config' : '/tariffs')}
                    >
                        <span>{hasAccess ? 'Получить конфиг снова' : 'Открыть тарифы'}</span>
                        <ArrowRight size={16} />
                    </button>
                    <button
                        className="flex items-center justify-between rounded-[24px] border border-white/10 px-4 py-4 text-left text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                        onClick={() => openExternalLink(SUPPORT_URL)}
                    >
                        <span>Написать в поддержку</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>
        </div>
    );
}
