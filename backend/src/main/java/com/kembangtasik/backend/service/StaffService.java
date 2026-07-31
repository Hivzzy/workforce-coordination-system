package com.kembangtasik.backend.service;

import com.kembangtasik.backend.dto.StaffDto;
import com.kembangtasik.backend.model.StaffEntity;
import java.util.List;

public interface StaffService {
    List<StaffDto> getAllStaffs();
    StaffEntity createStaff(StaffDto dto);
    StaffEntity updateStaff(String id, StaffDto dto);
    void deleteStaff(String id);
}
