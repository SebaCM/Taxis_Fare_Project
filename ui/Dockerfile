FROM nginx:latest

# Copia el archivo de configuración de Nginx al contenedor
COPY nginx.conf /etc/nginx/nginx.conf

# Copia los archivos de tu aplicación web al contenedor
COPY ./ /usr/share/nginx/html/ui

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]