package com.tudummmm.interview.dto;

public record AnalyticsResponse(
        Integer avgScore,
        Integer bestScore,
        long totalAnswered,
        long totalSessions,
        long completedSessions,
        int completionRate
) {}