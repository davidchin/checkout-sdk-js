import EmbeddedCheckout from './embedded-checkout';
import EmbeddedCheckoutOptions from './embedded-checkout-options';

export default function embedCheckout(options: EmbeddedCheckoutOptions): Promise<EmbeddedCheckout> {
    const embeddedCheckout = new EmbeddedCheckout(options);

    return embeddedCheckout.attach();
}
