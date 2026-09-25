package com.tudummmm.interview.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tudummmm.interview.model.Session;

import java.time.Instant;

// JSON shaped to match what the frontend already expects (_id, lowercase status).
public record SessionResponse(
        @JsonProperty("_id") String id,
        String jobTitle,
        String company,
        String jobDescription,
        String status,
        int questionCount,
        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static SessionResponse from(Session s) {
        return new SessionResponse(
                s.getId().toString(),
                s.getJobTitle(),
                s.getCompany(),
                s.getJobDescription(),
                s.getStatus().name().toLowerCase(),
                s.getQuestionCount(),
                s.getCompletedAt(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}