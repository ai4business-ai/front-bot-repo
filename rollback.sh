#!/bin/bash

# rollback.sh - Скрипт для отката к предыдущей версии

# Определяем доступные версии (добавляйте новые по мере создания)
declare -A VERSIONS
VERSIONS[1.0.0]="initial-release"
VERSIONS[1.0.1]="version-1.0.1"
# Добавляйте новые версии здесь

# Функция для отображения доступных версий
show_versions() {
    echo "Доступные версии для отката:"
    for version in "${!VERSIONS[@]}"; do
        echo "  - $version (тег: ${VERSIONS[$version]})"
    done
}

# Функция для отката к указанной версии
rollback_to_version() {
    local target_version=$1
    local git_tag=${VERSIONS[$target_version]}
    
    if [ -z "$git_tag" ]; then
        echo "Ошибка: Версия $target_version не найдена"
        show_versions
        exit 1
    fi
    
    echo "Откатываемся к версии $target_version (тег: $git_tag)..."
    
    # Создаем резервную ветку перед откатом
    backup_branch="backup-$(date +%Y%m%d-%H%M%S)"
    git branch "$backup_branch"
    echo "Создана резервная ветка: $backup_branch"
    
    # Переключаемся на указанную версию
    git checkout "$git_tag"
    
    # Создаем новую ветку для отката
    rollback_branch="rollback-to-$target_version"
    git checkout -b "$rollback_branch"
    
    echo "Откат завершен!"
    echo "Резервная ветка: $backup_branch"
    echo "Текущая ветка: $rollback_branch"
    echo ""
    echo "Для применения изменений на основной ветке:"
    echo "git checkout main"
    echo "git merge $rollback_branch"
    echo "git push origin main"
}

# Функция для создания новой версии
create_version() {
    local new_version=$1
    
    if [ -z "$new_version" ]; then
        echo "Ошибка: Укажите номер версии"
        echo "Использование: $0 create 1.0.2"
        exit 1
    fi
    
    # Обновляем версию в version.js
    if [ -f "version.js" ]; then
        sed -i.bak "s/const APP_VERSION = \".*\"/const APP_VERSION = \"$new_version\"/" version.js
        sed -i.bak "s/const BUILD_DATE = \".*\"/const BUILD_DATE = \"$(date +%Y-%m-%d)\"/" version.js
        rm version.js.bak
        echo "Обновлена версия в version.js до $new_version"
    fi
    
    # Создаем git тег
    git_tag="version-$new_version"
    git add .
    git commit -m "Release version $new_version"
    git tag "$git_tag"
    
    echo "Создана версия $new_version с тегом $git_tag"
    echo "Не забудьте добавить эту версию в массив VERSIONS в этом скрипте"
}

# Основная логика
case "$1" in
    "list")
        show_versions
        ;;
    "rollback")
        if [ -z "$2" ]; then
            echo "Использование: $0 rollback <версия>"
            show_versions
            exit 1
        fi
        rollback_to_version "$2"
        ;;
    "create")
        create_version "$2"
        ;;
    *)
        echo "Использование: $0 {list|rollback|create} [версия]"
        echo ""
        echo "Команды:"
        echo "  list                 - показать доступные версии"
        echo "  rollback <версия>    - откатиться к указанной версии"
        echo "  create <версия>      - создать новую версию"
        echo ""
        echo "Примеры:"
        echo "  $0 list"
        echo "  $0 rollback 1.0.0"
        echo "  $0 create 1.0.2"
        exit 1
        ;;
esac
