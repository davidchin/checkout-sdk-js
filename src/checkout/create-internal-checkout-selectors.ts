import { createBillingAddressSelectorFactory } from '../billing';
import { createCartSelectorFactory } from '../cart';
import { createCheckoutButtonSelectorFactory } from '../checkout-buttons';
import { createFreezeProxies } from '../common/utility';
import { createConfigSelectorFactory } from '../config';
import { createCouponSelectorFactory, GiftCertificateSelector } from '../coupon';
import { CustomerSelector, CustomerStrategySelector } from '../customer';
import { FormSelector } from '../form';
import { createCountrySelectorFactory } from '../geography';
import { createOrderSelectorFactory } from '../order';
import { PaymentMethodSelector, PaymentSelector, PaymentStrategySelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { RemoteCheckoutSelector } from '../remote-checkout';
import { ConsignmentSelector, ShippingAddressSelector, ShippingCountrySelector, ShippingStrategySelector } from '../shipping';

import CheckoutSelector from './checkout-selector';
import { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export default function createInternalCheckoutSelectors(state: CheckoutStoreState, options: CheckoutStoreOptions = {}): InternalCheckoutSelectors {
    const createBillingAddressSelector = createBillingAddressSelectorFactory();
    const createCartSelector = createCartSelectorFactory();
    const createCheckoutButtonSelector = createCheckoutButtonSelectorFactory();
    const createConfigSelector = createConfigSelectorFactory();
    const createCountrySelector = createCountrySelectorFactory();
    const createCouponSelector = createCouponSelectorFactory();
    const createOrderSelector = createOrderSelectorFactory();

    const billingAddress = createBillingAddressSelector(state.billingAddress);
    const cart = createCartSelector(state.cart);
    const checkoutButton = createCheckoutButtonSelector(state.checkoutButton);
    const config = createConfigSelector(state.config);
    const countries = createCountrySelector(state.countries);
    const coupons = createCouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const customerStrategies = new CustomerStrategySelector(state.customerStrategies);
    const form = new FormSelector(state.config);
    const giftCertificates = new GiftCertificateSelector(state.giftCertificates);
    const instruments = new InstrumentSelector(state.instruments);
    const paymentMethods = new PaymentMethodSelector(state.paymentMethods);
    const paymentStrategies = new PaymentStrategySelector(state.paymentStrategies);
    const shippingAddress = new ShippingAddressSelector(state.consignments);
    const remoteCheckout = new RemoteCheckoutSelector(state.remoteCheckout);
    const shippingCountries = new ShippingCountrySelector(state.shippingCountries);
    const shippingStrategies = new ShippingStrategySelector(state.shippingStrategies);

    // Compose selectors
    const consignments = new ConsignmentSelector(state.consignments, cart);
    const checkout = new CheckoutSelector(state.checkout, billingAddress, cart, consignments, coupons, customer, giftCertificates);
    const order = createOrderSelector(state.order, billingAddress, coupons);
    const payment = new PaymentSelector(checkout, order);

    const selectors = {
        billingAddress,
        cart,
        checkout,
        checkoutButton,
        config,
        consignments,
        countries,
        coupons,
        customer,
        customerStrategies,
        form,
        giftCertificates,
        instruments,
        order,
        payment,
        paymentMethods,
        paymentStrategies,
        remoteCheckout,
        shippingAddress,
        shippingCountries,
        shippingStrategies,
    };

    return options.shouldWarnMutation ? createFreezeProxies(selectors) : selectors;
}
