"""Section Detector: Detects clinical sections in hospital discharge summaries."""

from typing import List, Sequence

MED_HEADINGS: Sequence[str] = (
    "ADV ON DISCHARGE",
    "DISCHARGE MEDICATIONS",
    "Rx on discharge",
    "Medications at Discharge",
    "TREATMENT ADVISED ON DISCHARGE",
    "TREATMENT ON DISCHARGE",
    "DISCHARGE ADVICE",
    "MEDICATIONS ADVISED",
    "PRESCRIPTION AT DISCHARGE",
    "Rx AT DISCHARGE",
    "DISCHARGE TREATMENT",
)

STOP_HEADINGS: Sequence[str] = (
    "MEDICINES TO BE STOPPED",
    "MEDICINES TO STOP",
    "PLEASE STOP",
    "STOP MEDICATIONS",
    "DRUGS TO BE STOPPED",
    "MEDICINES TO STOP:",
    "PLEASE STOP:",
)

WARN_HEADINGS: Sequence[str] = (
    "Report immediately to Casualty in case of",
    "RETURN TO EMERGENCY",
    "Review SOS if",
    "Danger signs",
    "COME BACK TO THE HOSPITAL",
    "Report immediately",
    "Red flags",
    "Emergency signs",
    "Warning signs",
    "Seek urgent medical attention if",
    "Return immediately if",
)

FU_HEADINGS: Sequence[str] = (
    "Follow up",
    "FOLLOW-UP",
    "F/U",
    "Follow-up",
    "REVIEW",
    "Review on",
    "Next visit",
    "Follow-up visits",
)

SECTION_BOUNDARIES: Sequence[str] = (
    "Instructions",
    "ADVICE",
    "Adv:",
    "Diet:",
    "Activity:",
    "Report immediately",
    "Review SOS if",
    "Danger signs",
    "Follow up",
    "FOLLOW-UP",
    "F/U",
    "COME BACK",
    "In case of emergency",
    "MEDICINES TO BE STOPPED",
    "MEDICINES TO STOP",
    "PLEASE STOP",
    "STOP MEDICATIONS",
)

def get_section_lines(
    lines: List[str],
    start_headings: Sequence[str],
    stop_headings: Sequence[str] = SECTION_BOUNDARIES,
) -> List[str]:
    """Extracts contiguous lines belonging to a named section."""
    out = []
    in_sec = False
    for ln in lines:
        stripped = ln.strip()
        if not in_sec:
            if any(stripped.upper().startswith(h.upper()) for h in start_headings):
                in_sec = True
                continue
        else:
            if any(stripped.upper().startswith(sh.upper()) for sh in stop_headings) and not any(
                stripped.upper().startswith(h.upper()) for h in start_headings
            ):
                break
            out.append(ln)
    return out
