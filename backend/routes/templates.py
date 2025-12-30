from fastapi import APIRouter, HTTPException
from models import Template, TemplateCreate
from services.storage import storage

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[Template])
def list_templates():
    return storage.list_templates()


@router.post("", response_model=Template)
def create_template(data: TemplateCreate):
    return storage.create_template(data)


@router.get("/{template_id}", response_model=Template)
def get_template(template_id: str):
    template = storage.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=Template)
def update_template(template_id: str, updates: dict):
    template = storage.update_template(template_id, updates)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.delete("/{template_id}")
def delete_template(template_id: str):
    if not storage.delete_template(template_id):
        raise HTTPException(status_code=404, detail="Template not found")
    return {"status": "deleted"}


@router.post("/{template_id}/duplicate", response_model=Template)
def duplicate_template(template_id: str, new_name: str = "Copy"):
    template = storage.duplicate_template(template_id, new_name)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
