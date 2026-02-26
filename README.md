# Mercofrio App

## Requisitos Previos para MAC

- macOS (preferiblemente con Apple Silicon)
- Rosetta 2 instalado
- nvm (Node Version Manager)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://gitlab.com/alberione/mercofrio_v2/mercofrio-app.git
cd mercofrio-app
```

2. Cambiar a una shell x86_64 usando Rosetta 2:
```bash
arch -x86_64 zsh
```

3. Instalar y usar Node.js 14:
```bash
nvm install 14
nvm use 14
```

4. Instalar las dependencias:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Desarrollo

Para iniciar la aplicación en modo desarrollo:

```bash
ionic serve
```

mfontanetto-mercofrio@vmc.com.ar
15522998

## Notas Importantes

- Este proyecto requiere Node.js 14 y debe ejecutarse en modo x86_64 a través de Rosetta 2
- Para cambiar entre versiones de Node.js, usar `nvm use`
- Para volver a la arquitectura ARM nativa, usar `arch -arm64 zsh`

## Solución de Problemas

Si encuentras problemas con la instalación o ejecución:

1. Asegúrate de estar en una shell x86_64:
```bash
arch -x86_64 zsh
```

2. Verifica la versión de Node.js:
```bash
node -v  # Debe mostrar v14.x.x
```

3. Limpia la instalación y reinstala:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```
