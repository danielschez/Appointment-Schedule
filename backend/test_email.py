# test_email.py (en la raíz de tu proyecto Django)
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'barber.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print(f"📧 Email configurado: {settings.EMAIL_HOST_USER}")
print(f"🔑 Contraseña configurada: {'✓' if settings.EMAIL_HOST_PASSWORD else '✗'}")
print(f"🌐 Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
print(f"🔒 TLS: {settings.EMAIL_USE_TLS}")

try:
    print("\n🔄 Enviando email de prueba...")
    send_mail(
        'Prueba de Email',
        'Este es un email de prueba desde Django.',
        settings.DEFAULT_FROM_EMAIL,
        [settings.EMAIL_HOST_USER],
        fail_silently=False,
    )
    print("✅ Email enviado exitosamente!")
except Exception as e:
    print(f"❌ Error al enviar email: {e}")
    import traceback
    traceback.print_exc()