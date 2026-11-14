import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/**
 * 自包含构建（single-file）。
 *
 * 为什么需要它：常规 ESM 构建会把 JS/CSS 输出成外部文件，浏览器用
 * `type="module"` 加载。而 `file://` 协议下，外部 module 脚本和外部
 * 样式表都会被 CORS 规则拦掉（origin 是 null），控制台报
 * `Access to script at 'file:///...' has been blocked`，
 * 结果就是双击 index.html → 白屏。
 *
 * 这个配置把整站 JS 合并成一块并内联进 HTML（内联脚本不触发 CORS 抓取），
 * CSS 同样内联进 <style>。图片仍然是相对路径的外部文件 —— 图片的显示
 * 不受 CORS 限制，所以 file:// 下正常。最终产物只有「一个 HTML + 图片」，
 * 双击即开，也能直接丢到任意静态托管上。
 */
function inlineSingleFile() {
  return {
    name: 'inline-single-file',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist-standalone')
      const htmlPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(htmlPath)) return

      let html = fs.readFileSync(htmlPath, 'utf8')
      const assetsDir = path.join(outDir, 'assets')
      const drop = []

      // 1) 去掉 modulepreload：单块产物没有需要预载的兄弟 chunk
      html = html.replace(/\s*<link[^>]*rel="modulepreload"[^>]*>/g, '')

      // 2) 外部 module 脚本 → 内联脚本
      html = html.replace(
        /<script[^>]*type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g,
        (_m, rel) => {
          const p = path.join(outDir, ...rel.split('/'))
          const code = fs
            .readFileSync(p, 'utf8')
            // 代码里若出现字面量 </script 会提前闭合标签，必须转义
            .replace(/<\/script/gi, '<\\/script')
          drop.push(p)
          return `<script type="module">\n${code}\n</script>`
        }
      )

      // 3) 外部样式表 → 内联 <style>
      html = html.replace(
        /<link[^>]*rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g,
        (_m, rel) => {
          const p = path.join(outDir, ...rel.split('/'))
          if (!fs.existsSync(p)) return ''
          const css = fs.readFileSync(p, 'utf8').replace(/<\/style/gi, '<\\/style')
          drop.push(p)
          return `<style>\n${css}\n</style>`
        }
      )

      fs.writeFileSync(htmlPath, html)
      for (const p of drop) if (fs.existsSync(p)) fs.unlinkSync(p)

      const kb = (fs.statSync(htmlPath).size / 1024).toFixed(1)
      const left = fs.existsSync(assetsDir)
        ? fs.readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f))
        : []
      console.log(`\n[inline-single-file] index.html = ${kb} kB`)
      console.log(`[inline-single-file] 清理外部 js/css: ${drop.length} 个`)
      console.log(
        `[inline-single-file] 残留 js/css: ${left.length ? left.join(', ') : '无（file:// 可直接打开）'}`
      )
    },
  }
}

export default defineConfig({
  // 相对路径：产物放在任意目录/子目录都能正确解析资源
  base: './',
  plugins: [react(), tailwindcss(), inlineSingleFile()],
  build: {
    outDir: 'dist-standalone',
    emptyOutDir: true,
    // 单文件形态不需要 modulepreload 提示
    modulePreload: false,
    // CSS 合并成一份，便于整体内联
    cssCodeSplit: false,
    // 内联脚本用的是 module 语义，目标对齐即可
    target: 'es2020',
    rollupOptions: {
      output: {
        // 关键：把动态 import 也合并进唯一入口块。
        // 本项目详情页是 React.lazy 懒加载，若拆成多个 chunk，
        // file:// 下这些 chunk 依然会被 CORS 拦掉。
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
