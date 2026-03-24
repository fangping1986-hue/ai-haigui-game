import { createBrowserRouter } from 'react-router-dom'
import { GameFlowRootLayout } from '../context/GameFlowContext'
import { Game } from '../pages/Game'
import { Home } from '../pages/Home'
import { Result } from '../pages/Result'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <GameFlowRootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'game/:id', element: <Game /> },
      { path: 'result/:id', element: <Result /> },
    ],
  },
])
