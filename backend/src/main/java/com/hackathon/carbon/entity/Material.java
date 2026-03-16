package com.hackathon.carbon.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "materials")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "emission_factor", nullable = false)
    private Double emissionFactor;

    @Column(nullable = false)
    private String unit = "tonne";

    @Column(nullable = false)
    private String source = "ADEME";

    public Material() {}

    public Material(Long id, String name, Double emissionFactor, String unit, String source) {
        this.id = id;
        this.name = name;
        this.emissionFactor = emissionFactor;
        this.unit = unit != null ? unit : "tonne";
        this.source = source != null ? source : "ADEME";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getEmissionFactor() { return emissionFactor; }
    public void setEmissionFactor(Double emissionFactor) { this.emissionFactor = emissionFactor; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
