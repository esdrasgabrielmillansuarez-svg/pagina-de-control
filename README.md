# Panel de Control Empresarial

Sistema de control interno para gestión de ventas, inventario, usuarios, caja y reportes, desarrollado con PHP, HTML, CSS y JavaScript.

## Descripción general

Este proyecto incluye una interfaz interactiva con:

- acceso protegido por pantalla de bloqueo
- autenticación por usuario y contraseña
- roles de administrador, operaciones y reportes
- administración de usuarios
- creación y eliminación de usuarios
- inventario con stock, estados y alertas
- registro de productos con precio en bolívares y USD
- vista previa del equivalente en la otra moneda
- posibilidad de adjuntar imagen de referencia del producto
- venta de productos con registro de actividad
- reportes diarios con información por usuario
- historial de los últimos 15 días
- cambio manual de tasa del dólar y sincronización automática con referencia BCV
- backend en PHP con almacenamiento JSON

## Estructura del proyecto

- `index.html` – dashboard principal
- `index-premium.html` – variante premium/dark
- `style.css` – estilos del dashboard principal
- `style-premium.css` – estilos de la variante premium
- `script.js` – lógica interactiva del dashboard principal
- `script-premium.js` – lógica interactiva de la variante premium
- `api.php` – backend PHP para usuarios, inventario, tasa y carga de imágenes
- `data/store.json` – almacén dinámico de usuarios, productos, historial y tasa
- `uploads/` – imágenes subidas de referencia

## Requisitos

- PHP 8+
- servidor web local o PHP built-in server
- navegador moderno

## Instalación y ejecución

1. Ubícate en la carpeta del proyecto.
2. Ejecuta el servidor PHP:

```bash
php -S localhost:8000
```

3. Abre la siguiente URL en tu navegador:

```text
http://localhost:8000/
```

## Credenciales por defecto

- Usuario: `admin`
- Contraseña: `1234`
- Rol: `Administrador`

También se crean usuarios de ejemplo:

- `maria` / `admin` / `Operaciones`
- `operacion` / `operacion` / `Operaciones`
- `reporte` / `reporte` / `Reportes`

## Funcionalidades principales

### Seguridad y roles

- bloqueo de acceso antes de ingresar al panel
- solo el administrador puede:
  - crear usuarios
  - eliminar usuarios
  - cambiar la tasa del dólar
  - agregar productos
  - gestionar inventario
- usuarios no administradores pueden:
  - vender productos
  - consultar stock
  - revisar actividad

### Inventario

- registro de nombre, categoría, stock y precio
- soporte de precio en bolívares y USD
- conversión automática y cálculo simultáneo
- estado del producto según stock
- cambio de estado manual
- alertas de stock bajo y sin stock
- imagen de referencia opcional

### Reportes

- visualización de ventas por usuario
- exportación a ventana PDF/impresión
- historial de los últimos 15 días
- datos sumados por día

### No inventado / persistencia

- los datos no son ficticios
- el historial se guarda con límite de 15 días
- cada día nuevo reemplaza el registro del mismo día para evitar duplicados

## Backend

El backend `api.php` expone acciones para:

- autenticación
- listado de usuarios
- creación de usuarios
- eliminación de usuarios
- listado de productos
- agregar productos con imagen
- actualizar tasa del dólar
- consultar tasa actual
- guardar historial diario

## Sincronización automática de la tasa

El proyecto incluye un botón para sincronizar la tasa desde una referencia pública compatible con el BCV. Si la consulta no está disponible, el sistema conserva la última tasa válida y ofrece un mensaje de error en pantalla.

## Recomendaciones de uso

- mantener el proyecto dentro de un servidor con PHP habilitado
- asegurar permisos de escritura en las carpetas `data` y `uploads`
- no guardar información sensible real sin reforzar seguridad antes de producción

## Licencia

Proyecto desarrollado para uso interno y demostración de panel empresarial.
