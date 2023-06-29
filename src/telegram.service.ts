import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;

  constructor() {
    const token = "5582847953:AAGEgzhXbLtzzU-MqXtV6iQpXp4_JBMuCPo";
    this.bot = new TelegramBot(token, { polling: true });
  }

  startBot(): void {
    this.bot.onText(/\/start/, (msg) => { // Start command
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'Hello! This bot can show you the weather and time for any city. To use it, please choose an option below:',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Get Weather', callback_data: 'get_weather' }],
            ],
          },
        }
      );
    });

    this.bot.on('callback_query', async (callbackQuery) => {
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      switch (data) {
        case 'get_weather': // get weather
          this.bot.sendMessage(chatId, 'Please enter the name of the city:');
          this.bot.once('message', async (msg) => {
            const city = msg.text;
            try {
              const weatherData = await this.getWeatherData(city); // getWeatherData function
              this.bot.sendMessage(chatId, weatherData);
            } catch (error) {
              this.bot.sendMessage(chatId, 'Error fetching weather data. Please try again later.');
            }
          });
          break;
        
        default:
          break;
      }
    });
  }

  async getWeatherData(city: string): Promise<string> {
    const apiKey = "0b87ec15579019a25f2023a8cc64bcad" // Weather API key
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`); // Featching the data
    const weatherData = response.data;
    const weatherDescription = weatherData.weather[0].description;
    const temperature = Math.round(weatherData.main.temp - 273.15);
    const messageText = `The weather in ${city} is currently ${weatherDescription} with a temperature of ${temperature}°C.`;
    return messageText;
  }

  async getCoordinates(city: string): Promise<{ lat: number; lng: number }> { // Getting the coordinates
    const apiKey = process.env.OPENCAGE_API_KEY;
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
    const results = response.data.results;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry;
      return { lat, lng };
    }
    throw new Error('Could not find coordinates for the specified city.');
  }

  
}
