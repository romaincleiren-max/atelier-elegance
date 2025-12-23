-- Migration: Configuration du bucket Storage pour les images de robes
-- Description: Crée le bucket dress-images et configure les politiques RLS

-- 1. Créer le bucket public pour les images de robes
INSERT INTO storage.buckets (id, name, public)
VALUES ('dress-images', 'dress-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique: Tout le monde peut VOIR les images (SELECT)
CREATE POLICY "Public can view dress images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'dress-images' );

-- 3. Politique: Seuls les admins peuvent UPLOADER des images (INSERT)
CREATE POLICY "Admins can upload dress images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dress-images'
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- 4. Politique: Seuls les admins peuvent MODIFIER des images (UPDATE)
CREATE POLICY "Admins can update dress images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dress-images'
  AND (auth.jwt() ->> 'role')::text = 'admin'
)
WITH CHECK (
  bucket_id = 'dress-images'
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- 5. Politique: Seuls les admins peuvent SUPPRIMER des images (DELETE)
CREATE POLICY "Admins can delete dress images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dress-images'
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- Note: Pour obtenir l'URL publique d'une image uploadée:
-- https://[votre-projet-id].supabase.co/storage/v1/object/public/dress-images/[nom-fichier.jpg]

-- Exemple d'upload depuis JavaScript:
-- const { data, error } = await supabase.storage
--   .from('dress-images')
--   .upload('robe-boheme-1.jpg', fileInput.files[0])
