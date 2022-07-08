import * as customerStrategyFactories from '../generated/customer-strategies';

import { CustomerStrategy, CustomerStrategyFactory, CustomerStrategyResolveId, isResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration';

import DefaultPaymentIntegrationService from '../payment-integration/default-payment-integration-service';
import { ResolveIdRegistry } from '../common/registry';

export default function createCustomerStrategyRegistry(
    paymentIntegrationService: DefaultPaymentIntegrationService
): ResolveIdRegistry<CustomerStrategy, CustomerStrategyResolveId> {
    const registry = new ResolveIdRegistry<CustomerStrategy, CustomerStrategyResolveId>();

    for (const [, createCustomerStrategy] of Object.entries(customerStrategyFactories)) {
        if (!isResolvableModule<CustomerStrategyFactory<CustomerStrategy>, CustomerStrategyResolveId>(createCustomerStrategy)) {
            continue;
        }

        for (const resolverId of createCustomerStrategy.resolveIds) {
            registry.register(resolverId, () => createCustomerStrategy(paymentIntegrationService));
        }
    }

    return registry;
}
