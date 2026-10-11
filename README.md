# ChatGPT Filename Fix · 中文下载文件名修复

[English](README_EN.md) | 简体中文

一个轻量级、离线运行的 Microsoft Edge / Chromium 浏览器扩展，用来修复下载文件名被保留为 UTF-8 URL 百分号编码的问题。

例如：

```text
%E4%B8%AD%E6%96%87.md  →  中文.md
```

**适用场景**：从 ChatGPT 或其他网站下载的文件，文件内容正常，但名称显示为 `%E4...`。这不是 ChatGPT 官方产品，也不保证解决所有文件名编码问题。

## 功能

- 下载时自动尝试将文件名中的百分号编码还原为 Unicode 字符。
- 不改变文件内容，也不访问网页内容。
- 对非法编码、Windows 禁止的文件名字符、设备保留名、路径穿越等情况保持原样，不强行改名。
- 附带 PowerShell 脚本：批量修复**已经下载**的乱码文件名。
- 无网络请求、无依赖，不需要安装 Node.js 才能使用扩展。

## 安装（Edge）

1. 下载本项目源码 ZIP，完整解压到一个**不会随意删除或移动**的目录。
2. 打开 `edge://extensions`，启用「开发人员模式」。
3. 点击「加载解压缩的扩展」，选择 `Edge_Extension` 文件夹（内含 `manifest.json`）。
4. 保持扩展启用，重新下载一个之前遇到乱码的文件进行验证。

> 注意：GitHub 项目源码 ZIP 不能直接作为扩展安装；需要先解压，再选择 **Edge_Extension** 目录。下载扩展无需安装其他软件。

兼容性：基于 Chromium Manifest V3 下载 API 开发；在 Windows + Microsoft Edge 的实际场景下已得到用户反馈，其他浏览器/平台未进行完整验证。

## 修复已下载的文件

Windows 下双击 `Fix_Existing_Filenames.cmd`，默认扫描当前用户的「下载」文件夹（不递归）。也可将其他文件夹拖放到该 CMD 文件上。

- 仅处理文件名中包含 `%XX` 编码，且还原后含非 ASCII 字符的文件。
- 自动避免重名覆盖，必要时添加 `(1)`、`(2)` 等序号。
- 不修改文件内容，不删除文件，不访问网络。
- 脚本使用 `-ExecutionPolicy Bypass` 启动当前 PowerShell 进程的脚本；请先审阅源码再运行，不信任的脚本不要执行。

也可在 PowerShell 中手动指定目录：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Fix_Existing_Filenames.ps1 -Folder 'D:\Downloads'
```

## 权限与隐私

扩展仅请求浏览器 `downloads` 权限，**不请求网页访问权限**，也不包含 `fetch`、XHR、遥测或第三方服务。

`downloads` 权限在浏览器层面具有查看下载信息、调整文件名等能力。当前源码仅使用 `chrome.downloads.onDeterminingFilename` 来处理下载项提供的 `filename` 字段；不读取文件内容、下载链接、Cookie、账户数据，也不将任何信息发送至外部服务器。建议审阅 [background.js](Edge_Extension/background.js) 后安装。

## 局限性

- 对所有下载尝试进行安全解码，并非仅限 ChatGPT。如果其他网站故意使用了编码形式的文件名，也可能被解码。
- 如果浏览器在扩展处理之后或浏览器之外再改名，扩展不能保证修复。
- 遇到非法编码、不安全名称时不改名；原文件内容始终保持不变。
- 与其他同样重命名文件的扩展同时启用时可能冲突。
- 不提供自动更新或扩展商店上架版本。安装本地扩展时，请妥善保留目录。

## 开发与测试

测试代码使用 Node.js 内置的测试模块和 VM，无第三方依赖：

```bash
node --test tests/*.test.cjs
```

扩展自身不依赖 Node.js；测试仅适用于开发者。回归测试覆盖 URL 解码、安全路径校验、保留名、损坏编码、普通文件名等情况。

## Bug 反馈与贡献

- ChatGPT 网页端原始问题的反馈材料：[docs/OPENAI_BUG_REPORT.md](docs/OPENAI_BUG_REPORT.md)。该文件是一份**待提交草稿**，不是已经向 OpenAI 提交的工单。
- 项目本身的问题可使用仓库的 GitHub Issues，提交前请移除截图、路径中的私人信息。
- 欢迎 PR；请保持最小权限、离线运行，并为行为变更添加测试。

## 许可证

MIT，见 [LICENSE](LICENSE)。

本项目是社区修复工具，与 OpenAI、Microsoft 无官方关联。
