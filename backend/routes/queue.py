from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.queue_manager import queue_manager

router = APIRouter(prefix="/api/queue", tags=["queue"])


class QueueSettingsRequest(BaseModel):
    auto_approve: bool


@router.get("")
async def get_queue():
    """Get all queue items."""
    jobs = queue_manager.get_all_jobs()
    return {"jobs": [j.__dict__ for j in jobs]}


@router.post("/{job_id}/approve")
async def approve_job(job_id: str):
    """Approve a pending job."""
    if not queue_manager.approve_job(job_id):
        raise HTTPException(status_code=404, detail="Job not found or not pending")
    return {"status": "approved"}


@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete a job."""
    if not queue_manager.delete_job(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "deleted"}


@router.patch("/settings")
async def update_settings(request: QueueSettingsRequest):
    """Update queue settings."""
    queue_manager.set_auto_approve(request.auto_approve)
    return {"auto_approve": queue_manager.auto_approve}


@router.get("/settings")
async def get_settings():
    """Get queue settings."""
    return {"auto_approve": queue_manager.auto_approve}
