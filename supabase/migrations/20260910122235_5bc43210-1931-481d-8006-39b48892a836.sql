ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cover_url text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cover_source_url text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS listed boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ALTER COLUMN max_quantity SET DEFAULT 5;
CREATE INDEX IF NOT EXISTS products_listed_idx ON public.products(listed);
UPDATE public.products
SET listed = false, available = false, featured = false
WHERE sku IN ('PS5-NEB-PHY','PS5-NEB-DIG','PS5-ASH-PHY','PS5-TIDE-DIG','PS5-IRON-DIG','PS5-HOLL-PHY','XSX-NEB-DIG','XSX-ASH-PHY','XSX-GRID-DIG','XSX-SOLR-DIG','XSX-PITCH-PHY','XSX-HOLL-DIG','PC-ASH-DIG','PC-GRID-DIG','PC-VOID-DIG','PC-IRON-DIG','PC-APEX-DIG','PC-LAST-DIG');