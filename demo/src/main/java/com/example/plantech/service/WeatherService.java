package com.example.plantech.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    private final String API_URL = "https://api.openweathermap.org/data/2.5/weather";

    public String obterClimaAtual(Double lat, Double lon) {
        if (lat == null || lon == null) return "Localização desconhecida";

        try {
            String url = String.format("%s?lat=%s&lon=%s&appid=%s&units=metric&lang=pt_br", API_URL, lat, lon, apiKey);
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
}