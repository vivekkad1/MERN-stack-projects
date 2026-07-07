import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketResponse {
  user: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  responses: ITicketResponse[];
}

const ticketResponseSchema = new Schema<ITicketResponse>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new Schema<ITicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    },
    responses: [ticketResponseSchema]
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
