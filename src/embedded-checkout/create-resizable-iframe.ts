import { iframeResizer, IFrameComponent } from 'iframe-resizer';

import { TimeoutError } from '../common/error/errors';

import { EmbeddedCheckoutEventType } from './embedded-checkout-events';

const LOAD_TIMEOUT_INTERVAL = 10000;

export default function createResizableIframe(src: string): Promise<IFrameComponent> {
    const iframe = document.createElement('iframe');

    iframe.src = src;
    iframe.style.width = '100%';
    iframe.style.border = 'none';

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
            if (event.origin !== getOrigin(iframe.src) ||
                event.data.type !== EmbeddedCheckoutEventType.DOMContentLoaded) {
                return;
            }

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

function getOrigin(url: string): string {
    // new URL() is not supported in IE11, use anchor tag instead
    const anchor = document.createElement('a');

    anchor.href = url;

    return `${anchor.protocol}//${anchor.hostname}`;
}
