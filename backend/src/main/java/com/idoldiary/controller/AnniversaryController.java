package com.idoldiary.controller;

import com.idoldiary.common.Result;
import com.idoldiary.entity.Anniversary;
import com.idoldiary.service.AnniversaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/anniversaries")
@RequiredArgsConstructor
public class AnniversaryController {

    private final AnniversaryService anniversaryService;

    @GetMapping
    public Result<List<Anniversary>> listAnniversaries(@RequestParam(required = false) Long idolId) {
        List<Anniversary> anniversaries = anniversaryService.listByCurrentUser(idolId);
        return Result.success(anniversaries);
    }

    @GetMapping("/{id}")
    public Result<Anniversary> getAnniversary(@PathVariable Long id) {
        Anniversary anniversary = anniversaryService.getByAnniversaryId(id);
        return Result.success(anniversary);
    }

    @PostMapping
    public Result<Anniversary> createAnniversary(@RequestBody Anniversary anniversary) {
        try {
            debugReport("A", "AnniversaryController.createAnniversary", "create anniversary request", 
                "{\"title\":\"" + esc(anniversary.getTitle()) + "\",\"date\":\"" + esc(anniversary.getDate() != null ? anniversary.getDate().toString() : "null") + "\",\"idolId\":" + anniversary.getIdolId() + "}");
        } catch (Exception e) {
            debugReport("B", "AnniversaryController.createAnniversary", "debug error", "{\"error\":\"" + esc(e.toString()) + "\"}");
        }
        
        try {
            Anniversary created = anniversaryService.createAnniversary(anniversary);
            return Result.success(created);
        } catch (Exception ex) {
            debugReport("C", "AnniversaryController.createAnniversary", "create exception", "{\"error\":\"" + esc(ex.toString()) + "\"}");
            throw ex;
        }
    }

    @PutMapping("/{id}")
    public Result<Anniversary> updateAnniversary(@PathVariable Long id, @RequestBody Anniversary anniversary) {
        anniversary.setId(id);
        Anniversary updated = anniversaryService.updateAnniversary(anniversary);
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteAnniversary(@PathVariable Long id) {
        anniversaryService.deleteAnniversary(id);
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
