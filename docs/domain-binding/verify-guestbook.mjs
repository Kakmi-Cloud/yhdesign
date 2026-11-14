/**
 * 验收脚本：留言板「提交 / 保存 / 展示 / 失败反馈」+ 构建产物。
 * 运行：node domain-binding/verify-guestbook.mjs
 *
 * 直接以边缘函数的真实入口（onRequestGet / onRequestPost）驱动，
 * 使用真实云端 REST，因此「提交→保存→收件箱读回」是端到端验证，不是 mock。
 * 会写入 1 条带 visitor_name=domain-ready-verify 的测试留言，运行后需清理。
 */
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const ROOT = 'C:/Users/ASUS/WorkBuddy/2026-11-11-23-57-20/portfolio-mobile-handoff/portfolio-upgrade'
const EDGE = `${ROOT}/edge-functions/api/guestbook.js`
const NEW_DIST = `${ROOT}/dist-domainready`
const OLD_DIST = `${ROOT}/dist`
const HOST = 'https://yhdesign.online'

const mod = await import(pathToFileURL(EDGE).href)
let pass = 0
let fail = 0
const check = (label, ok, detail = '') => {
  if (ok) pass += 1
  else fail += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ·  ${detail}` : ''}`)
}

const call = async (fn, url, init) => {
  const res = await fn({ request: new Request(url, init) })
  return { status: res.status, body: await res.json() }
}
const post = (message) =>
  call(mod.onRequestPost, `${HOST}/api/guestbook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'domain-ready-verify', contact: '', message }),
  })
const get = (limit = 20) => call(mod.onRequestGet, `${HOST}/api/guestbook?limit=${limit}`)

// 1 读取可达
let r = await get(5)
check('GET 收件箱可读', r.status === 200 && r.body.ok === true && Array.isArray(r.body.messages),
  `返回 ${r.body.messages?.length ?? 0} 条`)

// 2 参数校验
r = await post('   ')
check('空内容被拒绝且给出提示', r.status === 400 && r.body.ok === false && !!r.body.error, r.body.error)

// 3 提交
const marker = `__DOMAIN_READY_${Date.now()}__`
r = await post(marker)
check('POST 提交成功（写入同一张云端表）', r.status === 200 && r.body.ok === true, JSON.stringify(r.body))

// 4 展示：提交后能读回
r = await get(20)
check('收件箱读回刚提交的那条',
  r.body.ok === true && Array.isArray(r.body.messages) &&
  r.body.messages.some((m) => m.message === marker && m.visitor_name === 'domain-ready-verify'))

// 5 防重复
r = await post(marker)
check('60s 内重复内容被拒绝', r.status === 409 && r.body.ok === false, r.body.error)

// 6/7 上游故障时的失败反馈
const realFetch = globalThis.fetch
globalThis.fetch = async () => new Response('upstream down', { status: 502 })
try {
  r = await post('__UPSTREAM_FAIL_PROBE__')
  check('上游故障时提交返回明确失败', r.status === 502 && r.body.ok === false && !!r.body.error, r.body.error)
  r = await get(5)
  check('上游故障时读取返回明确失败',
    r.status === 502 && r.body.ok === false && Array.isArray(r.body.messages), r.body.error)
} finally {
  globalThis.fetch = realFetch
}

// 8-11 构建产物与「不覆盖」核对
const html = fs.readFileSync(`${NEW_DIST}/index.html`, 'utf8')
check('新产物 canonical 指向正式域名', html.includes('<link rel="canonical" href="https://yhdesign.online/" />'))
const jsAll = fs.readdirSync(`${NEW_DIST}/assets`)
  .filter((f) => f.endsWith('.js'))
  .map((f) => fs.readFileSync(`${NEW_DIST}/assets/${f}`, 'utf8'))
  .join('\n')
check('新产物已清除 KV_NOT_BOUND 死路径', !jsAll.includes('KV_NOT_BOUND'))
check('新产物已清除「预览入口未开通」提示',
  !jsAll.includes('这是海外预览入口') && !jsAll.includes('这个预览入口'))
check('原 dist 未被覆盖', !fs.readFileSync(`${OLD_DIST}/index.html`, 'utf8').includes('rel="canonical"'))

console.log(`\n结果：${pass} PASS / ${fail} FAIL`)
console.log(`测试留言：visitor_name=domain-ready-verify, message=${marker}`)
process.exit(fail ? 1 : 0)
