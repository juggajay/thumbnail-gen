from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.storage import storage

router = APIRouter(prefix="/api/outputs", tags=["outputs"])


@router.get("")
def list_outputs():
    return storage.list_outputs()


@router.get("/{filename}")
def get_output(filename: str):
    path = storage.get_output_path(filename)
    if not path:
        raise HTTPException(status_code=404, detail="Output not found")
    return FileResponse(path)


@router.delete("/{filename}")
def delete_output(filename: str):
    if not storage.delete_output(filename):
        raise HTTPException(status_code=404, detail="Output not found")
    return {"status": "deleted"}
