import { Checkout } from '../checkout';

export enum EmbeddedCheckoutEventType {
    CheckoutChanged = 'CHECKOUT_CHANGED',
    CheckoutComplete = 'CHECKOUT_COMPLETE',
    CheckoutError = 'CHECKOUT_ERROR',
    CheckoutLoaded = 'CHECKOUT_LOADED',
    CheckoutReady = 'CHECKOUT_READY',
}

export interface EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType;
    payload?: any;
}

export interface EmbeddedCheckoutChangedEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutChanged;
    payload: Checkout;
}

export interface EmbeddedCheckoutCompleteEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
    payload: Checkout;
}

export interface EmbeddedCheckoutErrorEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
    payload: Error;
}

export interface EmbeddedCheckoutLoadedEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

export interface EmbeddedCheckoutReadyEvent extends EmbeddedCheckoutEvent {
    type: EmbeddedCheckoutEventType.CheckoutReady;
    payload: Checkout;
}
