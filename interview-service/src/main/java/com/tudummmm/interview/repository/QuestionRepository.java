package com.tudummmm.interview.repository;

import com.tudummmm.interview.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findBySessionIdOrderByOrderIndexAsc(UUID sessionId);
}