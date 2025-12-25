-- Migration pour le système de gestion des logos
-- Permet à l'admin de gérer les logos affichés sur le site

-- 1. Créer la table logos
CREATE TABLE IF NOT EXISTS logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  placement TEXT NOT NULL, -- header, footer, hero, sponsors, partenaires
  display_order INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  width INTEGER, -- largeur en pixels (optionnel)
  height INTEGER, -- hauteur en pixels (optionnel)
  link_url TEXT, -- URL de lien optionnel
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

-- 3. Policy : Tout le monde peut voir les logos actifs
CREATE POLICY "Public can view active logos"
ON logos FOR SELECT
TO public
USING (active = true);

-- 4. Policy : Seuls les admins peuvent gérer les logos
CREATE POLICY "Admins can manage logos"
ON logos FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- 5. Contraintes de validation
ALTER TABLE logos
    ADD CONSTRAINT check_logo_name_not_empty 
        CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 100),
    
    ADD CONSTRAINT check_logo_image_url_secure 
        CHECK (image_url ~ '^https://'),
    
    ADD CONSTRAINT check_logo_placement_valid 
        CHECK (placement IN ('header', 'footer', 'hero', 'sponsors', 'partenaires', 'sidebar')),
    
    ADD CONSTRAINT check_logo_display_order_positive 
        CHECK (display_order > 0),
    
    ADD CONSTRAINT check_logo_dimensions_positive 
        CHECK ((width IS NULL OR width > 0) AND (height IS NULL OR height > 0));

-- 6. Index pour performance
CREATE INDEX idx_logos_placement ON logos(placement);
CREATE INDEX idx_logos_active ON logos(active);
CREATE INDEX idx_logos_display_order ON logos(display_order);

-- 7. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_logos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_logos_timestamp
BEFORE UPDATE ON logos
FOR EACH ROW
EXECUTE FUNCTION update_logos_timestamp();

-- 8. Insertion de logos par défaut (exemple)
INSERT INTO logos (name, description, image_url, placement, display_order, active)
VALUES 
  ('Logo Principal', 'Logo principal de Coline Cleiren Couture', 'https://via.placeholder.com/200x80?text=Logo+Principal', 'header', 1, false),
  ('Logo Footer', 'Logo pour le pied de page', 'https://via.placeholder.com/150x60?text=Logo+Footer', 'footer', 1, false)
ON CONFLICT DO NOTHING;

-- Note: Les admins devront uploader leurs vrais logos via l'interface admin
