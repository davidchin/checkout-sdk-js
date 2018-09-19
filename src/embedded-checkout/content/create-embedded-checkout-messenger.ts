import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';
import EmbeddedCheckoutMessengerOptions from './embedded-checkout-messenger-options';

export default function createEmbeddedCheckoutMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger {
    return new EmbeddedCheckoutMessenger(options);
}
