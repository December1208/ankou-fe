#!/bin/bash

# 配置变量
IMAGE_NAME="ankou-fe:latest"
IMAGE_FILE="ankou-fe.tar"
REMOTE_USER="ubuntu"
REMOTE_HOST="121.4.100.51"
REMOTE_DIR="/home/ubuntu"

# 保存本地镜像为 tar 文件
echo "Saving Docker image to tar file..."
docker save -o $IMAGE_FILE $IMAGE_NAME
if [ $? -ne 0 ]; then
    echo "Failed to save Docker image."
    exit 1
fi

# 使用 scp 将 tar 文件传输到服务器
echo "Transferring tar file to remote server..."
scp $IMAGE_FILE $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR
if [ $? -ne 0 ]; then
    echo "Failed to transfer tar file."
    exit 1
fi

# 删除本地 tar 文件
rm $IMAGE_FILE

# 在远程服务器上加载镜像并运行容器
echo "Loading image and running container on remote server..."
ssh $REMOTE_USER@$REMOTE_HOST << EOF
    docker load -i $REMOTE_DIR/$IMAGE_FILE
    if [ $? -ne 0 ]; then
        echo "Failed to load Docker image."
        exit 1
    fi
EOF

echo "Docker image transferred and container started successfully."
