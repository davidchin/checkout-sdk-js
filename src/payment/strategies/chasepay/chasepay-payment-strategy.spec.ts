import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import InvalidArgumentError from '../../../common/error/errors/invalid-argument-error';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentActionCreator, PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { getChasePay, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { ChasePayEventType, ChasePayScriptLoader, JPMC } from '../../../payment/strategies/chasepay';
import { getChasePayScriptMock } from '../../../payment/strategies/chasepay/chasepay.mock';
import { PaymentActionType } from '../../payment-actions';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';
import WepayRiskClient from '../wepay/wepay-risk-client';

import ChasePayPaymentStrategy from './chasepay-payment-strategy';

describe('ChasePayPaymentStrategy', () => {
    const testRiskToken = 'test-risk-token';
    let container: HTMLDivElement;
    let checkoutActionCreator: CheckoutActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentStrategyActionCreator: PaymentStrategyActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let orderActionCreator: OrderActionCreator;
    let store: CheckoutStore;
    let strategy: PaymentStrategy;
    let chasePayScriptLoader: ChasePayScriptLoader;
    let JPMC: JPMC;
    let requestSender: RequestSender;
    let wepayRiskClient: WepayRiskClient;
    let scriptLoader;

    beforeEach(() => {
        paymentMethodMock = { ...getChasePay(), initializationData: { digitalSessionId: 'digitalSessionId', merchantRequestId: '1234567890' } };
        scriptLoader = createScriptLoader();
        wepayRiskClient = new WepayRiskClient(scriptLoader);

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        jest.spyOn(wepayRiskClient, 'initialize')
            .mockReturnValue(Promise.resolve(wepayRiskClient));

        jest.spyOn(wepayRiskClient, 'getRiskToken')
            .mockReturnValue(testRiskToken);

        JPMC = getChasePayScriptMock();

        chasePayScriptLoader = new ChasePayScriptLoader(createScriptLoader());

        jest.spyOn(chasePayScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(JPMC));
        jest.spyOn(JPMC.ChasePay, 'isChasePayUp')
            .mockReturnValue(true);

        requestSender = createRequestSender();

        const client = createCheckoutClient(requestSender);
        const paymentClient = createPaymentClient(store);
        const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
        const configRequestSender = new ConfigRequestSender(createRequestSender());
        const configActionCreator = new ConfigActionCreator(configRequestSender);
        const registry = createPaymentStrategyRegistry(store, client, paymentClient, requestSender);
        const _requestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);

        paymentMethodActionCreator = new PaymentMethodActionCreator(_requestSender);
        orderActionCreator = new OrderActionCreator(client, new CheckoutValidator(new CheckoutRequestSender(createRequestSender())));
        paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(client), orderActionCreator);
        checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
        paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

        strategy = new ChasePayPaymentStrategy(
            store,
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
            chasePayScriptLoader,
            wepayRiskClient
        );

        container = document.createElement('div');
        container.setAttribute('id', 'login');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('creates an instance of ChasePayPaymentStrategy', () => {
        expect(strategy).toBeInstanceOf(ChasePayPaymentStrategy);
    });

    describe('#initialize()', () => {
        let chasePayOptions: PaymentInitializeOptions;

        beforeEach(() => {
            chasePayOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login' } };
        });

        it('loads chasepay in test mode if enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(chasePayOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(true);
        });

        it('loads chasepay without test mode if disabled', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(chasePayOptions);

            expect(chasePayScriptLoader.load).toHaveBeenLastCalledWith(false);
        });

        it('registers the start and complete callbacks', async () => {
            JPMC.ChasePay.on = jest.fn((type, callback) => callback);

            await strategy.initialize(chasePayOptions);

            expect(JPMC.ChasePay.on).toHaveBeenCalledWith(ChasePayEventType.CompleteCheckout, expect.any(Function));
        });

        it('does not load chasepay if initialization options are not provided', async () => {
            chasePayOptions = { methodId: 'chasepay'};
            expect(() => strategy.initialize(chasePayOptions)).toThrowError(InvalidArgumentError);
            expect(chasePayScriptLoader.load).not.toHaveBeenCalled();
        });

        it('does not load chase  pay if initialization data is not provided', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(chasePayScriptLoader.load).not.toHaveBeenCalled();

            }
        });

        it('does not load chase  pay if store config is not provided', async () => {
            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue(undefined);
            try {
                await strategy.initialize(chasePayOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(chasePayScriptLoader.load).not.toHaveBeenCalled();

            }
        });
    });

    describe('#execute()', () => {
        let chasePayOptions: PaymentInitializeOptions;
        let orderRequestBody: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;

        beforeEach(async () => {
            orderRequestBody = getOrderRequestBody();
            submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));
            submitPaymentAction = Observable.of(createAction(PaymentActionType.SubmitPaymentRequested));
            chasePayOptions = { methodId: 'chasepay', chasepay: { logoContainer: 'login' } };
            paymentMethodMock.initializationData = {
                paymentCryptogram: '11111111111111',
                eci: '11111111111',
                reqTokenId: '111111111',
                expDate: '11/11',
                accountNum: '1111',
                accountMask: '1111',
                transactionId: 'MTExMTExMTEx',
            };

            paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
            await strategy.initialize(chasePayOptions);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('calls submit order with the order request information', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);
            const { payment, ...order } = orderRequestBody;

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, expect.any(Object));
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('pass the options to submitOrder', async () => {
            await strategy.execute(orderRequestBody, chasePayOptions);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), chasePayOptions);
        });

    });

});
