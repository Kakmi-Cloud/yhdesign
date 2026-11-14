/**
 * 云服务公开配置 —— 由 workbuddy_cloud_service 的 activate 结果写入（2026-11-14）。
 *
 * 这四个值都是「可以放进前端」的公开信息：publishableKey 只标识应用、本身不带权限，
 * 服务端会按请求的 Origin 做精确校验。任何长期密钥 / 管理员凭据都不属于这里，
 * 也绝不能写进这个文件。
 *
 * 注意：endpoint 必须来自这份 publicConfig，不能改成写死的域名、不能从
 * window.location 或环境变量推导 —— 否则发布后 Origin 校验会失败。
 */
export const publicConfig = {
  resourceId: 'wbcs_BK978YxQfIKvM8b4zZ0Eyi',
  endpoint: 'https://wbapp-fqn8vurenmzjnkpqwdz5i0.app.workbuddy.host',
  oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
  publishableKey: 'wbpk_fQN8VuRENMzJnKPqWdZ5I0_y6gTz6GDbfq4RBSr7kGcr36hHVZtIN2R',
}
