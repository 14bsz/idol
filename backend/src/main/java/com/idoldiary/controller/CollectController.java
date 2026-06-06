package com.idoldiary.controller;

import com.idoldiary.common.Result;
import com.idoldiary.entity.Collect;
import com.idoldiary.service.CollectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectController {

    private final CollectService collectService;

    @GetMapping
    public Result<List<Collect>> listCollections(
            @RequestParam(required = false) Long idolId,
            @RequestParam(required = false) String category) {
        List<Collect> collections = collectService.listByCurrentUser(idolId, category);
        return Result.success(collections);
    }

    @GetMapping("/{id}")
    public Result<Collect> getCollection(@PathVariable Long id) {
        Collect collect = collectService.getByCollectId(id);
        return Result.success(collect);
    }

    @PostMapping
    public Result<Collect> createCollection(@RequestBody Collect collect) {
        Collect created = collectService.createCollect(collect);
        return Result.success(created);
    }

    @PutMapping("/{id}")
    public Result<Collect> updateCollection(@PathVariable Long id, @RequestBody Collect collect) {
        collect.setId(id);
        Collect updated = collectService.updateCollect(collect);
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteCollection(@PathVariable Long id) {
        collectService.deleteCollect(id);
        return Result.success();
    }
}
