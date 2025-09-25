"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllCategories } from "@/lib/actions/category.actions";
import { ICategory } from "@/models/category";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const CategoryFilter = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      categoryList && setCategories(categoryList as ICategory[])
    }
    getCategories();
  }, [])

  const onSelectCategory = (category: string) => {
      let newUrl = '';

      if(category && category !== 'All') {
        newUrl = formUrlQuery({ params: searchParams.toString(), key: 'category', value: category })
      } else {
        newUrl = removeKeysFromQuery({ params: searchParams.toString(), keysToRemove: ['category'] })
      }

      router.push(newUrl, { scroll: false });
  }

  return (
    <div className="flex items-center gap-3 filter-container"> 
      <Select onValueChange={(value: string) => onSelectCategory(value)} value={selectedCategory || ''}>
        <SelectTrigger className="w-[280px] rounded-full px-4 bg-gray-800 border-gray-700 text-gray-300 focus:ring-emerald-500 filter-trigger-button">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
          <SelectItem value="All" className="select-item p-regular-14 focus:bg-gray-700">Todos</SelectItem>
          {categories.map((category) => (
            <SelectItem 
              value={category.name} 
              key={category._id} 
              className="select-item p-regular-14 focus:bg-gray-700"
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCategory && (
        <button 
          onClick={() => onSelectCategory('All')} 
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
          aria-label="Limpar filtro de categoria"
        >
          <X className="h-7 w-7 text-gray-400" />
        </button>
      )}
    </div>
  )
}

export default CategoryFilter