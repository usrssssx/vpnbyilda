import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Check,
    Clipboard,
    Command,
    ExternalLink,
    Globe,
    Laptop,
    Monitor,
    Shield,
    Smartphone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TelegramUser from '../../../TelegramUser';
import { HIDDIFY_GUIDE_URL, HIDDIFY_PLATFORM_LINKS } from '../../constants/hiddify';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { fetchSubscriptionConfig } from '../../services/api';
import { SUPPORT_URL } from '../../utils/config';
import { copyText } from '../../utils/clipboard';
import { openExternalLink, showAppAlert } from '../../utils/telegram';
import {
    formatRegion,
    formatRuDate,
    formatSubscriptionPlan,
    formatSubscriptionStatus,
    hasActiveSubscription,
} from '../../utils/subscriptions';

const platformIcons = {
    windows: Monitor,
    macos: Laptop,
    android: Smartphone,
    ios: Smartphone,
    linux: Command,
};

export default function DesktopVpnConnectPage() {
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
    const [configs, setConfigs] = useState([]);
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);
    const [configError, setConfigError] = useState('');
    const [copiedKey, setCopiedKey] = useState('');
    const navigate = useNavigate();
    const telegramUser = TelegramUser.getUser();
    const { subscriptions, activeSubscriptions, isLoading, error } = useSubscriptions();

    const selectableSubscriptions = activeSubscriptions.length ? activeSubscriptions : subscriptions;
    const selectedSubscription = useMemo(
        () => selectableSubscriptions.find((item) => item.id === selectedSubscriptionId) || selectableSubscriptions[0] || null,
        [selectableSubscriptions, selectedSubscriptionId]
    );

    useEffect(() => {
        if (!selectableSubscriptions.length) {
            setSelectedSubscriptionId('');
            return;
        }

        const exists = selectableSubscriptions.some((item) => item.id === selectedSubscriptionId);
        if (!exists) {
            setSelectedSubscriptionId(selectableSubscriptions[0].id);
        }
    }, [selectableSubscriptions, selectedSubscriptionId]);

    useEffect(() => {
        setConfigs([]);
        setConfigError('');
    }, [selectedSubscriptionId]);

    async function handleLoadConfigs() {
        if (!selectedSubscription?.id || !hasActiveSubscription(selectedSubscription)) {
            return;
        }

        setIsFetchingConfig(true);
        setConfigError('');
        try {
            const response = await fetchSubscriptionConfig(selectedSubscription.id);
            setConfigs(response);
        } catch (loadError) {
            setConfigs([]);
            setConfigError(loadError?.response?.data?.detail || 'Не удалось получить конфигурации.');
        } finally {
            setIsFetchingConfig(false);
        }
    }

    async function handleCopy(text, key) {
        try {
            await copyText(text);
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey(''), 2000);
        } catch {
            showAppAlert('Не удалось скопировать конфигурацию.');
        }
    }

    return (
        <div className="flex w-full h-screen bg-black text-white overflow-hidden">
            <div
                className="w-[70%] min-w-[70%] max-w-[70%] flex-shrink-0 relative overflow-y-auto h-screen"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}
            >
                <div className="p-8 pr-4">
                    <div className="flex items-center mb-10">
                        <Shield className="w-6 h-6 mr-2" />
                        <span className="text-xl font-bold">БезопасныйVPN</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-6">Подключение к VPN</h1>

                    {isLoading ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">Загружаю подписки...</div>
                    ) : !selectableSubscriptions.length ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                            <p className="text-xl font-semibold mb-2">Подписка не найдена</p>
                            <p className="text-sm opacity-80 mb-6">
                                Чтобы получить конфигурации VPN, сначала оформи подписку.
                            </p>
                            <button
                                className="py-3 px-5 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition"
                                onClick={() => navigate('/tariffs')}
                            >
                                Перейти к тарифам
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Выбор подписки</h2>
                                <div className="grid gap-3">
                                    {selectableSubscriptions.map((subscription) => (
                                        <button
                                            key={subscription.id}
                                            className={`text-left rounded-xl border p-4 transition ${
                                                selectedSubscription?.id === subscription.id
                                                    ? 'border-white/40 bg-white/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                            onClick={() => setSelectedSubscriptionId(subscription.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{formatSubscriptionPlan(subscription)}</p>
                                                    <p className="text-sm opacity-70">{formatRegion(subscription)}</p>
                                                </div>
                                                <p className="text-sm text-white/80">{formatSubscriptionStatus(subscription)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedSubscription && (
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-sm opacity-70 mb-1">Регион</p>
                                            <p className="font-medium">{formatRegion(selectedSubscription)}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-sm opacity-70 mb-1">Действует до</p>
                                            <p className="font-medium">{formatRuDate(selectedSubscription.expires_at)}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-sm opacity-70 mb-1">Устройства</p>
                                            <p className="font-medium">{selectedSubscription.device_count}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            className="flex-1 py-3 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleLoadConfigs}
                                            disabled={!hasActiveSubscription(selectedSubscription) || isFetchingConfig}
                                        >
                                            {isFetchingConfig ? 'Загружаю конфигурации...' : 'Получить конфигурацию'}
                                        </button>
                                        <button
                                            className="px-4 py-3 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/5 transition"
                                            onClick={() => openExternalLink(HIDDIFY_GUIDE_URL)}
                                        >
                                            Открыть инструкцию
                                        </button>
                                    </div>

                                    {!hasActiveSubscription(selectedSubscription) && (
                                        <p className="text-sm text-yellow-300/90 mt-4">
                                            Для этой подписки конфигурации недоступны, потому что она не активна.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Конфигурации</h2>
                                    {configs.length > 1 && (
                                        <button
                                            className="flex items-center text-sm text-purple-300 hover:text-purple-200 transition"
                                            onClick={() => handleCopy(configs.map((item) => item.config).join('\n\n'), 'all')}
                                        >
                                            {copiedKey === 'all' ? <Check className="w-4 h-4 mr-1" /> : <Clipboard className="w-4 h-4 mr-1" />}
                                            {copiedKey === 'all' ? 'Скопировано' : 'Скопировать все'}
                                        </button>
                                    )}
                                </div>

                                {configError ? (
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-100">
                                        {configError}
                                    </div>
                                ) : configs.length ? (
                                    <div className="space-y-4">
                                        {configs.map((item, index) => (
                                            <div key={`${item.protocol_type || 'subscription'}-${index}`} className="bg-black/40 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-sm font-medium">
                                                        {item.protocol_type ? String(item.protocol_type).toUpperCase() : 'Подписочная ссылка'}
                                                    </p>
                                                    <button
                                                        className="flex items-center text-sm text-purple-300 hover:text-purple-200 transition"
                                                        onClick={() => handleCopy(item.config, `${index}`)}
                                                    >
                                                        {copiedKey === `${index}` ? <Check className="w-4 h-4 mr-1" /> : <Clipboard className="w-4 h-4 mr-1" />}
                                                        {copiedKey === `${index}` ? 'Скопировано' : 'Скопировать'}
                                                    </button>
                                                </div>
                                                <pre className="overflow-x-auto whitespace-pre-wrap text-sm font-mono">{item.config}</pre>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-white/5 p-4 text-sm opacity-80">
                                        Нажми «Получить конфигурацию», чтобы загрузить реальные данные для выбранной подписки.
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">Приложение для подключения</h2>
                                        <p className="text-sm opacity-80 mt-1">Используй официальный клиент Hiddify.</p>
                                    </div>
                                    <button
                                        className="flex items-center text-sm text-purple-300 hover:text-purple-200 transition"
                                        onClick={() => openExternalLink(HIDDIFY_GUIDE_URL)}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Инструкция
                                    </button>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {HIDDIFY_PLATFORM_LINKS.map((platform) => {
                                        const Icon = platformIcons[platform.key];
                                        return (
                                            <button
                                                key={platform.key}
                                                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                                                onClick={() => openExternalLink(platform.url)}
                                            >
                                                <Icon className="w-8 h-8 mb-2 text-purple-400" />
                                                <p className="text-sm font-medium">{platform.label}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {error && !selectableSubscriptions.length && (
                        <p className="mt-4 text-sm text-red-100">{error}</p>
                    )}
                </div>
            </div>

            <div className="w-[30%] min-w-[30%] max-w-[30%] flex-shrink-0 p-5 flex flex-col h-screen sticky top-0 border-l border-white/10">
                <div className="w-full max-w-xs pl-1">
                    <h2 className="text-xl font-bold mb-4">Личный профиль</h2>
                    <p className="text-xs opacity-80 mb-4">Подключайся через реальные конфигурации своей подписки</p>
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold mr-3">
                            {telegramUser.photoUrl ? (
                                <img src={telegramUser.photoUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                            ) : (
                                telegramUser.initials
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{`${telegramUser.firstName} ${telegramUser.lastName}`.trim()}</p>
                            <p className="text-xs opacity-80">{telegramUser.username || 'Пользователь Telegram'}</p>
                        </div>
                    </div>

                    <div className="mt-2 mb-6 space-y-3">
                        <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/profile')}>
                            Профиль
                        </button>
                        <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/subscription')}>
                            Управление подпиской
                        </button>
                        <button className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/tariffs')}>
                            Оформить подписку
                        </button>
                    </div>

                    {selectedSubscription && (
                        <div className="bg-white/5 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium mb-3">Выбранная подписка</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="opacity-80">Тариф</span>
                                    <span className="font-medium">{formatSubscriptionPlan(selectedSubscription)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-80">Регион</span>
                                    <span className="font-medium text-right">{formatRegion(selectedSubscription)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-80">Статус</span>
                                    <span className="font-medium">{formatSubscriptionStatus(selectedSubscription)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div
                            className="flex items-center p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition"
                            onClick={() => {
                                if (window.Telegram && window.Telegram.WebApp) {
                                    window.Telegram.WebApp.openTelegramLink(SUPPORT_URL);
                                } else {
                                    window.open(SUPPORT_URL, '_blank');
                                }
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                                <AlertCircle className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-medium">Техническая поддержка</p>
                            </div>
                            <ArrowRight className="w-4 h-4 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
