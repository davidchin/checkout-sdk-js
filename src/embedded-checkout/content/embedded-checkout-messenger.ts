import { Checkout } from '../../checkout';
import { EmbeddedCheckoutChangedEvent, EmbeddedCheckoutCompleteEvent, EmbeddedCheckoutErrorEvent, EmbeddedCheckoutEventType, EmbeddedCheckoutLoadedEvent } from '../embedded-checkout-events';

import EmbeddedCheckoutMessengerOptions from './embedded-checkout-messenger-options';

export default class EmbeddedCheckoutMessenger {
    constructor(
        private _options: EmbeddedCheckoutMessengerOptions
    ) {}

    postChanged(payload: { checkout: Checkout }): void {
        const message: EmbeddedCheckoutChangedEvent = {
            type: EmbeddedCheckoutEventType.CheckoutChanged,
            payload,
        };

        window.postMessage(message, this._options.parentOrigin);
    }

    postComplete(payload: { checkout: Checkout }): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
            payload,
        };

        window.postMessage(message, this._options.parentOrigin);
    }

    postError(payload: Error): void {
        const message: EmbeddedCheckoutErrorEvent = {
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload,
        };

        window.postMessage(message, this._options.parentOrigin);
    }

    postLoaded(): void {
        const message: EmbeddedCheckoutLoadedEvent = {
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        };

        window.postMessage(message, this._options.parentOrigin);
    }

    postReady(payload: { checkout: Checkout }): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
            payload,
        };

        window.postMessage(message, this._options.parentOrigin);
    }
}
