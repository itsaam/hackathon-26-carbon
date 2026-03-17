package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.SiteRequestDTO;
import com.hackathon.carbon.dto.SiteResponseDTO;
import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.User;
import com.hackathon.carbon.entity.SiteMaterial;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteMaterialRepository;
import com.hackathon.carbon.repository.SiteRepository;
import com.hackathon.carbon.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;
    private final SiteMaterialRepository siteMaterialRepository;
    private final UserRepository userRepository;

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
                .addressLine1(dto.getAddressLine1())
                .addressLine2(dto.getAddressLine2())
                .postalCode(dto.getPostalCode())
                .city(dto.getCity())
                .country(dto.getCountry())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .internalCode(dto.getInternalCode())
                .externalCode(dto.getExternalCode())
                .buildingType(dto.getBuildingType())
                .usageType(dto.getUsageType())
                .yearOfConstruction(dto.getYearOfConstruction())
                .yearOfRenovation(dto.getYearOfRenovation())
                .floorsCount(dto.getFloorsCount())
                .heatedAreaM2(dto.getHeatedAreaM2())
                .cooledAreaM2(dto.getCooledAreaM2())
                .occupancyDaysPerWeek(dto.getOccupancyDaysPerWeek())
                .occupancyHoursPerDay(dto.getOccupancyHoursPerDay())
                .averageOccupancyRate(dto.getAverageOccupancyRate())
                .electricityConsumptionKwh(dto.getElectricityConsumptionKwh())
                .gasConsumptionKwh(dto.getGasConsumptionKwh())
                .fuelOilConsumptionKwh(dto.getFuelOilConsumptionKwh())
                .districtHeatingConsumptionKwh(dto.getDistrictHeatingConsumptionKwh())
                .renewableProductionKwh(dto.getRenewableProductionKwh())
                .renewableSelfConsumptionRate(dto.getRenewableSelfConsumptionRate())
                .activityDescription(dto.getActivityDescription())
                .notes(dto.getNotes())
                .build();

        User currentUser = getCurrentUserIfAny();
        if (currentUser != null) {
            site.setUser(currentUser);
            site.getAllowedUsers().add(currentUser);
        }
        
        site = siteRepository.save(site);
        return toResponseDTO(site);
    }

    @Transactional(readOnly = true)
    public List<SiteResponseDTO> getAllSites() {
        User currentUser = getCurrentUserIfAny();
        List<Site> sites;
        if (currentUser != null) {
            if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                sites = siteRepository.findAll();
            } else {
                sites = siteRepository.findAccessibleByUserId(currentUser.getId());
            }
        } else {
            sites = siteRepository.findAll();
        }
        return sites.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteResponseDTO getSiteById(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + id));
        enforceOwnership(site);
        return toResponseDTO(site);
    }

    @Transactional
    public SiteResponseDTO updateSite(Long id, SiteRequestDTO dto) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + id));
        enforceOwnership(site);
        
        site.setName(dto.getName());
        site.setSurfaceM2(dto.getSurfaceM2());
        site.setParkingUnderground(dto.getParkingUnderground() != null ? dto.getParkingUnderground() : 0);
        site.setParkingBasement(dto.getParkingBasement() != null ? dto.getParkingBasement() : 0);
        site.setParkingOutdoor(dto.getParkingOutdoor() != null ? dto.getParkingOutdoor() : 0);
        site.setEnergyConsumptionKwh(dto.getEnergyConsumptionKwh());
        site.setEmployeeCount(dto.getEmployeeCount());
        site.setWorkstationCount(dto.getWorkstationCount() != null ? dto.getWorkstationCount() : 0);
        site.setAddressLine1(dto.getAddressLine1());
        site.setAddressLine2(dto.getAddressLine2());
        site.setPostalCode(dto.getPostalCode());
        site.setCity(dto.getCity());
        site.setCountry(dto.getCountry());
        site.setLatitude(dto.getLatitude());
        site.setLongitude(dto.getLongitude());
        site.setInternalCode(dto.getInternalCode());
        site.setExternalCode(dto.getExternalCode());
        site.setBuildingType(dto.getBuildingType());
        site.setUsageType(dto.getUsageType());
        site.setYearOfConstruction(dto.getYearOfConstruction());
        site.setYearOfRenovation(dto.getYearOfRenovation());
        site.setFloorsCount(dto.getFloorsCount());
        site.setHeatedAreaM2(dto.getHeatedAreaM2());
        site.setCooledAreaM2(dto.getCooledAreaM2());
        site.setOccupancyDaysPerWeek(dto.getOccupancyDaysPerWeek());
        site.setOccupancyHoursPerDay(dto.getOccupancyHoursPerDay());
        site.setAverageOccupancyRate(dto.getAverageOccupancyRate());
        site.setElectricityConsumptionKwh(dto.getElectricityConsumptionKwh());
        site.setGasConsumptionKwh(dto.getGasConsumptionKwh());
        site.setFuelOilConsumptionKwh(dto.getFuelOilConsumptionKwh());
        site.setDistrictHeatingConsumptionKwh(dto.getDistrictHeatingConsumptionKwh());
        site.setRenewableProductionKwh(dto.getRenewableProductionKwh());
        site.setRenewableSelfConsumptionRate(dto.getRenewableSelfConsumptionRate());
        site.setActivityDescription(dto.getActivityDescription());
        site.setNotes(dto.getNotes());
        
        site = siteRepository.save(site);
        return toResponseDTO(site);
    }

    @Transactional
    public void deleteSite(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + id));
        enforceOwnership(site);
        // Supprime d'abord les entités dépendantes pour éviter les violations de clé étrangère
        carbonResultRepository.deleteAll(
                carbonResultRepository.findBySiteIdOrderByCalculatedAtDesc(id)
        );
        siteMaterialRepository.deleteAll(
                siteMaterialRepository.findBySiteId(id)
        );
        siteRepository.delete(site);
    }

    private SiteResponseDTO toResponseDTO(Site site) {
        Double lastCo2Total = carbonResultRepository
                .findFirstBySiteIdOrderByCalculatedAtDesc(site.getId())
                .map(CarbonResult::getTotalCo2Kg)
                .orElse(null);

        Double concreteTons = null;
        Double steelTons = null;
        Double glassTons = null;
        Double woodTons = null;
        for (SiteMaterial sm : siteMaterialRepository.findBySiteId(site.getId())) {
            Long mid = sm.getMaterial() != null ? sm.getMaterial().getId() : null;
            double tons = (sm.getQuantity() != null ? sm.getQuantity() : 0) / 1000.0;
            if (Long.valueOf(1L).equals(mid)) concreteTons = tons;
            else if (Long.valueOf(2L).equals(mid)) steelTons = tons;
            else if (Long.valueOf(4L).equals(mid)) glassTons = tons;
            else if (Long.valueOf(5L).equals(mid)) woodTons = tons;
        }
        
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
                .addressLine1(site.getAddressLine1())
                .addressLine2(site.getAddressLine2())
                .postalCode(site.getPostalCode())
                .city(site.getCity())
                .country(site.getCountry())
                .latitude(site.getLatitude())
                .longitude(site.getLongitude())
                .internalCode(site.getInternalCode())
                .externalCode(site.getExternalCode())
                .buildingType(site.getBuildingType())
                .usageType(site.getUsageType())
                .yearOfConstruction(site.getYearOfConstruction())
                .yearOfRenovation(site.getYearOfRenovation())
                .floorsCount(site.getFloorsCount())
                .heatedAreaM2(site.getHeatedAreaM2())
                .cooledAreaM2(site.getCooledAreaM2())
                .occupancyDaysPerWeek(site.getOccupancyDaysPerWeek())
                .occupancyHoursPerDay(site.getOccupancyHoursPerDay())
                .averageOccupancyRate(site.getAverageOccupancyRate())
                .electricityConsumptionKwh(site.getElectricityConsumptionKwh())
                .gasConsumptionKwh(site.getGasConsumptionKwh())
                .fuelOilConsumptionKwh(site.getFuelOilConsumptionKwh())
                .districtHeatingConsumptionKwh(site.getDistrictHeatingConsumptionKwh())
                .renewableProductionKwh(site.getRenewableProductionKwh())
                .renewableSelfConsumptionRate(site.getRenewableSelfConsumptionRate())
                .activityDescription(site.getActivityDescription())
                .notes(site.getNotes())
                .concreteTons(concreteTons)
                .steelTons(steelTons)
                .glassTons(glassTons)
                .woodTons(woodTons)
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .lastCo2Total(lastCo2Total)
                .build();
    }

    private User getCurrentUserIfAny() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private void enforceOwnership(Site site) {
        User current = getCurrentUserIfAny();
        if (current == null) {
            return;
        }
        if ("ADMIN".equalsIgnoreCase(current.getRole())) {
            return;
        }

        boolean hasAccess = false;
        if (site.getUser() != null && site.getUser().getId().equals(current.getId())) {
            hasAccess = true;
        }
        if (!hasAccess && site.getAllowedUsers() != null) {
            hasAccess = site.getAllowedUsers().stream().anyMatch(u -> u.getId() != null && u.getId().equals(current.getId()));
        }

        if (!hasAccess) {
            throw new EntityNotFoundException("Site non trouvé avec l'ID : " + site.getId());
        }
    }
}
