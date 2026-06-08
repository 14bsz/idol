# 云托管部署包

## 📦 包含文件

- `app.jar` - Spring Boot 应用（idol-diary-backend-1.0.0.jar）
- `Dockerfile` - Docker 镜像构建文件
- `README.md` - 本文档

## 🚀 部署方式

### 方式 1：通过微信开发者工具（推荐 ✅）

1. **打开微信开发者工具**

2. **进入云托管管理**
   - 顶部菜单 → 云开发 → 云托管
   - 或点击右上角"云开发"按钮

3. **选择服务**
   - 环境：`prod-d7gv8c42oa25aafb0`
   - 服务：`springboot-h9k1`

4. **上传代码**
   - 点击"新建版本"或"上传代码"
   - 选择本文件夹 `cloud-deploy` 整个目录上传
   - 或直接拖拽本文件夹到上传区域

5. **配置部署参数**
   ```
   端口：8080
   CPU：0.5 核（可调整为 0.25/1/2 核）
   内存：1GB（可调整为 512MB/2GB/4GB）
   实例数量：1（可按需扩展）
   ```

6. **确认环境变量**
   
   确保以下环境变量已配置（在服务设置中）：
   ```
   MYSQL_ADDRESS=<云数据库地址>
   MYSQL_USERNAME=<数据库用户名>
   MYSQL_PASSWORD=<数据库密码>
   ```

7. **提交部署**
   - 点击"确定"或"部署"
   - 等待构建和部署完成（约 5-10 分钟）

8. **查看部署状态**
   - 实例状态应显示"运行中"
   - 点击"日志"查看启动日志
   - 搜索关键字：`Started IdolDiaryApplication`

---

### 方式 2：通过腾讯云控制台

1. **登录腾讯云控制台**
   - https://console.cloud.tencent.com/tcb

2. **进入云托管**
   - 选择环境：`prod-d7gv8c42oa25aafb0`
   - 点击"云托管"

3. **选择服务**
   - 服务名：`springboot-h9k1`
   - 点击"版本管理"

4. **新建版本**
   - 点击"新建版本"
   - 上传方式选择"上传代码包"

5. **上传部署包**
   - 将 `cloud-deploy` 文件夹打包为 zip
   - 上传 zip 文件
   - 或使用命令行工具上传

6. **配置参数**（同方式 1）

7. **发布部署**
   - 流量配置：可选择灰度发布或全量发布
   - 建议先设置 10% 流量测试

---

### 方式 3：命令行部署（高级）

**前提：** 安装腾讯云 CLI 工具

```bash
# 登录
tcb login

# 部署
tcb fn deploy --region ap-shanghai --env prod-d7gv8c42oa25aafb0
```

---

## ✅ 部署后验证

### 1. 检查实例状态

**云托管控制台 → 实例列表：**
- ✅ 状态：运行中
- ✅ 实例数：≥ 1
- ✅ CPU/内存：正常范围

### 2. 查看启动日志

**实例日志 → 搜索关键字：**
```
Started IdolDiaryApplication
```

预期看到：
```
2026-06-08 XX:XX:XX.XXX  INFO 1 --- [main] c.i.IdolDiaryApplication : Started IdolDiaryApplication in XX.XXX seconds
Tomcat started on port(s): 8080 (http)
```

### 3. 测试接口

**测试 1：基础接口**
```bash
curl -X GET "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/idols" \
  -H "Authorization: YOUR_TOKEN"
```

预期：返回 200，包含数据

**测试 2：文件上传接口（新）**
```bash
curl -X POST "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/files/upload" \
  -H "Authorization: YOUR_TOKEN" \
  -F "file=@test.jpg"
```

预期：返回 200
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "url": "/uploads/2026/06/08/xxx.jpg",
    "filename": "xxx.jpg"
  }
}
```

**测试 3：置顶接口（新）**
```bash
curl -X PUT "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/diaries/1/pin" \
  -H "Authorization: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pinned": 1}'
```

预期：返回 200

---

## 📱 小程序配置

部署成功后，需要修改小程序配置：

**文件：** `miniprogram/utils/env.js`

**修改：**
```javascript
const USE_LOCAL_UPLOAD_IN_DEVICE = false; // 改回 false，使用云托管
```

**重新编译小程序，测试功能：**
- [ ] 头像上传
- [ ] 壁纸上传
- [ ] 收藏图片上传
- [ ] 日记图片上传
- [ ] 日记置顶

---

## 🔍 常见问题

### Q1: 部署失败，提示"构建超时"

**解决：**
- Dockerfile 中已使用预构建的 JAR，应该很快
- 检查网络连接
- 重试部署

### Q2: 实例启动失败

**可能原因：**
- 环境变量未配置
- 数据库连接失败
- 端口冲突

**检查：**
1. 实例日志中的错误信息
2. 环境变量配置
3. 数据库连接参数

### Q3: 接口返回 404

**可能原因：**
- JAR 包不是最新版本
- 路由配置问题

**解决：**
- 确认 JAR 包构建日期
- 重新构建并部署

### Q4: 文件上传后丢失

**原因：** 容器重启后 `uploads` 目录内容丢失

**临时方案：** 使用云存储（COS）
**长期方案：** 配置持久化卷

---

## 📊 版本信息

- **构建时间：** 2026-06-08 12:04:02
- **应用版本：** 1.0.0
- **JAR 大小：** 32 MB
- **Java 版本：** 17
- **Spring Boot：** 3.1.10

---

## 🔄 回滚方案

如果部署后出现问题：

1. **云托管控制台 → 版本管理**
2. 选择上一个稳定版本
3. 点击"回滚"
4. 流量自动切换到旧版本

---

## 📝 部署检查清单

部署前：
- [x] JAR 包已构建（app.jar）
- [x] Dockerfile 已准备
- [ ] 数据库迁移已执行
- [ ] 环境变量已确认

部署中：
- [ ] 代码上传成功
- [ ] 镜像构建成功
- [ ] 实例启动成功

部署后：
- [ ] 实例状态"运行中"
- [ ] 启动日志正常
- [ ] 基础接口测试通过
- [ ] 文件上传测试通过
- [ ] 置顶功能测试通过
- [ ] 小程序真机测试通过

---

## 🆘 需要帮助？

1. 查看实例日志获取详细错误信息
2. 检查环境变量和数据库配置
3. 参考主项目的部署文档
4. 联系技术支持，提供日志和错误截图
