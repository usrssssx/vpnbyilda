import { AlertCircle, ArrowRight, Calendar, Shield, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TelegramUser from '../../../TelegramUser';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SUPPORT_URL } from '../../utils/config';
import { formatRegion, formatRuDate, hasActiveSubscription } from '../../utils/subscriptions';

export default function DesktopProfilePage() {
    const navigate = useNavigate();
    const telegramUser = TelegramUser.getUser();
    const { latestSubscription } = useSubscriptions();
    const activeSubscription = hasActiveSubscription(latestSubscription) ? latestSubscription : null;
    const primaryActionPath = activeSubscription ? '/vpn' : '/tariffs';
    const primaryActionLabel = activeSubscription ? 'Подключить VPN' : 'Оформить подписку';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            <div
                className="w-[70%] min-w-[70%] max-w-[70%] flex-shrink-0 flex-grow-0 relative p-8 flex flex-col"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}
            >
                <div className="flex items-center mb-16">
                    <Shield className="w-6 h-6 mr-2" />
                    <span className="text-xl font-bold">БезопасныйVPN</span>
                </div>

                <div className="flex-grow flex flex-col justify-center items-center text-center">
                    <h1 className="text-4xl font-bold mb-4">Подключение в один тап</h1>
                    <p className="text-lg mb-10 max-w-md opacity-90">
                        {activeSubscription
                            ? 'Подписка активна. Открой конфигурации и подключайся к VPN без лишних действий.'
                            : 'Активной подписки нет. Оформи тариф и сразу получи рабочую конфигурацию.'}
                    </p>

                    <button
                        className="w-full max-w-xl rounded-3xl bg-white text-purple-900 px-8 py-10 text-3xl font-bold hover:bg-white/90 transition"
                        onClick={() => navigate(primaryActionPath)}
                    >
                        {primaryActionLabel}
                    </button>

                    <div className="mt-8 w-full max-w-xl rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 text-left">
                        {activeSubscription ? (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Регион</p>
                                    <p className="font-medium">{formatRegion(activeSubscription)}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Действует до</p>
                                    <p className="font-medium">{formatRuDate(activeSubscription.expires_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Устройства</p>
                                    <p className="font-medium">{activeSubscription.device_count}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <p className="text-xl font-semibold mb-2">Подписка не найдена</p>
                                    <p className="text-sm opacity-80">
                                        Оформи тариф, чтобы открыть конфигурации и подключиться к VPN.
                                    </p>
                                </div>
                                <button
                                    className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium hover:bg-white/5 transition"
                                    onClick={() => navigate('/tariffs')}
                                >
                                    Перейти к тарифам
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-auto w-full max-w-5xl pb-4">
                    <div
                        className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm cursor-pointer"
                        onClick={() => navigate(activeSubscription ? '/subscription' : '/tariffs')}
                    >
                        <div className="bg-white/20 rounded-full p-2 mr-3">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm font-medium">
                                {activeSubscription ? 'Управление действующей подпиской' : 'Выбери подходящий тариф'}
                            </p>
                            <p className="text-xs sm:text-sm opacity-80">
                                {activeSubscription ? 'Срок, параметры и отмена подписки' : 'Цены уже загружаются из backend'}
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 opacity-60" />
                    </div>
                </div>
            </div>

            <div className="w-[30%] min-w-[30%] max-w-[30%] flex-shrink-0 flex-grow-0 p-5 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Личный профиль</h2>

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
                    <button
                        className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center justify-center"
                        onClick={() => navigate(primaryActionPath)}
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        {primaryActionLabel}
                    </button>

                    <button
                        className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center"
                        onClick={() => navigate('/subscription')}
                    >
                        Управление подпиской
                    </button>

                    <button
                        className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center"
                        onClick={() => navigate('/tariffs')}
                    >
                        Оформить подписку
                    </button>

                </div>

                <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium mb-3">Текущий статус</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                            <Calendar className="w-4 h-4 text-purple-400 mr-2 mt-0.5" />
                            <div>
                                <p className="opacity-70">Подписка</p>
                                <p className="font-medium">
                                    {activeSubscription ? `до ${formatRuDate(activeSubscription.expires_at)}` : 'не активна'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Smartphone className="w-4 h-4 text-purple-400 mr-2 mt-0.5" />
                            <div>
                                <p className="opacity-70">Устройства</p>
                                <p className="font-medium">{activeSubscription?.device_count || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

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
    );
}
