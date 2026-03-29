from typing import Any

from aiogram.filters.callback_data import CallbackData
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from app.bot.content import (
    HIDDIFY_DOWNLOAD_URL,
    HIDDIFY_GUIDE_URL,
    connect_caption,
    support_caption,
    tariffs_caption,
    welcome_caption,
)
from app.bot.messages.base import BaseMediaBuilder, BaseMessageBuilder
from app.configs.app import app_settings


def build_web_app_url(path: str = "") -> str:
    if not path:
        return app_settings.web_app_url
    return f"{app_settings.web_app_url.rstrip('/')}/{path.lstrip('/')}"


class MenuSectionCallbackData(CallbackData, prefix="menu"):
    section: str


class DocumentPageCallbackData(CallbackData, prefix="doc"):
    kind: str
    page: int


class VPNButton:
    text = "🗂 Мои подписки"
    callback_data = "vpn"


class TariffsButton:
    text = "💳 Тарифы"
    callback_data = MenuSectionCallbackData(section="tariffs").pack()


class AboutButton:
    text = "🏢 О сервисе"
    callback_data = MenuSectionCallbackData(section="about").pack()


class ConnectButton:
    text = "🧭 Как подключиться"
    callback_data = MenuSectionCallbackData(section="connect").pack()


class OfferButton:
    text = "📄 Оферта"
    callback_data = MenuSectionCallbackData(section="offer").pack()


class PolicyButton:
    text = "🔒 Политика"
    callback_data = MenuSectionCallbackData(section="privacy").pack()


class SupportButton:
    text = "🆘 Поддержка"
    callback_data = MenuSectionCallbackData(section="support").pack()
    url = app_settings.VPN_HELP_ACCOUNT


class DocumentsButton:
    text = "📚 Документы"
    callback_data = MenuSectionCallbackData(section="docs").pack()


class OpenAppButton:
    text = "🖥 Открыть приложение"


class OpenTariffsAppButton:
    text = "Оформить подписку"


class InstructionButton:
    text = "📘 Инструкция"
    url = HIDDIFY_GUIDE_URL


class DownloadClientButton:
    text = "⬇️ Скачать клиент"
    url = HIDDIFY_DOWNLOAD_URL


class BackButton:
    text = "⬅ В главное меню"
    callback_data = MenuSectionCallbackData(section="back").pack()


def get_main_menu_keyboards() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text=TariffsButton.text, callback_data=TariffsButton.callback_data),
                InlineKeyboardButton(text=AboutButton.text, callback_data=AboutButton.callback_data),
            ],
            [
                InlineKeyboardButton(text=ConnectButton.text, callback_data=ConnectButton.callback_data),
                InlineKeyboardButton(text=OfferButton.text, callback_data=OfferButton.callback_data),
            ],
            [
                InlineKeyboardButton(text=PolicyButton.text, callback_data=PolicyButton.callback_data),
                InlineKeyboardButton(text=SupportButton.text, callback_data=SupportButton.callback_data),
            ],
        ]
    )


def get_tariffs_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=OpenTariffsAppButton.text, web_app=WebAppInfo(url=build_web_app_url("/tariffs")))],
            [InlineKeyboardButton(text=OpenAppButton.text, web_app=WebAppInfo(url=app_settings.web_app_url))],
            [InlineKeyboardButton(text=BackButton.text, callback_data=BackButton.callback_data)],
        ]
    )


def get_connect_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=OpenAppButton.text, web_app=WebAppInfo(url=build_web_app_url("/vpn")))],
            [InlineKeyboardButton(text=InstructionButton.text, url=InstructionButton.url)],
            [InlineKeyboardButton(text=DownloadClientButton.text, url=DownloadClientButton.url)],
            [InlineKeyboardButton(text=SupportButton.text, url=SupportButton.url)],
            [InlineKeyboardButton(text=BackButton.text, callback_data=BackButton.callback_data)],
        ]
    )


def get_support_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Написать в поддержку", url=SupportButton.url)],
            [InlineKeyboardButton(text=OpenAppButton.text, web_app=WebAppInfo(url=app_settings.web_app_url))],
            [InlineKeyboardButton(text=BackButton.text, callback_data=BackButton.callback_data)],
        ]
    )


def get_about_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=DocumentsButton.text, callback_data=DocumentsButton.callback_data)],
            [InlineKeyboardButton(text=SupportButton.text, url=SupportButton.url)],
            [InlineKeyboardButton(text=BackButton.text, callback_data=BackButton.callback_data)],
        ]
    )


def get_docs_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text=OfferButton.text, callback_data=OfferButton.callback_data),
                InlineKeyboardButton(text=PolicyButton.text, callback_data=PolicyButton.callback_data),
            ],
            [InlineKeyboardButton(text=BackButton.text, callback_data=BackButton.callback_data)],
        ]
    )


def document_keyboard(kind: str, page: int, total_pages: int) -> InlineKeyboardMarkup:
    controls: list[InlineKeyboardButton] = []
    if page > 0:
        controls.append(
            InlineKeyboardButton(
                text="◀ Назад",
                callback_data=DocumentPageCallbackData(kind=kind, page=page - 1).pack(),
            )
        )
    if page < total_pages - 1:
        controls.append(
            InlineKeyboardButton(
                text="Далее ▶",
                callback_data=DocumentPageCallbackData(kind=kind, page=page + 1).pack(),
            )
        )

    keyboard = InlineKeyboardMarkup(inline_keyboard=[])
    if controls:
        keyboard.inline_keyboard.append(controls)

    if kind == "about":
        keyboard.inline_keyboard.append(
            [InlineKeyboardButton(text="📚 К документам", callback_data=DocumentsButton.callback_data)]
        )
    else:
        keyboard.inline_keyboard.append(
            [InlineKeyboardButton(text="📚 К списку документов", callback_data=DocumentsButton.callback_data)]
        )
    keyboard.inline_keyboard.append(
        [InlineKeyboardButton(text=BackButton.text, callback_data=BackButton.callback_data)]
    )
    return keyboard


class StartMessageBuilder(BaseMediaBuilder):
    _photo = "start"
    _caption = welcome_caption()
    _parse_mode = "HTML"
    _reply_markup = get_main_menu_keyboards()


class TariffsMessageBuilder(BaseMediaBuilder):
    _photo = "tariffs"
    _parse_mode = "HTML"
    _reply_markup = get_tariffs_keyboard()

    def build(self, prices: list[tuple[int, float]] | None = None) -> dict[str, Any]:
        self._caption = tariffs_caption(prices)
        return super().build()


class ConnectMessageBuilder(BaseMediaBuilder):
    _photo = "connect"
    _caption = connect_caption()
    _parse_mode = "HTML"
    _reply_markup = get_connect_keyboard()


class SupportMessageBuilder(BaseMediaBuilder):
    _photo = "support"
    _caption = support_caption()
    _parse_mode = "HTML"
    _reply_markup = get_support_keyboard()


class DocumentsMessageBuilder(BaseMediaBuilder):
    _photo = "about"
    _caption = (
        "<b>Документы и юридическая информация</b>\n\n"
        "В этом разделе доступны публичная оферта и политика обработки персональных данных.\n"
        "Выберите документ ниже."
    )
    _parse_mode = "HTML"
    _reply_markup = get_docs_keyboard()


class AboutHubMessageBuilder(BaseMediaBuilder):
    _photo = "about"
    _caption = (
        "<b>О сервисе</b>\n\n"
        "Здесь собрана информация о формате работы сервиса, назначении защищённого соединения, "
        "юридических реквизитах и пользовательских документах."
    )
    _parse_mode = "HTML"
    _reply_markup = get_about_keyboard()


class TextPageMessageBuilder(BaseMessageBuilder):
    _parse_mode = "HTML"
    _text = ""
    _reply_markup: Any = None

    def build(self, text: str, reply_markup: InlineKeyboardMarkup) -> dict[str, Any]:
        self._text = text
        self._reply_markup = reply_markup
        return super().build()
