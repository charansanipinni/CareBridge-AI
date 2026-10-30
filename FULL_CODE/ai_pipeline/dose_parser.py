"""Dose Parser: Parses medication dosages including tapers, split insulin, and half tablets."""

import re
from typing import Optional, Tuple
from .drug_normalizer import DrugNormalizer

DOSE_RE = re.compile(
    r"(\d+(?:\.\d+)?(?:,\d{3})?)\s*(mg|mcg|units|U|IU|ml|mL|puffs?|drops?|tabs?|tablets?|sachets?)\b",
    re.I,
)

def parse_dose(clean_ln: str, normalizer: DrugNormalizer) -> Tuple[str, str]:
    """Returns (final_dose, clean_name)."""
    # 1. Check for tapers e.g. "40 mg x 5 days, then 30 mg x 5 days, then 20 mg x 5 days, then 10 mg x 5 days"
    taper_steps = re.findall(r"(\d+\s*mg)", clean_ln)
    taper_str = None
    if len(taper_steps) >= 2 and ("then" in clean_ln.lower() or "taper" in clean_ln.lower()):
        taper_str = ", then ".join(taper_steps)

    # 2. Check for multi-dose insulin e.g. "12 units before breakfast, 6 units before dinner"
    multi_units = re.findall(r"(\d+)\s*(?:units|U)", clean_ln, re.I)
    split_str = None
    if len(multi_units) >= 2 and any(w in clean_ln.lower() for w in ["insulin", "mixtard", "premixed"]):
        split_str = " ; ".join(f"{u} units" for u in multi_units)
    else:
        # Check slot notation for split insulin e.g. "16-0-10 units" (at least one slot >= 2)
        slot_m = re.search(r"\b(\d+)-(\d+)-(\d+)\b", clean_ln)
        if slot_m and any(int(x) >= 2 for x in slot_m.groups()):
            if any(w in clean_ln.lower() for w in ["insulin", "mixtard", "actrapid", "basalog", "humalog", "glargine"]):
                split_str = f"{slot_m.group(0)} units"

    # 3. Check for half tablet (careful: "½ hr before meals/breakfast" is TIMING, NOT half tablet!)
    clean_ln_no_timing = re.sub(
        r"[½\s1/2]*\s*(?:hr|hour|hours)\s+before\s+(?:breakfast|meals?|food|lunch|dinner)",
        " ",
        clean_ln,
        flags=re.I,
    )
    half_str = None
    if "½" in clean_ln_no_timing or "half" in clean_ln_no_timing.lower() or "1/2" in clean_ln_no_timing:
        dm = re.search(r"(\d+(?:\.\d+)?)\s*mg\s*\([½\s]*tab(?:let)?\s+of\s+(\d+(?:\.\d+)?)\s*mg\)", clean_ln, re.I)
        if dm:
            half_str = f"{dm.group(1)} mg (½ tablet of {dm.group(2)} mg)"
        else:
            dm2 = re.search(r"(\d+(?:\.\d+)?)\s*mg", clean_ln_no_timing)
            if dm2:
                half_str = f"{dm2.group(1)} mg (half tablet)"
            else:
                half_str = "½ tablet"

    # 4. Check for puffs
    puff_m = re.search(r"(\d+)\s*puffs?\b", clean_ln, re.I)
    puff_str = f"{puff_m.group(1)} puffs" if puff_m else None

    # 5. Check for drops
    drop_m = re.search(r"(\d+)\s*drops?\b", clean_ln, re.I)
    drop_str = f"{drop_m.group(1)} drops" if drop_m else None

    # 6. Check standard dose
    d = DOSE_RE.search(clean_ln)
    standard_dose = f"{d.group(1)} {d.group(2)}" if d else None
    if standard_dose and re.search(r"\bU\b", standard_dose):
        standard_dose = re.sub(r"\bU\b", "units", standard_dose)

    # Clean name: Strip parenthetical content e.g. "(100 mcg)", "(Human)"
    clean_ln_no_paren = re.sub(r"\([^)]*\)", " ", clean_ln)
    name_part = re.split(
        r"\s+(?:once\s+daily|twice\s+daily|three\s+times\s+daily|four\s+times\s+daily|once\s+a\s+day|twice\s+a\s+day|three\s+times\s+a\s+day|as\s+needed|every\s+\d+\s*hours?|PO|SC|SL|PRN|OD|BD|TDS|TID|QID|HS|SOS|\d+-\d+-\d+|x\s*\d+|till|until|life|after|before|\d+\s*mg\s*1-0-0|\d+\s*mg\s*OD|\d+\s*mg\s*BD|\d+\s*U\s*SC|\d+\s*units\s*SC)",
        clean_ln_no_paren,
        maxsplit=1,
        flags=re.I,
    )[0].strip()
    name_clean = re.sub(r"^(Tab|T|Cap|C|Inj|Inh|Syp|E/D|Oint|Rotacap|Inhaler|Injection)\.?\s+", "", name_part, flags=re.I).strip()
    name_clean = re.sub(r"\b\d+\s*puffs?\b", "", name_clean, flags=re.I).strip()
    name_clean = re.sub(r"\b\d+\s*(?:U|units)\b", "", name_clean, flags=re.I).strip()

    # Brand number lookup
    resolved_dose = None
    bn_res = normalizer.lookup_brand_num(name_clean)
    if bn_res:
        _, resolved_dose, _ = bn_res

    # Priority determination
    if taper_str:
        final_dose = taper_str
    elif split_str:
        final_dose = split_str
    elif puff_str:
        final_dose = puff_str
    elif drop_str:
        final_dose = drop_str
    elif half_str:
        final_dose = half_str
    elif standard_dose:
        final_dose = standard_dose
    elif resolved_dose:
        final_dose = resolved_dose
    else:
        num_m = re.search(r"\b(\d{2,4})\b", clean_ln)
        if num_m:
            final_dose = f"{num_m.group(1)} mg"
        else:
            final_dose = "1 tablet"

    # Avoid duplicated strength in name (e.g. "Augmentin 625 625 mg" or "Dolo 650 1 tab 1 tab")
    # If name ends with the dose, unit, or dose numbers, trim them cleanly
    if final_dose:
        # Strip final_dose if it appears in name
        name_clean = re.sub(r"\b" + re.escape(final_dose) + r"\b", "", name_clean, flags=re.I).strip()
        # If final dose is a standard number+unit e.g. "500 mg", also strip trailing "500 mg" or "500" from name
        m_fd = re.match(r"^(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|units?)", final_dose, re.I)
        if m_fd:
            num_part = m_fd.group(1)
            name_clean = re.sub(r"\b" + re.escape(num_part) + r"\s*(?:mg|mcg|g|ml|iu|units?)?\b\s*$", "", name_clean, flags=re.I).strip()

    # Strip any trailing frequency or instruction words that leaked into name
    name_clean = re.sub(r"\s+(?:twice\s+daily|once\s+daily|three\s+times\s+daily|1\s+tab|1\s+tablet|one\s+tablet|as\s+prescribed|od|bd|tds|qid|hs|sos)\s*$", "", name_clean, flags=re.I).strip()

    return final_dose, name_clean
