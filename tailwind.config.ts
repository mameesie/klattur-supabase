// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        growShrink: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
      },
      animation: {
        'grow-shrink': 'growShrink 1s ease-in-out infinite',
      },
    },
  },
}