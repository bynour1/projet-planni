-- Script pour nettoyer les utilisateurs non confirmés
-- À exécuter dans phpMyAdmin ou MySQL Workbench

-- Voir les utilisateurs non confirmés
SELECT id, email, nom, prenom, role, isConfirmed, mustChangePassword 
FROM users 
WHERE isConfirmed = 0;

-- Supprimer les utilisateurs non confirmés (optionnel)
-- Décommenter la ligne suivante pour exécuter
-- DELETE FROM users WHERE isConfirmed = 0;

-- Ou supprimer des utilisateurs spécifiques
-- DELETE FROM users WHERE email IN ('medecin1@hopital.com', 'technicien1@hopital.com');

-- Vérifier les utilisateurs restants
SELECT id, email, nom, prenom, role, isConfirmed 
FROM users 
ORDER BY id;
