'use client'

import { forwardRef } from 'react'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, checked, onCheckedChange, disabled, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className={`
          h-4 w-4 text-blue-600 
          border-gray-300 rounded 
          focus:ring-blue-500 focus:ring-2
          ${className}
        `}
        {...props}
      />
    )
  }
)

Checkbox.displayName = 'Checkbox' 