package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.idoldiary.entity.Anniversary;
import com.idoldiary.mapper.AnniversaryMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnniversaryService extends ServiceImpl<AnniversaryMapper, Anniversary> {

    public List<Anniversary> listByCurrentUser(Long idolId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Anniversary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Anniversary::getUserId, userId);
        if (idolId != null) {
            wrapper.eq(Anniversary::getIdolId, idolId);
        }
        wrapper.orderByAsc(Anniversary::getDate);
        return this.list(wrapper);
    }

    public Anniversary getByAnniversaryId(Long anniversaryId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Anniversary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Anniversary::getId, anniversaryId);
        wrapper.eq(Anniversary::getUserId, userId);
        return this.getOne(wrapper);
    }

    public Anniversary createAnniversary(Anniversary anniversary) {
        Long userId = StpUtil.getLoginIdAsLong();
        anniversary.setUserId(userId);
        this.save(anniversary);
        return anniversary;
    }

    public Anniversary updateAnniversary(Anniversary anniversary) {
        Long userId = StpUtil.getLoginIdAsLong();
        anniversary.setUserId(userId);
        this.updateById(anniversary);
        return this.getById(anniversary.getId());
    }

    public void deleteAnniversary(Long anniversaryId) {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<Anniversary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Anniversary::getId, anniversaryId);
        wrapper.eq(Anniversary::getUserId, userId);
        this.remove(wrapper);
    }
}
