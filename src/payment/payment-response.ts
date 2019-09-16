export default interface PaymentResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}
