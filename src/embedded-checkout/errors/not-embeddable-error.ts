import { StandardError } from '../../common/error/errors';

export enum NotEmbeddableErrorType {
    MissingContainer,
    MissingContent,
    UnknownError,
}

export default class NotEmbeddableError extends StandardError {
    constructor(
        message?: string,
        public subtype: NotEmbeddableErrorType = NotEmbeddableErrorType.UnknownError
    ) {
        super(message || 'Unable to embed the checkout form.');

        this.type = 'not_embeddable';
    }
}
