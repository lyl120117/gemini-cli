# OGemini CLI

[![OGemini CLI CI](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/google-gemini/gemini-cli/actions/workflows/ci.yml)

![OGemini CLI Screenshot](./docs/assets/gemini-screenshot.png)

OGemini CLI 是一个强大的命令行 AI 工作流工具，基于 Gemini CLI 开发，支持 OpenAI 兼容的 API（如 Moonshot AI/Kimi、DeepSeek 等）。

使用 OGemini CLI，你可以：

- 查询和编辑大型代码库，支持超大上下文窗口
- 使用多模态能力从 PDF 或草图生成新应用
- 自动化操作任务，如查询 PR 或处理复杂的代码合并
- 通过工具和 MCP 服务器连接新功能
- 支持 OpenAI 兼容 API，可使用任何兼容服务

## 快速开始

### 前置要求

- Node.js 20.0.0 或更高版本
- Git（用于克隆源码）

### 从源码安装

1. **克隆仓库**

   ```bash
   git clone https://github.com/lyl120117/gemini-cli
   cd ogemini-cli
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **构建项目**

   ```bash
   npm run build
   ```

4. **全局安装**

   方式一：使用 npm link（推荐用于开发）
   ```bash
   cd packages/cli
   npm link
   ```

   方式二：使用 npm install
   ```bash
   npm install -g ./packages/cli
   ```

5. **验证安装**

   ```bash
   # 查看版本
   ogemini --version
   
   # 查看帮助
   ogemini --help
   ```

### 配置

#### 使用 OpenAI 兼容 API

OGemini CLI 支持任何 OpenAI 兼容的 API，包括 OpenAI、Moonshot AI（Kimi）、DeepSeek 等。

##### 方法 1：使用 settings.json 配置（推荐）

创建或更新配置文件 `~/.gemini/settings.json`：

```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-your-api-key",
  "openaiBaseUrl": "https://api.openai.com/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "gpt-4o",
    "gemini-2.5-flash": "gpt-4o-mini"
  }
}
```

**其他服务商配置示例：**

Moonshot AI (Kimi):
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-your-moonshot-key",
  "openaiBaseUrl": "https://api.moonshot.cn/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "kimi-k2-0711-preview",
    "gemini-2.5-flash": "kimi-k2-0711-preview"
  }
}
```

DeepSeek:
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-your-deepseek-key",
  "openaiBaseUrl": "https://api.deepseek.com/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "deepseek-chat",
    "gemini-2.5-flash": "deepseek-coder"
  }
}
```

##### 方法 2：使用环境变量（备用）

如果未在 settings.json 中配置，系统会自动读取环境变量。在项目目录或主目录创建 `.env` 文件：

```bash
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

**配置优先级：**
1. settings.json 配置（最高优先级）
2. 环境变量
3. 默认值（仅限 base URL）

### 使用方法

启动 CLI：

```bash
ogemini
```

选择认证方式时，选择 "Use OpenAI API Key"。

更多配置选项请参考 [OpenAI 适配器文档](./docs/openai-adapter.md)。

## 使用示例

启动 CLI 后，你可以开始与 AI 交互。

从新目录开始项目：

```sh
cd new-project/
ogemini
> 帮我创建一个 Discord 机器人，使用我提供的 FAQ.md 文件来回答问题
```

处理现有项目：

```sh
git clone https://github.com/your-repo/your-project
cd your-project
ogemini
> 总结一下昨天的所有代码变更
```

### 下一步

- 了解如何[贡献代码或从源码构建](./CONTRIBUTING.md)
- 探索可用的 **[CLI 命令](./docs/cli/commands.md)**
- 如遇到问题，查看 **[故障排除指南](./docs/troubleshooting.md)**
- 查看[完整文档](./docs/index.md)
- 参考[常见任务](#常见任务)获取更多灵感

### 故障排除

如遇到问题，请查看[故障排除指南](docs/troubleshooting.md)。

## 常见任务

### 探索新代码库

进入现有或新克隆的仓库，运行 `ogemini`：

```text
> 描述这个系统架构的主要组成部分
```

```text
> 这里有哪些安全机制？
```

### 处理现有代码

```text
> 为 GitHub issue #123 实现一个初步版本
```

```text
> 帮我将这个代码库迁移到最新版本的 Java。先制定一个计划
```

### 自动化工作流

使用 MCP 服务器集成本地系统工具：

```text
> 制作一个幻灯片，展示过去7天的 git 历史，按功能和团队成员分组
```

```text
> 创建一个全屏 web 应用，用于墙上展示我们互动最多的 GitHub issues
```

### 系统交互

```text
> 将此目录中的所有图片转换为 png，并使用 exif 数据中的日期重命名
```

```text
> 按支出月份整理我的 PDF 发票
```

### 开发模式

如果你在开发过程中需要频繁测试：

```bash
# 直接从源码运行
npm start

# 调试模式
npm run debug
```

### 卸载

如需卸载：

```bash
# 如果使用了 npm link
npm unlink -g @google/gemini-cli

# 如果使用了 npm install -g
npm uninstall -g @google/gemini-cli
```

## 许可和隐私

本项目基于 Gemini CLI 开发，遵循相同的开源许可。使用 OpenAI 兼容 API 时，请遵守相应服务提供商的服务条款。
