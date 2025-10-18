"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPinIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationData } from '@/lib/validator';

// Declarações para o Google Maps API
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

interface LocationAutocompleteProps {
  value?: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Digite o endereço do evento",
  className,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(() => value?.address || '');
  const [apiStatus, setApiStatus] = useState<'loading' | 'loaded' | 'failed' | 'disabled'>('loading');

  // Carregar Google Maps API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setApiStatus('disabled');
      return;
    }

    // Verificar se já existe
    if (window.google?.maps?.places?.Autocomplete) {
      setIsGoogleLoaded(true);
      setApiStatus('loaded');
      return;
    }

    // Verificar se script já existe
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Aguardar carregamento do script existente
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          setIsGoogleLoaded(true);
          setApiStatus('loaded');
          clearInterval(checkInterval);
        }
      }, 500);

      // Timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isGoogleLoaded) {
          setApiStatus('failed');
        }
      }, 10000);
      
      return;
    }

    // Criar e carregar script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    const timeoutId = setTimeout(() => {
      setApiStatus('failed');
    }, 15000);

    script.onload = () => {
      clearTimeout(timeoutId);
      // Aguardar API estar disponível
      const checkGoogle = () => {
        if (window.google?.maps?.places?.Autocomplete) {
          setIsGoogleLoaded(true);
          setApiStatus('loaded');
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      setApiStatus('failed');
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isGoogleLoaded]);

  // Inicializar Autocomplete
  useEffect(() => {
    if (!isGoogleLoaded || !inputRef.current || disabled || apiStatus !== 'loaded') {
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'formatted_address', 'name', 'geometry.location', 'address_components']
      });

      autocompleteRef.current = autocomplete;

      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry?.location) return;

        const addressComponents: LocationData['addressComponents'] = {};
        
        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes('route')) {
            addressComponents.street = component.long_name;
          } else if (types.includes('locality')) {
            addressComponents.city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            addressComponents.state = component.long_name;
          } else if (types.includes('country')) {
            addressComponents.country = component.long_name;
          } else if (types.includes('postal_code')) {
            addressComponents.postalCode = component.long_name;
          }
        });

        const locationData: LocationData = {
          address: place.name || place.formatted_address || '',
          placeId: place.place_id || '',
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          formattedAddress: place.formatted_address || '',
          addressComponents
        };

        setInputValue(locationData.address);
        onChange(locationData);
      });

      return () => {
        if (window.google?.maps?.event?.removeListener) {
          window.google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('Erro ao inicializar autocomplete:', error);
      setApiStatus('failed');
    }
  }, [isGoogleLoaded, disabled, onChange, apiStatus]);

  // Sincronizar valor externo
  useEffect(() => {
    const newValue = value?.address || '';
    if (newValue !== inputValue) {
      setInputValue(newValue);
    }
  }, [value?.address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === '') {
      onChange(null);
    } else if (apiStatus !== 'loaded') {
      // Fallback para quando Google não está disponível
      const simpleLocationData: LocationData = {
        address: newValue,
        placeId: undefined, // Deixar undefined ao invés de string vazia
        coordinates: { lat: 0, lng: 0 },
        formattedAddress: newValue,
        addressComponents: {}
      };
      onChange(simpleLocationData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const getStatusMessage = () => {
    switch (apiStatus) {
      case 'loading':
        return <p className="text-xs text-blue-600 mt-1">⏳ Carregando Google Places...</p>;
      case 'loaded':
        return <p className="text-xs text-green-600 mt-1">✓ Google Places ativo</p>;
      case 'failed':
        return <p className="text-xs text-amber-600 mt-1">⚠️ Google Places indisponível - digite manualmente</p>;
      case 'disabled':
        return <p className="text-xs text-gray-500 mt-1">💡 Configure GOOGLE_MAPS_API_KEY para sugestões automáticas</p>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-8 sm:pl-10", className)}
        />
      </div>
      {getStatusMessage()}
    </div>
  );
};