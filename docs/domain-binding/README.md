# YHDesign 双域名 · 当前状态

更新：2026-11-14 20:14 · 同一份站点内容，原网站 / 原 `dist/` / git 备份 / 本地现成内容均未覆盖。

## 一、两个域名的用途

| 域名 | 注册商 | 用途 | 当前状态 |
| --- | --- | --- | --- |
| `yhdesign.online` | 腾讯云 | **正式主站**，对外唯一正式地址 | DNS 已解析到新项目；待 EdgeOne 控制台登记自定义域名并签证书 |
| `yhdesign.ink` | 阿里云万网 | 品牌保护 / 短链，301 到主站 | 未配置（阿里云侧无可用凭据） |

## 二、已完成

**代码**（5 个文件，未覆盖任何现有内容）
- `edge-functions/api/guestbook.js`：留言改为代理到云端 REST 的同一张 `guestbook_messages` 表，不再依赖未绑定的 KV；保留 60s 去重、超时、结构化错误。
- `src/data/guestbook.js` / `src/components/Guestbook.jsx`：删除「预览入口未开通」逻辑，主站降为备用入口，失败按后端真实错误提示。
- `index.html`：canonical / og:url 固定 `https://yhdesign.online/`。
- 新构建 `dist-domainready/`，原 `dist/` 未动。

**上线**（20:12）
- 新建 Upload 类型项目 `yhdesign-domainready`（`makers-k5k73bjicdyz`），部署 `site-deploy/`（修复版产物 + 边缘函数）。旧 `yhdesign` 项目是 GitHub Provider，不接受直接上传，故新建而非覆盖。
- 预览链接带 `eo_token`（3 小时时效），仅用于验证，不作长期地址。

**线上实测**（带预览 cookie，20:14）
- 首页 200；`GET /api/guestbook` 返回真实留言（边缘函数已随部署生效）
- `POST /api/guestbook` → `{"ok":true}`，收件箱读回同一条；空内容 → 400 并提示
- 本地验收脚本 `verify-guestbook.mjs` 11 PASS / 0 FAIL；测试数据均已清理，真实留言未动

**DNS**（腾讯云 API，Root 账号 `100055116693`）
- `@`（RecordId `2450552338`）与 `www`（`2450551803`）两条 CNAME，TTL 600 / ENABLE
- 20:13 已改指 `yhdesign-domainready-qsxatwf0.edgeone.cool`；阿里 / 腾讯 DoH 均确认生效

## 三、仍待一步

EdgeOne 控制台「域名管理 → 添加自定义域名」登记 `yhdesign.online` 并申请免费证书。腾讯云公开云 API 没有 Pages 自定义域名接口（`teo` 的加速域名 / DNS 记录接口对 Pages 站点一律 `UnauthorizedOperation`），这一步无 API 路径。

控制台弹窗给出 CNAME 目标值（及 TXT 验证值）后，运行 `finalize-domain.py` 即可自动改准两条记录、补 TXT、读回核对，无需手工加记录。

`yhdesign.ink` 在阿里云，需阿里云侧凭据或控制台操作。

## 四、关键标识

| 项 | 值 |
| --- | --- |
| 原网站（保持 200） | `https://wbapp-fqn8vurenmzjnkpqwdz5i0.app.workbuddy.host/?sharecode=C4MZTHEGVI` |
| 新项目域名 | `yhdesign-domainready-qsxatwf0.edgeone.cool` |
| DNSPod DomainId | `100282505` |
| EdgeOne Pages 站点 | `zone-3xekzmgqphjp`（`Area=overseas`，免备案方向） |
| Git 备份 | `Kakmi-Cloud/yhdesign`（远端 `fc00705` 完整；本地 `ahead 2`，网络恢复后可补推） |

## 五、备案影响

域名实名认证 ≠ ICP 备案；加速区域含中国大陆时绑自定义域名需备案，未备案只能选「全球（不含中国大陆）」。当前 Pages 站点为 `overseas`。内容只维护一份、留言只维护一张表，两个入口共用，备案结论不影响代码与留言闭环。

## 交付文件

- `dns-records.yaml` — 精确 DNS 记录与验证项
- `ACCEPTANCE.md` — 本地 + 线上验收标准与结果
- `verify-guestbook.mjs` — 可复跑的留言端到端验收
- `finalize-domain.py` — 拿到控制台 CNAME 目标值后自动收尾
