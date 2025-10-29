# appointment/encryption.py
from cryptography.fernet import Fernet
from django.conf import settings

class FieldEncryptor:
    def __init__(self):
        key = settings.FERNET_KEY
        if isinstance(key, str):
            key = key.encode()
        self.fernet = Fernet(key)
    
    def encrypt(self, value):
        """Encripta un valor"""
        if value is None or value == '':
            return ''
        if isinstance(value, str):
            value = value.encode()
        encrypted = self.fernet.encrypt(value)
        return encrypted.decode()
    
    def decrypt(self, value):
        """Desencripta un valor"""
        if value is None or value == '':
            return ''
        if isinstance(value, str):
            value = value.encode()
        try:
            decrypted = self.fernet.decrypt(value)
            return decrypted.decode()
        except Exception as e:
            return value if isinstance(value, str) else ''

# Instancia global
encryptor = FieldEncryptor()