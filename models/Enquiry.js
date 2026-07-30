import mongoose from 'mongoose';

/**
 * Contact-form message.
 *
 * The form has to land somewhere real — a submit button that validates and then
 * discards the message is worse than no form at all. Enquiries are readable
 * from the admin panel.
 */
const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: 'General', trim: true },
    message: { type: String, required: true, trim: true },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
