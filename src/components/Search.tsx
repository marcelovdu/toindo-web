"use client"

import Image from 'next/image';
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

const Search = ({ placeholder = 'Pesquise...' }: { placeholder?: string }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = '';

      if(query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'query',
          value: query
        })
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['query']
        })
      }

      router.push(newUrl, { scroll: false });
    }, 300)

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router])

  return (
    <div className="relative flex items-center min-h-[54px] w-full overflow-hidden rounded-full bg-gray-800 px-4 py-2"> 
      <Image src="/icons/search.svg" alt="search" width={24} height={24} />
      <Input 
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-regular-16 border-0 bg-transparent text-gray-200 outline-offset-0 placeholder:text-gray-400 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
      />

      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute top-1/2 right-4 -translate-y-1/2"
          aria-label="Limpar busca"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>
      )}
    </div>
  )
}

export default Search