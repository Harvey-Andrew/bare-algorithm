param(
  [string]$OutDir = "docs/performance/baseline",
  [int]$Port = 3000,
  [ValidateSet("dev", "prod")]
  [string]$Mode = "prod"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$outPath = Join-Path $root "$OutDir/$timestamp"

New-Item -ItemType Directory -Path $outPath -Force | Out-Null

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

$pnpmRunner = Resolve-PnpmRunner

function Invoke-PnpmRunner([string[]]$CommandArgs) {
  & $pnpmRunner.FilePath @($pnpmRunner.PrefixArgs + $CommandArgs)
}

function Start-PnpmRunnerProcess([string[]]$CommandArgs, [string]$WorkingDirectory) {
  return Start-Process -FilePath $pnpmRunner.FilePath -ArgumentList @($pnpmRunner.PrefixArgs + $CommandArgs) -WorkingDirectory $WorkingDirectory -PassThru
}

Stop-ProcessOnPort -TargetPort $Port

if ($Mode -eq "prod") {
  Write-Host "Building production bundle..."
  Invoke-PnpmRunner -CommandArgs @("exec", "next", "build")
  if ($LASTEXITCODE -ne 0) {
    throw "next build failed with exit code: $LASTEXITCODE"
  }
  $devProc = Start-PnpmRunnerProcess -CommandArgs @("exec", "next", "start", "--port", "$Port") -WorkingDirectory $root
} else {
  $devProc = Start-PnpmRunnerProcess -CommandArgs @("exec", "next", "dev", "--port", "$Port") -WorkingDirectory $root
}

try {
  $ready = $false
  $healthUrl = "http://localhost:$Port"
  for ($i = 0; $i -lt 90; $i++) {
    Start-Sleep -Seconds 2
    try {
      $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
        $ready = $true
        break
      }
    } catch {
      # wait until ready
    }
  }

  if (-not $ready) {
    throw "$Mode server did not become ready: $healthUrl"
  }

  $routes = @(
    @{ Name = "home"; Url = "http://localhost:$Port/" },
    @{ Name = "problems"; Url = "http://localhost:$Port/problems" },
    @{ Name = "category-array"; Url = "http://localhost:$Port/problems/array" },
    @{ Name = "problem-two-sum"; Url = "http://localhost:$Port/problems/array/two-sum" }
  )

  $successCount = 0
  $failedRoutes = @()

  foreach ($route in $routes) {
    $jsonFile = Join-Path $outPath ($route.Name + ".json")
    Write-Host "Running Lighthouse for: $($route.Name) -> $($route.Url)"

    $maxRetries = 3
    $retryCount = 0
    $success = $false

    while ($retryCount -lt $maxRetries -and -not $success) {
      npx --yes lighthouse $route.Url `
        --output json `
        --output-path $jsonFile `
        --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage" `
        --only-categories=performance `
        --emulated-form-factor=mobile `
        --throttling-method=simulate

      if ($LASTEXITCODE -eq 0) {
        $success = $true
      } else {
        $retryCount++
        Write-Warning "Lighthouse failed for route: $($route.Name) (exit code: $LASTEXITCODE). Retry $retryCount of $maxRetries..."
        Start-Sleep -Seconds 5
      }
    }

    if (-not $success) {
      Write-Warning "Lighthouse ultimately failed for route: $($route.Name) after $maxRetries attempts."
      $failedRoutes += $route.Name
      continue
    }

    if (-not (Test-Path $jsonFile)) {
      Write-Warning "Lighthouse produced no output for route: $($route.Name)"
      $failedRoutes += $route.Name
      continue
    }

    $fileSize = (Get-Item $jsonFile).Length
    if ($fileSize -lt 1024) {
      Write-Warning "Lighthouse output suspiciously small for route: $($route.Name) ($fileSize bytes)"
      $failedRoutes += $route.Name
      continue
    }

    $successCount += 1
    Write-Host "  OK: $jsonFile ($fileSize bytes)"
  }

  Write-Host ""
  if ($failedRoutes.Count -gt 0) {
    throw "Lighthouse completed with errors. Failed routes: $($failedRoutes -join ', '). Success: $successCount/$($routes.Count)"
  }

  Write-Host "Lighthouse completed successfully: $outPath ($successCount/$($routes.Count) routes, mode=$Mode)"
  Write-Host "Verify: check that $outPath contains $($routes.Count) .json files"
}
finally {
  if ($devProc -and -not $devProc.HasExited) {
    Stop-Process -Id $devProc.Id -Force
  }
  Stop-ProcessOnPort -TargetPort $Port
}
