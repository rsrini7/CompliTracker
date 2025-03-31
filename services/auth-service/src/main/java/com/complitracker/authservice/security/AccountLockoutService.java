package com.complitracker.authservice.security;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class AccountLockoutService {
    private final ConcurrentHashMap<String, FailedLoginAttempts> failedAttempts = new ConcurrentHashMap<>();
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 30;

    public void recordFailedAttempt(String username) {
        failedAttempts.compute(username, (key, attempts) -> {
            if (attempts == null) {
                return new FailedLoginAttempts(1, System.currentTimeMillis());
            }
            
            if (System.currentTimeMillis() - attempts.getLastAttemptTime() > TimeUnit.MINUTES.toMillis(LOCKOUT_DURATION_MINUTES)) {
                return new FailedLoginAttempts(1, System.currentTimeMillis());
            }
            
            attempts.incrementAttempts();
            attempts.setLastAttemptTime(System.currentTimeMillis());
            return attempts;
        });
    }

    public void resetFailedAttempts(String username) {
        failedAttempts.remove(username);
    }

    public boolean isAccountLocked(String username) {
        FailedLoginAttempts attempts = failedAttempts.get(username);
        if (attempts == null) {
            return false;
        }

        if (System.currentTimeMillis() - attempts.getLastAttemptTime() > TimeUnit.MINUTES.toMillis(LOCKOUT_DURATION_MINUTES)) {
            failedAttempts.remove(username);
            return false;
        }

        return attempts.getAttempts() >= MAX_ATTEMPTS;
    }

    public long getRemainingLockoutTime(String username) {
        FailedLoginAttempts attempts = failedAttempts.get(username);
        if (attempts == null || attempts.getAttempts() < MAX_ATTEMPTS) {
            return 0;
        }

        long elapsedTime = System.currentTimeMillis() - attempts.getLastAttemptTime();
        long remainingTime = TimeUnit.MINUTES.toMillis(LOCKOUT_DURATION_MINUTES) - elapsedTime;
        return Math.max(0, TimeUnit.MILLISECONDS.toMinutes(remainingTime));
    }

    private static class FailedLoginAttempts {
        private int attempts;
        private long lastAttemptTime;

        public FailedLoginAttempts(int attempts, long lastAttemptTime) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
        }

        public int getAttempts() {
            return attempts;
        }

        public void incrementAttempts() {
            this.attempts++;
        }

        public long getLastAttemptTime() {
            return lastAttemptTime;
        }

        public void setLastAttemptTime(long lastAttemptTime) {
            this.lastAttemptTime = lastAttemptTime;
        }
    }
}