@echo off
chcp 65001 >nul
echo === 更新 cloud-deploy/app.jar 中的 FileController ===
echo.

cd /d "%~dp0"

echo 步骤 1：备份原 JAR
if exist "cloud-deploy\app.jar.bak" (
    del /q "cloud-deploy\app.jar.bak"
)
copy "cloud-deploy\app.jar" "cloud-deploy\app.jar.bak" >nul
echo   已备份到 app.jar.bak
echo.

echo 步骤 2：更新 FileController.class
jar -uf "cloud-deploy\app.jar" -C "backend\target\classes" com/idoldiary/controller/FileController.class
if %ERRORLEVEL% == 0 (
    echo   ✓ 更新成功！
) else (
    echo   ✗ 更新失败！
    echo   可能是文件被占用，请关闭所有程序后重试
    pause
    exit /b 1
)
echo.

echo 步骤 3：验证更新
jar -tf "cloud-deploy\app.jar" | findstr "FileController.class"
echo.

echo === 完成！===
echo.
echo 下一步：
echo 1. 删除旧的 cloud-deploy.zip
echo 2. 重新压缩 cloud-deploy 文件夹为 ZIP
echo 3. 上传到云托管并部署
echo 4. 测试: curl https://springboot-xxpl-267159-8-1440827759.sh.run.tcloudbase.com/api/files/test
echo.
pause
