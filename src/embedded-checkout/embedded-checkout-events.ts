export enum EmbeddedCheckoutEventType {
    CheckoutChanged = 'CHECKOUT_CHANGED',
    CheckoutComplete = 'CHECKOUT_COMPLETE',
    CheckoutError = 'CHECKOUT_ERROR',
    CheckoutReady = 'CHECKOUT_READY',
    FrameLoaded = 'FRAMED_LOADED',
}

export interface EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType;
}

export interface EmbeddedCheckoutMessageEvent extends MessageEvent {
    data: {
        type: EmbeddedCheckoutEventType,
    };
}

export function isEmbeddedCheckoutMessageEvent(event: any): event is EmbeddedCheckoutMessageEvent {
    return Object.keys(EmbeddedCheckoutEventType).indexOf(event.data.type) >= 0;
}
