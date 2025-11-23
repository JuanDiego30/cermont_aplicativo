FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma y compilación
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el código fuente
COPY . .

# Compilar la aplicación TypeScript
RUN npm run build

# Exponer el puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "run", "start:prod"]
