"use client"

// Componentes do Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, MapPinIcon, UploadIcon, CheckCircleIcon} from "lucide-react"
import { PartyPopper, Utensils, Music, TreePalm, Volleyball, Footprints, Palette, Gamepad2, BookOpen, Sparkles } from 'lucide-react';

// Importações do React e etc
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { eventFormSchema } from "@/lib/validator";
import { useEffect } from "react";
import { defaultEventImageUrl } from '@/constants';
import { IEvent } from "@/models/event"
import { ICategory } from '@/models/category'; 
import { createEvent, updateEvent } from '@/lib/actions/event.actions';

// Lista de categorias
const iconMap: { [key: string]: React.ElementType } = {
        'Comemoração': PartyPopper,
        'Esporte': Volleyball,
        'Música': Music,
        'Comida & Bebida': Utensils,
        'Hobby': Gamepad2,
        'Arte & Cultura': Palette,
        'Ar livre': TreePalm,
        'Passeios': Footprints,
        'Conhecimento': BookOpen,
        'Outros': Sparkles,
    };

type EventFormProps = {
  userId: string
  type: "Create" | "Update"
  event?: IEvent,
  eventId?: string
  categories: ICategory[];
}

export default function EventForm({ userId, type, event, eventId, categories }: EventFormProps) {

  // Mensagem para testar se o formulário está se desmontando
  useEffect(() => {
    console.log(`%c!!! FORMULÁRIO MONTOU EM MODO: ${type.toUpperCase()} !!!`, "color: blue; font-size: 16px;");
  }, [type]);
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEventId, setNewEventId] = useState<string | null>(null);
 
const initialValues = type === 'Update' && event
  ? { 
      ...event, 
      startDateTime: new Date(event.startDateTime),
      category: event.category._id 
    }
  : { // Valores padrão para o modo 'Create'
      title: "",
      category: "",
      description: "",
      startDateTime: undefined,
      location: "",
      price: "",
      isFree: true,
      capacity: 10,
      imageUrl: undefined,
    };

const form = useForm<z.infer<typeof eventFormSchema>>({
  resolver: zodResolver(eventFormSchema),
  defaultValues: initialValues,
  shouldUnregister: false,
});

  const [formData, setFormData] = useState(() => form.getValues());

  useEffect(() => {
    form.reset(formData);
  }, [currentStep, form, formData]);

  const watchedValues = form.watch();

  const totalSteps = 6
  const progress = currentStep <= 5 ? (currentStep / 5) * 100 : 100

  const handleNext = async () => {
    let fieldsToValidate: (keyof z.infer<typeof eventFormSchema>)[] = [];

    switch (currentStep) {
      case 1: fieldsToValidate = ['title']; break;
      case 2: fieldsToValidate = ['category']; break;
      case 3: fieldsToValidate = ['description']; break;
      case 4: fieldsToValidate = ['startDateTime', 'location']; break;
      case 5: fieldsToValidate = ['price', 'isFree', 'capacity', 'imageUrl']; break;
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      const currentValues = form.getValues();
      setFormData(prevData => ({ ...prevData, ...currentValues }));
      if (currentStep === 5) {
        await handleSubmitFinal();
      } else if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    const currentValues = form.getValues();
    setFormData(prevData => ({ ...prevData, ...currentValues }));
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

const handleSubmitFinal = async () => {
  setIsSubmitting(true);

  const finalData = form.getValues();

  const eventDataToSend = {
    ...finalData,
    description: finalData.description ?? '',
    location: finalData.location ?? '',
    price: finalData.price ?? '0',
    imageUrl: finalData.imageUrl || defaultEventImageUrl,
  };

  if (type === 'Create') {
    try {
      const newEvent = await createEvent({
        event: eventDataToSend,
        userId: userId,
        path: '/events'
      });

      if (newEvent) {
        setNewEventId(newEvent._id);
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Falha ao criar evento:", error);
      alert("Houve um erro ao publicar seu evento.");
    }
  }

  if (type === 'Update') {
    if (!eventId) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      const updatedEvent = await updateEvent({
        userId: userId,
        event: { ...eventDataToSend, _id: eventId },
        path: `/events/${eventId}`
      });

      if (updatedEvent) {
        setNewEventId(updatedEvent._id);
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Falha ao atualizar evento:", error);
      alert("Houve um erro ao atualizar seu evento.");
    }
  }

  setIsSubmitting(false);
};

  // Mensagem que visualiza a construção do objeto no console
  console.log("Valores atuais do formulário:", watchedValues);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base md:text-lg">Primeiro, o que você quer marcar?</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">
                      Título do evento
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Churrasquinho de quinta"
                        {...field}
                        className="text-sm sm:text-base h-9 sm:h-10 md:h-12"
                      />
                    </FormControl>
                    <FormMessage className="pt-1 sm:pt-2" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )

        case 2:
          return (
            <Card className="border-0 bg-white shadow-none">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base md:text-lg">Qual a melhor categoria para seu evento?</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">
                        Selecione uma categoria
                      </FormLabel>
                      <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3"
                      >
                        {categories.map((category) => {
                          const IconComponent = iconMap[category.name] || Sparkles;

                          return (
                            <ToggleGroupItem
                              key={category._id}
                              value={category._id}
                              className="flex flex-col items-center justify-center gap-1 sm:gap-2 h-16 sm:h-18 md:h-20 w-full min-w-0 data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-300 p-1 sm:p-2"
                            >
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                              <span className="text-[10px] sm:text-xs text-center leading-tight break-words hyphens-auto">
                                {category.name}
                              </span>
                            </ToggleGroupItem>
                          );
                        })}
                      </ToggleGroup>
                      </FormControl>
                      <FormMessage className="pt-2 text-center" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )

          case 3:
            return (
              <Card className="border-0 bg-white shadow-none">
                <CardHeader>
                  <CardTitle>Ótima escolha! Agora, descreva o seu evento.</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium mb-2 block">
                          Descrição
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte os detalhes mais importantes do seu evento..."
                            {...field} 
                            rows={6}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage className="pt-2" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )

case 4:
  return (
    <Card className="border-0 bg-white shadow-none overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm sm:text-base md:text-lg">Quando e onde vai acontecer?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">

        {/* === Campo de Data e Hora === */}
        <FormField
          control={form.control}
          name="startDateTime"
          render={({ field }) => {
            
            const isValidDate = field.value instanceof Date && !isNaN(field.value.getTime());

            return (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium mb-2 block">Início do evento</FormLabel>
                <FormControl>
                  <div className="w-full relative">
                    <DatePicker
                      selected={isValidDate ? field.value : null}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="dd/MM/yyyy - HH:mm"
                      timeInputLabel="Hora:"
                      locale={ptBR}
                      wrapperClassName="w-full"
                      popperClassName="z-50"
                      popperPlacement="bottom-start"
                      customInput={
                        <Button variant="outline" className={cn(
                          "w-full justify-start text-left font-normal text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12",
                          !isValidDate && "text-muted-foreground"
                        )}>
                          <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {isValidDate ? format(field.value, "PPP 'às' HH:mm", { locale: ptBR }) : "Selecione data e hora"}
                          </span>
                        </Button>
                      }
                    />
                  </div>
                </FormControl>
                <FormMessage className="pt-1" />
              </FormItem>
            );
          }}
        />

        {/* === Campo de Localização === */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium mb-2 block">Localização</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="Endereço do evento"
                    {...field}
                    className="pl-8 sm:pl-10 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12"
                  />
                </div>
              </FormControl>
              <FormMessage className="pt-1" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
        case 5:
          return (
            <Card className="border-0 bg-white shadow-none">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base md:text-lg">Estamos quase lá! Apenas alguns detalhes finais.</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:gap-8 lg:gap-12">
                  {/* === Coluna da Esquerda === */}
                  <div className="flex-1 md:w-3/5 flex flex-col space-y-6 sm:space-y-8">
                    
                    {/* Seção de Custo e Gratuidade */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">Custo</FormLabel>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0,00"
                                {...field}
                                disabled={form.watch('isFree')}
                                className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                              />
                            </FormControl>
                            <FormField
                              control={form.control}
                              name="isFree"
                              render={({ field: isFreeField }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Switch
                                      checked={isFreeField.value}
                                      onCheckedChange={(checked) => {
                                        isFreeField.onChange(checked);
                                        if (checked) {
                                          form.setValue('price', '');
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-xs sm:text-sm whitespace-nowrap !mt-0">Evento gratuito</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormMessage className="pt-1 sm:pt-2"/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">Capacidade: {field.value ?? 5} pessoas</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value ?? 5]}
                              onValueChange={(value) => field.onChange(value[0])}
                              min={5}
                              max={20}
                              step={1}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="pt-1 sm:pt-2"/>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Coluna da Direita === */}
                  <div className="flex-shrink-0 md:w-2/5 flex flex-col items-center justify-center mt-6 md:mt-0">
                    {/* Seção de Imagem */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                          <FormLabel className="text-xs sm:text-sm font-medium">Imagem do evento</FormLabel>
                          <FormControl>
                            <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                              <UploadIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-1 sm:mb-2 pointer-events-none" />
                              <span className="text-[10px] sm:text-xs text-muted-foreground text-center pointer-events-none leading-tight px-1 sm:px-2">
                                Clique ou arraste
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-lg"
                                onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="pt-1 sm:pt-2"/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )     


case 6:
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
        <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-gray-900">
          {type === 'Create' ? 'Evento criado com sucesso!' : 'Evento atualizado com sucesso!'}
        </h2>
        <p className="text-muted-foreground">
          Seu evento já está visível para a comunidade. O que você gostaria de fazer agora?
        </p>

        {/* --- Botões Dinâmicos --- */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link href="/home">
            <Button variant="outline" size="lg" className="w-full">
              Voltar para Home
            </Button>
          </Link>
          
          {/* O botão só aparece se o newEventId existir */}
          {newEventId && (
            <Link href={`/events/${newEventId}`}>
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Ir para o Evento
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
        

      default:
        return null
    }
  }
return (
  <Form {...form}>
    <div className="min-h-screen -mt-8 sm:-mt-12 bg-dark-2 p-3 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-2xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 mx-auto rounded-2xl sm:rounded-3xl bg-green-500 overflow-hidden">
        {currentStep <= 5 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-50">
                {type === 'Create' ? 'Criar Evento' : 'Atualizar Evento'}
              </h1>
              <span className="text-xs sm:text-sm text-white">Passo {currentStep} de 5</span>
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>
        )}

        <div className="mb-6 sm:mb-8 relative">{renderStepContent()}</div>

        {currentStep <= 5 && (
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <Button 
              className="bg-white text-black hover:bg-black hover:text-white text-sm sm:text-base h-9 sm:h-10 w-full sm:w-auto px-6" 
              variant="secondary" 
              onClick={handleBack} 
              disabled={currentStep === 1}
            >
              Voltar
            </Button>
            <Button 
              className="bg-white text-black hover:bg-black hover:text-white text-sm sm:text-base h-9 sm:h-10 w-full sm:w-auto px-6" 
              onClick={handleNext} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : (currentStep === 5 ? (type === 'Create' ? 'Publicar Evento' : 'Atualizar Evento') : 'Avançar')}
            </Button>
          </div>
        )}
      </div>
    </div>
  </Form>
)
}
