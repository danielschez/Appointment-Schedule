import openpyxl
from django.http import HttpResponse
from django.contrib import admin
from .models import Schedule, Weekday, Workinghours, Service

def exportar_excel(modeladmin, request, queryset):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Citas"

    # Encabezados
    ws.append(['Cliente', 'Telefono', 'Fecha', 'Hora'])

    # Filas de datos
    for cita in queryset:
        ws.append([cita.name, cita.phone, cita.date.strftime('%Y-%m-%d %H:%M'), cita.time.strftime('%H:%M')])


    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=citas.xlsx'
    wb.save(response)
    return response

exportar_excel.short_description = "Exportar a Excel"


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'name', 'email', 'phone', 'service')
    search_fields = ('name', 'email', 'phone', 'description')
    list_filter = ('date',)
    ordering = ('-date', '-time')
    actions = [exportar_excel] 

@admin.register(Weekday)
class WeekdayAdmin(admin.ModelAdmin):
    list_display = ('day', 'status')
    search_fields = ('day',)
    ordering = ('id',)

@admin.register(Workinghours)
class WorkingHoursAdmin(admin.ModelAdmin):
    list_display = ('day', 'start_time', 'end_time')
    list_filter = ('day',)
    ordering = ('day__id', 'start_time')
    search_fields = ('day__day',)
    autocomplete_fields = ('day',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration', 'price')
    search_fields = ('name',)
    ordering = ('name',)



