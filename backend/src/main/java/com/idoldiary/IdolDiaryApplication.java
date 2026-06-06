package com.idoldiary;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.idoldiary.mapper")
public class IdolDiaryApplication {
    public static void main(String[] args) {
        SpringApplication.run(IdolDiaryApplication.class, args);
    }
}
