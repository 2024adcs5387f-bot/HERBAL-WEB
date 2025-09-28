$path = 'c:\Users\Elvisengs\Desktop\web-app\HERBAL-WEB\public\Seller.html'
if (-not (Test-Path -LiteralPath $path)) { Write-Error "Seller.html not found at $path"; exit 1 }

# Read file
$content = Get-Content -LiteralPath $path -Raw

# Only insert if not already present
if ($content -notmatch 'seller-topbar\.js') {
  $scriptTag = "`n<script src=\"/js/seller-topbar.js\"></script>`n"
  $endIdx = $content.LastIndexOf('</body>')
  if ($endIdx -ge 0) {
    $newContent = $content.Insert($endIdx, $scriptTag)
    [System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)
    Write-Output 'Inserted seller-topbar script tag.'
    exit 0
  } else {
    Write-Error 'No </body> tag found in Seller.html.'
    exit 2
  }
} else {
  Write-Output 'Script tag already present.'
  exit 0
}
