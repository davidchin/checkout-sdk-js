export interface ChasePayEventMap {
    'START_CHECKOUT'(digitalSessionId: string): void;
    'COMPLETE_CHECKOUT'(payload: ChasePaySuccessPayload): void;
    'CANCEL_CHECKOUT'(): void;
}

export interface ChasePayHostWindow extends Window {
    JPMC?: JPMC;
}

export interface JPMC {
    ChasePay: ChasePay;
}

export interface ChasePaySuccessPayload {
    sessionToken: string;
}

export interface ChasePayInsertOptions {
    color?: string;
    containers?: string[];
    height?: number;
    width?: number;
}

export interface ChasePayConfigureOptions {
    language?: string;
    zindex?: number;
    sessionWarningTime?: number;
    sessionTimeoutTime?: number;
}

export interface ChasePay {
    EventType: {
        START_CHECKOUT: 'START_CHECKOUT';
        COMPLETE_CHECKOUT: 'COMPLETE_CHECKOUT';
        CANCEL_CHECKOUT: 'CANCEL_CHECKOUT';
    };
    isChasePayUp(): boolean;
    insertButtons(options: ChasePayInsertOptions): void;
    insertBrandings(options: ChasePayInsertOptions): void;
    startCheckout(digitalSessionId?: string): void;
    showLoadingAnimation(): void;
    configure(options: ChasePayConfigureOptions): void;
    on<ChasePayEventType extends keyof ChasePayEventMap>(eventType: ChasePayEventType, callback: ChasePayEventMap[ChasePayEventType]): {};
}
