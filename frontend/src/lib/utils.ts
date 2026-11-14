import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Single class-name helper for the whole app (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
