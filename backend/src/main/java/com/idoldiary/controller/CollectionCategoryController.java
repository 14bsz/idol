package com.idoldiary.controller;

import com.idoldiary.common.Result;
import com.idoldiary.dto.CollectionCategoryRequest;
import com.idoldiary.service.CollectionCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/collection-categories")
@RequiredArgsConstructor
public class CollectionCategoryController {

    private final CollectionCategoryService collectionCategoryService;

    @GetMapping
    public Result<List<String>> listCategories(@RequestParam Long idolId) {
        return Result.success(collectionCategoryService.listByCurrentUser(idolId));
    }

    @PostMapping
    public Result<List<String>> createCategory(@RequestBody CollectionCategoryRequest request) {
        return Result.success(collectionCategoryService.createCategory(request.getIdolId(), request.getName()));
    }
}
