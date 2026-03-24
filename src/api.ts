import type { TStory } from './types/game'

/** 与 TStory 一致，供 askAI 使用 */
export type Story = TStory

/** 主持人允许的唯一输出（与 TECH_DESIGN 一致） */
export const HOST_ANSWERS = ['是', '否', '无关'] as const
export type THostAnswer = (typeof HOST_ANSWERS)[number]

/** 后端返回不符合规范三字之一时抛出，供界面提示用户换种问法 */
export class InvalidHostAnswerError extends Error {
  readonly rawContent: string

  constructor(rawContent: string) {
    super('HOST_ANSWER_INVALID')
    this.name = 'InvalidHostAnswerError'
    this.rawContent = rawContent
  }
}

/**
 * 从原文中解析主持人回答；仅当能确定为「是」「否」「无关」之一时返回。
 * 允许首尾空白、成对引号、行首「回答：」类前缀、句末句号。
 */
export function parseHostAnswer(raw: string): THostAnswer | null {
  let s = raw.trim()
  if (!s) return null

  // 只取首行，避免服务端返回额外解释
  s = s.split(/\r?\n/)[0]?.trim() ?? ''

  s = s.replace(/^["'`「『\s]+|["'`」』\s]+$/g, '')
  s = s.replace(/[。．.!！?？]+$/g, '').trim()

  const prefix = s.match(/^(?:回答|答|结论|输出)[:：]\s*(.+)$/)
  if (prefix) s = prefix[1].trim()

  if (s === '是' || s === '否' || s === '无关') return s
  return null
}

type TBackendAskResponse = {
  ok: boolean
  answer?: string
  message?: string
}

type TBackendRevealResponse = {
  ok: boolean
  bottom?: string
  message?: string
}

function getBackendBaseUrl() {
  // 使用相对地址，交由 Vite 的 devServer proxy 转发到后端
  return ''
}

async function postJson<TResponse>(
  url: string,
  body: unknown,
): Promise<TResponse> {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    throw new Error(`网络请求失败，无法连接后端：${message}`)
  }

  let data: TResponse
  try {
    data = (await res.json()) as TResponse
  } catch {
    throw new Error(`后端返回非 JSON（HTTP ${res.status} ${res.statusText}）`)
  }

  return data
}

/**
 * 向主持人提问：返回「是」「否」「无关」之一。
 * 要求签名保持：askAI(question: string, story: Story): Promise<string>
 */
export async function askAI(question: string, story: Story): Promise<string> {
  const backendBaseUrl = getBackendBaseUrl()
  const url = `${backendBaseUrl}/api/chat`

  const data = await postJson<TBackendAskResponse>(url, {
    question,
    story,
  })

  if (!data.ok) {
    throw new Error(data.message || '后端处理失败，请稍后重试。')
  }

  const answerRaw = data.answer
  if (!answerRaw || typeof answerRaw !== 'string') {
    throw new Error('后端返回内容为空，请稍后重试。')
  }

  const normalized = parseHostAnswer(answerRaw)
  if (!normalized) {
    throw new InvalidHostAnswerError(answerRaw)
  }

  return normalized
}

/**
 * 汤底揭秘（可选，供 Result 页面后续联调使用）
 */
export async function revealBottom(story: Story): Promise<string> {
  const backendBaseUrl = getBackendBaseUrl()
  const url = `${backendBaseUrl}/api/chat/reveal`

  const data = await postJson<TBackendRevealResponse>(url, {
    storyId: story.id,
  })

  if (!data.ok) {
    throw new Error(data.message || '后端揭晓失败，请稍后重试。')
  }

  const bottom = data.bottom
  if (!bottom || typeof bottom !== 'string') {
    throw new Error('后端返回汤底为空，请稍后重试。')
  }

  return bottom
}
