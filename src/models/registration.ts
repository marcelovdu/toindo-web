import { Schema, model, models, Document } from 'mongoose';

export interface IRegistration extends Document {
  createdAt: Date;
  event: Schema.Types.ObjectId; 
  user: Schema.Types.ObjectId;  
}

const RegistrationSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

const Registration = models.Registration || model('Registration', RegistrationSchema);

export default Registration;