package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.EnergyFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnergyFactorRepository extends JpaRepository<EnergyFactor, Long> {
    Optional<EnergyFactor> findByEnergyType(String energyType);
    List<EnergyFactor> findByYear(Integer year);
    Optional<EnergyFactor> findTopByOrderByYearDesc();
    List<EnergyFactor> findByEnergyTypeAndYear(String energyType, Integer year);
}
