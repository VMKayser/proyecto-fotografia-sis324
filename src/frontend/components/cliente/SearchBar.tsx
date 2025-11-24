/**
 * ⚛️ Componente SearchBar
 * Barra de búsqueda para fotógrafos
 */

'use client';

import React, { useState } from 'react';
import { Button, Input } from '../ui';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Buscar fotógrafos...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={setQuery}
        />
      </div>
      <Button type="submit" variant="primary">
        Buscar
      </Button>
    </form>
  );
}
