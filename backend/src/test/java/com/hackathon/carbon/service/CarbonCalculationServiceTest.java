package com.hackathon.carbon.service;

import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.EnergyFactorRepository;
import com.hackathon.carbon.repository.SiteMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

class CarbonCalculationServiceTest {

    private CarbonCalculationService service;

    @BeforeEach
    void setUp() {
        CarbonResultRepository carbonResultRepository = Mockito.mock(CarbonResultRepository.class);
        SiteMaterialRepository siteMaterialRepository = Mockito.mock(SiteMaterialRepository.class);
        EnergyFactorRepository energyFactorRepository = Mockito.mock(EnergyFactorRepository.class);

        Mockito.when(carbonResultRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

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
}

