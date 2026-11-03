#!/usr/bin/env python3
"""Genera los assets web del logo CPD a partir de los originales del cliente.

Uso:  python3 scripts/generar-logos.py
Requiere Pillow y numpy. Reescribe, desde los originales:
  src/assets/asset-cpd/logo-blanco.png   lockup blanco (header oscuro), alfa recuperado
  src/assets/asset-cpd/logo.png          lockup tinta (fondos claros)
  public/favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192/512.png
  public/logo.png                        emblema 512 para el JSON-LD
  public/og.png                          Open Graph 1200x630

Los originales del cliente NO viven en el repo (los .ico pesan MB): copiarlos a
/home/nye/Descargas/logo cpd/ antes de correr el script. Recibidos el 2026-11-03:
  - "LOGO PORTADA WEB 1..3.webp": el mismo lockup a 2328/1444/681 px de ancho,
    aplanado sobre NEGRO opaco (por eso se recupera el alfa por desmultiplicacion).
  - "ico 1..4 para iconos internet.ico": el emblema cuadrado sobre BLANCO opaco.
"""
from PIL import Image
import numpy as np
import os

SRC = "/home/nye/Descargas/logo cpd"
OUT = "/home/nye/Proyectos/personales/cpd-cliente"

INK = (51, 51, 51)     # --color-ink #333333
NIGHT = (13, 11, 14)   # --color-night #0d0b0e


def unpremultiply_black(path):
    """Recupera alfa + color de un logo compuesto sobre negro puro.

    C_obs = C_true * a  ->  a = max(C_obs), C_true = C_obs / a
    """
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.float32) / 255.0
    a = arr.max(axis=2)
    a_safe = np.where(a > 1e-6, a, 1.0)
    rgb = np.clip(arr / a_safe[..., None], 0, 1)
    out = np.dstack([rgb * 255.0, a * 255.0]).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def unpremultiply_white(path):
    """Recupera alfa de un logo compuesto sobre blanco puro (fondo de los .ico)."""
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.float32) / 255.0
    a = 1.0 - arr.min(axis=2)          # canal más oscuro => opacidad
    a_safe = np.where(a > 1e-6, a, 1.0)
    rgb = np.clip((arr - (1.0 - a[..., None])) / a_safe[..., None], 0, 1)
    out = np.dstack([rgb * 255.0, a * 255.0]).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def trim(im, pad_ratio=0.02):
    bbox = im.getbbox()
    im = im.crop(bbox)
    px = int(round(im.width * pad_ratio))
    py = int(round(im.height * pad_ratio))
    canvas = Image.new("RGBA", (im.width + 2 * px, im.height + 2 * py), (0, 0, 0, 0))
    canvas.paste(im, (px, py))
    return canvas


def recolor_neutrals_to_ink(im):
    """En el lockup blanco, pasa los pixeles neutros (texto y trazos blancos) a tinta.

    Los colores del emblema (alta croma) se conservan intactos.
    """
    arr = np.asarray(im).astype(np.float32)
    rgb, a = arr[..., :3], arr[..., 3]
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    chroma = mx - mn
    neutral = (chroma < 0.12 * np.maximum(mx, 1.0)) & (a > 0)
    arr[..., 0] = np.where(neutral, INK[0], rgb[..., 0])
    arr[..., 1] = np.where(neutral, INK[1], rgb[..., 1])
    arr[..., 2] = np.where(neutral, INK[2], rgb[..., 2])
    return Image.fromarray(arr.round().astype(np.uint8), "RGBA")


def fit_width(im, width):
    ratio = width / im.width
    return im.resize((width, max(1, round(im.height * ratio))), Image.LANCZOS)


def main():
    lockup = unpremultiply_black(os.path.join(SRC, "LOGO PORTADA WEB 1.webp"))
    lockup = trim(lockup, 0.01)

    blanco = fit_width(lockup, 1200)
    blanco.save(os.path.join(OUT, "src/assets/asset-cpd/logo-blanco.png"), optimize=True)

    tinta = recolor_neutrals_to_ink(lockup)
    tinta = fit_width(tinta, 1200)
    tinta.save(os.path.join(OUT, "src/assets/asset-cpd/logo.png"), optimize=True)

    # --- Emblema (favicon / iconos) -------------------------------------
    emblema = Image.open(os.path.join(SRC, "ico 1 para iconos internet.ico")).convert("RGBA")
    emblema = trim(emblema, 0.04)  # recorta el margen blanco que trae el .ico

    def square(img, size, bg=(255, 255, 255, 255), margin=0.12):
        canvas = Image.new("RGBA", (size, size), bg)
        inner = int(size * (1 - 2 * margin))
        r = min(inner / img.width, inner / img.height)
        pic = img.resize((max(1, round(img.width * r)), max(1, round(img.height * r))), Image.LANCZOS)
        canvas.alpha_composite(pic, ((size - pic.width) // 2, (size - pic.height) // 2))
        return canvas

    icon512 = square(emblema, 512)
    icon512.convert("RGB").save(os.path.join(OUT, "public/icon-512.png"), optimize=True)
    square(emblema, 192).convert("RGB").save(os.path.join(OUT, "public/icon-192.png"), optimize=True)
    square(emblema, 180).convert("RGB").save(os.path.join(OUT, "public/apple-touch-icon.png"), optimize=True)
    square(emblema, 32, margin=0.04).convert("RGB").save(os.path.join(OUT, "public/favicon-32.png"), optimize=True)

    ico = square(emblema, 64, margin=0.04).convert("RGB")
    ico.save(os.path.join(OUT, "public/favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

    # logo para JSON-LD (schema.org): cuadrado, fondo blanco, legible
    icon512.convert("RGB").save(os.path.join(OUT, "public/logo.png"), optimize=True)

    # --- Open Graph 1200x630 -------------------------------------------
    og = Image.new("RGBA", (1200, 630), NIGHT + (255,))
    lock = blanco.copy()
    lock = lock.resize((880, round(lock.height * 880 / lock.width)), Image.LANCZOS)
    og.alpha_composite(lock, ((1200 - lock.width) // 2, (630 - lock.height) // 2))
    og.convert("RGB").save(os.path.join(OUT, "public/og.png"), optimize=True)

    # logo del bloque «Organiza:» del footer de la landing /expo (mismo ancho)
    expo = fit_width(lockup, 490)
    expo.save(os.path.join(OUT, "public/expo/logo-cpd.png"), optimize=True)
    expo.save(os.path.join(OUT, "public/expo/logo-cpd.webp"), "WEBP", quality=92, method=6)

    for name in ["logo.png", "logo-blanco.png"]:
        p = os.path.join(OUT, "src/assets/asset-cpd", name)
        print(name, Image.open(p).size, round(os.path.getsize(p) / 1024, 1), "KB")
    for name in ["favicon.ico", "favicon-32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "logo.png", "og.png"]:
        p = os.path.join(OUT, "public", name)
        print("public/" + name, Image.open(p).size, round(os.path.getsize(p) / 1024, 1), "KB")


if __name__ == "__main__":
    main()
