package com.kembangtasik.backend.service;

import com.kembangtasik.backend.model.*;
import com.kembangtasik.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AreaRepository areaRepository;
    private final StaffRepository staffRepository;
    private final TaskRepository taskRepository;
    private final SystemStateRepository systemStateRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, AreaRepository areaRepository, StaffRepository staffRepository, TaskRepository taskRepository, SystemStateRepository systemStateRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.areaRepository = areaRepository;
        this.staffRepository = staffRepository;
        this.taskRepository = taskRepository;
        this.systemStateRepository = systemStateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking enterprise database initialization for Kembang Tasik WO & Catering...");

        if (roleRepository.count() == 0) {
            log.info("Seeding default roles...");
            roleRepository.saveAll(List.of(
                RoleEntity.builder().id("pramusaji").name("Pramusaji Buffet").build(),
                RoleEntity.builder().id("runner").name("Runner Logistik / Refill").build(),
                RoleEntity.builder().id("catering-coord").name("Koordinator Katering").build(),
                RoleEntity.builder().id("vip-host").name("Pramusaji VIP Lounge").build(),
                RoleEntity.builder().id("cleaning").name("Kru Kebersihan Piring").build(),
                RoleEntity.builder().id("security").name("Security Gate Gedung").build()
            ));
        }

        if (areaRepository.count() == 0) {
            log.info("Seeding default catering areas...");
            areaRepository.saveAll(List.of(
                AreaEntity.builder().id("area-buffet-main").name("Meja Buffet Utama").type("zone").color("#10b981").build(),
                AreaEntity.builder().id("area-buffet-a").name("Buffet A (Nasi & Daging)").type("stand").color("#3b82f6").build(),
                AreaEntity.builder().id("area-buffet-b").name("Buffet B (Seafood & Sup)").type("stand").color("#6366f1").build(),
                AreaEntity.builder().id("area-dessert").name("Stand Dessert & Kue").type("stand").color("#ec4899").build(),
                AreaEntity.builder().id("area-drinks").name("Drink Station & Es Buah").type("stand").color("#f59e0b").build(),
                AreaEntity.builder().id("area-vip").name("VIP Lounge Keluarga").type("building").color("#8b5cf6").build(),
                AreaEntity.builder().id("area-gate").name("Pintu Masuk & Buku Tamu").type("zone").color("#6b7280").build()
            ));
        }

        if (staffRepository.count() == 0) {
            log.info("Seeding default staffs...");
            staffRepository.saveAll(List.of(
                StaffEntity.builder().id("staff-001").name("Andi Wijaya").role("catering-coord").assignedAreaId("area-buffet-main").build(),
                StaffEntity.builder().id("staff-002").name("Budi Santoso").role("runner").assignedAreaId("area-buffet-a").build(),
                StaffEntity.builder().id("staff-003").name("Citra Lestari").role("cleaning").assignedAreaId("area-buffet-main").build(),
                StaffEntity.builder().id("staff-004").name("Dedi Pratama").role("pramusaji").assignedAreaId("area-buffet-b").build(),
                StaffEntity.builder().id("staff-005").name("Evi Rahmawati").role("vip-host").assignedAreaId("area-vip").build(),
                StaffEntity.builder().id("staff-006").name("Fajar Nugroho").role("pramusaji").assignedAreaId("area-dessert").build(),
                StaffEntity.builder().id("staff-007").name("Guntur Saputra").role("security").assignedAreaId("area-gate").build()
            ));
        }

        if (userRepository.count() == 0) {
            log.info("Seeding default enterprise users with BCrypt password hashing...");
            String hashedAdminPass = passwordEncoder.encode("admin");
            String hashedStaffPass = passwordEncoder.encode("staff");

            userRepository.saveAll(List.of(
                UserEntity.builder().id("1").email("admin@coordination.com").password(hashedAdminPass).name("Administrator Kembang Tasik").role("admin").staffId(null).build(),
                UserEntity.builder().id("2").email("admin@gmail.com").password(hashedAdminPass).name("Administrator Kembang Tasik").role("admin").staffId(null).build(),
                UserEntity.builder().id("staff-default-user").email("staff@coordination.com").password(hashedStaffPass).name("Staff Kembang Tasik").role("staff").staffId("staff-001").build(),
                UserEntity.builder().id("staff-001-user").email("andi@coordination.com").password(hashedStaffPass).name("Andi Wijaya").role("staff").staffId("staff-001").build(),
                UserEntity.builder().id("staff-002-user").email("budi@coordination.com").password(hashedStaffPass).name("Budi Santoso").role("staff").staffId("staff-002").build(),
                UserEntity.builder().id("staff-003-user").email("citra@coordination.com").password(hashedStaffPass).name("Citra Lestari").role("staff").staffId("staff-003").build(),
                UserEntity.builder().id("staff-004-user").email("dedi@coordination.com").password(hashedStaffPass).name("Dedi Pratama").role("staff").staffId("staff-004").build(),
                UserEntity.builder().id("staff-005-user").email("evi@coordination.com").password(hashedStaffPass).name("Evi Rahmawati").role("staff").staffId("staff-005").build(),
                UserEntity.builder().id("staff-006-user").email("fajar@coordination.com").password(hashedStaffPass).name("Fajar Nugroho").role("staff").staffId("staff-006").build(),
                UserEntity.builder().id("staff-007-user").email("guntur@coordination.com").password(hashedStaffPass).name("Guntur Saputra").role("staff").staffId("staff-007").build()
            ));
        }

        if (taskRepository.count() == 0) {
            log.info("Seeding default catering tasks...");
            taskRepository.saveAll(List.of(
                TaskEntity.builder().id("task-001").title("Refill Stok Sate Ayam Buffet A").description("Isi ulang porsi sate ayam di Buffet A karena sisa 20%.").assignedStaffId("staff-002").assignedAreaId("area-buffet-a").status("in_progress").createdAt(LocalDateTime.now()).build(),
                TaskEntity.builder().id("task-002").title("Standby Servis Minuman VIP Lounge").description("Pastikan cangkir dan jus di VIP Lounge selalu terisi penuh.").assignedStaffId("staff-005").assignedAreaId("area-vip").status("pending").createdAt(LocalDateTime.now()).build(),
                TaskEntity.builder().id("task-003").title("Pembersihan Meja Piring Kotor").description("Angkut piring kotor dari meja tamu di sekitar Buffet Utama.").assignedStaffId("staff-003").assignedAreaId("area-buffet-main").status("completed").createdAt(LocalDateTime.now()).build()
            ));
        }

        if (systemStateRepository.count() == 0) {
            log.info("Seeding system state triggers...");
            systemStateRepository.saveAll(List.of(
                SystemStateEntity.builder().key("emergency_active").value("false").build(),
                SystemStateEntity.builder().key("help_status").value("idle").build(),
                SystemStateEntity.builder().key("refill_status").value("idle").build()
            ));
        }

        log.info("BCrypt Hashed User Passwords initialized! Verify hashes ($2a$10$...) in DBeaver.");
    }
}
