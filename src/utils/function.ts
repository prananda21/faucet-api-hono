export function isHttpError(err: unknown): err is { status: number } {
  return typeof (err as any)?.status === 'number';
}
