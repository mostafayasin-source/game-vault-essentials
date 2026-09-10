
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  title text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ps5','xbox','pc')),
  format text NOT NULL CHECK (format IN ('physical','digital')),
  price_minor integer NOT NULL CHECK (price_minor >= 0),
  currency text NOT NULL DEFAULT 'SEK',
  image_key text NOT NULL DEFAULT 'action',
  description text NOT NULL,
  compatibility text NOT NULL DEFAULT '',
  genre text NOT NULL,
  available boolean NOT NULL DEFAULT true,
  max_quantity integer NOT NULL DEFAULT 10,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly viewable" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference text NOT NULL UNIQUE,
  idempotency_key text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  street_address text,
  postal_code text,
  city text,
  country text NOT NULL DEFAULT 'Sweden',
  requires_shipping boolean NOT NULL DEFAULT false,
  subtotal_minor integer NOT NULL,
  shipping_minor integer NOT NULL DEFAULT 0,
  total_minor integer NOT NULL,
  currency text NOT NULL DEFAULT 'SEK',
  status text NOT NULL DEFAULT 'demo_placed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sku text NOT NULL,
  title text NOT NULL,
  platform text NOT NULL,
  format text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_minor integer NOT NULL,
  line_total_minor integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);

INSERT INTO public.products (sku, title, platform, format, price_minor, image_key, description, compatibility, genre, available, max_quantity, featured) VALUES
('PS5-NEB-PHY','Nebula Drift','ps5','physical',79900,'racing','Demo listing. A high-speed anti-gravity racer set across nine neon city circuits with a full career mode and split-screen play.','Disc edition for PlayStation 5. A PS5 console with a disc drive is required.','Racing',true,10,true),
('PS5-NEB-DIG','Nebula Drift','ps5','digital',69900,'racing','Demo listing. Digital download code for the neon anti-gravity racer, redeemable on the PlayStation Store.','Digital code for PlayStation 5. Works on all PS5 models, including the Digital Edition.','Racing',true,10,false),
('PS5-ASH-PHY','Ashen Covenant','ps5','physical',89900,'rpg','Demo listing. A sprawling dark-fantasy role-playing epic with a branching story and over 80 hours of content.','Disc edition for PlayStation 5. A PS5 console with a disc drive is required.','RPG',true,10,true),
('PS5-TIDE-DIG','Tidewalker','ps5','digital',54900,'adventure','Demo listing. An underwater exploration adventure about mapping a drowned civilisation.','Digital code for PlayStation 5. Works on all PS5 models, including the Digital Edition.','Adventure',true,10,false),
('PS5-IRON-DIG','Iron Verdict','ps5','digital',74900,'shooter','Demo listing. A tactical squad shooter with a co-operative campaign and seasonal missions.','Digital code for PlayStation 5. Works on all PS5 models, including the Digital Edition.','Shooter',true,10,false),
('PS5-HOLL-PHY','Hollow Signal','ps5','physical',59900,'horror','Demo listing. A first-person survival horror story set in an abandoned radio observatory.','Disc edition for PlayStation 5. A PS5 console with a disc drive is required.','Horror',false,10,false),

('XSX-NEB-DIG','Nebula Drift','xbox','digital',69900,'racing','Demo listing. Digital download code for the neon anti-gravity racer.','Digital code for Xbox. Playable on Xbox Series X and Series S.','Racing',true,10,false),
('XSX-ASH-PHY','Ashen Covenant','xbox','physical',89900,'rpg','Demo listing. A sprawling dark-fantasy role-playing epic with a branching story.','Disc edition. Requires an Xbox Series X with a disc drive. Not compatible with Xbox Series S.','RPG',true,10,true),
('XSX-GRID-DIG','Gridlock Tactics','xbox','digital',44900,'strategy','Demo listing. A turn-based strategy game about defending a fractured megacity block by block.','Digital code for Xbox. Playable on Xbox Series X and Series S.','Strategy',true,10,false),
('XSX-SOLR-DIG','Solar Reach','xbox','digital',64900,'action','Demo listing. An open-world action game across three terraformed moons.','Digital code for Xbox. Playable on Xbox Series X and Series S.','Action',true,10,true),
('XSX-PITCH-PHY','Pitch Legends 26','xbox','physical',69900,'sports','Demo listing. An arcade football game with career mode and online leagues.','Disc edition. Requires an Xbox Series X with a disc drive. Not compatible with Xbox Series S.','Sports',true,10,false),
('XSX-HOLL-DIG','Hollow Signal','xbox','digital',49900,'horror','Demo listing. A first-person survival horror story set in an abandoned radio observatory.','Digital code for Xbox. Playable on Xbox Series X and Series S.','Horror',true,10,false),

('PC-ASH-DIG','Ashen Covenant','pc','digital',79900,'rpg','Demo listing. The dark-fantasy role-playing epic with uncapped frame rates and mod support.','Digital PC game. Activates on Steam. Windows 11 required.','RPG',true,10,true),
('PC-GRID-DIG','Gridlock Tactics','pc','digital',39900,'strategy','Demo listing. Turn-based city defence strategy with a built-in scenario editor.','Digital PC game. Activates on Steam. Windows 10 or 11.','Strategy',true,10,false),
('PC-VOID-DIG','Voidsmith','pc','digital',34900,'adventure','Demo listing. A hand-drawn crafting adventure set on a station drifting past a dying star.','Digital PC game. Activates on GOG. Windows, DRM-free.','Adventure',true,10,false),
('PC-IRON-DIG','Iron Verdict','pc','digital',69900,'shooter','Demo listing. A tactical squad shooter with dedicated servers and a co-operative campaign.','Digital PC game. Activates on Steam. Windows 11 required.','Shooter',true,10,true),
('PC-APEX-DIG','Apex Circuit','pc','digital',29900,'racing','Demo listing. A sim-focused touring car racer with wheel support and community liveries.','Digital PC game. Activates on Epic Games Store. Windows 10 or 11.','Racing',true,10,false),
('PC-LAST-DIG','The Last Broadcast','pc','digital',24900,'horror','Demo listing. A short narrative horror game told through recovered tape recordings.','Digital PC game. Activates on Steam. Windows 10 or 11.','Horror',true,10,false);
