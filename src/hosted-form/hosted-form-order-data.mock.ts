import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { getConfig } from '../config/configs.mock';
import { getOrder, getOrderMeta } from '../order/orders.mock';
import { getPaymentMethod, getPaymentMethodsMeta } from '../payment/payment-methods.mock';

import HostedFormOrderData from './hosted-form-order-data';

export function getHostedFormOrderData(): HostedFormOrderData {
    return {
        authToken: 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q',
        checkout: getCheckoutWithGiftCertificates(),
        config: getConfig(),
        order: getOrder(),
        orderMeta: getOrderMeta(),
        payment: {},
        paymentMethod: getPaymentMethod(),
        paymentMethodMeta: getPaymentMethodsMeta(),
    };
}
