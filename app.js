document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    
    // Отображаем приложение (скрывает загрузчик Telegram)
    tgApp.ready();
    
    // Расширяем приложение на всю высоту
    tgApp.expand();
    
    // Настройка основной кнопки
    tgApp.MainButton.setParams({
        text: "Выберите ассистента",
        color: tgApp.themeParams.button_color,
        text_color: tgApp.themeParams.button_text_color,
        is_active: false,
        is_visible: false
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
            
            // Сохраняем выбранный тип ассистента
            selectedAssistant = this.getAttribute('data-command');
            
            // Обновляем и показываем основную кнопку
            const assistantName = getAssistantName(selectedAssistant);
            tgApp.MainButton.setText(`Выбрать: ${assistantName}`);
            tgApp.MainButton.enable();
            tgApp.MainButton.show();
        });
    });
    
    // Добавляем обработчик для основной кнопки
    tgApp.MainButton.onClick(function() {
        if (selectedAssistant) {
            // Отправляем данные в бота для запуска выбора ассистента
            sendAssistantSelection();
        }
    });
    
    /**
     * Отправляет информацию о выбранном ассистенте в бота
     */
    function sendAssistantSelection() {
        try {
            // Показываем процесс
            tgApp.MainButton.showProgress();
            tgApp.MainButton.setText("Отправка...");
            
            // Отправляем данные о конкретно выбранном ассистенте
            const dataToSend = JSON.stringify({
                action: "show_specific_assistant",
                selected_assistant: selectedAssistant
            });
            
            tgApp.sendData(dataToSend);
            
            // После отправки данных Mini App закроется автоматически
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            tgApp.MainButton.hideProgress();
            tgApp.MainButton.setText(`Выбрать: ${getAssistantName(selectedAssistant)}`);
            
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
        const themeParams = tgApp.themeParams;
        
        if (themeParams.bg_color) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
        }
        if (themeParams.text_color) {
            document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
        }
        if (themeParams.hint_color) {
            document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
        }
        if (themeParams.link_color) {
            document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color);
        }
        if (themeParams.button_color) {
            document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
        }
        if (themeParams.button_text_color) {
            document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
        }
        if (themeParams.secondary_bg_color) {
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color);
        }
        
        // Извлекаем RGB компоненты из button_color для создания полупрозрачного фона
        const buttonColor = themeParams.button_color || '#2481cc';
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
