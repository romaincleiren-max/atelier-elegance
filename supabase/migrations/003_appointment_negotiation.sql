-- Ajouter une table pour l'historique des négociations de rendez-vous
CREATE TABLE appointment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    proposed_by VARCHAR(50) NOT NULL, -- 'user' ou 'admin'
    proposed_date DATE,
    proposed_time TIME,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modifier les statuts possibles des rendez-vous
-- pending: Demande initiale de l'user
-- waiting_admin: User a répondu, attend réponse admin
-- waiting_user: Admin a contre-proposé, attend réponse user
-- confirmed: Admin a confirmé définitivement (RDV validé)
-- cancelled: RDV annulé par l'une des parties

-- Ajouter un champ pour savoir qui a fait la dernière proposition
ALTER TABLE appointments ADD COLUMN last_proposal_by VARCHAR(50) DEFAULT 'user';

-- Ajouter un champ pour compter les négociations
ALTER TABLE appointments ADD COLUMN negotiation_count INTEGER DEFAULT 0;

-- Index pour l'historique
CREATE INDEX idx_appointment_history_appointment ON appointment_history(appointment_id);
CREATE INDEX idx_appointment_history_created ON appointment_history(created_at);

-- RLS pour l'historique
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir l'historique de leurs RDV
CREATE POLICY "Les utilisateurs voient l'historique de leurs RDV"
    ON appointment_history FOR SELECT
    USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE user_id = auth.uid()
        )
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Les utilisateurs peuvent ajouter à l'historique de leurs RDV
CREATE POLICY "Les utilisateurs peuvent ajouter à l'historique"
    ON appointment_history FOR INSERT
    WITH CHECK (
        appointment_id IN (
            SELECT id FROM appointments WHERE user_id = auth.uid()
        )
        OR auth.jwt() ->> 'role' = 'admin'
    );
