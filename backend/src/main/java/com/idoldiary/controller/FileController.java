package com.idoldiary.controller;

import com.idoldiary.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    @PostMapping("/upload")
    public Result<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return Result.error("文件不能为空");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";

            String datePath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String uuid = UUID.randomUUID().toString();
            String newFilename = uuid + extension;

            String relativePath = datePath + "/" + newFilename;
            String basePath = System.getProperty("user.dir");
            Path filePath = resolveUploadRoot().resolve(relativePath).normalize();

            Files.createDirectories(filePath.getParent());
            file.transferTo(filePath.toFile());

            String fileUrl = "/uploads/" + relativePath;

            // #region debug-point E:upload-save
            debugReport("E", "FileController.uploadFile", "upload saved", "{\"basePath\":\"" + esc(basePath) + "\",\"uploadPath\":\"" + esc(uploadPath) + "\",\"relativePath\":\"" + esc(relativePath) + "\",\"filePath\":\"" + esc(filePath.toAbsolutePath().toString()) + "\",\"exists\":" + Files.exists(filePath) + ",\"fileUrl\":\"" + esc(fileUrl) + "\"}");
            // #endregion
            
            Map<String, String> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("filename", newFilename);

            return Result.success(result);
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    @PostMapping("/upload-from-cloud")
    public Result<Map<String, String>> uploadFromCloud(@RequestBody Map<String, String> request) {
        try {
            String fileID = request.get("fileID");
            if (fileID == null || fileID.isEmpty()) {
                return Result.error("fileID不能为空");
            }

            Map<String, String> result = new HashMap<>();
            result.put("url", fileID);
            result.put("filename", fileID);

            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("文件处理失败: " + e.getMessage());
        }
    }

    private void debugReport(String hypothesisId, String location, String msg, String dataJson) {
        try {
            URL url = new URL("http://127.0.0.1:7777/event");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            String body = "{\"sessionId\":\"image-static-500\",\"runId\":\"post-fix\",\"hypothesisId\":\"" + esc(hypothesisId) + "\",\"location\":\"" + esc(location) + "\",\"msg\":\"[DEBUG] " + esc(msg) + "\",\"data\":" + dataJson + "}";
            try (OutputStream os = conn.getOutputStream()) {
                os.write(body.getBytes(StandardCharsets.UTF_8));
            }
            conn.getResponseCode();
            conn.disconnect();
        } catch (Exception ignored) {
        }
    }

    private String esc(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private Path resolveUploadRoot() {
        Path currentDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path configuredPath = Paths.get(uploadPath);
        if (configuredPath.isAbsolute()) {
            return configuredPath.normalize();
        }
        Path projectRoot = currentDir.getFileName() != null && "backend".equalsIgnoreCase(currentDir.getFileName().toString())
                ? currentDir.getParent()
                : currentDir;
        return projectRoot.resolve(configuredPath).normalize();
    }
}
