# Usa la imagen base de Node.js
FROM node:18
# Establece el directorio de trabajo dentro del contenedor
WORKDIR /ui
# Copia el package.json y package-lock.json al directorio de trabajo
COPY package*.json ./
# Instala las dependencias
RUN npm install
# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY . .
# Expone el puerto en el que la aplicación escucha
EXPOSE 3000
# Comando para ejecutar la aplicación
CMD ["node", "server.js"]