package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.SiteMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteMaterialRepository extends JpaRepository<SiteMaterial, Long> {
    List<SiteMaterial> findBySiteId(Long siteId);
}
