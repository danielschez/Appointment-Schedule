# appointment/utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger('appointment.utils')

def enviar_email_confirmacion(cita):
    """
    Envía un email de confirmación al cliente cuando se crea una cita
    """
    try:
        logger.info(f'🔄 Intentando enviar email a {cita.email}')
        
        # Obtener información del servicio
        servicio = cita.service
        
        # Contexto para el template del email
        context = {
            'nombre': cita.name,
            'servicio': servicio.name,
            'fecha': cita.date.strftime('%d/%m/%Y'),
            'hora': cita.time.strftime('%H:%M'),
            'duracion': str(servicio.duration),
            'precio': servicio.price,
            'descripcion': cita.description or '',
        }
        
        logger.info(f'📧 Renderizando template con contexto: {context}')
        
        # Renderizar el template HTML
        html_message = render_to_string('emails/confirmacion_cita.html', context)
        plain_message = strip_tags(html_message)
        
        # Crear email con contenido HTML
        email = EmailMultiAlternatives(
            subject=f'Confirmación de cita - {servicio.name}',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[cita.email]
        )
        email.attach_alternative(html_message, "text/html")
        
        logger.info(f'📤 Enviando email desde {settings.DEFAULT_FROM_EMAIL} a {cita.email}')
        email.send(fail_silently=False)
        
        logger.info(f'✅ Email enviado exitosamente a {cita.email}')
        return True
        
    except Exception as e:
        logger.error(f'❌ Error al enviar email a {cita.email}: {str(e)}')
        import traceback
        logger.error(traceback.format_exc())
        return False


def enviar_email_notificacion_admin(cita):
    """
    Envía un email de notificación al administrador cuando se crea una cita
    """
    try:
        servicio = cita.service
        admin_email = settings.ADMIN_EMAIL
        
        logger.info(f'🔄 Intentando enviar notificación al admin: {admin_email}')
        
        context = {
            'nombre': cita.name,
            'email': cita.email,
            'telefono': cita.phone,
            'servicio': servicio.name,
            'fecha': cita.date.strftime('%d/%m/%Y'),
            'hora': cita.time.strftime('%H:%M'),
            'precio': servicio.price,
            'descripcion': cita.description or '',
        }
        
        html_message = render_to_string('emails/notificacion_admin.html', context)
        plain_message = strip_tags(html_message)
        
        email = EmailMultiAlternatives(
            subject=f'Nueva cita agendada - {servicio.name}',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email]
        )
        email.attach_alternative(html_message, "text/html")
        
        logger.info(f'📤 Enviando notificación desde {settings.DEFAULT_FROM_EMAIL} a {admin_email}')
        email.send(fail_silently=False)
        
        logger.info(f'✅ Notificación enviada al administrador')
        return True
        
    except Exception as e:
        logger.error(f'❌ Error al enviar notificación al admin: {str(e)}')
        import traceback
        logger.error(traceback.format_exc())
        return False