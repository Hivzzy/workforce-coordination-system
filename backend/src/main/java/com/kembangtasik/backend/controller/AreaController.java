package com.kembangtasik.backend.controller;

import com.kembangtasik.backend.model.AreaEntity;
import com.kembangtasik.backend.service.AreaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping
    public ResponseEntity<List<AreaEntity>> getAllAreas() {
        return ResponseEntity.ok(areaService.getAllAreas());
    }

    @PostMapping
    public ResponseEntity<AreaEntity> createArea(@RequestBody AreaEntity area) {
        AreaEntity savedArea = areaService.createArea(area);
        return ResponseEntity.ok(savedArea);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaEntity> updateArea(@PathVariable String id, @RequestBody AreaEntity areaDetails) {
        AreaEntity updated = areaService.updateArea(id, areaDetails);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArea(@PathVariable String id) {
        areaService.deleteArea(id);
        return ResponseEntity.noContent().build();
    }
}
