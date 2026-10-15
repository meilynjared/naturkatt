# NaturKatt

Tienda online de **Gloria Ríos Marambio**, consultora Natura independiente de Iquique, con la asistente virtual **Flor**.

**Sitio:** https://naturkatt.vercel.app/ · **Contacto:** WhatsApp +56 9 7576 0155 · gloriariosmarambio@gmail.com

Es el prototipo del proyecto *Plan de Transformación y Adopción de E-Commerce Inteligente para una PYME Tradicional*, de la asignatura E-commerce (Ingeniería en Informática, INACAP Sede Iquique). Autora: Meilyn Quispe. Profesor: Ademar Araya.

> NaturKatt es el emprendimiento de una consultora independiente; no es un sitio oficial de Natura.

## Qué hace

- **Catálogo** de kits de regalo y productos, con opciones como aroma, tamaño, tipo de piel y envoltorio con tarjeta. El precio se actualiza al elegir cada opción.
- **Compra en 1 clic.** La clienta paga sin crear cuenta y, si quiere, el navegador recuerda sus datos para la próxima compra.
- **Pago con Webpay Plus** (Transbank). El servidor vuelve a calcular el precio con el catálogo y consulta a Transbank el estado del pago. Por defecto funciona en el ambiente de integración (pruebas).
- **Datos de entrega:**
  - El celular se ordena solo como `+56 9 XXXX XXXX`.
  - La dirección se verifica en un mapa de OpenStreetMap, y la clienta puede mover el pin hasta su casa o abrir el punto en Google Maps.
  - La clienta elige entre **envío a domicilio** y **retiro gratis en Alto Hospicio**, en el punto de retiro de Gloria.
  - El envío a domicilio se calcula según la distancia por calle desde donde despacha Gloria, en Alto Hospicio, y se cobra junto con el pedido.
  - El punto de retiro es Av. Esmeralda 2872, Alto Hospicio. Como Gloria trabaja desde su casa, el día y la hora se coordinan antes por WhatsApp.
  - Quien no recuerda su dirección exacta puede recorrer el mapa y tocar su casa, o usar su ubicación actual. La página sugiere la calle y el número de ese punto.
- **Flor**, asistente virtual con IA (Gemini). Recomienda productos según la necesidad y el presupuesto, responde dudas de pago, envío y devoluciones, y deriva a Gloria por WhatsApp. Si el servicio de IA no responde, contesta con respuestas de respaldo basadas en el catálogo real.
- **Comprobante por WhatsApp.** Después de pagar, la clienta le envía a Gloria el detalle del pedido, el envío y el enlace del punto de entrega en Google Maps.

## Envíos (solo Región de Tarapacá)

También existe la opción de **retiro gratis** en el punto de retiro de Gloria, en Alto Hospicio.

| Distancia por calle desde Alto Hospicio | Valor | Cómo se entrega |
|---|---|---|
| Hasta 3 km | $1.500 | Reparto de Gloria, 24 h hábiles |
| 3 a 6 km | $2.000 | Reparto de Gloria |
| 6 a 10 km | $2.500 | Reparto de Gloria |
| 10 a 14 km | $3.500 | Reparto de Gloria (Iquique centro y norte) |
| 14 a 18 km | $4.000 | Reparto de Gloria (Cavancha, Playa Brava) |
| 18 a 22 km | $4.500 | Reparto de Gloria (Bajo Molle) |
| 22 a 30 km | $5.000 | Reparto de Gloria |
| 30 a 60 km | $5.990 | Courier (Pozo Almonte, La Tirana) |
| 60 a 100 km | $6.990 | Courier (Huara, Pisagua) |
| 100 a 150 km | $7.990 | Courier (Pica, Matilla) |
| 150 a 200 km | $9.490 | Courier (Camiña) |
| 200 a 320 km | $10.990 | Courier (Colchane y altiplano) |

- En Iquique y Alto Hospicio el envío es **gratis desde $30.000**.
- El courier puede ser Starken, Chilexpress o Correos de Chile, y demora de 2 a 5 días hábiles.
- Los tramos están en `lib/shipping.ts`.

## Tecnologías

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4** y componentes **shadcn/ui**. Diseño inicial generado con **v0.app**.
- **Vercel** para el hosting, con una vista previa por cada pull request.
- **Vercel AI SDK** con **Gemini**, mediante una clave de Google AI Studio o el AI Gateway de Vercel.
- **transbank-sdk** para Webpay Plus.
- **Leaflet** con mapas de **OpenStreetMap**. Las direcciones se buscan con **Nominatim** (y Photon de respaldo) y la distancia por calle se calcula con **OSRM**. Son servicios gratuitos, sin clave ni tarjeta.

## Estructura

```
app/
  page.tsx                  Inicio
  producto/[slug]/          Página de cada producto
  checkout/                 Datos de entrega y pago
  pago/resultado/           Resultado del pago con Webpay
  api/chat/                 Flor (IA con respaldo)
  api/direccion/            Verificación de la dirección en el mapa
  api/envio/                Distancia por calle desde el local
  api/webpay/crear|retorno  Inicio y retorno del pago con Webpay
components/                 Interfaz (configurador, carrito, checkout, mapa, Flor, etc.)
lib/
  catalog.ts                Productos, precios y opciones
  order.ts                  Cálculo del pedido en el servidor y mensaje para Gloria
  shipping.ts               Comunas, tramos de envío y distancias
  geo-server.ts             Búsqueda de direcciones y rutas (OpenStreetMap)
  phone.ts                  Formato de celular +56 9
  webpay.ts                 Configuración de Transbank
  flor-prompt.ts            System Prompt de Flor
  flor-fallback.ts          Respuestas de respaldo de Flor
```

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Para qué sirve | ¿Obligatoria? |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Clave gratuita de Google AI Studio para que Flor use Gemini | No, porque sin ella Flor usa las respuestas de respaldo |
| `FLOR_GOOGLE_MODEL` | Modelo de Gemini (por defecto `gemini-flash-latest`) | No |
| `FLOR_MODEL` | Modelo del AI Gateway de Vercel, si no hay clave de Google | No |
| `WEBPAY_ENV` | `produccion` para cobrar dinero real | No, porque por defecto se usa el ambiente de pruebas |
| `WEBPAY_COMMERCE_CODE` / `WEBPAY_API_KEY` | Credenciales de producción entregadas por Transbank | Solo en producción |

## Ejecutar en local

```bash
pnpm install
pnpm dev
```

Luego abre http://localhost:3000.

## Probar el pago (ambiente de integración de Transbank)

| Dato | Valor |
|---|---|
| Tarjeta de crédito aprobada | `4051 8856 0044 6623`, CVV `123`, cualquier fecha futura |
| Tarjeta rechazada | `5186 0595 5959 0568` |
| Débito Redcompra | `4051 8842 3993 7763` |
| Autenticación | RUT `11.111.111-1`, clave `123` |

No se cobra dinero real.
