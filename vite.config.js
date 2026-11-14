import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // 关键：用相对路径引用打包产物。
  // 默认值是 '/'，生成的 index.html 会写死 <script src="/assets/index-xxx.js">，
  // 一旦站点被放到子目录（发布平台/预览空间的常见做法），这些请求全部 404，
  // 页面就是一片空白。改成 './' 后由浏览器按当前文档位置解析，
  // 根目录、任意子目录都能跑。
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // 两个入口：桌面主站 index.html + 手机端独立入口 mobile.html。
      // 手机端不经过 App.jsx 的 isMobile 分支，自带一套极简状态机，
      // 产物是独立的 dist/mobile.html，可与主站分开部署。
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        mobile: fileURLToPath(new URL('./mobile.html', import.meta.url)),
      },
      output: {
        // 把"几百年不会改"的依赖单独切块。三个好处：
        //   1. 首屏请求可以并行下载，不用等一个大文件下完才开始解析；
        //   2. 改业务代码后发布，用户浏览器里 react / framer 那几块
        //      的 hash 不变，直接从缓存拿，只有主包要重下；
        //   3. 让主包只剩本页自己的代码，出问题时一眼看得出体积是哪来的。
        // lucide-react 单独放一块，是因为它只贡献图标（被打包器 tree-shake
        // 之后剩十几个），和 React 的更新节奏完全无关。
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // 默认就是 500kB 才警告；这里压低到 300kB，主包一旦重新变胖立刻能看见。
    chunkSizeWarningLimit: 300,
  },
})
