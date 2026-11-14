# YHDesign — 杨鸿 · 产品设计师作品集

React 18 + Vite 5 构建的产品设计师作品集，部署于 [EdgeOne Pages](https://console.cloud.tencent.com/edgeone/pages)。

## 项目结构

| 目录 / 文件 | 说明 |
| --- | --- |
| `src/` | 前端源码（长页 + 8 个项目详情页 + 手机端卡片首访层） |
| `public/` | 图片等静态资源（页面里用 `/xxx.webp` 绝对路径引用） |
| `edge-functions/api/guestbook.js` | 访客留言边缘函数（KV 存储） |
| `index.html` | 入口 HTML（字体、站点标题 YHDesign） |
| `vite.config.js` | 构建配置（含拆包规则） |

`node_modules/` 不入库，首次运行前 `npm install`。

## 本地开发与预览

```bash
npm install
npm run dev      # 开发热更新
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建产物
```

## 部署

```bash
# EdgeOne CLI（需 API Token）
edgeone makers deploy -n yhdesign -t <TOKEN>
```

留言墙依赖 EdgeOne KV 存储：控制台「KV 存储」创建命名空间并绑定到项目，
**变量名必须是 `guestbook_kv`**。

## 作者

杨鸿 · [Kakmi-Cloud](https://github.com/Kakmi-Cloud)
