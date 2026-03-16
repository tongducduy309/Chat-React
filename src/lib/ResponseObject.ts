export interface ResponseObject<T> {
    data: T;
    message: string;
    status: number;
}