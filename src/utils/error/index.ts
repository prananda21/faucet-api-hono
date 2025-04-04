import { HttpStatusCode } from '../enum';

export class HttpException extends Error {
  status: HttpStatusCode;

  constructor(status: HttpStatusCode, message: string) {
    super(message);
    this.status = status;
  }
}
