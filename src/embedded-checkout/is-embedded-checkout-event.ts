import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventType } from './embedded-checkout-events';

export default function isEmbeddedCheckoutEvent(object: any): object is EmbeddedCheckoutEvent {
    return Object.keys(EmbeddedCheckoutEventType).indexOf(object && object.type) >= 0;
}
