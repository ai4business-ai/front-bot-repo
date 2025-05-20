document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    
    // Отображаем приложение (скрывает загрузчик Telegram)
    tgApp.ready();
    
    // Применяем цвета темы Telegram
    applyTelegramTheme();
    
    // Обработчик события изменения темы
    tgApp.onEvent('themeChanged', applyTelegramTheme);
    
    // Добавляем обработчики событий для карточек ассистентов
    const assistantCards = document.querySelectorAll('.assistant-card');
    assistantCards.forEach(card => {
        card.addEventListener('click', function() {
            const command = this.getAttribute('data-command');
            selectAssistant(command);
        });
    });
    
    /**
     * Применяет цвета темы Telegram к CSS переменным
     */
    function applyTelegramTheme() {
        if (tgApp.colorScheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Применение цветов из Telegram WebApp
        document.documentElement.style.setProperty('--tg-theme-bg-color', tgApp.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', tgApp.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', tgApp.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', tgApp.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', tgApp.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tgApp.themeParams.button_text_color);
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tgApp.themeParams.secondary_bg_color);
    }
    
    /**
     * Отправляет команду боту и закрывает Mini App
     * @param {string} command - Команда для отправки боту
     */
    function selectAssistant(command) {
        // Отправляем команду боту
        tgApp.sendData(`/${command}`);
        
        // Показываем уведомление через MainButton
        tgApp.MainButton.setText(`Запускаю ассистента: ${getAssistantName(command)}...`);
        tgApp.MainButton.show();
        
        // Закрываем Mini App через небольшую задержку
        setTimeout(() => {
            tgApp.close();
        }, 1500);
    }
    
    /**
     * Возвращает название ассистента по его команде
     * @param {string} command - Команда ассистента
     * @returns {string} - Название ассистента
     */
    function getAssistantName(command) {
        const names = {
            'market': 'Анализ рынка',
            'founder': 'Идеи фаундера',
            'business': 'Бизнес-модель',
            'adapter': 'Адаптатор идей'
        };
        
        return names[command] || command;
    }
});
