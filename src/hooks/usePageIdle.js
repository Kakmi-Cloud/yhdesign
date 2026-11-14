/**
 * usePageIdle —— 全站"长时间没人动 / 人不在这窗口上"标记
 *
 * 解决的场景：页面**开着且可见**、但人已经走开或在别的窗口干活。
 * 这时候画面上那些"永远在呼吸"的装饰动画还在每帧算、合成器还在出帧，
 * 风扇就是这么起来的。浏览器只会节流**隐藏**的标签页，可见但无人操作的
 * 标签页它不管 —— 这一段只能由页面自己收。
 *
 * 三条判定，任意一条成立即为 idle：
 *
 *   1. **连续 20s 没有任何输入**（pointer / wheel / key / touch / scroll）。
 *      正常浏览（哪怕只是在看不动手）几乎不会触发；一旦触发，
 *      任何一次输入都会**立刻**恢复，不会有"画面卡住"的感觉。
 *      （原先是 45s。45s 太长了 —— 多数人打开页面看两眼就走开，
 *       那几十秒里风扇该响已经响完了。20s 仍然是"看一段文字也不会被停"的量级。）
 *
 *   2. **窗口失去焦点满 6s**。切到别的窗口去做事，说明人已经不在这页上，
 *      没必要继续为它出帧。留 6s 而不是立即停，是为了快速 alt-tab 时
 *      不至于把动画停了又起（那反而更晃眼）。
 *
 *   3. **标签页被隐藏**（visibilitychange）。这一条浏览器本来也会节流，
 *      这里对齐状态只是为了切回来时不必先起一堆动画再停。
 *
 * 做成单例是因为消费方有好几处（跑马灯停表、无限装饰动画停表、滚动提示停表）。
 * 如果各自挂一组监听 + 各自一个定时器，光是内存里就多出三四倍的事件回调，
 * 反而成了新的负担。这里只挂一组、只维护一个标记、只通知一次状态变化。
 */

// 无人操作多久算 idle（ms）
const IDLE_AFTER = 20000

// 窗口失焦多久算 idle（ms）
const BLUR_AFTER = 6000

const listeners = new Set()
let idle = false
let timer = 0
let bound = false

const notify = () => {
  for (const fn of listeners) fn(idle)
}

// 只在状态真正翻转时通知，避免同一次 wake 把消费方连打好几遍
const setIdle = (v) => {
  if (idle === v) return
  idle = v
  notify()
}

const schedule = (ms = IDLE_AFTER) => {
  clearTimeout(timer)
  timer = setTimeout(() => setIdle(true), ms)
}

const wake = () => {
  setIdle(false)
  schedule()
}

const bind = () => {
  if (bound || typeof window === 'undefined') return
  bound = true

  // 全部 passive：这里只读输入的时间点，不碰默认行为。
  // keydown 用普通监听即可（不 preventDefault，也不参与滚动）。
  for (const ev of ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'scroll']) {
    window.addEventListener(ev, wake, { passive: true })
  }
  window.addEventListener('keydown', wake)

  // 失焦 / 重新聚焦。失焦后计时器换成 BLUR_AFTER，一旦窗口里再有任何
  // 输入（也意味着它被点回来了）就由上面的 wake 重置回 IDLE_AFTER。
  window.addEventListener('blur', () => {
    clearTimeout(timer)
    schedule(BLUR_AFTER)
  })
  window.addEventListener('focus', wake)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timer)
      setIdle(true)
    } else {
      wake()
    }
  })

  // 首屏就挂载时窗口可能本来就没在前台（后台标签被恢复、从别的窗口打开），
  // 那就直接按失焦待遇起步，别先跑 20s 再说。
  if (typeof document.hasFocus === 'function' && !document.hasFocus()) {
    schedule(BLUR_AFTER)
  } else {
    schedule()
  }
}

/**
 * 订阅 idle 标记。回调会**立刻**以当前值调用一次，之后只在状态翻转时通知。
 * 返回退订函数。
 */
export const subscribeIdle = (fn) => {
  bind()
  listeners.add(fn)
  fn(idle)
  return () => {
    listeners.delete(fn)
  }
}

export const isPageIdle = () => idle
