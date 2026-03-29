import React from 'react';
import { Check, ChevronRight, Shield, X } from 'lucide-react';

export default function TariffsSheet({
    plans,
    selectedPlan,
    selectedPlanId,
    setSelectedPlanId,
    isSubmitting,
    isRenewalFlow,
    latestSubscription,
    onSubmit,
    onClose,
    fullscreen = false,
}) {
    const shellClassName = fullscreen
        ? 'mx-auto flex w-full max-w-3xl flex-col gap-6 text-white'
        : 'fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:p-6';
    const panelClassName = fullscreen
        ? 'rounded-[36px] border border-white/10 bg-black/35 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-5'
        : 'w-full max-w-3xl rounded-[36px] border border-white/10 bg-[#090b13]/95 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5';

    return (
        <div className={shellClassName}>
            {!fullscreen ? (
                <button
                    className="absolute inset-0 h-full w-full cursor-default"
                    aria-hidden="true"
                    onClick={onClose}
                />
            ) : null}

            <div className={panelClassName}>
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Тарифы</p>
                        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                            {isRenewalFlow ? 'Продли доступ без лишних экранов' : 'Открой доступ за пару тапов'}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                            Выбор тарифа теперь собран в короткий список: цена, срок и экономия видны сразу.
                        </p>
                    </div>
                    {onClose ? (
                        <button
                            className="rounded-2xl border border-white/10 p-3 text-white/70 transition hover:bg-white/8 hover:text-white"
                            onClick={onClose}
                            aria-label="Закрыть"
                        >
                            <X size={18} />
                        </button>
                    ) : null}
                </div>

                <div className="space-y-3">
                    {plans.map((plan) => {
                        const isSelected = plan.id === selectedPlanId;
                        const isCurrent = plan.durationDays === latestSubscription?.duration;

                        return (
                            <button
                                key={plan.id}
                                className={`w-full rounded-[28px] border p-5 text-left transition ${
                                    isSelected
                                        ? 'border-white bg-white text-black'
                                        : 'border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]'
                                }`}
                                onClick={() => setSelectedPlanId(plan.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-semibold">{plan.name}</h2>
                                            {isCurrent ? (
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isSelected ? 'bg-black/10 text-black/70' : 'bg-white/10 text-white/70'}`}>
                                                    Текущий тариф
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className={`mt-2 text-sm leading-6 ${isSelected ? 'text-black/70' : 'text-white/60'}`}>
                                            {plan.monthlyPrice ? `${plan.monthlyPrice}₽ / мес` : 'Цена загружается'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">{plan.price ? `${plan.price}₽` : '...'}</p>
                                        <p className={`mt-2 text-xs font-medium ${isSelected ? 'text-black/65' : 'text-white/50'}`}>
                                            {plan.savings > 0 ? `Экономия ${plan.savings}₽` : 'Без скидки'}
                                        </p>
                                    </div>
                                </div>
                                <div className={`mt-4 flex items-center gap-2 text-sm ${isSelected ? 'text-black/75' : 'text-white/65'}`}>
                                    <Shield size={16} />
                                    <span>1 устройство · VLESS</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="sticky bottom-0 mt-5 rounded-[28px] border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-white/50">Выбранный тариф</p>
                            <p className="mt-1 text-lg font-semibold text-white">
                                {selectedPlan?.name} {selectedPlan?.price ? `· ${selectedPlan.price}₽` : ''}
                            </p>
                        </div>
                        <button
                            className="flex items-center justify-center gap-2 rounded-[22px] bg-white px-5 py-4 text-base font-semibold text-black transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={onSubmit}
                            disabled={!selectedPlan || isSubmitting}
                        >
                            <span>{isRenewalFlow ? 'Продлить и перейти к оплате' : 'Открыть доступ и перейти к оплате'}</span>
                            {isSubmitting ? <Check size={18} /> : <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
