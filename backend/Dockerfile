# Dockerfile para backend FastAPI (Python 3.13)
FROM python:3.13-slim

# Variáveis de ambiente para evitar buffering e garantir encoding
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências primeiro para aproveitar o cache do Docker
COPY pyproject.toml ./

# Instalar pip e dependências do projeto
RUN pip install --upgrade pip && \
    pip install --no-cache-dir .

# Copiar o restante do código
COPY . .

# Expor a porta 8000
EXPOSE 8000

# Comando padrão: iniciar FastAPI com hot-reload
CMD ["uvicorn", "main:main", "--host", "0.0.0.0", "--port", "8000", "--reload"] 