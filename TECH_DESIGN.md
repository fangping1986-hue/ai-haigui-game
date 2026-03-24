技术设计.md
# AI海龟汤游戏设计

## 技术栈
- 前端:React + TypeScript + Vite
- 样式:TypeScript
- 状态管理:React + Hooks (useState,useContext)
- 路由:React Router
- 后端:Node.js + Express
- AI API:DeepSeek

## 项目结构
src/components/
GameCard.tsx #游戏卡片
ChatBox.tsx #聊天框
Message.tsx #单条消息
StoryReveal.tsx #汤底揭秘
pages/
Home.tsx #游戏大厅
Game.tsx #游戏页面
Result.tsx #结果页面
data/
stories.ts #故事数据
app.tsx 
main.tsx 

## 数据模型

### Story (海龟汤故事)
- id: string
- title: string
- diffculty: 'easy' | 'medium' | 'hard'
- surface: string(汤面)
- bottom: string(汤底)

### message (对话消息)
- id: string
- role: 'user' | 'assistant'
- content: string
- timestamp: number

## 核心流程
1.玩家选择故事 -> 显示汤面
2.玩家提问 -> 发送给AI
3.AI根据汤底判断 -> 返回"是"、"否"、"无关"
4.重复2-3步 -> 直到玩家点击"查看汤底"
5.显示汤底 -> 可以选择"再来一局"

## AI Prompt设计

你是一个海龟汤游戏的主持人。

当前故事的汤面是：{surface}
故事的汤底是：{bottom}

玩家会向你提问，你只能回答以下三种之一：
1."是"：玩家的猜测与汤底一致
2."否"：玩家的猜测与汤底矛盾
3."无关"：玩家的猜测与汤底无关，无法判断

注意：
1.严格根据汤底判断，不要额外推理
2.只回答"是"、"否"、"无关"，不要解释
3.保持神秘感，不要透露汤底

玩家问：{question}
请回答：





