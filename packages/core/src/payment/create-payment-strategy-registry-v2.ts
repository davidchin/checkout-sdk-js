import * as paymentStrategyFactories from '../generated/payment-strategies';

import { PaymentStrategy, PaymentStrategyFactory, PaymentStrategyResolveId, isResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration';

import DefaultPaymentIntegrationService from '../payment-integration/default-payment-integration-service';
import { ResolveIdRegistry } from '../common/registry';

export default function createPaymentStrategyRegistry(
    paymentIntegrationService: DefaultPaymentIntegrationService
): ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId> {
    const registry = new ResolveIdRegistry<PaymentStrategy, PaymentStrategyResolveId>();

    for (const [, createPaymentStrategy] of Object.entries(paymentStrategyFactories)) {
        if (!isResolvableModule<PaymentStrategyFactory<PaymentStrategy>, PaymentStrategyResolveId>(createPaymentStrategy)) {
            continue;
        }

        for (const resolverId of createPaymentStrategy.resolveIds) {
            registry.register(resolverId, () => createPaymentStrategy(paymentIntegrationService));
        }
    }

    return registry;
}
