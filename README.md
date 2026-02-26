## 概念映射与开发计划

### 1. 概念与逻辑映射 (GitHub -> 打卡应用)

我们将 GitHub 的核心元素完全映射到日常习惯养成中：

- **User Profile (个人主页)** -> **打卡概览**：展示年度总“Commits”（总打卡次数），以及最核心的**全局绿色热力图**（Contribution Graph）。
- **Repository (仓库)** -> **一个计划/习惯**：比如 `daily-reading` 或 `workout-2024`。
  - *Repo Name*：习惯的名称。
  - *Description*：对该习惯的具体描述或目标。
  - *Language (小圆点)*：习惯分类（例如 🟡 Health，🔵 Learning）。
  - *Stars / Forks*：可以用来记录该习惯的“最高连续打卡天数 (Max Streak)”。
- **Commit / Push (提交)** -> **单次打卡动作**：
  - *Commit Message*：打卡时填写的备忘、日记或执行心得（例如：“Fix: 今天太累了，只跑了 3 公里”）。
  - *Timestamp*：精确的打卡时间戳。
- **Pinned Repos (置顶仓库)** -> **置顶关注的重点习惯**：展示在 Profile 页面的上半部分。

### 2. 技术栈架构设计

- **框架**: Expo Router (您当前目录已经搭建好的基础)。
- **本地存储 (Expo SQLite)**: 建立两个核心表：
  - `Habits` (id, name, description, color_category, created_at)
  - `Commits` (id, habit_id, message, timestamp, date_string)
  - *优势*: 统计某个月/某年的打卡频次，生成热力图只需要一句简单的 `GROUP BY date_string` SQL 查询，性能极高。
- **状态管理 (Zustand)**: 主要用于维护全局主题（Dark/Light/System）和当前用户的统计数据缓存。
- **UI 与样式 (NativeWind)**: 还原 GitHub 的原子化设计，例如：绿色主要按钮、深色模式下 `#0d1117` 的背景色与 `#30363d` 的边框线。
- **图标系统**: 直接使用项目内置的 `@expo/vector-icons/Octicons`，这是 GitHub 官方的开源图标库，能最大程度还原味道。
- **核心组件 - 热力图 (Heatmap)**: 鉴于市面上的 RN 热力图组件多较老旧，我们将使用 `ScrollView` + `View` 原生手写一个 52周 x 7天 的网格系统，配合 GitHub 经典的五阶色值。

### 3. 分步实施计划 (Implementation Steps)

**第一阶段：基础设施与数据层搭建**

1. 安装并配置 `NativeWind` (TailwindCSS)。
2. 配置 `Zustand`，实现全局明暗主题切换逻辑。
3. 封装 `Expo SQLite` 数据库实例，编写初始化建表脚本，提供 CRUD 的 Hooks (`useHabits`, `useCommits`)。

**第二阶段：GitHub 风格核心组件库开发**

1. **基础元素**：文本组件、GitHub 风格绿色按钮 (`btn-primary`)、输入框。
2. **Repository Card**：列表中的习惯卡片，展示名称、标签、时间信息。
3. **Contribution Graph (重中之重)**：接收一组日期数据，渲染出 5 种不同绿色深浅的贡献图（支持 Dark/Light 两套色值）。
4. **Commit Timeline**：打卡历史的时间轴列表。

**第三阶段：页面路由与业务逻辑集成**

1. **(tabs)/profile**：个人首页，顶部的总览数据 + 贡献图 + 置顶习惯。
2. **(tabs)/repos**：全部计划列表，右上角包含 `+ New` 新建仓库（习惯）功能。
3. **repo/[id]**：习惯详情页，专属的单项热力图、历史 Commits 列表，底部悬浮核心的 `[ Commit ]` 打卡按钮。
4. **commit/[id]**：打卡交互界面，类似终端或 Git GUI 的输入框，提交 Message。
5. **(tabs)/settings**：控制台，用于切换主题或导出数据。