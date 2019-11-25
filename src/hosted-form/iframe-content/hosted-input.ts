import { kebabCase } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { InvalidHostedFormConfigError } from '../errors';
import { HostedFieldEventMap, HostedFieldEventType, HostedFieldSubmitRequestEvent } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputStyles, { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';
import HostedInputWindow from './hosted-input-window';

export default class HostedInput {
    protected _input: HTMLInputElement;
    protected _previousValue?: string;
    private _isSubmitted: boolean = false;
    private _isTouched: boolean = false;

    /**
     * @internal
     */
    constructor(
        protected _type: HostedFieldType,
        protected _containerId: string,
        protected _placeholder: string,
        protected _accessibilityLabel: string,
        protected _autocomplete: string,
        protected _styles: HostedInputStylesMap,
        protected _eventListener: IframeEventListener<HostedFieldEventMap>,
        protected _eventPoster: IframeEventPoster<HostedInputEvent>,
        protected _inputAggregator: HostedInputAggregator,
        protected _inputValidator: HostedInputValidator
    ) {
        this._input = document.createElement('input');

        this._input.addEventListener('input', this._handleInput);
        this._input.addEventListener('blur', this._handleBlur);
        this._input.addEventListener('focus', this._handleFocus);
        this._eventListener.addListener(HostedFieldEventType.SubmitRequested, this._handleSubmit);

        this._configureInput();
    }

    getType(): HostedFieldType {
        return this._type;
    }

    getValue(): string {
        return this._input.value;
    }

    setValue(value: string): void {
        this._processChange(value);
    }

    isTouched(): boolean {
        return this._isTouched;
    }

    attach(): void {
        const container = document.getElementById(this._containerId);

        if (!container) {
            throw new InvalidHostedFormConfigError('Unable to proceed because the provided container ID is not valid.');
        }

        container.appendChild(this._input);

        this._eventPoster.setTarget(window.parent);
        this._eventListener.listen();

        // Assign itself to the global so it can be accessed by its sibling frames
        (window as unknown as HostedInputWindow).hostedInput = this;

        this._eventPoster.post({ type: HostedInputEventType.AttachSucceeded });
    }

    detach(): void {
        if (this._input.parentElement) {
            this._input.parentElement.removeChild(this._input);
        }

        this._eventListener.stopListen();
    }

    protected _formatChange(value: string): void {
        this._input.value = value;
    }

    protected _notifyChange(_value: string): void {
        this._eventPoster.post({
            type: HostedInputEventType.Changed,
            payload: {
                fieldType: this._type,
            },
        });
    }

    private _configureInput(): void {
        this._input.style.border = '0';
        this._input.style.display = 'block';
        this._input.style.margin = '0';
        this._input.style.outline = 'none';
        this._input.style.padding = '0';
        this._input.style.width = '100%';
        this._input.id = kebabCase(this._type);
        this._input.placeholder = this._placeholder;
        this._input.autocomplete = this._autocomplete;

        this._input.setAttribute('aria-label', this._accessibilityLabel);

        this._applyStyles(this._styles.default);
    }

    private _applyStyles(styles: HostedInputStyles = {}): void {
        const styleKeys = Object.keys(styles) as Array<keyof HostedInputStyles>;

        styleKeys.forEach(key => {
            this._input.style[key] = styles[key] || '';
        });
    }

    private async _validateChange(value: string): Promise<void> {
        if (!this._isSubmitted) {
            return;
        }

        const values = {
            ...this._inputAggregator.getInputValues(field => field.isTouched()),
            [this._type]: value,
        };
        const errors = await this._inputValidator.validate(values, { isCardCodeRequired: HostedFieldType.CardCode in values });

        if (!errors.length) {
            this._applyStyles(this._styles.default);

            return;
        }

        this._applyStyles(this._styles.error);

        this._eventPoster.post({
            type: HostedInputEventType.ValidateFailed,
            payload: { errors },
        });
    }

    private _processChange(value: string): void {
        if (value === this._previousValue) {
            return;
        }

        this._isTouched = true;

        this._validateChange(value);
        this._formatChange(value);
        this._notifyChange(value);

        this._previousValue = value;
    }

    private _handleInput: (event: Event) => void = event => {
        const input = event.target as HTMLInputElement;

        this._processChange(input.value);
    };

    private _handleBlur: (event: Event) => void = () => {
        this._applyStyles(this._styles.default);

        this._eventPoster.post({
            type: HostedInputEventType.Blurred,
            payload: {
                fieldType: this._type,
            },
        });
    };

    private _handleFocus: (event: Event) => void = () => {
        this._applyStyles(this._styles.focus);

        this._eventPoster.post({
            type: HostedInputEventType.Focused,
            payload: {
                fieldType: this._type,
            },
        });
    };

    private _handleSubmit: (event: HostedFieldSubmitRequestEvent) => void = () => {
        this._isSubmitted = true;
    };
}
