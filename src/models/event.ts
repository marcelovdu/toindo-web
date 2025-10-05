import { Document, Schema, model, models } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string;
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

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
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