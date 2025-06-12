#!/usr/bin/env python3
"""
Database migration and management script.

This script provides a command-line interface for managing database migrations
and performing common database operations.
"""
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Optional

import typer
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Typer app
app = typer.Typer(help="Database management commands")

# Get project root directory
PROJECT_ROOT = Path(__file__).parent.absolute()
MIGRATIONS_DIR = PROJECT_ROOT / "app" / "db" / "migrations"
ALEMBIC_INI = PROJECT_ROOT / "alembic.ini"


def run_command(command: List[str], cwd: Optional[Path] = None) -> int:
    """Run a shell command and return the exit code."""
    if cwd is None:
        cwd = PROJECT_ROOT
    
    try:
        result = subprocess.run(
            command,
            cwd=str(cwd),
            check=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if result.stdout:
            print(result.stdout)
        return 0
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {' '.join(command)}", file=sys.stderr)
        if e.stdout:
            print("STDOUT:", e.stdout, file=sys.stderr)
        if e.stderr:
            print("STDERR:", e.stderr, file=sys.stderr)
        return e.returncode


def check_database_url() -> bool:
    """Check if database connection settings are properly configured."""
    required_vars = [
        "POSTGRES_SERVER",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "POSTGRES_DB"
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(
            f"Error: Missing required database configuration.\n"
            f"Please set the following environment variables in your .env file:\n"
            f"{', '.join(missing_vars)}",
            file=sys.stderr,
        )
        return False
    return True


@app.command()
def init():
    """Initialize the database and run migrations."""
    if not check_database_url():
        raise typer.Exit(1)
    
    # Create migrations directory if it doesn't exist
    MIGRATIONS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialize Alembic if not already initialized
    if not (MIGRATIONS_DIR / "env.py").exists():
        print("Initializing Alembic...")
        result = run_command(["alembic", "init", "app/db/migrations"])
        if result != 0:
            raise typer.Exit(result)
    
    print("Database initialization complete.")


@app.command()
def migrate(message: str = typer.Option(..., "--message", "-m", help="Migration message")):
    """Create a new migration with autogenerate."""
    if not check_database_url():
        raise typer.Exit(1)
    
    print("Generating migration...")
    result = run_command(["alembic", "revision", "--autogenerate", "-m", message])
    if result != 0:
        raise typer.Exit(result)
    
    print("Migration created. Run 'db upgrade' to apply it.")


@app.command()
def upgrade(revision: str = "head"):
    """Upgrade to a later database revision."""
    if not check_database_url():
        raise typer.Exit(1)
    
    print(f"Upgrading database to revision: {revision}")
    result = run_command(["alembic", "upgrade", revision])
    if result != 0:
        raise typer.Exit(result)
    
    print("Upgrade complete.")


@app.command()
def downgrade(revision: str):
    """Revert to a previous database revision."""
    if not check_database_url():
        raise typer.Exit(1)
    
    print(f"Downgrading database to revision: {revision}")
    result = run_command(["alembic", "downgrade", revision])
    if result != 0:
        raise typer.Exit(result)
    
    print("Downgrade complete.")


@app.command()
def reset():
    """Reset the database to a clean state."""
    if not check_database_url():
        raise typer.Exit(1)
    
    if not typer.confirm("Are you sure you want to reset the database? This will drop all tables!"):
        print("Operation cancelled.")
        raise typer.Exit(0)
    
    # Drop all tables
    print("Dropping all tables...")
    from app.db.database import Base, engine
    Base.metadata.drop_all(bind=engine)
    
    # Recreate tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Stamp the latest revision
    print("Stamping database with latest revision...")
    result = run_command(["alembic", "stamp", "head"])
    if result != 0:
        raise typer.Exit(result)
    
    print("Database reset complete.")


@app.command()
def status():
    """Show the current database revision."""
    if not check_database_url():
        raise typer.Exit(1)
    
    print("Current database status:")
    result = run_command(["alembic", "current"])
    if result != 0:
        raise typer.Exit(result)


@app.command()
def history():
    """Show migration history."""
    if not check_database_url():
        raise typer.Exit(1)
    
    print("Migration history:")
    result = run_command(["alembic", "history", "-v"])
    if result != 0:
        raise typer.Exit(result)


if __name__ == "__main__":
    app()
