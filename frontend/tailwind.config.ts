import type { Config } from "tailwindcss" 

const config = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			sm: '576px',
  			'sm-max': {
  				max: '576px'
  			},
  			md: '768px',
  			'md-max': {
  				max: '768px'
  			},
  			lg: '992px',
  			'lg-max': {
  				max: '992px'
  			},
  			xl: '1200px',
  			'xl-max': {
  				max: '1200px'
  			},
  			'2xl': '1320px',
  			'2xl-max': {
  				max: '1320px'
  			},
  			'3xl': '1600px',
  			'3xl-max': {
  				max: '1600px'
  			},
  			'4xl': '1850px',
  			'4xl-max': {
  				max: '1850px'
  			}
  		}
  	},
  	extend: {
  		fontFamily: {
  			inter: ['Inter', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace'],
  			sans: ['Inter', 'sans-serif'],
  			jakarta: ['Inter', 'sans-serif'],
  			poppins: ['Poppins', 'sans-serif']
  		},
  		height: {
  			'300px': '300px',
  			'500px': '500px',
  			sidebar: 'calc(100vh - 32px)',
  			'screen-minus-nav': 'calc(100vh - 80px)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				soft: 'hsl(var(--primary-soft))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  				soft: 'hsl(var(--success-soft))'
  			},
  			trust: {
  				DEFAULT: 'hsl(var(--trust))',
  				foreground: 'hsl(var(--trust-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  				border: 'hsl(var(--border))',
  				glass: 'hsl(var(--card-glass))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'glass': 'var(--shadow-glass)',
  			'insurance': '0 4px 16px hsl(var(--primary) / 0.1), 0 8px 32px hsl(var(--foreground) / 0.08)',
  			'professional': '0 8px 32px hsl(var(--foreground) / 0.08), inset 0 1px 0 hsl(var(--foreground) / 0.05)'
  		},
  		backdropBlur: {
  			'glass': '16px',
  			'professional': '12px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-in-up': {
  				from: { opacity: '0', transform: 'translateY(30px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'slide-in-left': {
  				from: { opacity: '0', transform: 'translateX(-30px)' },
  				to: { opacity: '1', transform: 'translateX(0)' }
  			},
  			'slide-in-right': {
  				from: { opacity: '0', transform: 'translateX(30px)' },
  				to: { opacity: '1', transform: 'translateX(0)' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.9)' },
  				to: { opacity: '1', transform: 'scale(1)' }
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-200px 0' },
  				'100%': { backgroundPosition: 'calc(200px + 100%) 0' }
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
  				'50%': { boxShadow: '0 0 0 8px hsl(var(--primary) / 0)' }
  			},
  			'gradient-flow': {
  				'0%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  				'100%': { backgroundPosition: '0% 50%' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'scale-in': 'scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'shimmer': 'shimmer 1.5s infinite',
  			'pulse-glow': 'pulse-glow 2s infinite',
  			'gradient-flow': 'gradient-flow 6s ease infinite'
  		}
  	}
  },
  plugins: [require('tailwindcss-rtl'), require('tailwindcss-animate')],
} satisfies Config

export default config