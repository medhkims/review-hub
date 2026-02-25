/**
 * Shared utility for serializing/deserializing Firebase Timestamps
 * to/from AsyncStorage-compatible JSON format.
 */

interface SerializedTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface TimestampLike {
  toDate: () => Date;
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
}

/**
 * Serialize a Firebase Timestamp to a JSON-safe object.
 */
export function serializeTimestamp(timestamp: unknown): SerializedTimestamp {
  const ts = timestamp as TimestampLike;
  return {
    _seconds: ts.seconds ?? ts._seconds ?? 0,
    _nanoseconds: ts.nanoseconds ?? ts._nanoseconds ?? 0,
  };
}

/**
 * Deserialize a JSON object back to a Timestamp-like object
 * with a working toDate() method.
 */
export function deserializeTimestamp(serialized: SerializedTimestamp): { toDate: () => Date; _seconds: number; _nanoseconds: number } {
  const seconds = serialized._seconds ?? 0;
  const nanoseconds = serialized._nanoseconds ?? 0;
  return {
    toDate: () => new Date(seconds * 1000),
    _seconds: seconds,
    _nanoseconds: nanoseconds,
  };
}

/**
 * Deserialize from a millisecond value.
 */
export function deserializeTimestampFromMs(ms: number): { toDate: () => Date } {
  return {
    toDate: () => new Date(ms),
  };
}
