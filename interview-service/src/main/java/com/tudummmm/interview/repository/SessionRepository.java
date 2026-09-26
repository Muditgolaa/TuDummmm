package com.tudummmm.interview.repository;

import com.tudummmm.interview.model.Session;
import com.tudummmm.interview.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Session> findByIdAndUserId(UUID id, String userId);
    long countByUserId(String userId);
    long countByUserIdAndStatus(String userId, SessionStatus status);
}