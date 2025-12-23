-- Mise à jour des RLS policies pour permettre aux admins de voir tous les rendez-vous

-- Supprimer l'ancienne policy de lecture des rendez-vous
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres rendez-vous" ON appointments;

-- Nouvelle policy : les utilisateurs voient leurs RDV OU les admins voient tout
CREATE POLICY "Les utilisateurs voient leurs RDV et les admins voient tout"
    ON appointments FOR SELECT
    USING (
        auth.uid() = user_id
        OR
        (auth.jwt() ->> 'role')::text = 'admin'
    );

-- Policy pour l'insertion (utilisateurs seulement pour leurs propres RDV)
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs rendez-vous" ON appointments;
CREATE POLICY "Les utilisateurs peuvent créer leurs rendez-vous"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy pour la mise à jour
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs rendez-vous" ON appointments;
CREATE POLICY "Les utilisateurs et admins peuvent modifier les rendez-vous"
    ON appointments FOR UPDATE
    USING (
        auth.uid() = user_id
        OR
        (auth.jwt() ->> 'role')::text = 'admin'
    );

-- Policy pour la suppression
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs rendez-vous" ON appointments;
CREATE POLICY "Les utilisateurs et admins peuvent supprimer les rendez-vous"
    ON appointments FOR DELETE
    USING (
        auth.uid() = user_id
        OR
        (auth.jwt() ->> 'role')::text = 'admin'
    );

-- Mise à jour des policies pour appointment_history
DROP POLICY IF EXISTS "Les utilisateurs voient l'historique de leurs RDV" ON appointment_history;
CREATE POLICY "Users et admins voient l'historique"
    ON appointment_history FOR SELECT
    USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE user_id = auth.uid()
        )
        OR
        (auth.jwt() ->> 'role')::text = 'admin'
    );

DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter à l'historique" ON appointment_history;
CREATE POLICY "Users et admins peuvent ajouter à l'historique"
    ON appointment_history FOR INSERT
    WITH CHECK (
        appointment_id IN (
            SELECT id FROM appointments WHERE user_id = auth.uid()
        )
        OR
        (auth.jwt() ->> 'role')::text = 'admin'
    );
