-- Desconectar todas as conexões ativas
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'betmapeas'
  AND pid <> pg_backend_pid();

-- Recriar o banco de dados
DROP DATABASE IF EXISTS betmapeas;
CREATE DATABASE betmapeas;
