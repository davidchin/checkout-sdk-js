import { isCustomError, CustomError, StandardError } from '../../common/error/errors';
import {
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

    postComplete(): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        };

        this._postMessage(message);
    }

    postError(payload: Error | CustomError): void {
        const message: EmbeddedCheckoutErrorEvent = {
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: {
                message: payload.message,
                type: isCustomError(payload) ? payload.type : undefined,
                subtype: isCustomError(payload) ? payload.subtype : undefined,
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

    postReady(): void {
        const message: EmbeddedCheckoutReadyEvent = {
            type: EmbeddedCheckoutEventType.CheckoutReady,
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
