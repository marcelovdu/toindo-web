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
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(() => value?.address || '');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar a API do Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não está configurada');
      setIsLoading(false);
      return;
    }

    // Verificar se já foi carregado
    if (window.google?.maps?.places?.Autocomplete) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Timeout para não ficar carregando indefinidamente
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      console.warn('Timeout ao carregar Google Maps API');
    }, 15000); // 15 segundos

    // Verificar se já existe um script carregando
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      console.log('Google Maps script já existe, aguardando carregamento...');
      const checkExistingApi = (attempts = 0) => {
        if (window.google?.maps?.places?.Autocomplete) {
          setIsLoaded(true);
          setIsLoading(false);
        } else if (attempts < 100) { // Tentar por 10 segundos
          setTimeout(() => checkExistingApi(attempts + 1), 100);
        } else {
          console.error('Script existente mas API não carregou');
          setIsLoading(false);
        }
      };
      checkExistingApi();
      return;
    }

    // Carregar script do Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Aguardar a API estar completamente carregada
      const checkApiLoaded = (attempts = 0) => {
        if (window.google?.maps?.places?.Autocomplete) {
          clearTimeout(timeoutId);
          setIsLoaded(true);
          setIsLoading(false);
        } else if (attempts < 50) { // Tentar por 5 segundos (50 * 100ms)
          setTimeout(() => checkApiLoaded(attempts + 1), 100);
        } else {
          clearTimeout(timeoutId);
          console.error('Google Maps API carregada mas Places não está disponível');
          setIsLoading(false);
        }
      };
      
      checkApiLoaded();
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error('Erro ao carregar Google Maps API');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup - remover script se necessário
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Inicializar o Autocomplete quando a API estiver carregada
  useEffect(() => {
    if (!isLoaded || !inputRef.current || disabled) return;

    // Verificar se o Google Maps e Places API estão realmente disponíveis
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn('Google Places Autocomplete não está disponível');
      return;
    }

    try {
      // Configurar o autocomplete para retornar apenas estabelecimentos e endereços
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        fields: [
          'place_id', 
          'formatted_address', 
          'name', 
          'geometry.location',
          'address_components'
        ]
      });

      autocompleteRef.current = autocomplete;

      // Listener para quando um lugar é selecionado
      const placeChangedListener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry?.location) {
          console.warn('Local selecionado não tem informações de localização');
          return;
        }

        // Extrair componentes do endereço
        const addressComponents: LocationData['addressComponents'] = {};
        
        if (place.address_components) {
          place.address_components.forEach((component) => {
            const types = component.types;
            
            if (types.includes('route')) {
              addressComponents.street = component.long_name;
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
              addressComponents.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              addressComponents.state = component.long_name;
            } else if (types.includes('country')) {
              addressComponents.country = component.long_name;
            } else if (types.includes('postal_code')) {
              addressComponents.postalCode = component.long_name;
            }
          });
        }

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

      // Cleanup
      return () => {
        if (placeChangedListener) {
          google.maps.event.removeListener(placeChangedListener);
        }
      };
    } catch (error) {
      console.error('Erro ao inicializar Google Places Autocomplete:', error);
    }
  }, [isLoaded, disabled, onChange]);

  // Atualizar o valor do input quando o valor externo mudar
  useEffect(() => {
    const newValue = value?.address || '';
    if (newValue !== inputValue) {
      setInputValue(newValue);
    }
  }, [value?.address, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Se o campo foi limpo, resetar a seleção
    if (newValue === '') {
      onChange(null);
    } else if (!isLoaded) {
      // Se a API não carregou, criar um objeto locationData simples
      const simpleLocationData: LocationData = {
        address: newValue,
        placeId: '',
        coordinates: { lat: 0, lng: 0 },
        formattedAddress: newValue,
        addressComponents: {}
      };
      onChange(simpleLocationData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir submit do form quando pressionar Enter no autocomplete
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground animate-pulse" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Carregando Google Maps..."
          disabled={disabled}
          className={cn("pl-8 sm:pl-10", className)}
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pl-8 sm:pl-10", className)}
        />
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ API do Google Maps não configurada. Digite o endereço manualmente.
          </p>
        )}
      </div>
    );
  }

  return (
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
      {isLoaded && window.google?.maps?.places?.Autocomplete && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Google Places ativo - digite para ver sugestões
        </p>
      )}
    </div>
  );
};