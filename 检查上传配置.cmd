@echo off
chcp 65001 >nul
echo ========================================
echo 文件上传配置检查工具
echo ========================================
echo.

echo [1/5] 检查本机 IP 地址
echo ----------------------------------------
ipconfig | findstr "IPv4"
echo.

echo [2/5] 检查后端进程
echo ----------------------------------------
netstat -ano | findstr ":8080.*LISTENING"
if %errorlevel% equ 0 (
    echo ✅ 端口 8080 正在监听
) else (
    echo ❌ 端口 8080 未监听，后端可能未启动
    echo    启动命令: cd backend ^&^& mvn spring-boot:run
)
echo.

echo [3/5] 检查防火墙规则
echo ----------------------------------------
netsh advfirewall firewall show rule name="Java Backend 8080" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 防火墙规则已配置
) else (
    echo ⚠️  防火墙规则未配置
    echo    配置命令 ^(需要管理员权限^):
    echo    netsh advfirewall firewall add rule name="Java Backend 8080" dir=in action=allow protocol=TCP localport=8080
)
echo.

echo [4/5] 测试本地接口
echo ----------------------------------------
curl -s -o nul -w "HTTP Status: %%{http_code}" http://127.0.0.1:8080/api/idols 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ 本地接口可访问
) else (
    echo.
    echo ❌ 本地接口不可访问
    echo    请确认后端已启动
)
echo.

echo [5/5] 检查 uploads 目录
echo ----------------------------------------
if exist "backend\uploads" (
    echo ✅ uploads 目录存在
) else (
    echo ⚠️  uploads 目录不存在
    echo    创建命令: mkdir backend\uploads
)
echo.

echo ========================================
echo 检查完成
echo ========================================
echo.
echo 💡 提示：
echo    - 确保手机和电脑在同一 WiFi
echo    - 记下上面的 IPv4 地址
echo    - 在小程序配置中使用该 IP 地址
echo.

pause
