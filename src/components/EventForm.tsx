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
      // Mapeia o ID da categoria que vem do DB para o campo 'category' do formulário
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
  // Use a variável de valores iniciais aqui
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
        //await handleSubmitFinal({ ...formData, ...currentValues });
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

  // --- LÓGICA CONDICIONAL ADICIONADA AQUI ---
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
      // Segurança: se não houver eventId, não faz nada e volta
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

  setIsSubmitting(false); // Movido para fora para executar em ambos os casos
};

  // Mensagem que visualiza a construção do objeto no console
  console.log("Valores atuais do formulário:", watchedValues);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader >
              <CardTitle>Primeiro, o que você quer marcar?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 py-8">
              <div className="max-w-md mx-auto rounded-2xl bg-white">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Título do evento"
                        {...field}
                        className="text-center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </CardContent>
          </Card>
        )

        case 2:
          return (
            <Card className="border-0 bg-white shadow-none">
              <CardHeader>
                <CardTitle>Qual a melhor categoria para seu evento?</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium mb-3 block">
                        Selecione uma categoria
                      </FormLabel>
                      <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-5 gap-3"
                      >
                        {/* Mapeia as categorias que vêm do BANCO DE DADOS (via props) */}
                        {categories.map((category) => {
                          // Procura o ícone correspondente no nosso mapa
                          const IconComponent = iconMap[category.name] || Sparkles; // Usa Sparkles como fallback

                          return (
                            <ToggleGroupItem
                              key={category._id}
                              value={category._id} // <-- O VALOR É O _ID DO BANCO DE DADOS!
                              className="flex flex-col items-center justify-center gap-2 h-20 w-24 data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-300"
                            >
                              <IconComponent className="h-5 w-5" />
                              <span className="text-xs text-center">{category.name}</span>
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
    <Card className="border-0 bg-white shadow-none">
      <CardHeader>
        <CardTitle>Quando e onde vai acontecer?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* === Campo de Data e Hora === */}
        <FormField
          control={form.control}
          name="startDateTime"
          render={({ field }) => {
            
            const isValidDate = field.value instanceof Date && !isNaN(field.value.getTime());

            return (
              <FormItem>
                <FormLabel className="text-sm font-medium mb-2 block">Início do evento</FormLabel>
                <FormControl>
                  <div className="w-full">
                    <DatePicker
                      selected={isValidDate ? field.value : null}
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      dateFormat="dd/MM/yyyy - HH:mm"
                      timeInputLabel="Hora:"
                      locale={ptBR}
                      wrapperClassName="w-full"
                      customInput={
                        <Button variant="outline" className={cn(
                          "w-full justify-start text-left font-normal",
                          !isValidDate && "text-muted-foreground"
                        )}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {isValidDate ? format(field.value, "PPP 'às' HH:mm", { locale: ptBR }) : "Selecione data e hora"}
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
              <FormLabel className="text-sm font-medium mb-2 block">Localização</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Endereço do evento"
                    {...field}
                    className="pl-10"
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
                <CardTitle>Estamos quase lá! Apenas alguns detalhes finais.</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:gap-12">
                  {/* === Coluna da Esquerda (60%) === */}
                  <div className="md:w-3/5 flex flex-col space-y-8">
                    
                    {/* Seção de Custo e Gratuidade */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium mb-3 block">Custo</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0,00"
                                {...field}
                                disabled={form.watch('isFree')}
                                className="flex-1"
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
                                  <FormLabel className="text-sm whitespace-nowrap !mt-0">Evento gratuito</FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormMessage className="pt-2"/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium mb-3 block">Capacidade: {field.value ?? 5} pessoas</FormLabel>
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
                          <FormMessage className="pt-2"/>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* === Coluna da Direita (40%) === */}
                  <div className="md:w-2/5 flex flex-col items-center justify-center mt-8 md:mt-0">
                    {/* Seção de Imagem */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-4">
                          <FormLabel className="text-sm font-medium">Imagem do evento</FormLabel>
                          <FormControl>
                            {/* Aqui pode usar o componente FileUploader ou um input simples */}
                            <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg w-28 h-28 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                              <UploadIcon className="h-8 w-8 text-muted-foreground mb-2 pointer-events-none" />
                              <span className="text-xs text-muted-foreground text-center pointer-events-none leading-tight px-2">
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
                          <FormMessage className="pt-2"/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )     

      // Dentro da função renderStepContent()

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
    <div className="min-h-screen -mt-12 bg-dark-2 p-6">
      <div className="max-w-2xl p-16 mx-auto rounded-3xl bg-green-500">
        {currentStep <= 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-slate-50">
                {/* --- MUDANÇA 1: Título dinâmico --- */}
                {type === 'Create' ? 'Criar Evento' : 'Atualizar Evento'}
              </h1>
              <span className="text-sm text-white">Passo {currentStep} de 5</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="mb-8">{renderStepContent()}</div>

        {currentStep <= 5 && (
          <div className="flex justify-between">
            <Button className="bg-white text-black hover:bg-black hover:text-white" variant="secondary" onClick={handleBack} disabled={currentStep === 1}>
              Voltar
            </Button>
            <Button className="bg-white text-black hover:bg-black hover:text-white" onClick={handleNext} disabled={isSubmitting}>
              {/* --- MUDANÇA 2: Texto do botão dinâmico --- */}
              {isSubmitting ? 'Enviando...' : (currentStep === 5 ? (type === 'Create' ? 'Publicar Evento' : 'Atualizar Evento') : 'Avançar')}
            </Button>
          </div>
        )}
      </div>
    </div>
  </Form>
)
}
