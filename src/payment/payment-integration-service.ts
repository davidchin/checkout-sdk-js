import { RequestOptions } from '@bigcommerce/request-sender';

import { CheckoutSelectors } from '../checkout';
import { OrderRequestBody } from '../order';

import Payment from './payment';

export default class PaymentIntegrationService {
    submitOrder(payload: OrderRequestBody, options?: RequestOptions): CheckoutSelectors {
        throw new Error('Not implemented');
    }

    submitPayment(payment: Payment): CheckoutSelectors {
        throw new Error('Not implemented');
    }
}
