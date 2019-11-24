import CardExpiryDate from './card-expiry-date';

export default class CardExpiryFormatter {
    format(value: string): string {
        const separator = '/';
        const [month = '', year = ''] = value.split(new RegExp(`\\s*${separator}\\s*`));
        const trimmedMonth = month.slice(0, 2);
        const trimmedYear = year.length === 4 ? year.slice(-2) : (year ? year.slice(0, 2) : month.slice(2));

        // i.e.: '1'
        if (value.length < 2) {
            return month;
        }

        // ie.: '10 /' (without trailing space)
        if (value.length > 3 && !trimmedYear) {
            return trimmedMonth;
        }

        return `${trimmedMonth} / ${trimmedYear}`;
    }

    toObject(value: string): CardExpiryDate {
        const separator = '/';
        const [month = '', year = ''] = value.split(new RegExp(`\\s*${separator}\\s*`));

        if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
            return { month: '', year: '' };
        }

        return {
            month: month.length === 1 ? `0${month}` : month.slice(0, 2),
            year: year.length === 2 ? `20${year}` : year.slice(0, 4),
        };
    }
}
