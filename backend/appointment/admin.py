import openpyxl
from django.http import HttpResponse
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Schedule, Weekday, Workinghours, Service, PromoCode
from .forms import ScheduleAdminForm


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
    list_display = ('date', 'time', 'name', 'email', 'phone', 'service')
    search_fields = ('_name', '_email', '_phone', 'description') 

    def get_search_results(self, request, queryset, search_term):
        # Convertimos search_term a hash
        hash_term = Schedule.hash_value(search_term)
        # Filtramos queryset por hash
        queryset = queryset.filter(name_hash=hash_term) | queryset.filter(email_hash=hash_term)
        return queryset, False



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
