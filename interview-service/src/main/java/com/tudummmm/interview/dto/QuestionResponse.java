package com.tudummmm.interview.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tudummmm.interview.model.Question;

public record QuestionResponse(
        @JsonProperty("_id") String id,
        String content,
        String category,
        String difficulty,
        int order
) {
    public static QuestionResponse from(Question q) {
        return new QuestionResponse(
                q.getId().toString(),
                q.getContent(),
                q.getCategory(),
                q.getDifficulty(),
                q.getOrderIndex()
        );
    }
}