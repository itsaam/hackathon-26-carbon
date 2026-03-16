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
}
