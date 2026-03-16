-- Matériaux (facteurs d'émission ADEME)
INSERT INTO materials (name, emission_factor, unit, source) VALUES
('Béton armé', 230.0, 'tonne', 'ADEME'),
('Acier primaire', 1850.0, 'tonne', 'ADEME'),
('Acier recyclé', 500.0, 'tonne', 'ADEME'),
('Verre plat', 1200.0, 'tonne', 'ADEME'),
('Bois résineux', 30.0, 'tonne', 'ADEME'),
('Aluminium primaire', 8000.0, 'tonne', 'ADEME')
ON CONFLICT DO NOTHING;

-- Facteurs énergie
INSERT INTO energy_factors (energy_type, emission_factor, source, year) VALUES
('Électricité France', 0.056, 'ADEME', 2024),
('Gaz naturel', 0.227, 'ADEME', 2024),
('Fioul domestique', 0.324, 'ADEME', 2024)
ON CONFLICT DO NOTHING;
