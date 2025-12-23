-- Table pour gérer les disponibilités de l'admin (calendrier)
-- Permet à l'admin de bloquer des créneaux ou marquer des disponibilités

CREATE TABLE calendar_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT false, -- false = bloqué/indisponible, true = disponible
    note TEXT, -- Note optionnelle (ex: "Congés", "Formation", etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par date
CREATE INDEX idx_calendar_availability_date ON calendar_availability(date);
CREATE INDEX idx_calendar_availability_date_time ON calendar_availability(date, start_time, end_time);

-- RLS: Tout le monde peut voir les disponibilités (pour que les users voient quand l'admin est dispo)
ALTER TABLE calendar_availability ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir toutes les disponibilités
CREATE POLICY "Tout le monde peut voir les disponibilités"
    ON calendar_availability FOR SELECT
    USING (true);

-- Seuls les admins peuvent créer/modifier/supprimer
CREATE POLICY "Seuls les admins peuvent gérer les disponibilités"
    ON calendar_availability FOR ALL
    USING ((auth.jwt() ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_availability_updated_at
    BEFORE UPDATE ON calendar_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vue helper pour voir les créneaux occupés par des RDV confirmés
CREATE OR REPLACE VIEW occupied_slots AS
SELECT
    preferred_date as date,
    preferred_time as time,
    'appointment' as type,
    CONCAT(first_name, ' ', last_name) as description
FROM appointments
WHERE status = 'confirmed' OR status = 'waiting_user' OR status = 'waiting_admin';

-- Commentaires pour documentation
COMMENT ON TABLE calendar_availability IS 'Gestion du calendrier de disponibilités de l''admin';
COMMENT ON COLUMN calendar_availability.is_available IS 'false = bloqué/indisponible, true = disponible explicitement';
COMMENT ON COLUMN calendar_availability.note IS 'Raison du blocage ou note sur la disponibilité';
