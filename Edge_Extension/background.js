// Restore only clearly URL-encoded non-ASCII filenames.
// This extension makes no network requests and does not inspect file contents.
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  const original = typeof item.filename === 'string' ? item.filename : '';
  const lastSeparator = Math.max(original.lastIndexOf('/'), original.lastIndexOf('\\'));
  const directory = original.slice(0, lastSeparator + 1);
  const base = original.slice(lastSeparator + 1);

  // Don't interfere with ordinary filenames or partial downloads.
  if (!/%[0-9a-fA-F]{2}/.test(base) || !base || /\.(crdownload|part|tmp)$/i.test(base)) {
    suggest();
    return;
  }

  try {
    const decoded = decodeURIComponent(base);
    if (decoded === base || !/[^\x00-\x7F]/.test(decoded)) {
      suggest();
      return;
    }

    // Prevent path traversal, unsafe Windows paths, reserved device names,
    // and names that exceed common Windows filename limits.
    if (
      /[<>:"/\\|?*\x00-\x1F]/.test(decoded) ||
      /[. ]$/.test(decoded) ||
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(decoded) ||
      decoded.length > 240
    ) {
      suggest();
      return;
    }

    suggest({filename: directory + decoded, conflictAction: 'uniquify'});
  } catch (_) {
    // Invalid URL encoding: leave the original filename unchanged.
    suggest();
  }
});
