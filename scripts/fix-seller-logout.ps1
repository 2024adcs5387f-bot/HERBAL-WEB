$path = 'c:\Users\Elvisengs\Desktop\web-app\HERBAL-WEB\public\Seller.html'
if (-not (Test-Path -LiteralPath $path)) { Write-Error "Seller.html not found at $path"; exit 1 }

# Read content
$content = Get-Content -LiteralPath $path -Raw

# 1) Add id="logout-btn" to the sidebar logout link (icon: fa-sign-out-alt)
$updated = [System.Text.RegularExpressions.Regex]::Replace(
    $content,
    '<a\s+href="#"\s*>\s*<i\s+class="fas fa-sign-out-alt"',
    '<a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

# 2) Ensure seller-logout.js is included once before </body>
if ($updated -notmatch 'src="/js/seller-logout\.js"') {
  $scriptTag = "`n<script src=\"/js/seller-logout.js\"></script>`n"
  $endIdx = $updated.LastIndexOf('</body>')
  if ($endIdx -ge 0) {
    $updated = $updated.Insert($endIdx, $scriptTag)
  } else {
    Write-Error 'No </body> tag found in Seller.html.'
    exit 2
  }
}

# 3) Write back
[System.IO.File]::WriteAllText($path, $updated, [System.Text.Encoding]::UTF8)
Write-Output 'Updated logout anchor and ensured seller-logout.js include.'
