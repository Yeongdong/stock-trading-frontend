'use client';

import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
  />
));

Input.displayName = "Input";

export { Input };