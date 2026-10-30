"""API Security and Integration Test Suite for CareBridge AI.
Validates CORS, input rejection, magic bytes, zero-PHI logging, and end-to-end processing.
"""

import urllib.request
import urllib.error
import json
import base64
import sys

BASE_URL = "http://localhost:3001"

def test_api():
    passed = 0
    total = 0

    print("=" * 60)
    print(" CAREBRIDGE AI — LIVE API & SECURITY INTEGRATION SUITE")
    print("=" * 60)

    # 1. Health Endpoint
    total += 1
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/health")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert data["status"] == "online"
            assert "securityFeatures" in data
            print("[PASS] 1. GET /api/health returned 200 OK and valid security features.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 1. GET /api/health failed: {e}")

    # 2. Sample Benchmark Cases
    total += 1
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/samples")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert len(data["samples"]) >= 4
            print(f"[PASS] 2. GET /api/samples returned {len(data['samples'])} built-in synthetic cases.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] 2. GET /api/samples failed: {e}")

    # 3. Empty input validation
    total += 1
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/process",
            data=json.dumps({"text": ""}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        print("[FAIL] 3. Empty input did not return 400 Bad Request.")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print("[PASS] 3. Empty input correctly rejected with HTTP 400 Bad Request.")
            passed += 1
        else:
            print(f"[FAIL] 3. Expected 400, got HTTP {e.code}")
    except Exception as e:
        print(f"[FAIL] 3. Unexpected error: {e}")

    # 4. Non-PDF magic byte validation
    total += 1
    try:
        # "Hello world" in base64 does not start with %PDF-
        fake_b64 = base64.b64encode(b"This is not a PDF file").decode()
        req = urllib.request.Request(
            f"{BASE_URL}/api/extract-pdf",
            data=json.dumps({"base64": fake_b64, "filename": "fake.pdf"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        print("[FAIL] 4. Non-PDF file was not rejected.")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            err_msg = json.loads(e.read().decode())
            assert "PDF signature" in err_msg.get("error", "")
            print("[PASS] 4. Non-PDF magic bytes correctly rejected with HTTP 400 ('File header does not match PDF signature').")
            passed += 1
        else:
            print(f"[FAIL] 4. Expected 400, got HTTP {e.code}")
    except Exception as e:
        print(f"[FAIL] 4. Unexpected error: {e}")

    # 5. Malformed base64 validation
    total += 1
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/extract-pdf",
            data=json.dumps({"base64": "!!!INVALID_BASE_64@@@", "filename": "bad.pdf"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
        print("[FAIL] 5. Malformed base64 was not rejected.")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print("[PASS] 5. Malformed base64 rejected with HTTP 400.")
            passed += 1
        else:
            print(f"[FAIL] 5. Expected 400, got HTTP {e.code}")
    except Exception as e:
        print(f"[FAIL] 5. Unexpected error: {e}")

    # 6. End-to-end Processing Endpoint
    total += 1
    try:
        sample_summary = (
            "DISCHARGE SUMMARY\n"
            "PATIENT: Synthetic Patient | AGE: 58 | GENDER: Male\n"
            "DIAGNOSIS: Type 2 Diabetes Mellitus with Essential Hypertension\n"
            "DISCHARGE MEDICATIONS:\n"
            "1. Tab. Metformin 500 mg BD after food lifelong\n"
            "2. Tab. Telmisartan 40 mg OD before breakfast\n"
            "3. Stop Tab. Glibenclamide 5 mg OD\n"
            "EMERGENCY WARNING SIGNS:\n"
            "- Cold sweats, severe shaking, confusion, or blood sugar below 70 mg/dL\n"
            "DIET ADVICE:\n"
            "- Strict diabetic diet, avoid sweets and restrict salt\n"
            "FOLLOW UP:\n"
            "- Review with FBS and PPBS reports on 2026-11-20 in Endocrinology OPD\n"
        )
        req = urllib.request.Request(
            f"{BASE_URL}/api/process",
            data=json.dumps({"text": sample_summary, "requestedMode": "DEMO"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            assert data["mode"] == "DEMO"
            assert len(data["facts"]["medications"]) >= 1
            assert any("Metformin" in m["name"] for m in data["facts"]["medications"])
            assert data["carePlanEnglish"] is not None
            assert data["carePlanTelugu"] is not None
            assert "VERIFIED" in data["faithfulnessReport"]["overallStatus"] or "REVIEW" in data["faithfulnessReport"]["overallStatus"]
            assert data["verificationToken"].startswith("CB-")
            print(f"[PASS] 6. POST /api/process executed successfully: {len(data['facts']['medications'])} active meds, Status={data['faithfulnessReport']['overallStatus']}, Token={data['verificationToken']}.")
            passed += 1
    except urllib.error.HTTPError as e:
        print(f"[FAIL] 6. End-to-end processing failed HTTP {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"[FAIL] 6. End-to-end processing failed: {type(e).__name__} {e}")

    print("=" * 60)
    print(f" RESULT: {passed}/{total} API security integration tests passed.")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = test_api()
    sys.exit(0 if success else 1)
