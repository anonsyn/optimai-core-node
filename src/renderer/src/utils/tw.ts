import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {},
    classGroups: {
      'font-size': [
        {
          text: [
            '10',
            '12',
            '14',
            '16',
            '18',
            '20',
            '22',
            '24',
            '28',
            '30',
            '32',
            '36',
            '40',
            '48',
            '56',
            '64',
            '68',
            '72',
            '96'
          ]
        }
      ],
      blur: ['100', '400']
    }
  }
})

export const cx = clsx

export const cn = (...inputs: ClassValue[]) => {
  return customTwMerge(clsx(inputs))
}
