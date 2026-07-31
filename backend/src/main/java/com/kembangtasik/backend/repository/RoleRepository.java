package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, String> {
    boolean existsByNameIgnoreCase(String name);
}
