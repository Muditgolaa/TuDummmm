package com.tudummmm.interview.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitAnswerRequest(
        @NotBlank String content,
        Integer timeSpentSeconds
) {}