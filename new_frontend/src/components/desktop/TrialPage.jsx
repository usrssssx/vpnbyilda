import { useState } from 'react';
import { Shield, Globe, Clock, User, Download, Gift, ChevronRight, CheckCircle, Copy, Check, ArrowRight, Smartphone, Laptop, Monitor, Command, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TelegramUser from '../../../TelegramUser';

export default function DesktopTrialPage() {
    const [email, setEmail] = useState('');
    const [trialActivated, setTrialActivated] = useState(false);
    const [configCopied, setConfigCopied] = useState(false);
    const [countdown, setCountdown] = useState(7 * 24 * 60 * 60); // 7 days in seconds
    const navigate = useNavigate();
    const telegramUser = TelegramUser.getUser();

    // Demo trial config
    const trialConfig = `{
  "server": "Нидерланды",
  "server_port": 443,
  "password": "trial7days-x2f9gH7jK",
  "method": "aes-256-gcm",
  "remarks": "Амстердам-Пробный",
  "route": "all",
  "remote_dns": "dns.google",
  "ipv6": false,
  "metered": false,
  "proxy_apps": {
    "enabled": false
  },
  "udpdns": false
}`;

    // Benefits of the trial
    const trialBenefits = [
        'Полный доступ ко всем серверам',
        'Неограниченная скорость и трафик',
        'Защита до 5 устройств одновременно',
        'Без ограничений по скорости',
        'Полный набор функций безопасности'
    ];

    // Function to activate trial
    const activateTrial = (e) => {
        e.preventDefault();
        if (email.trim() !== '' && email.includes('@')) {
            setTrialActivated(true);
            // In a real app, this would send the email to the server
        }
    };

    // Function to copy config
    const copyConfig = () => {
        setConfigCopied(true);
        setTimeout(() => setConfigCopied(false), 2000);
    };

    // Function to download app
    const downloadApp = (platform) => {
        console.log(`Downloading v2RayTun for ${platform}`);
        alert(`Начинается скачивание v2RayTun для ${platform}`);
    };

    // Format countdown time
    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        return `${days}д ${hours}ч ${minutes}м`;
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-black text-white">
            {/* Левая сторона - 70% с градиентом (без правого отступа) */}
            <div className="w-[70%] min-w-[70%] max-w-[70%] flex-shrink-0 relative p-8 pr-0 flex flex-col items-center"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}>
                <div className="flex items-center mb-10 w-full max-w-2x3">
                    <Shield className="w-6 h-6 mr-2" />
                    <span className="text-xl font-bold">БезопасныйVPN</span>
                </div>

                <div className="flex-grow flex flex-col items-center w-full">
                    <h1 className="text-3xl font-bold mb-4">Бесплатный пробный период</h1>
                    <p className="text-lg mb-8 max-w-2xl opacity-90 text-center">
                        Попробуйте БезопасныйVPN бесплатно в течение 7 дней. Полный доступ ко всем функциям и серверам без ограничений.
                    </p>

                    {!trialActivated ? (
                        /* Форма активации пробного периода */
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 max-w-3xl w-full">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center mr-4">
                                    <Gift className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">7 дней бесплатно</h2>
                                    <p className="text-sm opacity-80">Без автоматического продления и платежных данных</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm opacity-80 mb-2">Введите email для получения конфигурации</label>
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="flex-grow bg-white/5 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                    <button
                                        onClick={activateTrial}
                                        className="bg-white text-purple-900 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition"
                                    >
                                        Активировать
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {trialBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                                        <p className="text-sm">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Отображение информации после активации */
                        <>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 max-w-3xl w-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Пробный период активирован!</h2>
                                        <p className="text-sm opacity-80">Конфигурация отправлена на {email}</p>
                                    </div>
                                    <div className="bg-green-500/20 px-3 py-1 rounded-full">
                                        <p className="text-sm text-green-400 font-medium">Активно</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm opacity-80 mb-2">Осталось времени</p>
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-purple-400" />
                                        <span className="font-medium">{formatTime(countdown)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg mb-4">
                                    <div className="flex items-center">
                                        <div className="text-2xl mr-3">🇳🇱</div>
                                        <div>
                                            <p className="font-medium">Нидерланды</p>
                                            <p className="text-sm opacity-70">Амстердам</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-green-400 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-black" />
                                    </div>
                                </div>
                            </div>

                            {/* Конфигурация */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 max-w-3xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Конфигурация VPN</h2>
                                    <button
                                        onClick={copyConfig}
                                        className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition"
                                    >
                                        {configCopied ? (
                                            <>
                                                <Check className="w-4 h-4 mr-1" />
                                                Скопировано
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-1" />
                                                Копировать
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                                    <pre>{trialConfig}</pre>
                                </div>

                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                    <p className="text-sm">
                                        Используйте эту конфигурацию для подключения в приложении v2RayTun.
                                        После окончания пробного периода вы сможете выбрать подходящий тариф.
                                    </p>
                                </div>
                            </div>

                            {/* Загрузка приложения */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 max-w-3xl w-full">
                                <h2 className="text-xl font-semibold mb-4">Загрузить v2RayTun</h2>
                                <p className="text-sm opacity-80 mb-4">Выберите вашу платформу для загрузки приложения</p>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                    <button
                                        onClick={() => downloadApp('Windows')}
                                        className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Monitor className="w-8 h-8 mb-2 text-purple-400" />
                                        <p className="text-sm font-medium">Windows</p>
                                    </button>

                                    <button
                                        onClick={() => downloadApp('MacOS')}
                                        className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Laptop className="w-8 h-8 mb-2 text-purple-400" />
                                        <p className="text-sm font-medium">MacOS</p>
                                    </button>

                                    <button
                                        onClick={() => downloadApp('Android')}
                                        className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Smartphone className="w-8 h-8 mb-2 text-purple-400" />
                                        <p className="text-sm font-medium">Android</p>
                                    </button>

                                    <button
                                        onClick={() => downloadApp('iOS')}
                                        className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Smartphone className="w-8 h-8 mb-2 text-purple-400" />
                                        <p className="text-sm font-medium">iOS</p>
                                    </button>

                                    <button
                                        onClick={() => downloadApp('Linux')}
                                        className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
                                    >
                                        <Command className="w-8 h-8 mb-2 text-purple-400" />
                                        <p className="text-sm font-medium">Linux</p>
                                    </button>
                                </div>

                                <div className="bg-white/5 rounded-lg p-4">
                                    <h3 className="text-sm font-medium mb-2">Инструкция по установке</h3>
                                    <ol className="text-xs space-y-2 opacity-80 list-decimal pl-4">
                                        <li>Скачайте приложение v2RayTun для вашей платформы</li>
                                        <li>Установите приложение, следуя инструкциям установщика</li>
                                        <li>Откройте приложение и импортируйте конфигурацию (скопируйте выше)</li>
                                        <li>Нажмите кнопку "Подключиться" в приложении</li>
                                        <li>Готово! Вы подключены к защищенному VPN-серверу</li>
                                    </ol>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                
                <div className="mt-auto w-full max-w-3xl pb-4 sm:pb-0">
                    <div className="flex flex-col space-y-4 w-full">
                        <div
                            className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm cursor-pointer"
                            onClick={() => navigate('/tariffs')}
                        >
                            <div className="bg-white/20 rounded-full p-1.5 sm:p-2 mr-2 sm:mr-3">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-medium">Хотите больше?</p>
                                <p className="text-xs sm:text-sm opacity-80">Изучите наши тарифные планы</p>
                            </div>
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Правая сторона - 30% с профилем (прижата к левой части) */}
            <div className="w-[30%] min-w-[30%] max-w-[30%] flex-shrink-0 p-5 pl-0 flex flex-col items-start justify-center border-l border-white/10">
                <div className="w-full max-w-xs pl-5">
                    <h2 className="text-xl font-bold mb-4">Личный профиль</h2>
                    <p className="text-xs opacity-80 mb-4">Управляйте настройками и предпочтениями аккаунта</p>

                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-bold mr-3">
                            {telegramUser.photoUrl ? (
                                <img src={telegramUser.photoUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                            ) : (
                                telegramUser.firstName && telegramUser.lastName ?
                                    telegramUser.initials : 'НП'
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                {telegramUser.firstName && telegramUser.lastName ?
                                    `${telegramUser.firstName} ${telegramUser.lastName}` :
                                    'Новый пользователь'}
                            </p>
                            <p className="text-xs opacity-80">
                                {telegramUser.username || 'Гостевой режим'}
                            </p>
                        </div>
                    </div>

                    {/* Преимущества тарифов */}
                    <div className="mt-6 mb-6 space-y-4">
                        <h3 className="text-sm font-bold">Что вы получите после пробного периода</h3>

                        <div className="space-y-3">
                            <div className="flex items-start p-3 bg-white/5 rounded-lg">
                                <Globe className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Глобальная сеть серверов</p>
                                    <p className="text-xs opacity-70">Более 50 локаций по всему миру</p>
                                </div>
                            </div>

                            <div className="flex items-start p-3 bg-white/5 rounded-lg">
                                <Shield className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Полная защита данных</p>
                                    <p className="text-xs opacity-70">Шифрование военного уровня AES-256</p>
                                </div>
                            </div>

                            <div className="flex items-start p-3 bg-white/5 rounded-lg">
                                <Download className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Неограниченная скорость</p>
                                    <p className="text-xs opacity-70">Без ограничений по трафику и скорости</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Отзывы пользователей */}
                    <div className="bg-white/5 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-bold mb-3">Отзывы пользователей</h3>

                        <div className="space-y-3">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 mr-2"></div>
                                    <p className="text-xs font-medium">Михаил Д.</p>
                                </div>
                                <p className="text-xs opacity-80">
                                    "Идеальный VPN для работы и развлечений. Стабильное соединение и высокая скорость."
                                </p>
                            </div>

                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 mr-2"></div>
                                    <p className="text-xs font-medium">Елизавета Ш.</p>
                                </div>
                                <p className="text-xs opacity-80">
                                    "Пользуюсь больше года. Отличный сервис, всегда доступны нужные мне серверы."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Переход к тарифам */}
                    <button className="w-full py-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/tariffs')}>
                        Посмотреть тарифы
                    </button>
                </div>
            </div>
        </div>
    );
} 