package com.kembangtasik.backend.service;

import com.kembangtasik.backend.model.RoleEntity;
import java.util.List;

public interface RoleService {
    List<RoleEntity> getAllRoles();
    RoleEntity createRole(RoleEntity role);
}
