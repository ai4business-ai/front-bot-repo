document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    
    // Отображаем приложение (скрывает загрузчик Telegram)
    tgApp.ready();
    
    // Проверяем режим запуска (inline или обычный)
    const urlParams = new URLSearchParams(window.location.search);
    const isInlineMode = urlParams.get('mode') === 'inline';
    
    // Расширим функциональность - добавим BottomButton
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
    
    // Обновляем заголовок в зависимости от режима
    const headerTitle = document.querySelector('header h1');
    const headerSubtitle = document.querySelector('.header-subtitle');
    
    if (isInlineMode) {
        headerTitle.textContent = 'Выберите бизнес-ассистента';
        headerSubtitle.textContent = 'Нажмите на карточку, затем на кнопку "Запустить ассистента"';
    }
    
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
            
            if (isInlineMode) {
                tgApp.MainButton.setText(`Запустить: ${assistantName}`);
            } else {
                tgApp.MainButton.setText(`Выбрать: ${assistantName}`);
            }
            
            tgApp.MainButton.enable();
            tgApp.MainButton.show();
        });
    });
    
    // Добавляем обработчик для основной кнопки
    tgApp.MainButton.onClick(function() {
        if (selectedAssistant) {
            if (isInlineMode) {
                // В inline режиме возвращаемся к inline query с выбранным ассистентом
                returnToInlineMode(selectedAssistant);
            } else {
                // В обычном режиме (если нужен fallback)
                sendCommandToBot(selectedAssistant);
            }
        }
    });
    
    /**
     * Возвращает к inline режиму с выбранным ассистентом
     * @param {string} assistantType - Тип выбранного ассистента
     */
    function returnToInlineMode(assistantType) {
        try {
            // Показываем процесс
            tgApp.MainButton.showProgress();
            
            // Формируем текст для поиска конкретного ассистента
            const query = getAssistantName(assistantType);
            
            // Возвращаемся к inline режиму с предустановленным запросом
            tgApp.switchInlineQuery(query);
            
        } catch (error) {
            console.error('Ошибка при возврате к inline режиму:', error);
            tgApp.MainButton.hideProgress();
            tgApp.showAlert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
        }
    }
    
    /**
     * Отправляет выбранную команду в бота через метод sendData (fallback)
     * @param {string} command - Команда для отправки боту
     */
    function sendCommandToBot(command) {
        // Показываем процесс запуска
        tgApp.MainButton.showProgress();
        
        // Подготавливаем данные для отправки
        const dataToSend = `/${command}`;
        
        try {
            // Отправляем данные в бота
            tgApp.sendData(dataToSend);
            
            // После отправки данных Mini App закроется автоматически
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            tgApp.MainButton.hideProgress();
            
            // Показываем ошибку пользователю
            tgApp.showAlert('Произошла ошибка при выборе ассистента. Пожалуйста, попробуйте еще раз.');
        }
    }
    
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
