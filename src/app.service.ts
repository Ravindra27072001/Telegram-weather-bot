import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

@Injectable()
export class AppService {
  private bot: TelegramBot;

  constructor() {
    const token = "5582847953:AAGEgzhXbLtzzU-MqXtV6iQpXp4_JBMuCPo"; // Token
    this.bot = new TelegramBot(token, { polling: true });
  }

  startBot(): void {
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        'Hello! This bot can show you the weather of any city. To use it, please choose an option below:',
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

      // console.log(chatId, data)

      switch (data) {
        case 'get_weather':
          this.bot.sendMessage(chatId, 'Please enter the name of the city:');
          this.bot.once('message', async (msg) => {
            const city = msg.text;
            try {
              const weatherData = await this.getWeatherData(city);
              this.bot.sendMessage(chatId, weatherData);
            } catch (error) {
              this.bot.sendMessage(chatId, `Faild to fetch weather data of ${city}. Please try again later.`);
            }
          });
          break;

        default:
          break;
      }
    });
  }

  async getWeatherData(city: string): Promise<string> {
    const apiKey = "0b87ec15579019a25f2023a8cc64bcad" // Weather api key
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
    // console.log(response.data);
    const weatherData = response.data;
    const weatherDescription = weatherData.weather[0].description;
    const temperature = Math.round(weatherData.main.temp - 273.15);
    const messageText = `The weather in ${city} is currently ${weatherDescription} with a temperature of ${temperature}°C.`;
    return messageText;
  }
}
