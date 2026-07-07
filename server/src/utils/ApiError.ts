class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];

  constructor(statusCode: number, message: string, isOperational: boolean = true, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (errors) this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad request', errors?: any[]) {
    return new ApiError(400, message, true, errors);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string = 'Conflict') {
    return new ApiError(409, message);
  }

  static tooMany(message: string = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, false);
  }
}

export default ApiError;
