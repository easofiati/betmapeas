from setuptools import setup, find_packages

setup(
    name="betmapeas",
    version="0.1.0",
    description="BetMapEAS - Sistema de Gerenciamento de Apostas",
    packages=find_packages(include=['app*']),
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn[standard]>=0.15.0",
        "sqlalchemy>=1.4.0",
        "psycopg2-binary>=2.9.0",
        "passlib[bcrypt]>=1.7.4",
        "bcrypt>=4.0.1",
        "python-jose[cryptography]>=3.3.0",
        "PyJWT>=2.0.0",
        "python-multipart>=0.0.5",
        "python-dotenv>=0.19.0",
        "alembic>=1.7.0",
        "pydantic>=1.8.0",
        "email-validator>=1.1.3",
        "typer>=0.4.0",
    ],
    python_requires=">=3.10",
)
