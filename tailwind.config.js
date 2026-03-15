/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── Colors ───────────────────────────────────────────────────────────
      colors: {
        em: {
          primary:         '#000000',
          'primary-hover': '#1e293b',
          'primary-light': '#f8fafc',
          success:         '#10b981',
          warning:         '#f59e0b',
          error:           '#ef4444',
          info:            '#3b82f6',
          verified:        '#2563eb',
          'accent-black':  '#000000',
          'accent-red':    '#ef4444',
          'accent-yellow': '#f59e0b',
          'accent-blue':   '#3b82f6',
          'accent-green':  '#10b981',
          'accent-white':  '#ffffff',
        },
      },

      // ── Spacing (4px base scale) ──────────────────────────────────────────
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        8:  '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        sm:            '12px',
        md:            '16px',
        'chat-bubble': '20px',
        lg:            '22px',
        xl:            '28px',
        '2xl':         '32px',
        '3xl':         '40px',
        '4xl':         '44px',
        full:          '999px',
      },

      // ── Font Family ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      // ── Font Size ─────────────────────────────────────────────────────────
      fontSize: {
        '2xs': '10px',
        xs:    '11px',
        sm:    '13px',
        base:  '14px',
        md:    '16px',
        lg:    '18px',
        xl:    '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
      },

      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        sm:    '0 1px 2px rgba(0,0,0,0.04)',
        md:    '0 4px 6px -1px rgba(0,0,0,0.06)',
        lg:    '0 10px 15px -3px rgba(0,0,0,0.08)',
        xl:    '0 20px 25px -5px rgba(0,0,0,0.1)',
        inner: 'inset 0 2px 4px rgba(0,0,0,0.04)',
        booth: '0 -10px 40px rgba(0,0,0,0.1)',
      },

      // ── Avatar sizing ─────────────────────────────────────────────────────
      width: {
        'avatar-sm': '48px',
        'avatar-md': '64px',
        'avatar-lg': '112px',
      },
      height: {
        'avatar-sm': '48px',
        'avatar-md': '64px',
        'avatar-lg': '112px',
      },
    },
  },
  plugins: [],
}
