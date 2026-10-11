param(
    [string]$Folder = ''
)

$ErrorActionPreference = 'Stop'
try {
    if ([string]::IsNullOrWhiteSpace($Folder)) {
        $key = '{374DE290-123F-4565-9164-39C4925E467B}'
        $registry = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders'
        try {
            $shellFolders = Get-ItemProperty -Path $registry
            $Folder = [Environment]::ExpandEnvironmentVariables($shellFolders.$key)
        } catch {}
        if ([string]::IsNullOrWhiteSpace($Folder)) {
            $Folder = Join-Path $env:USERPROFILE 'Downloads'
        }
    }
    if (-not (Test-Path -LiteralPath $Folder -PathType Container)) {
        throw "Folder not found: $Folder"
    }

    Write-Host "Scanning: $Folder" -ForegroundColor Cyan
    $renamed = 0
    $skipped = 0
    $failures = 0
    Get-ChildItem -LiteralPath $Folder -File | ForEach-Object {
        $file = $_
        if ($file.Name -notmatch '%[0-9A-Fa-f]{2}' -or
            $file.Name -match '\.(crdownload|part|tmp)$') { return }
        try {
            $newName = [Uri]::UnescapeDataString($file.Name)
            if ($newName -ceq $file.Name -or $newName -cnotmatch '[^\x00-\x7F]') { return }
            if ($newName -match '[<>:"/\\|?*\x00-\x1F\uFFFD]' -or
                $newName -match '[. ]$' -or
                $newName -match '^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)' -or
                $newName.Length -gt 240) {
                Write-Host "Skip unsafe name: $($file.Name)" -ForegroundColor Yellow
                $skipped++
                return
            }

            $desired = $newName
            $index = 1
            while (Test-Path -LiteralPath (Join-Path $Folder $desired)) {
                $stem = [IO.Path]::GetFileNameWithoutExtension($newName)
                $ext = [IO.Path]::GetExtension($newName)
                $desired = '{0} ({1}){2}' -f $stem, $index, $ext
                $index++
                if ($index -gt 9999) { throw 'Too many files with matching names.' }
            }
            Rename-Item -LiteralPath $file.FullName -NewName $desired -ErrorAction Stop
            Write-Host "Fixed: $desired" -ForegroundColor Green
            $renamed++
        } catch {
            Write-Host "Failed: $($file.Name) -- $($_.Exception.Message)" -ForegroundColor Red
            $failures++
        }
    }
    Write-Host "Done. Renamed: $renamed; Skipped: $skipped; Failed: $failures"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
