package com.tudummmm.interview.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class MeController {

    // Echoes the authenticated user's id — quick proof the JWT filter works.
    @GetMapping("/api/me")
    public Map<String, Object> me(Authentication auth) {
        return Map.of("userId", auth.getName());
    }
}