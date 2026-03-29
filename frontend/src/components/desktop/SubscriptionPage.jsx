import { useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CreditCard,
    Globe,
    Shield,
    Smartphone,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TelegramUser from '../../../TelegramUser';
import { useSubscriptionDetails, useSubscriptions } from '../../hooks/useSubscriptions';
import { cancelSubscription } from '../../services/api';
import { SUPPORT_URL } from '../../utils/config';
import { confirmAppAction, showAppAlert } from '../../utils/telegram';
import {
    formatProtocols,
    formatRegion,
    formatRuDate,
    formatSubscriptionPlan,
    formatSubscriptionStatus,
    getDaysLeft,
    hasActiveSubscription,
} from '../../utils/subscriptions';

export default function DesktopSubscriptionPage() {
    const [isCanceling, setIsCanceling] = useState(false);
    const navigate = useNavigate();
    const { subscriptionId } = useParams();
    const telegramUser = TelegramUser.getUser();
    const { subscription: rawSubscription, price, isLoading, error, reload } = useSubscriptionDetails(subscriptionId);
    const { reloadSubscriptions } = useSubscriptions();

    const subscription = rawSubscription ? {
        plan: formatSubscriptionPlan(rawSubscription),
        status: formatSubscriptionStatus(rawSubscription),
        startDate: formatRuDate(rawSubscription.start_date),
        endDate: formatRuDate(rawSubscription.expires_at),
        nextPayment: formatRuDate(rawSubscription.expires_at),
        daysLeft: getDaysLeft(rawSubscription.expires_at),
        price: Math.round(price || 0),
        paymentMode: 'Тестовый режим оплаты',
        region: formatRegion(rawSubscription),
        protocols: formatProtocols(rawSubscription.protocol_types),
    } : null;

    async function handleCancel() {
        if (!rawSubscription?.id || !hasActiveSubscription(rawSubscription)) {
            return;
        }

        const confirmed = await confirmAppAction('Отменить подписку и сразу отозвать доступ к VPN?');
        if (!confirmed) {
            return;
        }

        setIsCanceling(true);
        try {
            await cancelSubscription(rawSubscription.id);
            await Promise.all([reload(), reloadSubscriptions()]);
            showAppAlert('Подписка отменена.');
        } catch (cancelError) {
            showAppAlert(cancelError?.response?.data?.detail || 'Не удалось отменить подписку.');
        } finally {
            setIsCanceling(false);
        }
    }

    return (
        <div className="flex w-full h-screen bg-black text-white overflow-hidden">
            <div
                className="w-[70%] min-w-[70%] max-w-[70%] flex-shrink-0 flex-grow-0 relative overflow-y-auto h-screen"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}
            >
                <div className="p-8">
                    <div className="flex items-center mb-10">
                        <Shield className="w-6 h-6 mr-2" />
                        <span className="text-xl font-bold">БезопасныйVPN</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-6">Управление подпиской</h1>

                    {isLoading ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">Загружаю подписку...</div>
                    ) : error || !subscription ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                            <p className="font-medium mb-2">Подписка недоступна</p>
                            <p className="text-sm opacity-80">{error || 'Не удалось получить данные подписки.'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-6 mb-8">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex-1">
                                    <h2 className="text-xl font-semibold mb-4">Текущая подписка</h2>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm opacity-80">Тариф</p>
                                            <p className="text-lg font-medium">{subscription.plan}</p>
                                        </div>
                                        <div className="bg-green-500/20 px-3 py-1 rounded-full">
                                            <p className="text-sm text-green-400 font-medium">{subscription.status}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                                            <p className="text-sm">Начало: {subscription.startDate}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                                            <p className="text-sm">Окончание: {subscription.endDate}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                                            <p className="text-sm">Осталось дней: {subscription.daysLeft}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <button
                                            className="text-sm text-red-400 hover:text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleCancel}
                                            disabled={isCanceling || !hasActiveSubscription(rawSubscription)}
                                        >
                                            {isCanceling ? 'Отменяю подписку...' : 'Отменить подписку'}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex-1">
                                    <h2 className="text-xl font-semibold mb-4">Статус оплаты</h2>
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{subscription.paymentMode}</p>
                                            <p className="text-sm opacity-70">Без реальной оплаты в текущей среде</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <p className="text-sm opacity-80">Следующее продление</p>
                                            <p className="font-medium">{subscription.nextPayment}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-sm opacity-80">Стоимость продления</p>
                                            <p className="font-medium">{subscription.price} ₽</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
                                <h2 className="text-xl font-semibold mb-4">Параметры подписки</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                                        <Globe className="w-4 h-4 text-purple-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium">Регион</p>
                                            <p className="text-xs opacity-70">{subscription.region}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                                        <Smartphone className="w-4 h-4 text-purple-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium">Устройства</p>
                                            <p className="text-xs opacity-70">{rawSubscription.device_count}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                                        <Shield className="w-4 h-4 text-purple-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium">Протоколы</p>
                                            <p className="text-xs opacity-70">{subscription.protocols}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                                        <Calendar className="w-4 h-4 text-purple-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium">Статус</p>
                                            <p className="text-xs opacity-70">{subscription.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="w-[30%] min-w-[30%] max-w-[30%] flex-shrink-0 p-5 flex flex-col h-screen sticky top-0 border-l border-white/10">
                <div className="w-full max-w-xs pl-1">
                    <h2 className="text-xl font-bold mb-4">Личный профиль</h2>
                    <p className="text-xs opacity-80 mb-4">Управляйте настройками и статусом вашей подписки</p>
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
                        <button className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/vpn')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Подключиться к VPN
                        </button>
                        <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/profile')}>
                            Профиль
                        </button>
                        <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/tariffs')}>
                            Оформить подписку
                        </button>
                    </div>

                    {subscription && (
                        <div className="bg-white/5 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium mb-3">Сводка</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="opacity-80">Тариф</span>
                                    <span className="font-medium">{subscription.plan}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-80">Статус</span>
                                    <span className="font-medium">{subscription.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-80">Регион</span>
                                    <span className="font-medium text-right">{subscription.region}</span>
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
