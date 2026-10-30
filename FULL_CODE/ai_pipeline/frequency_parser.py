"""Frequency Parser: Parses clinical medication frequencies and slot notations."""

import re

FREQ_RE = re.compile(
    r"\b(OD|BD|TDS|QID|HS|SOS)\b|(\d-\d-\d(?:-\d)?)|once weekly|once a week|every (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)",
    re.I,
)

def parse_frequency(clean_ln: str) -> str:
    s_low = clean_ln.lower()
    if any(p in s_low for p in ["sos", "prn", "as needed", "when needed", "if needed", "when required", "only when", "only if"]):
        return "SOS"
    f = FREQ_RE.search(clean_ln)
    freq = f.group(0).upper() if f else "OD"
    if "1-0-1" in clean_ln:
        freq = "BD (1-0-1)"
    elif "1-1-1" in clean_ln:
        freq = "TDS (1-1-1)"
    elif "1-0-0" in clean_ln:
        freq = "OD (1-0-0)"
    elif "0-0-1" in clean_ln:
        freq = "OD (0-0-1)"
    elif "1-1-1-1" in clean_ln:
        freq = "QID (1-1-1-1)"
    return freq
