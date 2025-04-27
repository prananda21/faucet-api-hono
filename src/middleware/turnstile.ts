import { Context, Next } from 'hono';
import i18next from 'i18next';
import { CAPTCHA_ERROR, MISSING_CAPTCHA } from '../locales';
import { HttpStatusCode } from 'axios';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerException,
} from '@/utils/error/custom';

const TURNSTILE_SECRET = Bun.env.TURNSTILE_SECRET || '';

export const validateTurnstile = async (c: Context, next: Next) => {
  const lng = c.get('language') || 'en';
  const t = i18next.getFixedT(lng);

  try {
    const { captchaToken } = await c.req.json();
    if (!captchaToken) {
      throw new BadRequestException(t(MISSING_CAPTCHA));
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
      throw new ForbiddenException(t(CAPTCHA_ERROR));
    }

    await next();
  } catch (error) {
    console.error('Turnstile verification error: ', error);
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerException(
      'An unexpected error occurred. please try again later.',
    );
  }
};
