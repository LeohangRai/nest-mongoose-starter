import { MessageAndStatusResponse } from './message-and-status-response.type';

export type CreateUpdateResponse<K> = MessageAndStatusResponse & {
  data: K;
};
