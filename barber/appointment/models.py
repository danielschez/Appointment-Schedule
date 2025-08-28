from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100)
    duration = models.DurationField()
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ['name']

class Schedule(models.Model):
    date = models.DateField()
    time = models.TimeField()
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    description = models.TextField()
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='schedules')

    def __str__(self):
        return f"Appointment on {self.date} at {self.time}"

    class Meta:
        verbose_name = "Schedule"
        verbose_name_plural = "Schedules"
        ordering = ['-date', '-time']

class Weekday(models.Model):
    day = models.CharField(max_length=10)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.day

    class Meta:
        verbose_name = "Weekday"
        verbose_name_plural = "Weekdays"
        ordering = ['id']

class Workinghours(models.Model):
    day = models.ForeignKey(Weekday, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.day}: {self.start_time} - {self.end_time}"

    class Meta:
        verbose_name = "Working Hour"
        verbose_name_plural = "Working Hours"
        ordering = ['day__id', 'start_time']