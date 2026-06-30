# AI Panel Studio

AI Panel Studio 是一个 AI 圆桌讨论 Web App MVP。用户输入议题和专家人数后，系统通过 DeepSeek 生成主持人与专家阵容，并在演播厅中推进 transcript、观众追问、共识分歧和最终 JSON 总结。

## 技术栈

- Next.js App Router
- React + TypeScript
- TailwindCSS
- API Routes
- DeepSeek API 封装
- SQLite schema / seed / init script
- Vitest 测试
- SSE 事件流

## 环境配置

### 运行环境

- Node.js：建议使用 `22.x`，当前开发验证版本为 `v22.13.1`
- npm：随 Node.js 安装即可
- 操作系统：Windows / macOS / Linux 均可运行
- 浏览器：Chrome、Edge 或其他现代浏览器

### DeepSeek API

项目后端会从环境变量读取 DeepSeek API Key，不会把 Key 暴露到浏览器端。

在项目根目录创建 `.env.local`：

```bash
cp .env.example .env.local
```

然后填写：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

说明：

- 当前项目优先读取 `DEEPSEEK_KEY`，同时兼容 `DEEPSEEK_API_KEY`。
- 如果你本地使用 `DEEPSEEK_API_KEY`，保持上面的配置即可。
- `.env.local` 已被 `.gitignore` 忽略，不要提交到 GitHub。
- 修改 `.env.local` 后需要重启 `npm run dev`。

### SQLite 数据库

项目提供 SQLite schema 和 seed 数据：

- `db/schema.sql`
- `db/seed.sql`
- `scripts/init-db.js`

初始化数据库：

```bash
npm run db:init
```

执行后会在本地生成：

```bash
data/ai-panel-studio.sqlite
```

该数据库文件只用于本地运行，已被 `.gitignore` 忽略。

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run db:init
npm run dev
```

打开 http://localhost:3000。

## 常用命令

```bash
npm run dev
npm test
npm run build
npm run db:init
```

## API

- `POST /api/generate-roles`: 根据议题和专家人数生成主持人与专家阵容。
- `POST /api/generate-discussion`: 根据当前讨论状态生成下一轮发言、共识和分歧增量。
- `POST /api/ask-question`: 接收观众追问。
- `POST /api/generate-summary`: 生成主持人口吻的结构化总结。
- `GET /api/discussions/:id/events`: SSE 事件流。

## 当前目录

- `app/`: 页面与 API 路由
- `components/`: UI 组件
- `lib/`: AI 调用、Prompt、类型与讨论引擎
- `db/`: SQLite schema 与 seed 数据
- `scripts/`: 数据库初始化脚本
- `tests/`: 单元测试与 API 测试入口
- `docs/`: SDD、DDD、Prompt 记录、E2E 清单、开发日志与报告

## 开发阶段

1. SDD: 明确业务需求、数据结构、API 契约与 Prompt 结构。
2. DDD: 定义领域模型、模块职责和 API 输入输出。
3. TDD: 覆盖讨论引擎、Prompt 输出和 API 参数校验。
4. E2E: 验证从生成角色、进入讨论、追问、AI 发言、总结到 JSON 导出的完整流程。
