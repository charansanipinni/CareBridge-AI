"""Date Extractor: Parses day-first Indian calendar dates and normalizes to YYYY-MM-DD."""

import re
from datetime import date, datetime
from typing import List, Optional

MONTHS = {
    m: i
    for i, m in enumerate(
        ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1
    )
}

DATE_RE = re.compile(
    r"\b\d{1,2}[/.\-]\d{1,2}[/.\-]\d{4}\b|\b\d{1,2}-[A-Za-z]{3}-\d{2,4}\b|\b\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4}\b"
)

def parse_date(s: str) -> Optional[date]:
    s = s.strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    m = re.match(r"(\d{1,2})-([A-Za-z]{3})-(\d{2})$", s)
    if m:
        return date(2000 + int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))
    m = re.match(r"(\d{1,2})-([A-Za-z]{3})-(\d{4})$", s)
    if m:
        return date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))
    m = re.match(r"(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})$", s)
    if m:
        mon = m.group(2)[:3].lower()
        if mon in MONTHS:
            return date(int(m.group(3)), MONTHS[mon], int(m.group(1)))
    return None

def extract_dates(text: str) -> List[date]:
    dates = []
    for match in DATE_RE.findall(text):
        parsed = parse_date(match)
        if parsed and parsed not in dates:
            dates.append(parsed)
    return dates
