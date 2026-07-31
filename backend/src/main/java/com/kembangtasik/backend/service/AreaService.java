package com.kembangtasik.backend.service;

import com.kembangtasik.backend.model.AreaEntity;
import java.util.List;

public interface AreaService {
    List<AreaEntity> getAllAreas();
    AreaEntity createArea(AreaEntity area);
    AreaEntity updateArea(String id, AreaEntity areaDetails);
    void deleteArea(String id);
}
