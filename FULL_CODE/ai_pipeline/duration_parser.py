"""Duration Parser: Parses and normalizes treatment durations."""

import re

DUR_RE = re.compile(
    r"(x\s*\d+\s*(?:/\s*(?:7|52|12)|days?|wks?|weeks?|months?|yrs?|years?|d)\b|for \d+ \w+|lifelong|life long|lifetime|till (?:next )?review|till the next review|until the next visit|till next visit|until review)",
    re.I,
)

def parse_duration(s: str) -> str:
    if not s:
        return ""
    m = re.search(r"(\d+)\s*/\s*(7|52|12)\b", s)
    if m:
        n, b = int(m.group(1)), m.group(2)
        days = n * {"7": 1, "52": 7, "12": 30}[b]
        if b == "12":
            return f"{n} month" if n == 1 else f"{n} months"
        if b == "52":
            return f"{n} week" if n == 1 else f"{n} weeks"
        return f"{days} days"
    if re.search(r"life ?-?long|for life|lifetime", s, re.I):
        return "lifelong"
    if re.search(r"till (?:next )?(?:review|visit)|until next visit", s, re.I):
        return "till next review"
    m = re.search(r"(\d+)\s*(days?|weeks?|months?|wks?|mo)", s, re.I)
    if m:
        n, u = m.group(1), m.group(2).lower()
        if u.startswith("d"):
            return f"{n} days"
        if u.startswith("w"):
            return f"{n} weeks"
        if u.startswith("m"):
            return f"{n} months"
    return s.strip()
