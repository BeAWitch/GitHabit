# GitHabit

[English](#english) | [简体中文](#chinese)

> **Build habits like you build code. 像写代码一样养成习惯。**

GitHabit is an open-source, offline-first mobile habit tracker designed for developers, efficiency enthusiasts, and geeks. It heavily mimics the aesthetic, concepts, and interaction logic of GitHub. 

GitHabit 是一款为开发者、极客和效率爱好者设计的开源、纯离线习惯养成应用，深度还原了 GitHub 的 UI 风格与交互逻辑。不仅能帮你记录日常习惯，还能为你生成专属的 365 天“绿格子”贡献图。

<img src="https://github.com/user-attachments/assets/398c12ad-ab7f-46de-865d-5aa9c09856e4" alt="Screenshot of GitHabit app" width="200">
<img src="https://github.com/user-attachments/assets/dfe62937-cc57-4ca4-ae83-61cb504c980d" alt="Screenshot of GitHabit app" width="200">
<img src="https://github.com/user-attachments/assets/953e0679-7206-4958-af2d-9688888ea01d" alt="Screenshot of GitHabit app" width="200">
<img src="https://github.com/user-attachments/assets/61ddfed5-46c2-4515-9acf-0e89e5fd0aef" alt="Screenshot of GitHabit app" width="200">

---

## <a id="english"></a>English

### ✨ Features

*   📊 **Contribution Graph**: Visualize your consistency with a 365-day GitHub-style green heatmap. The more you do, the darker the green!
*   📁 **Habits as Repositories**: Create structured goals with custom colors, target values, and cycle units.
*   💬 **Check-ins as Commits**: Log your progress with "Commit Messages", specific values, and track your history on a Timeline.
*   📝 **Markdown Support**: Write detailed `README.md` descriptions for your habits.
*   📈 **Data Analytics**: View your progress through Goal Progress Rings and Line Charts for individual habits.
*   🎨 **Geeky Aesthetic**: Authentic GitHub Light/Dark themes and typography using Octicons.
*   🔒 **Privacy First**: 100% offline. All data is securely stored locally via SQLite.
*   💾 **Full Data Control**: Export and import your entire database as a JSON file.
*   🌍 **i18n Support**: Switch seamlessly between languages (English / 中文).

### 🛠️ Tech Stack

*   **Framework:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (Expo Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Local Storage:** Expo SQLite
*   **Icons:** `@expo/vector-icons` (Octicons)

### 🚀 Getting Started

1. **Clone the repository**
   ```bash![Screenshot_2026-03-05-15-46-54-051_host exp exponent](https://github.com/user-attachments/assets/c9d90fca-9649-4305-836d-0fb394c9c8e8)

   git clone https://github.com/your-username/GitHabit.git
   cd GitHabit
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the development server**
   ```bash
   npx expo start
   ```
4. **Run the app**
   * Press `a` to run on an Android emulator.
   * Press `i` to run on an iOS simulator.
   * Or scan the QR code with the **Expo Go** app on your physical device.

---

## <a id="chinese"></a>简体中文

### ✨ 核心特性

*   📊 **贡献热力图 (Contribution Graph)**：像 GitHub 绿格子一样，可视化你一整年的习惯坚持情况。打卡越多，绿色越深！
*   📁 **习惯即仓库 (Repositories)**：创建结构化的目标，自定义颜色、目标数值和周期单位。
*   💬 **打卡即提交 (Commits)**：用“Commit Message”记录每次打卡的心得，并附带具体数值，在时间线上追踪历史。
*   📝 **Markdown 支持**：为你的习惯编写详细的 `README.md` 描述和规则。
*   📈 **数据分析**：通过目标进度环和折线图，直观查看单项习惯的进展与趋势。
*   🎨 **极客美学**：原汁原味的 GitHub 深色/浅色主题，以及原生 Octicons 图标。
*   🔒 **隐私优先**：100% 离线运行。所有数据均安全地存储在本地 SQLite 数据库中，不过传云端。
*   💾 **数据掌控**：支持将所有数据导出为 JSON 文件，或从 JSON 文件导入，换机无忧。
*   🌍 **多语言支持**：无缝切换英语和中文。

### 🛠️ 技术栈

*   **框架:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (Expo Router)
*   **语言:** [TypeScript](https://www.typescriptlang.org/) (严格模式)
*   **样式:** [NativeWind](https://www.nativewind.dev/) (针对 React Native 的 Tailwind CSS)
*   **状态管理:** [Zustand](https://github.com/pmndrs/zustand)
*   **本地存储:** Expo SQLite
*   **图标库:** `@expo/vector-icons` (Octicons)

### 🚀 快速开始

1. **克隆项目到本地**
   ```bash
   git clone https://github.com/your-username/GitHabit.git
   cd GitHabit
   ```
2. **安装依赖**
   ```bash
   npm install
   ```
3. **启动开发服务器**
   ```bash
   npx expo start
   ```
4. **运行应用**
   * 终端中按 `a` 在 Android 模拟器上运行。
   * 终端中按 `i` 在 iOS 模拟器上运行。
   * 或使用手机上的 **Expo Go** 应用扫描终端生成的二维码直接在真机运行。

---
*If you like this project, please consider giving it a ⭐! / 如果喜欢这个项目，欢迎点个 ⭐ 关注！*
