package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.AreaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaRepository extends JpaRepository<AreaEntity, String> {
}
