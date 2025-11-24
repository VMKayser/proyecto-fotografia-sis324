#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

SKIP_SEED=0
while (( "$#" )); do
  case "$1" in
    --skip-seed)
      SKIP_SEED=1
      shift
      ;;
    --help|-h)
      cat <<'EOF'
Uso: scripts/levantar.sh [opciones]

Opciones:
  --skip-seed   Omite la ejecución de npm run db:seed
  -h, --help    Muestra esta ayuda
EOF
      exit 0
      ;;
    *)
      echo "[WARN] Opción desconocida '$1' (se ignora)"
      shift
      ;;
  esac
done

info() {
  echo -e "\033[1;34m[INFO]\033[0m $*"
}
warn() {
  echo -e "\033[1;33m[WARN]\033[0m $*"
}

if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD=(docker-compose)
else
  echo "[ERROR] No se encontró docker compose. Instálalo antes de continuar."
  exit 1
fi

info "Raíz del proyecto: $PROJECT_ROOT"

if [ ! -d node_modules ]; then
  info "Instalando dependencias con npm install..."
  npm install
else
  info "Dependencias ya instaladas, se omite npm install"
fi

info "Levantando servicios de base de datos (MySQL + phpMyAdmin)..."
"${COMPOSE_CMD[@]}" up -d

info "Generando cliente de Prisma..."
npx prisma generate

info "Aplicando migraciones pendientes (sin eliminar datos)..."
npx prisma migrate dev --skip-seed --name auto_migration

if [ "$SKIP_SEED" -eq 0 ]; then
  info "Ejecutando seed de datos (opcional)..."
  if npm run db:seed; then
    info "Seed ejecutado correctamente"
  else
    warn "Seed falló o ya existe información. Continúa con el resto del flujo."
  fi
else
  info "Seed omitido por bandera --skip-seed"
fi

info "Iniciando servidor de desarrollo (npm run dev)..."
info "Presiona Ctrl+C para detenerlo cuando termines las pruebas."
npm run dev
