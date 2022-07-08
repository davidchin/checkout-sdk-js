import { CheckoutButtonInitializeOptions } from '.';

export default interface CheckoutButtonStrategyNew {
    initialize(options: CheckoutButtonInitializeOptions): Promise<void>;

    deinitialize(): Promise<void>;
}
