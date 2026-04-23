$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = [System.IO.Path]::GetFullPath((Join-Path $workspaceRoot '..\AUT2Services'))
$backendProject = Join-Path $backendRoot 'src\AUT2Services.Services.API\AUT2Services.Services.API.csproj'
$frontendPackage = Join-Path $workspaceRoot 'package.json'

if (-not (Test-Path $backendProject)) {
    throw "No se encontro el proyecto backend en '$backendProject'."
}

if (-not (Test-Path $frontendPackage)) {
    throw "No se encontro package.json en '$workspaceRoot'."
}

$backendCommand = @(
    "Set-Location '$backendRoot'"
    "Write-Host 'Iniciando AUT2Services en http://localhost:5002' -ForegroundColor Cyan"
    "dotnet run --project '$backendProject'"
) -join '; '

Start-Process -FilePath 'powershell.exe' `
    -WorkingDirectory $backendRoot `
    -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', $backendCommand
    ) | Out-Null

Write-Host 'Backend iniciado en una nueva ventana PowerShell.' -ForegroundColor Green
Write-Host 'Iniciando frontend Angular en http://localhost:4210' -ForegroundColor Cyan

Set-Location $workspaceRoot
npm start
