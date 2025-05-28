// Добавьте в начало app.js в front-bot-repo:
if (window.location.search.includes('tgWebAppVersion=') && localStorage.getItem('force_refresh') !== '2.0.0') {
    localStorage.setItem('force_refresh', '2.0.0');
    window.location.reload(true);
}

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
    
    // Переменные для хранения состояния
    let selectedAssistant = null;
    let isRegistered = false;
    let currentUser = null;
    
    // Определяем способ запуска Mini App
    const launchSource = detectLaunchSource();
    console.log('Launch source detected:', launchSource);
    console.log('InitData:', tgApp.initDataUnsafe);
    
    // Получаем информацию о пользователе и проверяем статус регистрации
    initializeUser();
    
    // Добавляем обработчики событий для карточек ассистентов
    const assistantCards = document.querySelectorAll('.assistant-card');
    assistantCards.forEach(card => {
        card.addEventListener('click', function() {
            if (!isRegistered) {
                // Если пользователь не зарегистрирован, показываем процесс регистрации
                showRegistrationFlow();
                return;
            }
            
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
        if (!isRegistered) {
            showRegistrationFlow();
            return;
        }
        
        if (selectedAssistant) {
            sendAssistantSelection(launchSource);
        }
    });
    
    /**
     * Инициализирует информацию о пользователе
     */
    function initializeUser() {
        const initData = tgApp.initDataUnsafe;
        
        if (initData.user) {
            currentUser = initData.user;
            displayUserInfo(currentUser);
            
            // В реальном приложении здесь бы была проверка статуса регистрации через API
            // Для демонстрации используем localStorage (в продакшене это будет API запрос)
            checkRegistrationStatus();
        }
    }
    
    /**
     * Отображает информацию о пользователе в правом верхнем углу
     */
    function displayUserInfo(user) {
        const userInfoContainer = document.getElementById('user-info');
        if (userInfoContainer && user) {
            const displayName = user.username ? `@${user.username}` : 
                               (user.first_name || 'Пользователь');
            
            userInfoContainer.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">${getInitials(user)}</div>
                    <div class="user-name">${displayName}</div>
                    <div class="registration-status ${isRegistered ? 'registered' : 'not-registered'}">
                        ${isRegistered ? '✅' : '⏳'}
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Получает инициалы пользователя для аватара
     */
    function getInitials(user) {
        if (user.first_name) {
            const firstInitial = user.first_name.charAt(0).toUpperCase();
            const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
            return firstInitial + lastInitial;
        }
        return user.username ? user.username.charAt(0).toUpperCase() : 'U';
    }
    
    /**
     * Проверяет статус регистрации пользователя
     */
    async function checkRegistrationStatus() {
        try {
            // В будущем здесь будет API запрос для проверки статуса
            // Пока используем localStorage для демонстрации
            const storedStatus = localStorage.getItem(`user_registered_${currentUser.id}`);
            isRegistered = storedStatus === 'true';
            
            updateUIBasedOnRegistration();
            displayUserInfo(currentUser);
        } catch (error) {
            console.error('Ошибка при проверке статуса регистрации:', error);
            isRegistered = false;
            updateUIBasedOnRegistration();
        }
    }
    
    /**
     * Обновляет интерфейс в зависимости от статуса регистрации
     */
    function updateUIBasedOnRegistration() {
        const instructionSteps = document.querySelector('.instruction-steps');
        const headerSubtitle = document.querySelector('.header-subtitle');
        
        if (!isRegistered) {
            // Показываем инструкции для незарегистрированных пользователей
            if (headerSubtitle) {
                headerSubtitle.textContent = 'Пройдите быструю регистрацию, чтобы начать использовать ассистентов';
            }
            
            if (instructionSteps) {
                instructionSteps.innerHTML = `
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-text">Нажмите на любого ассистента для регистрации</div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-text">Подтвердите регистрацию</div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-text">Выберите нужного ассистента</div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-text">Начните общение в чате с ботом</div>
                    </div>
                `;
            }
            
            // Добавляем класс для незарегистрированных пользователей
            document.body.classList.add('not-registered');
        } else {
            // Показываем обычные инструкции для зарегистрированных пользователей
            if (headerSubtitle) {
                headerSubtitle.textContent = 'Нажмите на карточку, затем на кнопку "Выбрать" внизу экрана';
            }
            
            document.body.classList.remove('not-registered');
        }
    }
    
    /**
     * Показывает процесс регистрации
     */
    function showRegistrationFlow() {
        if (!currentUser) {
            tgApp.showAlert('Ошибка: Информация о пользователе недоступна');
            return;
        }
        
        const userName = currentUser.first_name || currentUser.username || 'Пользователь';
        
        tgApp.showConfirm(
            `👋 Привет, ${userName}!\n\n` +
            `Для использования ИИ-ассистентов необходимо пройти быструю регистрацию.\n\n` +
            `📋 Ваши данные:\n` +
            `• Имя: ${currentUser.first_name || 'Не указано'}\n` +
            `• Username: ${currentUser.username ? '@' + currentUser.username : 'Не указан'}\n\n` +
            `Продолжить регистрацию?`,
            function(confirmed) {
                if (confirmed) {
                    performRegistration();
                }
            }
        );
    }
    
    /**
     * Выполняет регистрацию пользователя
     */
    async function performRegistration() {
        try {
            // Показываем процесс регистрации
            tgApp.MainButton.setText("Регистрация...");
            tgApp.MainButton.showProgress();
            tgApp.MainButton.show();
            
            // В продакшене здесь был бы API запрос с валидацией initData
            // Для демонстрации используем localStorage
            
            // Имитируем API запрос
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Сохраняем статус регистрации
            localStorage.setItem(`user_registered_${currentUser.id}`, 'true');
            isRegistered = true;
            
            // Отправляем данные в бота через sendData (только для keyboard button)
            const registrationData = {
                action: "register_user",
                user_id: currentUser.id,
                source: launchSource
            };
            
            if (launchSource === 'keyboard') {
                tgApp.sendData(JSON.stringify(registrationData));
            } else {
                // Для menu button показываем успешную регистрацию
                tgApp.MainButton.hideProgress();
                tgApp.MainButton.hide();
                
                tgApp.showAlert(
                    '✅ Регистрация завершена!\n\n' +
                    'Теперь вы можете выбрать ассистента и начать общение.',
                    function() {
                        // Обновляем интерфейс
                        updateUIBasedOnRegistration();
                        displayUserInfo(currentUser);
                    }
                );
            }
            
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            tgApp.MainButton.hideProgress();
            tgApp.MainButton.hide();
            
            tgApp.showAlert('❌ Ошибка при регистрации. Попробуйте еще раз.');
        }
    }
    
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
        if (!isRegistered) {
            showRegistrationFlow();
            return;
        }
        
        try {
            // Показываем процесс
            tgApp.MainButton.showProgress();
            tgApp.MainButton.setText("Отправка...");
            
            if (source === 'keyboard') {
                // Для keyboard button используем sendData
                const dataToSend = JSON.stringify({
                    action: "show_specific_assistant",
                    selected_assistant: selectedAssistant,
                    source: source,
                    user_id: currentUser.id
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
