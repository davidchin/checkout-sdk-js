import * as checkoutButtonStrategyFactories from '../generated/checkout-button-strategies';

import { CheckoutButtonStrategy, CheckoutButtonStrategyFactory, CheckoutButtonStrategyResolveId, isResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration';

import DefaultPaymentIntegrationService from '../payment-integration/default-payment-integration-service';
import { ResolveIdRegistry } from '../common/registry';

export default function createCheckoutButtonStrategyRegistry(
    paymentIntegrationService: DefaultPaymentIntegrationService
): ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId> {
    const registry = new ResolveIdRegistry<CheckoutButtonStrategy, CheckoutButtonStrategyResolveId>();

    for (const [, createCheckoutButtonStrategy] of Object.entries(checkoutButtonStrategyFactories)) {
        if (!isResolvableModule<CheckoutButtonStrategyFactory<CheckoutButtonStrategy>, CheckoutButtonStrategyResolveId>(createCheckoutButtonStrategy)) {
            continue;
        }

        for (const resolverId of createCheckoutButtonStrategy.resolveIds) {
            registry.register(resolverId, () => createCheckoutButtonStrategy(paymentIntegrationService));
        }
    }

    return registry;
}
