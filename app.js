document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    
    // Отображаем приложение (скрывает загрузчик Telegram)
    tgApp.ready();
    
    // Расширим функциональность - добавим MainButton
    tgApp.MainButton.setParams({
        text: "Выберите ассистента",
        color: tgApp.themeParams.button_color,
        text_color: tgApp.themeParams.button_text_color,
        is_active: false
    });
    
    // Применяем цвета темы Telegram
    applyTelegramTheme();
    
    // Обработчик события изменения темы
    tgApp.onEvent('themeChanged', applyTelegramTheme);
    
    // Переменная для хранения выбранного ассистента
    let selectedAssistant = null;
    
    // Добавляем обработчики событий для карточек ассистентов
    const assistantCards = document.querySelectorAll('.assistant-card');
    assistantCards.forEach(card => {
        card.addEventListener('click', function() {
            // Снимаем выделение со всех карточек
            assistantCards.forEach(c => c.classList.remove('selected'));
            
            // Выделяем выбранную карточку
            this.classList.add('selected');
            
            // Сохраняем выбранную команду
            selectedAssistant = this.getAttribute('data-command');
            
            // Обновляем и показываем основную кнопку
            const assistantName = getAssistantName(selectedAssistant);
            tgApp.MainButton.setText(`Запустить: ${assistantName}`);
            tgApp.MainButton.enable();
            tgApp.MainButton.show();
        });
    });
    
    // Добавляем обработчик для основной кнопки
    tgApp.MainButton.onClick(function() {
        if (selectedAssistant) {
            launchAssistant(selectedAssistant);
        }
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
        
        // Извлекаем RGB компоненты из button_color для создания полупрозрачного фона
        const buttonColor = tgApp.themeParams.button_color || '#2481cc';
        const rgb = hexToRgb(buttonColor);
        if (rgb) {
            document.documentElement.style.setProperty('--tg-theme-button-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }
    
    /**
     * Запускает выбранного ассистента через URL-схему Telegram
     * @param {string} command - Команда для отправки боту
     */
    function launchAssistant(command) {
        // Получаем имя бота из URL-параметров или используем дефолтное
        const botUsername = getBotUsername() || 'your_bot_username';  // Замените на имя вашего бота, если не найдено в URL
        
        // Формируем URL-схему Telegram
        const telegramUrl = `tg://resolve?domain=${botUsername}&command=${command}`;
        
        // Показываем процесс запуска
        tgApp.MainButton.showProgress();
        
        // Показываем подтверждение и переходим по ссылке
        setTimeout(() => {
            tgApp.MainButton.hideProgress();
            
            tgApp.showPopup({
                title: 'Ассистент выбран',
                message: `Вы выбрали ассистента "${getAssistantName(command)}". Сейчас вы будете перенаправлены в чат с ботом.`,
                buttons: [
                    {id: "ok", type: "ok", text: "Продолжить"}
                ]
            }, function(buttonId) {
                // Открываем ссылку в Telegram
                tgApp.openTelegramLink(telegramUrl);
                
                // Закрываем Mini App после небольшой задержки
                setTimeout(() => {
                    tgApp.close();
                }, 500);
            });
        }, 700);
    }
    
    /**
     * Получает имя бота из URL-параметров
     * @returns {string|null} - Имя бота или null, если не найдено
     */
    function getBotUsername() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('bot') || null;
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
    
    /**
     * Конвертирует HEX цвет в RGB компоненты
     * @param {string} hex - HEX-код цвета
     * @returns {Object|null} - Объект с компонентами RGB или null
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
});
