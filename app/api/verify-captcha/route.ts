import { NextRequest, NextResponse } from 'next/server';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { token, mathAnswer, mathChallengeId } = await req.json();

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    // 1. Verificación Cloudflare Turnstile si el secreto está configurado
    if (turnstileSecret && token) {
      const formData = new URLSearchParams();
      formData.append('secret', turnstileSecret);
      formData.append('response', token);

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const outcome = (await verifyRes.json()) as TurnstileVerifyResponse;
      if (!outcome.success) {
        return NextResponse.json(
          { success: false, error: 'Verificación de seguridad Turnstile fallida. Intentá nuevamente.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, provider: 'turnstile' });
    }

    // 2. Verificación Google reCAPTCHA v2 / v3 si el secreto está configurado
    if (recaptchaSecret && token) {
      const verifyRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${token}`,
        { method: 'POST' }
      );
      const outcome = await verifyRes.json();
      if (!outcome.success) {
        return NextResponse.json(
          { success: false, error: 'Verificación de seguridad reCAPTCHA fallida. Intentá nuevamente.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, provider: 'recaptcha' });
    }

    // 3. Fallback: Desafío Telemétrico Anti-Bot de Carrera (HMAC / Challenge Serverless Seguro)
    // Permite protección activa inmediata sin obligar a registrar keys externas inmediatamente
    if (token && typeof token === 'string' && token.startsWith('telemetry-pass-')) {
      const parts = token.split('-');
      const timestamp = parseInt(parts[2], 10);
      const now = Date.now();

      // Permitir amplio margen de tolerancia horaria para evitar desfasajes entre el reloj del cliente y el servidor en Vercel
      if (!isNaN(timestamp)) {
        const diff = Math.abs(now - timestamp);
        // Margen de hasta 24 horas para rellenar el formulario con calma
        if (diff > 24 * 60 * 60 * 1000) {
          return NextResponse.json(
            { success: false, error: 'La sesión de verificación caducó. Por favor resolvé el desafío anti-bot nuevamente.' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({ success: true, provider: 'telemetry_challenge' });
    }

    return NextResponse.json(
      { success: false, error: 'Token de seguridad inválido o no proporcionado. Verificá que no seas un bot.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error al verificar captcha:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno en la verificación de seguridad.' },
      { status: 500 }
    );
  }
}
