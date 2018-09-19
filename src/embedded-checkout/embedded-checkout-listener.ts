import { bindDecorator as bind } from '../common/utility';

import { EmbeddedCheckoutEventMap } from './embedded-checkout-events';
import isEmbeddedCheckoutEvent from './is-embedded-checkout-event';

type valueof<T> = T[keyof T];

export default class EmbeddedCheckoutListener {
    private _isListening: boolean;
    private _listeners: {
        [key: string]: Array<(event: valueof<EmbeddedCheckoutEventMap>) => void>;
    };

    constructor(
        private _origin: string
    ) {
        this._isListening = false;
        this._listeners = {};
    }

    listen(): void {
        if (this._isListening) {
            return;
        }

        window.addEventListener('message', this._handleMessage);
    }

    stopListen(): void {
        if (!this._isListening) {
            return;
        }

        window.removeEventListener('message', this._handleMessage);
    }

    addListener<K extends keyof EmbeddedCheckoutEventMap>(type: K, listener: (event: EmbeddedCheckoutEventMap[K]) => void): void {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    }

    removeListener<K extends keyof EmbeddedCheckoutEventMap>(type: K, listener: (event: EmbeddedCheckoutEventMap[K]) => void): void {
        const index = this._listeners[type] && this._listeners[type].indexOf(listener);

        if (index >= 0) {
            this._listeners[type].splice(index, 1);
        }
    }

    @bind
    private _handleMessage(event: MessageEvent): void {
        if (event.origin !== this._origin || !isEmbeddedCheckoutEvent(event.data)) {
            return;
        }

        const listeners = this._listeners[event.data.type];

        if (!listeners) {
            return;
        }

        listeners.forEach(listener => {
            listener({
                type: event.data.type,
                payload: event.data.payload,
            });
        });
    }
}
