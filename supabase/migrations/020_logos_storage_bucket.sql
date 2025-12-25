-- Migration pour créer le bucket de stockage des logos

-- 1. Créer le bucket 'logos' (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy : Tout le monde peut voir les logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- 3. Policy : Seuls les admins authentifiés peuvent uploader
CREATE POLICY "Admins can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- 4. Policy : Seuls les admins peuvent mettre à jour
CREATE POLICY "Admins can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- 5. Policy : Seuls les admins peuvent supprimer
CREATE POLICY "Admins can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);

-- Note: Le bucket 'logos' accepte tous les types d'images (PNG, JPG, SVG, WebP)
