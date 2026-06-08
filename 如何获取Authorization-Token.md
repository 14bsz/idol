# 如何获取 Authorization Token

## 方法 1：从微信开发者工具获取（推荐）

### 步骤：

1. **打开微信开发者工具**

2. **登录小程序**
   - 运行小程序
   - 进行微信登录

3. **打开调试器控制台**
   - 点击顶部菜单 → 调试 → 调试器
   - 或按 `Ctrl + Shift + I`

4. **查看 Storage**
   - 切换到 "Storage" 或 "存储" 标签
   - 点击 "Storage" → "wx:storage"
   - 找到 `token` 这一项

5. **复制 Token**
   - 双击 `token` 的值
   - 复制完整的 token 字符串

**示例：**
```
token: "c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"
```

### 使用 Token：

```bash
curl -X GET "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/idols" \
  -H "Authorization: c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"
```

---

## 方法 2：从控制台日志获取

### 步骤：

1. **打开微信开发者工具控制台**

2. **登录小程序**

3. **查看登录成功的日志**
   ```
   [云托管登录] statusCode: 200 data: {
     "token": "c0dbcebb-cf01-4fa1-9d5f-38e026bfe568",
     "userId": 1,
     ...
   }
   ```

4. **复制 token 值**

---

## 方法 3：通过浏览器 Network 面板获取

### 步骤：

1. **打开微信开发者工具**

2. **打开调试器 → Network 标签**

3. **登录小程序**

4. **查看任意 API 请求**
   - 点击任意 `/api/` 开头的请求
   - 查看 "Request Headers"
   - 找到 `Authorization` 字段

5. **复制 Token 值**

---

## 方法 4：使用代码打印（调试专用）

### 在小程序代码中添加：

**在 `app.js` 的 `sendCodeToServer` 方法中：**

```javascript
sendCodeToServer(code) {
  return new Promise((resolve, reject) => {
    // ... 现有代码 ...
    
    const handleResponse = (data) => {
      if (data.code === 200) {
        const { token, userId, nickname, avatarUrl } = data.data;
        
        // 🔑 打印 Token（调试用）
        console.log('====================================');
        console.log('🔑 Authorization Token:');
        console.log(token);
        console.log('====================================');
        
        this.globalData.token = token;
        // ... 其余代码 ...
      }
    };
    // ...
  });
}
```

**然后：**
1. 重新编译
2. 登录
3. 在控制台复制 Token

---

## 方法 5：通过 curl 获取新 Token

### 前提条件：
- 需要微信的 `code`（这个比较难获取）

### 步骤（高级）：

```bash
# 1. 获取微信登录 code（需要在小程序中获取）
# 2. 调用登录接口
curl -X POST "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"code": "YOUR_WECHAT_CODE"}'
```

**返回：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "c0dbcebb-cf01-4fa1-9d5f-38e026bfe568",
    "userId": 1,
    "nickname": "爱豆粉丝www",
    "avatarUrl": "https://..."
  }
}
```

---

## 💡 Token 使用示例

### curl 请求：

```bash
# 基础格式
curl -X GET "URL" \
  -H "Authorization: YOUR_TOKEN"

# 示例 1：获取爱豆列表
curl -X GET "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/idols" \
  -H "Authorization: c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"

# 示例 2：获取日记列表
curl -X GET "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/diaries" \
  -H "Authorization: c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"

# 示例 3：置顶日记（带请求体）
curl -X PUT "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/diaries/1/pin" \
  -H "Authorization: c0dbcebb-cf01-4fa1-9d5f-38e026bfe568" \
  -H "Content-Type: application/json" \
  -d '{"pinned": 1}'
```

### Postman 使用：

1. **新建请求**
2. **设置 Headers**
   ```
   Key: Authorization
   Value: c0dbcebb-cf01-4fa1-9d5f-38e026bfe568
   ```
3. **发送请求**

---

## ⚠️ 注意事项

### 1. Token 有效期

**默认配置：**
```yaml
# application.yml
sa-token:
  timeout: 2592000  # 30天（单位：秒）
```

**Token 过期后：**
- API 请求返回 401
- 需要重新登录获取新 Token

---

### 2. Token 安全

**注意：**
- ⚠️ Token 相当于密码，不要公开分享
- ⚠️ 不要提交到 Git 仓库
- ⚠️ 测试完成后可以退出登录使 Token 失效

**如何使 Token 失效：**
- 小程序中退出登录
- 或后端重启（内存存储）
- 或数据库删除 Token 记录（如果持久化）

---

### 3. 不同用户的 Token

每个用户登录后获得的 Token 不同：
```
用户 A: "c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"
用户 B: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

使用不同用户的 Token 会访问到不同的数据。

---

## 🧪 快速测试

### 测试 Token 是否有效：

```bash
# 测试获取爱豆列表
curl -X GET "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/idols" \
  -H "Authorization: YOUR_TOKEN"
```

**预期结果：**

**✅ Token 有效：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "a",
      "nickname": "aaa",
      ...
    }
  ]
}
```

**❌ Token 无效或过期：**
```json
{
  "code": 401,
  "message": "未登录或登录已过期"
}
```

**❌ Token 格式错误：**
```json
{
  "code": 401,
  "message": "Token无效"
}
```

---

## 🔄 Token 刷新

### 当前实现：

项目使用的是 **Sa-Token**，Token 过期后需要重新登录。

### 自动刷新（可选改进）：

如果想实现自动刷新，可以在 `application.yml` 中配置：

```yaml
sa-token:
  timeout: 2592000           # Token 有效期：30天
  active-timeout: 1800       # Token 最低活跃频率：30分钟
  is-concurrent: true        # 允许并发登录
  is-share: false           # 不共享 Token
```

**active-timeout 说明：**
- 用户在 30 分钟内有操作 → Token 自动续期
- 用户超过 30 分钟无操作 → Token 失效

---

## 📋 常见问题

### Q1: 找不到 token？

**检查：**
1. 确认已经登录
2. 查看 Storage → wx:storage
3. 搜索 "token" 关键字

---

### Q2: Token 一直变？

**原因：**
- 每次登录都会生成新 Token
- 旧 Token 可能失效（取决于后端配置）

**解决：**
- 使用最新的 Token
- 或保持登录状态

---

### Q3: curl 命令不识别？

**Windows CMD：**
```cmd
curl -X GET "URL" -H "Authorization: TOKEN"
```

**Windows PowerShell：**
```powershell
curl.exe -X GET "URL" -H "Authorization: TOKEN"
```

或使用 **Postman**、**Insomnia** 等图形化工具。

---

## 🎯 推荐工作流

### 日常开发测试：

1. **开发者工具登录一次**
2. **从 Storage 复制 Token**
3. **保存到文本文件**（如 `token.txt`）
4. **使用时从文件复制**

### 使用环境变量（可选）：

**Linux/Mac:**
```bash
export TOKEN="c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"

# 使用
curl -X GET "URL" -H "Authorization: $TOKEN"
```

**Windows PowerShell:**
```powershell
$env:TOKEN="c0dbcebb-cf01-4fa1-9d5f-38e026bfe568"

# 使用
curl -X GET "URL" -H "Authorization: $env:TOKEN"
```

---

## 📚 相关文档

- Sa-Token 官方文档：https://sa-token.cc/
- 微信小程序登录流程：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html
- HTTP Authorization Header：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Authorization
