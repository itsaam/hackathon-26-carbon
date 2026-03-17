package com.hackathon.carbon.repository;

import com.hackathon.carbon.entity.PushToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushTokenRepository extends JpaRepository<PushToken, Long> {

    List<PushToken> findByUserId(Long userId);

    List<PushToken> findByUserIdIn(List<Long> userIds);

    Optional<PushToken> findByUserIdAndExpoPushToken(Long userId, String expoPushToken);

    void deleteByExpoPushToken(String expoPushToken);
}
