import { CheckoutButtonInitializeOptions, CheckoutButtonMethodType } from '@bigcommerce/checkout-sdk/payment-integration';
import { ApplePayButtonInitializeOptions } from '..';

export function getApplePayButtonInitializationOptions(): CheckoutButtonInitializeOptions & { applepay: ApplePayButtonInitializeOptions } {
    return {
        containerId: 'applePayCheckoutButton',
        methodId: CheckoutButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
        },
    };
}
