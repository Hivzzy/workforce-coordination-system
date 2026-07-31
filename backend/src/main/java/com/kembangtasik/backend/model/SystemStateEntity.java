package com.kembangtasik.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "system_state")
public class SystemStateEntity {

    @Id
    @Column(name = "state_key")
    private String key;

    @Column(name = "state_value")
    private String value;

    public SystemStateEntity() {}

    public SystemStateEntity(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String key;
        private String value;

        public Builder key(String key) { this.key = key; return this; }
        public Builder value(String value) { this.value = value; return this; }

        public SystemStateEntity build() {
            return new SystemStateEntity(key, value);
        }
    }
}
