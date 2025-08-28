# appointment/utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def enviar_email_confirmacion(cita):
    """
    Envía email de confirmación de cita
    """
    try:
        # Renderizar el template HTML
        html_content = render_to_string('emails/confirmacion_cita.html', {
            'cita': cita
        })
        
        # Crear contenido de texto plano como fallback
        text_content = f"""
        ¡Cita Confirmada!
        
        Estimado/a {cita.name},
        
        Su cita ha sido confirmada:
        - Servicio: {cita.service.name}
        - Fecha: {cita.date.strftime('%d/%m/%Y')}
        - Hora: {cita.time.strftime('%H:%M')}
        
        Por favor llegue 10 minutos antes.
        ¡Nos vemos pronto en la silla!
        
        ---
        Walld's Barber
        Este es un email automático, por favor no responder.
        """
        
        # Crear el email con EmailMultiAlternatives
        email = EmailMultiAlternatives(
            subject=f'Confirmación de Cita - {cita.service.name}',
            body=text_content,
            from_email=f"Walld's Barber <{settings.EMAIL_HOST_USER}>",
            to=[cita.email],
        )
        
        # Adjuntar contenido HTML
        email.attach_alternative(html_content, "text/html")
        
        # Enviar el email
        email.send()
        
        logger.info(f'Email de confirmación enviado a {cita.email} para cita ID: {cita.id}')
        return True
        
    except Exception as e:
        logger.error(f'Error enviando email de confirmación: {str(e)}')
        return False