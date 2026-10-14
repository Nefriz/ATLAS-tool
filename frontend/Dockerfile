
# 1. Build React application
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Use the same server for frontend and API
ENV VITE_API_URL=""

RUN npm run build

# 2. Serve built frontend with Nginx
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
