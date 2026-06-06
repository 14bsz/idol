package com.idoldiary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.idoldiary.entity.Idol;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IdolMapper extends BaseMapper<Idol> {
}