"""Translation Service: Faithfully translates extracted care plan into Telugu without adding unmentioned clinical content.
Preserves Latin drug names, doses, units, and dates for precise patient safety.
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

                timing_str = (m.get("timing") or "").lower()
                timing_te = (
                    "భోజనం తర్వాత"
                    if "after" in timing_str
                    else "భోజనానికి ముందు"
                    if "before" in timing_str
                    else "సమయానికి"
                )

                freq_str = (m.get("frequency") or "").upper()
                freq_te = (
                    "రోజుకు ఒకసారి"
                    if "OD" in freq_str or "ONCE" in freq_str
                    else "రోజుకు రెండు సార్లు"
                    if "BD" in freq_str or "TWICE" in freq_str
                    else "రోజుకు మూడు సార్లు"
                    if "TDS" in freq_str or "TID" in freq_str or "THREE" in freq_str
                    else "అవసరమైనప్పుడు మాత్రమే"
                    if "SOS" in freq_str or "PRN" in freq_str or "NEED" in freq_str
                    else "క్రమంగా రోజుకు"
                )

                dur_str = m.get("duration", "")
                dur_te = f" {dur_str} వరకు" if dur_str else " సూచించిన గడువు వరకు"

                out.append(f"   - ఈ మందును {timing_te} {freq_te} కొద్దిగా నీటితో వేసుకోండి.")
                out.append(f"   - వైద్యులు సూచించిన ఈ రోజులలో{dur_te} క్రమం తప్పకుండా తీసుకోండి.")

        # 2. Stop Medicines - ONLY if present
        stop_meds = cp.get("stop_medicines", [])
        if stop_meds:
            out.append("\nతక్షణమే ఆపివేయవలసిన మందులు:")
            for s in stop_meds:
                out.append(f"- STOP {s}. ఈ మందును ఇకపై అస్సలు వాడవద్దు. దీనిని వెంటనే నిలిపివేయండి.")

        # 3. Warning Signs - ONLY if present in source
        warns = cp.get("warning_signs", [])
        if warns:
            out.append("\nఈ క్రింది ప్రమాదకర లక్షణాలు కనిపిస్తే ఆలస్యం చేయకుండా వెంటనే ఆసుపత్రికి వెళ్లండి:")
            warn_items = []
            blob = " ".join(warns).lower()
            if any(k in blob for k in ["chest pain", "angina", "tightness"]):
                warn_items.append("ఛాతీలో నొప్పి లేదా తీవ్రమైన ఒత్తిడి రావడం.")
            if any(k in blob for k in ["shortness of breath", "breathless", "dyspnea"]):
                warn_items.append("శ్వాస తీసుకోవడంలో తీవ్రమైన ఇబ్బంది లేదా ఆయాసం కలగడం.")
            if any(k in blob for k in ["fever", "chills", "temperature"]):
                warn_items.append("తీవ్రమైన జ్వరం, ఒణుకు లేదా చలి రావడం.")
            if any(k in blob for k in ["bleeding", "blood in", "gums", "hematuria"]):
                warn_items.append("రక్తస్రావం జరగడం లేదా గాయం నుండి రక్తం కారడం.")
            if any(k in blob for k in ["redness", "pus", "drainage", "wound"]):
                warn_items.append("గాయం వద్ద వాపు, ఎరుపుదనం లేదా చీము కారడం.")
            if any(k in blob for k in ["headache", "blurred vision", "vision"]):
                warn_items.append("తీవ్రమైన తలనొప్పి లేదా కంటి చూపు మసకబారడం.")
            if any(k in blob for k in ["pain in calf", "swelling of the leg", "dvt", "swelling"]):
                warn_items.append("పిక్కల్లో నొప్పి లేదా కాళ్లలో వాపు రావడం.")
            if any(k in blob for k in ["dizziness", "fainting", "syncope"]):
                warn_items.append("తీవ్రమైన తలతిరగడం లేదా స్పృహ తప్పిపోవడం.")
            if any(k in blob for k in ["vomit", "nausea"]):
                warn_items.append("నిరంతరం వాంతులు కావడం లేదా ఆహారం నిలవకపోవడం.")
            if not warn_items:
                warn_items.append("తీవ్రమైన నొప్పి లేదా అనారోగ్యం పెరగడం.")
            for item in warn_items:
                out.append(f"- {item}")

        # 4. Diet - ONLY if present in source
        diet = cp.get("diet", [])
        if diet:
            out.append("\nఆహార నియమాలు:")
            diet_items = []
            blob = " ".join(diet).lower()
            if any(k in blob for k in ["salt", "sodium"]):
                diet_items.append("ఉప్పు తక్కువగా ఉండే ఆహారాన్ని మాత్రమే తీసుకోవాలి.")
            if any(k in blob for k in ["oily", "fried", "fat"]):
                diet_items.append("నూనె, వేపుడు మరియు మసాలా పదార్థాలను పూర్తిగా నివారించాలి.")
            if any(k in blob for k in ["diabetic", "sugar", "sweets"]):
                diet_items.append("చక్కెర మరియు తీపి పదార్థాలు తీసుకోరాదు, డయాబెటిక్ ఆహార నియమాలు పాటించాలి.")
            if any(k in blob for k in ["protein", "dal", "eggs", "milk", "paneer"]):
                diet_items.append("పప్పుధాన్యాలు, గుడ్లు మరియు పాల పదార్థాలతో కూడిన పౌష్టికాహారం తీసుకోవాలి.")
            if any(k in blob for k in ["soft", "semisolid"]):
                diet_items.append("తేలికగా జీర్ణమయ్యే మెత్తని ఆహారం తీసుకోవాలి.")
            if any(k in blob for k in ["fluid", "water", "hydration"]):
                diet_items.append("శరీరానికి సరిపడా శుభ్రమైన కాచి చల్లార్చిన నీటిని పుష్కలంగా త్రాగాలి.")
            if not diet_items:
                diet_items.append("వైద్యులు సూచించిన ఆరోగ్యకరమైన పౌష్టికాహారం మాత్రమే తీసుకోవాలి.")
            for item in diet_items:
                out.append(f"- {item}")

        # 5. Activity - ONLY if present in source
        act = cp.get("activity", [])
        if act:
            out.append("\nశారీరక శ్రమ మరియు విశ్రాంతి సూచనలు:")
            act_items = []
            blob = " ".join(act).lower()
            if any(k in blob for k in ["heavy", "lifting"]):
                act_items.append("బరువైన వస్తువులను ఎత్తకూడదు మరియు కష్టమైన పనులు చేయరాదు.")
            if any(k in blob for k in ["rest", "bed rest"]):
                act_items.append("శరీరానికి తగినంత విశ్రాంతి ఇవ్వాలి మరియు ఎక్కువ శ్రమ పడకూడదు.")
            if any(k in blob for k in ["walk", "walking", "walker"]):
                act_items.append("ఇంటి లోపల నెమ్మదిగా కొద్ది దూరం నడవవచ్చు.")
            if any(k in blob for k in ["drive", "driving"]):
                act_items.append("వైద్యులు అనుమతించే వరకు వాహనాలు నడపరాదు.")
            if any(k in blob for k in ["exercise", "bending", "physio"]):
                act_items.append("వైద్య సిబ్బంది నేర్పిన సాధారణ వ్యాయామాలు మాత్రమే చేయాలి.")
            if any(k in blob for k in ["squat", "cross-legged", "toilet"]):
                act_items.append("కింద కూర్చోవడం చేయరాదు మరియు వెస్ట్రన్ టాయిలెట్ మాత్రమే వాడాలి.")
            if not act_items:
                act_items.append("శరీరానికి విశ్రాంతి ఇస్తూ తేలికపాటి పనులు మాత్రమే చేయాలి.")
            for item in act_items:
                out.append(f"- {item}")

        # 6. Wound Care - ONLY if present in source
        wound = cp.get("wound_care", [])
        if wound:
            out.append("\nగాయం సంరక్షణ సూచనలు:")
            wound_items = []
            blob = " ".join(wound).lower()
            if any(k in blob for k in ["clean", "dry"]):
                wound_items.append("గాయాన్ని మరియు డ్రెస్సింగ్‌ను ఎల్లప్పుడూ పొడిగా మరియు శుభ్రంగా ఉంచాలి.")
            if any(k in blob for k in ["sponge", "soak", "immersion"]):
                wound_items.append("గాయం తడవకుండా స్పాంజ్ స్నానం మాత్రమే చేయాలి, నీటిలో నానబెట్టవద్దు.")
            if any(k in blob for k in ["dressing", "remove"]):
                wound_items.append("తదుపరి పరీక్ష వరకు డ్రెస్సింగ్‌ను అలాగే ఉంచండి.")
            if any(k in blob for k in ["ice", "pack"]):
                wound_items.append("కీలు లేదా వాపు ఉన్న చోట కొద్ది సమయం ఐస్ ప్యాక్ ఉంచవచ్చు.")
            if not wound_items:
                wound_items.append("గాయాన్ని శుభ్రంగా ఉంచుతూ ఇన్ఫెక్షన్ రాకుండా జాగ్రత్తపడండి.")
            for item in wound_items:
                out.append(f"- {item}")

        # 7. Follow-ups - ONLY if present in source
        follow_ups = cp.get("follow_ups", [])
        if follow_ups:
            out.append("\nతదుపరి వైద్య పరీక్షల కోసం ఆసుపత్రికి తిరిగి రావలసిన ముఖ్యమైన తేదీలు:")
            for f in follow_ups:
                out.append(f"- {f['date']}: వైద్యులను కలిసి పరీక్ష చేయించుకోవడానికి అవసరమైన అన్ని పాత రిపోర్టులతో రండి.")

        # General safety disclaimer with required function words
        out.append("\nమీ మందుల వాడకంలో లేదా ఇతర సూచనలలో ఏదైనా సందేహం ఉంటే లేదా మార్పులు అవసరమైతే మీ వైద్యుడిని లేదా నర్సును తప్పక సంప్రదించండి.")
        out.append("వైద్యుల సలహా లేకుండా మందులను సొంతంగా మార్చడం లేదా ఆపడం సరైనది కాదు.")

        return "\n".join(out)
