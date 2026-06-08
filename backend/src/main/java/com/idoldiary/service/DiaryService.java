package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.idoldiary.entity.Diary;
import com.idoldiary.mapper.DiaryMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DiaryService extends ServiceImpl<DiaryMapper, Diary> {

    public List<Diary> listByCurrentUser(Long idolId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Diary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Diary::getUserId, userId);
        if (idolId != null) {
            wrapper.eq(Diary::getIdolId, idolId);
        }
        // 先按置顶状态降序（1在前），再按创建时间降序（新的在前），最后按ID降序
        wrapper.orderByDesc(Diary::getPinned);
        wrapper.orderByDesc(Diary::getCreateTime);
        wrapper.orderByDesc(Diary::getId);
        return this.list(wrapper);
    }

    public Diary getByDiaryId(Long diaryId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Diary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Diary::getId, diaryId);
        wrapper.eq(Diary::getUserId, userId);
        return this.getOne(wrapper);
    }

    public Diary createDiary(Diary diary) {
        Long userId = StpUtil.getLoginIdAsLong();
        diary.setUserId(userId);
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(LocalDate.now());
        }
        this.save(diary);
        return diary;
    }

    public Diary updateDiary(Diary diary) {
        Long userId = StpUtil.getLoginIdAsLong();
        diary.setUserId(userId);
        this.updateById(diary);
        return this.getById(diary.getId());
    }

    public void deleteDiary(Long diaryId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Diary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Diary::getId, diaryId);
        wrapper.eq(Diary::getUserId, userId);
        this.remove(wrapper);
    }
}
