package com.tudummmm.interview.service;

import com.tudummmm.interview.dto.AnalyticsResponse;
import com.tudummmm.interview.model.SessionStatus;
import com.tudummmm.interview.repository.AnswerRepository;
import com.tudummmm.interview.repository.ScoreStats;
import com.tudummmm.interview.repository.SessionRepository;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final SessionRepository sessionRepository;
    private final AnswerRepository answerRepository;

    public AnalyticsService(SessionRepository sessionRepository, AnswerRepository answerRepository) {
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
    }

    public AnalyticsResponse forUser(String userId) {
        ScoreStats s = answerRepository.scoreStatsForUser(userId);
        long totalSessions = sessionRepository.countByUserId(userId);
        long completed = sessionRepository.countByUserIdAndStatus(userId, SessionStatus.COMPLETED);

        Integer avg = (s == null || s.getAvg() == null) ? null : Math.round(s.getAvg().floatValue());
        Integer best = (s == null) ? null : s.getMax();
        long answered = (s == null) ? 0 : s.getCount();
        int completionRate = totalSessions == 0 ? 0 : Math.round((float) completed / totalSessions * 100);

        return new AnalyticsResponse(avg, best, answered, totalSessions, completed, completionRate);
    }
}