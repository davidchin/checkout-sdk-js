import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentRequestOptions,
    PaymentStrategyActionCreator,
} from '../..';
import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { toFormUrlEncoded } from '../../../common/http-request';
import { default as bind } from '../../../common/utility/bind-decorator';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { ChasePayScriptLoader, ChasePaySuccessPayload } from '../../../payment/strategies/chasepay';
import { PaymentArgumentInvalidError } from '../../errors';
import { CryptogramInstrument } from '../../payment';
import PaymentStrategy from '../payment-strategy';
import WepayRiskClient from '../wepay/wepay-risk-client';

export default class ChasepayPaymentStrategy extends PaymentStrategy {
    private _button?: HTMLElement;
    private _logoContainer?: string;
    private _methodId?: string;
    private _paymentMethod?: PaymentMethod;
    private _storeLanguage?: string;
    private _onPaymentSelect?: () => void;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _chasePayScriptLoader: ChasePayScriptLoader,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _requestSender: RequestSender,
        private _wepayRiskClient: WepayRiskClient,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _checkoutActionCreator: CheckoutActionCreator

    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        if (!options.chasepay) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.chasepayCheckoutOptions" argument is not provided.');
        }

        const {
            onPaymentSelect = () => {},
            logoContainer,
            walletButton,
        } = options.chasepay;

        const storeConfig = this._store.getState().config.getStoreConfig();

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        this._storeLanguage = storeConfig.storeProfile.storeLanguage;
        this._logoContainer = logoContainer;
        this._onPaymentSelect = onPaymentSelect;
        this._methodId = methodId;

        if (options.gatewayId === 'wepay') {
            this._wepayRiskClient.initialize();
        }

        this._button = walletButton && document.getElementById(walletButton) || undefined;

        if (this._button) {
            this._button.addEventListener('click', this._handleWalletButtonClick);
        }

        return this._setChasePayConfiguration(
            methodId,
            onPaymentSelect,
            this._storeLanguage
        )
        .then(() => super.initialize(options));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;
        if (!payment || !options) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { initializationData, config } = this._paymentMethod;

        const riskToken = (payment.gatewayId === 'wepay') ? this._wepayRiskClient.getRiskToken() : undefined;
        const paymentData = this._mapCardData(initializationData, riskToken);

        return this._getPaymentData(payment.methodId,
            initializationData.digitalSessionId,
            config.testMode,
            () => this._processPayment(payment, paymentData, order, options));
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._button) {
            this._button.removeEventListener('click', this._handleWalletButtonClick);
        }

        return super.deinitialize(options);
    }

    private _completeCheckout(payload: ChasePaySuccessPayload, methodId: string): Promise<any> {
        const state = this._store.getState();
        const method = state.paymentMethods.getPaymentMethod(methodId);
        const requestId = method && method.initializationData && method.initializationData.merchantRequestId;
        return this._setExternalCheckoutData(payload, requestId);
    }

    private _displayChasepayLightbox(digitalSessionId: string, testMode?: boolean): Promise<void> {
        return this._chasePayScriptLoader.load(testMode)
            .then(({ ChasePay }) => {
                ChasePay.showLoadingAnimation();
                ChasePay.startCheckout(digitalSessionId);
            });
    }

    private _getPaymentData(methodId: string, digitalSessionId: string, testMode: boolean | undefined, onPaymentSelect: any): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (paymentMethod) {
            return Promise.resolve(onPaymentSelect);
        }

        return this._setChasePayConfiguration(
            methodId,
            onPaymentSelect,
            this._storeLanguage)
            .then(() => this._displayChasepayLightbox(digitalSessionId, testMode))
            .then(() => super.initialize());
    }

    @bind
    private _handleWalletButtonClick(event: Event): void {
        event.preventDefault();
        if (!this._methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderConfig);
        }
        const methodId = this._methodId;
        this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() =>
            this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
                .then(state => {
                    this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                    if (!this._paymentMethod || !this._paymentMethod.initializationData) {
                        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                    }
                    const { initializationData, config } = this._paymentMethod;
                    return this._displayChasepayLightbox(initializationData.digitalSessionId, config.testMode);
                }), { methodId }), { queueId: 'widgetInteraction' });
    }

    private _mapCardData(initializationData?: any, riskToken?: string | undefined): CryptogramInstrument {
        if (!initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        let payload: CryptogramInstrument = {
            cryptogramId: initializationData.paymentCryptogram,
            eci: initializationData.eci,
            transactionId: btoa(initializationData.reqTokenId),
            ccExpiry: {
                month: initializationData.expDate.toString().substr(0, 2),
                year: initializationData.expDate.toString().substr(2, 2),
            },
            ccNumber: initializationData.accountNum,
            accountMask: initializationData.accountMask,
        };

        if (riskToken) {
            payload = {
                ...payload,
                extraData: { riskToken },
            };
        }
        return payload;
    }

    private _paymentInstrumentSelected(payload: ChasePaySuccessPayload, methodId: string): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() =>
            this._completeCheckout(payload, methodId).then(() =>
                Promise.all([
                    this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                    this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
                ])), { methodId }), { queueId: 'widgetInteraction' });
    }

    private _processPayment(payment: OrderPaymentRequestBody, paymentData: CryptogramInstrument, order: any, options: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData,
                }))
            );
    }

    private _setChasePayConfiguration(methodId: string, onPaymentSelect: () => void, language?: string): Promise<void> {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                if (!this._paymentMethod || !this._paymentMethod.initializationData) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }
                const { config } = this._paymentMethod;
                return this._chasePayScriptLoader.load(config.testMode)
                    .then(({ ChasePay }) => {
                        const { START_CHECKOUT, CANCEL_CHECKOUT, COMPLETE_CHECKOUT } = ChasePay.EventType;

                        ChasePay.configure({ language });
                        ChasePay.on(CANCEL_CHECKOUT, () =>
                            this._setChasePayConfiguration(
                                methodId,
                                (this._onPaymentSelect) ? this._onPaymentSelect : () => {},
                                this._storeLanguage
                            ));
                        ChasePay.on(COMPLETE_CHECKOUT, (payload: ChasePaySuccessPayload) =>
                            this._paymentInstrumentSelected(payload, methodId).then(() => onPaymentSelect()));

                        if (ChasePay.isChasePayUp && this._logoContainer && document.getElementById(this._logoContainer)) {
                            ChasePay.insertBrandings({ color: 'white', containers: [this._logoContainer] });
                        }
                    });
            });
    }

    private _setExternalCheckoutData(payload: ChasePaySuccessPayload, requestId: string): Promise<Response> {
        const url = `checkout.php?provider=chasepay&action=set_external_checkout`;
        const options = {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: toFormUrlEncoded({
                sessionToken: payload.sessionToken,
                merchantRequestId: requestId,
            }),
        };

        return this._requestSender.post(url, options);
    }
}

export interface ChasePayInitializeOptions {
    /**
     * This container is used to host the chasepay branding logo.
     * It should be an HTML element.
     */
    logoContainer: string;

    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the ChasePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
