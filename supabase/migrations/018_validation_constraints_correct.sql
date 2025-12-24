-- Migration FINALE pour les contraintes de validation
-- Utilise les vrais noms de colonnes basés sur le schéma actuel

-- 1. Contraintes pour la table dresses
ALTER TABLE dresses
    ADD CONSTRAINT check_dress_name_not_empty 
        CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 200),
    
    ADD CONSTRAINT check_dress_price_positive 
        CHECK (price >= 0 AND price <= 50000),
    
    ADD CONSTRAINT check_dress_image_url_secure 
        CHECK (image_url ~ '^https://'),
    
    ADD CONSTRAINT check_dress_category_valid 
        CHECK (category IN ('princesse', 'sirene', 'empire', 'boheme'));

-- 2. Contraintes pour la table appointments
ALTER TABLE appointments
    ADD CONSTRAINT check_appointment_preferred_date_future 
        CHECK (preferred_date IS NULL OR preferred_date >= CURRENT_DATE),
    
    ADD CONSTRAINT check_appointment_status_valid 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    
    ADD CONSTRAINT check_first_name_not_empty 
        CHECK (char_length(trim(first_name)) >= 2 AND char_length(first_name) <= 100),
    
    ADD CONSTRAINT check_last_name_not_empty 
        CHECK (char_length(trim(last_name)) >= 2 AND char_length(last_name) <= 100),
    
    ADD CONSTRAINT check_email_format 
        CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- 3. Contraintes pour la table atelier_photos
ALTER TABLE atelier_photos
    ADD CONSTRAINT check_photo_title_not_empty 
        CHECK (char_length(trim(title)) >= 2 AND char_length(title) <= 200),
    
    ADD CONSTRAINT check_photo_image_url_secure 
        CHECK (image_url ~ '^https://'),
    
    ADD CONSTRAINT check_photo_display_order_positive 
        CHECK (display_order > 0);

-- 4. Contraintes pour la table site_settings
ALTER TABLE site_settings
    ADD CONSTRAINT check_setting_key_not_empty 
        CHECK (char_length(trim(setting_key)) >= 1 AND char_length(setting_key) <= 100);

-- 5. Contraintes pour la table custom_proposals
-- Note: budget est VARCHAR(50), pas un numérique
ALTER TABLE custom_proposals
    ADD CONSTRAINT check_proposal_description_not_empty 
        CHECK (char_length(trim(description)) >= 10 AND char_length(description) <= 5000),
    
    ADD CONSTRAINT check_proposal_first_name_not_empty 
        CHECK (char_length(trim(first_name)) >= 2 AND char_length(first_name) <= 100),
    
    ADD CONSTRAINT check_proposal_last_name_not_empty 
        CHECK (char_length(trim(last_name)) >= 2 AND char_length(last_name) <= 100),
    
    ADD CONSTRAINT check_proposal_email_format 
        CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Ces contraintes empêchent l'insertion de données invalides
-- même si la validation côté client est contournée
