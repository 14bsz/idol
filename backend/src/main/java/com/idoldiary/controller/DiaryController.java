package com.idoldiary.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.idoldiary.common.Result;
import com.idoldiary.entity.Diary;
import com.idoldiary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public Result<List<Diary>> listDiaries(@RequestParam(required = false) Long idolId) {
        log.info("[DiaryController] listDiaries request - idolId={}", idolId);
        List<Diary> diaries = diaryService.listByCurrentUser(idolId);
        return Result.success(diaries);
    }

    @GetMapping("/{id}")
    public Result<Diary> getDiary(@PathVariable Long id) {
        log.info("[DiaryController] getDiary request - id={}", id);
        Diary diary = diaryService.getByDiaryId(id);
        return Result.success(diary);
    }

    @PostMapping
    public Result<Diary> createDiary(@RequestBody JsonNode json) {
        log.info("[DiaryController] createDiary raw request - {}", json.toString());
        try {
            Diary diary = new Diary();
            if (json.has("idolId") && !json.get("idolId").isNull()) {
                diary.setIdolId(json.get("idolId").asLong());
            }
            if (json.has("content")) {
                diary.setContent(json.get("content").asText());
            }
            if (json.has("mood")) {
                diary.setMood(json.get("mood").asText());
            }
            if (json.has("template")) {
                diary.setTemplate(json.get("template").asText());
            }
            if (json.has("tags")) {
                try {
                    diary.setTags(objectMapper.writeValueAsString(json.get("tags")));
                } catch (Exception e) {
                    diary.setTags("[]");
                }
            } else {
                diary.setTags("[]");
            }
            if (json.has("images")) {
                try {
                    diary.setImages(objectMapper.writeValueAsString(json.get("images")));
                } catch (Exception e) {
                    diary.setImages("[]");
                }
            } else {
                diary.setImages("[]");
            }
            Diary created = diaryService.createDiary(diary);
            log.info("[DiaryController] createDiary success - createdId={}", created.getId());
            return Result.success(created);
        } catch (Exception ex) {
            log.error("[DiaryController] createDiary error", ex);
            throw ex;
        }
    }

    @PutMapping("/{id}")
    public Result<Diary> updateDiary(@PathVariable Long id, @RequestBody JsonNode json) {
        log.info("[DiaryController] updateDiary raw request - id={}, body={}", id, json.toString());
        try {
            Diary diary = diaryService.getByDiaryId(id);
            if (diary == null) {
                throw new RuntimeException("Diary not found");
            }
            if (json.has("idolId") && !json.get("idolId").isNull()) {
                diary.setIdolId(json.get("idolId").asLong());
            }
            if (json.has("content")) {
                diary.setContent(json.get("content").asText());
            }
            if (json.has("mood")) {
                diary.setMood(json.get("mood").asText());
            }
            if (json.has("template")) {
                diary.setTemplate(json.get("template").asText());
            }
            if (json.has("tags")) {
                diary.setTags(objectMapper.writeValueAsString(json.get("tags")));
            }
            if (json.has("images")) {
                diary.setImages(objectMapper.writeValueAsString(json.get("images")));
            }
            Diary updated = diaryService.updateDiary(diary);
            return Result.success(updated);
        } catch (com.fasterxml.jackson.core.JsonProcessingException jpe) {
            log.error("[DiaryController] updateDiary JSON processing error", jpe);
            throw new RuntimeException("JSON processing error", jpe);
        } catch (Exception ex) {
            log.error("[DiaryController] updateDiary error", ex);
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDiary(@PathVariable Long id) {
        log.info("[DiaryController] deleteDiary request - id={}", id);
        try {
            diaryService.deleteDiary(id);
            return Result.success();
        } catch (Exception ex) {
            log.error("[DiaryController] deleteDiary error", ex);
            throw ex;
        }
    }

    @PutMapping("/{id}/pin")
    public Result<Diary> togglePinDiary(@PathVariable Long id, @RequestBody JsonNode json) {
        log.info("[DiaryController] togglePinDiary request - id={}, body={}", id, json.toString());
        try {
            Diary diary = diaryService.getByDiaryId(id);
            if (diary == null) {
                throw new RuntimeException("Diary not found");
            }
            // 从请求体获取 pinned 值
            Integer pinned = 0;
            if (json.has("pinned") && !json.get("pinned").isNull()) {
                pinned = json.get("pinned").asInt();
            }
            diary.setPinned(pinned);
            Diary updated = diaryService.updateDiary(diary);
            log.info("[DiaryController] togglePinDiary success - id={}, pinned={}", id, pinned);
            return Result.success(updated);
        } catch (Exception ex) {
            log.error("[DiaryController] togglePinDiary error", ex);
            throw ex;
        }
    }
}
