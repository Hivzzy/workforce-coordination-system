package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.model.RoleEntity;
import com.kembangtasik.backend.repository.RoleRepository;
import com.kembangtasik.backend.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public List<RoleEntity> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public RoleEntity createRole(RoleEntity role) {
        if (role.getId() == null || role.getId().isBlank()) {
            role.setId(role.getName().toLowerCase().replace(" ", "-"));
        }
        return roleRepository.save(role);
    }
}
