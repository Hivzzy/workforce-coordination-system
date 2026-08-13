package com.kembangtasik.backend.service.impl;

import com.kembangtasik.backend.model.AreaEntity;
import com.kembangtasik.backend.repository.AreaRepository;
import com.kembangtasik.backend.service.AreaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;

    public AreaServiceImpl(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    @Override
    public List<AreaEntity> getAllAreas() {
        return areaRepository.findAll();
    }

    @Override
    public AreaEntity createArea(AreaEntity area) {
        if (area.getId() == null || area.getId().isBlank()) {
            area.setId("area-" + System.currentTimeMillis());
        }
        return areaRepository.save(area);
    }

    @Override
    public AreaEntity updateArea(String id, AreaEntity areaDetails) {
        Optional<AreaEntity> existingOpt = areaRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return null;
        }
        AreaEntity area = existingOpt.get();
        if (areaDetails.getName() != null) area.setName(areaDetails.getName());
        return areaRepository.save(area);
    }

    @Override
    public void deleteArea(String id) {
        areaRepository.deleteById(id);
    }
}
