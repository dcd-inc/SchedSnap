Add-Type -AssemblyName System.Drawing
$reviewRoot = $PSScriptRoot
$exportRoot = Join-Path $reviewRoot 'mobile-1080x2400'
New-Item -ItemType Directory -Path $exportRoot -Force | Out-Null
$sources = @(Get-ChildItem -LiteralPath $reviewRoot -Filter '*.png' | Sort-Object Name)
if ($sources.Count -ne 8) { throw "Expected eight native previews, found $($sources.Count)." }
$manifest = @()
$sheet = New-Object System.Drawing.Bitmap 1120, 1360
$sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
$sheetGraphics.Clear([System.Drawing.Color]::FromArgb(238, 235, 230))
$sheetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$labelFont = New-Object System.Drawing.Font 'Segoe UI', 12
try {
  for ($i = 0; $i -lt $sources.Count; $i++) {
    $source = $sources[$i]
    $img = [System.Drawing.Image]::FromFile($source.FullName)
    try {
      if ([Math]::Abs(($img.Width / $img.Height) / (1080 / 2400) - 1) -gt 0.005) { throw "Aspect ratio mismatch: $($source.Name)" }
      $export = New-Object System.Drawing.Bitmap 1080, 2400
      $graphics = [System.Drawing.Graphics]::FromImage($export)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($img, 0, 0, 1080, 2400)
        $target = Join-Path $exportRoot $source.Name
        $export.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $graphics.Dispose(); $export.Dispose() }
      $x = 24 + ($i % 4) * 274
      $y = 20 + [Math]::Floor($i / 4) * 672
      $sheetGraphics.DrawImage($img, [int]$x, [int]$y, 250, 556)
      $label = $source.BaseName.Replace('-', ' ')
      $sheetGraphics.DrawString($label, $labelFont, [System.Drawing.Brushes]::Black, [single]$x, [single]($y + 568))
      $manifest += [ordered]@{ file = $source.Name; nativeWidth = $img.Width; nativeHeight = $img.Height; exportWidth = 1080; exportHeight = 2400; exportBytes = (Get-Item -LiteralPath $target).Length; sha256 = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash; mode = 'built-in image_gen'; preparation = 'High-quality resampled technical export; native original preserved'; status = 'local-review-only' }
    } finally { $img.Dispose() }
  }
  $sheet.Save((Join-Path $reviewRoot 'contact-sheet.png'), [System.Drawing.Imaging.ImageFormat]::Png)
} finally { $sheetGraphics.Dispose(); $sheet.Dispose(); $labelFont.Dispose() }
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $reviewRoot 'manifest.json') -Encoding utf8
Compress-Archive -Path (Join-Path $exportRoot '*.png') -DestinationPath (Join-Path $reviewRoot 'car-mobile-wallpapers.zip') -Force
Write-Output ($manifest | ConvertTo-Json -Depth 5)
