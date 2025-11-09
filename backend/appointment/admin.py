# backend/appointment/admin.py
import openpyxl
from django.http import HttpResponse
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Schedule, Weekday, Workinghours, Service, PromoCode
from .forms import ScheduleAdminForm
from .utils import enviar_email_cancelacion
import logging

logger = logging.getLogger('appointment.admin')

# --- Acción personalizada: exportar a Excel ---
def exportar_excel(modeladmin, request, queryset):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Citas"

    # Encabezados
    ws.append(['Cliente', 'Teléfono', 'Fecha', 'Hora'])

    for cita in queryset:
        ws.append([
            cita.name,
            cita.phone,
            cita.date.strftime('%Y-%m-%d'),
            cita.time.strftime('%H:%M')
        ])

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename=citas.xlsx'
    wb.save(response)
    return response

exportar_excel.short_description = "Exportar a Excel"


# --- Admin de Schedule (Citas) ---
@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    form = ScheduleAdminForm  # Usar el formulario personalizado
    
    # Usar métodos personalizados en lugar de los campos directos
    list_display = ('date', 'time', 'get_name', 'get_email', 'get_phone', 'service')
    search_fields = ('_name', '_email', '_phone', 'description')
    actions = [exportar_excel]
    
    # Campos que se mostrarán en el formulario de edición
    fields = ('date', 'time', 'name', 'email', 'phone', 'description', 
              'promo_code_allowed', 'service', 'promo_code')

    def get_name(self, obj):
        """Muestra el nombre desencriptado"""
        return obj.name
    get_name.short_description = 'Nombre'
    get_name.admin_order_field = 'name_hash'  # Permite ordenar por este campo

    def get_email(self, obj):
        """Muestra el email desencriptado"""
        return obj.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'email_hash'

    def get_phone(self, obj):
        """Muestra el teléfono desencriptado"""
        return obj.phone
    get_phone.short_description = 'Teléfono'

    def get_search_results(self, request, queryset, search_term):
        """
        Personaliza la búsqueda para usar hashes en campos encriptados
        """
        # Si NO hay término de búsqueda, devolver todo el queryset sin filtrar
        if not search_term:
            return queryset, False
        
        # Si HAY término de búsqueda, filtrar por hash
        hash_term = Schedule.hash_value(search_term)
        queryset = queryset.filter(name_hash=hash_term) | queryset.filter(email_hash=hash_term)
        
        return queryset, False

    def delete_model(self, request, obj):
        """
        Se ejecuta cuando se elimina UNA cita desde el admin
        """
        logger.info(f'[DELETE] Eliminando cita {obj.id} de {obj.name}')
        
        try:
            # Enviar email de cancelación ANTES de eliminar
            logger.info(f'[EMAIL] Enviando correo de cancelación a {obj.email}')
            email_enviado = enviar_email_cancelacion(obj)
            
            if email_enviado:
                logger.info(f'[OK] Email de cancelación enviado a {obj.email}')
                self.message_user(
                    request, 
                    f'Cita eliminada y correo de cancelación enviado a {obj.email}',
                    level='success'
                )
            else:
                logger.warning(f'[WARN] No se pudo enviar email de cancelación a {obj.email}')
                self.message_user(
                    request,
                    f'Cita eliminada pero no se pudo enviar el correo a {obj.email}',
                    level='warning'
                )
        except Exception as e:
            logger.error(f'[ERROR] Error al enviar email de cancelación: {str(e)}')
            import traceback
            logger.error(traceback.format_exc())
            self.message_user(
                request,
                f'Cita eliminada pero hubo un error al enviar el correo: {str(e)}',
                level='error'
            )
        
        # Finalmente eliminar el objeto
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        """
        Se ejecuta cuando se eliminan MÚLTIPLES citas desde el admin
        (usando la acción "Delete selected")
        """
        logger.info(f'[DELETE_MULTIPLE] Eliminando {queryset.count()} citas')
        
        for obj in queryset:
            try:
                logger.info(f'[EMAIL] Enviando correo de cancelación a {obj.email} (cita {obj.id})')
                email_enviado = enviar_email_cancelacion(obj)
                
                if email_enviado:
                    logger.info(f'[OK] Email enviado a {obj.email}')
                else:
                    logger.warning(f'[WARN] No se pudo enviar email a {obj.email}')
            except Exception as e:
                logger.error(f'[ERROR] Error al enviar email a {obj.email}: {str(e)}')
        
        # Eliminar todas las citas
        super().delete_queryset(request, queryset)
        self.message_user(
            request,
            f'{queryset.count()} citas eliminadas. Se enviaron correos de cancelación.',
            level='success'
        )


# --- Admin de Weekday (Días) ---
@admin.register(Weekday)
class WeekdayAdmin(admin.ModelAdmin):
    list_display = ('day', 'status')
    search_fields = ('day',)
    ordering = ('id',)


# --- Admin de Horarios ---
@admin.register(Workinghours)
class WorkingHoursAdmin(admin.ModelAdmin):
    list_display = ('day', 'start_time', 'end_time')
    list_filter = ('day',)
    ordering = ('day__id', 'start_time')
    search_fields = ('day__day',)
    autocomplete_fields = ('day',)


# --- Admin de Servicios ---
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration', 'price', 'image_preview', 'edit_link')
    search_fields = ('name',)
    ordering = ('name',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit:cover;" />', obj.image.url
            )
        return '—'
    image_preview.short_description = 'Imagen'

    def edit_link(self, obj):
        url = reverse('admin:%s_%s_change' % (obj._meta.app_label, obj._meta.model_name), args=[obj.id])
        return format_html('<a href="{}">Editar</a>', url)
    edit_link.short_description = 'Editar'


# --- Admin de Códigos Promocionales ---
@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percentage', 'valid_from', 'valid_to', 'active', 'current_uses']
    list_filter = ['active', 'valid_from', 'valid_to']
    search_fields = ['code']
    ordering = ['-valid_to']