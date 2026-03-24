import { useState } from 'react';
import { Shield, Globe, Download, Wifi, Server, Lock, Copy, ChevronDown, Check, Smartphone, Laptop, Monitor, Command, AlertCircle, ArrowRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';


export default function VpnConnectPage() {
    const [selectedServer, setSelectedServer] = useState(2);
    const [showServerList, setShowServerList] = useState(false);
    const [configCopied, setConfigCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingPlatform, setDownloadingPlatform] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStatus, setDownloadStatus] = useState('');
    // Добавим переменную для хранения позиции списка
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const navigate = useNavigate();


    // Имитация данных пользователя
    const telegramUser = {
        firstName: 'Иван',
        lastName: 'Петров',
        username: '@ivanpetrov',
        initials: 'ИП',
        photoUrl: null
    };

    const servers = [
        { id: 1, country: "Нидерланды", city: "Амстердам", flag: "🇳🇱", ping: 48, speed: 850 },
        { id: 2, country: "Германия", city: "Франкфурт", flag: "🇩🇪", ping: 32, speed: 940 },
        { id: 3, country: "США", city: "Нью-Йорк", flag: "🇺🇸", ping: 120, speed: 750 },
        { id: 4, country: "Япония", city: "Токио", flag: "🇯🇵", ping: 280, speed: 910 },
        { id: 5, country: "Сингапур", city: "Сингапур", flag: "🇸🇬", ping: 190, speed: 870 },
        { id: 6, country: "Великобритания", city: "Лондон", flag: "🇬🇧", ping: 62, speed: 820 },
    ];

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

    // Функция для копирования конфигурации
    const copyConfig = () => {
        try {
            // Попытка использовать API буфера обмена
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

        // Делаем элемент невидимым
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

    // Вспомогательная функция для определения расширения файла
    function getFileExtension(platform) {
        switch (platform) {
            case 'Windows':
                return 'exe';
            case 'MacOS':
                return 'dmg';
            case 'Android':
                return 'apk';
            case 'Linux':
                return 'deb';
            default:
                return 'zip';
        }
    }

    // Функция для загрузки приложения
    const downloadApp = (platform) => {
        setIsDownloading(true);
        setDownloadingPlatform(platform);
        setDownloadProgress(0);
        setDownloadStatus('Подготовка к загрузке...');

        const appInfo = appDownloads[platform];

        // Для iOS просто открываем App Store в новой вкладке
        if (platform === 'iOS') {
            setDownloadStatus('Перенаправление в App Store...');
            // Имитация открытия App Store
            alert('Перенаправление в App Store для загрузки приложения iOS');

            // Имитируем короткую задержку для UI-обратной связи
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadingPlatform('');
                setDownloadStatus('');
            }, 1000);

            return;
        }

        // Для остальных платформ инициируем загрузку файла
        try {
            setDownloadStatus('Загрузка файла...');

            // Симуляция процесса загрузки для демонстрации UI
            const progressInterval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return 95;
                    }
                    return prev + Math.floor(Math.random() * 8) + 2;
                });
            }, 200);

            // В реальном приложении здесь был бы код для инициации загрузки файла:
            // const link = document.createElement('a');
            // link.href = appInfo.url;
            // link.setAttribute('download', `v2raytun-${platform.toLowerCase()}.${getFileExtension(platform)}`);
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);

            // Для демонстрации просто показываем сообщение
            setTimeout(() => {
                alert(`Начато скачивание V2RayTun для ${platform}`);
            }, 500);

            // Симуляция завершения загрузки
            setTimeout(() => {
                clearInterval(progressInterval);
                setDownloadProgress(100);
                setDownloadStatus('Загрузка завершена!');

                setTimeout(() => {
                    setIsDownloading(false);
                    setDownloadingPlatform('');
                    setDownloadStatus('');
                    alert(`Приложение V2RayTun для ${platform} успешно загружено!`);
                }, 1000);
            }, 3000);
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            setDownloadStatus('Ошибка загрузки. Попробуйте снова.');
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadingPlatform('');
                setDownloadStatus('');
            }, 2000);
        }
    };

    // Функция для открытия выпадающего списка и установки его позиции
    const toggleServerList = (event) => {
        if (showServerList) {
            setShowServerList(false);
        } else {
            // Получаем размеры и позицию кнопки для точного позиционирования выпадающего списка
            const button = event.currentTarget;
            const rect = button.getBoundingClientRect();

            setDropdownPosition({
                top: rect.bottom,
                left: rect.left,
                width: rect.width
            });

            setShowServerList(true);
        }
    };

    // Функция для имитации навигации
    

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-black text-white">
            {/* Портал для выпадающего списка - будет поверх всего */}
            {showServerList && (
                <div
                    className="fixed inset-0 bg-transparent z-[9999]"
                    onClick={() => setShowServerList(false)}
                >
                    <div
                        className="absolute shadow-xl"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            width: `${dropdownPosition.width}px`,
                            maxWidth: '100vw'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-black/95 border border-white/20 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                            {servers.map((server, index) => (
                                <div
                                    key={server.id}
                                    className={`flex items-center justify-between p-2 sm:p-3 cursor-pointer hover:bg-white/5 transition ${selectedServer === index ? 'bg-purple-600/20' : ''}`}
                                    onClick={() => {
                                        setSelectedServer(index);
                                        setShowServerList(false);
                                    }}
                                >
                                    <div className="flex items-center">
                                        <span className="text-lg sm:text-xl mr-2 sm:mr-3">{server.flag}</span>
                                        <div>
                                            <p className="text-sm font-medium">{server.country}</p>
                                            <p className="text-xs opacity-70">{server.city}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden mr-3 hidden sm:block">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                                        </div>
                                        <p className="text-xs opacity-70 hidden sm:block">{server.ping} мс</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Основная секция с градиентом */}
            <div className="w-full lg:w-[70%] relative p-4 sm:p-6 lg:p-8 flex flex-col"
                style={{
                    background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.4) 15%, rgba(0, 0, 0, 0.95) 30%, rgba(0, 0, 0, 1) 100%)',
                    boxShadow: 'inset 0 40px 60px rgba(147, 51, 234, 0.2)'
                }}>
                <div className="flex items-center mb-6 sm:mb-10">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    <span className="text-lg sm:text-xl font-bold">БезопасныйVPN</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Подключение к VPN</h1>

                {/* Выбор сервера - адаптирован для мобильных */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Выбор сервера</h2>

                    <div className="relative mb-4 sm:mb-6">
                        <div
                            className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg cursor-pointer border border-white/10 hover:border-white/20"
                            onClick={toggleServerList}
                        >
                            <div className="flex items-center">
                                <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{servers[selectedServer].flag}</span>
                                <div>
                                    <p className="text-sm sm:font-medium">{servers[selectedServer].country}</p>
                                    <p className="text-xs opacity-70">{servers[selectedServer].city}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs opacity-70">Скорость</p>
                                    <p className="text-sm font-medium">{servers[selectedServer].speed} Мбит/с</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs opacity-70">Пинг</p>
                                    <p className="text-sm font-medium">{servers[selectedServer].ping} мс</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showServerList ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </div>

                    {/* Карточки с информацией о сервере */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                            <Wifi className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-purple-400" />
                            <p className="text-[10px] sm:text-xs opacity-70">Скорость</p>
                            <p className="text-xs sm:text-sm font-medium">{servers[selectedServer].speed} Мбит/с</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                            <Server className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-purple-400" />
                            <p className="text-[10px] sm:text-xs opacity-70">Пинг</p>
                            <p className="text-xs sm:text-sm font-medium">{servers[selectedServer].ping} мс</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-purple-400" />
                            <p className="text-[10px] sm:text-xs opacity-70">Шифрование</p>
                            <p className="text-xs sm:text-sm font-medium">AES-256</p>
                        </div>
                    </div>

                    <button className="w-full py-2.5 sm:py-3 bg-white text-purple-900 rounded-lg font-medium hover:bg-white/90 transition flex items-center justify-center">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Подключиться к серверу
                    </button>
                </div>

                {/* Конфигурация - адаптирована для мобильных */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold">Конфигурация</h2>
                        <button
                            onClick={copyConfig}
                            className="flex items-center text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition"
                        >
                            {configCopied ? (
                                <>
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    Скопировано
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    Копировать
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-black/40 rounded-lg p-2 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                        <pre className="overflow-x-auto whitespace-pre-wrap sm:whitespace-pre">{configText}</pre>
                    </div>
                </div>

                {/* Загрузка приложения - адаптирована для мобильных */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Загрузить v2RayTun</h2>
                    <p className="text-xs sm:text-sm opacity-80 mb-3 sm:mb-4">Выберите вашу платформу для загрузки приложения</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                        <button
                            onClick={() => downloadApp('Windows')}
                            disabled={isDownloading}
                            className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative overflow-hidden disabled:opacity-70"
                        >
                            {isDownloading && downloadingPlatform === 'Windows' ? (
                                <>
                                    <div className="absolute inset-0 bg-purple-600/20 flex flex-col items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <p className="text-xs">{downloadProgress}%</p>
                                    </div>
                                    <div className="opacity-50">
                                        <Monitor className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                        <p className="text-xs sm:text-sm font-medium">Windows</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Monitor className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                    <p className="text-xs sm:text-sm font-medium">Windows</p>
                                    <p className="text-[10px] opacity-60 mt-0.5">{appDownloads.Windows.size}</p>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => downloadApp('MacOS')}
                            disabled={isDownloading}
                            className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative overflow-hidden disabled:opacity-70"
                        >
                            {isDownloading && downloadingPlatform === 'MacOS' ? (
                                <>
                                    <div className="absolute inset-0 bg-purple-600/20 flex flex-col items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <p className="text-xs">{downloadProgress}%</p>
                                    </div>
                                    <div className="opacity-50">
                                        <Laptop className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                        <p className="text-xs sm:text-sm font-medium">MacOS</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Laptop className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                    <p className="text-xs sm:text-sm font-medium">MacOS</p>
                                    <p className="text-[10px] opacity-60 mt-0.5">{appDownloads.MacOS.size}</p>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => downloadApp('Android')}
                            disabled={isDownloading}
                            className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative overflow-hidden disabled:opacity-70"
                        >
                            {isDownloading && downloadingPlatform === 'Android' ? (
                                <>
                                    <div className="absolute inset-0 bg-purple-600/20 flex flex-col items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <p className="text-xs">{downloadProgress}%</p>
                                    </div>
                                    <div className="opacity-50">
                                        <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                        <p className="text-xs sm:text-sm font-medium">Android</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                    <p className="text-xs sm:text-sm font-medium">Android</p>
                                    <p className="text-[10px] opacity-60 mt-0.5">{appDownloads.Android.size}</p>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => downloadApp('iOS')}
                            disabled={isDownloading}
                            className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative overflow-hidden disabled:opacity-70"
                        >
                            {isDownloading && downloadingPlatform === 'iOS' ? (
                                <>
                                    <div className="absolute inset-0 bg-purple-600/20 flex flex-col items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <p className="text-xs">App Store</p>
                                    </div>
                                    <div className="opacity-50">
                                        <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                        <p className="text-xs sm:text-sm font-medium">iOS</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                    <p className="text-xs sm:text-sm font-medium">iOS</p>
                                    <p className="text-[10px] opacity-60 mt-0.5">{appDownloads.iOS.size}</p>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => downloadApp('Linux')}
                            disabled={isDownloading}
                            className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition relative overflow-hidden disabled:opacity-70"
                        >
                            {isDownloading && downloadingPlatform === 'Linux' ? (
                                <>
                                    <div className="absolute inset-0 bg-purple-600/20 flex flex-col items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-1"></div>
                                        <p className="text-xs">{downloadProgress}%</p>
                                    </div>
                                    <div className="opacity-50">
                                        <Command className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                        <p className="text-xs sm:text-sm font-medium">Linux</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Command className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-purple-400" />
                                    <p className="text-xs sm:text-sm font-medium">Linux</p>
                                    <p className="text-[10px] opacity-60 mt-0.5">{appDownloads.Linux.size}</p>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Статус загрузки */}
                    {isDownloading && (
                        <div className="mt-4 bg-white/5 rounded-lg p-3 sm:p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs sm:text-sm font-medium">Статус загрузки</h3>
                                <p className="text-xs opacity-70">{downloadingPlatform}</p>
                            </div>

                            <p className="text-xs opacity-80 mb-2">{downloadStatus}</p>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                    style={{ width: `${downloadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs opacity-70 text-right mt-1">{downloadProgress}%</p>
                        </div>
                    )}

                    <div className="mt-4 sm:mt-6 bg-white/5 rounded-lg p-3 sm:p-4">
                        <h3 className="text-xs sm:text-sm font-medium mb-2">Инструкция по установке</h3>
                        <ol className="text-xs space-y-1 sm:space-y-2 opacity-80 list-decimal pl-4">
                            <li>Скачайте приложение v2RayTun для вашей платформы</li>
                            <li>Установите приложение, следуя инструкциям установщика</li>
                            <li>Откройте приложение и импортируйте конфигурацию (скопируйте выше)</li>
                            <li>Нажмите кнопку "Подключиться" в приложении</li>
                            <li>Готово! Вы подключены к защищенному VPN-серверу</li>
                        </ol>
                    </div>

                </div>
            </div>

            {/* Профильная секция - адаптирована для мобильных */}
            <div className="w-full lg:w-[30%] p-4 sm:p-5 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10">
                <div className="w-full max-w-xs mx-auto lg:mx-0 lg:pl-5">
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