param(
  [string]$OutDir = "docs/performance/drilldown",
  [int]$Port = 3000,
  [string]$Url = "/problems/array/two-sum",
  [switch]$Headed,
  [ValidateSet("dev", "prod")]
  [string]$Mode = "dev"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Resolve-PnpmRunner() {
  $pnpmCmd = Get-Command "pnpm.cmd" -ErrorAction SilentlyContinue
  if ($pnpmCmd) {
    return @{
      FilePath = $pnpmCmd.Source
      PrefixArgs = @()
    }
  }

  $pnpm = Get-Command "pnpm" -ErrorAction SilentlyContinue
  if ($pnpm) {
    return @{
      FilePath = $pnpm.Source
      PrefixArgs = @()
    }
  }

  $corepackCmd = Get-Command "corepack.cmd" -ErrorAction SilentlyContinue
  if ($corepackCmd) {
    return @{
      FilePath = $corepackCmd.Source
      PrefixArgs = @("pnpm")
    }
  }

  $corepack = Get-Command "corepack" -ErrorAction SilentlyContinue
  if ($corepack) {
    return @{
      FilePath = $corepack.Source
      PrefixArgs = @("pnpm")
    }
  }

  throw "Unable to locate pnpm runner. Install pnpm or ensure corepack is available."
}

function Stop-ProcessOnPort([int]$TargetPort) {
  $lines = netstat -ano | Select-String ":$TargetPort"
  $pids = @()
  foreach ($line in $lines) {
    $parts = ($line.ToString() -split '\s+') | Where-Object { $_ -ne '' }
    if ($parts.Length -lt 5) { continue }
    if ($parts[3] -ne "LISTENING") { continue }
    $procId = $parts[4]
    if ($procId -match '^[0-9]+$' -and $procId -ne '0') {
      $pids += [int]$procId
    }
  }

  foreach ($targetPid in ($pids | Select-Object -Unique)) {
    try {
      Stop-Process -Id $targetPid -Force -ErrorAction Stop
    } catch {
      # ignore
    }
  }
}

function Test-HttpReady([string]$HealthUrl) {
  try {
    $resp = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 2
    return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500)
  } catch {
    return $false
  }
}

$pnpmRunner = Resolve-PnpmRunner

function Invoke-PnpmRunner([string[]]$CommandArgs) {
  & $pnpmRunner.FilePath @($pnpmRunner.PrefixArgs + $CommandArgs)
}

function Start-PnpmRunnerProcess([string[]]$CommandArgs, [string]$WorkingDirectory) {
  return Start-Process -FilePath $pnpmRunner.FilePath -ArgumentList @($pnpmRunner.PrefixArgs + $CommandArgs) -WorkingDirectory $WorkingDirectory -PassThru
}

$ts = Get-Date -Format "yyyy-MM-dd_HHmmss"
$sessionRel = Join-Path $OutDir $ts
$sessionDir = Join-Path $root $sessionRel
New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null

$sessionMeta = [ordered]@{
  startedAt = (Get-Date).ToString("o")
  port = $Port
  route = $Url
  targetUrl = "http://localhost:$Port$Url"
  mode = $Mode
  serverMode = "auto"
} | ConvertTo-Json -Depth 3
Set-Content -Path (Join-Path $sessionDir "session-meta.json") -Value $sessionMeta -Encoding UTF8

$notesTemplate = @"
# Auto Drilldown Notes

## 1. Auto Run Result
- Route:
- Command:
- Completed at:

## 2. Findings
- Jank:
- Layout Shift:
- Network issues:
- State reset:

## 3. References
- auto-summary.md
- auto-metrics.json
- performance-trace.zip
- network.har
- screenshots

## 4. Fix Plan
- Proposed changes:
- Expected impact:
"@
Set-Content -Path (Join-Path $sessionDir "session-notes.md") -Value $notesTemplate -Encoding UTF8

$healthUrl = "http://localhost:$Port"
$devProc = $null

# prod 模式下必须强制杀掉已有服务，确保用 next start 而非 next dev
if ($Mode -eq "prod") {
  $useExistingServer = $false
  Stop-ProcessOnPort -TargetPort $Port
  Start-Sleep -Seconds 1

  $lockFile = Join-Path $root ".next\dev\lock"
  if (Test-Path $lockFile) {
    try { Remove-Item -Path $lockFile -Force } catch {}
  }

  Write-Host "Building production bundle..."
  Invoke-PnpmRunner -CommandArgs @("exec", "next", "build")
  if ($LASTEXITCODE -ne 0) {
    throw "next build failed with exit code: $LASTEXITCODE"
  }
  $devProc = Start-PnpmRunnerProcess -CommandArgs @("exec", "next", "start", "--port", "$Port") -WorkingDirectory $root
} else {
  $useExistingServer = Test-HttpReady -HealthUrl $healthUrl

  if (-not $useExistingServer) {
    Stop-ProcessOnPort -TargetPort $Port

    $lockFile = Join-Path $root ".next\dev\lock"
    if (Test-Path $lockFile) {
      try { Remove-Item -Path $lockFile -Force } catch {}
    }

    $devProc = Start-PnpmRunnerProcess -CommandArgs @("exec", "next", "dev", "--port", "$Port") -WorkingDirectory $root
  }
}

try {
  $ready = $false
  if ($useExistingServer) {
    $ready = $true
  } else {
    for ($i = 0; $i -lt 90; $i++) {
      if ($devProc -and $devProc.HasExited) {
        throw "Dev server process exited early. Check .next/dev/lock and retry."
      }
      Start-Sleep -Seconds 2
      if (Test-HttpReady -HealthUrl $healthUrl) {
        $ready = $true
        break
      }
    }
  }

  if (-not $ready) {
    throw "Dev server did not become ready: $healthUrl"
  }

  Write-Host ""
  Write-Host "=== Auto Drilldown Session Started ==="
  Write-Host "Target URL: http://localhost:$Port$Url"
  Write-Host "Mode: $Mode"
  Write-Host "Session Dir: $sessionDir"
  Write-Host "Using existing server: $useExistingServer"
  Write-Host ""

  $nodeArgs = @(
    "scripts/perf-drilldown-auto.mjs",
    "--baseUrl", "http://localhost:$Port",
    "--route", $Url,
    "--outDir", $sessionDir
  )
  if ($Headed) {
    $nodeArgs += "--headed=true"
  }

  & node $nodeArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Auto drilldown node runner failed with exit code: $LASTEXITCODE"
  }

  Write-Host ""
  Write-Host "Auto drilldown completed."
  Write-Host "Check artifacts in: $sessionDir"
}
finally {
  if (-not $useExistingServer) {
    if ($devProc -and -not $devProc.HasExited) {
      Stop-Process -Id $devProc.Id -Force
    }
    Stop-ProcessOnPort -TargetPort $Port
  }
  Write-Host ""
  Write-Host "Session finished. Artifacts directory:"
  Write-Host $sessionDir
}
