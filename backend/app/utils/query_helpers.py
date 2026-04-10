from typing import Iterable
from sqlalchemy import func

from app.models import db
from app.models.forum import Vote, Report, Answer


def _as_ids(values: Iterable[int]) -> list[int]:
    return [int(v) for v in values if v is not None]


def aggregate_vote_counts(target_type: str, target_ids: Iterable[int]) -> dict[int, int]:
    ids = _as_ids(target_ids)
    if not ids:
        return {}
    rows = db.session.query(
        Vote.target_id,
        func.coalesce(func.sum(Vote.value), 0).label('vote_count')
    ).filter(
        Vote.target_type == target_type,
        Vote.target_id.in_(ids)
    ).group_by(Vote.target_id).all()
    return {int(row.target_id): int(row.vote_count or 0) for row in rows}


def aggregate_report_counts(target_type: str, target_ids: Iterable[int]) -> dict[int, int]:
    ids = _as_ids(target_ids)
    if not ids:
        return {}
    rows = db.session.query(
        Report.target_id,
        func.count(Report.id).label('report_count')
    ).filter(
        Report.target_type == target_type,
        Report.target_id.in_(ids)
    ).group_by(Report.target_id).all()
    return {int(row.target_id): int(row.report_count or 0) for row in rows}


def aggregate_answer_counts(post_ids: Iterable[int]) -> dict[int, int]:
    ids = _as_ids(post_ids)
    if not ids:
        return {}
    rows = db.session.query(
        Answer.post_id,
        func.count(Answer.id).label('answer_count')
    ).filter(
        Answer.post_id.in_(ids)
    ).group_by(Answer.post_id).all()
    return {int(row.post_id): int(row.answer_count or 0) for row in rows}


def aggregate_user_votes(user_id: int, target_type: str, target_ids: Iterable[int]) -> dict[int, int]:
    ids = _as_ids(target_ids)
    if not ids:
        return {}
    rows = db.session.query(
        Vote.target_id,
        Vote.value
    ).filter(
        Vote.user_id == user_id,
        Vote.target_type == target_type,
        Vote.target_id.in_(ids)
    ).all()
    return {int(row.target_id): int(row.value) for row in rows}
