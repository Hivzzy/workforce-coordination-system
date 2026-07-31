package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.StaffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<StaffEntity, String> {
    List<StaffEntity> findByAssignedAreaId(String assignedAreaId);
}
