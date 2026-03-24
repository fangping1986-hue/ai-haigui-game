import { readJsonBody } from '../_lib/host.js'
import { STORIES } from '../_lib/stories.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  try {
    const { storyId } = readJsonBody(req)
    if (!storyId || typeof storyId !== 'string') {
      return res.status(400).json({ ok: false, message: '缺少或无效的 storyId' })
    }

    const story = STORIES.find((s) => s.id === storyId)
    if (!story) {
      return res.status(404).json({ ok: false, message: 'story 不存在' })
    }

    return res.status(200).json({ ok: true, bottom: story.bottom })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message })
  }
}
