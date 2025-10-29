# barber/appointment/models.py
import hashlib
from django.db import models
from django.utils import timezone
from .encryption import encryptor

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

    # Campos encriptados
    _name = models.TextField(db_column='name', null=True, blank=True)
    _email = models.TextField(db_column='email', null=True, blank=True)
    _phone = models.TextField(db_column='phone', null=True, blank=True)

    # Campos hash para búsqueda
    name_hash = models.CharField(max_length=64, editable=False, db_index=True, blank=True, null=True)
    email_hash = models.CharField(max_length=64, editable=False, db_index=True, blank=True, null=True)

    description = models.TextField()
    promo_code_allowed = models.BooleanField(default=False)
    service = models.ForeignKey('Service', on_delete=models.CASCADE, related_name='schedules')
    promo_code = models.ForeignKey('PromoCode', null=True, blank=True, on_delete=models.SET_NULL)

    @staticmethod
    def hash_value(value):
        """Crea un hash SHA256 hexadecimal (en minúsculas)."""
        if not value:
            return ''
        return hashlib.sha256(value.strip().lower().encode()).hexdigest()

    # --- properties existentes ---
    @property
    def name(self):
        return encryptor.decrypt(self._name) if self._name else ''
    
    @name.setter
    def name(self, value):
        self._name = encryptor.encrypt(value) if value else ''
        self.name_hash = self.hash_value(value)

    @property
    def email(self):
        return encryptor.decrypt(self._email) if self._email else ''
    
    @email.setter
    def email(self, value):
        self._email = encryptor.encrypt(value) if value else ''
        self.email_hash = self.hash_value(value)

    @property
    def phone(self):
        return encryptor.decrypt(self._phone) if self._phone else ''
    
    @phone.setter
    def phone(self, value):
        self._phone = encryptor.encrypt(value) if value else ''

    def __str__(self):
        return f"Cita {self.date} {self.time} - {self.name}"

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