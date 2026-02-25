export class ServerException extends Error {
  constructor(message: string = 'Server error occurred', public code?: string) {
    super(message);
    this.name = 'ServerException';
  }
}

export class CacheException extends Error {
  constructor(message: string = 'Cache error occurred') {
    super(message);
    this.name = 'CacheException';
  }
}

export class NetworkException extends Error {
  constructor(message: string = 'No internet connection') {
    super(message);
    this.name = 'NetworkException';
  }
}

export class AuthException extends Error {
  constructor(message: string = 'Authentication failed', public code?: string) {
    super(message);
    this.name = 'AuthException';
  }
}

export class ValidationException extends Error {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationException';
  }
}

export class PermissionException extends Error {
  constructor(message: string = 'Permission denied', public code?: string) {
    super(message);
    this.name = 'PermissionException';
  }
}
