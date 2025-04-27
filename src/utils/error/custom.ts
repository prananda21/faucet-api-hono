import { HttpStatusCode } from 'axios';

export class HttpException<E = unknown> extends Error {
  status: HttpStatusCode;
  errors?: E;

  constructor(status: HttpStatusCode, message: string, errors?: E) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// 400~
export class ValidationException<E> extends HttpException<E> {
  constructor(message: string, errors: E) {
    super(HttpStatusCode.BadRequest, message, errors);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCode.BadRequest, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCode.Unauthorized, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCode.Forbidden, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCode.NotFound, message);
  }
}

// 500~
export class InternalServerException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCode.InternalServerError, message);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string) {
    super(HttpStatusCode.ServiceUnavailable, message);
  }
}
