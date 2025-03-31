package com.complitracker.email.repository;

import com.complitracker.email.model.ScheduledEmail;
import com.complitracker.email.model.EmailStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduledEmailRepository extends JpaRepository<ScheduledEmail, Long> {
    List<ScheduledEmail> findByStatusAndScheduledTimeBefore(EmailStatus status, LocalDateTime scheduledTime);
}