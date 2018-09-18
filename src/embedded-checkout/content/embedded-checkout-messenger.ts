import { EmbeddedCheckoutEventType } from '../embedded-checkout-events';

export default class IframeContentMessenger {
    constructor(
        private _parentOrigin: string
    ) {}

    postReady(): void {
        window.postMessage({
            type: EmbeddedCheckoutEventType.CheckoutReady,
        }, this._parentOrigin);
    }

    postComplete(): void {
        window.postMessage({
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        }, this._parentOrigin);
    }

    postChanged(): void {
        window.postMessage({
            type: EmbeddedCheckoutEventType.CheckoutChanged,
        }, this._parentOrigin);
    }

    postError(): void {
        window.postMessage({
            type: EmbeddedCheckoutEventType.CheckoutError,
        }, this._parentOrigin);
    }
}
