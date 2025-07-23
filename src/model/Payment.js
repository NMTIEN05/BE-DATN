import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['vnpay', 'cod', 'momo'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  transactionId: String,         // vnp_TransactionNo
  responseCode: String,          // vnp_ResponseCode
  secureHash: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', paymentSchema);
