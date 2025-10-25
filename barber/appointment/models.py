from django.db import models
from django.utils import timezone

class Service(models.Model):
    name = models.CharField(max_length=100)
    duration = models.DurationField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(default="Sin descripción")
    image = models.ImageField(upload_to='services/', null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Servicios"
        ordering = ['name']

class PromoCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    discount_percentage = models.PositiveIntegerField()
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    active = models.BooleanField(default=True)
    current_uses = models.PositiveIntegerField(default=0)

    def is_valid(self):
        now = timezone.now()
        return self.active and self.valid_from <= now <= self.valid_to
    
    def apply_discount(self, amount):
        if self.is_valid():
            discount_amount = (self.discount_percentage / 100) * amount
            return amount - discount_amount
        return amount

    def __str__(self):
        return self.code

    class Meta:
        verbose_name = "Promo Code"
        verbose_name_plural = "Códigos promocionales"
        ordering = ['-valid_to']

class Schedule(models.Model):
    date = models.DateField()
    time = models.TimeField()
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    description = models.TextField()
    promo_code_allowed = models.BooleanField(default=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='schedules')
    promo_code = models.ForeignKey(PromoCode, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Appointment on {self.date} at {self.time}"

    class Meta:
        verbose_name = "Schedule"
        verbose_name_plural = "Citas"
        ordering = ['-date', '-time']

class Weekday(models.Model):
    day = models.CharField(max_length=10)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.day

    class Meta:
        verbose_name = "Weekday"
        verbose_name_plural = "Dias de la semana"
        ordering = ['id']

class Workinghours(models.Model):
    day = models.ForeignKey(Weekday, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.day}: {self.start_time} - {self.end_time}"

    class Meta:
        verbose_name = "Working Hour"
        verbose_name_plural = "Horas de trabajo"
        ordering = ['day__id', 'start_time']


