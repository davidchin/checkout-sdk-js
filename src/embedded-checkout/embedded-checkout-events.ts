import { Checkout } from '../checkout';

export enum EmbeddedCheckoutEventType {
    CheckoutChanged = 'CHECKOUT_CHANGED',
    CheckoutComplete = 'CHECKOUT_COMPLETE',
    CheckoutError = 'CHECKOUT_ERROR',
    CheckoutLoaded = 'CHECKOUT_LOADED',
    CheckoutReady = 'CHECKOUT_READY',
}

export interface EmbeddedCheckoutEventMap {
    [EmbeddedCheckoutEventType.CheckoutChanged]: EmbeddedCheckoutChangedEvent;
    [EmbeddedCheckoutEventType.CheckoutComplete]: EmbeddedCheckoutCompleteEvent;
    [EmbeddedCheckoutEventType.CheckoutError]: EmbeddedCheckoutErrorEvent;
    [EmbeddedCheckoutEventType.CheckoutLoaded]: EmbeddedCheckoutLoadedEvent;
    [EmbeddedCheckoutEventType.CheckoutReady]: EmbeddedCheckoutReadyEvent;
}

export interface EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType;
    payload?: any;
}

export interface EmbeddedCheckoutChangedEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutChanged;
    payload: {
        checkout: Checkout;
    };
}

export interface EmbeddedCheckoutCompleteEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
    payload: {
        checkout: Checkout;
    };
}

export interface EmbeddedCheckoutErrorEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutError;
    payload: {
        message: string;
        type?: string;
    };
}

export interface EmbeddedCheckoutLoadedEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

export interface EmbeddedCheckoutReadyEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutReady;
    payload: {
        checkout: Checkout;
    };
}
