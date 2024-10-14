import axios from "axios";

// Load environment variables from the .env file
import dotenv from "dotenv";
dotenv.config();

interface SendSmsResponse {
  status: string;
  message: string;
}

export const sendSms = async (
  to: number,
  message: string
): Promise<SendSmsResponse> => {
  const { SMS_USERNAME, SMS_PASSWORD, SMS_FROM } = process.env;

  if (!SMS_USERNAME || !SMS_PASSWORD || !SMS_FROM) {
    throw new Error("Missing SMS credentials in environment variables");
  }

  try {
    // Prepare the data for the POST request
    const data = {
      UserName: SMS_USERNAME,
      Password: SMS_PASSWORD,
      From: SMS_FROM,
      To: to, // The recipient's phone number
      Message: message, // The message you want to send
    };

    // Make the POST request to the SMS API
    const response = await axios.post<SendSmsResponse>(
      "http://login.niazpardaz.com/SMSInOutBox/Send",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Handle the response
    if (response.data) {
      return response.data;
    } else {
      throw new Error("Message failed to send");
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
