"""
Verification code system for WhatsApp bot / USSD authentication.

- Format: 024-XXX-NNNN (exactly 12 characters)
    * "024" fixed prefix
    * "-"
    * 3 uppercase letters (excludes I and O to avoid 1/0 confusion)
    * "-"
    * 4 digits
- Generated with the `secrets` module (cryptographically secure — not `random`).
- Unique across all users. Collision → regenerate (up to MAX_GEN_ATTEMPTS).
- 5-strike lockout on wrong attempts. Lockout duration: LOCKOUT_HOURS.
"""

import secrets
from datetime import timedelta
from django.utils import timezone

CODE_PREFIX = "024"
LETTER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ"   # no I, no O
DIGIT_ALPHABET = "0123456789"
LETTER_LEN = 3
DIGIT_LEN = 4

MAX_GEN_ATTEMPTS = 15
MAX_WRONG_ATTEMPTS = 5
LOCKOUT_HOURS = 24


def _generate_candidate():
    letters = "".join(secrets.choice(LETTER_ALPHABET) for _ in range(LETTER_LEN))
    digits = "".join(secrets.choice(DIGIT_ALPHABET) for _ in range(DIGIT_LEN))
    return f"{CODE_PREFIX}-{letters}-{digits}"


def generate_verification_code():
    """
    Generate a globally-unique 024-XXX-NNNN code.

    Returns the string. Raises RuntimeError if no unique code found in
    MAX_GEN_ATTEMPTS tries (statistically impossible given ~138M combinations).
    """
    from .models import CustomUser
    for _ in range(MAX_GEN_ATTEMPTS):
        candidate = _generate_candidate()
        if not CustomUser.objects.filter(verification_code=candidate).exists():
            return candidate
    raise RuntimeError("Could not generate a unique verification code after many attempts.")


def issue_code_for_user(user, agent):
    """
    Assign a fresh verification code to `user`, credited to `agent`.
    Resets any previous lockout state. Returns the new code.
    """
    code = generate_verification_code()
    user.verification_code = code
    user.verification_code_issued_at = timezone.now()
    user.verified_by_agent = agent
    user.verified_at = timezone.now()
    user.code_wrong_attempts = 0
    user.code_locked_until = None
    user.save(update_fields=[
        "verification_code",
        "verification_code_issued_at",
        "verified_by_agent",
        "verified_at",
        "code_wrong_attempts",
        "code_locked_until",
    ])
    return code


def check_verification_code(submitted_code):
    """
    Look up a user by verification code and enforce the 5-strike lockout.

    Returns a dict:
        { "ok": True,  "user": <CustomUser> }                     — correct code, unlocked
        { "ok": False, "reason": "locked", "until": <datetime>, "user": <CustomUser> }
        { "ok": False, "reason": "wrong", "attempts_left": int }
        { "ok": False, "reason": "not_found" }
    """
    from .models import CustomUser

    submitted = (submitted_code or "").strip().upper()
    if not submitted:
        return {"ok": False, "reason": "not_found"}

    # If a valid code was submitted, look up the user directly.
    user = CustomUser.objects.filter(verification_code=submitted).first()

    if user:
        # Correct code — but still check lockout so a locked user can't sneak past.
        if user.code_locked_until and user.code_locked_until > timezone.now():
            return {"ok": False, "reason": "locked", "until": user.code_locked_until, "user": user}
        # Reset attempts on success.
        if user.code_wrong_attempts:
            user.code_wrong_attempts = 0
            user.save(update_fields=["code_wrong_attempts"])
        return {"ok": True, "user": user}

    # Wrong code — we don't know which user submitted it (WhatsApp/USSD scenario),
    # so we can't per-user increment here. The caller (session handler) tracks
    # attempts per session/phone. See `record_wrong_attempt_for_user` for the
    # verified-user variant used when we DO know the user.
    return {"ok": False, "reason": "not_found"}


def record_wrong_attempt_for_user(user):
    """
    Increment wrong-attempt counter for a KNOWN user (used when a WhatsApp
    session already has an authenticated phone number but the user typed
    the wrong code). Locks the account after MAX_WRONG_ATTEMPTS strikes.

    Returns:
        { "locked": bool, "attempts_left": int, "until": <datetime|None> }
    """
    user.code_wrong_attempts = (user.code_wrong_attempts or 0) + 1
    if user.code_wrong_attempts >= MAX_WRONG_ATTEMPTS:
        user.code_locked_until = timezone.now() + timedelta(hours=LOCKOUT_HOURS)
        user.save(update_fields=["code_wrong_attempts", "code_locked_until"])
        return {"locked": True, "attempts_left": 0, "until": user.code_locked_until}
    user.save(update_fields=["code_wrong_attempts"])
    return {
        "locked": False,
        "attempts_left": MAX_WRONG_ATTEMPTS - user.code_wrong_attempts,
        "until": None,
    }


def clear_lockout(user):
    """Admin override — unlock a user and reset counters."""
    user.code_wrong_attempts = 0
    user.code_locked_until = None
    user.save(update_fields=["code_wrong_attempts", "code_locked_until"])
