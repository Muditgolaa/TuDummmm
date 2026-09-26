package com.tudummmm.interview.repository;

// Interface projection for the analytics aggregate query.
public interface ScoreStats {
    Double getAvg();
    Integer getMax();
    long getCount();
}