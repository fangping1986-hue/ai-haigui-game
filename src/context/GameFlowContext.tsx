import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

/** 大厅空闲 / 对局进行中 / 已揭晓汤底 */
export type TGameFlowStatus = 'idle' | 'playing' | 'ended'

type TGameFlowContextValue = {
  status: TGameFlowStatus
  /** 当前游戏或结果页对应的故事 id，大厅为 null */
  activeStoryId: string | null
  /** 界面展示用短文案 */
  statusLabel: string
}

const GameFlowContext = createContext<TGameFlowContextValue | null>(null)

function computeFlow(pathname: string): TGameFlowContextValue {
  const gameMatch = pathname.match(/^\/game\/([^/]+)\/?$/)
  const resultMatch = pathname.match(/^\/result\/([^/]+)\/?$/)

  if (gameMatch) {
    return {
      status: 'playing',
      activeStoryId: gameMatch[1],
      statusLabel: '进行中',
    }
  }
  if (resultMatch) {
    return {
      status: 'ended',
      activeStoryId: resultMatch[1],
      statusLabel: '已结束',
    }
  }
  return {
    status: 'idle',
    activeStoryId: null,
    statusLabel: '未开局',
  }
}

export function GameFlowProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const value = useMemo(
    () => computeFlow(location.pathname),
    [location.pathname],
  )
  return (
    <GameFlowContext.Provider value={value}>{children}</GameFlowContext.Provider>
  )
}

/** 路由切换时轻量入场动画（尊重 prefers-reduced-motion） */
function RouteTransition() {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      className="motion-safe:animate-page-enter min-h-[100dvh]"
    >
      <Outlet />
    </div>
  )
}

/** 根路由布局：注入游戏流程上下文 */
export function GameFlowRootLayout() {
  return (
    <GameFlowProvider>
      <div className="relative min-h-[100dvh]">
        <div className="starfield" aria-hidden />
        <RouteTransition />
      </div>
    </GameFlowProvider>
  )
}

export function useGameFlow(): TGameFlowContextValue {
  const ctx = useContext(GameFlowContext)
  if (!ctx) {
    throw new Error('useGameFlow 须在 GameFlowProvider 内使用')
  }
  return ctx
}
