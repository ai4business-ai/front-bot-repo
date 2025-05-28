document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    
    // Отображаем приложение (скрывает загрузчик Telegram)
    tgApp.ready();
    
    // Расширяем приложение на всю высоту
    tgApp.expand();
    
    // Проверяем обновления и отображаем версию
    if (window.AppVersion) {
        window.AppVersion.checkForUpdates();
        window.AppVersion.displayVersion();
    }
    
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
    
    // Определяем способ запуска Mini App
    const launchSource = detectLaunchSource();
    console.log('Launch source detected:', launchSource);
    console.log('InitData:', tgApp.initDataUnsafe);
    
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
            sendAssistantSelection(launchSource);
        }
    });
    
    /**
     * Определяет способ запуска Mini App
     * @returns {string} - тип запуска: 'keyboard', 'menu_or_inline'
     */
    function detectLaunchSource() {
        const initData = tgApp.initDataUnsafe;
        
        // Проверяем наличие query_id - если есть, то это запуск из inline/menu button
        if (initData.query_id) {
            return 'menu_or_inline';
        } else {
            // Если нет query_id, то это keyboard button
            return 'keyboard';
        }
    }
    
    /**
     * Отправляет информацию о выбранном ассистенте в бота
     * @param {string} source - источник запуска приложения
     */
    function sendAssistantSelection(source) {
        try {
            // Показываем процесс
            tgApp.MainButton.showProgress();
            tgApp.MainButton.setText("Отправка...");
            
            if (source === 'keyboard') {
                // Для keyboard button используем sendData
                const dataToSend = JSON.stringify({
                    action: "show_specific_assistant",
                    selected_assistant: selectedAssistant,
                    source: source
                });
                
                console.log('Sending data via sendData:', dataToSend);
                tgApp.sendData(dataToSend);
                
            } else {
                // Для menu button показываем инструкцию
                console.log('Menu/inline button detected - showing fallback instruction');
                showFallbackInstruction(selectedAssistant);
            }
            
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            handleSendError();
        }
    }
    
    /**
     * Показывает инструкцию пользователю как fallback для menu button
     * @param {string} assistantType - тип выбранного ассистента
     */
    function showFallbackInstruction(assistantType) {
        const assistantName = getAssistantName(assistantType);
        
        tgApp.MainButton.hideProgress();
        tgApp.MainButton.setText("Выбрано");
        tgApp.MainButton.disable();
        
        const message = 
            `✅ Выбран ассистент: ${assistantName}\n\n` +
            `📱 Инструкция:\n` +
            `1. Закройте это приложение\n` +
            `2. В чате нажмите кнопку "🎮 Выбрать ассистента"\n` +
            `3. Выберите "${assistantName}" из списка\n\n` +
            `Это поможет избежать технических ограничений при запуске из меню.`;
        
        tgApp.showConfirm(message, function(confirmed) {
            if (confirmed) {
                // Пользователь нажал OK - закрываем приложение
                tgApp.close();
            } else {
                // Пользователь нажал Cancel - возвращаем кнопку в исходное состояние
                tgApp.MainButton.setText(`Выбрать: ${assistantName}`);
                tgApp.MainButton.enable();
            }
        });
    }
    
    /**
     * Обработка ошибки отправки
     */
    function handleSendError() {
        tgApp.MainButton.hideProgress();
        if (selectedAssistant) {
            tgApp.MainButton.setText(`Выбрать: ${getAssistantName(selectedAssistant)}`);
            // Показываем fallback инструкцию при ошибке
            showFallbackInstruction(selectedAssistant);
        } else {
            tgApp.MainButton.setText("Выберите ассистента");
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
     * Возвращает описание ассистента по его команде
     * @param {string} command - Команда ассистента
     * @returns {string} - Описание ассистента
     */
    function getAssistantDescription(command) {
        const descriptions = {
            'market': 'Помогает проанализировать рынок, конкурентов и найти ниши для развития',
            'founder': 'Помогает обсудить и проработать идеи основателя бизнеса',
            'business': 'Помогает составить и проанализировать бизнес-модель',
            'adapter': 'Помогает адаптировать успешные идеи из различных кейсов для вашего бизнеса'
        };
        
        return descriptions[command] || 'Бизнес-ассистент';
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
