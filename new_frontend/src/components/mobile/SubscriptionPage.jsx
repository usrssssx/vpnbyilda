import { useState } from 'react';
import { Shield, Calendar, CreditCard, Clock, User, ChevronRight, Check, AlertCircle, ArrowRight, Settings, BarChart4, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TelegramUser from '../../../TelegramUser';

export default function MobileSubscriptionPage() {
    const [autoRenewal, setAutoRenewal] = useState(true);
    const [visiblePayments, setVisiblePayments] = useState(3); // Состояние для отслеживания количества видимых платежей
    const navigate = useNavigate();
    const telegramUser = TelegramUser.getUser();

    const subscription = {
        plan: "6 месяцев",
        status: "Активна",
        startDate: "15 февраля 2025",
        endDate: "15 августа 2025",
        nextPayment: "15 августа 2025",
        daysLeft: 31,
        price: 2399,
        paymentMethod: "Visa •••• 4587"
    };

    // История платежей
    const paymentHistory = [
        { date: "15 февраля 2025", amount: 2399, status: "Оплачено" },
        { date: "15 августа 2024", amount: 2399, status: "Оплачено" },
        { date: "15 февраля 2024", amount: 2399, status: "Оплачено" },
        { date: "15 августа 2023", amount: 2399, status: "Оплачено" }
    ];

    // Функция для переключения автопродления
    const toggleAutoRenewal = () => {
        setAutoRenewal(!autoRenewal);
    };

    // Функция для показа большего количества платежей
    const showMorePayments = () => {
        setVisiblePayments(paymentHistory.length); // Показать все платежи
    };

    // Функция для сворачивания списка платежей
    const collapsePayments = () => {
        setVisiblePayments(3); // Вернуть к показу только 3 платежей
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-black text-white">
            {/* Основная секция с градиентом */}
            <div className="w-full lg:w-[70%] relative p-4 sm:p-6 lg:p-8 flex flex-col"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}>
                <div className="flex items-center mb-6 sm:mb-10">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Управление подпиской</h1>

                {/* Адаптивная сетка для текущей подписки и способов оплаты */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Текущая подписка */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Текущая подписка</h2>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm opacity-80">Тариф</p>
                                <p className="text-base sm:text-lg font-medium">{subscription.plan}</p>
                            </div>
                            <div className="bg-green-500/20 px-2 sm:px-3 py-1 rounded-full">
                                <p className="text-xs sm:text-sm text-green-400 font-medium">{subscription.status}</p>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                                <p className="text-sm">Начало: {subscription.startDate}</p>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                                <p className="text-sm">Окончание: {subscription.endDate}</p>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 text-purple-400 mr-2" />
                                <p className="text-sm">Осталось дней: {subscription.daysLeft}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-white/10">
                            <button className="text-sm text-red-400 hover:text-red-300 transition">
                                Отменить подписку
                            </button>
                        </div>
                    </div>

                    {/* Способы оплаты */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold mb-4">Способ оплаты</h2>

                        <div className="flex items-center mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-medium">{subscription.paymentMethod}</p>
                                <p className="text-sm opacity-70">Срок действия: 06/27</p>
                            </div>
                        </div>

                        <div className="mb-4 sm:mb-6">
                            <p className="text-sm opacity-80 mb-2">Следующий платеж</p>
                            <div className="flex justify-between">
                                <p className="font-medium">{subscription.nextPayment}</p>
                                <p className="font-medium">{subscription.price} ₽</p>
                            </div>
                        </div>

                        
                    </div>
                </div>

                {/* История платежей - адаптировано для мобильных */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">История платежей</h2>

                    <div className="space-y-2 sm:space-y-3">
                        {/* Показываем только видимое количество платежей */}
                        {paymentHistory.slice(0, visiblePayments).map((payment, index) => (
                            <div key={index} className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center">
                                    <div className="bg-purple-500/20 rounded-full p-1.5 mr-2 sm:mr-3 hidden sm:block">
                                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium">{payment.date}</p>
                                        <p className="text-xs opacity-70 hidden sm:block">Тариф: 6 месяцев</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm sm:font-medium">{payment.amount} ₽</p>
                                    <p className="text-xs text-green-400">{payment.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Управление видимостью платежей - показываем соответствующую кнопку */}
                    <div className="mt-3 sm:mt-4 flex justify-center">
                        {/* Кнопка "Показать больше" видна если есть скрытые платежи */}
                        {visiblePayments < paymentHistory.length && (
                            <button
                                className="w-full py-2 border border-white/20 rounded-lg text-xs sm:text-sm hover:bg-white/5 transition flex items-center justify-center"
                                onClick={showMorePayments}
                            >
                                Показать больше
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            </button>
                        )}

                        {/* Кнопка "Свернуть" видна если показаны все платежи и их больше 3 */}
                        {visiblePayments > 3 && visiblePayments === paymentHistory.length && (
                            <button
                                className="w-full py-2 border border-white/20 rounded-lg text-xs sm:text-sm hover:bg-white/5 transition flex items-center justify-center"
                                onClick={collapsePayments}
                            >
                                Свернуть
                                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Профильная секция - адаптирована для мобильных */}
            <div className="w-full lg:w-[30%] p-4 sm:p-5 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10">
                <div className="w-full max-w-xs mx-auto lg:mx-0 lg:sticky lg:top-5 lg:pl-5">
                    <h2 className="text-xl font-bold mb-2 sm:mb-4">Личный профиль</h2>
                    <p className="text-xs opacity-80 mb-4">Управляйте настройками и предпочтениями аккаунта</p>

                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold mr-3">
                            {telegramUser.photoUrl ? (
                                <img src={telegramUser.photoUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                            ) : (
                                telegramUser.initials
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{`${telegramUser.firstName} ${telegramUser.lastName}`}</p>
                            <p className="text-xs opacity-80">{telegramUser.username}</p>
                        </div>
                    </div>

                    {/* Кнопки навигации - адаптированы для мобильных */}
                    <div className="mt-2 mb-6 space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
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

                        <button className="w-full py-2.5 px-4 border border-white/20 bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/trial')}>
                            Пробный период
                        </button>
                    </div>

                    {/* Сводка по подписке */}
                    <div className="bg-white/5 rounded-lg p-3 sm:p-4 mb-6">
                        <h3 className="text-sm font-medium mb-3">Сводка по подписке</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="opacity-80">Тариф:</span>
                                <span className="font-medium">{subscription.plan}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="opacity-80">Статус:</span>
                                <span className="text-green-400">{subscription.status}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="opacity-80">Осталось:</span>
                                <span className="font-medium">{subscription.daysLeft} дней</span>
                            </div>
                            
                        </div>
                    </div>

                    {/* Быстрые действия - адаптированы для мобильных */}
                    <div className="space-y-2">
                        <div
                            className="flex items-center p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition"
                            onClick={() => {
                                // Проверяем, работает ли приложение в Telegram WebApp
                                if (window.Telegram && window.Telegram.WebApp) {
                                    // Открываем чат с ботом прямо в Telegram
                                    window.Telegram.WebApp.openTelegramLink('https://t.me/vpnsupportbyiluda_bot');
                                } else {
                                    // Запасной вариант для браузера
                                    window.open('https://t.me/vpnsupportbyiluda_bot', '_blank');
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