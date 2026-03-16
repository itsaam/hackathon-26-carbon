package com.hackathon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeocodeResultDTO {

    private String label;
    private String street;
    private String postalCode;
    private String city;
    private String country;
    private Double lat;
    private Double lon;
}

