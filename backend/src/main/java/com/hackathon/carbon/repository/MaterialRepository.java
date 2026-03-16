package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    Optional<Material> findByNameAndReferenceYear(String name, Integer referenceYear);

    List<Material> findByName(String name);
}
