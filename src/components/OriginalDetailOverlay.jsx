import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft } from 'lucide-react'
import { asset } from '../assetPath'
import './originalDetail.css'

/**
 * OriginalDetailOverlay —— 手机端卡脚圆箭头的落点
 *
 * 装的是什么：
 *   入口页（概念播放器）每张卡卡脚右上角有一枚 29px 圆箭头，它是**去原稿项目
 *   详情页的唯一入口**（点卡本体不跳转）。落点是**原稿自己的项目详情页** ——
 *   就是 http://localhost:5185/#home 那套朴素页面里的 project/<id>，有封面、
 *   项目概述、为谁而设计、设计理念、使用与交互、材质与工艺和图集。它不是 React
 *   组件，所以这里用 iframe 整体承载：原稿做成了完全自包含的单文件（207 张图
 *   全部内嵌），复制进 public/ 就能离线跑，不需要任何外部资源路径。
 *
 * 为什么是全屏浮层 + 一条 hash 深链：
 *   原稿本来就有完备的 hash 路由（home / projects / resume / project/<id>），
 *   直接把 src 写成 `yh-original.html#project/<id>`，它自己就落在那一页上，
 *   不需要我们去模拟它的内部状态。深链在初次加载时就带上，所以 iframe 只产生
 *   一次文档加载，不会在联合历史里多占记录。
 *
 * 为什么"退得回去"这件事要单独设计：
 *   之前的表现是"跳转之后直接就到某个界面，根本退不回去"。根因是退出路径挂在
 *   浏览器历史上（浮层没在历史栈里占位，返回键被当成离开站点；或者占位了却
 *   回收到别的记录上）。这里的做法是把**可见的退出按钮**做成唯一主路径：
 *   onClose 只改 React 状态，不读也不写历史，所以它永远有效；Escape 与
 *   App 里的 popstate（返回键 / 侧滑）是同一条 onClose 的两个别名；
 *   App 那边再顺手把自己压的那条历史记录回收掉（best-effort，失败也不影响
 *   退出）。用 iframe 承载还顺带解决了原稿内部导航：它在自己窗口里怎么跳都不
 *   会影响外层 —— 而 iframe 卸载时，它内部 pushState 出来的记录会一并消失，
 *   外层那次 history.back() 才会准确落回我们自己压的那一条。
 */
export default function OriginalDetailOverlay({ project, onClose }) {
  const [ready, setReady] = useState(false)
  const frameRef = useRef(null)
  // 用 ref 拿最新的 onClose：兜底定时器与 iframe 的 onLoad 都是"一次性注册"的，
  // 不该因为父组件重渲染就重新绑定，也不能让它们闭包住过期的回调。
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // 原稿自己解析 hash 落在这一页；id 一律来自 projects 数据，不做二次映射。
  const src = `${asset('/yh-original.html')}#project/${project?.id ?? '01'}`

  // Escape 关闭。焦点在 iframe 里时按键不会冒泡到父页 —— 那种情况交给下面那颗
  // 返回按钮，它才是主路径。
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 兜底：不管加载成没成功，遮罩最多挂 7s。
  // 单文件里 200 多张图要解析，慢的时候确实会久；但"慢"绝不能变成"出不去"，
  // 所以到点无条件揭掉遮罩，把界面交还给用户。
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 7000)
    return () => window.clearTimeout(t)
  }, [])

  // 原稿里还挂着一个 #original 子路由（内嵌 iframe），它读的是父窗口的
  // __YH_ASSETS__。父窗口不是原稿本体时那个变量不存在，图会全丢。
  // 这里把本层 iframe 自带的资源表递过去，让那条子路由也能正常显示。
  const handleLoad = () => {
    setReady(true)
    try {
      const win = frameRef.current?.contentWindow
      if (win && !win.__YH_ASSETS__ && win.YH_ASSETS) win.__YH_ASSETS__ = win.YH_ASSETS
    } catch {
      /* 非同源等异常一律吞掉：不影响详情页本身 */
    }
  }

  return createPortal(
    <div className="yho-root" role="dialog" aria-modal="true" aria-label={`${project?.title ?? ''} 完整项目`}>
      <iframe
        ref={frameRef}
        className="yho-frame"
        src={src}
        title={`${project?.title ?? ''} 原稿项目详情`}
        onLoad={handleLoad}
        onError={() => setReady(true)}
      />

      <div className="yho-veil" data-hidden={ready ? 'true' : 'false'} role="status" aria-live="polite">
        <div className="yho-veil-inner">
          <span className="yho-mark" aria-hidden="true" />
          <p className="yho-kicker">Original Detail</p>
          <p className="yho-title">{project?.title ?? ''}</p>
          <span className="yho-bar" aria-hidden="true" />
          <p className="yho-note">正在打开项目详情 · 图集较多，首次加载稍等</p>
        </div>
      </div>

      <button type="button" className="yho-back" onClick={() => closeRef.current()}>
        <ArrowLeft className="yho-back-ico" strokeWidth={2.4} aria-hidden="true" />
        返回入口页
      </button>
    </div>,
    document.body,
  )
}
