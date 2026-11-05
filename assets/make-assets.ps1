# ============================================================
# make-assets.ps1
# Gera assets PNG locais (favicon, logo ON e logos de clientes)
# usando System.Drawing. Use este script apenas se você NÃO tiver
# os PNGs originais extraídos da referência.
#
# Para substituir pelos logos ORIGINAIS da ON Solutions, basta
# sobrescrever os arquivos em assets/icons e assets/images com os
# PNGs reais mantendo os mesmos nomes.
# ============================================================
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$icons = Join-Path $root "icons"
$images = Join-Path $root "images"
New-Item -ItemType Directory -Force -Path $icons  | Out-Null
New-Item -ItemType Directory -Force -Path $images | Out-Null

$ink  = [System.Drawing.ColorTranslator]::FromHtml("#0B1220")
$teal = [System.Drawing.ColorTranslator]::FromHtml("#0D9488")
$mint = [System.Drawing.ColorTranslator]::FromHtml("#5EEAD4")
$navy = [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
$slate= [System.Drawing.ColorTranslator]::FromHtml("#334155")

function New-RoundedRectPath([System.Drawing.RectangleF]$r, [float]$rad) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $rad * 2
    $p.AddArc($r.X, $r.Y, $d, $d, 180, 90)
    $p.AddArc($r.Right - $d, $r.Y, $d, $d, 270, 90)
    $p.AddArc($r.Right - $d, $r.Bottom - $d, $d, $d, 0, 90)
    $p.AddArc($r.X, $r.Bottom - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

# ---- Logo ON (quadrado arredondado, gradiente teal, "ON") ----
function Make-Logo([int]$size, [string]$out) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear([System.Drawing.Color]::Transparent)
    $pad = [float]($size * 0.06)
    $rect = New-Object System.Drawing.RectangleF($pad, $pad, ($size - 2*$pad), ($size - 2*$pad))
    $path = New-RoundedRectPath $rect ([float]($size * 0.22))
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $teal, $navy, 135.0)
    $g.FillPath($brush, $path)
    $fontSize = [float]($size * 0.40)
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
    $tbrush = New-Object System.Drawing.SolidBrush($mint)
    $g.DrawString("ON", $font, $tbrush, $rect, $sf)
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

Make-Logo 192 (Join-Path $icons  "logo-on.png")
Make-Logo 96  (Join-Path $root   "favicon.png")

# ---- Chips de clientes (wordmark em fundo branco) ----
function Make-Chip([string]$text, [string]$out) {
    $w = 272; $h = 84
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.Clear([System.Drawing.Color]::White)
    $font = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
    $brush = New-Object System.Drawing.SolidBrush($slate)
    $rect = New-Object System.Drawing.RectangleF(0, 0, $w, $h)
    $g.DrawString($text, $font, $brush, $rect, $sf)
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

Make-Chip "Braziliana"  (Join-Path $images "cliente-braziliana.png")
Make-Chip "Quatri"      (Join-Path $images "cliente-quatri.png")
Make-Chip "Brooks"      (Join-Path $images "cliente-brooks.png")
Make-Chip "CrossHR"     (Join-Path $images "cliente-crosshr.png")
Make-Chip "MultiLife"   (Join-Path $images "cliente-multilife.png")
Make-Chip "Mafedo"      (Join-Path $images "cliente-mafedo.png")

Write-Host "Assets gerados em assets/icons e assets/images."
