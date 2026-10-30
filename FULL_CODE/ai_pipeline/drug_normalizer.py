"""Drug Normalizer: Maps brands, aliases, and strengths from drug_reference.csv."""

import csv
import re
from pathlib import Path
from typing import Dict, Optional, Tuple

class DrugNormalizer:
    def __init__(self, drug_ref_path: Optional[Path] = None):
        if drug_ref_path is None:
            drug_ref_path = Path(__file__).resolve().parent.parent / "config" / "drug_reference.csv"
        
        self.drug_ref: Dict[str, dict] = {}
        self.brand_to_generic: Dict[str, str] = {}
        self.brand_num_map: Dict[str, Tuple[str, str, str]] = {}
        self.generic_to_brand: Dict[str, str] = {}
        self.generic_to_canonical: Dict[str, str] = {}

        if drug_ref_path.exists():
            with open(drug_ref_path, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    gen = r["generic_name"].strip().lower()
                    strengths = [s.strip() for s in r["typical_strengths"].split(";") if s.strip()]
                    brands = [b.strip() for b in r["common_brands"].split(";") if b.strip()]
                    also = [a.strip() for a in r.get("also_known_as", "").split(";") if a.strip()]

                    self.drug_ref[gen] = {
                        "generic": gen,
                        "brands": brands,
                        "strengths": strengths,
                        "drug_class": r["drug_class"],
                        "purpose": r["plain_language_purpose"],
                        "used_at_discharge": r["used_at_discharge"].strip().lower().startswith("yes"),
                    }
                    self.generic_to_brand[gen] = brands[0] if brands else gen
                    self.generic_to_canonical[gen] = r["generic_name"].strip()

                    for b in brands + also:
                        b_low = b.lower()
                        self.brand_to_generic[b_low] = gen
                        for st in strengths:
                            m = re.match(r"^(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)", st)
                            if m:
                                val, unit = m.group(1), m.group(2)
                                self.brand_num_map[f"{b_low} {val}"] = (gen, f"{val} {unit}", b)
                                self.brand_num_map[f"{b_low}{val}"] = (gen, f"{val} {unit}", b)

    def lookup_brand_num(self, text: str) -> Optional[Tuple[str, str, str]]:
        t_low = text.lower()
        for bn_key, val in self.brand_num_map.items():
            if bn_key in t_low:
                return val
        return None

    def get_generic(self, brand: str) -> Optional[str]:
        return self.brand_to_generic.get(brand.strip().lower())

    def get_purpose(self, generic: str) -> str:
        gen_low = generic.strip().lower()
        if gen_low in self.drug_ref:
            return self.drug_ref[gen_low]["purpose"]
        return "prescribed medication for your recovery"
