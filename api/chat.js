import { askHostAI, readJsonBody } from './_lib/host.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  try {
    const { question, story } = readJsonBody(req)
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 question' })
    }
    if (!story || typeof story !== 'object') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 story' })
    }
    if (typeof story.surface !== 'string' || typeof story.bottom !== 'string') {
      return res.status(400).json({ ok: false, message: 'story 缺少 surface/bottom（均需为字符串）' })
    }

    const answer = await askHostAI(question, story)
    return res.status(200).json({ ok: true, answer })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message })
  }
}
