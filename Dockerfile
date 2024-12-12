# 构建阶段
FROM node:20.11.1-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# 运行阶段
FROM nginx:alpine

# 复制构建产物到 Nginx 默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]