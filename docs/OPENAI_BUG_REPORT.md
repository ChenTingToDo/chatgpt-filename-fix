# Bug report draft: ChatGPT downloaded files keep percent-encoded Chinese filenames

> **Status: Draft — NOT submitted.** This is a ChatGPT web product issue, not a Codex repository issue. Use the [OpenAI Help Center](https://help.openai.com/) chat bubble at the bottom-right to contact support. Do not attach user-private material to a public issue.

## Title

ChatGPT web downloads sometimes save Chinese filenames as literal URL percent-encoded strings (`%E4...`) in Microsoft Edge

## Environment

- Product: ChatGPT web (chatgpt.com)
- Operating system: Windows
- Browser: Microsoft Edge (exact version can be supplied by reporter)
- First noticed: Recently as of October 2026; reportedly worked normally before
- Output files: Markdown and possibly other generated/exported file types

## Steps to reproduce

1. Disable download-renaming extensions (including the community workaround) while testing the original issue.
2. Ask ChatGPT to generate a downloadable file with a Chinese filename, e.g. `个人技术项目总结.md`.
3. Click the download link in Edge.
4. Observe the file as saved in Windows Explorer.

## Observed result

The downloaded filename may appear as an undecoded percent-encoded string such as `%E4%B8%AA%E4%BA%BA...md`. File contents open and display normally in Chinese, indicating that this is a **filename-only** issue rather than a document text-encoding failure.

## Expected result

The browser saves the file using the original readable Chinese filename, e.g. `个人技术项目总结.md`.

## Reproducibility and impact

Multiple filenames were reportedly affected in the same period, with content remaining intact. Users must manually rename files to understand them. Root cause (server headers vs browser handling) has **not** been established.

## Workaround

A locally installed Edge extension using `chrome.downloads.onDeterminingFilename` can safely decode eligible names before saving. Using ASCII-only filenames also avoids the observed issue. These workarounds do not establish the root cause.

## Suggested diagnostics

- Compare `Content-Disposition` headers (`filename` and `filename*`) for a failing download.
- Test with Edge extensions disabled and with a second browser.
- Record Edge version, exact time with timezone, and an affected example (redacted as appropriate).
- Check if the saved file name is already percent-encoded before the browser handles it.

## 中文摘要

ChatGPT 网页端近期下载中文文件名时，Windows + Edge 中的文件名可能直接变为 `%E4...` 等 URL 百分号编码；文件内容完全正常。期待保留原始中文文件名。已通过本地浏览器扩展临时规避，但尚未确认根因，也未向 OpenAI 正式提交报告。
