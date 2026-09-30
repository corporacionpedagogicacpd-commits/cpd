#!/usr/bin/env bash
# Descarga las imágenes de la carpeta Drive del cliente a public/asset-cpd/
# Fuente: https://drive.google.com/drive/folders/1Z3pY1p8ebu6fkRp4-Mo5oGI5Szbi0UEn
# Uso: bash scripts/fetch-drive-assets.sh
# Re-ejecutable: si el cliente cambia una imagen en Drive, borrar el archivo
# destino y volver a correr este script.
set -euo pipefail

DEST="$(cd "$(dirname "$0")/.." && pwd)/src/assets/asset-cpd"
mkdir -p "$DEST"

# nombre-destino|fileId
MANIFEST='
logo.png|1wsmXT_4IGdh3_7Bb3fCnEaarGsqhjwuE
logo-blanco.png|18pfZ12j5zw4vOJon8BouGN12Ft_U5CF8
cpd.jpg|1xWH_55WEEJ8s3cysib_NI6IZIubFF60V
eje-educacion.png|14cKrfDbDpyEky2YfiAx5ATRzd7Tnq4tR
eje-psicosocial.png|1TwLh3rkixyvldN1cOHpfx9R0GLgN2uGH
eje-inclusion.png|1y1vcEl9m81x_Z5YFsmGNAgH54b9lab29
blog.png|1Ru8rUWKrUZh6pLQnVWqLmoCelO3Vg5eM
capacitacion-profesional.png|1dxyUHXy_WM0e2CaEJ7RPyQpyKDallLF6
foto24.jpg|1TGTsvwSd4qF_YXn2XdU95Y1xvMhc9zi3
foto26.jpg|12SAjr3498ulBmjA9rho6plb57SIb76cf
foto39.jpg|1_VQVrSszAkd0RNhWbzEN3SM35LK_PXBd
foto49.jpg|1bZ2gqM8rAg0-YY6fjFy3bsQYDj5fCSgS
foto53.jpg|1ByQcLCVLvQzdbwzjdeJ18HQDg13gouAU
foto55.jpg|1OnQzPjUxAKMcLW_9WH0TismHw_SBxzgj
evento-jornada.jpeg|1WBIOWmHUgByEtjb1au8a5Mfhus_cvvUq
evento-corporacion.jpeg|1e4lQW5q4n-_8k2RjmQxkaeBhQ2cG7BvB
alianza-udea.jpeg|1BjViUlviPmJUuYNxSiUq7xS49-aCV-HN
credito-digitaljf.jpeg|1vYDRtqni2gCbM9kskFNkVqcGhFcHVsSj
'

fail=0
while IFS='|' read -r name id; do
  [ -z "${name:-}" ] && continue
  out="$DEST/$name"
  if [ -s "$out" ]; then
    echo "SKIP  $name (ya existe)"
    continue
  fi
  code=$(curl -sL -m 60 -o "$out.tmp" -w '%{http_code}' "https://lh3.googleusercontent.com/d/$id")
  # Validar por magic bytes (sin depender del binario `file`, ausente en la VM).
  magic=$(head -c 4 "$out.tmp" 2>/dev/null | od -An -tx1 | tr -d ' \n')
  case "$magic" in
    ffd8ff*|89504e47|52494646) ;;   # JPEG | PNG | (RIFF) WebP
    *) echo "FALLO $name (http=$code magic=$magic — no es imagen)"; rm -f "$out.tmp"; fail=$((fail+1)); continue;;
  esac
  if [ "$code" != "200" ]; then
    echo "FALLO $name (http=$code)"
    rm -f "$out.tmp"
    fail=$((fail+1))
    continue
  fi
  mv "$out.tmp" "$out"
  echo "OK    $name ($(du -h "$out" | cut -f1))"
done <<< "$MANIFEST"

echo "---"
if [ "$fail" -gt 0 ]; then
  echo "$fail archivo(s) fallaron"; exit 1
fi
echo "Todas las imágenes descargadas en $DEST"
