import { number } from 'card-validator';
import creditCardType from 'credit-card-type';
import { max } from 'lodash';

export default class CardNumberFormatter {
    constructor(
        private _separator: string = ' '
    ) {}

    format(value: string): string {
        const { card } = number(value);

        if (!card) {
            return value;
        }

        const maxLength = max(creditCardType(value).map(info => max(info.lengths)));
        const unformattedValue = this.unformat(value).slice(0, maxLength);

        return card.gaps
            .filter(gapIndex => unformattedValue.length > gapIndex)
            .reduce((output, gapIndex, index) => (
                [
                    output.slice(0, gapIndex + index),
                    output.slice(gapIndex + index),
                ].join(this._separator)
            ), unformattedValue);
    }

    unformat(value: string): string {
        const { card } = number(value);

        if (!card) {
            return value;
        }

        return value.replace(new RegExp(this._separator, 'g'), '');
    }
}
