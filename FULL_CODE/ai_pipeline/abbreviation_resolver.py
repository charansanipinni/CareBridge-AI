"""Abbreviation Resolver: Expands medical abbreviations from abbreviation_glossary.csv."""

import csv
from pathlib import Path
from typing import Dict, Optional

class AbbreviationResolver:
    def __init__(self, glossary_path: Optional[Path] = None):
        if glossary_path is None:
            glossary_path = Path(__file__).resolve().parent.parent / "config" / "abbreviation_glossary.csv"
        self.glossary: Dict[str, Dict[str, str]] = {}
        if glossary_path.exists():
            with open(glossary_path, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    abbr = row["abbreviation"].strip()
                    self.glossary[abbr.upper()] = {
                        "expansion": row["expansion"].strip(),
                        "plain_language": row["plain_language"].strip(),
                        "category": row["category"].strip(),
                    }

    def resolve(self, abbr: str) -> Optional[Dict[str, str]]:
        return self.glossary.get(abbr.strip().upper())
