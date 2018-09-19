import { iframeResizer, IFrameComponent } from 'iframe-resizer';

import { InvalidArgumentError, TimeoutError } from '../common/error/errors';

import { EmbeddedCheckoutEventType } from './embedded-checkout-events';
import parseOrigin from './parse-origin';

const LOAD_TIMEOUT_INTERVAL = 5000;

export default function insertCheckoutIframe(src: string, containerId: string): Promise<IFrameComponent> {
    const iframe = document.createElement('iframe');

    iframe.src = src;
    iframe.style.border = 'none';
    iframe.style.display = 'none';
    iframe.style.width = '100%';

    getContainer(containerId).appendChild(iframe);

    return toResizableIframe(iframe);
}

function toResizableIframe(iframe: HTMLIFrameElement): Promise<IFrameComponent> {
    // Can't simply listen to `load` event because it always gets triggered even if there's an error.
    // Instead, listen to the `load` inside the iframe and let the parent frame know when it happens.
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            reject(new TimeoutError());
        }, LOAD_TIMEOUT_INTERVAL);

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== parseOrigin(iframe.src) ||
                event.data.type !== EmbeddedCheckoutEventType.CheckoutLoaded) {
                return;
            }

            iframe.style.display = '';

            const iframes = iframeResizer({
                scrolling: false,
                sizeWidth: false,
                heightCalculationMethod: 'lowestElement',
            }, iframe);

            window.removeEventListener('message', handleMessage);
            window.clearTimeout(timeout);

            resolve(iframes[iframes.length - 1]);
        };

        window.addEventListener('message', handleMessage);
    });
}

function getContainer(containerId: string): HTMLElement {
    const container = document.getElementById(containerId);

    if (!container) {
        throw new InvalidArgumentError('Unable to insert iframe because container cannot be found.');
    }

    return container;
}
