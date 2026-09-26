package com.tudummmm.interview.controller;

import com.tudummmm.interview.dto.AnalyticsResponse;
import com.tudummmm.interview.service.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/api/analytics")
    public AnalyticsResponse analytics(Authentication auth) {
        return analyticsService.forUser(auth.getName());
    }
}