# Dockerfile para frontend React + Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build de produção
RUN npm run build

# ---
# Para desenvolvimento, basta rodar: npm run dev
# ---

# Servir build estático com nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 