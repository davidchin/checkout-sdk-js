export enum EmbeddedCheckoutEventType {
    CheckoutComplete = 'CHECKOUT_COMPLETE',
    CheckoutError = 'CHECKOUT_ERROR',
    CheckoutLoaded = 'CHECKOUT_LOADED',
    CheckoutReady = 'CHECKOUT_READY',
}

export interface EmbeddedCheckoutEventMap {
    [EmbeddedCheckoutEventType.CheckoutComplete]: EmbeddedCheckoutCompleteEvent;
    [EmbeddedCheckoutEventType.CheckoutError]: EmbeddedCheckoutErrorEvent;
    [EmbeddedCheckoutEventType.CheckoutLoaded]: EmbeddedCheckoutLoadedEvent;
    [EmbeddedCheckoutEventType.CheckoutReady]: EmbeddedCheckoutReadyEvent;
}

export type EmbeddedCheckoutEvent = (
    EmbeddedCheckoutCompleteEvent |
    EmbeddedCheckoutErrorEvent |
    EmbeddedCheckoutLoadedEvent |
    EmbeddedCheckoutReadyEvent
);

export interface EmbeddedCheckoutCompleteEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
}

export interface EmbeddedCheckoutErrorEvent {
    type: EmbeddedCheckoutEventType.CheckoutError;
    payload: {
        message: string;
        type?: string;
        subtype?: string;
    };
}

export interface EmbeddedCheckoutLoadedEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

export interface EmbeddedCheckoutReadyEvent {
    type: EmbeddedCheckoutEventType.CheckoutReady;
}
