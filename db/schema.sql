DROP TABLE IF EXISTS leads;

CREATE TABLE leads (
  id         bigserial PRIMARY KEY,
  address    text        NOT NULL,
  city       text        NOT NULL,
  phase      text        NOT NULL
    CHECK (phase IN ('development', 'pre_construction', 'construction', 'occupancy')),
  sector     text        NOT NULL
    CHECK (sector IN ('residential', 'commercial', 'institutional', 'industrial')),
  est_value  numeric(14,2) NOT NULL CHECK (est_value >= 0),
  units      integer     CHECK (units > 0),
  filed_at   timestamptz NOT NULL,

  CHECK (sector = 'residential' OR units IS NULL)
);