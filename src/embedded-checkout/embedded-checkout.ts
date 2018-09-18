import { IFrameComponent } from 'iframe-resizer';

import createResizableIframe from './create-resizable-iframe';
import EmbeddedCheckoutOptions from './embedded-checkout-options';

export default class EmbeddedCheckout {
    private _iframe?: IFrameComponent;
    private _isAttached: boolean = false;

    constructor(
        private _options: EmbeddedCheckoutOptions
    ) {}

    attach(): void {
        if (this._isAttached) {
            return;
        }

        this._isAttached = true;

        createResizableIframe(this._options.url)
            .then(iframe => {
                document.appendChild(iframe);

                this._iframe = iframe;
            });
    }

    detach(): void {
        if (!this._isAttached) {
            return;
        }

        this._isAttached = false;

        if (this._iframe && this._iframe.parentNode) {
            this._iframe.parentNode.removeChild(this._iframe);
            this._iframe.iFrameResizer.close();
        }
    }
}
