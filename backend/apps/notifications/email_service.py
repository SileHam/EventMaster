def _send(subject, message, to_email):
    print("Email would be sent to: " + to_email)
    print("Subject: " + subject)


def send_confirmation_email(registration):
    _send(
        f"Registration received - {registration.event.title}",
        "Registration received.",
        registration.participant.email,
    )


def send_reminder_email(registration):
    _send(
        f"Reminder - {registration.event.title}",
        "Reminder email.",
        registration.participant.email,
    )


def send_cancellation_email(registration, reason=''):
    _send(
        f"Event cancelled - {registration.event.title}",
        reason or "Event cancelled.",
        registration.participant.email,
    )


def send_badge_ready_email(registration):
    _send(
        f"Badge ready - {registration.event.title}",
        "Your badge is ready.",
        registration.participant.email,
    )
