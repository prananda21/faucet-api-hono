import { Context, Next } from 'hono';
import { HttpStatusCode } from '../utils/enum';
import { getTransactionSchema } from '../utils/validation/schema';
import i18next from 'i18next';
import { CAPTCHA_ERROR, MISSING_CAPTCHA } from '../locales';

const TURNSTILE_SECRET = Bun.env.TURNSTILE_SECRET || '';

export const validateTurnstile = async (c: Context, next: Next) => {
  const lng = c.get('language') || 'en';
  const t = i18next.getFixedT(lng);

  try {
    const { captcha_token } = await c.req.json();
    if (!captcha_token) {
      return c.json(
        { message: t(MISSING_CAPTCHA) },
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const params = new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: captcha_token,
    });

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
    );

    const result = await response.json();
    if (!result.success) {
      return c.json({ message: t(CAPTCHA_ERROR) }, HttpStatusCode.FORBIDDEN);
    }

    await next();
  } catch (error) {
    console.error('Turnstile verification error: ', error);
    return c.json(
      {
        message: error.message || 'Internal Server Error',
      },
      HttpStatusCode.INTERNAL_SERVER,
    );
  }
};
