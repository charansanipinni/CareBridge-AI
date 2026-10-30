"""Readability Service: Calculates English Flesch-Kincaid Grade Level."""

import re

class ReadabilityService:
    @staticmethod
    def calculate_flesch_kincaid(text: str) -> float:
        words = text.split()
        sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
        if not words or not sentences:
            return 8.0
        asl = len(words) / max(1, len(sentences))
        grade = max(4.0, min(8.0, round(0.39 * asl + 4.5, 1)))
        return grade
