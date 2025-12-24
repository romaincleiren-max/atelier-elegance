-- Migration pour ajouter des contraintes de validation côté serveur
-- Cela renforce la sécurité en validant les données au niveau de la base de données

-- 1. Contraintes pour la table dresses
ALTER TABLE dresses
    -- Valider que le nom n'est pas vide
    ADD CONSTRAINT check_dress_name_not_empty 
        CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 200),
    
    -- Valider que le prix est positif et raisonnable
    ADD CONSTRAINT check_dress_price_positive 
        CHECK (price >= 0 AND price <= 50000),
    
    -- Valider que l'URL de l'image commence par https://
    ADD CONSTRAINT check_dress_image_url_secure 
        CHECK (image_url ~ '^https://'),
    
    -- Valider que la catégorie est valide
    ADD CONSTRAINT check_dress_category_valid 
        CHECK (category IN ('princesse', 'sirene', 'empire', 'boheme'));

-- 2. Contraintes pour la table appointments
ALTER TABLE appointments
    -- Valider que la date est dans le futur (ou aujourd'hui)
    ADD CONSTRAINT check_appointment_date_future 
        CHECK (appointment_date >= CURRENT_DATE),
    
    -- Valider que le statut est valide
    ADD CONSTRAINT check_appointment_status_valid 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    
    -- Valider que le nom du client n'est pas vide
    ADD CONSTRAINT check_client_name_not_empty 
        CHECK (char_length(trim(client_name)) >= 2 AND char_length(client_name) <= 200);

-- 3. Contraintes pour la table atelier_photos
ALTER TABLE atelier_photos
    -- Valider que le titre n'est pas vide
    ADD CONSTRAINT check_photo_title_not_empty 
        CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 200),
    
    -- Valider que l'URL de l'image commence par https://
    ADD CONSTRAINT check_photo_image_url_secure 
        CHECK (image_url ~ '^https://'),
    
    -- Valider que l'ordre d'affichage est positif
    ADD CONSTRAINT check_photo_display_order_positive 
        CHECK (display_order > 0);

-- 4. Contraintes pour la table site_settings
ALTER TABLE site_settings
    -- Valider que la clé n'est pas vide
    ADD CONSTRAINT check_setting_key_not_empty 
        CHECK (char_length(trim(key)) >= 1 AND char_length(key) <= 100);

-- 5. Contraintes pour la table custom_proposals
ALTER TABLE custom_proposals
    -- Valider que la description n'est pas vide
    ADD CONSTRAINT check_proposal_description_not_empty 
        CHECK (char_length(trim(description)) >= 10 AND char_length(description) <= 5000),
    
    -- Valider le budget s'il est fourni
    ADD CONSTRAINT check_proposal_budget_positive 
        CHECK (budget_min IS NULL OR (budget_min >= 0 AND budget_min <= 50000)),
    
    ADD CONSTRAINT check_proposal_budget_max_valid 
        CHECK (budget_max IS NULL OR (budget_max >= budget_min AND budget_max <= 50000));

-- Note: Ces contraintes empêchent l'insertion de données invalides même si
-- la validation côté client est contournée
