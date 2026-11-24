"""Código QR del folleto de la caja (folleto/qr.svg), con la dirección del juego.
Requiere: pip install segno. Uso: python tools/make_qr.py
"""
import segno

URL = 'https://mindeos.github.io/sc40/'
qr = segno.make(URL, error='q', micro=False)  # corrección Q (25 %): se sigue leyendo aunque se raye o se doble un poco
qr.save('folleto/qr.svg', scale=10, border=2, dark='#1a1412', light='#ffffff', xmldecl=False)
print('folleto/qr.svg', 'versión', qr.version, qr.error, f'{qr.symbol_size(scale=1, border=0)[0]} módulos')
