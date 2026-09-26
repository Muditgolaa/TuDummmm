package com.tudummmm.interview.service;

import com.tudummmm.interview.model.Question;
import com.tudummmm.interview.model.Session;
import com.tudummmm.interview.model.SessionStatus;
import com.tudummmm.interview.repository.QuestionRepository;
import com.tudummmm.interview.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    private final SessionService sessionService;
    private final SessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final GroqClient groq;

    public QuestionService(SessionService sessionService, SessionRepository sessionRepository,
                           QuestionRepository questionRepository, GroqClient groq) {
        this.sessionService = sessionService;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.groq = groq;
    }

    // @Transactional: if Groq fails, the whole thing rolls back (status stays PENDING),
    // so the user can retry — no half-generated session.
    @Transactional
    public List<Question> generate(String userId, UUID sessionId) {
        Session session = sessionService.getOwned(userId, sessionId);
        if (session.getStatus() != SessionStatus.PENDING) {
            throw new IllegalStateException("Questions already generated");
        }
        session.setStatus(SessionStatus.GENERATING);

        List<GroqClient.GeneratedQuestion> generated =
                groq.generateQuestions(session.getJobTitle(), session.getCompany(), session.getJobDescription());

        int order = 1;
        for (GroqClient.GeneratedQuestion g : generated) {
            Question q = new Question();
            q.setSession(session);
            q.setContent(g.content());
            q.setCategory(g.category());
            q.setDifficulty(g.difficulty());
            q.setOrderIndex(order++);
            questionRepository.save(q);
        }
        session.setStatus(SessionStatus.READY);
        sessionRepository.save(session);
        return questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
    }

    public List<Question> listForSession(String userId, UUID sessionId) {
        sessionService.getOwned(userId, sessionId); // ownership check
        return questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
    }
}