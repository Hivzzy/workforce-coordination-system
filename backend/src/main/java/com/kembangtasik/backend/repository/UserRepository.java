package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmailAndPassword(String email, String password);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByStaffId(String staffId);
    void deleteByStaffId(String staffId);
}
