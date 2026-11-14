import { createWorkBuddyCloud } from '@tencent-ai/workbuddy-cloud-sdk'
import { publicConfig } from './cloudPublicConfig'

/**
 * 全站只初始化一次云端客户端，所有模块共用。
 * endpoint / publishableKey / oauthRelayBaseUrl 全部取自 publicConfig。
 */
export const cloud = createWorkBuddyCloud({
  endpoint: publicConfig.endpoint,
  oauthRelayBaseUrl: publicConfig.oauthRelayBaseUrl,
  publishableKey: publicConfig.publishableKey,
})
