package com.idoldiary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.idoldiary.entity.Diary;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DiaryMapper extends BaseMapper<Diary> {
}