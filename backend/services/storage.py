import json
import os
from pathlib import Path
from typing import Optional
from datetime import datetime
import uuid

from models import Template, TemplateCreate


class StorageService:
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.templates_dir = self.data_dir / "templates"
        self.assets_dir = self.data_dir / "assets"
        self.outputs_dir = self.data_dir / "outputs"
        self._ensure_dirs()

    def _ensure_dirs(self):
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        (self.assets_dir / "backgrounds").mkdir(parents=True, exist_ok=True)
        (self.assets_dir / "fonts").mkdir(parents=True, exist_ok=True)
        (self.assets_dir / "overlays").mkdir(parents=True, exist_ok=True)
        self.outputs_dir.mkdir(parents=True, exist_ok=True)

    # Templates
    def list_templates(self) -> list[Template]:
        templates = []
        for f in self.templates_dir.glob("*.json"):
            with open(f) as file:
                data = json.load(file)
                templates.append(Template(**data))
        return sorted(templates, key=lambda t: t.updated_at, reverse=True)

    def get_template(self, template_id: str) -> Optional[Template]:
        path = self.templates_dir / f"{template_id}.json"
        if not path.exists():
            return None
        with open(path) as f:
            return Template(**json.load(f))

    def create_template(self, data: TemplateCreate) -> Template:
        template_id = str(uuid.uuid4())[:8]
        template = Template(
            id=template_id,
            name=data.name,
            pipeline=data.pipeline,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        self._save_template(template)
        return template

    def update_template(self, template_id: str, updates: dict) -> Optional[Template]:
        template = self.get_template(template_id)
        if not template:
            return None
        template_dict = template.model_dump()
        template_dict.update(updates)
        template_dict["updated_at"] = datetime.now()
        updated = Template(**template_dict)
        self._save_template(updated)
        return updated

    def delete_template(self, template_id: str) -> bool:
        path = self.templates_dir / f"{template_id}.json"
        if path.exists():
            path.unlink()
            return True
        return False

    def duplicate_template(self, template_id: str, new_name: str) -> Optional[Template]:
        template = self.get_template(template_id)
        if not template:
            return None
        new_id = str(uuid.uuid4())[:8]
        new_template = template.model_copy()
        new_template.id = new_id
        new_template.name = new_name
        new_template.created_at = datetime.now()
        new_template.updated_at = datetime.now()
        self._save_template(new_template)
        return new_template

    def _save_template(self, template: Template):
        path = self.templates_dir / f"{template.id}.json"
        with open(path, "w") as f:
            json.dump(template.model_dump(mode="json"), f, indent=2, default=str)

    # Assets
    def list_assets(self, asset_type: str) -> list[dict]:
        asset_dir = self.assets_dir / asset_type
        if not asset_dir.exists():
            return []
        assets = []
        for f in asset_dir.iterdir():
            if f.is_file() and not f.name.startswith("."):
                assets.append({
                    "id": f.stem,
                    "filename": f.name,
                    "path": str(f),
                    "type": asset_type,
                    "size": f.stat().st_size,
                })
        return assets

    def save_asset(self, asset_type: str, filename: str, content: bytes) -> dict:
        asset_dir = self.assets_dir / asset_type
        asset_dir.mkdir(parents=True, exist_ok=True)
        path = asset_dir / filename
        with open(path, "wb") as f:
            f.write(content)
        return {
            "id": path.stem,
            "filename": filename,
            "path": str(path),
            "type": asset_type,
        }

    def delete_asset(self, asset_type: str, filename: str) -> bool:
        path = self.assets_dir / asset_type / filename
        if path.exists():
            path.unlink()
            return True
        return False

    def get_asset_path(self, asset_type: str, filename: str) -> Optional[Path]:
        path = self.assets_dir / asset_type / filename
        return path if path.exists() else None

    # Outputs
    def list_outputs(self) -> list[dict]:
        outputs = []
        for f in self.outputs_dir.glob("*.png"):
            outputs.append({
                "id": f.stem,
                "filename": f.name,
                "path": str(f),
                "size": f.stat().st_size,
                "created_at": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
            })
        return sorted(outputs, key=lambda o: o["created_at"], reverse=True)

    def save_output(self, filename: str, content: bytes) -> dict:
        path = self.outputs_dir / filename
        with open(path, "wb") as f:
            f.write(content)
        return {
            "id": path.stem,
            "filename": filename,
            "path": str(path),
        }

    def delete_output(self, filename: str) -> bool:
        path = self.outputs_dir / filename
        if path.exists():
            path.unlink()
            return True
        return False

    def get_output_path(self, filename: str) -> Optional[Path]:
        path = self.outputs_dir / filename
        return path if path.exists() else None


# Singleton instance
storage = StorageService(os.getenv("DATA_DIR", "./data"))
