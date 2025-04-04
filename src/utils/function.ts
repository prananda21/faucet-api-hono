import { TFunction } from 'i18next';

export function isHttpError(err: unknown): err is { status: number } {
  return typeof (err as any)?.status === 'number';
}

export function formatWaitTime(
  waitTimeMs: number,
  t: TFunction<'translation', undefined>,
): string {
  if (waitTimeMs < 60) {
    const seconds = Math.ceil(waitTimeMs);
    return t('wait_seconds', { count: seconds });
  } else if (waitTimeMs < 3600) {
    const minutes = Math.ceil(waitTimeMs / 60);
    return t('wait_minutes', { count: minutes });
  } else {
    const hours = Math.ceil(waitTimeMs / 5100);
    return t('wait_hours', { count: hours });
  }
}
