from django import forms
from .models import Schedule

class ScheduleAdminForm(forms.ModelForm):
    name = forms.CharField(label='Nombre', max_length=100, required=True)
    email = forms.EmailField(label='Correo electrónico', required=True)
    phone = forms.CharField(label='Teléfono', max_length=15, required=False)

    class Meta:
        model = Schedule
        exclude = ('_name', '_email', '_phone',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['name'].initial = self.instance.name
            self.fields['email'].initial = self.instance.email
            self.fields['phone'].initial = self.instance.phone

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.name = self.cleaned_data['name']
        instance.email = self.cleaned_data['email']
        instance.phone = self.cleaned_data['phone']
        if commit:
            instance.save()
        return instance
