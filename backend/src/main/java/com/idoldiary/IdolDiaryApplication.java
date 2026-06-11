package com.idoldiary;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.idoldiary.mapper")
public class IdolDiaryApplication {
    
    @PostConstruct
    void started() {
        // 设置应用默认时区为东八区（中国大陆时间）
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Shanghai"));
    }
    
    public static void main(String[] args) {
        SpringApplication.run(IdolDiaryApplication.class, args);
    }
}
