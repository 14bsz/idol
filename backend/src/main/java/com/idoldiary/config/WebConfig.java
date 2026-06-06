package com.idoldiary.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.File;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadRoot = resolveUploadRoot();
        String basePath = System.getProperty("user.dir");
        File uploadDir = uploadRoot.toFile();
        String uploadAbsolutePath = uploadDir.getAbsolutePath() + File.separator;

        // #region debug-point A:resource-handler-init
        debugReport("A", "WebConfig.addResourceHandlers", "init resource handler", "{\"basePath\":\"" + esc(basePath) + "\",\"uploadPath\":\"" + esc(uploadPath) + "\",\"uploadAbsolutePath\":\"" + esc(uploadAbsolutePath) + "\",\"exists\":" + uploadDir.exists() + ",\"isDirectory\":" + uploadDir.isDirectory() + "}");
        // #endregion

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath.replace("\\", "/"))
                .resourceChain(false)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws java.io.IOException {
                        // #region debug-point B:resource-resolve
                        debugReport("B", "WebConfig.PathResourceResolver", "resolve upload resource", "{\"resourcePath\":\"" + esc(resourcePath) + "\",\"location\":\"" + esc(location == null ? "null" : String.valueOf(location)) + "\"}");
                        // #endregion
                        try {
                            Resource resource = super.getResource(resourcePath, location);
                            // #region debug-point C:resource-resolve-result
                            debugReport("C", "WebConfig.PathResourceResolver", "resource resolve result", "{\"resourcePath\":\"" + esc(resourcePath) + "\",\"resolved\":" + (resource != null) + ",\"resource\":\"" + esc(resource == null ? "null" : String.valueOf(resource)) + "\"}");
                            // #endregion
                            return resource;
                        } catch (java.io.IOException ex) {
                            // #region debug-point D:resource-resolve-error
                            debugReport("D", "WebConfig.PathResourceResolver", "resource resolve error", "{\"resourcePath\":\"" + esc(resourcePath) + "\",\"error\":\"" + esc(ex.toString()) + "\"}");
                            // #endregion
                            throw ex;
                        }
                    }
                });
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
