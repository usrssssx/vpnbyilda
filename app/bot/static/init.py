from json import JSONDecodeError, dumps, loads
from pathlib import Path
from hashlib import sha256
from aiogram import Bot
from aiogram.types import FSInputFile

from app.configs.app import app_settings
from app.application.exception import ImageNotFoundException

class ImageManager:
    def __init__(self):
        self.images_file_id = {}
        self.signature = ""
        self.images_paths = {
            "about": "about.jpg",
            "buy": "buy.jpg",
            "connect": "type_vpn.jpg",
            "device_count": "device_count.jpg",
            "duration": "duration.jpg",
            "help": "help.jpg",
            "menu": "menu.jpg",
            "start": "menu.jpg",
            "support": "help.jpg",
            "tariffs": "buy.jpg",
            "type_vpn": "type_vpn.jpg",
        }

    def _compute_signature(self) -> str:
        payload: list[str] = []
        for key, path in sorted(self.images_paths.items()):
            file_path = Path(__file__).parent / path
            stat = file_path.stat()
            payload.append(f"{key}:{path}:{stat.st_size}:{int(stat.st_mtime)}")
        return sha256("|".join(payload).encode()).hexdigest()

    async def load_image_ids(self) -> tuple[dict[str, str], str]:
        try:
            with open("./app/bot/static/images_fileid.json", "r") as f:
                data = f.read()
                if not data:
                    return {}, ""
                loaded = loads(data)
                if isinstance(loaded, dict) and "images" in loaded:
                    return loaded.get("images", {}), loaded.get("signature", "")
                if isinstance(loaded, dict):
                    return loaded, ""
                return {}, ""
        except (JSONDecodeError, FileNotFoundError):
            return {}, ""

    async def save_image_ids(self) -> None:
        with open('./app/bot/static/images_fileid.json', 'w') as f:
            f.write(dumps({
                "signature": self.signature,
                "images": self.images_file_id,
            }))

    async def init_photo(self, bot: Bot) -> None:
        self.images_file_id, stored_signature = await self.load_image_ids()
        self.signature = self._compute_signature()

        if (
            self.images_file_id
            and set(self.images_file_id.keys()) == set(self.images_paths.keys())
            and stored_signature == self.signature
        ):
            return

        for key, path in self.images_paths.items():
            file_path = Path(__file__).parent / path
            resp = await bot.send_photo(app_settings.BOT_OWNER_ID, FSInputFile(path=file_path, filename=path))
            if resp.photo is None:
                raise ImageNotFoundException(photo_key=key)

            self.images_file_id[key] = resp.photo[-1].file_id

        await self.save_image_ids()

    def get_image_id(self, key: str) -> str:
        return self.images_file_id.get(key, "")

photo_manager = ImageManager()
