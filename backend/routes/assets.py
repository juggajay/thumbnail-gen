from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from services.storage import storage

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("")
def list_all_assets():
    return {
        "backgrounds": storage.list_assets("backgrounds"),
        "fonts": storage.list_assets("fonts"),
        "overlays": storage.list_assets("overlays"),
    }


@router.get("/{asset_type}")
def list_assets(asset_type: str):
    if asset_type not in ["backgrounds", "fonts", "overlays"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")
    return storage.list_assets(asset_type)


@router.post("/{asset_type}")
async def upload_asset(asset_type: str, file: UploadFile = File(...)):
    if asset_type not in ["backgrounds", "fonts", "overlays"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    content = await file.read()
    result = storage.save_asset(asset_type, file.filename, content)
    return result


@router.delete("/{asset_type}/{filename}")
def delete_asset(asset_type: str, filename: str):
    if not storage.delete_asset(asset_type, filename):
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"status": "deleted"}


@router.get("/{asset_type}/{filename}")
def get_asset(asset_type: str, filename: str):
    path = storage.get_asset_path(asset_type, filename)
    if not path:
        raise HTTPException(status_code=404, detail="Asset not found")
    return FileResponse(path)
