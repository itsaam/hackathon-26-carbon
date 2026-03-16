package com.hackathon.carbon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreakdownDTO {

    private Double constructionCo2Kg;
    private Double exploitationCo2Kg;
    private Double totalCo2Kg;
    private List<MaterialBreakdownItem> materials;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialBreakdownItem {
        private String materialName;
        private Double quantityTonnes;
        private Double quantityKg;
        private Double co2Kg;
    }
}
