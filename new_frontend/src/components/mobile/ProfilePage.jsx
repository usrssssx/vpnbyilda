import { useState } from 'react';
import { Shield, Calendar, CreditCard, Clock, User, Settings, LogOut, ChevronRight, Lock, CheckCircle, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MobileProfilePage() {
    const navigate = useNavigate();

    // Имитация данных пользователя
    const telegramUser = {
        firstName: 'Иван',
        lastName: 'Петров',
        username: '@ivanpetrov',
        initials: 'ИП',
        photoUrl: null
    };

    // Функция для навигации - заменена с navigateTo на navigate
    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-black text-white">
            {/* Главная секция - градиент на мобильных будет сверху */}
            <div className="w-full relative p-4 flex flex-col"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}>
                <div className="flex items-center mb-8">
                    <Shield className="w-5 h-5 mr-2" />
                </div>
                <div className="flex-grow flex flex-col justify-center items-center text-center px-2">
                    <h1 className="text-2xl font-bold mb-3">Ваша подписка</h1>
                    <p className="text-base mb-8 max-w-md opacity-90">
                        Снизу представлена краткая сводка о вашей подписке
                    </p>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-sm opacity-80">Текущий тарифный план</p>
                                <div className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-purple-400" />
                                    <span className="font-medium">12 месяцев</span>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-sm opacity-80 mb-2">Действует до</p>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                                <span className="font-medium">12 мая 2026</span>
                            </div>
                        </div>
                        
                        <button
                            className="w-full py-3 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition"
                            onClick={() => navigateTo('/subscription')}
                        >
                            Управление подпиской
                        </button>
                    </div>
                </div>
                <button onClick={() => navigateTo('/subscription')}>
                    <div className="w-full max-w-md mx-auto mt-8 mb-4">
                        <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm cursor-pointer">
                            <div className="bg-white/20 rounded-full p-2 mr-3">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-medium">Вся информация о вашей подписке</p>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-60" />
                        </div>
                    </div>
                </button>
            </div>
            {/* Профильная секция - на мобильных будет снизу */}
            <div className="w-full p-4 flex flex-col border-t border-white/10">
                <h2 className="text-xl font-bold mb-2">Личный профиль</h2>
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
                        <p className="text-xs opacity-80">{telegramUser.username || 'Премиум план'}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/vpn')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Подключиться к VPN
                    </button>
                    <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/tariffs')}>
                        Оформить подписку
                    </button>
                    <button className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/subscription')}>
                        Управление подпиской
                    </button>
                    <button className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/trial')}>
                        Пробный период
                    </button>
                </div>
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
    );
}