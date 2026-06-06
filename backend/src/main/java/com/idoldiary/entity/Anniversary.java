package com.idoldiary.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;

@TableName("anniversary")
public class Anniversary {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long idolId;

    private String title;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    /**
     * 自定义图标文字
     */
    private String iconText;

    private String color;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getIdolId() { return idolId; }
    public void setIdolId(Long idolId) { this.idolId = idolId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getIconText() { return iconText; }
    public void setIconText(String iconText) { this.iconText = iconText; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}
