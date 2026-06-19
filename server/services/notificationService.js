const Notification = require('../models/Notification');
const Student = require('../models/Student');

/**
 * Trigger WhatsApp Notification via Meta Cloud API when kitchen marks order as READY
 * @param {Object} order - Mongoose Order Document
 */
const sendOrderReadyNotification = async (order) => {
  try {
    // If order has no studentId (e.g., walk-in customer), skip notification
    if (!order.studentId) {
      console.log(`[Notification Service] Skip: Order #${order.orderNumber} is a walk-in order. No student profile associated.`);
      return;
    }

    // Fetch Student profile details to retrieve name and phone number
    const student = await Student.findById(order.studentId);
    if (!student) {
      console.warn(`[Notification Service] Warn: Student profile not found for Order #${order.orderNumber} (studentId: ${order.studentId}).`);
      return;
    }

    // Check if WhatsApp notifications are disabled by the student
    if (student.receiveWhatsAppNotifications === false) {
      console.log(`[Notification Service] Skip: WhatsApp notifications are disabled in preferences for Student: ${student.name} (${student.rollNumber}).`);
      return;
    }

    const studentName = student.name || order.studentName || 'Student';
    const phoneNumber = student.phoneNumber;
    if (!phoneNumber) {
      console.warn(`[Notification Service] Warn: No phone number found for Student: ${studentName}.`);
      return;
    }

    // Format template message matching specifications
    const message = `🍽️ SmartCanteen\n\nHello ${studentName},\n\nYour Order #${order.orderNumber} is ready for pickup.\n\nPlease collect your order from the canteen counter.`;

    // Phone Number Preprocessing: strip non-digits and add country prefix '91' for India if exactly 10 digits
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    console.log(`[Notification Service] Dispatching Meta WhatsApp Cloud API request for Order #${order.orderNumber} to target phone: ${formattedPhone}`);

    const whatsappToken = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;

    let notificationStatus = 'sent';
    let errorMessage = null;
    let apiResponseText = null;

    if (!whatsappToken || !phoneNumberId) {
      notificationStatus = 'failed';
      errorMessage = 'WhatsApp credentials (WHATSAPP_TOKEN, PHONE_NUMBER_ID) are not configured';
      apiResponseText = JSON.stringify({ error: errorMessage, envConfigured: false });
      console.error(`[Notification Service] Configuration Error: ${errorMessage}`);
    } else {
      try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: {
              body: message
            }
          })
        });

        const responseData = await response.json();
        apiResponseText = JSON.stringify(responseData);

        if (!response.ok) {
          notificationStatus = 'failed';
          errorMessage = responseData.error?.message || `Meta API status error: ${response.status}`;
          console.error(`[Notification Service] Meta Cloud API Failed. Error: ${errorMessage}`);
        } else {
          console.log(`[Notification Service] Meta Cloud API Successful dispatch for Order #${order.orderNumber}`);
        }
      } catch (fetchError) {
        notificationStatus = 'failed';
        errorMessage = fetchError.message;
        apiResponseText = JSON.stringify({ error: fetchError.message });
        console.error(`[Notification Service] Meta Cloud API HTTP dispatch failed. Error: ${fetchError.message}`);
      }
    }

    // Save notification log record to MongoDB
    const log = new Notification({
      orderId: order._id,
      phoneNumber,
      message,
      status: notificationStatus,
      error: errorMessage,
      apiResponse: apiResponseText
    });

    await log.save();
  } catch (error) {
    // Suppress all errors to prevent blocking kitchen workflow
    console.error('[Notification Service] Fatal failure inside Notification Service Layer:', error.message);
  }
};

module.exports = {
  sendOrderReadyNotification
};
