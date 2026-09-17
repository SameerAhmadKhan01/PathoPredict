from typing import List, Set

def evaluate_critical_flags(canonical_symptoms: List[str]) -> List[str]:
    """
    Evaluates canonical symptoms against category-appropriate clinical red-flag rules.
    Returns a list of urgent warnings. If critical flags are present, patient triage
    should be escalated immediately to emergency care.
    """
    symptoms_set: Set[str] = set(canonical_symptoms)
    flags: List[str] = []

    # 1. Cardiac / Acute Coronary Syndrome Red Flag
    if "chest_pain" in symptoms_set:
        cardiac_alarm = {"radiation_to_arm_jaw", "syncope_fainting", "shortness_of_breath"}
        if symptoms_set.intersection(cardiac_alarm):
            flags.append(
                "Acute Chest Pain with Radiation/Syncope: High clinical suspicion for Acute Coronary Syndrome (ACS) "
                "or myocardial ischemia. Immediate emergency medical evaluation (EMS/ER) required."
            )

    # 2. Neurological / Stroke / Cerebrovascular Red Flag
    neuro_deficits = {"sudden_focal_weakness_hemiparesis", "dysarthria_aphasia_speech_issues", "seizures_convulsions"}
    if symptoms_set.intersection(neuro_deficits):
        flags.append(
            "Acute Focal Neurological Deficit: Symptoms indicate possible acute ischemic stroke, transient ischemic attack (TIA), "
            "or acute seizure activity. Immediate emergency evaluation required (FAST protocol)."
        )

    # 3. Severe Cardiopulmonary / Hypoxia Distress
    if "cyanosis" in symptoms_set or ("shortness_of_breath" in symptoms_set and "rapid_breathing" in symptoms_set):
        flags.append(
            "Severe Respiratory Compromise: Signs of acute hypoxemia or respiratory distress. Urgent supplemental oxygen and "
            "emergency cardiopulmonary evaluation needed."
        )

    # 4. Hemorrhagic Shock / Febrile Thrombocytopenia / Sepsis
    bleeding_shock = (
        "prolonged_bleeding" in symptoms_set
        or ("blood_in_stool" in symptoms_set and ("dizziness" in symptoms_set or "syncope_fainting" in symptoms_set))
        or ("petechiae" in symptoms_set and "fever" in symptoms_set)
    )
    if bleeding_shock:
        flags.append(
            "Critical Bleeding Diathesis / Sepsis Risk: Systemic bleeding or petechial rash with fever requires urgent "
            "coagulation profile, platelet count, and acute medical evaluation."
        )

    # 5. Acute Psychiatric Crisis
    if "suicidal_ideation_thoughts_of_death" in symptoms_set:
        flags.append(
            "Acute Psychiatric Crisis: Thoughts of self-harm detected. Immediate contact with a suicide prevention crisis "
            "lifeline (988 in US/Canada or local emergency crisis center) is strongly urged."
        )

    # 6. Ophthalmic Vision-Threatening Emergency
    if "vision_loss" in symptoms_set or ("eye_pain" in symptoms_set and "halos_around_lights" in symptoms_set):
        flags.append(
            "Acute Vision-Threatening Event: Sudden visual loss or severe ocular pain with halos requires immediate "
            "same-day ophthalmological evaluation to prevent irreversible visual loss."
        )

    return flags

def determine_risk_level(probability: int, has_critical_flags: bool) -> str:
    """
    Determines triage risk level badge ('High', 'Moderate', 'Low').
    Any critical flag automatically escalates the risk level to 'High'.
    """
    if has_critical_flags or probability >= 40:
        return "High"
    elif probability >= 20:
        return "Moderate"
    else:
        return "Low"
