package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.CarbonResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarbonResultRepository extends JpaRepository<CarbonResult, Long> {
    List<CarbonResult> findBySiteIdOrderByCalculatedAtDesc(Long siteId);
    Optional<CarbonResult> findFirstBySiteIdOrderByCalculatedAtDesc(Long siteId);
    List<CarbonResult> findAllByOrderByCalculatedAtDesc();
    List<CarbonResult> findBySiteIdAndYearOrderByCalculatedAtDesc(Long siteId, Integer year);
}
