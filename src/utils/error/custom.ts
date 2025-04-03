import { HttpException } from '.';
import { HttpStatusCode } from '../enum';

export class BadRequestException extends HttpException {
  constructor(name: string, message: string) {
    super(HttpStatusCode.BAD_REQUEST, message);
    this.name = name;
  }
}
export class InternalServerException extends HttpException {
  constructor(name: string, message: string) {
    super(HttpStatusCode.INTERNAL_SERVER, message);
    this.name = name;
  }
}
export class ServiceUnavailableException extends HttpException {
  constructor(name: string, message: string) {
    super(HttpStatusCode.SERVICE_UNAVAILABLE, message);
    this.name = name;
  }
}
