package com.complitracker.core.repository;

import com.complitracker.core.model.RiskAnalysis;
import com.complitracker.core.model.RiskFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RiskAnalysisRepository extends JpaRepository<RiskAnalysis, Long> {
    List<RiskAnalysis> findByComplianceItemId(Long complianceItemId);
    
    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.riskLevel = 'HIGH' ORDER BY ra.analysisDate DESC")
    List<RiskAnalysis> findHighRiskAnalyses();
    
    @Query("SELECT DISTINCT ra FROM RiskAnalysis ra LEFT JOIN FETCH ra.riskFactors WHERE ra.complianceItemId = :complianceItemId")
    List<RiskAnalysis> findRiskAnalysesWithFactorsByComplianceItemId(Long complianceItemId);
    
    @Query("SELECT rf FROM RiskAnalysis ra JOIN ra.riskFactors rf GROUP BY rf.name HAVING AVG(rf.score) >= 0.7")
    List<RiskFactor> findHighRiskFactors();
    
    @Query("SELECT CASE WHEN COUNT(ra) > 0 THEN true ELSE false END FROM RiskAnalysis ra WHERE ra.complianceItemId = :complianceItemId AND ra.analysisDate > CURRENT_DATE")
    boolean hasRecentAnalysis(Long complianceItemId);
    
    @Query("SELECT AVG(ra.overallScore) FROM RiskAnalysis ra")
    Double calculateOrganizationRiskScore();
    
    long countByRiskLevel(String riskLevel);
    
    @Query("SELECT rf FROM RiskAnalysis ra JOIN ra.riskFactors rf")
    List<RiskFactor> findAllRiskFactors();
    
    RiskAnalysis findTopByComplianceItemIdOrderByAnalysisDateDesc(Long complianceItemId);

    @Query("SELECT rf FROM RiskAnalysis ra JOIN ra.riskFactors rf WHERE ra.complianceItemId IN (SELECT ci.id FROM ComplianceItem ci WHERE ci.areaId = :areaId)")
    List<RiskFactor> findRiskFactorsByAreaId(@Param("areaId") String areaId);

    @Query("SELECT rf.score FROM RiskAnalysis ra JOIN ra.riskFactors rf WHERE rf.name = :factorName AND ra.complianceItemId IN (SELECT ci.id FROM ComplianceItem ci WHERE ci.areaId = :areaId) ORDER BY ra.analysisDate DESC")
    List<Double> findHistoricalFactorScores(@Param("factorName") String factorName, @Param("areaId") String areaId);

    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.complianceItemId IN (SELECT ci.id FROM ComplianceItem ci WHERE ci.entityType = :entityType AND ci.entityId = :entityId) ORDER BY ra.analysisDate DESC")
    List<RiskAnalysis> findRiskAnalysisHistory(@Param("entityType") String entityType, @Param("entityId") String entityId);

    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.complianceItemId = :complianceItemId AND ra.analysisDate < :currentDate ORDER BY ra.analysisDate DESC")
    RiskAnalysis findPreviousAnalysis(@Param("complianceItemId") Long complianceItemId, @Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT ra FROM RiskAnalysis ra WHERE ra.complianceItemId IN (SELECT ci.id FROM ComplianceItem ci WHERE ci.userId = :userId) ORDER BY ra.analysisDate DESC")
    List<RiskAnalysis> findRiskAnalysisByUserId(@Param("userId") String userId);
}