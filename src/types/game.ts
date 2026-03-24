export type TStoryDifficulty = 'easy' | 'medium' | 'hard'

export type TStory = {
  id: string
  title: string
  difficulty: TStoryDifficulty
  surface: string
  bottom: string
}

export type TMessageRole = 'user' | 'assistant'

export type TMessage = {
  id: string
  role: TMessageRole
  content: string
  timestamp: number
  /** 用于区分失败提示等展示样式 */
  variant?: 'error'
}

/** 从 Game 页跳转至结果页时通过 router state 传递 */
export type TResultLocationState = {
  messages?: TMessage[]
}
