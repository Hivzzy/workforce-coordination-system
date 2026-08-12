package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findFirstByEmailAndPassword(String email, String password);
    Optional<UserEntity> findFirstByEmail(String email);
    default Optional<UserEntity> findByEmail(String email) {
        return findFirstByEmail(email);
    }
    Optional<UserEntity> findFirstByStaffId(String staffId);
    default Optional<UserEntity> findByStaffId(String staffId) {
        return findFirstByStaffId(staffId);
    }
    void deleteByStaffId(String staffId);
}
