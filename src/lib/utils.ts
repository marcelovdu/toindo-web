import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UrlQueryParams, RemoveUrlQueryParams } from '@/types'
import qs from 'query-string'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  console.error(error)
  throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
}

export const formatDateTime = (dateString: Date) => {
  // Converte a string de data para um objeto Date
  const dateObject = new Date(dateString);

  // Opções para data e hora completas (ex: seg., 29 de set., 14:30)
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false, // -> Corrigido para formato 24h
  };

  // Opções apenas para a data (ex: 29/09/2025)
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  // Opções apenas para a hora (ex: 14:30)
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false, // -> Corrigido para formato 24h
  };

  // -> Adicionado 'pt-BR' para formatar corretamente para o Brasil
  const formattedDateTime = new Intl.DateTimeFormat('pt-BR', dateTimeOptions).format(dateObject);
  const formattedDateOnly = new Intl.DateTimeFormat('pt-BR', dateOptions).format(dateObject);
  const formattedTimeOnly = new Intl.DateTimeFormat('pt-BR', timeOptions).format(dateObject);

  // -> A função agora retorna um objeto com as strings formatadas
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDateOnly,
    timeOnly: formattedTimeOnly,
  };
};

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params)

  currentUrl[key] = value

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}

export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params)

  keysToRemove.forEach(key => {
    delete currentUrl[key]
  })

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}