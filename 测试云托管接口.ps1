# 测试云托管各个接口
$baseUrl = "https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com"

Write-Host "=== 测试云托管接口 ===" -ForegroundColor Cyan
Write-Host ""

# 测试 1: 健康检查（根路径）
Write-Host "1. 测试根路径..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET -ErrorAction SilentlyContinue
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   响应: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Gray
} catch {
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 2: API 根路径
Write-Host "2. 测试 /api 路径..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api" -Method GET -ErrorAction SilentlyContinue
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   响应: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Gray
} catch {
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 测试 3: 文件上传接口
Write-Host "3. 测试 /api/files/upload 路径..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/files/upload" -Method POST -ErrorAction SilentlyContinue
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   响应: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "   状态码: $statusCode" -ForegroundColor $(if ($statusCode -eq 404) { "Red" } else { "Yellow" })
    Write-Host "   响应: $responseBody" -ForegroundColor Gray
}
Write-Host ""

# 测试 4: 查看所有接口映射
Write-Host "4. 测试 /actuator/mappings （如果有的话）..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/actuator/mappings" -Method GET -ErrorAction SilentlyContinue
    Write-Host "   状态码: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    $fileMappings = $json.contexts.application.mappings.dispatcherServlets.dispatcherServlet | Where-Object { $_.predicate -like "*files*" }
    if ($fileMappings) {
        Write-Host "   找到文件相关映射:" -ForegroundColor Green
        $fileMappings | ForEach-Object {
            Write-Host "     - $($_.predicate)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   未找到文件相关映射" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Actuator 不可用（这是正常的）" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== 诊断建议 ===" -ForegroundColor Cyan
Write-Host "如果 /api/files/upload 返回 404，可能的原因："
Write-Host "1. FileController 没有被扫描到"
Write-Host "2. 应用启动时出错，部分 Controller 未加载"
Write-Host "3. 云托管部署的不是最新的 JAR 包"
Write-Host ""
Write-Host "请查看云托管 020 版本的实例日志，搜索："
Write-Host "  - 'Started IdolDiaryApplication' (应用启动成功)"
Write-Host "  - 'FileController' (Controller 是否被加载)"
Write-Host "  - 'Mapped \"{[/api/files/upload]' (路由映射)"
