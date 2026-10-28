from typing import List, Optional, Set

def check_critical_alert(symptom_keys: List[str]) -> Optional[str]:
    """
    Evaluates patient submitted symptoms against rule-based clinical red-flag
    combinations independent of model confidence scores.
    Returns a descriptive critical alert string if any red flag triggers, or None.
    """
    symptoms: Set[str] = set(symptom_keys)
    alerts: List[str] = []

    # 1. Spontaneous Mucosal Bleeding / Hemorrhagic Diathesis
    has_mucosal_bleeding = (
        "prolonged_bleeding" in symptoms
        or ("blood_in_stool" in symptoms and ("dizziness" in symptoms or "syncope_fainting" in symptoms))
        or ("petechiae" in symptoms and "fever" in symptoms)
        or ("gum_bleeding" in symptoms and "nosebleeds" in symptoms)
    )
    if has_mucosal_bleeding:
        alerts.append(
            "Spontaneous Mucosal Bleeding / Hemorrhagic Risk: Signs of significant bleeding diathesis or thrombocytopenia. "
            "Immediate emergency clinical evaluation and coagulation profile (CBC, platelets, PT/INR) required."
        )

    # 2. Severe Dyspnea / Respiratory Compromise
    has_severe_dyspnea = (
        "cyanosis" in symptoms
        or ("shortness_of_breath" in symptoms and "rapid_breathing" in symptoms)
    )
    if has_severe_dyspnea:
        alerts.append(
            "Severe Dyspnea / Hypoxia: Signs of acute respiratory distress or hypoxemic compromise. "
            "Immediate emergency cardiopulmonary assessment and oxygenation support needed."
        )

    # 3. Acute Confusion / Encephalopathy
    has_acute_confusion = (
        ("cognitive_decline_memory_loss" in symptoms and "fever" in symptoms)
        or "dysarthria_aphasia_speech_issues" in symptoms
    )
    if has_acute_confusion:
        alerts.append(
            "Acute Confusion / Neurological Deficit: Acute cognitive alteration or speech impairment requires "
            "urgent emergency neurological and metabolic evaluation."
        )

    # 4. Acute Coronary Syndrome (ACS / Cardiac Ischemia)
    if "chest_pain" in symptoms:
        cardiac_radiation_syncope = {"radiation_to_arm_jaw", "syncope_fainting", "shortness_of_breath"}
        if symptoms.intersection(cardiac_radiation_syncope):
            alerts.append(
                "Acute Coronary Syndrome Risk: Chest pain with radiation, syncope, or dyspnea indicates possible "
                "acute myocardial ischemia. Immediate emergency medical evaluation (EMS/ER) required."
            )

    # 5. Acute Focal Neurological Deficit (Stroke FAST / Seizure)
    if "sudden_focal_weakness_hemiparesis" in symptoms or "seizures_convulsions" in symptoms:
        alerts.append(
            "Acute Focal Neurological Deficit: Sudden one-sided weakness or seizure activity indicates possible "
            "acute ischemic stroke or intracranial pathology. Emergency FAST stroke protocol evaluation required."
        )

    # 6. Acute Vision-Threatening Emergency
    if "vision_loss" in symptoms or ("eye_pain" in symptoms and "halos_around_lights" in symptoms):
        alerts.append(
            "Acute Vision-Threatening Event: Sudden vision loss or severe ocular pain with halos requires "
            "immediate same-day ophthalmological emergency assessment."
        )

    # 7. Acute Psychiatric Crisis
    if "suicidal_ideation_thoughts_of_death" in symptoms:
        alerts.append(
            "Acute Psychiatric Crisis: Thoughts of self-harm detected. Immediate contact with a suicide prevention "
            "crisis lifeline (988 in US/Canada or local emergency crisis center) is strongly urged."
        )

    if alerts:
        return " | ".join(alerts)
    return None
