# 🚨 Java 版本错误 - 紧急修复

## ❌ 问题分析

### 错误信息
```
java.lang.UnsupportedClassVersionError: 
class file version 61.0, this version only recognizes up to 52.0
```

### 原因
- **JAR 包**：使用 Java 17 编译（class file version 61.0）
- **运行环境**：微信自动生成 Dockerfile，使用 Java 8（只支持到 52.0）
- **结果**：版本不匹配，无法启动 ❌

### 为什么会这样？
微信开发者工具检测到 JAR 文件后：
1. **自动生成了 Dockerfile**
2. **忽略了你提供的 Dockerfile**
3. 使用默认的 Java 8 镜像

看日志中的 Dockerfile：
```dockerfile
FROM openjdk:8u292-jdk-slim  ← 错误！
WORKDIR /app
COPY *.jar ./
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
```

这不是我们的 Dockerfile！

---

## ✅ 解决方案

### 方案 1：不要直接上传 JAR 文件（推荐 ⭐）

**问题根源：** 微信检测到 JAR 文件就会自动生成 Dockerfile

**解决：** 确保 Dockerfile 和 app.jar 都在同一目录

#### 步骤：

1. **确认 cloud-deploy 文件夹结构**

```
cloud-deploy/
├── Dockerfile          ← 必须存在
├── app.jar            ← 必须存在
├── README.md
└── 其他文件
```

2. **验证 Dockerfile 内容**

确认使用 Java 17：
```dockerfile
FROM eclipse-temurin:17-jre-jammy
```

3. **重新上传整个文件夹**

- 微信开发者工具 → 云托管
- 选择「本地代码」上传
- 上传整个 `cloud-deploy` 文件夹
- **不要只上传 JAR 文件！**

---

### 方案 2：在云托管控制台指定 Dockerfile 路径

如果上传后还是自动生成 Dockerfile：

1. **在部署配置中指定 Dockerfile**
   - 找到「Dockerfile 路径」或「构建配置」
   - 明确指定：`Dockerfile`
   - 构建目录：`.` (当前目录)

2. **或在高级配置中**
   - 构建参数 → Dockerfile 路径
   - 输入：`./Dockerfile`

---

### 方案 3：使用腾讯云控制台部署

如果微信开发者工具一直自动生成 Dockerfile：

#### 步骤 1：打包 cloud-deploy

```cmd
cd d:\SOFT\爱豆时光日记
# Windows 资源管理器中右键 cloud-deploy 文件夹
# 选择「发送到」→「压缩(zipped)文件夹」
# 或使用 7-Zip 等工具打包成 cloud-deploy.zip
```

#### 步骤 2：腾讯云控制台上传

1. 访问：https://console.cloud.tencent.com/tcb
2. 环境：`prod-d7gv8c42oa25aafb0`
3. 云托管 → 服务 → `springboot-h9k1`
4. 版本管理 → 新建版本
5. 上传方式：**代码包上传**
6. 选择 `cloud-deploy.zip`
7. Dockerfile 路径：`Dockerfile`
8. 构建目录：`.`
9. 配置参数并部署

---

### 方案 4：修改 pom.xml 使用 Java 8（不推荐）

**缺点：** Spring Boot 3.x 要求 Java 17

如果强行降级到 Java 8：
- 需要降级 Spring Boot 到 2.7.x
- 需要重新构建
- 可能有兼容性问题

**不推荐此方案！**

---

## 🔍 如何确认使用了正确的 Dockerfile？

### 查看构建日志

正确的日志应该显示：

```
FROM eclipse-temurin:17-jre-jammy  ✅ Java 17
WORKDIR /app
COPY app.jar /app/app.jar
RUN mkdir -p /app/uploads
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
```

**关键检查点：**
- ✅ `eclipse-temurin:17` - 正确
- ❌ `openjdk:8` - 错误（自动生成的）

---

## 📋 重新部署检查清单

- [ ] cloud-deploy 文件夹包含 Dockerfile 和 app.jar
- [ ] Dockerfile 第一行是 `FROM eclipse-temurin:17-jre-jammy`
- [ ] 上传整个 cloud-deploy 文件夹（不是单独上传 JAR）
- [ ] 在部署配置中指定 Dockerfile 路径（如果有选项）
- [ ] 查看构建日志确认使用了正确的 Dockerfile
- [ ] 看到 Java 17 镜像而不是 Java 8

---

## 💡 为什么微信会自动生成 Dockerfile？

### 自动检测逻辑

微信开发者工具和云托管有「智能构建」功能：
1. 检测上传的文件类型
2. 如果发现 `*.jar` 文件
3. 且没有找到 Dockerfile（或忽略了）
4. 自动生成默认的 Dockerfile
5. 使用默认的 Java 8 镜像

### 如何避免？

**确保 Dockerfile 被识别：**
1. Dockerfile 文件名必须正确（大小写）
2. Dockerfile 必须在上传目录的根目录
3. 上传时选择包含 Dockerfile 的整个目录
4. 在配置中明确指定 Dockerfile 路径

---

## 🎯 推荐操作流程

### 第 1 步：验证本地文件

```cmd
cd d:\SOFT\爱豆时光日记\cloud-deploy

# 确认文件存在
dir
```

应该看到：
```
Dockerfile
app.jar
README.md
...
```

### 第 2 步：验证 Dockerfile 内容

```cmd
type Dockerfile
```

第一行应该是：
```
FROM eclipse-temurin:17-jre-jammy
```

### 第 3 步：上传部署

**微信开发者工具方式：**
1. 云开发 → 云托管 → springboot-h9k1
2. 新建版本
3. **本地代码上传**
4. 选择 **cloud-deploy 文件夹**（整个文件夹）
5. 在配置中找到 Dockerfile 相关选项：
   - Dockerfile 路径：`Dockerfile`
   - 构建目录：`.`
6. 配置：8080 / 0.5核 / 1GB
7. 部署

**腾讯云控制台方式：**
1. 打包 cloud-deploy 文件夹为 ZIP
2. 腾讯云控制台上传 ZIP
3. 明确指定 Dockerfile 路径
4. 部署

### 第 4 步：验证构建日志

查看构建日志，确认：
```
FROM eclipse-temurin:17-jre-jammy  ✅
```

如果看到：
```
FROM openjdk:8u292-jdk-slim  ❌
```

说明还是使用了自动生成的 Dockerfile，需要重新部署并明确指定 Dockerfile 路径。

---

## 📞 常见问题

### Q1: 为什么要用 Java 17？

**A:** 因为项目使用了 Spring Boot 3.1.10，最低要求 Java 17

```xml
<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.1.10</version>  ← 需要 Java 17
</parent>

<properties>
    <java.version>17</java.version>  ← Java 17
</properties>
```

### Q2: 可以改用 Java 8 吗？

**A:** 不推荐

需要：
1. 降级 Spring Boot 到 2.7.x
2. 重新构建整个项目
3. 可能有兼容性问题
4. 工作量大

**推荐：** 确保云托管使用 Java 17 镜像

### Q3: 怎么确认微信用了我的 Dockerfile？

**A:** 查看构建日志

日志开头会显示 Dockerfile 内容：
```
Dockerfile created successfully.
Dockerfile content:
FROM openjdk:8u292-jdk-slim  ← 如果看到这个，说明用了自动生成的
```

或：
```
Building Docker image...
#1 [internal] load build definition from Dockerfile
FROM eclipse-temurin:17-jre-jammy  ← 这个是正确的
```

---

## ✅ 总结

1. **问题：** JAR 用 Java 17 编译，但云托管用 Java 8 运行
2. **原因：** 微信自动生成了 Dockerfile，忽略了我们的
3. **解决：** 
   - 上传整个 cloud-deploy 文件夹
   - 明确指定 Dockerfile 路径
   - 或使用腾讯云控制台上传 ZIP
4. **验证：** 查看构建日志确认使用 Java 17 镜像

立即重新部署，确保使用正确的 Dockerfile！🚀
