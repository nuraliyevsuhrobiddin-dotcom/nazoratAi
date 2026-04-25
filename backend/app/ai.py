def calculate_risk_score(description: str) -> int:
    text = description.lower()

    high_risk_keywords = ("pora", "pul")
    medium_risk_keywords = ("navbat",)

    if any(keyword in text for keyword in high_risk_keywords):
        return 90

    if any(keyword in text for keyword in medium_risk_keywords):
        return 55

    if len(text) > 120:
        return 45

    return 25
