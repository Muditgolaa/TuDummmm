package com.tudummmm.interview.controller;

import com.tudummmm.interview.dto.AnswerResponse;
import com.tudummmm.interview.dto.ReportResponse;
import com.tudummmm.interview.dto.SubmitAnswerRequest;
import com.tudummmm.interview.model.Answer;
import com.tudummmm.interview.service.AnswerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping("/api/questions/{qid}/answers")
    public ResponseEntity<?> submit(Authentication auth, @PathVariable UUID qid,
                                    @Valid @RequestBody SubmitAnswerRequest req) {
        Answer a = answerService.submit(auth.getName(), qid, req);
        return ResponseEntity.status(201).body(Map.of(
                "answer", AnswerResponse.from(a),
                "sessionStatus", a.getSession().getStatus().name().toLowerCase()
        ));
    }

    @GetMapping("/api/sessions/{id}/report")
    public ReportResponse report(Authentication auth, @PathVariable UUID id) {
        return answerService.report(auth.getName(), id);
    }
}