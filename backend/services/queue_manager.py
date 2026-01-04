"""
Queue Manager Service

Manages the thumbnail generation queue for both UI and API requests.
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional, Literal
from dataclasses import dataclass, asdict


@dataclass
class QueueJob:
    """A job in the queue."""
    id: str
    template_id: str
    episode_id: str
    data: dict
    status: Literal["processing", "pending", "approved", "failed"]
    source: Literal["ui", "api"]
    created_at: str
    completed_at: Optional[str] = None
    output_path: Optional[str] = None
    error: Optional[str] = None


class QueueManager:
    """Manages the thumbnail generation queue."""

    def __init__(self):
        self.queue_dir = Path("./data/queue")
        self.queue_dir.mkdir(parents=True, exist_ok=True)
        self.auto_approve = True  # Default setting

    def _job_path(self, job_id: str) -> Path:
        return self.queue_dir / f"{job_id}.json"

    def create_job(
        self,
        template_id: str,
        episode_id: str,
        data: dict,
        source: Literal["ui", "api"] = "ui"
    ) -> QueueJob:
        """Create a new queue job."""
        job = QueueJob(
            id=str(uuid.uuid4()),
            template_id=template_id,
            episode_id=episode_id,
            data=data,
            status="processing",
            source=source,
            created_at=datetime.utcnow().isoformat() + "Z"
        )
        self._save_job(job)
        return job

    def _save_job(self, job: QueueJob):
        """Save a job to disk."""
        with open(self._job_path(job.id), "w") as f:
            json.dump(asdict(job), f, indent=2)

    def _load_job(self, job_id: str) -> Optional[QueueJob]:
        """Load a job from disk."""
        path = self._job_path(job_id)
        if not path.exists():
            return None
        with open(path) as f:
            data = json.load(f)
        return QueueJob(**data)

    def complete_job(self, job_id: str, output_path: str):
        """Mark a job as completed."""
        job = self._load_job(job_id)
        if not job:
            return

        job.completed_at = datetime.utcnow().isoformat() + "Z"
        job.output_path = output_path

        # Auto-approve or set to pending
        if self.auto_approve or job.source == "ui":
            job.status = "approved"
        else:
            job.status = "pending"

        self._save_job(job)

    def fail_job(self, job_id: str, error: str):
        """Mark a job as failed."""
        job = self._load_job(job_id)
        if not job:
            return

        job.status = "failed"
        job.error = error
        job.completed_at = datetime.utcnow().isoformat() + "Z"
        self._save_job(job)

    def approve_job(self, job_id: str) -> bool:
        """Approve a pending job."""
        job = self._load_job(job_id)
        if not job or job.status != "pending":
            return False

        job.status = "approved"
        self._save_job(job)
        return True

    def delete_job(self, job_id: str) -> bool:
        """Delete a job."""
        path = self._job_path(job_id)
        if path.exists():
            path.unlink()
            return True
        return False

    def get_all_jobs(self) -> list:
        """Get all jobs, sorted by creation time (newest first)."""
        jobs = []
        for path in self.queue_dir.glob("*.json"):
            if path.name != ".gitkeep":
                job = self._load_job(path.stem)
                if job:
                    jobs.append(job)
        return sorted(jobs, key=lambda j: j.created_at, reverse=True)

    def get_pending_jobs(self) -> list:
        """Get all pending jobs."""
        return [j for j in self.get_all_jobs() if j.status == "pending"]

    def set_auto_approve(self, enabled: bool):
        """Set auto-approve setting."""
        self.auto_approve = enabled


# Singleton instance
queue_manager = QueueManager()
