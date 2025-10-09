import { Schema, model, models, Document } from 'mongoose';

export interface IRegistration extends Document {
  createdAt: Date;
  event: Schema.Types.ObjectId; 
  user?: Schema.Types.ObjectId;     
  guestIdentifier?: string;       
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
    required: false,
  },
  guestIdentifier: {
    type: String,
    required: false,
  },
});

// Validador para garantir que temos ou um usuário ou um convidado, mas não ambos.
RegistrationSchema.pre('validate', function(next) {
  if (this.user && this.guestIdentifier) {
    next(new Error('A inscrição não pode ter um usuário e um convidado ao mesmo tempo.'));
  } else if (!this.user && !this.guestIdentifier) {
    next(new Error('A inscrição precisa de um usuário ou de um nome de convidado.'));
  } else {
    next();
  }
});

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true, sparse: true });

const Registration = models.Registration || model('Registration', RegistrationSchema);

export default Registration;