package com.idoldiary.service;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.idoldiary.entity.Collect;
import com.idoldiary.entity.CollectionCategory;
import com.idoldiary.mapper.CollectMapper;
import com.idoldiary.mapper.CollectionCategoryMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionCategoryService extends ServiceImpl<CollectionCategoryMapper, CollectionCategory> {

    private static final List<String> DEFAULT_CATEGORIES = Arrays.asList("神图", "小卡", "物料", "语录", "线下");

    private final CollectMapper collectMapper;

    public CollectionCategoryService(CollectMapper collectMapper) {
        this.collectMapper = collectMapper;
    }

    public List<String> listByCurrentUser(Long idolId) {
        if (idolId == null) {
            throw new IllegalArgumentException("爱豆ID不能为空");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        LinkedHashSet<String> mergedCategories = new LinkedHashSet<>(DEFAULT_CATEGORIES);

        LambdaQueryWrapper<CollectionCategory> categoryWrapper = new LambdaQueryWrapper<>();
        categoryWrapper.eq(CollectionCategory::getUserId, userId)
                .eq(CollectionCategory::getIdolId, idolId)
                .orderByAsc(CollectionCategory::getSortOrder)
                .orderByAsc(CollectionCategory::getId);
        this.list(categoryWrapper).stream()
                .map(CollectionCategory::getName)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .forEach(mergedCategories::add);

        LambdaQueryWrapper<Collect> collectWrapper = new LambdaQueryWrapper<>();
        collectWrapper.eq(Collect::getUserId, userId)
                .eq(Collect::getIdolId, idolId)
                .orderByAsc(Collect::getId);
        collectMapper.selectList(collectWrapper).stream()
                .map(Collect::getCategory)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .forEach(mergedCategories::add);

        return mergedCategories.stream().collect(Collectors.toList());
    }

    public List<String> createCategory(Long idolId, String name) {
        if (idolId == null) {
            throw new IllegalArgumentException("爱豆ID不能为空");
        }

        String normalizedName = normalizeCategoryName(name);
        List<String> currentCategories = listByCurrentUser(idolId);
        if (currentCategories.contains(normalizedName)) {
            throw new IllegalArgumentException("该分类已存在");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        CollectionCategory category = new CollectionCategory();
        category.setUserId(userId);
        category.setIdolId(idolId);
        category.setName(normalizedName);
        category.setSortOrder(currentCategories.size());
        this.save(category);

        return listByCurrentUser(idolId);
    }

    private String normalizeCategoryName(String name) {
        if (!StringUtils.hasText(name)) {
            throw new IllegalArgumentException("分类名称不能为空");
        }

        String normalizedName = name.trim();
        if (normalizedName.length() > 12) {
            throw new IllegalArgumentException("分类名称最多12个字");
        }
        if ("全部".equals(normalizedName)) {
            throw new IllegalArgumentException("分类名称不能使用“全部”");
        }
        return normalizedName;
    }
}
