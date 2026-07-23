import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    hrUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['import', 'evaluation', 'application', 'shortlist', 'reminder', 'system'],
      default: 'system'
    },
    isRead: { type: Boolean, default: false, index: true },
    link:   { type: String, default: '' }
  },
  { timestamps: true }
);

notificationSchema.methods.toJSON = function () {
  return {
    id:        this._id.toString(),
    title:     this.title,
    message:   this.message,
    type:      this.type,
    isRead:    this.isRead,
    link:      this.link,
    createdAt: this.createdAt
  };
};

export const Notification = mongoose.model('Notification', notificationSchema);

/**
 * Helper to emit a notification for an HR user
 */
export async function sendHRNotification(hrUserId, title, message, type = 'system', link = '') {
  try {
    const notif = new Notification({ hrUserId, title, message, type, link });
    await notif.save();
    return notif;
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
}
