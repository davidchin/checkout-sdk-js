import { IFrameComponent } from 'iframe-resizer';

import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventType } from './embedded-checkout-events';
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

    on(type: EmbeddedCheckoutEventType, listener: (event: EmbeddedCheckoutEvent) => void): void {
        this._messageListener.addListener(type, listener);
    }

    off(type: EmbeddedCheckoutEventType, listener: (event: EmbeddedCheckoutEvent) => void): void {
        this._messageListener.removeListener(type, listener);
    }
}
