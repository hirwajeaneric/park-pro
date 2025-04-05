"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({ 
  value = "", 
  onChange, 
  placeholder = "(123) 456-7890",
  className 
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = input
      .replace(/\D/g, "")
      .replace(/^(\d{3})(\d)/, "($1) $2")
      .replace(/^(\d{3})(\d{3})(\d)/, "($1) $2-$3");
    onChange(formatted);
  };

  return (
    <Input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}