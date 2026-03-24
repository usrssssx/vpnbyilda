import { useState, useEffect } from 'react';

export function useDeviceDetect() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Функция для проверки размера экрана
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 1024); // 1024px - стандартная граница для lg: в Tailwind
        };

        // Проверяем при первой загрузке
        checkDevice();

        // Добавляем слушатель событий изменения размера окна
        window.addEventListener('resize', checkDevice);

        // Очищаем слушатель при размонтировании компонента
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return { isMobile };
}