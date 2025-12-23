-- Migration: Ajouter la colonne 'available' à la table dresses
-- Description: Permet de marquer une robe comme disponible ou non

-- Ajouter la colonne available (par défaut true)
ALTER TABLE dresses
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- Mettre à jour toutes les robes existantes pour qu'elles soient disponibles
UPDATE dresses
SET available = true
WHERE available IS NULL;
