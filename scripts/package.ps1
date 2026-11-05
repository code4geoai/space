$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$root = Split-Path $PSScriptRoot -Parent
$dist = [System.IO.Path]::GetFullPath((Join-Path $root 'dist'))
if ((Split-Path $dist -Parent) -ne $root -or (Split-Path $dist -Leaf) -ne 'dist') { throw 'Unexpected distribution path' }
$archivePath = Join-Path $root 'Digital-Space-Museum-deploy.zip'
$fileStream = [System.IO.File]::Open($archivePath,[System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive $fileStream,([System.IO.Compression.ZipArchiveMode]::Create)
try {
 foreach ($directory in Get-ChildItem -LiteralPath $dist -Recurse -Directory -Force) {
  $relative = $directory.FullName.Substring($dist.Length+1).Replace('\','/') + '/'
  $null = $archive.CreateEntry($relative)
 }
 foreach ($file in Get-ChildItem -LiteralPath $dist -Recurse -File -Force) {
  $relative = $file.FullName.Substring($dist.Length+1).Replace('\','/')
  $entry = $archive.CreateEntry($relative,[System.IO.Compression.CompressionLevel]::Optimal)
  $inputStream = $file.OpenRead()
  $outputStream = $entry.Open()
  try { $inputStream.CopyTo($outputStream) } finally { $inputStream.Dispose(); $outputStream.Dispose() }
 }
} finally { $archive.Dispose(); $fileStream.Dispose() }
Write-Output "Packaged $archivePath"
