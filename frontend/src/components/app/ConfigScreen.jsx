import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Copy, ExternalLink, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSubscriptionConfig } from '../../services/api';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useConnectionState } from '../../hooks/useConnectionState';
import { copyText } from '../../utils/clipboard';
import { HIDDIFY_GUIDE_URL, HIDDIFY_PLATFORM_LINKS } from '../../constants/hiddify';
import { openExternalLink, showAppAlert } from '../../utils/telegram';
import { formatRegion } from '../../utils/subscriptions';

function ConfigCard({ item, isPrimary, onCopy }) {
    return (
        <div className={`rounded-[28px] border p-5 ${isPrimary ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-white/10 bg-white/[0.04]'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                        {item.protocol_type ? item.protocol_type.toUpperCase() : 'Подписочная ссылка'}
                    </p>
                    <p className="mt-3 break-all text-sm leading-6 text-white/80">{item.config}</p>
                </div>
                <button
                    className="shrink-0 rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                    onClick={() => onCopy(item.config)}
                >
                    <span className="flex items-center gap-2">
                        <Copy size={16} />
                        <span>Скопировать</span>
                    </span>
                </button>
            </div>
        </div>
    );
}

function ConfigTabs({ activeTab, setActiveTab, hasSubscriptionLinks, hasConfigs }) {
    if (!hasSubscriptionLinks || !hasConfigs) {
        return null;
    }

    return (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === 'subscription' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                onClick={() => setActiveTab('subscription')}
            >
                Подписочная ссылка
            </button>
            <button
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === 'configs' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                onClick={() => setActiveTab('configs')}
            >
                Конфиги
            </button>
        </div>
    );
}

export default function ConfigScreen() {
    const navigate = useNavigate();
    const { activeSubscriptions, latestSubscription, isLoading: subscriptionsLoading, error: subscriptionsError } = useSubscriptions();
    const activeSubscription = activeSubscriptions[0] || null;
    const { markSeenConfig, markCopiedConfig } = useConnectionState(activeSubscription || latestSubscription);
    const [configs, setConfigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('subscription');

    useEffect(() => {
        let active = true;

        async function loadConfig() {
            if (!activeSubscription?.id) {
                setConfigs([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const response = await fetchSubscriptionConfig(activeSubscription.id);

                if (active) {
                    setConfigs(response);
                    markSeenConfig();
                }
            } catch (loadError) {
                if (active) {
                    setError(loadError?.response?.data?.detail || 'Не удалось загрузить конфигурацию.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        if (!subscriptionsLoading) {
            loadConfig();
        }

        return () => {
            active = false;
        };
    }, [activeSubscription?.id, markSeenConfig, refreshKey, subscriptionsLoading]);

    const subscriptionLinks = useMemo(
        () => configs.filter((item) => !item.protocol_type),
        [configs]
    );
    const protocolConfigs = useMemo(
        () => configs.filter((item) => item.protocol_type),
        [configs]
    );
    const visibleConfigs = useMemo(() => {
        if (subscriptionLinks.length && protocolConfigs.length) {
            return activeTab === 'subscription' ? subscriptionLinks : protocolConfigs;
        }
        return subscriptionLinks.length ? subscriptionLinks : protocolConfigs;
    }, [activeTab, protocolConfigs, subscriptionLinks]);
    const primaryConfig = visibleConfigs[0] || null;

    useEffect(() => {
        if (subscriptionLinks.length && !protocolConfigs.length) {
            setActiveTab('subscription');
        } else if (!subscriptionLinks.length && protocolConfigs.length) {
            setActiveTab('configs');
        }
    }, [protocolConfigs.length, subscriptionLinks.length]);

    async function handleCopy(value) {
        try {
            await copyText(value);
            markCopiedConfig();
            showAppAlert('Конфиг скопирован.');
        } catch {
            showAppAlert('Не удалось скопировать конфиг.');
        }
    }

    if (subscriptionsLoading) {
        return <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-white">Проверяем подписку...</div>;
    }

    if (!activeSubscription) {
        return (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 text-white">
                <section className="rounded-[32px] border border-orange-400/20 bg-orange-400/10 p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100/70">Конфиг недоступен</p>
                    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Сначала открой доступ</h1>
                    <p className="mt-3 text-sm leading-6 text-orange-50/80">
                        Без активной подписки конфиг недоступен. Перейди к тарифам и активируй доступ, затем вернись сюда.
                    </p>
                    <button
                        className="mt-6 inline-flex items-center gap-2 rounded-[22px] bg-white px-5 py-4 text-base font-semibold text-black"
                        onClick={() => navigate('/tariffs')}
                    >
                        <span>Перейти к тарифам</span>
                        <ArrowRight size={18} />
                    </button>
                </section>
                {subscriptionsError ? (
                    <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                        {subscriptionsError}
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 text-white">
            <section className="rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50/70">Конфиг</p>
                        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Готов к копированию сразу после открытия</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">
                            {formatRegion(activeSubscription)} · {activeSubscription.device_count || 1} устройство.
                        </p>
                    </div>
                    {primaryConfig ? (
                        <button
                            className="inline-flex items-center gap-2 rounded-[22px] bg-white px-5 py-4 text-base font-semibold text-black"
                            onClick={() => handleCopy(primaryConfig.config)}
                        >
                            <Copy size={18} />
                            <span>Скопировать конфиг</span>
                        </button>
                    ) : null}
                </div>
            </section>

            {error ? (
                <div className="rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
            ) : null}

            <section className="rounded-[32px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Конфигурации</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Открой, скопируй, подключись</h2>
                    </div>
                    <button
                        className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/8 hover:text-white"
                        onClick={() => setRefreshKey((value) => value + 1)}
                    >
                        <span className="flex items-center gap-2">
                            <RefreshCcw size={16} />
                            <span>Обновить</span>
                        </span>
                    </button>
                </div>

                <ConfigTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    hasSubscriptionLinks={subscriptionLinks.length > 0}
                    hasConfigs={protocolConfigs.length > 0}
                />

                {isLoading ? (
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-sm text-white/65">Загружаем конфигурацию...</div>
                ) : visibleConfigs.length ? (
                    <div className="space-y-3">
                        {visibleConfigs.map((item, index) => (
                            <ConfigCard
                                key={`${item.protocol_type || 'subscription'}-${index}`}
                                item={item}
                                isPrimary={index === 0}
                                onCopy={handleCopy}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 text-sm text-white/65">Конфигов пока нет.</div>
                )}
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Клиент</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Hiddify для быстрого подключения</h2>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                    {HIDDIFY_PLATFORM_LINKS.map((platform) => (
                        <button
                            key={platform.key}
                            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                            onClick={() => openExternalLink(platform.url)}
                        >
                            {platform.label}
                        </button>
                    ))}
                    <button
                        className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/8 hover:text-white"
                        onClick={() => openExternalLink(HIDDIFY_GUIDE_URL)}
                    >
                        <span className="flex items-center gap-2">
                            <span>Инструкция</span>
                            <ExternalLink size={16} />
                        </span>
                    </button>
                </div>
            </section>
        </div>
    );
}
