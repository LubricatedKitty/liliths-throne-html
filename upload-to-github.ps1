# Upload only this folder (Liliths Throne HTML) to GitHub.
# Double-click upload-to-github.bat, or run:
#   powershell -ExecutionPolicy Bypass -File .\upload-to-github.ps1
#
# Optional:
#   .\upload-to-github.ps1 -RepoName "liliths-throne-html" -Public
#   .\upload-to-github.ps1 -RemoteUrl "https://github.com/YOU/REPO.git"

[CmdletBinding()]
param(
  [string]$RepoName = "liliths-throne-html",
  [string]$RemoteUrl = "",
  [switch]$Public,
  [switch]$SkipGhInstall
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    $msg" -ForegroundColor Yellow }

function Find-Exe([string]$name, [string[]]$extra) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($p in $extra) {
    if ($p -and (Test-Path $p)) { return $p }
  }
  return $null
}

function Ensure-OnPath([string]$dir) {
  if ($dir -and ($env:Path -notlike "*$dir*")) {
    $env:Path = "$dir;$env:Path"
  }
}

$git = Find-Exe "git" @(
  "C:\Program Files\Git\cmd\git.exe",
  "C:\Program Files (x86)\Git\cmd\git.exe",
  "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
)
$gh = Find-Exe "gh" @(
  "C:\Program Files\GitHub CLI\gh.exe",
  "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
)
$winget = Find-Exe "winget" @()

if (-not $git) {
  Write-Step "Git is not installed"
  if ($winget) {
    Write-Host "Installing Git with winget (accept the prompts)..."
    & $winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    $git = Find-Exe "git" @("C:\Program Files\Git\cmd\git.exe")
  }
  if (-not $git) {
    throw "Install Git from https://git-scm.com/download/win then run this script again."
  }
}
Ensure-OnPath (Split-Path $git)
Write-Ok "Git: $git"

# This drive does not record file ownership. Git 2.35+ refuses the folder
# until it is listed in safe.directory. Add every path spelling Git might use.
$safePaths = @(
  "*",
  $Root,
  ($Root -replace '\\', '/')
) | Select-Object -Unique
$existingSafe = @(& $git config --global --get-all safe.directory 2>$null)
foreach ($dir in $safePaths) {
  if ($existingSafe -notcontains $dir) {
    & $git config --global --add safe.directory $dir
  }
}
Write-Ok "Marked this folder as a Git safe.directory"

if (-not $gh -and -not $SkipGhInstall -and $winget -and -not $RemoteUrl) {
  Write-Step "GitHub CLI is not installed"
  $ans = Read-Host "Install GitHub CLI so this script can create the repo for you? [Y/n]"
  if ($ans -notmatch '^[nN]') {
    & $winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    $gh = Find-Exe "gh" @(
      "C:\Program Files\GitHub CLI\gh.exe",
      "$env:LOCALAPPDATA\Programs\GitHub CLI\gh.exe"
    )
  }
}
if ($gh) {
  Ensure-OnPath (Split-Path $gh)
  Write-Ok "GitHub CLI: $gh"
}

function Invoke-Native([string]$exe, [object[]]$cmdArgs) {
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $code = 0
  try {
    # Capture stdout/stderr so they are NOT function output. Callers assign
    # only the exit code. Mixing git's "[main] ..." line with 0 makes
    # `if ($code -ne 0)` true in PowerShell (it filters the array).
    $out = & $exe @cmdArgs 2>&1
    $code = $LASTEXITCODE
    foreach ($line in @($out)) {
      if ($null -ne $line -and "$line" -ne "") { Write-Host "    $line" }
    }
  } finally {
    $ErrorActionPreference = $old
  }
  return [int]$code
}
function Git { return (Invoke-Native $git $args) }
function Gh { return (Invoke-Native $gh $args) }
function Git-Out {
  $old = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $text = & $git @args 2>$null
    if ($LASTEXITCODE -ne 0) { return "" }
    return ($text | Out-String).Trim()
  } finally {
    $ErrorActionPreference = $old
  }
}

$name = Git-Out config --global --get user.name
$email = Git-Out config --global --get user.email
if (-not $name -or -not $email) {
  Write-Step "Git needs your name and email for the first commit"
  if (-not $name) {
    $name = Read-Host "Your name (shown on commits)"
    if (-not $name) { throw "A git user.name is required." }
    Git config --global user.name $name
  }
  if (-not $email) {
    $email = Read-Host "Your email (shown on commits)"
    if (-not $email) { throw "A git user.email is required." }
    Git config --global user.email $email
  }
}
Write-Ok "Commits as $name <$email>"

Write-Step "Using folder: $Root"
Write-Host "    Parent files (Java source, official 0.4.10, Twine) stay on disk and are NOT uploaded."

if (-not (Test-Path (Join-Path $Root ".git"))) {
  Write-Step "Creating a new git repository in this folder"
  Git init -b main
  Write-Ok "Initialized on branch main"
} else {
  Write-Ok "Git repository already exists"
}

Write-Step "Staging Liliths Throne HTML"
$code = Git add -A
if ($code -ne 0) { throw "git add failed. If you see 'dubious ownership', the script should have marked this folder safe. Run it again." }
$status = Git-Out status --porcelain
if (-not $status) {
  Write-Ok "Nothing new to commit"
} else {
  $hasCommit = Git-Out log -1 --oneline
  if (-not $hasCommit) {
    $code = Git commit -m "Initial upload of Liliths Throne HTML Community Edition"
  } else {
    $code = Git commit -m "Update Liliths Throne HTML"
  }
  if ($code -ne 0) { throw "git commit failed." }
  Write-Ok "Committed"
}

$hasOrigin = Git-Out remote get-url origin
if ($RemoteUrl) {
  if ($hasOrigin) { $code = Git remote set-url origin $RemoteUrl }
  else { $code = Git remote add origin $RemoteUrl }
  $hasOrigin = $RemoteUrl
}

if (-not $hasOrigin) {
  if (-not $gh) {
    Write-Step "No GitHub remote yet"
    Write-Host @"
    Create an empty repo on GitHub (no README), then paste its URL.
    Example: https://github.com/YourUser/liliths-throne-html.git
"@
    $RemoteUrl = Read-Host "GitHub repo URL"
    if (-not $RemoteUrl) { throw "A repo URL is required if GitHub CLI is not installed." }
    Git remote add origin $RemoteUrl
    $hasOrigin = $RemoteUrl
  } else {
    Write-Step "Checking GitHub login"
    $auth = Gh auth status
    if ($auth -ne 0) {
      Write-Host "A browser window will open so you can log in to GitHub."
      $login = Gh auth login --hostname github.com --git-protocol https --web
      if ($login -ne 0) { throw "GitHub login failed." }
    }
    $vis = if ($Public) { "--public" } else { "--private" }
    Write-Step "Creating GitHub repo $RepoName ($vis)"
    # Do not pass --source. gh's own git check fails on this drive
    # ("dubious ownership") even after safe.directory is set.
    $created = Gh repo create $RepoName $vis
    if ($created -ne 0) {
      throw "gh repo create failed. If the name is taken, rerun with -RepoName something-else"
    }
    $url = "https://github.com/LubricatedKitty/$RepoName.git"
    $me = ""
    $old = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $me = ((& $gh api user --jq .login) | Out-String).Trim()
    $ErrorActionPreference = $old
    if ($me) { $url = "https://github.com/$me/$RepoName.git" }
    Git remote add origin $url | Out-Null
    $hasOrigin = $url
    Write-Ok "Created $url"
  }
}

Write-Step "Pushing to origin"
$branch = Git-Out rev-parse --abbrev-ref HEAD
if (-not $branch) { $branch = "main" }
Git fetch origin | Out-Null
$remoteExists = Git-Out rev-parse --verify "origin/$branch"
if ($remoteExists) {
  $behind = Git-Out rev-list --count "$branch..origin/$branch"
  if ($behind -and [int]$behind -gt 0) {
    Write-Warn "GitHub has $behind newer commit(s). Rebasing this folder onto them."
    $rebased = Git pull --rebase origin $branch
    if ($rebased -ne 0) {
      throw "git pull --rebase failed. Keep local files you still want (git add <file>), run git rebase --continue, then run this script again."
    }
  }
}
$pushed = Git push -u origin $branch
if ($pushed -ne 0) {
  Write-Warn "Push failed. If GitHub asks you to log in, use a Personal Access Token as the password:"
  Write-Host "    https://github.com/settings/tokens"
  throw "git push failed."
}
Write-Ok "Pushed $branch to origin"
if ($gh) { Gh repo view --web }
Write-Host "`nDone." -ForegroundColor Green
