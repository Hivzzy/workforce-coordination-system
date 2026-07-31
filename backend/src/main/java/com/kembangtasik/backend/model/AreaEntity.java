package com.kembangtasik.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "areas")
public class AreaEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String type;
    private String color;

    public AreaEntity() {}

    public AreaEntity(String id, String name, String type, String color) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.color = color;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String name;
        private String type;
        private String color;

        public Builder id(String id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder color(String color) { this.color = color; return this; }

        public AreaEntity build() {
            return new AreaEntity(id, name, type, color);
        }
    }
}
