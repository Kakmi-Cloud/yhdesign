# 验收标准（两个目标）

## 一、定位到的冲突与缺失

| # | 位置 | 问题 | 处理 |
| --- | --- | --- | --- |
| 1 | `edge-functions/api/guestbook.js` | 只认未绑定的 `guestbook_kv`，任何非主站域名一律 503，提交/保存/展示全断 | 改为代理到云端 REST 的同一张 `guestbook_messages` 表 |
| 2 | `src/data/guestbook.js` | 503 分支写死「这个预览入口的留言服务还没开通」，把正式域名访客赶去主站 | 改为按后端返回的真实错误提示，主站仅作备用入口 |
| 3 | `src/components/Guestbook.jsx` | 「海外预览入口，留言服务可能未开通」提示条常驻，与自定义域名正式入口矛盾 | 移除提示条与 `isPreviewHost`；失败时才给明确提示 + 备用入口 |
| 4 | `index.html` | 注释标注「部署域名确定后回填」，canonical / og:url 一直缺失，多域名会算重复内容 | 固定指向 `https://yhdesign.online/` |
| 5 | 存储分裂风险 | KV 与云端是两套数据，收件箱会看不到另一入口的留言 | 统一为一张表，任何入口提交、任何入口可读 |

## 二、本地已核对（11 PASS / 0 FAIL）

运行 `node domain-binding/verify-guestbook.mjs`，以真实云端 REST 驱动边缘函数：

- GET 收件箱可读；空内容 400 且带提示
- POST 提交 200 → 收件箱读回同一条（提交→保存→展示闭环）
- 60 秒内重复内容 409；上游 502 时提交与读取都返回明确失败文案
- 新产物含 canonical；已无 `KV_NOT_BOUND` 与「预览入口未开通」残留；原 `dist/` 未被覆盖

测试数据已清理，原有真实留言未改动。

## 二·补 线上已核对（20:14，真实 EdgeOne 环境）

- 新项目 `yhdesign-domainready` 部署成功，带预览 cookie 打开首页 → 200
- `GET /api/guestbook` → 返回真实留言列表，证明边缘函数已随部署生效
- `POST /api/guestbook` → `{"ok":true}`，随后收件箱读回同一条；空内容 → 400「留言内容不能为空」
- 测试数据已清理，原有真实留言未改动

## 三、部署后可核对的验收标准

**目标 A · 自定义域名稳定指向并正常访问**

1. `https://yhdesign.online/` 与 `https://www.yhdesign.online/` → 200，标题 `YHDesign — 杨鸿 · 产品设计师作品集`
2. 静态资源 0 个 404；`#p=01` … `#p=08` 八个深链逐个可开
3. `<link rel="canonical">` 与 `og:url` 均为 `https://yhdesign.online/`
4. `https://yhdesign.ink/` → 301 到 `https://yhdesign.online/`
5. 原站 `wbapp-fqn8vurenmzjnkpqwdz5i0.app.workbuddy.host` 仍 200，内容不变

**目标 B · 留言板闭环**

6. 在 `yhdesign.online` 提交一条 → 显示「已送达」，表单清空；按钮不卡在「发送中…」
7. 在主站与自定义域名各自打开 `?inbox=1` → 都能读到刚提交的那条（同一张表，最新在最上）
8. 空内容 → 提示「留言内容不能为空」；60 秒内重复内容 → 提示「这条留言已经提交过了」
9. 上游不可用时 → 显示「留言服务暂时不可用 / 留言没有被保存」+ 可点的备用入口，不静默失败、不误报成功

## 四、限制的影响点与处理方式

- **影响点**：备案未完成时，自定义域名只能选「全球（不含中国大陆）」加速区域，大陆访客访问可能受限；这只影响地域可达性，不影响域名解析、页面内容或留言数据链路。账号下 Pages 站点实测为 `Area=overseas`，已在该方向。
- **DNS 侧已达成（19:48）**：`@` 与 `www` 的 CNAME 已由腾讯云 API 写入并全球生效；「目标 A」剩下的核对项是 EdgeOne 平台侧登记自定义域名 + 免费证书。公开云 API 不支持 Pages 自定义域名，故该步在控制台完成。
- **处理方式**：内容只维护一份 `dist-domainready/`，留言只维护一张 `guestbook_messages` 表；自定义域名作为全球正式入口，WorkBuddy 主站作为大陆直连入口，两者同一内容、同一数据。两个目标都不依赖备案结论即可验证；DNS CNAME 与加速区域为控制台动作，代码侧已全部就绪。
