import { Context, Next } from 'hono';
import i18next from 'i18next';
import { CAPTCHA_ERROR, MISSING_CAPTCHA } from '../locales';
import { HttpStatusCode } from 'axios';

const TURNSTILE_SECRET = Bun.env.TURNSTILE_SECRET || '';

export const validateTurnstile = async (c: Context, next: Next) => {
  const lng = c.get('language') || 'en';
  const t = i18next.getFixedT(lng);

  try {
    const { captchaToken } = await c.req.json();
    if (!captchaToken) {
      return c.json({ message: t(MISSING_CAPTCHA) }, HttpStatusCode.BadRequest);
    }

    const params = new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: captchaToken,
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
      return c.json({ message: t(CAPTCHA_ERROR) }, HttpStatusCode.Forbidden);
    }

    await next();
  } catch (error) {
    console.error('Turnstile verification error: ', error);
    return c.json(
      {
        message: error.message || 'Internal Server Error',
      },
      HttpStatusCode.InternalServerError,
    );
  }
};
