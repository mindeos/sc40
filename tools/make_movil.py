"""Prepara el móvil de Cait (escena tras la fiesta, js/scenes/movil.js) a partir de «Material Insipiración/Móvil».

- background.jpg → assets/movil/fondo.png: fondo de pantalla en pixel art (90×160, 24 colores). No sale en TikTok.
- Publicaciones de TikTok, en el orden de ORDER (lo que no esté en ORDER va después, por nombre):
  fotos (.jpg/.png) → assets/movil/<nombre>.png a 90×160; vídeos → assets/movil/<nombre>.mp4 a 90×160 y 20 fps, sin
  sonido (de fondo suena la música de créditos). El aspecto de píxeles (paleta corta y tramado) se lo da el juego.
- js/movil-posts.js: la lista, con el usuario sacado del nombre del fichero («@usuario.ext»). Se conserva lo escrito a
  mano en ese fichero (texto, etiquetas, me gusta) para los ficheros que sigan.

Uso: python tools/make_movil.py
"""
import json
import os
import re
import subprocess
from PIL import Image, ImageOps

SRC = 'Material Insipiración/Móvil/'
OUT = 'assets/movil/'
JS = 'js/movil-posts.js'
W, H = 90, 160
WALL = 'background.jpg'
ORDER = ['@tedhandsomebean.jpg', '@bigmootoo.png', '@chinpals.webm']
IMG, VID = ('.jpg', '.jpeg', '.png'), ('.mp4', '.webm', '.mov', '.mkv')
# Recortes de los vídeos (segundo de inicio, segundo final o None): las chinchillas empiezan en el plano de la patita
# (se quita la guitarra con el letrero) y acaban con la del collar (se quita la última escena, la de las cartas)
TRIM = {'@chinpals.webm': (4.3, 23.85)}


def fit(im):
    """Recorta al centro para quedarse en 9:16 y reduce a 90×160."""
    return ImageOps.fit(ImageOps.exif_transpose(im).convert('RGB'), (W, H), Image.LANCZOS)


def slug(f):
    return re.sub(r'[^a-z0-9]+', '', os.path.splitext(f)[0].lower())


def main():
    os.makedirs(OUT, exist_ok=True)
    fit(Image.open(SRC + WALL)).quantize(24, dither=Image.Dither.NONE).convert('RGB').save(OUT + 'fondo.png')
    prev = {}
    if os.path.exists(JS):
        t = open(JS, encoding='utf-8').read()
        prev = {v['file']: v for v in json.loads(t[t.index('['):t.rindex(']') + 1])}
    files = [f for f in os.listdir(SRC) if f.lower().endswith(IMG + VID) and f != WALL]
    files.sort(key=lambda f: (ORDER.index(f) if f in ORDER else len(ORDER), f))
    out = []
    for f in files:
        name, ext = slug(f), os.path.splitext(f)[1].lower()
        if ext in IMG:
            dst = f'{OUT}{name}.png'
            fit(Image.open(SRC + f)).save(dst)
            kind = 'img'
        else:
            dst = f'{OUT}{name}.mp4'
            t0, t1 = TRIM.get(f, (0, None))
            cut = ['-ss', str(t0)] + (['-to', str(t1)] if t1 else [])
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC + f, *cut, '-an',
                            '-vf', f'scale={W}:{H}:force_original_aspect_ratio=increase:flags=area,crop={W}:{H},fps=20,eq=saturation=1.25',
                            '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], check=True)
            kind = 'video'
        user = os.path.splitext(f)[0] if f.startswith('@') else '@' + name
        v = {'kind': kind, 'src': dst, 'user': user, 'text': '', 'tags': '', 'likes': '', 'file': f}
        if f in prev:  # se respeta lo editado a mano
            v.update({k: prev[f][k] for k in ('text', 'tags', 'likes', 'dur', 'music') if k in prev[f]})
        out.append(v)
        print(kind, dst)
    with open(JS, 'w', encoding='utf-8') as fh:
        fh.write('// Generado por tools/make_movil.py a partir de «Material Insipiración/Móvil».\n')
        fh.write('// Editable a mano: text, tags, likes, dur (segundos de una foto) y music (segundo del vídeo en que empieza\n')
        fh.write('// la música de fondo). Al volver a generar se respeta para el mismo fichero.\n')
        fh.write('export const MOVIL_POSTS = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')


if __name__ == '__main__':
    main()
