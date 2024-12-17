export interface GenericResponseType<T> {
  message?: string;
  statusCode?: number;
  data: T;
}
