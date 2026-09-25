package com.tudummmm.interview.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    private Integer score;   // null until the AI grades it

    @Column(columnDefinition = "text")
    private String feedback;

    @Column(nullable = false)
    private int timeSpentSeconds = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}