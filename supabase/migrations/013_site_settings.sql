-- Migration: Table des paramètres du site
-- Description: Permet de configurer les paramètres du site (vidéo de fond, etc.)

-- 1. Créer la table des paramètres
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Tout le monde peut lire les paramètres
CREATE POLICY "Public can view site settings"
ON site_settings FOR SELECT
TO public
USING (true);

-- 4. Seuls les admins peuvent modifier les paramètres
CREATE POLICY "Admins can manage site settings"
ON site_settings FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- 5. Insérer le paramètre par défaut pour la vidéo YouTube
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'hero_video_url',
  'https://www.youtube.com/watch?v=k1gj5wCLAhc',
  'URL de la vidéo YouTube affichée en fond de la page d''accueil'
)
ON CONFLICT (setting_key) DO NOTHING;

-- 6. Insérer le paramètre pour le timestamp de démarrage de la vidéo
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'hero_video_start',
  '51',
  'Timestamp de démarrage de la vidéo (en secondes)'
)
ON CONFLICT (setting_key) DO NOTHING;

-- 7. Créer une fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_setting_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_site_settings_timestamp
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_setting_timestamp();
