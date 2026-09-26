package com.tudummmm.interview.service;

import com.tudummmm.interview.dto.AnswerResponse;
import com.tudummmm.interview.dto.QuestionResponse;
import com.tudummmm.interview.dto.ReportResponse;
import com.tudummmm.interview.dto.SessionResponse;
import com.tudummmm.interview.dto.SubmitAnswerRequest;
import com.tudummmm.interview.exception.NotFoundException;
import com.tudummmm.interview.model.Answer;
import com.tudummmm.interview.model.Question;
import com.tudummmm.interview.model.Session;
import com.tudummmm.interview.model.SessionStatus;
import com.tudummmm.interview.repository.AnswerRepository;
import com.tudummmm.interview.repository.QuestionRepository;
import com.tudummmm.interview.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AnswerService {

    private final SessionService sessionService;
    private final SessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final GroqClient groq;

    public AnswerService(SessionService sessionService, SessionRepository sessionRepository,
                         QuestionRepository questionRepository, AnswerRepository answerRepository, GroqClient groq) {
        this.sessionService = sessionService;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.groq = groq;
    }

    @Transactional
    public Answer submit(String userId, UUID questionId, SubmitAnswerRequest req) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found"));
        // Ownership: the question's session must belong to this user.
        Session session = sessionService.getOwned(userId, question.getSession().getId());

        if (answerRepository.findByQuestionIdAndUserId(questionId, userId).isPresent()) {
            throw new IllegalStateException("Question already answered");
        }

        GroqClient.Evaluation eval = groq.evaluateAnswer(question.getContent(), req.content());

        Answer answer = new Answer();
        answer.setSession(session);
        answer.setQuestion(question);
        answer.setUserId(userId);
        answer.setContent(req.content());
        answer.setScore(eval.score());
        answer.setFeedback(eval.feedback());
        answer.setTimeSpentSeconds(req.timeSpentSeconds() == null ? 0 : req.timeSpentSeconds());
        answerRepository.save(answer);

        // Advance the session's status machine.
        if (session.getStatus() == SessionStatus.READY) {
            session.setStatus(SessionStatus.IN_PROGRESS);
        }
        long answered = answerRepository.countBySessionId(session.getId());
        if (answered >= session.getQuestionCount()) {
            session.setStatus(SessionStatus.COMPLETED);
            session.setCompletedAt(Instant.now());
        }
        sessionRepository.save(session);
        return answer;
    }

    @Transactional(readOnly = true)
    public ReportResponse report(String userId, UUID sessionId) {
        Session session = sessionService.getOwned(userId, sessionId);
        List<Question> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        List<Answer> answers = answerRepository.findBySessionId(sessionId);

        Map<UUID, Answer> byQuestion = new HashMap<>();
        for (Answer a : answers) byQuestion.put(a.getQuestion().getId(), a);

        List<ReportResponse.Item> items = new ArrayList<>();
        int sum = 0, scored = 0;
        for (Question q : questions) {
            Answer a = byQuestion.get(q.getId());
            items.add(new ReportResponse.Item(
                    QuestionResponse.from(q),
                    a == null ? null : AnswerResponse.from(a)));
            if (a != null && a.getScore() != null) { sum += a.getScore(); scored++; }
        }
        Integer avg = scored == 0 ? null : Math.round((float) sum / scored);
        ReportResponse.Stats stats = new ReportResponse.Stats(answers.size(), session.getQuestionCount(), avg);
        return new ReportResponse(SessionResponse.from(session), items, stats);
    }
}