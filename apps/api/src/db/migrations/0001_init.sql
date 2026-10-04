-- Modelo de dados inicial. Ver docs/architecture.md §5.
-- Timestamps: INTEGER epoch ms (UTC). Booleanos: INTEGER 0/1. Dinheiro: INTEGER reais.
-- Faixas de valores são validadas em packages/shared (zod); o banco garante enums e integridade.

CREATE TABLE neighborhoods (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('CENTRO','OESTE','SUL','NORTE','LESTE')),
  center_lat REAL NOT NULL,
  center_lng REAL NOT NULL,
  north REAL NOT NULL,
  south REAL NOT NULL,
  east REAL NOT NULL,
  west REAL NOT NULL,
  median_price_per_m2 INTEGER NOT NULL DEFAULT 0,
  median_rent_per_m2 INTEGER NOT NULL
);

CREATE TABLE properties (
  id INTEGER PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('DRAFT','ACTIVE','INACTIVE')),
  type TEXT NOT NULL CHECK (type IN ('APARTMENT','HOUSE','CONDO_HOUSE','STUDIO')),
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  street_normalized TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood_id INTEGER NOT NULL REFERENCES neighborhoods(id),
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  sale_price INTEGER NOT NULL,
  previous_price INTEGER,
  condo_fee INTEGER NOT NULL,
  iptu INTEGER NOT NULL,
  monthly_cost INTEGER GENERATED ALWAYS AS (condo_fee + iptu) STORED,
  price_per_m2 INTEGER GENERATED ALWAYS AS (CAST(ROUND(CAST(sale_price AS REAL) / area) AS INTEGER)) STORED,
  area INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  suites INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  parking_spaces INTEGER NOT NULL,
  floor INTEGER,
  is_furnished INTEGER NOT NULL DEFAULT 0,
  accepts_pets INTEGER NOT NULL DEFAULT 0,
  near_subway INTEGER NOT NULL DEFAULT 0,
  is_exclusive INTEGER NOT NULL DEFAULT 0,
  is_rented INTEGER NOT NULL DEFAULT 0,
  monthly_rent INTEGER,
  estimated_rent INTEGER NOT NULL,
  rental_yield REAL GENERATED ALWAYS AS (CAST(estimated_rent AS REAL) / sale_price) STORED,
  description TEXT NOT NULL,
  photo_count INTEGER NOT NULL DEFAULT 0,
  relevance_score REAL NOT NULL DEFAULT 0,
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE property_photos (
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  url TEXT NOT NULL,
  PRIMARY KEY (property_id, position)
) WITHOUT ROWID;

CREATE TABLE property_amenities (
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_code TEXT NOT NULL,
  PRIMARY KEY (property_id, amenity_code)
) WITHOUT ROWID;

CREATE TABLE favorites (
  user_id TEXT NOT NULL,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, property_id)
) WITHOUT ROWID;

-- Ordenações (keyset). status primeiro porque toda busca filtra ACTIVE.
CREATE INDEX idx_prop_relevance ON properties(status, relevance_score DESC, id DESC);
CREATE INDEX idx_prop_newest    ON properties(status, published_at DESC, id DESC);
CREATE INDEX idx_prop_price     ON properties(status, sale_price, id);
CREATE INDEX idx_prop_yield     ON properties(status, rental_yield DESC, id DESC);
-- Localização: área do mapa e bairro.
CREATE INDEX idx_prop_geo       ON properties(status, lat, lng);
CREATE INDEX idx_prop_neigh     ON properties(neighborhood_id, status);
-- Comodidades (filtro E), autocomplete e favoritos.
CREATE INDEX idx_amenity_code   ON property_amenities(amenity_code, property_id);
CREATE INDEX idx_prop_street    ON properties(street_normalized);
CREATE INDEX idx_neigh_name     ON neighborhoods(name_normalized);
CREATE INDEX idx_fav_user       ON favorites(user_id, created_at DESC);
