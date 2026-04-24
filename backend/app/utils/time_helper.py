from datetime import datetime, timedelta, timezone


def jakarta_now() -> datetime:
    """Return current Asia/Jakarta time as a naive datetime for existing DB columns."""
    return datetime.now(timezone(timedelta(hours=7))).replace(tzinfo=None)
