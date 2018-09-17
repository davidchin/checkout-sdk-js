import { iframeResizer, IFrameObject } from 'iframe-resizer';

import { InvalidArgumentError } from '../common/error/errors';

import EmbeddedCheckoutOptions from './embedded-checkout-options';

export default class EmbeddedCheckout {
    private _iframe: HTMLIFrameElement;
    private _iframeResizer?: IFrameObject;
    private _isAttached: boolean;

    constructor(
        private _options: EmbeddedCheckoutOptions
    ) {
        this._isAttached = false;
        this._iframe = this._createIframe();
    }

    attach(): void {
        if (this._isAttached) {
            return;
        }

        const container = document.getElementById(this._options.container);

        if (!container) {
            throw new InvalidArgumentError('Unable to attach the iframe because the container element does not exist.');
        }

        container.appendChild(this._iframe);

        this._iframeResizer = this._createIframeResizer();
        this._isAttached = true;
    }

    detach(): void {
        if (!this._isAttached) {
            return;
        }

        if (this._iframe.parentNode) {
            this._iframe.parentNode.removeChild(this._iframe);
        }

        if (this._iframeResizer) {
            this._iframeResizer.close();
        }

        this._isAttached = false;
    }

    private _createIframe(): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        iframe.src = this._options.url;
        iframe.style.width = '100%';

        return iframe;
    }

    private _createIframeResizer(): IFrameObject {
        const iframes = iframeResizer({
            scrolling: false,
            sizeWidth: false,
        }, this._iframe);

        return iframes[iframes.length - 1].iFrameResizer;
    }
}
