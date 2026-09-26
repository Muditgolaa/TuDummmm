package com.tudummmm.interview.repository;

import com.tudummmm.interview.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Spring Data generates the SQL from the method names — no implementation needed.
public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Session> findByIdAndUserId(UUID id, String userId);
}