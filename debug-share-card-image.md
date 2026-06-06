# Debug Session: share-card-image
- **Status**: [OPEN]
- **Issue**: 小程序日志分享卡片顶部图片仍然空白
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: .dbg/trae-debug-log-share-card-image.ndjson

## Reproduction Steps
1. 进入小程序日志列表
2. 点击任意日志的分享入口
3. 进入 `card-generator` 分享预览页
4. 观察顶部图片区域仍为空白

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | `ensureDiaryMediaPersisted()` 未返回正式图片地址，导致 `displayImage` 为空 | High | Med | Rejected |
| B | `displayImage` 有值，但 `<image>` 加载失败 | High | Med | Rejected |
| C | `sharingEntry` 传入的是旧日记对象，媒体数据未更新 | Med | Low | Rejected |
| D | 顶部图片区有样式/布局问题，图片被隐藏 | Med | Low | Rejected |
| E | 用户看到的是页面预览图空白，而不是分享回调缺图 | Med | Low | Confirmed |

## Log Evidence
- 预检查：`.dbg/trae-debug-log-share-card-image.ndjson` 未生成，说明首次未采集到日志
- 运行时错误：`TypeError: fetch is not a function at diary.js debugReport`
- 结论：首轮插桩在微信小程序环境中失效，需将埋点上报从 `fetch` 改为 `wx.request`
- 分享入口证据：`diary:onShare` 显示传入日记 `id=3`，且首图已经是正式地址 `http://localhost:8080/uploads/...jpg`
- 预览页载入证据：`card-generator:onLoad:entry` 和 `card-generator:onLoad:result` 显示 `firstImage` 已正确计算为正式图片地址
- 图片组件证据：`card-generator:onCardImageLoad` 显示顶部 `<image>` 成功加载，宽高为 `1080 x 1080`
- 结论：预览页顶部图本身并不为空，真正异常点在“分享回调使用的 imageUrl 仍为 localhost 网络地址”，微信分享卡片无法使用该地址作为封面

## Verification Conclusion
- 根因已确认：页面预览图正常，微信分享封面图异常
- 修复方向：将分享用图片从网络地址预先转换为本地临时文件路径，再写入 `onShareAppMessage/onShareTimeline`
