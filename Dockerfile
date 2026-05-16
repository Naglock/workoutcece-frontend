# ETAPA 1: Construcción (Node.js)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos los archivos compilados al servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Configuración rápida para que React Router no lance error 404 al recargar la página
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]