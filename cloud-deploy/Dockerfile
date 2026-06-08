# 云托管部署 Dockerfile（使用预构建的 JAR 包）
# ⚠️ 重要：此应用需要 Java 17
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 复制 JAR 包
COPY app.jar /app/app.jar

# 创建文件上传目录
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# 暴露端口
EXPOSE 8080

# JVM 参数优化
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
