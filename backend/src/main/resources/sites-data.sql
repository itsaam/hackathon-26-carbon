-- =============================================================================
-- Script complet : sites + composition principale (ACV) - PostgreSQL
-- Prérequis : user id=3 existant, data.sql exécuté (matériaux id 1-6).
-- Profils variés : forte conso électrique/gaz = gros carbone (D/C), faible + renouvelable = petit (A/B).
-- Classe carbone calculée automatiquement par l'appli.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PARTIE 1 : SITES (toutes les colonnes remplies)
-- Profils : 1 Rennes A, 2 Paris D, 3 Marseille B, 4 Montpellier C, 5 Nantes A,
--           6 Lyon D, 7 Lille C, 8 Strasbourg B
-- -----------------------------------------------------------------------------

-- 1) Site Rennes — faible conso, beaucoup de renouvelable → classe A
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    1, 3, 'Site Rennes', 1800,
    184, 83, 41,
    11500, 450, 1037,
    '18 rue de la Borderie', 'Bâtiment Atalante', '35000', 'Rennes', 'France',
    48.1173, -1.6778, 'SITE-RENNES', 'EXT-RENNES',
    'Bureaux tertiaires', 'Plateaux open-space', 1989, 2018,
    6, 1700, 1500,
    5, 11, 0.89,
    6500, 1500, 0,
    0, 8500, 0.95,
    DATE '1990-01-01',
    'Centre de services orienté digital workplace et projets clients.',
    'Site pivot démo : données complètes typologie et énergie.',
    '2026-03-16 12:17:28.381168', '2026-03-16 17:51:04.360582'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 2) Site Paris La Défense — grosse conso élec + gaz, peu de renouvelable → classe D
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    2, 3, 'Site Paris La Défense', 2100,
    220, 40, 60,
    285000, 520, 1500,
    '15 parvis de La Défense', 'Tour de bureaux', '92400', 'Courbevoie', 'France',
    48.8925, 2.2369, 'SITE-PARIS-LD', 'EXT-PARIS-LD',
    'Tour de bureaux', 'Bureaux siège', 2005, 2020,
    35, 2000, 1900,
    5, 12, 0.85,
    220000, 65000, 0,
    0, 5000, 0.08,
    DATE '2005-09-01',
    'Siège régional avec forte densité de postes et salles de réunion.',
    'Scénarios d''optimisation énergétique.',
    '2026-03-16 14:18:32.485105', '2026-03-16 18:09:37.285030'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 3) Site Marseille — conso modérée, un peu de renouvelable → classe B
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    3, 3, 'Site Marseille', 950,
    120, 65, 30,
    18500, 320, 720,
    '10 Quai du Lazaret', 'Bâtiment mixte bureaux / ateliers', '13002', 'Marseille', 'France',
    43.3045, 5.3698, 'SITE-MARSEILLE', 'EXT-MARSEILLE',
    'Bureaux + ateliers', 'Back-office + logistique', 2010, 2019,
    4, 900, 700,
    6, 10, 0.8,
    12000, 6500, 0,
    0, 4500, 0.35,
    DATE '2011-03-15',
    'Site de back-office régional avec zones de stockage et ateliers légers.',
    'Profils énergétiques différents des sièges tertiaires.',
    '2026-03-16 14:18:50.698058', '2026-03-16 14:19:23.903282'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 4) Site Montpellier — grosse conso élec, peu de renouvelable → classe C
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    4, 3, 'Site Montpellier', 1200,
    10, 10, 10,
    72000, 380, 1260,
    '99 rue de la Carrierasse', 'ZAC Millénaire', '34000', 'Montpellier', 'France',
    43.6108, 3.8767, 'SITE-MONTPELLIER', 'EXT-MONTPELLIER',
    'Immeuble récent', 'Innovation lab + flex office', 2016, 2023,
    5, 1150, 1100,
    4, 10, 0.7,
    58000, 14000, 0,
    0, 8000, 0.15,
    DATE '2017-01-01',
    'Site de test pour flex office, IoT et smart building.',
    'Scénarios rénovation / extension et autoconsommation.',
    '2026-03-16 17:01:22.907576', '2026-03-16 17:01:22.907576'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 5) Site Nantes — faible conso, bon renouvelable → classe A
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    5, 3, 'Site Nantes', 453,
    34, 20, 32,
    22000, 280, 234,
    '2 rue de l''École des Mines', 'Quartier de la Création', '44200', 'Nantes', 'France',
    47.2184, -1.5536, 'SITE-NANTES', 'EXT-NANTES',
    'Locaux éducatifs', 'Formation', 2008, 2021,
    2, 430, 400,
    5, 15, 0.99,
    12000, 2000, 0,
    0, 18000, 0.88,
    DATE '2009-09-01',
    'Ancienne école transformée en site de formation numérique et durable.',
    'Rénovation profonde et PV en toiture.',
    '2026-03-16 18:52:02.317453', '2026-03-16 18:52:48.455872'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 6) Site Lyon — grosse conso élec + gaz, peu de renouvelable → classe D
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    6, 3, 'Site Lyon', 2400,
    80, 60, 40,
    195000, 620, 1100,
    '25 rue du Dauphiné', 'Bâtiment Part-Dieu', '69003', 'Lyon', 'France',
    45.7600, 4.8400, 'SITE-LYON', 'EXT-LYON',
    'Bureaux', 'Siège régional', 1995, 2015,
    12, 2200, 2000,
    5, 11, 0.82,
    145000, 50000, 0,
    0, 3000, 0.05,
    DATE '1996-01-01',
    'Siège régional, forte consommation HVAC et data center.',
    'Profil énergétique intense pour démo classe D.',
    '2026-03-16 10:00:00', '2026-03-16 10:00:00'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 7) Site Lille — conso moyenne-forte, peu de renouvelable → classe C
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    7, 3, 'Site Lille', 1650,
    50, 30, 45,
    88000, 410, 820,
    '165 avenue de la République', 'Euralille', '59000', 'Lille', 'France',
    50.6292, 3.0573, 'SITE-LILLE', 'EXT-LILLE',
    'Bureaux', 'Plateaux tertiaires', 2000, 2018,
    8, 1550, 1400,
    5, 10, 0.78,
    52000, 36000, 0,
    0, 6000, 0.12,
    DATE '2001-06-01',
    'Bureaux Euralille, chauffage gaz dominant.',
    'Profil classe C pour démo.',
    '2026-03-16 10:00:00', '2026-03-16 10:00:00'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- 8) Site Strasbourg — faible conso, bon renouvelable → classe B
INSERT INTO sites (
    id, user_id, name, surface_m2,
    parking_underground, parking_basement, parking_outdoor,
    energy_consumption_kwh, employee_count, workstation_count,
    address_line1, address_line2, postal_code, city, country,
    latitude, longitude, internal_code, external_code,
    building_type, usage_type, year_of_construction, year_of_renovation,
    floors_count, heated_area_m2, cooled_area_m2,
    occupancy_days_per_week, occupancy_hours_per_day, average_occupancy_rate,
    electricity_consumption_kwh, gas_consumption_kwh, fuel_oil_consumption_kwh,
    district_heating_consumption_kwh, renewable_production_kwh, renewable_self_consumption_rate,
    open_since, activity_description, notes,
    created_at, updated_at
) VALUES (
    8, 3, 'Site Strasbourg', 1100,
    25, 15, 30,
    18500, 290, 580,
    '5 place des Halles', 'Quartier Centre', '67000', 'Strasbourg', 'France',
    48.5734, 7.7521, 'SITE-STRASBOURG', 'EXT-STRASBOURG',
    'Bureaux', 'Back-office', 2012, 2022,
    5, 1050, 950,
    5, 10, 0.85,
    9000, 2500, 0,
    0, 12000, 0.72,
    DATE '2013-04-01',
    'Bâtiment rénové, chauffage urbain et forte part renouvelable.',
    'Profil vert pour démo classe B.',
    '2026-03-16 10:00:00', '2026-03-16 10:00:00'
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, name = EXCLUDED.name, surface_m2 = EXCLUDED.surface_m2,
    parking_underground = EXCLUDED.parking_underground, parking_basement = EXCLUDED.parking_basement, parking_outdoor = EXCLUDED.parking_outdoor,
    energy_consumption_kwh = EXCLUDED.energy_consumption_kwh, employee_count = EXCLUDED.employee_count, workstation_count = EXCLUDED.workstation_count,
    address_line1 = EXCLUDED.address_line1, address_line2 = EXCLUDED.address_line2, postal_code = EXCLUDED.postal_code, city = EXCLUDED.city, country = EXCLUDED.country,
    latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, internal_code = EXCLUDED.internal_code, external_code = EXCLUDED.external_code,
    building_type = EXCLUDED.building_type, usage_type = EXCLUDED.usage_type,
    year_of_construction = EXCLUDED.year_of_construction, year_of_renovation = EXCLUDED.year_of_renovation,
    floors_count = EXCLUDED.floors_count, heated_area_m2 = EXCLUDED.heated_area_m2, cooled_area_m2 = EXCLUDED.cooled_area_m2,
    occupancy_days_per_week = EXCLUDED.occupancy_days_per_week, occupancy_hours_per_day = EXCLUDED.occupancy_hours_per_day, average_occupancy_rate = EXCLUDED.average_occupancy_rate,
    electricity_consumption_kwh = EXCLUDED.electricity_consumption_kwh, gas_consumption_kwh = EXCLUDED.gas_consumption_kwh,
    fuel_oil_consumption_kwh = EXCLUDED.fuel_oil_consumption_kwh, district_heating_consumption_kwh = EXCLUDED.district_heating_consumption_kwh,
    renewable_production_kwh = EXCLUDED.renewable_production_kwh, renewable_self_consumption_rate = EXCLUDED.renewable_self_consumption_rate,
    open_since = EXCLUDED.open_since, activity_description = EXCLUDED.activity_description, notes = EXCLUDED.notes,
    updated_at = EXCLUDED.updated_at;

-- Séquence sites
SELECT setval(pg_get_serial_sequence('sites', 'id'), (SELECT COALESCE(MAX(id), 1) FROM sites));


-- -----------------------------------------------------------------------------
-- PARTIE 2 : COMPOSITION PRINCIPALE (ACV) - site_materials
-- Référence materials : 1=Béton C25/30, 2=Acier primaire, 3=Acier recyclé,
--                       4=Verre plat, 5=Bois résineux, 6=Aluminium primaire
-- Stages ACV : production | construction | usage | end_of_life
-- -----------------------------------------------------------------------------

-- Nettoyage des compositions existantes pour les sites 1 à 8
DELETE FROM site_materials WHERE site_id BETWEEN 1 AND 8;

-- Site 1 - Rennes (bureaux 1800 m², 6 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(1, 1, 420, 'tonne', 1800, 168, 'construction'),
(1, 2, 85, 'tonne', 1800, NULL, 'construction'),
(1, 3, 12, 'tonne', NULL, NULL, 'construction'),
(1, 4, 18, 'tonne', 1200, NULL, 'construction'),
(1, 5, 8, 'tonne', 400, NULL, 'construction'),
(1, 6, 2.5, 'tonne', NULL, NULL, 'construction');

-- Site 2 - Paris La Défense (tour 2100 m², 35 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(2, 1, 2800, 'tonne', 73500, 2200, 'construction'),
(2, 2, 420, 'tonne', 73500, NULL, 'construction'),
(2, 3, 45, 'tonne', NULL, NULL, 'construction'),
(2, 4, 95, 'tonne', 6500, NULL, 'construction'),
(2, 5, 15, 'tonne', 800, NULL, 'construction'),
(2, 6, 18, 'tonne', NULL, NULL, 'construction');

-- Site 3 - Marseille (mixte 950 m², 4 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(3, 1, 190, 'tonne', 950, 76, 'construction'),
(3, 2, 38, 'tonne', 950, NULL, 'construction'),
(3, 3, 5, 'tonne', NULL, NULL, 'construction'),
(3, 4, 8, 'tonne', 600, NULL, 'construction'),
(3, 5, 6, 'tonne', 200, NULL, 'construction'),
(3, 6, 1.2, 'tonne', NULL, NULL, 'construction');

-- Site 4 - Montpellier (1200 m², 5 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(4, 1, 300, 'tonne', 1200, 120, 'construction'),
(4, 2, 62, 'tonne', 1200, NULL, 'construction'),
(4, 3, 8, 'tonne', NULL, NULL, 'construction'),
(4, 4, 14, 'tonne', 900, NULL, 'construction'),
(4, 5, 10, 'tonne', 350, NULL, 'construction'),
(4, 6, 3, 'tonne', NULL, NULL, 'construction');

-- Site 5 - Nantes (453 m², 2 étages, ancienne école)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(5, 1, 95, 'tonne', 453, 36, 'construction'),
(5, 2, 18, 'tonne', 453, NULL, 'construction'),
(5, 3, 2, 'tonne', NULL, NULL, 'construction'),
(5, 4, 5, 'tonne', 320, NULL, 'construction'),
(5, 5, 12, 'tonne', 250, NULL, 'construction'),
(5, 6, 0.8, 'tonne', NULL, NULL, 'construction');

-- Site 6 - Lyon (2400 m², 12 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(6, 1, 580, 'tonne', 2400, 232, 'construction'),
(6, 2, 115, 'tonne', 2400, NULL, 'construction'),
(6, 3, 15, 'tonne', NULL, NULL, 'construction'),
(6, 4, 24, 'tonne', 1600, NULL, 'construction'),
(6, 5, 12, 'tonne', 500, NULL, 'construction'),
(6, 6, 4, 'tonne', NULL, NULL, 'construction');

-- Site 7 - Lille (1650 m², 8 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(7, 1, 380, 'tonne', 1650, 152, 'construction'),
(7, 2, 75, 'tonne', 1650, NULL, 'construction'),
(7, 3, 10, 'tonne', NULL, NULL, 'construction'),
(7, 4, 16, 'tonne', 1100, NULL, 'construction'),
(7, 5, 9, 'tonne', 380, NULL, 'construction'),
(7, 6, 2.8, 'tonne', NULL, NULL, 'construction');

-- Site 8 - Strasbourg (1100 m², 5 étages)
INSERT INTO site_materials (site_id, material_id, quantity, unit, area_m2, volume_m3, life_cycle_stage) VALUES
(8, 1, 260, 'tonne', 1100, 104, 'construction'),
(8, 2, 52, 'tonne', 1100, NULL, 'construction'),
(8, 3, 7, 'tonne', NULL, NULL, 'construction'),
(8, 4, 12, 'tonne', 750, NULL, 'construction'),
(8, 5, 8, 'tonne', 300, NULL, 'construction'),
(8, 6, 2, 'tonne', NULL, NULL, 'construction');