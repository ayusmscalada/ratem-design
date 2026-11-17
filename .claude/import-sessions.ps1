# Run this on the NEW device, after copying the whole project folder
# (including .claude\sessions) there. Claude Code then sees all past sessions
# (Resume / past conversations, plus its memory notes) and keeps saving new
# sessions into this project.
#
# Run it with VS Code and every Claude Code window CLOSED:
#   right-click this file > Run with PowerShell
#   or: powershell -ExecutionPolicy Bypass -File .claude\import-sessions.ps1
#
# Works wherever the project lives on the new device (it does not need to be D:\Projects).

$ErrorActionPreference = "Stop"
$project  = Split-Path $PSScriptRoot -Parent
$sessions = Join-Path $PSScriptRoot "sessions"
if (-not (Test-Path -LiteralPath $sessions)) { throw "No .claude\sessions folder next to this script. Copy it from the old device first." }

# Claude Code names a project's session folder after its path: every character that
# isn't a letter or digit becomes "-" (D:\Projects\ratem-design -> D--Projects-ratem-design).
if ($project -ne "D:\Projects\ratem-design") {
  Write-Warning "This project is at '$project', not D:\Projects\ratem-design (where the sessions were recorded). Claude Code can hide sessions from Resume when the folder doesn't match. Use the same path on every device if you can."
}
$name = $project -replace '[^A-Za-z0-9]', '-'
if ($name.Length -gt 200) { throw "Project path is too long for this script. Move the project to a shorter path, e.g. D:\Projects\ratem-design." }
$projects = Join-Path $env:USERPROFILE ".claude\projects"
New-Item -ItemType Directory -Force -Path $projects | Out-Null
$link = Join-Path $projects $name

if (Test-Path -LiteralPath $link) {
  $item = Get-Item -LiteralPath $link -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { "Already set up: $link -> $sessions"; exit 0 }
  # Claude Code was already opened in this project on this device: keep anything it saved
  # (only files the project copy doesn't have), then set the folder aside as a backup.
  robocopy $link $sessions /E /XC /XN /XO /R:2 /W:2 /NFL /NDL /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Merge failed (robocopy code $LASTEXITCODE). Nothing was changed." }
  $backup = "$link.backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
  Move-Item -LiteralPath $link -Destination $backup
  "Existing folder kept as backup: $backup"
}

New-Item -ItemType Junction -Path $link -Target $sessions | Out-Null
""
"Done. Claude Code now reads and saves this project's sessions in: $sessions"
"Open the project in VS Code, open Claude Code and use 'Resume' / past conversations to continue."
