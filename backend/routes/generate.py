from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
import uuid
import httpx
import base64

from models import GenerateRequest, GenerateResponse, Template
from services.storage import storage
from services.renderer import renderer
from services.imagen import imagen

router = APIRouter(prefix="/api/generate", tags=["generate"])

# Simple in-memory job tracking
jobs: dict[str, dict] = {}


@router.post("", response_model=GenerateResponse)
async def generate_thumbnail(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
):
    # Validate template exists
    template = storage.get_template(request.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Create job
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        "status": "processing",
        "outputs": [],
        "error": None,
    }

    # Run generation in background
    background_tasks.add_task(
        _generate_task,
        job_id,
        template,
        request,
    )

    return GenerateResponse(job_id=job_id, status="processing")


@router.get("/{job_id}/status", response_model=GenerateResponse)
def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    return GenerateResponse(
        job_id=job_id,
        status=job["status"],
        outputs=job["outputs"],
    )


@router.post("/preview")
async def preview_thumbnail(
    template_id: str,
    episode_data: dict,
    background_override: Optional[str] = None,
):
    """Generate a preview without saving to outputs"""
    template = storage.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    try:
        image_bytes = renderer.render(template, episode_data, background_override)
        return {
            "image": base64.b64encode(image_bytes).decode("utf-8"),
            "format": "png",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_task(
    job_id: str,
    template: Template,
    request: GenerateRequest,
):
    try:
        outputs = []

        for i in range(request.variants):
            background_override = None
            if template.background.mode == "ai" and imagen.is_available():
                prompt = template.background.ai_config.prompt_template.format(
                    **request.data
                )
                bg_bytes = imagen.generate(
                    prompt=prompt,
                    negative_prompt=template.background.ai_config.negative_prompt,
                    width=template.canvas.width,
                    height=template.canvas.height,
                )

                if bg_bytes:
                    bg_filename = f"_temp_{job_id}_{i}.png"
                    storage.save_asset("backgrounds", bg_filename, bg_bytes)
                    background_override = bg_filename

            image_bytes = renderer.render(template, request.data, background_override)

            variant_suffix = f"-{i+1}" if request.variants > 1 else ""
            filename = f"{request.episode_id}-{template.id}{variant_suffix}.png"
            result = storage.save_output(filename, image_bytes)

            outputs.append({
                "path": result["path"],
                "filename": result["filename"],
                "size": "youtube",
                "dimensions": [template.canvas.width, template.canvas.height],
            })

            if background_override and background_override.startswith("_temp_"):
                storage.delete_asset("backgrounds", background_override)

        jobs[job_id]["status"] = "complete"
        jobs[job_id]["outputs"] = outputs

        if request.webhook_url:
            async with httpx.AsyncClient() as client:
                try:
                    await client.post(
                        request.webhook_url,
                        json={
                            "job_id": job_id,
                            "status": "complete",
                            "outputs": outputs,
                        },
                    )
                except Exception as e:
                    print(f"Webhook error: {e}")

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
