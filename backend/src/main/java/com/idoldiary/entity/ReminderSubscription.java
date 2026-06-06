package com.idoldiary.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("reminder_subscription")
public class ReminderSubscription {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long idolId;

    private String sourceKey;

    private String sourceType;

    private String title;

    private Integer remindMonth;

    private Integer remindDay;

    private String templateId;

    private Integer status;

    private LocalDateTime lastSubscribedAt;

    private Integer lastSentYear;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
