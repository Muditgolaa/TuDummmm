package com.tudummmm.interview.controller;

import com.tudummmm.interview.dto.CreateSessionRequest;
import com.tudummmm.interview.dto.SessionResponse;
import com.tudummmm.interview.model.Session;
import com.tudummmm.interview.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    // auth.getName() is the userId the JWT filter extracted from the token.
    @PostMapping
    public ResponseEntity<?> create(Authentication auth, @Valid @RequestBody CreateSessionRequest req) {
        Session s = sessionService.create(auth.getName(), req);
        return ResponseEntity.status(201).body(Map.of("session", SessionResponse.from(s)));
    }

    @GetMapping
    public Map<String, Object> list(Authentication auth) {
        List<SessionResponse> sessions = sessionService.listForUser(auth.getName())
                .stream().map(SessionResponse::from).toList();
        return Map.of("sessions", sessions);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(Authentication auth, @PathVariable UUID id) {
        return Map.of("session", SessionResponse.from(sessionService.getOwned(auth.getName(), id)));
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(Authentication auth, @PathVariable UUID id) {
        sessionService.delete(auth.getName(), id);
        return Map.of("message", "Session deleted");
    }
}