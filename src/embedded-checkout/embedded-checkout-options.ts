import { EmbeddedCheckoutCompleteEvent, EmbeddedCheckoutErrorEvent, EmbeddedCheckoutLoadedEvent, EmbeddedCheckoutReadyEvent } from './embedded-checkout-events';

export default interface EmbeddedCheckoutOptions {
    container: string;
    url: string;
    onComplete?(event: EmbeddedCheckoutCompleteEvent): void;
    onError?(event: EmbeddedCheckoutErrorEvent): void;
    onLoad?(event: EmbeddedCheckoutLoadedEvent): void;
    onReady?(event: EmbeddedCheckoutReadyEvent): void;
}
