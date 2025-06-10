# Dockerfile para backend FastAPI (Python 3.13)
FROM python:3.13-slim

# Variáveis de ambiente para evitar buffering e garantir encoding
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY pyproject.toml .

# Instalar dependências do projeto (usando pip, pois poetry/pdm não está especificado)
RUN pip install --upgrade pip && pip install fastapi uvicorn[standard]

# Copiar o restante do código
COPY . .

# Comando padrão: iniciar FastAPI com hot-reload
CMD ["uvicorn", "main:main", "--host", "0.0.0.0", "--port", "8000", "--reload"] 