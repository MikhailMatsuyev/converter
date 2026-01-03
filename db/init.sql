-- Инициализационные скрипты для БД
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание дополнительных ролей если нужно
-- CREATE ROLE readonly;
-- CREATE ROLE readwrite;

-- Настройка прав
-- GRANT CONNECT ON DATABASE ai_file_processor TO readonly, readwrite;