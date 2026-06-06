[OPEN] image-static-500

# 现象
- 小程序中壁纸地址形如 `/uploads/2026/05/19/72b68432-dad1-4365-ae77-ce3468b66bc5.webp`
- 文件已上传到磁盘，但访问返回 HTTP 500

# 假设
- 假设1：静态资源映射的物理目录与实际上传目录不一致，导致 Spring 找不到文件。
- 假设2：`WebConfig` 已生效，但 `file:` 资源路径格式在 Windows 下不正确，解析时报错。
- 假设3：运行中的后端并未加载当前最新配置或代码，实际生效的仍是旧逻辑。
- 假设4：返回 500 不是找不到文件，而是资源处理链在读取 `.webp` 文件时触发了服务端异常。
- 假设5：`user.dir` 在当前启动方式下指向 `backend` 或其他目录，和我预期的项目根目录不同。

# 计划
- 先读取当前配置与代码，确认资源映射和上传保存路径的计算方式。
- 再启动后端并直接请求上传文件，收集服务端日志与 HTTP 响应证据。
- 基于证据最小化修复，再做一次前后对比验证。

# 证据
- `.dbg/trae-debug-log-image-static-500.ndjson:1`
  - `basePath = D:\SOFT\爱豆时光日记\backend`
  - `uploadAbsolutePath = D:\SOFT\爱豆时光日记\backend\uploads\`
  - `exists = false`
  - 说明静态资源映射初始化时指向了错误目录。

# 假设判定
| ID | 假设 | 结论 | 证据 |
|----|------|------|------|
| A | 静态资源映射目录与实际上传目录不一致 | 已确认 | 日志第 1 行显示映射目录是 `backend/uploads` 且目录不存在 |
| B | `file:` 路径格式在 Windows 下错误 | 未确认 | 当前更早命中了错误目录问题，先修复目录再复核 |
| C | 运行中的后端不是最新代码 | 已确认 | 8080 已被旧进程占用，刚启动的新进程因端口冲突退出 |
| D | `.webp` 读取链路自身异常 | 已排除 | 当前初始化日志已说明目录不存在，更符合目录定位错误 |
| E | `user.dir` 指向 `backend` 等子目录 | 已确认 | 日志第 1 行 `basePath` 即 `...\\backend` |

# 修复
- 统一通过 `resolveUploadRoot()` 解析上传根目录：
  - 若当前工作目录名是 `backend`，则回退到其父目录作为项目根目录。
  - 若 `file.upload.path` 是绝对路径，则直接使用。
- `FileController` 与 `WebConfig` 共用同一套目录解析规则，避免“上传到一处、读取另一处”。

# 修复后证据
- HTTP 直连验证：
  - `GET http://localhost:8080/uploads/2026/05/19/72b68432-dad1-4365-ae77-ce3468b66bc5.webp`
  - 返回 `200`
  - `Content-Type = image/webp`
- `.dbg/trae-debug-log-image-static-500.ndjson:2-4`
  - 初始化后 `uploadAbsolutePath = D:\SOFT\爱豆时光日记\uploads\`
  - 目录 `exists = true`
  - 资源 `resolved = true`

# 二次定位证据
- `.dbg/trae-debug-log-image-static-500.ndjson:4-8`
  - `FileController.uploadFile` 已成功保存文件
  - `IdolController.updateIdol` 进入后立刻抛出 `NotLoginException`
  - 错误内容：`token 无效`
- 说明数据库持久化失败的根因不是图片路径或 SQL，而是后端重启后登录态失效。

# 二次修复
- 新增全局异常处理，将 `NotLoginException` 明确返回为 HTTP `401`
- 首页更换壁纸逻辑不再把后端保存失败伪装成“更新成功（本地）”
- 保留调试埋点，等待用户按“重新登录后再重试”的路径做最终确认
