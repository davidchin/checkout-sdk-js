import { Checkout } from '../../checkout';
import { StandardError } from '../../common/error/errors';
import {
    EmbeddedCheckoutChangedEvent,
    EmbeddedCheckoutCompleteEvent,
    EmbeddedCheckoutErrorEvent,
    EmbeddedCheckoutEvent,
    EmbeddedCheckoutEventType,
    EmbeddedCheckoutLoadedEvent,
    EmbeddedCheckoutReadyEvent,
} from '../embedded-checkout-events';

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

        this._postMessage(message);
    }

    postComplete(payload: { checkout: Checkout }): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
            payload,
        };

        this._postMessage(message);
    }

    postError(payload: Error | StandardError): void {
        const message: EmbeddedCheckoutErrorEvent = {
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: {
                message: payload.message,
                type: payload instanceof StandardError ? payload.type : undefined,
            },
        };

        this._postMessage(message);
    }

    postLoaded(): void {
        const message: EmbeddedCheckoutLoadedEvent = {
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        };

        this._postMessage(message);
    }

    postReady(payload: { checkout: Checkout }): void {
        const message: EmbeddedCheckoutReadyEvent = {
            type: EmbeddedCheckoutEventType.CheckoutReady,
            payload,
        };

        this._postMessage(message);
    }

    private _postMessage(message: EmbeddedCheckoutEvent): void {
        if (window === window.parent) {
            return;
        }

        window.parent.postMessage(message, this._options.parentOrigin);
    }
}
