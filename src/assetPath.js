/**
 * assetPath —— 把静态资源路径解析成"跟着站点走"的绝对 URL
 *
 * 为什么需要它：
 * 页面里写的 `/lamps/hero.webp` 是**域名根目录**绝对路径。本地起服务器时
 * 站点正好在根目录，看着一切正常；但一旦整个站点被放到某个子目录下
 * （发布平台、预览空间的常见做法，例如 https://host/preview/abc/），
 * 这些路径就会指向 https://host/lamps/hero.webp —— 全部 404。
 * 首屏的 JS/CSS 也是同样的道理，那就会直接白屏。
 *
 * 做法：以**本模块自身所在的打包文件**为锚点。
 * 打包后所有 JS 都在 `<站点路径>/assets/` 下，所以从模块 URL 往上退一级
 * 就一定是站点根目录，跟站点被放在哪一层完全无关：
 *
 *   import.meta.url      http://host/preview/abc/assets/index-xxx.js
 *   new URL('..', ...)   http://host/preview/abc/
 *   asset('/lamps/a.webp')  http://host/preview/abc/lamps/a.webp
 *
 * 三个边界都照顾到了：
 *   · 站点在根目录    → http://host/lamps/a.webp
 *   · 站点在子目录    → http://host/sub/lamps/a.webp
 *   · 子目录没有尾斜杠（/preview/abc 形式）也仍然正确 ——
 *     因为锚点是模块 URL，不是当前文档 URL，不受尾斜杠影响。
 *
 * 懒加载出去的详情页 chunk 同样在 assets/ 下，退一级的结果一致，
 * 所以不区分主包还是分包，全站共用一个 asset()。
 *
 * 补充一个例外：把 JS 内联进 HTML 的单文件构建（离线双击打开用的那种），
 * 模块 URL 就等于文档 URL（…/index.html），再退一级会跑到站点**外面**去，
 * 图片就全丢了。所以这里先判断锚点是不是 HTML 文档：是文档就原地不动。
 */
const MODULE_URL = new URL(import.meta.url)
const SITE_ROOT = /\.html?$/i.test(MODULE_URL.pathname)
  ? new URL('.', MODULE_URL) // 内联进 HTML：站点根 = 文档所在目录
  : new URL('..', MODULE_URL) // 常规打包：模块在 assets/ 下，退一级

export const asset = (p) => new URL(String(p).replace(/^\.?\//, ''), SITE_ROOT).href

export default asset
