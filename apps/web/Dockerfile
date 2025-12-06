FROM node:18-alpine

WORKDIR /app

# Copiamos dependencias
COPY package*.json ./

# Instalamos
RUN npm install

# Copiamos código fuente
COPY . .

# Exponemos puerto de Vite
EXPOSE 5173

# Arrancamos exponiendo a la red (--host es vital para Docker)
CMD ["npm", "run", "dev", "--", "--host"]