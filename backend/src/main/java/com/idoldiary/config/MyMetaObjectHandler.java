package com.idoldiary.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    private static final ZoneId CHINA_ZONE = ZoneId.of("Asia/Shanghai");
    
    @Override
    public void insertFill(MetaObject metaObject) {
        // 使用中国时区的当前时间
        LocalDateTime now = LocalDateTime.now(CHINA_ZONE);
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, now);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        // 使用中国时区的当前时间
        LocalDateTime now = LocalDateTime.now(CHINA_ZONE);
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, now);
    }
}
