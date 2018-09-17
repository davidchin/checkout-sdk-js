import EmbeddedCheckout from './embedded-checkout';
import EmbeddedCheckoutOptions from './embedded-checkout-options';

export default function embedCheckout(options: EmbeddedCheckoutOptions): EmbeddedCheckout {
    const embeddedCheckout = new EmbeddedCheckout(options);

    embeddedCheckout.attach();

    return embeddedCheckout;
}
