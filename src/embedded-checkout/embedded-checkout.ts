import { iframeResizer, IFrameObject } from 'iframe-resizer';

import { InvalidArgumentError, TimeoutError } from '../common/error/errors';

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

        this._getContainer().appendChild(this._iframe);
        this._isAttached = true;

        this._createIframeResizer()
            .then(resizer => {
                this._iframeResizer = resizer;
            });
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
            this._iframeResizer = undefined;
        }
    }

    private _getContainer(): HTMLElement {
        const container = document.getElementById(this._options.container);

        if (!container) {
            throw new InvalidArgumentError('Unable to attach the iframe because the container element does not exist.');
        }

        return container;
    }

    private _createIframe(): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        iframe.src = this._options.url;
        iframe.style.width = '100%';
        iframe.style.border = 'none';

        return iframe;
    }

    private _createIframeResizer(): Promise<IFrameObject> {
        return new Promise((resolve, reject) => {
            this._iframe.addEventListener('load', () => {
                const iframes = iframeResizer({
                    scrolling: false,
                    sizeWidth: false,
                    heightCalculationMethod: 'lowestElement',
                }, this._iframe);

                const resizer = iframes[iframes.length - 1].iFrameResizer;

                if (!this._iframe.contentWindow) {
                    return;
                }

                this._iframe.contentWindow.postMessage({ type: 'IS_LOADED' }, 'https://store-sju3wtx2.store.bcdev');

                const timeout = window.setTimeout(() => {
                    reject(new TimeoutError());
                }, 10000);

                const listener = (event: MessageEvent) => {
                    if (event.origin !== 'https://store-sju3wtx2.store.bcdev') {
                        return;
                    }

                    if (event.data.type === 'LOADED') {
                        resolve(resizer);

                        window.removeEventListener('message', listener);
                        window.clearTimeout(timeout);
                    }
                };

                window.addEventListener('message', listener);
            });
        });
    }
}
