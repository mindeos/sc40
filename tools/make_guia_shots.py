"""Capturas de los minijuegos para la guía completa (guia/img/*.png), sacadas del propio juego con Chrome (Playwright).
Requisitos: python tools/serve.py en marcha y pip install playwright. Uso: python tools/make_guia_shots.py [nombre ...]
"""
import sys, time, io
from playwright.sync_api import sync_playwright
from PIL import Image
OUT='guia/img/'
K=lambda pg,k,n=1,d=0.25: [ (pg.keyboard.press(k), time.sleep(d)) for _ in range(n)]
GAMES={
 'sokoban': lambda pg: (K(pg,'Space',3,0.4), K(pg,'ArrowLeft',2), K(pg,'ArrowUp',1)),
 'monos':   lambda pg: (K(pg,'Space',3,0.4), K(pg,'ArrowRight',2,0.5)),
 'pato':    lambda pg: (K(pg,'Space',3,0.4), K(pg,'ArrowUp',3,0.3)),
 'simon':   lambda pg: (K(pg,'Space',2,0.4), time.sleep(1.2)),
 'horno':   lambda pg: (K(pg,'Space',6,0.4), K(pg,'ArrowRight',2), K(pg,'ArrowDown',1)),
 'ritmo':   lambda pg: (K(pg,'Space',2,0.4), time.sleep(2.5)),
 'otama':   lambda pg: (K(pg,'Space',2,0.4), K(pg,'ArrowUp',4,0.15)),
 'luces':   lambda pg: (K(pg,'Space',2,0.4), K(pg,'Space',1), K(pg,'ArrowRight',1), K(pg,'Space',1), K(pg,'ArrowRight',1), K(pg,'Space',1)),
 'cali':    lambda pg: (K(pg,'Space',2,0.4), time.sleep(1.0)),
 'robot':   lambda pg: (K(pg,'Space',4,0.4), K(pg,'Space',2,0.3)),
 'tedi':    lambda pg: (K(pg,'Space',2,0.4), K(pg,'ArrowUp',3,0.3), time.sleep(1.5)),
 'tarta':   lambda pg: (K(pg,'Space',2,0.4), K(pg,'ArrowRight',4,0.3), time.sleep(1.5)),
 'awawas':  lambda pg: (K(pg,'Space',3,0.4), time.sleep(1.5)),
}
only=sys.argv[1:]
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome')
    for name, act in GAMES.items():
        if only and name not in only: continue
        pg=b.new_page(viewport={'width':960,'height':540})
        pg.goto(f'http://127.0.0.1:8040/?debug&scene={name}'); time.sleep(3.5)
        act(pg)
        pg.add_style_tag(content='#overlay{visibility:hidden!important} #touch{display:none!important}')
        time.sleep(0.3)
        im=Image.open(io.BytesIO(pg.screenshot())).resize((320,180),Image.NEAREST)
        im.save(OUT+name+'.png', optimize=True); print(name); pg.close()
    # Fucsia: la prueba es HTML; se abre directamente
    if not only or 'fuxia' in only:
        pg=b.new_page(viewport={'width':960,'height':540})
        pg.goto('http://127.0.0.1:8040/?debug&flags=intro,invites&at=isla,15,31'); time.sleep(3.5)
        pg.evaluate("() => { import('./js/fuxia.js').then(m=>m.fuxiaQuiz()); return 1; }"); time.sleep(1.5)
        pg.add_style_tag(content='#touch{display:none!important}')
        im=Image.open(io.BytesIO(pg.screenshot())).resize((480,270),Image.LANCZOS); im.save(OUT+'fuxia.png', optimize=True); print('fuxia'); pg.close()
    b.close()
