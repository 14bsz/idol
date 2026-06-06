# 爱豆时光日记 - 后端服务

## 项目说明

这是一个基于 Spring Boot + MyBatis-Plus 的后端服务。

## 已完成内容

### 1. 数据库
- ✅ 数据库 `idol_diary` 已创建
- ✅ 所有表结构已创建（user, idol, diary, collection, anniversary）

### 2. 项目结构
```
backend/
├── pom.xml
├── src/main/
│   ├── java/com/idoldiary/
│   │   ├── IdolDiaryApplication.java  # 启动类
│   │   ├── entity/              # 实体类（User, Idol, Diary, Collection）
│   │   ├── mapper/              # Mapper 接口
│   │   └── common/              # 通用类（Result）
│   └── resources/
│       ├── application.yml    # 配置文件
│       └── schema.sql      # 数据库表结构
```

### 3. 配置
- ✅ 数据库连接已配置（MySQL localhost:3306）
- ✅ MyBatis-Plus 已配置
- ✅ Sa-Token 已配置

## 下一步开发

如需完善后端，可继续开发：
- Service 层
- Controller 层（API 接口）
- 微信登录集成
- 跨域配置等

## 启动项目

需要先安装 Maven 和 JDK 17，然后：
```bash
cd backend
mvn spring-boot:run
```
