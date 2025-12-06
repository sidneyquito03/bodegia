FROM node:18-alpine

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Arrancamos en modo desarrollo
CMD ["npm", "run", "dev"]