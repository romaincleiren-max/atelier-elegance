-- Enable Row Level Security sur toutes les tables
ALTER TABLE dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_proposals ENABLE ROW LEVEL SECURITY;

-- Policies pour la table dresses (robes)
-- Tout le monde peut voir les robes
CREATE POLICY "Les robes sont visibles par tous"
    ON dresses FOR SELECT
    USING (true);

-- Seuls les admins peuvent modifier les robes
CREATE POLICY "Seuls les admins peuvent créer des robes"
    ON dresses FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Seuls les admins peuvent modifier des robes"
    ON dresses FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Seuls les admins peuvent supprimer des robes"
    ON dresses FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policies pour la table appointments (rendez-vous)
-- Les utilisateurs peuvent voir leurs propres rendez-vous
CREATE POLICY "Les utilisateurs voient leurs rendez-vous"
    ON appointments FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Les utilisateurs authentifiés peuvent créer des rendez-vous
CREATE POLICY "Les utilisateurs peuvent créer des rendez-vous"
    ON appointments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR auth.uid() IS NULL
    );

-- Les utilisateurs peuvent modifier leurs propres rendez-vous
CREATE POLICY "Les utilisateurs peuvent modifier leurs rendez-vous"
    ON appointments FOR UPDATE
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Les utilisateurs peuvent annuler leurs propres rendez-vous
CREATE POLICY "Les utilisateurs peuvent annuler leurs rendez-vous"
    ON appointments FOR DELETE
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Policies pour la table favorites (favoris)
-- Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Les utilisateurs voient leurs favoris"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Les utilisateurs peuvent ajouter des favoris"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Les utilisateurs peuvent supprimer leurs favoris"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Policies pour la table custom_proposals (propositions personnalisées)
-- Les utilisateurs peuvent voir leurs propres propositions
CREATE POLICY "Les utilisateurs voient leurs propositions"
    ON custom_proposals FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Les utilisateurs peuvent créer des propositions
CREATE POLICY "Les utilisateurs peuvent créer des propositions"
    ON custom_proposals FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR auth.uid() IS NULL
    );

-- Seuls les admins peuvent modifier le statut des propositions
CREATE POLICY "Seuls les admins modifient les propositions"
    ON custom_proposals FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');
