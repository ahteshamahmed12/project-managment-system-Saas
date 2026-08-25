import asyncio
import smtplib
from email.message import EmailMessage

from config import settings


def _send_via_smtp(to_email: str, subject: str, body: str) -> None:
    message = EmailMessage()
    message["From"] = settings.email_from
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)


async def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Send the password reset link. If SMTP is not configured the link
    is printed to the console so the flow still works in development."""

    subject = "Reset your Promage password"
    body = (
        "Hello,\n\n"
        "We received a request to reset your password.\n"
        "Click the link below to choose a new one "
        f"(valid for {settings.reset_token_expire_minutes} minutes):\n\n"
        f"{reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n"
        "- The Promage Team"
    )

    if not settings.smtp_host:
        print("=" * 60)
        print(f"[DEV EMAIL] Password reset requested for {to_email}")
        print(f"[DEV EMAIL] Reset link: {reset_link}")
        print("=" * 60)
        return

    await asyncio.to_thread(_send_via_smtp, to_email, subject, body)
