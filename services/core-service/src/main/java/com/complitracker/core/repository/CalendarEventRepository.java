package com.complitracker.core.repository;

import com.complitracker.core.model.CalendarEvent;
import com.complitracker.core.model.CalendarProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUserId(String userId);
    List<CalendarEvent> findByComplianceItemId(Long complianceItemId);
    List<CalendarEvent> findByStartDateTimeBetween(LocalDateTime start, LocalDateTime end);
    List<CalendarEvent> findByUserIdAndStartDateTimeBetween(String userId, LocalDateTime start, LocalDateTime end);
    List<CalendarProvider> findCalendarProvidersByUserId(String userId);
    void deleteByComplianceItemId(Long complianceItemId);
}