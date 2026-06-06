package com.idoldiary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.idoldiary.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}