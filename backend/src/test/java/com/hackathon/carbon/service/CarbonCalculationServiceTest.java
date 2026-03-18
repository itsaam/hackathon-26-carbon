package com.hackathon.carbon.service;

import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.EnergyFactor;
import com.hackathon.carbon.entity.Material;
import com.hackathon.carbon.entity.SiteMaterial;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.EnergyFactorRepository;
import com.hackathon.carbon.repository.SiteMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

class CarbonCalculationServiceTest {

    private CarbonCalculationService service;
    private SiteMaterialRepository siteMaterialRepository;
    private EnergyFactorRepository energyFactorRepository;

    @BeforeEach
    void setUp() {
        CarbonResultRepository carbonResultRepository = Mockito.mock(CarbonResultRepository.class);
        siteMaterialRepository = Mockito.mock(SiteMaterialRepository.class);
        energyFactorRepository = Mockito.mock(EnergyFactorRepository.class);

        Mockito.when(carbonResultRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        Mockito.when(siteMaterialRepository.findBySiteId(any())).thenReturn(List.of());
        Mockito.when(energyFactorRepository.findByYear(any())).thenReturn(List.of());

        service = new CarbonCalculationService(carbonResultRepository, siteMaterialRepository, energyFactorRepository);
    }

    @Test
    void calculateAndSaveForSite_handlesEmptyData() {
        Site site = Site.builder()
                .id(1L)
                .surfaceM2(1000.0)
                .employeeCount(100)
                .build();

        var result = service.calculateAndSaveForSite(site, 2024);

        assertThat(result.getTotalCo2Kg()).isZero();
        assertThat(result.getCo2PerM2()).isZero();
        assertThat(result.getCo2PerEmployee()).isZero();
    }

    @Test
    void estimateForSite_constructionQuantityInTonnes_isNotMisinterpretedAsKg() {
        // 10 tonnes d'acier à 1000 kgCO2e/tonne => 10_000 kgCO2e
        Material steel = Material.builder()
                .id(1L)
                .name("Acier test")
                .emissionFactor(1000.0)
                .unit("tonne")
                .build();

        Site site = Site.builder().id(1L).build();
        SiteMaterial sm = SiteMaterial.builder()
                .site(site)
                .material(steel)
                .quantity(10.0)
                .unit("tonne")
                .build();

        Mockito.when(siteMaterialRepository.findBySiteId(1L)).thenReturn(List.of(sm));

        var result = service.estimateForSite(site, 2024);
        assertThat(result.getConstructionCo2Kg()).isEqualTo(10_000.0);
    }

    @Test
    void estimateForSite_renewableSelfConsumption_reducesElectricityButNotBelowZero() {
        Mockito.when(siteMaterialRepository.findBySiteId(any())).thenReturn(List.of());
        Mockito.when(energyFactorRepository.findByYear(2024)).thenReturn(List.of(
                EnergyFactor.builder().energyType("electricity").gwpPerKwh(0.1).year(2024).build()
        ));

        Site site = Site.builder()
                .id(1L)
                .electricityConsumptionKwh(1000.0)
                .renewableProductionKwh(5000.0)
                .renewableSelfConsumptionRate(1.0) // autoconsommation > conso => doit être capée
                .build();

        var result = service.estimateForSite(site, 2024);
        assertThat(result.getExploitationCo2Kg()).isZero();
    }
}

