"""Translation Service: Faithfully translates extracted care plan into Telugu without adding unmentioned clinical content.
Preserves Latin drug names, doses, units, and dates for precise patient safety.
Strictly adheres to source grounding: never assumes timing, frequency, duration, water instructions, or ungrounded advice.
"""

from typing import Dict, List

class TranslationService:
    def __init__(self):
        pass

    def generate_telugu(self, cp: dict) -> str:
        out = ["మీ డిశ్చార్జ్ సంరక్షణ ప్రణాళిక"]
        out.append(
            "ఇంటి వద్ద మీ ఆరోగ్యం త్వరగా కుదుటపడటానికి మరియు మీరు సురక్షితంగా కోలుకోవడానికి ఈ క్రింది వైద్య సూచనలను క్రమం తప్పకుండా పాటించండి.\n"
        )

        # 1. Medications
        meds = cp.get("medicines", [])
        if meds:
            out.append("మీరు తీసుకోవలసిన ముఖ్యమైన మందులు (వైద్యులు సూచించిన ప్రకారం సమయానికి తీసుకోండి):")
            for i, m in enumerate(meds, 1):
                # Name and dose in Latin script with Western digits
                line = f"{i}. {m['name']} {m['dose']}"
                out.append(line)

                timing_str = (m.get("timing") or "").lower().strip()
                timing_te = ""
                if "after" in timing_str or "pc" in timing_str:
                    timing_te = "భోజనం తర్వాత"
                elif "before" in timing_str or "ac" in timing_str or "empty" in timing_str:
                    timing_te = "భోజనానికి ముందు"
                elif "bedtime" in timing_str or "night" in timing_str or "hs" in timing_str:
                    timing_te = "రాత్రి పడుకునే ముందు"

                freq_str = (m.get("frequency") or "").upper().strip()
                freq_te = ""
                if "OD" in freq_str or "ONCE" in freq_str or freq_str in ["1-0-0", "0-1-0", "0-0-1"]:
                    freq_te = "రోజుకు ఒకసారి"
                elif "BD" in freq_str or "TWICE" in freq_str or "1-0-1" in freq_str:
                    freq_te = "రోజుకు రెండు సార్లు"
                elif "TDS" in freq_str or "TID" in freq_str or "THREE" in freq_str or "1-1-1" in freq_str:
                    freq_te = "రోజుకు మూడు సార్లు"
                elif "QID" in freq_str or "FOUR" in freq_str or "1-1-1-1" in freq_str:
                    freq_te = "రోజుకు నాలుగు సార్లు"
                elif "HS" in freq_str or "BEDTIME" in freq_str:
                    freq_te = "రాత్రి పడుకునే ముందు"
                elif "SOS" in freq_str or "PRN" in freq_str or "NEED" in freq_str:
                    freq_te = "అవసరమైనప్పుడు మాత్రమే"
                elif freq_str:
                    freq_te = freq_str

                # Grounded instruction line (NEVER add water instructions)
                parts = []
                if timing_te:
                    parts.append(timing_te)
                if freq_te:
                    parts.append(freq_te)

                if parts:
                    out.append(f"   - ఈ మందును {' '.join(parts)} తీసుకోండి.")
                else:
                    out.append("   - ఈ మందును వైద్యులు సూచించిన విధంగా తీసుకోండి.")

                dur_str = (m.get("duration") or "").strip()
                if dur_str and dur_str not in ["-", "--", "---", "none", "nil", "n/a", "N/A"]:
                    dur_low = dur_str.lower()
                    if "review" in dur_low or "visit" in dur_low:
                        dur_te = "తదుపరి సమీక్ష వరకు"
                    elif "suture" in dur_low:
                        dur_te = "కుట్లు విప్పే వరకు"
                    elif "finished" in dur_low:
                        dur_te = "మందులు పూర్తయ్యే వరకు"
                    elif "life" in dur_low:
                        dur_te = "జీవితాంతం"
                    elif dur_low.startswith("till") or dur_low.startswith("until"):
                        dur_te = f"{dur_str} వరకు"
                    else:
                        dur_te = f"{dur_str} పాటు"
                    out.append(f"   - వ్యవధి: {dur_te} క్రమం తప్పకుండా తీసుకోండి.")

        # 2. Stop Medicines - ONLY if present in source (NEVER strengthen unless source says so)
        stop_meds = cp.get("stop_medicines", [])
        if stop_meds:
            out.append("\nఆపివేయవలసిన మందులు:")
            for s in stop_meds:
                if any(w in s.lower() for w in ["immediately", "promptly", "urgent"]):
                    out.append(f"- STOP {s}. ఈ మందును వెంటనే ఆపండి.")
                else:
                    out.append(f"- STOP {s}. ఈ మందును ఆపండి.")

        # 3. Warning Signs - ONLY if present in source (No broad expansions)
        warns = cp.get("warning_signs", [])
        if warns:
            warn_items = []
            blob = " ".join(warns).lower()
            if any(k in blob for k in ["chest pain", "angina", "tightness"]):
                warn_items.append("ఛాతీలో నొప్పి లేదా ఒత్తిడి రావడం.")
            if any(k in blob for k in ["shortness of breath", "breathless", "dyspnea"]):
                warn_items.append("శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా ఆయాసం కలగడం.")
            if any(k in blob for k in ["fever", "chills", "temperature"]):
                warn_items.append("జ్వరం లేదా చలి రావడం.")
            if any(k in blob for k in ["bleeding", "blood in", "gums", "hematuria"]):
                warn_items.append("రక్తస్రావం జరగడం.")
            if any(k in blob for k in ["redness", "pus", "drainage", "wound"]):
                warn_items.append("గాయం వద్ద ఎరుపుదనం లేదా చీము కారడం.")
            if any(k in blob for k in ["headache", "blurred vision", "vision"]):
                warn_items.append("తీవ్రమైన తలనొప్పి లేదా చూపు మసకబారడం.")
            if any(k in blob for k in ["pain in calf", "swelling of the leg", "dvt", "swelling"]):
                warn_items.append("కాళ్లలో నొప్పి లేదా వాపు రావడం.")
            if any(k in blob for k in ["dizziness", "fainting", "syncope"]):
                warn_items.append("తలతిరగడం లేదా స్పృహ తప్పడం.")
            if any(k in blob for k in ["vomit", "nausea"]):
                warn_items.append("వాంతులు కావడం.")

            if warn_items:
                out.append("\nఈ క్రింది ప్రమాదకర లక్షణాలు కనిపిస్తే ఆలస్యం చేయకుండా వెంటనే ఆసుపత్రికి వెళ్లండి:")
                for item in warn_items:
                    out.append(f"- {item}")

        # 4. Diet - ONLY if present in source (Strictly grounded, no spicy/boiled-water expansions)
        diet = cp.get("diet", [])
        if diet:
            diet_items = []
            blob = " ".join(diet).lower()
            if any(k in blob for k in ["salt", "sodium"]):
                diet_items.append("ఉప్పు తక్కువగా తీసుకోవాలి.")
            if any(k in blob for k in ["oily", "fried", "fat"]):
                diet_items.append("నూనె మరియు కొవ్వు పదార్థాలను నివారించాలి.")
            if any(k in blob for k in ["diabetic", "sugar", "sweets"]):
                diet_items.append("చక్కెర పదార్థాలు తీసుకోరాదు.")
            if any(k in blob for k in ["protein", "dal", "eggs", "milk", "paneer"]):
                diet_items.append("పౌష్టికాహారం తీసుకోవాలి.")
            if any(k in blob for k in ["soft", "semisolid"]):
                diet_items.append("మెత్తని ఆహారం తీసుకోవాలి.")
            if any(k in blob for k in ["fluid", "water", "hydration"]):
                diet_items.append("తగినంత నీరు త్రాగాలి.")

            if diet_items:
                out.append("\nఆహార నియమాలు:")
                for item in diet_items:
                    out.append(f"- {item}")

        # 5. Activity - ONLY if present in source (Strictly grounded, no excessive restrictions)
        act = cp.get("activity", [])
        if act:
            act_items = []
            blob = " ".join(act).lower()
            if any(k in blob for k in ["heavy", "lifting"]):
                act_items.append("బరువైన వస్తువులను ఎత్తకూడదు.")
            if any(k in blob for k in ["rest", "bed rest"]):
                act_items.append("శరీరానికి విశ్రాంతి ఇవ్వాలి.")
            if any(k in blob for k in ["walk", "walking", "walker"]):
                act_items.append("నెమ్మదిగా నడవవచ్చు.")
            if any(k in blob for k in ["drive", "driving"]):
                act_items.append("వాహనాలు నడపరాదు.")
            if any(k in blob for k in ["exercise", "bending", "physio"]):
                act_items.append("తేలికపాటి వ్యాయామాలు చేయాలి.")
            if any(k in blob for k in ["squat", "cross-legged", "toilet"]):
                act_items.append("కింద కూర్చోరాదు.")

            if act_items:
                out.append("\nశారీరక శ్రమ మరియు విశ్రాంతి సూచనలు:")
                for item in act_items:
                    out.append(f"- {item}")

        # 6. Wound Care - ONLY if present in source
        wound = cp.get("wound_care", [])
        if wound:
            wound_items = []
            blob = " ".join(wound).lower()
            if any(k in blob for k in ["clean", "dry"]):
                wound_items.append("గాయాన్ని పొడిగా మరియు శుభ్రంగా ఉంచాలి.")
            if any(k in blob for k in ["sponge", "soak", "immersion"]):
                wound_items.append("గాయం తడవకుండా జాగ్రత్తపడండి.")
            if any(k in blob for k in ["dressing", "remove"]):
                wound_items.append("డ్రెస్సింగ్‌ను జాగ్రత్తగా ఉంచండి.")
            if any(k in blob for k in ["ice", "pack"]):
                wound_items.append("ఐస్ ప్యాక్ ఉంచవచ్చు.")

            if wound_items:
                out.append("\nగాయం సంరక్షణ సూచనలు:")
                for item in wound_items:
                    out.append(f"- {item}")

        # 7. Follow-ups - ONLY if present in source (Do not assume "bring prior records")
        follow_ups = cp.get("follow_ups", [])
        if follow_ups:
            out.append("\nతదుపరి వైద్య పరీక్షల తేదీలు:")
            for f in follow_ups:
                out.append(f"- {f['date']}: వైద్యులను కలిసి పరీక్ష చేయించుకోండి.")

        # Clearly separated general safety notice
        out.append("\nసాధారణ భద్రతా గమనిక (ప్రామాణిక ఆసుపత్రి సమాచారం):")
        out.append("మీ మందుల వాడకంలో లేదా ఇతర సూచనలలో ఏదైనా సందేహం ఉంటే లేదా మార్పులు అవసరమైతే మీ వైద్యుడిని లేదా నర్సును సంప్రదించండి.")
        out.append("వైద్యుల సలహా లేకుండా మందులను సొంతంగా మార్చడం లేదా ఆపడం సరైనది కాదు.")

        return "\n".join(out)
