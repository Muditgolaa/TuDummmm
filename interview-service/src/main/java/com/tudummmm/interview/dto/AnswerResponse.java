package com.tudummmm.interview.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tudummmm.interview.model.Answer;

public record AnswerResponse(
        @JsonProperty("_id") String id,
        Integer score,
        String feedback,
        String content,
        int timeSpentSeconds
) {
    public static AnswerResponse from(Answer a) {
        return new AnswerResponse(
                a.getId().toString(),
                a.getScore(),
                a.getFeedback(),
                a.getContent(),
                a.getTimeSpentSeconds()
        );
    }
}