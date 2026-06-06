# 第一阶段：编译阶段
FROM maven:3.9 AS builder

# 设置工作目录
WORKDIR /app

# 复制 pom.xml
COPY backend/pom.xml .

# 下载依赖
RUN mvn dependency:go-offline -B

# 复制源代码
COPY backend/src ./src

# 编译打包
RUN mvn clean package -DskipTests

# 第二阶段：运行阶段
FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 从第一阶段复制 jar 文件
COPY --from=builder /app/target/idol-diary-backend-1.0.0.jar app.jar

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
