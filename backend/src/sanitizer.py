"""Private Information Protection & Sanitization Layer for Jana Seva Escalations."""

import re

# Regex patterns for sensitive information filtering
PATTERNS = [
    # Passwords / Tokens / Keys
    (
        r"(?i)\b(password|passwd|pwd|otp|pin|secret|api_key|token|auth)\s*[:=]\s*\S+",
        "[REDACTED_CREDENTIAL]",
    ),
    # Standard OTP/PIN standalone codes (4-8 digits explicitly labeled as OTP/PIN)
    (r"(?i)\b(otp|pin|code)\s*(is|:)?\s*\d{4,8}\b", r"\1 [REDACTED_PIN]"),
    # Credit / Debit Card Numbers (13-19 digits with optional spaces or hyphens)
    (r"\b(?:\d[ -]*?){13,19}\b", "[REDACTED_CARD_NUMBER]"),
    # Bank Account Numbers (9-18 digit standalone numbers following account keywords)
    (
        r"(?i)\b(account|acct|acc)\s*(num|number|#)?\s*[:=]?\s*\d{9,18}\b",
        r"\1 [REDACTED_BANK_ACCOUNT]",
    ),
    # Indian Aadhaar Numbers (12 digits, often formatted as 4-4-4)
    (r"\b\d{4}\s?\d{4}\s?\d{4}\b", "[REDACTED_GOVT_ID]"),
    # PAN Card Numbers (5 alpha + 4 digit + 1 alpha)
    (r"\b[A-Z]{5}\d{4}[A-Z]{1}\b", "[REDACTED_PAN]"),
    # Bearer tokens / API keys
    (r"\b(sk-[a-zA-Z0-9]{20,}|bearer\s+[a-zA-Z0-9._\-]+)\b", "[REDACTED_TOKEN]"),
]


def sanitize_text(text: str) -> str:
    """Sanitize input text by masking sensitive credentials, financial details, and private identifiers.

    Args:
        text: Raw input string.

    Returns:
        Sanitized string safe for escalation storage and operator review.
    """
    if not text:
        return ""

    sanitized = text
    for pattern, replacement in PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized)

    return sanitized
