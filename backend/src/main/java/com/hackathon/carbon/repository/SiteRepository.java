package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByUserId(Long userId);

    @Query("select distinct s from Site s join s.allowedUsers u where u.id = :userId")
    List<Site> findAccessibleByUserId(@Param("userId") Long userId);
}
