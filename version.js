// version.js - Система версионирования для Mini App
const APP_VERSION = "1.0.1";
const BUILD_DATE = "2025-01-28";

// Функция для отображения версии
function displayVersion() {
    const footer = document.querySelector('footer');
    if (footer) {
        const versionElement = document.createElement('div');
        versionElement.className = 'version-info';
        versionElement.innerHTML = `
            <div class="version-text">
                Версия: ${APP_VERSION} | Сборка: ${BUILD_DATE}
            </div>
        `;
        footer.appendChild(versionElement);
    }
}

// Функция для проверки кеша и принудительного обновления
function checkForUpdates() {
    const cachedVersion = localStorage.getItem('app_version');
    const currentVersion = APP_VERSION;
    
    if (cachedVersion && cachedVersion !== currentVersion) {
        console.log(`Обновление с версии ${cachedVersion} до ${currentVersion}`);
        // Очищаем кеш для принудительного обновления
        if ('caches' in window) {
            caches.keys().then(function(names) {
                names.forEach(function(name) {
                    caches.delete(name);
                });
            });
        }
    }
    
    localStorage.setItem('app_version', currentVersion);
}

// CSS стили для версии (добавить в styles.css)
const versionStyles = `
.version-info {
    text-align: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--tg-theme-secondary-bg-color);
}

.version-text {
    font-size: 11px;
    color: var(--tg-theme-hint-color);
    opacity: 0.7;
    font-family: monospace;
}
`;

// Экспортируем переменные для использования в других файлах
window.AppVersion = {
    version: APP_VERSION,
    buildDate: BUILD_DATE,
    displayVersion: displayVersion,
    checkForUpdates: checkForUpdates,
    styles: versionStyles
};
