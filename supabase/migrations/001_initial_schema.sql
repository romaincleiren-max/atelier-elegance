-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des robes de mariée
CREATE TABLE dresses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    style VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rendez-vous
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dress_id BIGINT REFERENCES dresses(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_date DATE,
    preferred_time TIME,
    size VARCHAR(50),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des favoris
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dress_id BIGINT REFERENCES dresses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, dress_id)
);

-- Table des propositions personnalisées
CREATE TABLE custom_proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    wedding_date DATE,
    style VARCHAR(100),
    budget VARCHAR(50),
    description TEXT NOT NULL,
    preferences TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des robes par défaut
INSERT INTO dresses (name, style, description, price, category) VALUES
('Aurore', 'Princesse', 'Robe volumineuse avec jupe en tulle et bustier brodé de perles.', 2490, 'princesse'),
('Séréna', 'Sirène', 'Silhouette ajustée jusqu''aux genoux puis évasée. Dentelle française.', 2890, 'sirene'),
('Luna', 'Empire', 'Taille haute sous la poitrine, fluide et élégante.', 1990, 'empire'),
('Céleste', 'Bohème', 'Dentelle délicate, manches longues et coupe fluide.', 2290, 'boheme'),
('Marguerite', 'Princesse', 'Jupe en organza avec traîne royale. Cristaux Swarovski.', 3490, 'princesse'),
('Ophélie', 'Sirène', 'Robe sculptante en crêpe avec détails en dentelle.', 2690, 'sirene');

-- Index pour améliorer les performances
CREATE INDEX idx_dresses_category ON dresses(category);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_custom_proposals_user_id ON custom_proposals(user_id);
CREATE INDEX idx_custom_proposals_status ON custom_proposals(status);
