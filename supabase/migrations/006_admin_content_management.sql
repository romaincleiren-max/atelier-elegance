-- Migration pour la gestion du contenu par l'admin
-- Supprime la notion de taille, ajoute gestion des photos d'atelier et messages contact

-- 1. Supprimer la colonne size de la table appointments (plus besoin de taille)
ALTER TABLE appointments DROP COLUMN IF EXISTS size;

-- 2. Table pour les photos de l'atelier (page Essayage/À propos)
CREATE TABLE IF NOT EXISTS atelier_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour l'ordre d'affichage
CREATE INDEX idx_atelier_photos_order ON atelier_photos(display_order);

-- 3. Table pour les messages de contact (sans nécessiter de compte)
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche et tri
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- 4. Table pour les informations de l'atelier (à propos)
CREATE TABLE IF NOT EXISTS atelier_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    description TEXT,
    opening_hours TEXT,
    map_url TEXT, -- URL Google Maps embed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Il n'y aura qu'une seule ligne dans cette table
-- Insérer les infos par défaut
INSERT INTO atelier_info (address, city, postal_code, phone, email, description, opening_hours)
VALUES (
    '123 Rue de l''Élégance',
    'Paris',
    '75001',
    '01 23 45 67 89',
    'contact@atelier-elegance.fr',
    'Atelier Élégance vous accueille dans un cadre chaleureux et raffiné pour créer ensemble la robe de vos rêves.',
    'Lundi - Vendredi: 10h - 18h\nSamedi: 10h - 17h\nDimanche: Fermé\n\nSur rendez-vous uniquement'
);

-- RLS Policies

-- Photos de l'atelier: tout le monde peut voir, seuls les admins peuvent modifier
ALTER TABLE atelier_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les photos de l'atelier"
    ON atelier_photos FOR SELECT
    USING (true);

CREATE POLICY "Seuls les admins peuvent gérer les photos"
    ON atelier_photos FOR ALL
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

-- Messages de contact: seuls les admins peuvent voir
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seuls les admins peuvent voir les messages"
    ON contact_messages FOR SELECT
    USING ((auth.jwt() ->> 'role')::text = 'admin');

-- Tout le monde peut envoyer un message (INSERT sans authentification)
CREATE POLICY "Tout le monde peut envoyer un message"
    ON contact_messages FOR INSERT
    WITH CHECK (true);

-- Seuls les admins peuvent modifier/supprimer
CREATE POLICY "Seuls les admins peuvent gérer les messages"
    ON contact_messages FOR UPDATE
    USING ((auth.jwt() ->> 'role')::text = 'admin');

CREATE POLICY "Seuls les admins peuvent supprimer les messages"
    ON contact_messages FOR DELETE
    USING ((auth.jwt() ->> 'role')::text = 'admin');

-- Infos atelier: tout le monde peut voir, seuls les admins peuvent modifier
ALTER TABLE atelier_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les infos de l'atelier"
    ON atelier_info FOR SELECT
    USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les infos"
    ON atelier_info FOR ALL
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

-- Trigger pour updated_at sur atelier_photos
CREATE TRIGGER update_atelier_photos_updated_at
    BEFORE UPDATE ON atelier_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur atelier_info
CREATE TRIGGER update_atelier_info_updated_at
    BEFORE UPDATE ON atelier_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE atelier_photos IS 'Photos de l''atelier pour la page À propos/Essayage';
COMMENT ON TABLE contact_messages IS 'Messages de contact envoyés via le formulaire (sans compte requis)';
COMMENT ON TABLE atelier_info IS 'Informations de l''atelier (adresse, horaires, etc.)';
COMMENT ON COLUMN contact_messages.status IS 'Statut: new, read, replied, archived';
