#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Envía un resumen diario de citas al administrador
# appointment/management/commands/enviar_recordatorios.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

from appointment.models import Schedule

class Command(BaseCommand):
    help = "Enviar recordatorios a clientes y notificación diaria al admin"

    def handle(self, *args, **options):
        today = timezone.localdate()
        citas_hoy = Schedule.objects.filter(date=today).order_by('time')

        if not citas_hoy.exists():
            self.stdout.write("No hay citas programadas para hoy.")
            return

        # --- Enviar correo al admin ---
        citas_list = [{
            'hora': cita.time.strftime("%H:%M"),
            'nombre': cita.name,
            'email': cita.email,
            'telefono': cita.phone,
            'servicio': cita.service.name
        } for cita in citas_hoy]

        html_admin = render_to_string('emails/recordatorio_admin.html', {
            'fecha': today.strftime("%d/%m/%Y"),
            'citas': citas_list
        })

        subject_admin = f"Citas del día - {today.strftime('%d/%m/%Y')}"
        email_admin = EmailMultiAlternatives(
            subject_admin, '', settings.DEFAULT_FROM_EMAIL, [settings.ADMIN_EMAIL]
        )
        email_admin.attach_alternative(html_admin, "text/html")
        email_admin.send()
        self.stdout.write(f"Correo enviado al admin con {len(citas_list)} citas.")

        # --- Enviar recordatorio a cada cliente ---
        for cita in citas_hoy:
            subject_cliente = f"Recordatorio de tu cita con {cita.service.name}"
            html_cliente = render_to_string('emails/recordatorio_cliente.html', {
                'nombre': cita.name,
                'fecha': cita.date.strftime('%d/%m/%Y'),
                'hora': cita.time.strftime('%H:%M'),
                'servicio': cita.service.name,
                'descripcion': cita.description
            })

            email_cliente = EmailMultiAlternatives(
                subject_cliente, '', settings.DEFAULT_FROM_EMAIL, [cita.email]
            )
            email_cliente.attach_alternative(html_cliente, "text/html")
            email_cliente.send()

        self.stdout.write("Recordatorios enviados a todos los clientes.")
