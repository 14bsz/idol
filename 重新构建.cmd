@echo off
chcp 65001 >nul
echo === 重新构建项目 ===
echo.
echo 正在进入 backend 目录...
cd /d "%~dp0backend"
if not exist pom.xml (
    echo 错误：找不到 pom.xml 文件
    echo 当前目录：%CD%
    pause
    exit /b 1
)
echo 当前目录：%CD%
echo.
echo 正在清理 target 目录...
if exist target (
    rd /s /q target 2>nul
    timeout /t 2 /nobreak >nul
)
echo.
echo 正在构建项目...
call mvn package -DskipTests
echo.
if exist target\idol-diary-backend-1.0.0.jar (
    echo === 构建成功！===
    echo.
    echo 正在复制 JAR 到 cloud-deploy...
    copy /y target\idol-diary-backend-1.0.0.jar ..\cloud-deploy\app.jar
    if %ERRORLEVEL% == 0 (
        echo.
        echo === 完成！===
        echo.
        echo 下一步：
        echo 1. 删除旧的 cloud-deploy.zip
        echo 2. 重新压缩 cloud-deploy 文件夹为 ZIP
        echo 3. 上传到云托管
        echo 4. 等待部署完成后测试
    ) else (
        echo.
        echo 复制失败！
    )
) else (
    echo.
    echo === 构建失败！===
    echo 请检查上面的错误信息
)
echo.
pause
