FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD sed -i "s/backend:8080/${BACKEND_HOST:-backend}:${BACKEND_PORT:-8080}/g" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"
