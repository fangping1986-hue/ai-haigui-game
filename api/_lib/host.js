const HOST_ANSWERS = ['是', '否', '无关']
const DEFAULT_CHAT_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'

const SYSTEM_PROMPT = `你是海龟汤游戏的「主持人」。玩家会针对「汤面」提问，你掌握「汤底」真相。

【输出规则 — 必须严格遵守】
1. 你只能输出三个汉字之一：是、否、无关。不要输出其它任何字符（不要标点、不要空格、不要换行、不要解释）。
2. 「是」：玩家陈述与汤底一致或为真。
3. 「否」：玩家陈述与汤底矛盾或为假。
4. 「无关」：无法根据汤底判断该陈述真假，或与核心真相无关。
5. 严格依据给定汤底判断，不要编造汤底没有的信息。`

function parseHostAnswer(raw) {
  if (typeof raw !== 'string') return null
  let s = raw.trim()
  if (!s) return null

  s = s.split(/\r?\n/)[0]?.trim() ?? ''
  s = s.replace(/^[\"'`「『\s]+|[\"'`」』\s]+$/g, '')
  s = s.replace(/[。．.!！?？]+$/g, '').trim()

  const prefix = s.match(/^(?:回答|答|结论|输出)[:：]\s*(.+)$/)
  if (prefix) s = prefix[1].trim()
  return HOST_ANSWERS.includes(s) ? s : null
}

function getApiKey() {
  const key =
    process.env.AI_API_KEY?.trim() ||
    process.env.VITE_AI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim()

  if (!key) {
    throw new Error('未配置 AI API Key：请在 Vercel 环境变量中设置 AI_API_KEY。')
  }
  return key
}

function getApiBaseUrl() {
  return process.env.AI_API_BASE_URL?.trim() || process.env.VITE_AI_API_BASE_URL?.trim() || DEFAULT_CHAT_URL
}

function getModel() {
  return process.env.AI_MODEL?.trim() || process.env.VITE_AI_MODEL?.trim() || DEFAULT_MODEL
}

function buildUserContent(question, story) {
  return `【本题 — 请仅对最后一问作答】
汤面：${story.surface}
汤底：${story.bottom}

玩家问：${String(question).trim()}

请只输出三个汉字之一：是、否、无关（除此之外不要任何字符）。`
}

export async function askHostAI(question, story) {
  const apiKey = getApiKey()
  const url = getApiBaseUrl()
  const model = getModel()

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserContent(question, story) },
    ],
    temperature: 0.05,
    max_tokens: 8,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`AI 接口返回非 JSON（HTTP ${res.status} ${res.statusText}）`)
  }

  if (!res.ok) {
    const apiMsg = data?.error?.message?.trim()
    throw new Error(apiMsg ? `AI 接口错误（${res.status}）：${apiMsg}` : `AI 接口错误：HTTP ${res.status} ${res.statusText}`)
  }

  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('AI 返回内容为空，请稍后重试。')

  const normalized = parseHostAnswer(text)
  if (!normalized) throw new Error('AI 返回内容不符合「是/否/无关」规范。')
  return normalized
}

export function readJsonBody(req) {
  if (!req || req.body == null) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}
