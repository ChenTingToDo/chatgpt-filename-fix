# ChatGPT Filename Fix

[简体中文](README.md) | English

A tiny, offline Microsoft Edge / Chromium extension that attempts to restore percent-encoded UTF-8 download filenames without changing file contents.

```text
%E4%B8%AD%E6%96%87.md  →  中文.md
```

It targets downloads with valid percent-encoded Unicode names, including some ChatGPT downloads. This is a community workaround and is **not** an official OpenAI or Microsoft product.

## Features

- Decodes safe percent-encoded UTF-8 file basenames on download.
- Ignores ordinary names, malformed encoding, path separators, reserved Windows names, and other unsafe names.
- Bundled Windows PowerShell + CMD tools to rename already-downloaded files safely.
- No network requests, external dependencies, or file-content access.

## Install in Microsoft Edge

1. Download and unzip the repository into a permanent local folder.
2. Open `edge://extensions` and enable **Developer mode**.
3. Select **Load unpacked**, and choose the `Edge_Extension` directory containing `manifest.json`.
4. Keep the extension enabled and test a previously affected download.

This extension is written for Chromium Manifest V3. The reported successful use case is Windows + Edge; other platforms have not been comprehensively verified. Keep the unpacked extension directory intact. The source ZIP is **not** directly installable as an extension without extracting it.

## Fix existing downloads (Windows)

Double-click `Fix_Existing_Filenames.cmd` to scan your user's Downloads folder (non-recursive), or drag a different folder onto the CMD file. Existing files are not overwritten; collisions receive `(1)`, `(2)`, etc. Only names that safely decode to contain non-ASCII text are renamed.

The CMD invokes PowerShell with a process-specific `-ExecutionPolicy Bypass`. Review the scripts before running them.

## Security and privacy

The sole requested permission is `downloads`. That permission is powerful at the browser level, but the shipped extension only subscribes to `chrome.downloads.onDeterminingFilename` and examines the provided filename string. It does not read download contents, page data, cookies, or URLs; it sends no data over the network. Audit [the complete background script](Edge_Extension/background.js).

The extension applies to all downloads with safely decodable names, not only ChatGPT. It may conflict with other extensions that rename downloads. It cannot correct renames performed outside its browser hook, and does not support automatic updates from an extension store.

## Tests

Node.js is needed **only for development**, not for installation:

```sh
node --test tests/*.test.cjs
```

## Bug report and contribution

[OpenAI support bug report draft](docs/OPENAI_BUG_REPORT.md) describes the observed product issue; it is not a filed support case. For issues with this community extension, please open a GitHub Issue. Never submit personal filenames, URLs, or sensitive screenshots without redaction.

MIT licensed; see [LICENSE](LICENSE). Not affiliated with OpenAI or Microsoft.
