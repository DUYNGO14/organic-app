// clsx + tailwind-merge
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gộp class NativeWind, class đứng sau ghi đè class đứng trước (vd: cn('p-2', 'p-4') → 'p-4'). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));