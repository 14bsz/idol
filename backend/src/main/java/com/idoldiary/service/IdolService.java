package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.idoldiary.entity.Idol;
import com.idoldiary.mapper.IdolMapper;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class IdolService extends ServiceImpl<IdolMapper, Idol> {

    public List<Idol> listByCurrentUser() {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Idol> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Idol::getUserId, userId);
        wrapper.orderByDesc(Idol::getCreateTime);
        return this.list(wrapper);
    }

    public Idol getByIdolId(Long idolId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Idol> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Idol::getId, idolId);
        wrapper.eq(Idol::getUserId, userId);
        return this.getOne(wrapper);
    }

    public Idol createIdol(Idol idol) {
        Long userId = StpUtil.getLoginIdAsLong();
        idol.setUserId(userId);
        this.save(idol);
        return idol;
    }

    public Idol updateIdol(Idol idol) {
        Long userId = StpUtil.getLoginIdAsLong();
        idol.setUserId(userId);
        // #region debug-point H:update-idol-service
        debugReport("H", "IdolService.updateIdol", "before updateById", "{\"id\":" + idol.getId() + ",\"userId\":" + userId + ",\"bannerLen\":" + (idol.getBannerImage() == null ? 0 : idol.getBannerImage().length()) + ",\"avatarLen\":" + (idol.getAvatar() == null ? 0 : idol.getAvatar().length()) + "}");
        // #endregion
        boolean updated = this.updateById(idol);
        Idol latest = this.getById(idol.getId());
        // #region debug-point I:update-idol-service-result
        debugReport("I", "IdolService.updateIdol", "after updateById", "{\"id\":" + idol.getId() + ",\"updated\":" + updated + ",\"latestNull\":" + (latest == null) + ",\"latestBannerLen\":" + (latest == null || latest.getBannerImage() == null ? 0 : latest.getBannerImage().length()) + "}");
        // #endregion
        return latest;
    }

    public void deleteIdol(Long idolId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Idol> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Idol::getId, idolId);
        wrapper.eq(Idol::getUserId, userId);
        this.remove(wrapper);
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
