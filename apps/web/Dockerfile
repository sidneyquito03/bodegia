# apps/web/Dockerfile

# Usamos la imagen base de Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código fuente del Frontend
COPY . .

# Expone el puerto 5173 (el que usa Vite)
EXPOSE 5173

# Comando para correr la aplicación (npm run dev)
CMD [ "npm", "run", "dev" ]