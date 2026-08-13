package com.kembangtasik.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "areas")
public class AreaEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    public AreaEntity() {}

    public AreaEntity(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String name;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }

        public AreaEntity build() {
            return new AreaEntity(id, name);
        }
    }
}
