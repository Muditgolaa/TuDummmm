package com.tudummmm.interview.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSessionRequest(
        @NotBlank String jobTitle,
        String company,
        @NotBlank String jobDescription
) {}