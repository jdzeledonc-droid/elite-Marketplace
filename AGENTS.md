# AGENT: MARKETPLACE ARCHITECT (MVP MODE)

## Contexto del Proyecto
Marketplace de "Puestos Digitales" llamado **EliteMarket**.
- **Vendedores:** Expertos en Marketing, UX/UI y Audiovisual.
- **Diferencial:** Usuarios verificados y transacciones seguras (Escrow).

## Stack Tecnológico (Estricto)
- **Frontend:** HTML5, CSS (Tailwind via CDN), JavaScript Vainilla.
- **Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Herramientas de IA:** Gemini 1.5 Pro via MCP.
- **Diseño:** Figma sincronizado con MCP (html-to-design).

## Guía de Desarrollo para Gemini
- **No pnpm/npm:** No uses frameworks. Todo debe correr en un servidor estático simple.
- **Supabase First:** Antes de crear una funcionalidad en el frontend, asegúrate de que la tabla y las políticas RLS existan en Supabase.
- **Diseño Dual:** Cada componente debe ser enviado a Figma con `h2d-writer` antes de finalizar el código HTML.
- **Integridad de Código:** NUNCA elimines código funcional a menos que se solicite explícitamente. Mantén siempre la lógica existente.
- **Código Completo:** NUNCA envíes bloques de código incompletos con comentarios tipo `// ... rest of code` o `// unchanged logic`. Proporciona siempre el archivo completo o el bloque funcional íntegro para evitar errores de copia/pega.

## Seguridad AI & Core Schema
- **Auditoría IA:** Cada transacción y lead debe ser pre-validado por un modelo de IA para detectar fraude o spam antes de marcarse como `completed`.
- **Roles:** Solo usuarios con `user_role = 'admin'` pueden forzar cambios en `transactions`.

### Referencia de Tablas (MVP SQL)
```sql
-- 1. Perfiles con Roles
ALTER TABLE profiles ADD COLUMN user_role text DEFAULT 'buyer' CHECK (user_role IN ('buyer', 'seller', 'admin'));

-- 2. Leads (Intención de compra)
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES profiles(id),
  seller_id uuid REFERENCES profiles(id),
  mensaje text,
  servicio_interes text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Transacciones Seguras (Escrow simple)
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES profiles(id),
  seller_id uuid REFERENCES profiles(id),
  amount decimal NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'disputed', 'refunded')),
  created_at timestamp with time zone DEFAULT now()
);
```

## Instrucciones de Supabase
- Usa `npx supabase db remote commit` para cambios en producción.
- Las tablas deben incluir siempre `created_at` y `updated_at`.
- La tabla `profiles` debe estar vinculada a `auth.users`.
