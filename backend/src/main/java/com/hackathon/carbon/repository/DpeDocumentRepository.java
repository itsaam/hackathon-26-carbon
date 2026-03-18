package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.DpeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DpeDocumentRepository extends JpaRepository<DpeDocument, Long> {
    List<DpeDocument> findBySiteIdOrderByUploadedAtDesc(Long siteId);
    Optional<DpeDocument> findByIdAndSiteId(Long id, Long siteId);
}

