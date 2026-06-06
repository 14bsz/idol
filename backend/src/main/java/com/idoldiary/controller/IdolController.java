package com.idoldiary.controller;

import com.idoldiary.common.Result;
import com.idoldiary.entity.Idol;
import com.idoldiary.service.IdolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/idols")
@RequiredArgsConstructor
public class IdolController {

    private final IdolService idolService;

    @GetMapping
    public Result<List<Idol>> listIdols() {
        List<Idol> idols = idolService.listByCurrentUser();
        return Result.success(idols);
    }

    @GetMapping("/{id}")
    public Result<Idol> getIdol(@PathVariable Long id) {
        Idol idol = idolService.getByIdolId(id);
        return Result.success(idol);
    }

    @PostMapping
    public Result<Idol> createIdol(@RequestBody Idol idol) {
        Idol created = idolService.createIdol(idol);
        return Result.success(created);
    }

    @PutMapping("/{id}")
    public Result<Idol> updateIdol(@PathVariable Long id, @RequestBody Idol idol) {
        // #region debug-point F:update-idol-request
        debugReport("F", "IdolController.updateIdol", "update idol request", "{\"id\":" + id + ",\"name\":\"" + esc(idol.getName()) + "\",\"bannerLen\":" + (idol.getBannerImage() == null ? 0 : idol.getBannerImage().length()) + ",\"avatarLen\":" + (idol.getAvatar() == null ? 0 : idol.getAvatar().length()) + "}");
        // #endregion
        try {
            idol.setId(id);
            Idol updated = idolService.updateIdol(idol);
            return Result.success(updated);
        } catch (Exception ex) {
            // #region debug-point G:update-idol-error
            debugReport("G", "IdolController.updateIdol", "update idol exception", "{\"id\":" + id + ",\"error\":\"" + esc(ex.toString()) + "\"}");
            // #endregion
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteIdol(@PathVariable Long id) {
        idolService.deleteIdol(id);
        return Result.success();
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
}
