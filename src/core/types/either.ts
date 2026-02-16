export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  constructor(public readonly value: L) {}
  isLeft(): this is Left<L> { return true; }
  isRight(): boolean { return false; }
  fold<T>(onLeft: (l: L) => T, _onRight: (r: never) => T): T { return onLeft(this.value); }
}

export class Right<R> {
  constructor(public readonly value: R) {}
  isLeft(): boolean { return false; }
  isRight(): this is Right<R> { return true; }
  fold<T>(_onLeft: (l: never) => T, onRight: (r: R) => T): T { return onRight(this.value); }
}

export const left = <L>(value: L): Either<L, never> => new Left(value);
export const right = <R>(value: R): Either<never, R> => new Right(value);
