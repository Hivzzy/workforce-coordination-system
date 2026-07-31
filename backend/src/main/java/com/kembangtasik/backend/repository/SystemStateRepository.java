package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.SystemStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemStateRepository extends JpaRepository<SystemStateEntity, String> {
}
