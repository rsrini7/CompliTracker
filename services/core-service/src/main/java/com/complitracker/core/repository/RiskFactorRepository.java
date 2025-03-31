package com.complitracker.core.repository;

import com.complitracker.core.model.RiskFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskFactorRepository extends JpaRepository<RiskFactor, Long> {
    List<RiskFactor> findByRiskAnalysisId(Long riskAnalysisId);
    
    @Query("SELECT rf FROM RiskFactor rf JOIN FETCH rf.riskAnalysis WHERE rf.score >= :threshold ORDER BY rf.score DESC")
    List<RiskFactor> findHighRiskFactors(double threshold);
    
    @Query("SELECT rf FROM RiskFactor rf JOIN FETCH rf.riskAnalysis WHERE rf.riskAnalysis.id = :analysisId ORDER BY rf.score * rf.weight DESC")
    List<RiskFactor> findRiskFactorsByAnalysisIdOrderByWeightedScore(Long analysisId);
    
    @Query("SELECT COALESCE(AVG(rf.score), 0.0) FROM RiskFactor rf WHERE rf.riskAnalysis.id = :analysisId")
    Double calculateAverageScore(Long analysisId);
}