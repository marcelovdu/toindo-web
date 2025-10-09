import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UrlQueryParams, RemoveUrlQueryParams } from '@/types'
import qs from 'query-string'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const handleError = (error: unknown): string => {
  console.error(error);
  
  if (error instanceof Error) {
    // Se for um objeto de Erro, retorna a mensagem dele
    return error.message;
  } 
  if (typeof error === 'string') {
    // Se já for uma string, retorna a própria string
    return error;
  }
  // Como último recurso, retorna uma mensagem genérica
  return 'Ocorreu um erro desconhecido.';
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
    hour12: false, // formato 24h
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
    hour12: false, // formato 24h
  };

  // 'pt-BR' para formatar corretamente para o Brasil
  const formattedDateTime = new Intl.DateTimeFormat('pt-BR', dateTimeOptions).format(dateObject);
  const formattedDateOnly = new Intl.DateTimeFormat('pt-BR', dateOptions).format(dateObject);
  const formattedTimeOnly = new Intl.DateTimeFormat('pt-BR', timeOptions).format(dateObject);

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


export const formatUserName = (user: { name?: string | null }): string => {
  if (!user || !user.name) {
    return 'Organizador Anônimo';
  }
  return user.name;
};


export const formatOrganizerName = (name?: string | null): string => {
  if (!name || name.trim() === '') {
    return 'Organizador';
  }

  // Limpa, separa e capitaliza todas as palavras do nome
  const words = name
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));

  // Se o nome tem apenas uma palavra
  if (words.length === 1) {
    return words[0].slice(0, 16);
  }

  const firstName = words[0];
  const secondName = words[1];
  
  // Tenta usar os dois primeiros nomes
  const twoFirstNames = `${firstName} ${secondName}`;
  if (twoFirstNames.length <= 16) {
    return twoFirstNames;
  }

  // Se os dois primeiros nomes são muito longos, trunca o segundo
  const truncatedSecondName = `${secondName.charAt(0)}.`;
  const finalName = `${firstName} ${truncatedSecondName}`;
  
  return finalName.slice(0, 16);
};


export const formatEventStatus = (startDateTime: Date) => {
  const now = new Date();
  const eventDate = new Date(startDateTime);

  if (eventDate < now) {
    return { text: 'Evento Concluído', color: 'text-gray-500' };
  }

  const diffInMillis = eventDate.getTime() - now.getTime();
  const diffInHours = Math.ceil(diffInMillis / (1000 * 60 * 60));
  const diffInDays = Math.ceil(diffInHours / 24);

  if (diffInHours < 24) {
    return { 
      text: `Inicia em ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`, 
      color: 'text-orange-500' 
    };
  } else {
    return { 
      text: `Inicia em ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`, 
      color: 'text-yellow-400' 
    };
  }
};


export const formatFullDateTime = (dateString: Date) => {
  const date = new Date(dateString);

  // Formata a data completa
  const datePart = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  // Formata apenas a hora
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(date);

  const finalString = `${datePart}, ${timePart}`;
  
  return finalString.charAt(0).toUpperCase() + finalString.slice(1);
};