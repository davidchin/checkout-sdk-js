import { EmbeddedCheckoutEvent } from './embedded-checkout-events';

export default interface EmbeddedCheckoutOptions {
    container: string;
    url: string;
    onChange?(event: EmbeddedCheckoutEvent): void;
    onComplete?(event: EmbeddedCheckoutEvent): void;
    onError?(event: EmbeddedCheckoutEvent): void;
    onReady?(event: EmbeddedCheckoutEvent): void;
}
