package com.example.plantech.dto;

public class PlantaConfirmacaoDTO {
    private String nome;
    private String descricao;
    private String fotoTemp;
    private String especieIdentificada;
    private Double probabilidadeIdentificacao;
    private Double latitude;
    private Double longitude;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getFotoTemp() {
        return fotoTemp;
    }

    public void setFotoTemp(String fotoTemp) {
        this.fotoTemp = fotoTemp;
    }

    public String getEspecieIdentificada() {
        return especieIdentificada;
    }

    public void setEspecieIdentificada(String especieIdentificada) {
        this.especieIdentificada = especieIdentificada;
    }

    public Double getProbabilidadeIdentificacao() {
        return probabilidadeIdentificacao;
    }

    public void setProbabilidadeIdentificacao(Double probabilidadeIdentificacao) {
        this.probabilidadeIdentificacao = probabilidadeIdentificacao;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
