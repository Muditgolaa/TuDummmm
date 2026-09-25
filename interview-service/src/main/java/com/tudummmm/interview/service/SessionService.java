package com.tudummmm.interview.service;

import com.tudummmm.interview.dto.CreateSessionRequest;
import com.tudummmm.interview.exception.NotFoundException;
import com.tudummmm.interview.model.Session;
import com.tudummmm.interview.repository.SessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public Session create(String userId, CreateSessionRequest req) {
        Session s = new Session();
        s.setUserId(userId);
        s.setJobTitle(req.jobTitle().trim());
        s.setCompany(req.company());
        s.setJobDescription(req.jobDescription());
        return sessionRepository.save(s);
    }

    public List<Session> listForUser(String userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Ownership baked into the query: a session that isn't yours reads as "not found".
    public Session getOwned(String userId, UUID id) {
        return sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
    }

    public void delete(String userId, UUID id) {
        Session s = getOwned(userId, id);
        sessionRepository.delete(s);
    }
}