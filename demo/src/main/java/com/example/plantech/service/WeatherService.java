package com.example.plantech.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    private final String API_URL_CURRENT = "https://api.openweathermap.org/data/2.5/weather";
    private final String API_URL_FORECAST = "https://api.openweathermap.org/data/2.5/forecast";

    public String obterClimaAtual(Double lat, Double lon) {
        if (lat == null || lon == null)
            return "Localização desconhecida";
        try {
            String url = String.format("%s?lat=%s&lon=%s&appid=%s&units=metric&lang=pt_br", API_URL_CURRENT, lat, lon,
                    apiKey);
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            JSONObject json = new JSONObject(response);
            double temp = json.getJSONObject("main").getDouble("temp");
            String desc = json.getJSONArray("weather").getJSONObject(0).getString("description");
            return String.format("%.1f°C, %s", temp, desc);
        } catch (Exception e) {
            return "Erro ao obter clima";
        }
    }

    public String obterPrevisao(Double lat, Double lon) {
        if (lat == null || lon == null)
            return "Sem localização";
        try {
            // Busca previsão para os próximos dias/horas
            String url = String.format("%s?lat=%s&lon=%s&appid=%s&units=metric&lang=pt_br&cnt=3", API_URL_FORECAST, lat,
                    lon, apiKey);
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            JSONObject json = new JSONObject(response);
            // Pega a primeira previsão da lista
            JSONObject firstItem = json.getJSONArray("list").getJSONObject(0);
            String desc = firstItem.getJSONArray("weather").getJSONObject(0).getString("description");
            double temp = firstItem.getJSONObject("main").getDouble("temp");

            return String.format("Previsão: %.1f°C, %s", temp, desc);
        } catch (Exception e) {
            // e.printStackTrace(); // Descomente para debug se necessário
            return "Previsão indisponível";
        }
    }

    public String obterDadosClimaticosDetalhados(Double lat, Double lon) {
        if (lat == null || lon == null) {
            System.out.println("--- DEBUG WEATHER: Lat/Lon is null ---");
            return "Localização desconhecida";
        }
        try {
            String url = String.format("%s?lat=%s&lon=%s&appid=%s&units=metric&lang=pt_br", API_URL_CURRENT, lat, lon,
                    apiKey);
            System.out.println("--- DEBUG WEATHER URL: " + url.replace(apiKey, "API_KEY_HIDDEN") + " ---");

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("--- DEBUG WEATHER RESPONSE: " + response + " ---");

            JSONObject json = new JSONObject(response);
            double temp = json.getJSONObject("main").getDouble("temp");
            double humidity = json.getJSONObject("main").getDouble("humidity");
            String desc = json.getJSONArray("weather").getJSONObject(0).getString("description");
            double windSpeed = json.getJSONObject("wind").getDouble("speed");

            return String.format("Temperatura: %.1f°C, Condição: %s, Umidade: %.0f%%, Vento: %.1f m/s", temp, desc,
                    humidity, windSpeed);
        } catch (Exception e) {
            System.err.println("--- ERROR WEATHER API ---");
            e.printStackTrace();
            return "Dados climáticos indisponíveis: " + e.getMessage();
        }
    }
}