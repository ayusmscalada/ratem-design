# Makes this project the permanent home of its Claude Code sessions.
#
# Claude Code always saves sessions under C:\Users\<you>\.claude\projects\<project>.
# This script moves that folder into .claude\sessions here and leaves a junction
# (a Windows folder shortcut) on C:, so every new session is written straight
# into the project on D:.
#
# Run it with VS Code and every Claude Code window CLOSED:
#   right-click this file > Run with PowerShell
#   or: powershell -ExecutionPolicy Bypass -File .claude\move-sessions-to-project.ps1

$ErrorActionPreference = "Stop"
$cPath = Join-Path $env:USERPROFILE ".claude\projects\d--Projects-ratem-design"
$dPath = Join-Path $PSScriptRoot "sessions"

$item = Get-Item -LiteralPath $cPath -Force
if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
  "Already done: $cPath points to $dPath"
  exit 0
}

# 1. Bring the copy in the project fully up to date (sessions keep growing until closed).
robocopy $cPath $dPath /E /COPY:DAT /R:2 /W:2 /NFL /NDL /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Copy failed (robocopy code $LASTEXITCODE). Nothing on C: was changed." }

# 2. Keep the old C: folder as a backup, then point C: at the project folder.
$backup = "$cPath.backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
Move-Item -LiteralPath $cPath -Destination $backup
New-Item -ItemType Junction -Path $cPath -Target $dPath | Out-Null

""
"Done. Sessions now live in: $dPath"
"Backup of the old C: folder: $backup"
"Open Claude Code, check your past sessions still show up, then delete that backup folder."
