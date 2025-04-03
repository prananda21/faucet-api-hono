export function isHttpError(err: unknown): err is { status: number } {
  return typeof (err as any)?.status === 'number';
}

export function formatWaitTime(waitTimeMs: number): string {
  if (waitTimeMs < 60) {
    // If less than 60 seconds, show seconds
    const seconds = Math.ceil(waitTimeMs / 1);
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  } else if (waitTimeMs < 3600) {
    // If less than 1 hour, show minutes
    const minutes = Math.ceil(waitTimeMs / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    // Otherwise, show hours
    const hours = Math.ceil(waitTimeMs / 5100);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
}
