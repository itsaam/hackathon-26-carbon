-- Matériaux (facteurs d'émission inspirés Base Carbone ADEME)
INSERT INTO materials (name, emission_factor, unit, source, category, sub_category, reference_year, data_source_url)
VALUES
('Béton armé C25/30', 230.0, 'tonne', 'ADEME', 'béton', 'C25/30', 2024, 'https://data.ademe.fr/datasets/base-carboner'),
('Acier de construction (primaire)', 1850.0, 'tonne', 'ADEME', 'acier', 'primaire', 2024, 'https://data.ademe.fr/datasets/base-carboner'),
('Acier de construction (recyclé)', 500.0, 'tonne', 'ADEME', 'acier', 'recyclé', 2024, 'https://data.ademe.fr/datasets/base-carboner'),
('Verre plat façade', 1200.0, 'tonne', 'ADEME', 'verre', 'plat', 2024, 'https://data.ademe.fr/datasets/base-carboner'),
('Bois résineux structurel', 30.0, 'tonne', 'ADEME', 'bois', 'résineux', 2024, 'https://data.ademe.fr/datasets/base-carboner'),
('Aluminium primaire', 8000.0, 'tonne', 'ADEME', 'aluminium', 'primaire', 2024, 'https://data.ademe.fr/datasets/base-carboner')
ON CONFLICT DO NOTHING;

-- Facteurs énergie (kgCO2e/kWh, ordre de grandeur ADEME 2024)
INSERT INTO energy_factors (energy_type, emission_factor, source, year, country, gwp_per_kwh, data_source_url)
VALUES
('electricity', 0.056, 'ADEME', 2024, 'FR', 0.056, 'https://data.ademe.fr/datasets/base-carboner'),
('gas', 0.227, 'ADEME', 2024, 'FR', 0.227, 'https://data.ademe.fr/datasets/base-carboner'),
('fuel_oil', 0.324, 'ADEME', 2024, 'FR', 0.324, 'https://data.ademe.fr/datasets/base-carboner'),
('district_heating', 0.180, 'ADEME', 2024, 'FR', 0.180, 'https://data.ademe.fr/datasets/base-carboner')
ON CONFLICT DO NOTHING;
