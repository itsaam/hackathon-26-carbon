package com.hackathon.carbon.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialDTO {
    private Long id;
    private String name;
    private Double emissionFactor;
    private String unit;
    private String source;
    private String category;
    private String subCategory;
    private Double density;
    private String lifeCycleStageCovered;
    private Double gwpPerKg;
    private Integer referenceYear;
    private String dataSourceUrl;
}
