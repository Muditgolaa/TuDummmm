package com.tudummmm.interview.dto;

import java.util.List;

public record ReportResponse(
        SessionResponse session,
        List<Item> items,
        Stats stats
) {
    public record Item(QuestionResponse question, AnswerResponse answer) {}
    public record Stats(int answered, int total, Integer avgScore) {}
}