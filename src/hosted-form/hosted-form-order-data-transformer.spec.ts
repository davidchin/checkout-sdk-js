import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

describe('HostedFormOrderDataTransformer', () => {
    let store: ReadableCheckoutStore;
    let transformer: HostedFormOrderDataTransformer;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        transformer = new HostedFormOrderDataTransformer(store);
    });

    it('transforms payload', () => {
        jest.spyOn(store.getState().payment, 'getPaymentToken')
            .mockReturnValue('JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDcxODcxMzMsIm5iZiI6MTUwNzE4MzUzMywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoiMTUwNDA5ODgyMSIsImp0aSI6IjNkOTA4ZDE5LTY4OTMtNGQzYi1iMWEwLWJjNWYzMjRhM2ZiZCIsImlhdCI6MTUwNzE4MzUzMywiZGF0YSI6eyJzdG9yZV9pZCI6IjE1MDQwOTg4MjEiLCJvcmRlcl9pZCI6IjExOSIsImFtb3VudCI6MjAwMDAsImN1cnJlbmN5IjoiVVNEIn19.FSfZpI98l3_p5rbQdlHNeCfKR5Dwwk8_fvPZvtb64-Q');

        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: { shouldSaveInstrument: true },
        });

        expect(Object.keys(result))
            .toEqual(expect.arrayContaining([
                'authToken',
                'checkout',
                'config',
                'order',
                'orderMeta',
                'payment',
                'paymentMethod',
                'paymentMethodMeta',
            ]));
    });
});
