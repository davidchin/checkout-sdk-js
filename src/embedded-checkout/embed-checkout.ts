import EmbeddedCheckout from './embedded-checkout';
import { EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutOptions from './embedded-checkout-options';

export default function embedCheckout(options: EmbeddedCheckoutOptions): Promise<EmbeddedCheckout> {
    const embeddedCheckout = new EmbeddedCheckout(options);

    if (options.onChange) {
        embeddedCheckout.on(EmbeddedCheckoutEventType.CheckoutChanged, options.onChange);
    }

    if (options.onComplete) {
        embeddedCheckout.on(EmbeddedCheckoutEventType.CheckoutComplete, options.onComplete);
    }

    if (options.onError) {
        embeddedCheckout.on(EmbeddedCheckoutEventType.CheckoutError, options.onError);
    }

    if (options.onReady) {
        embeddedCheckout.on(EmbeddedCheckoutEventType.CheckoutReady, options.onReady);
    }

    return embeddedCheckout.attach();
}
