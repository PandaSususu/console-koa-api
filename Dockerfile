# 基础镜像，基于node的基础镜像
FROM node:14-alpine as build-stage

# 维护
LABEL maintainer=1271250334@qq.com

# 创建一个工作目录
WORKDIR /app

# 把所有文件复制到当前的工作目录下面来
COPY . .

# 安装依赖
RUN npm install  --registry=https://registry.npm.taobao.org

# 打包
RUN npm run build

# 暴露端口
EXPOSE 10241

# 挂载数据
VOLUME [ "/app/public" ]

# 执行命令
CMD [ "node", "dist/server.bundle.js"]