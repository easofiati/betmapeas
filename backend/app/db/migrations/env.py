import asyncio
import os
from logging.config import fileConfig

# Set an environment variable to signal that Alembic is running.
# This is used in app/db/database.py to avoid initializing the async engine.
os.environ['ALEMBIC_RUNNING'] = '1'

from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine

from alembic import context
from app.core.config import settings

# Import your models' MetaData for 'autogenerate' support
from app.db.database import Base
from app.models.user import *

# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Constrói a URL síncrona a partir do objeto de configurações, que carrega
# corretamente os valores do .env. Isso garante que o Alembic use as
# credenciais e o host corretos, evitando erros de autenticação.
sync_url = (
    f"postgresql+psycopg2://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
    f"@db/{settings.POSTGRES_DB}"
)
config.set_main_option("sqlalchemy.url", sync_url)



# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

# Other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an actual Engine, though an Engine
    is acceptable here as well.  By skipping the Engine
    creation, we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Run migrations in the given connection."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario, we need to create an Engine
    and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
