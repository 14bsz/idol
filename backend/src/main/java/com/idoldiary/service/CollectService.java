package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.idoldiary.entity.Collect;
import com.idoldiary.mapper.CollectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CollectService extends ServiceImpl<CollectMapper, Collect> {

    public List<Collect> listByCurrentUser(Long idolId, String category) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Collect> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Collect::getUserId, userId);
        if (idolId != null) {
            wrapper.eq(Collect::getIdolId, idolId);
        }
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Collect::getCategory, category);
        }
        wrapper.orderByDesc(Collect::getCreatedAt);
        return this.list(wrapper);
    }

    public Collect getByCollectId(Long collectId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Collect> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Collect::getId, collectId);
        wrapper.eq(Collect::getUserId, userId);
        return this.getOne(wrapper);
    }

    public Collect createCollect(Collect collect) {
        Long userId = StpUtil.getLoginIdAsLong();
        collect.setUserId(userId);
        if (collect.getCreatedAt() == null) {
            collect.setCreatedAt(LocalDate.now());
        }
        this.save(collect);
        return collect;
    }

    public Collect updateCollect(Collect collect) {
        Long userId = StpUtil.getLoginIdAsLong();
        collect.setUserId(userId);
        this.updateById(collect);
        return this.getById(collect.getId());
    }

    public void deleteCollect(Long collectId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Collect> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Collect::getId, collectId);
        wrapper.eq(Collect::getUserId, userId);
        this.remove(wrapper);
    }
}
