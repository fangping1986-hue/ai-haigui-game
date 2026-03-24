const path = require('path')
const { randomUUID } = require('crypto')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { STORIES } = require('./stories')

// 让后端读取项目根目录的 `.env.local`（包含 API Key），避免把密钥写死在代码中。
const rootEnvPath = path.resolve(__dirname, '..', '.env.local')
const envResult = dotenv.config({ path: rootEnvPath })
if (envResult.error) {
  // fallback：如果根目录没有 .env.local，则退回读取后端目录的 .env
  dotenv.config()
}

const app = express()

// 允许前端访问
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)

app.use(express.json())

app.get('/api/test', (req, res) => {
  console.log('[API TEST] hit')
  res.json({ ok: true, message: 'backend is running' })
})

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true })
})

// AI 对话接口
// POST /api/chat
// body: { question: string, story: { surface: string, bottom: string, ... } }
app.post('/api/chat', async (req, res) => {
  const requestId = randomUUID()
  try {
    const { question, story } = req.body || {}

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 question' })
    }

    if (!story || typeof story !== 'object') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 story' })
    }

    const surface = story.surface
    const bottom = story.bottom
    if (typeof surface !== 'string' || typeof bottom !== 'string') {
      return res.status(400).json({
        ok: false,
        message: 'story 缺少 surface/bottom（均需为字符串）',
      })
    }

    // 只打印用户提问与故事 id/surface，避免把汤底泄露到日志
    console.log('[CHAT IN]', {
      requestId,
      question,
      storyId: story.id,
      surface,
    })

    const answer = await askHostAI(question, story, requestId)
    console.log('[CHAT OUT]', { requestId, answer })
    return res.json({ ok: true, answer })
  } catch (e) {
    console.error('[CHAT ERROR]', {
      message: e instanceof Error ? e.message : String(e),
    })
    const message = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message })
  }
})

const HOST_ANSWERS = ['是', '否', '无关']

function parseHostAnswer(raw) {
  if (typeof raw !== 'string') return null
  let s = raw.trim()
  if (!s) return null

  // 只取首行，避免模型输出额外解释
  s = s.split(/\r?\n/)[0]?.trim() ?? ''

  // 去掉可能的引号、句末标点
  s = s.replace(/^[\"'`「『\s]+|[\"'`」』\s]+$/g, '')
  s = s.replace(/[。．.!！?？]+$/g, '').trim()

  const prefix = s.match(/^(?:回答|答|结论|输出)[:：]\s*(.+)$/)
  if (prefix) s = prefix[1].trim()

  if (HOST_ANSWERS.includes(s)) return s
  return null
}

const DEFAULT_CHAT_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'

function getApiKey() {
  const key =
    process.env.AI_API_KEY?.trim() ||
    process.env.VITE_AI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim()

  if (!key) {
    throw new Error(
      '未配置 AI API Key：请在环境变量中设置 AI_API_KEY（或 VITE_AI_API_KEY / DEEPSEEK_API_KEY）。',
    )
  }
  return key
}

function getApiBaseUrl() {
  return (
    process.env.AI_API_BASE_URL?.trim() ||
    process.env.VITE_AI_API_BASE_URL?.trim() ||
    DEFAULT_CHAT_URL
  )
}

function getModel() {
  return (
    process.env.AI_MODEL?.trim() ||
    process.env.VITE_AI_MODEL?.trim() ||
    DEFAULT_MODEL
  )
}

const SYSTEM_PROMPT = `你是海龟汤游戏的「主持人」。玩家会针对「汤面」提问，你掌握「汤底」真相。

【输出规则 — 必须严格遵守】
1. 你只能输出三个汉字之一：是、否、无关。不要输出其它任何字符（不要标点、不要空格、不要换行、不要解释）。
2. 「是」：玩家陈述与汤底一致或为真。
3. 「否」：玩家陈述与汤底矛盾或为假。
4. 「无关」：无法根据汤底判断该陈述真假，或与核心真相无关。
5. 严格依据给定汤底判断，不要编造汤底没有的信息。

【格式示例 — 以下为虚构题目，仅演示三字回答格式】
汤面：一人醒来发现自己在陌生房间。汤底：他被绑架后蒙眼带到此房间，绑匪已离开。
问：他是自愿来这个房间的吗？ → 否
问：他眼睛被蒙过吗？ → 是
问：房间里有窗户吗？ → 无关

再示例一组：
汤面：葬礼上姐姐杀了妹妹。汤底：姐姐以为吊灯广告里的人是妹妹男友，想再办葬礼见他。
问：姐姐故意杀妹妹吗？ → 是
问：妹妹有双胞胎吗？ → 无关
问：吊灯是红色的吗？ → 无关`

function buildUserContent(question, story) {
  return `【本题 — 请仅对最后一问作答】
汤面：${story.surface}
汤底：${story.bottom}

玩家问：${String(question).trim()}

请只输出三个汉字之一：是、否、无关（除此之外不要任何字符）。`
}

async function askHostAI(question, story, requestId) {
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

  let res
  try {
    console.log('[AI REQUEST]', { requestId, url, model })
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[AI NETWORK ERROR]', { requestId, message })
    throw new Error(`网络请求失败，无法连接 AI 服务：${message}`)
  }

  let data
  try {
    data = await res.json()
  } catch {
    console.error('[AI JSON PARSE ERROR]', {
      requestId,
      status: res.status,
      statusText: res.statusText,
    })
    throw new Error(`AI 接口返回非 JSON（HTTP ${res.status} ${res.statusText}）`)
  }

  if (!res.ok) {
    const apiMsg = data?.error?.message?.trim()
    console.error('[AI HTTP ERROR]', { requestId, status: res.status, apiMsg })
    throw new Error(
      apiMsg ? `AI 接口错误（${res.status}）：${apiMsg}` : `AI 接口错误：HTTP ${res.status} ${res.statusText}`,
    )
  }

  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) {
    console.error('[AI EMPTY CONTENT]', { requestId })
    throw new Error('AI 返回内容为空，请稍后重试。')
  }

  console.log('[AI RAW]', { requestId, raw: text })
  const normalized = parseHostAnswer(text)
  if (!normalized) {
    const err = new Error('AI 返回内容不符合「是/否/无关」规范。')
    err.code = 'INVALID_HOST_ANSWER'
    err.raw = text
    console.error('[AI INVALID ANSWER]', { requestId, raw: text })
    throw err
  }

  return normalized
}

// 提问判定接口
// POST /api/chat/ask
// body: { question: string, storyId: string }
app.post('/api/chat/ask', async (req, res) => {
  const requestId = randomUUID()
  try {
    const { question, storyId } = req.body || {}
    if (!storyId || typeof storyId !== 'string') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 storyId' })
    }
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 question' })
    }

    const story = STORIES.find((s) => s.id === storyId)
    if (!story) {
      return res.status(404).json({ ok: false, message: 'story 不存在' })
    }

    console.log('[CHAT ASK IN]', {
      requestId,
      question,
      storyId,
      surface: story.surface,
    })

    const answer = await askHostAI(question, story, requestId)
    console.log('[CHAT ASK OUT]', { requestId, answer })
    return res.json({ ok: true, answer })
  } catch (e) {
    console.error('[CHAT ASK ERROR]', {
      requestId: req.body && req.body.storyId,
      message: e instanceof Error ? e.message : String(e),
    })
    const message = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message })
  }
})

// 汤底揭秘接口
// POST /api/chat/reveal
// body: { storyId: string }
app.post('/api/chat/reveal', async (req, res) => {
  const requestId = randomUUID()
  try {
    const { storyId } = req.body || {}
    if (!storyId || typeof storyId !== 'string') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 storyId' })
    }

    const story = STORIES.find((s) => s.id === storyId)
    if (!story) {
      return res.status(404).json({ ok: false, message: 'story 不存在' })
    }

    console.log('[REVEAL]', { requestId, storyId, surface: story.surface })
    return res.json({ ok: true, bottom: story.bottom })
  } catch (e) {
    console.error('[REVEAL ERROR]', { requestId, message: e instanceof Error ? e.message : String(e) })
    const message = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message })
  }
})

// 兜底：未匹配路由
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Not Found' })
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`)
})

