$baseUrl = "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com"

Write-Host "Testing cloud hosting endpoints..." -ForegroundColor Cyan

# Test upload endpoint
Write-Host "`nTest: POST /api/files/upload" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/files/upload" -Method POST -ErrorAction Stop
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor $(if ($statusCode -eq 404) { "Red" } else { "Yellow" })
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "Response: $body" -ForegroundColor Gray
}
