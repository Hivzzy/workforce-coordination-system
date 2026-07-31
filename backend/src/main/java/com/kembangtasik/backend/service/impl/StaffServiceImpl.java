package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.dto.StaffDto;
import com.kembangtasik.backend.model.StaffEntity;
import com.kembangtasik.backend.model.UserEntity;
import com.kembangtasik.backend.repository.StaffRepository;
import com.kembangtasik.backend.repository.UserRepository;
import com.kembangtasik.backend.service.StaffService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;

    public StaffServiceImpl(StaffRepository staffRepository, UserRepository userRepository) {
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<StaffDto> getAllStaffs() {
        List<StaffEntity> staffs = staffRepository.findAll();
        return staffs.stream().map(s -> {
            Optional<UserEntity> u = userRepository.findByStaffId(s.getId());
            return StaffDto.builder()
                    .id(s.getId())
                    .name(s.getName())
                    .role(s.getRole())
                    .assignedAreaId(s.getAssignedAreaId())
                    .email(u.map(UserEntity::getEmail).orElse(null))
                    .password(u.map(UserEntity::getPassword).orElse(null))
                    .build();
        }).sorted(Comparator.comparing(StaffDto::getName)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffEntity createStaff(StaffDto dto) {
        String id = dto.getId() != null ? dto.getId() : "staff-" + System.currentTimeMillis();
        StaffEntity staff = StaffEntity.builder()
                .id(id)
                .name(dto.getName())
                .role(dto.getRole())
                .assignedAreaId(dto.getAssignedAreaId())
                .build();

        staffRepository.save(staff);

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            UserEntity user = UserEntity.builder()
                    .id(id + "-user")
                    .email(dto.getEmail())
                    .password(dto.getPassword() != null ? dto.getPassword() : "staff")
                    .name(dto.getName())
                    .role("staff")
                    .staffId(id)
                    .build();
            userRepository.save(user);
        }

        return staff;
    }

    @Override
    @Transactional
    public StaffEntity updateStaff(String id, StaffDto dto) {
        Optional<StaffEntity> staffOpt = staffRepository.findById(id);
        if (staffOpt.isEmpty()) {
            return null;
        }

        StaffEntity staff = staffOpt.get();
        staff.setName(dto.getName());
        staff.setRole(dto.getRole());
        staff.setAssignedAreaId(dto.getAssignedAreaId());
        staffRepository.save(staff);

        Optional<UserEntity> userOpt = userRepository.findByStaffId(id);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            if (dto.getEmail() != null) user.setEmail(dto.getEmail());
            if (dto.getPassword() != null) user.setPassword(dto.getPassword());
            user.setName(dto.getName());
            userRepository.save(user);
        } else if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            UserEntity user = UserEntity.builder()
                    .id(id + "-user")
                    .email(dto.getEmail())
                    .password(dto.getPassword() != null ? dto.getPassword() : "staff")
                    .name(dto.getName())
                    .role("staff")
                    .staffId(id)
                    .build();
            userRepository.save(user);
        }

        return staff;
    }

    @Override
    @Transactional
    public void deleteStaff(String id) {
        userRepository.deleteByStaffId(id);
        staffRepository.deleteById(id);
    }
}
