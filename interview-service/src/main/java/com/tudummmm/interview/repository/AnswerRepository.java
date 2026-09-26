package com.tudummmm.interview.repository;

import com.tudummmm.interview.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    List<Answer> findBySessionId(UUID sessionId);
    Optional<Answer> findByQuestionIdAndUserId(UUID questionId, String userId);
    long countBySessionId(UUID sessionId);
}