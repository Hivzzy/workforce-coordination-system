package com.kembangtasik.backend.repository;

import com.kembangtasik.backend.model.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, String> {
    List<TaskEntity> findByAssignedStaffId(String assignedStaffId);
}
