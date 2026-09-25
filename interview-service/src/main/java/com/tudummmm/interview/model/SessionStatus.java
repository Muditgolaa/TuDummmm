package com.tudummmm.interview.model;

// The interview lifecycle. Stored as text in the DB (EnumType.STRING).
public enum SessionStatus {
    PENDING, GENERATING, READY, IN_PROGRESS, COMPLETED
}