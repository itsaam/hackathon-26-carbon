package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.SiteRequestDTO;
import com.hackathon.carbon.dto.SiteResponseDTO;
import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;

    @Transactional
    public SiteResponseDTO createSite(SiteRequestDTO dto) {
        Site site = Site.builder()
                .name(dto.getName())
                .surfaceM2(dto.getSurfaceM2())
                .parkingUnderground(dto.getParkingUnderground() != null ? dto.getParkingUnderground() : 0)
                .parkingBasement(dto.getParkingBasement() != null ? dto.getParkingBasement() : 0)
                .parkingOutdoor(dto.getParkingOutdoor() != null ? dto.getParkingOutdoor() : 0)
                .energyConsumptionKwh(dto.getEnergyConsumptionKwh())
                .employeeCount(dto.getEmployeeCount())
                .workstationCount(dto.getWorkstationCount() != null ? dto.getWorkstationCount() : 0)
                .build();
        
        site = siteRepository.save(site);
        return toResponseDTO(site);
    }

    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getAllSites() {
        return siteRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteResponseDTO getSiteById(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + id));
        return toResponseDTO(site);
    }

    @Transactional
    public SiteResponseDTO updateSite(Long id, SiteRequestDTO dto) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + id));
        
        site.setName(dto.getName());
        site.setSurfaceM2(dto.getSurfaceM2());
        site.setParkingUnderground(dto.getParkingUnderground() != null ? dto.getParkingUnderground() : 0);
        site.setParkingBasement(dto.getParkingBasement() != null ? dto.getParkingBasement() : 0);
        site.setParkingOutdoor(dto.getParkingOutdoor() != null ? dto.getParkingOutdoor() : 0);
        site.setEnergyConsumptionKwh(dto.getEnergyConsumptionKwh());
        site.setEmployeeCount(dto.getEmployeeCount());
        site.setWorkstationCount(dto.getWorkstationCount() != null ? dto.getWorkstationCount() : 0);
        
        site = siteRepository.save(site);
        return toResponseDTO(site);
    }

    @Transactional
    public void deleteSite(Long id) {
        if (!siteRepository.existsById(id)) {
            throw new EntityNotFoundException("Site non trouvé avec l'ID : " + id);
        }
        siteRepository.deleteById(id);
    }

    private SiteResponseDTO toResponseDTO(Site site) {
        Double lastCo2Total = carbonResultRepository
                .findFirstBySiteIdOrderByCalculatedAtDesc(site.getId())
                .map(CarbonResult::getTotalCo2Kg)
                .orElse(null);
        
        return SiteResponseDTO.builder()
                .id(site.getId())
                .name(site.getName())
                .surfaceM2(site.getSurfaceM2())
                .parkingUnderground(site.getParkingUnderground())
                .parkingBasement(site.getParkingBasement())
                .parkingOutdoor(site.getParkingOutdoor())
                .energyConsumptionKwh(site.getEnergyConsumptionKwh())
                .employeeCount(site.getEmployeeCount())
                .workstationCount(site.getWorkstationCount())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .lastCo2Total(lastCo2Total)
                .build();
    }
}
