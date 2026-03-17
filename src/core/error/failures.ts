export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {}
export class CacheFailure extends Failure {}
export class NetworkFailure extends Failure {}
export class AuthFailure extends Failure {}
export class ValidationFailure extends Failure {}
export class PermissionFailure extends Failure {}

export class DuplicateBusinessFailure extends Failure {
  constructor(public readonly business: { id: string; name: string }) {
    super('Business already exists');
  }
}

export class SimilarBusinessFailure extends Failure {
  constructor(public readonly business: { id: string; name: string }) {
    super('Similar business found');
  }
}
