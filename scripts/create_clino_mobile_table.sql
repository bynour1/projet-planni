-- Script SQL pour créer la table clino_mobile
-- À exécuter dans phpMyAdmin ou via la ligne de commande MySQL

CREATE TABLE IF NOT EXISTS clino_mobile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    medecin VARCHAR(100) NOT NULL,
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_clino_mobile_date ON clino_mobile(date);
CREATE INDEX idx_clino_mobile_medecin ON clino_mobile(medecin);

-- Vue pour voir les interventions triées par date et heure
CREATE OR REPLACE VIEW v_clino_mobile_ordered AS
SELECT * FROM clino_mobile ORDER BY date ASC, heure ASC;

