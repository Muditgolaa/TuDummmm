package com.tudummmm.interview.repository;

import com.tudummmm.interview.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    List<Answer> findBySessionId(UUID sessionId);
    Optional<Answer> findByQuestionIdAndUserId(UUID questionId, String userId);
    long countBySessionId(UUID sessionId);

    // DB-side aggregate for analytics (avg/best/count of graded answers).
    @Query("select avg(a.score) as avg, max(a.score) as max, count(a) as count " +
           "from Answer a where a.userId = :userId and a.score is not null")
    ScoreStats scoreStatsForUser(@Param("userId") String userId);
}