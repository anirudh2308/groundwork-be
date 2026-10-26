-- Seeds 1M rows into leads. Wipes existing data first.

BEGIN;

TRUNCATE leads RESTART IDENTITY;

INSERT INTO leads (address, city, phase, sector, est_value, units, filed_at)
SELECT
  address,
  city,
  phase,
  sector,
  est_value,
  CASE WHEN sector = 'residential' THEN 1 + floor(random() * 500)::int END,
  filed_at
FROM (
  SELECT
    (1 + floor(random() * 9999))::int || ' ' ||
      (ARRAY['Main St', 'King St', 'Queen St', 'Yonge St', 'Bay St',
             'Elm Ave', 'Maple Ave', 'Oak Dr', 'Park Rd', 'Lakeshore Blvd'])[1 + floor(random() * 10)::int] AS address,
    (ARRAY['Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal',
           'Edmonton', 'Winnipeg', 'Quebec City', 'Hamilton', 'Halifax'])[1 + floor(random() * 10)::int] AS city,
    (ARRAY['development', 'pre_construction', 'construction', 'occupancy'])[1 + floor(random() * 4)::int] AS phase,
    (ARRAY['residential', 'commercial', 'institutional', 'industrial'])[1 + floor(random() * 4)::int] AS sector,
    round((500000 + random() * 149500000)::numeric, 2) AS est_value,
    now() - random() * interval '2 years' AS filed_at
  FROM generate_series(1, 1000000)
) AS s;

COMMIT;
