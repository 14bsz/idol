# ── 构建阶段 ──────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# 先复制 pom.xml 单独下载依赖，利用 Docker 层缓存
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 再复制源码并打包（跳过测试）
COPY src ./src
RUN mvn package -DskipTests -B

# ── 运行阶段 ──────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# 从构建阶段复制 jar
COPY --from=builder /app/target/idol-diary-backend-1.0.0.jar app.jar

# 文件上传目录
RUN mkdir -p uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
