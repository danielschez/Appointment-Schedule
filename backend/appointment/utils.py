# appointment/utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger('appointment.utils')

def calcular_precio_final(servicio, promo_code):
    """
    Calcula el precio final aplicando el descuento si existe
    """
    precio_original = servicio.price
    
    if promo_code and promo_code.is_valid():
        descuento_porcentaje = Decimal(str(promo_code.discount_percentage))
        descuento = (descuento_porcentaje / Decimal('100')) * precio_original
        precio_final = precio_original - descuento
        
        return {
            'precio_original': float(precio_original),
            'descuento_porcentaje': promo_code.discount_percentage,
            'descuento_monto': float(descuento.quantize(Decimal('0.01'))),
            'precio_final': float(precio_final.quantize(Decimal('0.01'))),
            'tiene_descuento': True
        }
    
    return {
        'precio_original': float(precio_original),
        'precio_final': float(precio_original),
        'tiene_descuento': False
    }

def enviar_email_confirmacion(cita):
    """
    Envía un email de confirmación al cliente cuando se crea una cita
    """
    try:
        logger.info(f'[EMAIL] Intentando enviar email a {cita.email}')
        
        servicio = cita.service
        precio_info = calcular_precio_final(servicio, cita.promo_code)
        
        context = {
            'nombre': cita.name,
            'servicio': servicio.name,
            'fecha': cita.date.strftime('%d/%m/%Y'),
            'hora': cita.time.strftime('%H:%M'),
            'duracion': str(servicio.duration),
            'descripcion': cita.description or '',
            **precio_info,
        }
        
        if cita.promo_code:
            context['codigo_promocional'] = cita.promo_code.code
        
        logger.info(f'[EMAIL] Renderizando template para {cita.email}')
        
        html_message = render_to_string('emails/confirmacion_cita.html', context)
        plain_message = strip_tags(html_message)
        
        email = EmailMultiAlternatives(
            subject=f'Confirmacion de cita - {servicio.name}',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[cita.email]
        )
        email.attach_alternative(html_message, "text/html")
        
        logger.info(f'[EMAIL] Enviando email desde {settings.DEFAULT_FROM_EMAIL} a {cita.email}')
        email.send(fail_silently=False)
        
        logger.info(f'[OK] Email enviado exitosamente a {cita.email}')
        return True
        
    except Exception as e:
        logger.error(f'[ERROR] Error al enviar email a {cita.email}: {str(e)}')
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
        
        logger.info(f'[ADMIN] Intentando enviar notificacion al admin: {admin_email}')
        
        precio_info = calcular_precio_final(servicio, cita.promo_code)
        
        context = {
            'nombre': cita.name,
            'email': cita.email,
            'telefono': cita.phone,
            'servicio': servicio.name,
            'fecha': cita.date.strftime('%d/%m/%Y'),
            'hora': cita.time.strftime('%H:%M'),
            'descripcion': cita.description or '',
            **precio_info,
        }
        
        if cita.promo_code:
            context['codigo_promocional'] = cita.promo_code.code
        
        html_message = render_to_string('emails/notificacion_admin.html', context)
        plain_message = strip_tags(html_message)
        
        email = EmailMultiAlternatives(
            subject=f'Nueva cita agendada - {servicio.name}',
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email]
        )
        email.attach_alternative(html_message, "text/html")
        
        logger.info(f'[ADMIN] Enviando notificacion desde {settings.DEFAULT_FROM_EMAIL} a {admin_email}')
        email.send(fail_silently=False)
        
        logger.info(f'[OK] Notificacion enviada al administrador')
        return True
        
    except Exception as e:
        logger.error(f'[ERROR] Error al enviar notificacion al admin: {str(e)}')
        import traceback
        logger.error(traceback.format_exc())
        return False