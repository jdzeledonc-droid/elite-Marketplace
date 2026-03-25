---
name: new-puesto
description: Genera un micro-sitio HTML para un vendedor en /puestos/ con su color, tema y servicios
disable-model-invocation: true
---

# Crear Puesto Digital

Genera un micro-sitio HTML completo para un vendedor de EliteMarket.

## Arguments

- `nombre`: Nombre completo del vendedor
- `categoria`: Marketing | UX/UI | Audiovisual
- `color`: black | red | yellow | blue | green | white
- `tema`: minimal | bold | elegant
- `servicios`: Lista de servicios con precios (ej: "Auditoría UX:150, Wireframes:80")
- `whatsapp`: Número de WhatsApp con código de país

## Instructions

1. Create a new file at `puestos/{nombre-slug}.html`
2. Use Tailwind CDN and Inter font (same as main site)
3. Apply the vendor's selected color as accent throughout the page
4. Include sections: Hero with avatar, Bio, Services grid with prices, Contact CTA (WhatsApp link), Back to marketplace link
5. Make it mobile-first and consistent with EliteMarket's glassmorphism style
6. The page must work standalone as a static HTML file
