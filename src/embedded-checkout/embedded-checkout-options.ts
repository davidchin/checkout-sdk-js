import { EmbeddedCheckoutChangedEvent, EmbeddedCheckoutCompleteEvent, EmbeddedCheckoutErrorEvent, EmbeddedCheckoutReadyEvent } from './embedded-checkout-events';

export default interface EmbeddedCheckoutOptions {
    container: string;
    url: string;
    onChange?(event: EmbeddedCheckoutChangedEvent): void;
    onComplete?(event: EmbeddedCheckoutCompleteEvent): void;
    onError?(event: EmbeddedCheckoutErrorEvent): void;
    onReady?(event: EmbeddedCheckoutReadyEvent): void;
}
