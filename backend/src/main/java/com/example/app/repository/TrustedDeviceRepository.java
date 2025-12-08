package com.example.app.repository;

import com.example.app.entity.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, TrustedDevice.TrustedDeviceId> {
    
    Optional<TrustedDevice> findByUserIdAndDeviceIdAndExpiresAtAfterAndRevokedAtIsNull(
        String userId,
        String deviceId,
        LocalDateTime now
    );
    
    void deleteByExpiresAtBefore(LocalDateTime now);
}
