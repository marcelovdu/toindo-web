import { Document, Schema, model, models } from "mongoose";
import { IEvent } from './event'; // Importe a interface do Evento
import { IUser } from '@/models/user';   // Importe a interface do Usuário

export interface IInvitation extends Document {
  _id: string;
  event: IEvent;                     
  organizer: IUser;                  
  guestIdentifier: string;
  status: 'pending' | 'accepted' | 'denied' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}


const InvitationSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  guestIdentifier: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'denied', 'expired'], 
    default: 'pending' 
  },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true 
});

const Invitation = models.Invitation || model('Invitation', InvitationSchema);

export default Invitation;