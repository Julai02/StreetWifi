import axios from 'axios';
import crypto from 'crypto';

class PayHeroService {
  constructor() {
    this.apiKey = process.env.PAYHERO_API_KEY;
    this.apiSecret = process.env.PAYHERO_API_SECRET;
    this.shortcode = process.env.PAYHERO_SHORTCODE;
    this.baseURL = 'https://api.payheroglobal.com/api/v2';
  }

  /**
   * Initiate STK Push for device (device-based captive portal)
   * @param {string} deviceMac - Device MAC address (reference)
   * @param {number} amount - Amount in KES
   * @param {string} paymentId - Payment ID
   * @returns {Promise} PayHero response
   */
  async initiateStkPush(deviceMac, amount, paymentId) {
    try {
      // For captive portal, use device MAC as account reference
      const requestData = {
        phone_number: '254700000000',  // Placeholder - will be updated in portal
        amount: amount,
        account_reference: deviceMac,  // Device MAC as reference
        transaction_description: `StreetWifi WiFi Access - ${deviceMac}`,
      };

      const response = await axios.post(
        `${this.baseURL}/stk-push/request`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Key': this.apiKey,
          },
          auth: {
            username: this.shortcode,
            password: this.apiSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        checkoutRequestId: response.data.checkout_request_id || response.data.id,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('PayHero STK Push Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    }
  }

  /**
   * Initiate STK Push with phone number (for user-provided numbers)
   * @param {string} phoneNumber - Customer phone number (254xxxxxxxxx)
   * @param {number} amount - Amount in KES
   * @param {string} deviceMac - Device MAC address
   * @returns {Promise} PayHero response
   */
  async initiateStkPushWithPhone(phoneNumber, amount, deviceMac) {
    try {
      const requestData = {
        phone_number: this.formatPhoneNumber(phoneNumber),
        amount: amount,
        account_reference: deviceMac,
        transaction_description: `StreetWifi WiFi Access - ${deviceMac}`,
      };

      const response = await axios.post(
        `${this.baseURL}/stk-push/request`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Key': this.apiKey,
          },
          auth: {
            username: this.shortcode,
            password: this.apiSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
        checkoutRequestId: response.data.checkout_request_id || response.data.id,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('PayHero STK Push Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    }
  }

  /**
   * Query payment status
   * @param {string} transactionId - PayHero transaction ID
   * @returns {Promise} Transaction status
   */
  async queryPaymentStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payment/query/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Key': this.apiKey,
          },
          auth: {
            username: this.shortcode,
            password: this.apiSecret,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('PayHero Query Error:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }

  /**
   * Verify PayHero callback signature from request
   * @param {object} req - Express request object
   * @returns {boolean} True if signature is valid
   */
  async verifySignature(req) {
    try {
      const signature = req.headers['x-payhero-signature'];
      if (!signature) {
        return true; // Allow if no signature provided (dev mode)
      }

      const callbackData = req.body;
      const dataString = JSON.stringify(callbackData, Object.keys(callbackData).sort());
      
      const expectedSignature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(dataString)
        .digest('base64');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Callback signature verification error:', error.message);
      return true; // Allow in case of error for now
    }
  }

  /**
   * Format phone number to PayHero format (254xxxxxxxxx)
   * @param {string} phoneNumber - Phone number in any format
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.replace(/\D/g, '');
    if (formatted.startsWith('07') || formatted.startsWith('01')) {
      formatted = '254' + formatted.substring(1);
    } else if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    return formatted;
  }
}

export default new PayHeroService();
