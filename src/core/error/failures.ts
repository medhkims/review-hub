export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {}
export class CacheFailure extends Failure {}
export class NetworkFailure extends Failure {}
export class AuthFailure extends Failure {}
export class ValidationFailure extends Failure {}
export class PermissionFailure extends Failure {}
