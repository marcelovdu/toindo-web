import { Document, Schema, model, models } from "mongoose";

// Tipos para dados de localização do Google Places
interface ILocationData {
  address: string;
  placeId?: string; // Opcional quando Google API não funciona
  coordinates?: {
    lat: number;
    lng: number;
  };
  formattedAddress?: string;
  addressComponents?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string; // Manter para compatibilidade com eventos existentes
  locationData?: ILocationData; // Novos dados estruturados de localização
  createdAt: Date;
  imageUrl?: string;
  startDateTime: Date;
  price?: string;
  isFree?: boolean;
  link?: string;
  capacity?: number;
  category: { _id: string, name: string }
  organizer: { _id: string, name: string }
  participantCount: number;
}

// Schema para dados de localização
const LocationDataSchema = new Schema({
  address: { type: String, required: true },
  placeId: { type: String, required: false }, // Não obrigatório quando Google API falha
  coordinates: {
    lat: { type: Number, required: false, default: 0 },
    lng: { type: Number, required: false, default: 0 }
  },
  formattedAddress: { type: String, required: false },
  addressComponents: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
  }
}, { _id: false }); // Não criar _id para subdocumento

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String }, // Manter para compatibilidade
  locationData: { type: LocationDataSchema }, // Novos dados estruturados
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String },    
  startDateTime: { type: Date, default: Date.now  },          
  price: { type: String },
  isFree: { type: Boolean, default: true },
  link: { type: String },                       
  capacity: { type: Number },                    
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
})

const Event = models.Event || model('Event', EventSchema);

export default Event;