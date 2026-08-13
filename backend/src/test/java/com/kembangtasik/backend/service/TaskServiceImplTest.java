package com.kembangtasik.backend.service;

import com.kembangtasik.backend.dto.TaskDto;
import com.kembangtasik.backend.model.AreaEntity;
import com.kembangtasik.backend.model.StaffEntity;
import com.kembangtasik.backend.model.TaskEntity;
import com.kembangtasik.backend.repository.AreaRepository;
import com.kembangtasik.backend.repository.StaffRepository;
import com.kembangtasik.backend.repository.TaskRepository;
import com.kembangtasik.backend.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private AreaRepository areaRepository;

    private WebSocketPublisherService webSocketPublisherService;
    private TaskServiceImpl taskService;

    @BeforeEach
    void setUp() {
        webSocketPublisherService = new WebSocketPublisherService(null);
        taskService = new TaskServiceImpl(taskRepository, staffRepository, areaRepository, webSocketPublisherService);
    }

    @Test
    @DisplayName("1. Task DTO Population: Should resolve staffName and areaName dynamically from repositories")
    void testTaskDtoPopulation() {
        // Arrange
        StaffEntity staff = StaffEntity.builder().id("staff-001").name("Budi Santoso").role("Runner").build();
        AreaEntity area = AreaEntity.builder().id("area-vip").name("VIP Lounge").build();
        TaskEntity task = TaskEntity.builder()
                .id("task-101")
                .title("Refill Air Mineral VIP")
                .description("Segera isi ulang 5 dus air mineral")
                .assignedStaffId("staff-001")
                .assignedAreaId("area-vip")
                .status("in_progress")
                .build();

        when(taskRepository.findAll()).thenReturn(List.of(task));
        when(staffRepository.findById("staff-001")).thenReturn(Optional.of(staff));
        when(areaRepository.findById("area-vip")).thenReturn(Optional.of(area));

        // Act
        List<TaskDto> tasks = taskService.getTasks(null);

        // Assert
        assertNotNull(tasks);
        assertEquals(1, tasks.size());

        TaskDto dto = tasks.get(0);
        assertEquals("task-101", dto.getId());
        assertEquals("Budi Santoso", dto.getStaffName(), "staffName must be populated dynamically");
        assertEquals("VIP Lounge", dto.getAreaName(), "areaName must be populated dynamically");
        assertEquals("in_progress", dto.getStatus());
    }

    @Test
    @DisplayName("2. Task Creation: Should save entity, populate DTO, and generate task ID & status")
    void testCreateTask() {
        TaskEntity inputTask = TaskEntity.builder()
                .title("Tugas Baru")
                .assignedStaffId("staff-002")
                .assignedAreaId("area-buffet")
                .build();

        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(i -> i.getArgument(0));

        TaskDto created = taskService.createTask(inputTask);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("pending", created.getStatus());
    }
}
