# services/api/Dockerfile

# Usamos la imagen base de Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos solo los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código fuente del API
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando para correr la aplicación
CMD [ "npm", "run", "dev" ]