import { IFrameComponent } from 'iframe-resizer';

import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutListener from './embedded-checkout-listener';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import insertCheckoutIframe from './insert-checkout-iframe';
import parseOrigin from './parse-origin';

export default class EmbeddedCheckout {
    private _iframe?: IFrameComponent;
    private _isAttached: boolean;
    private _messageListener: EmbeddedCheckoutListener;

    constructor(
        private _options: EmbeddedCheckoutOptions
    ) {
        this._isAttached = false;
        this._messageListener = new EmbeddedCheckoutListener(parseOrigin(this._options.url));

        if (this._options.onComplete) {
            this.on(EmbeddedCheckoutEventType.CheckoutComplete, this._options.onComplete);
        }

        if (this._options.onError) {
            this.on(EmbeddedCheckoutEventType.CheckoutError, this._options.onError);
        }

        if (this._options.onReady) {
            this.on(EmbeddedCheckoutEventType.CheckoutReady, this._options.onReady);
        }

        if (this._options.onLoad) {
            this.on(EmbeddedCheckoutEventType.CheckoutLoaded, this._options.onLoad);
        }
    }

    attach(): Promise<this> {
        if (this._isAttached) {
            return Promise.resolve(this);
        }

        this._isAttached = true;
        this._messageListener.listen();

        return insertCheckoutIframe(this._options.url, this._options.container)
            .then(iframe => {
                this._iframe = iframe;

                return this;
            })
            .catch(error => {
                this._messageListener.trigger({
                    type: EmbeddedCheckoutEventType.CheckoutError,
                    payload: error,
                });

                throw error;
            });
    }

    detach(): void {
        if (!this._isAttached) {
            return;
        }

        this._isAttached = false;
        this._messageListener.stopListen();

        if (this._iframe && this._iframe.parentNode) {
            this._iframe.parentNode.removeChild(this._iframe);
            this._iframe.iFrameResizer.close();
        }
    }

    on<TType extends keyof EmbeddedCheckoutEventMap>(type: TType, listener: (event: EmbeddedCheckoutEventMap[TType]) => void): void {
        this._messageListener.addListener(type, listener);
    }

    off<TType extends keyof EmbeddedCheckoutEventMap>(type: TType, listener: (event: EmbeddedCheckoutEventMap[TType]) => void): void {
        this._messageListener.removeListener(type, listener);
    }
}
