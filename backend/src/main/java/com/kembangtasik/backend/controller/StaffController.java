package com.kembangtasik.backend.controller;

import com.kembangtasik.backend.dto.StaffDto;
import com.kembangtasik.backend.model.StaffEntity;
import com.kembangtasik.backend.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staffs")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<List<StaffDto>> getAllStaffs() {
        return ResponseEntity.ok(staffService.getAllStaffs());
    }

    @PostMapping
    public ResponseEntity<StaffEntity> createStaff(@Valid @RequestBody StaffDto dto) {
        StaffEntity staff = staffService.createStaff(dto);
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffEntity> updateStaff(@PathVariable String id, @Valid @RequestBody StaffDto dto) {
        StaffEntity staff = staffService.updateStaff(id, dto);
        if (staff == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(staff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable String id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
