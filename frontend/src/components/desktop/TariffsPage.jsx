import { useState } from 'react';
import { Shield, Globe, CreditCard, User, ChevronRight, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TelegramUser from '../../../TelegramUser';
import { useTariffPlans } from '../../hooks/useTariffPlans';
import { SUPPORT_URL } from '../../utils/config';

export default function DesktopTariffsPage() {
    const [selectedPlan, setSelectedPlan] = useState(1); // 0: 1 месяц, 1: 3 месяца, 2: 6 месяцев, 3: 12 месяцев
    const navigate = useNavigate();
    const telegramUser = TelegramUser.getUser();
    const { plans, isSubmitting, buyPlan } = useTariffPlans(navigate);

    // Преимущества VPN
    const benefits = [
        'Полная приватность в интернете',
        'Доступ к глобальному контенту',
        'Защита от слежки и рекламы',
        'Безлимитная скорость и трафик',
        'Одновременное подключение до 5 устройств'
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            {/* Левая сторона - 70% с градиентом */}
            <div className="w-[70%] min-w-[70%] max-w-[70%] flex-shrink-0 flex-grow-0 relative p-8 flex flex-col"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}>
                <div className="flex items-center mb-10">
                    <Shield className="w-6 h-6 mr-2" />
                    <span className="text-xl font-bold">БезопасныйVPN</span>
                </div>

                <div className="flex-grow flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-3 text-center">Выберите подходящий тариф</h1>
                    <p className="text-lg mb-10 max-w-md opacity-90 text-center">
                        Получите полную приватность и безопасность по выгодной цене
                    </p>

                    {/* Слайдер выбора тарифа */}
                    <div className="w-full max-w-xl mb-8">
                        <div className="flex justify-between mb-4 px-2">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`text-center cursor-pointer transition-all duration-200 ${selectedPlan === plan.id ? 'text-white scale-110' : 'text-white/60 hover:text-white/80'}`}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    <p className="text-sm font-medium">{plan.name}</p>
                                    {plan.discount > 0 && (
                                        <span className="text-xs bg-green-500 text-black px-1.5 py-0.5 rounded-full font-medium">-{plan.discount}%</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Track */}
                        <div className="h-2 bg-white/10 rounded-full relative mb-2">
                            {/* Colored portion */}
                            <div
                                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300"
                                style={{ width: `${(selectedPlan / (plans.length - 1)) * 100}%` }}
                            />

                            {/* Thumb dots */}
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full transition-all cursor-pointer ${selectedPlan === plan.id ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                                    style={{ left: `${(plan.id / (plans.length - 1)) * 100}%` }}
                                    onClick={() => setSelectedPlan(plan.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Тариф и цена */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-xl mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold">{plans[selectedPlan].name}</h3>
                                {selectedPlan > 0 && (
                                    <p className="text-sm text-white/70">
                                        {plans[selectedPlan].monthlyPrice} ₽/месяц
                                    </p>
                                )}
                            </div>

                            <div className="text-right">
                                <p className="text-3xl font-bold">{plans[selectedPlan].price} ₽</p>
                                {plans[selectedPlan].savings > 0 && (
                                    <p className="text-sm text-green-400">Экономия {plans[selectedPlan].savings} ₽</p>
                                )}
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition flex items-center justify-center" onClick={() => buyPlan(plans[selectedPlan])} disabled={isSubmitting}>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Оформить подписку
                        </button>
                    </div>

                    {/* Преимущества */}
                    <div className="w-full max-w-xl">
                        <h3 className="text-lg font-medium mb-4">Все тарифы включают:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="bg-purple-500/20 rounded-full p-1 mr-2">
                                        <Check className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <p className="text-sm">{benefit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-6 sm:pt-0">
                    <div className="flex flex-col space-y-4">
                        <div
                            className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/15 transition-colors"
                            onClick={() => {
                                // Открываем ссылку на Telegram бота
                                window.open(SUPPORT_URL, '_blank');
                            }}
                        >
                            <div className="bg-white/20 rounded-full p-1.5 sm:p-2 mr-2 sm:mr-3">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm sm:font-medium">Наша тех.поддержка</p>
                                <p className="text-xs sm:text-sm opacity-80">Ответят на все ваши вопросы</p>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Правая сторона - 30% с профилем */}
            <div className="w-[30%] min-w-[30%] max-w-[30%] flex-shrink-0 flex-grow-0 p-5 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Личный профиль</h2>
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

                {/* Кнопки подписки и VPN */}
                <div className="mt-2 mb-6 space-y-3 flex-grow">
                    <button className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/vpn')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Подключиться к VPN
                    </button>
                    <button className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/profile')}>
                        Профиль
                    </button>

                    <button className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/subscription')}>
                        Управление подпиской
                    </button>
                </div>

                {/* Дополнительная информация о тарифах */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium mb-2">Почему стоит выбрать годовой план?</h3>
                    <ul className="text-xs space-y-2 text-white/80">
                        <li className="flex items-start">
                            <Check className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Максимальная экономия 35%</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Приоритетная техническая поддержка</span>
                        </li>
                        <li className="flex items-start">
                            <Check className="w-3 h-3 text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                            <span>Дополнительные бонусы и акции</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 
