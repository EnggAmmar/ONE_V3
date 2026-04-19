from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.schemas.taxonomy import CatalogPayloadOption, TaxonomyResponse
from app.services.catalog import get_catalog


def _taxonomy_path() -> Path:
    return Path(__file__).resolve().parents[1] / "data" / "taxonomy.json"


def _load_taxonomy_base() -> TaxonomyResponse:
    raw = json.loads(_taxonomy_path().read_text(encoding="utf-8"))
    return TaxonomyResponse.model_validate(raw)


@lru_cache(maxsize=1)
def get_taxonomy() -> TaxonomyResponse:
    base = _load_taxonomy_base()
    catalog = get_catalog()

    enriched_families = []
    for fam in base.families:
        enriched_categories = []
        for cat in fam.payload_categories:
            payloads = [
                CatalogPayloadOption(payload_id=p.payload_id, label=p.label)
                for p in catalog.list_payloads(
                    family=fam.family_id.value, category_id=cat.category_id
                )
            ]
            enriched_categories.append(cat.model_copy(update={"payloads": payloads}))
        enriched_families.append(fam.model_copy(update={"payload_categories": enriched_categories}))

    return base.model_copy(update={"families": enriched_families})
