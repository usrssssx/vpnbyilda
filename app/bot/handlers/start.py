from aiogram import F, Router
from aiogram.filters.command import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from dishka.integrations.aiogram import FromDishka

from app.application.commands.users.create import CreateUserCommand
from app.application.queries.servers.get_protocols import GetListProtocolsQuery
from app.application.queries.subscription.get_price import GetPriceSubscriptionQuery
from app.bot.content import TextPage, about_pages, offer_pages, privacy_pages
from app.bot.messages.menu import (
    AboutButton,
    BackButton,
    ConnectButton,
    ConnectMessageBuilder,
    document_keyboard,
    DocumentPageCallbackData,
    DocumentsButton,
    DocumentsMessageBuilder,
    MenuSectionCallbackData,
    OfferButton,
    PolicyButton,
    StartMessageBuilder,
    SupportButton,
    SupportMessageBuilder,
    TariffsButton,
    TariffsMessageBuilder,
    TextPageMessageBuilder,
)
from app.infrastructure.mediator.base import BaseMediator


router = Router()


def _about_documents() -> dict[str, tuple[TextPage, ...]]:
    return {
        "about": about_pages(),
        "offer": offer_pages(),
        "privacy": privacy_pages(),
    }


async def show_media_message(message: Message, data: dict) -> None:
    media = data.pop("media")
    if message.photo:
        await message.edit_media(media=media, reply_markup=data.get("reply_markup"))
        return

    await message.delete()
    payload = {"photo": media.media, "caption": media.caption}
    if media.parse_mode:
        payload["parse_mode"] = media.parse_mode
    if data.get("reply_markup"):
        payload["reply_markup"] = data["reply_markup"]
    await message.answer_photo(**payload)


async def show_text_message(message: Message, data: dict) -> None:
    if message.photo:
        await message.delete()
        await message.answer(**data)
        return
    await message.edit_text(**data)


def build_text_page(kind: str, page: int) -> dict:
    pages = _about_documents()[kind]
    safe_page = max(0, min(page, len(pages) - 1))
    current = pages[safe_page]
    return TextPageMessageBuilder().build(
        current.body,
        reply_markup=document_keyboard(kind=kind, page=safe_page, total_pages=len(pages)),
    )


async def render_main_menu(message: Message) -> None:
    await show_media_message(message, StartMessageBuilder().build())


async def render_tariffs(message: Message, mediator: BaseMediator) -> None:
    protocols = await mediator.handle_query(GetListProtocolsQuery())
    primary_protocol = protocols[0] if protocols else "vless"
    prices: list[tuple[int, float]] = []
    for duration in (30, 90, 180, 360):
        price = await mediator.handle_query(
            GetPriceSubscriptionQuery(duration=duration, device_count=1, protocol_types=[primary_protocol])
        )
        prices.append((duration, float(price)))
    await show_media_message(message, TariffsMessageBuilder().build(prices))


@router.message(Command("start"))
async def start(message: Message, mediator: FromDishka[BaseMediator]) -> None:
    payload = StartMessageBuilder().build()
    media = payload.pop("media")
    await message.answer_photo(
        photo=media.media,
        caption=media.caption,
        parse_mode=media.parse_mode,
        reply_markup=payload["reply_markup"],
    )

    referred_by = message.text.split() if message.text else []
    referred_by = referred_by[1] if len(referred_by) == 2 else None

    if not message.from_user:
        raise RuntimeError("User is missing in /start")

    await mediator.handle_command(
        CreateUserCommand(
            tg_id=message.from_user.id,
            is_premium=message.from_user.is_premium,
            username=message.from_user.username,
            fullname=f"{message.from_user.first_name}-{message.from_user.last_name}",
            phone=None,
            referred_by=referred_by,
        )
    )


@router.callback_query(F.data.in_({BackButton.callback_data, "back"}))
async def menu(callback_query: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await render_main_menu(callback_query.message)
    await callback_query.answer()


@router.callback_query(F.data.in_({TariffsButton.callback_data, "reward"}))
async def tariffs(callback_query: CallbackQuery, mediator: FromDishka[BaseMediator]) -> None:
    await render_tariffs(callback_query.message, mediator)
    await callback_query.answer()


@router.callback_query(F.data.in_({SupportButton.callback_data, "help"}))
async def support(callback_query: CallbackQuery) -> None:
    await show_media_message(callback_query.message, SupportMessageBuilder().build())
    await callback_query.answer()


@router.callback_query(F.data == ConnectButton.callback_data)
async def connect(callback_query: CallbackQuery) -> None:
    await show_media_message(callback_query.message, ConnectMessageBuilder().build())
    await callback_query.answer()


@router.callback_query(F.data.in_({AboutButton.callback_data, "about"}))
async def about(callback_query: CallbackQuery) -> None:
    await show_text_message(callback_query.message, build_text_page("about", 0))
    await callback_query.answer()


@router.callback_query(F.data == DocumentsButton.callback_data)
async def documents(callback_query: CallbackQuery) -> None:
    await show_media_message(callback_query.message, DocumentsMessageBuilder().build())
    await callback_query.answer()


@router.callback_query(F.data == OfferButton.callback_data)
async def offer(callback_query: CallbackQuery) -> None:
    await show_text_message(callback_query.message, build_text_page("offer", 0))
    await callback_query.answer()


@router.callback_query(F.data == PolicyButton.callback_data)
async def policy(callback_query: CallbackQuery) -> None:
    await show_text_message(callback_query.message, build_text_page("privacy", 0))
    await callback_query.answer()


@router.callback_query(DocumentPageCallbackData.filter())
async def document_page(callback_query: CallbackQuery, callback_data: DocumentPageCallbackData) -> None:
    if callback_data.kind not in _about_documents():
        await callback_query.answer()
        return

    await show_text_message(callback_query.message, build_text_page(callback_data.kind, callback_data.page))
    await callback_query.answer()


@router.callback_query(MenuSectionCallbackData.filter())
async def menu_sections(
    callback_query: CallbackQuery,
    callback_data: MenuSectionCallbackData,
    mediator: FromDishka[BaseMediator],
    state: FSMContext,
) -> None:
    section = callback_data.section

    if section == "back":
        await state.clear()
        await render_main_menu(callback_query.message)
    elif section == "tariffs":
        await render_tariffs(callback_query.message, mediator)
    elif section == "about":
        await show_text_message(callback_query.message, build_text_page("about", 0))
    elif section == "connect":
        await show_media_message(callback_query.message, ConnectMessageBuilder().build())
    elif section == "offer":
        await show_text_message(callback_query.message, build_text_page("offer", 0))
    elif section == "privacy":
        await show_text_message(callback_query.message, build_text_page("privacy", 0))
    elif section == "support":
        await show_media_message(callback_query.message, SupportMessageBuilder().build())
    elif section == "docs":
        await show_media_message(callback_query.message, DocumentsMessageBuilder().build())

    await callback_query.answer()
