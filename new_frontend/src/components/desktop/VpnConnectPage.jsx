import { useState, useRef, useEffect } from 'react';
import { Shield, Globe, Download, Wifi, Server, Lock, Copy, ChevronDown, Check, Smartphone, Laptop, Monitor, Command, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function DesktopVpnConnectPage() {
    const [selectedServer, setSelectedServer] = useState(2);
    const [showServerList, setShowServerList] = useState(false);
    const [configCopied, setConfigCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingPlatform, setDownloadingPlatform] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);

    const navigate = useNavigate();


    // Ref для контейнера выбора сервера
    const serverSelectRef = useRef(null);

    // Телеграм-пользователь (имитация)
    const telegramUser = {
        firstName: 'Иван',
        lastName: 'Петров',
        username: '@ivanpetrov',
        initials: 'ИП',
        photoUrl: null
    };

    // Имитация функции навигации

    // Список доступных серверов
    const servers = [
        { id: 1, country: "Нидерланды", city: "Амстердам", flag: "🇳🇱", ping: 48, speed: 850 },
        { id: 2, country: "Германия", city: "Франкфурт", flag: "🇩🇪", ping: 32, speed: 940 },
        { id: 3, country: "США", city: "Нью-Йорк", flag: "🇺🇸", ping: 120, speed: 750 },
        { id: 4, country: "Япония", city: "Токио", flag: "🇯🇵", ping: 280, speed: 910 },
        { id: 5, country: "Сингапур", city: "Сингапур", flag: "🇸🇬", ping: 190, speed: 870 },
        { id: 6, country: "Великобритания", city: "Лондон", flag: "🇬🇧", ping: 62, speed: 820 },
    ];

    // Данные для загрузки приложений
    const appDownloads = {
        Windows: {
            url: "https://example.com/downloads/v2raytun-setup-windows.exe",
            size: "24.3 МБ",
            version: "1.2.5"
        },
        MacOS: {
            url: "https://example.com/downloads/v2raytun-macos.dmg",
            size: "18.7 МБ",
            version: "1.2.5"
        },
        Android: {
            url: "https://example.com/downloads/v2raytun-android.apk",
            size: "12.8 МБ",
            version: "1.2.4"
        },
        iOS: {
            url: "https://apps.apple.com/app/v2raytun-vpn/id1234567890",
            size: "15.5 МБ",
            version: "1.2.3"
        },
        Linux: {
            url: "https://example.com/downloads/v2raytun-linux-amd64.deb",
            size: "16.2 МБ",
            version: "1.2.5"
        }
    };

    // Демо-конфигурация для выбранного сервера
    const configText = `{
  "server": "${servers[selectedServer].country}",
  "server_port": 443,
  "password": "x23f9gH7jK1pL5qR",
  "method": "aes-256-gcm",
  "remarks": "${servers[selectedServer].city}",
  "route": "all",
  "remote_dns": "dns.google",
  "ipv6": false,
  "metered": false,
  "proxy_apps": {
    "enabled": false
  },
  "udpdns": false
}`;

    // Обработчик клика вне выпадающего списка для его закрытия
    useEffect(() => {
        function handleClickOutside(event) {
            if (showServerList && serverSelectRef.current && !serverSelectRef.current.contains(event.target)) {
                setShowServerList(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showServerList]);

    // Функция для копирования конфигурации
    const copyConfig = () => {
        try {
            navigator.clipboard.writeText(configText)
                .then(() => {
                    setConfigCopied(true);
                    setTimeout(() => setConfigCopied(false), 2000);
                })
                .catch(err => {
                    // Запасной вариант для старых браузеров
                    fallbackCopyTextToClipboard(configText);
                });
        } catch (err) {
            // Запасной вариант для браузеров без API буфера обмена
            fallbackCopyTextToClipboard(configText);
        }
    };

    // Запасной метод копирования текста
    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setConfigCopied(true);
                setTimeout(() => setConfigCopied(false), 2000);
            } else {
                console.error('Не удалось скопировать текст');
            }
        } catch (err) {
            console.error('Ошибка при копировании текста:', err);
        }

        document.body.removeChild(textArea);
    };

    // Функция для загрузки приложения
    const downloadApp = (platform) => {
        setIsDownloading(true);
        setDownloadingPlatform(platform);
        setDownloadProgress(0);

        const appInfo = appDownloads[platform];

        // Для iOS просто открываем App Store в новой вкладке
        if (platform === 'iOS') {
            // Имитация процесса для демонстрации
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadingPlatform('');
                alert(`Перенаправление в App Store для загрузки приложения iOS`);
            }, 800);

            return;
        }

        // Для остальных платформ инициируем загрузку файла
        try {
            // Симуляция процесса загрузки для демонстрации UI
            const progressInterval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 98) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + Math.floor(Math.random() * 10) + 2;
                });
            }, 300);

            // Имитация завершения загрузки
            setTimeout(() => {
                clearInterval(progressInterval);
                setDownloadProgress(100);

                setTimeout(() => {
                    setIsDownloading(false);
                    setDownloadingPlatform('');
                    alert(`Приложение v2RayTun для ${platform} успешно загружено!`);
                }, 800);
            }, 2500);
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            alert(`Ошибка при загрузке приложения для ${platform}`);
            setIsDownloading(false);
            setDownloadingPlatform('');
        }
    };

    return (
        <div className="flex w-full h-screen bg-black text-white overflow-hidden">
            {/* Левая сторона - 70% с градиентом и прокруткой */}
            <div className="w-[70%] min-w-[70%] max-w-[70%] flex-shrink-0 relative overflow-y-auto h-screen"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}>
                <div className="p-8 pr-4">
                    <div className="flex items-center mb-10">
                        <Shield className="w-6 h-6 mr-2" />
                        <span className="text-xl font-bold">БезопасныйVPN</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-6">Подключение к VPN</h1>

                    {/* Выбор сервера */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Выбор сервера</h2>

                        {/* Контейнер с ref для правильного позиционирования выпадающего списка */}
                        <div className="relative mb-6" ref={serverSelectRef}>
                            {/* Кнопка выбора сервера */}
                            <div
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer border border-white/10 hover:border-white/20"
                                onClick={() => setShowServerList(!showServerList)}
                            >
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">{servers[selectedServer].flag}</span>
                                    <div>
                                        <p className="font-medium">{servers[selectedServer].country}</p>
                                        <p className="text-sm opacity-70">{servers[selectedServer].city}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm opacity-70">Скорость</p>
                                        <p className="font-medium">{servers[selectedServer].speed} Мбит/с</p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm opacity-70">Пинг</p>
                                        <p className="font-medium">{servers[selectedServer].ping} мс</p>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${showServerList ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Выпадающий список серверов, размещенный непосредственно в контейнере */}
                            {showServerList && (
                                <div
                                    className="absolute left-0 right-0 mt-2 bg-black/95 border border-white/20 rounded-lg shadow-xl overflow-hidden z-50"
                                    style={{
                                        maxHeight: '201px', // Высота примерно для 3 элементов (3 * 67px)
                                        overflowY: 'auto',
                                        scrollbarWidth: 'thin', // Для Firefox
                                        scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0)' // Для Firefox
                                    }}
                                >
                                    {/* Стили для скроллбара в WebKit браузерах (Chrome, Safari, новые Edge) */}
                                    <style jsx>{`
                                        div::-webkit-scrollbar {
                                            width: 6px;
                                        }
                                        div::-webkit-scrollbar-track {
                                            background: rgba(0, 0, 0, 0.1);
                                        }
                                        div::-webkit-scrollbar-thumb {
                                            background-color: rgba(255, 255, 255, 0.3);
                                            border-radius: 6px;
                                        }
                                    `}</style>

                                    {servers.map((server, index) => (
                                        <div
                                            key={server.id}
                                            className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/10 transition ${selectedServer === index ? 'bg-purple-600/20' : ''}`}
                                            onClick={() => {
                                                setSelectedServer(index);
                                                setShowServerList(false);
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-xl mr-3">{server.flag}</span>
                                                <div>
                                                    <p className="font-medium">{server.country}</p>
                                                    <p className="text-sm opacity-70">{server.city}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-xs opacity-70">Пинг</p>
                                                    <p className="text-sm">{server.ping} мс</p>
                                                </div>
                                                <div className="text-right hidden md:block">
                                                    <p className="text-xs opacity-70">Скорость</p>
                                                    <p className="text-sm">{server.speed} Мбит/с</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Информация о сервере */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <Wifi className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                                <p className="text-sm opacity-70">Скорость</p>
                                <p className="font-medium">{servers[selectedServer].speed} Мбит/с</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <Server className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                                <p className="text-sm opacity-70">Загрузка</p>
                                <p className="font-medium">45%</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <Lock className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                                <p className="text-sm opacity-70">Шифрование</p>
                                <p className="font-medium">AES-256</p>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition flex items-center justify-center">
                            Подключиться
                        </button>
                    </div>

                    {/* Конфигурация */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Конфигурация</h2>
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

                        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <pre>{configText}</pre>
                        </div>
                    </div>

                    {/* Загрузка приложения */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Загрузить v2RayTun</h2>
                        <p className="text-sm opacity-80 mb-4">Выберите вашу платформу для загрузки приложения</p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                            <button
                                onClick={() => downloadApp('Windows')}
                                disabled={isDownloading}
                                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative disabled:opacity-60"
                            >
                                {isDownloading && downloadingPlatform === 'Windows' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
                                        <div className="h-10 w-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mb-2"></div>
                                        <p className="text-xs font-medium">{downloadProgress}%</p>
                                    </div>
                                ) : null}
                                <Monitor className="w-8 h-8 mb-2 text-purple-400" />
                                <p className="text-sm font-medium">Windows</p>
                                <p className="text-xs opacity-60 mt-1">{appDownloads.Windows.size}</p>
                            </button>

                            <button
                                onClick={() => downloadApp('MacOS')}
                                disabled={isDownloading}
                                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative disabled:opacity-60"
                            >
                                {isDownloading && downloadingPlatform === 'MacOS' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
                                        <div className="h-10 w-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mb-2"></div>
                                        <p className="text-xs font-medium">{downloadProgress}%</p>
                                    </div>
                                ) : null}
                                <Laptop className="w-8 h-8 mb-2 text-purple-400" />
                                <p className="text-sm font-medium">MacOS</p>
                                <p className="text-xs opacity-60 mt-1">{appDownloads.MacOS.size}</p>
                            </button>

                            <button
                                onClick={() => downloadApp('Android')}
                                disabled={isDownloading}
                                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative disabled:opacity-60"
                            >
                                {isDownloading && downloadingPlatform === 'Android' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
                                        <div className="h-10 w-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mb-2"></div>
                                        <p className="text-xs font-medium">{downloadProgress}%</p>
                                    </div>
                                ) : null}
                                <Smartphone className="w-8 h-8 mb-2 text-purple-400" />
                                <p className="text-sm font-medium">Android</p>
                                <p className="text-xs opacity-60 mt-1">{appDownloads.Android.size}</p>
                            </button>

                            <button
                                onClick={() => downloadApp('iOS')}
                                disabled={isDownloading}
                                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative disabled:opacity-60"
                            >
                                {isDownloading && downloadingPlatform === 'iOS' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
                                        <div className="h-10 w-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mb-2"></div>
                                        <p className="text-xs font-medium">App Store</p>
                                    </div>
                                ) : null}
                                <Smartphone className="w-8 h-8 mb-2 text-purple-400" />
                                <p className="text-sm font-medium">iOS</p>
                                <p className="text-xs opacity-60 mt-1">{appDownloads.iOS.size}</p>
                            </button>

                            <button
                                onClick={() => downloadApp('Linux')}
                                disabled={isDownloading}
                                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative disabled:opacity-60"
                            >
                                {isDownloading && downloadingPlatform === 'Linux' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
                                        <div className="h-10 w-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mb-2"></div>
                                        <p className="text-xs font-medium">{downloadProgress}%</p>
                                    </div>
                                ) : null}
                                <Command className="w-8 h-8 mb-2 text-purple-400" />
                                <p className="text-sm font-medium">Linux</p>
                                <p className="text-xs opacity-60 mt-1">{appDownloads.Linux.size}</p>
                            </button>
                        </div>

                        {/* Отображаем блок со статусом загрузки только при активной загрузке */}
                        {isDownloading && (
                            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-purple-500/20">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium">Загрузка {downloadingPlatform}</p>
                                    <p className="text-sm">{downloadProgress}%</p>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                        style={{ width: `${downloadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 bg-white/5 rounded-lg p-4">
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

                    {/* Часто задаваемые вопросы */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Часто задаваемые вопросы</h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg">
                                <h3 className="font-medium mb-2">Что такое VPN?</h3>
                                <p className="text-sm opacity-80">
                                    VPN (Virtual Private Network) — технология, обеспечивающая безопасное соединение
                                    с интернетом через зашифрованный туннель. Это защищает вашу приватность и данные
                                    от посторонних глаз.
                                </p>
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg">
                                <h3 className="font-medium mb-2">Почему важно выбирать надежный VPN сервис?</h3>
                                <p className="text-sm opacity-80">
                                    Надежный VPN сервис обеспечивает высокий уровень шифрования,
                                    не ведет логов активности пользователей, предлагает стабильное соединение
                                    и высокую скорость работы, что критически важно для защиты ваших данных.
                                </p>
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg">
                                <h3 className="font-medium mb-2">Как выбрать лучший сервер?</h3>
                                <p className="text-sm opacity-80">
                                    Выбирайте сервер с наименьшей загрузкой и пингом для лучшей
                                    производительности. Географически близкие серверы обычно обеспечивают
                                    более высокую скорость соединения.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Правая сторона - 30% с профилем - статичная */}
            <div className="w-[30%] min-w-[30%] max-w-[30%] flex-shrink-0 p-5 pl-0 h-screen sticky top-0 border-l border-white/10">
                <div className="w-full max-w-xs pl-5">
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
                    <div className="mt-2 mb-6 space-y-3">
                        <button className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/tariffs')}>
                            Оформить подписку
                        </button>
                        <button className="w-full py-2.5 px-4 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition flex items-center justify-center" onClick={() => navigate('/profile')}>
                            Профиль
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
                                // Проверка на наличие Telegram WebApp API
                                alert('Открытие чата с поддержкой');
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