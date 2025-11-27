package com.example.plantech.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "plantas")
public class Planta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String descricao;
    private Integer frequenciaRegaDias;
    private LocalDate dataUltimaRega;
    private String fotoUrl;
    private Double latitude;
    private Double longitude;
    private String especieIdentificada;
    private Double probabilidadeIdentificacao;
    private LocalDate proximaRega;
    @Column(columnDefinition = "TEXT")
    private String recomendacaoDiaria;

    private boolean acaoDiariaRealizada;

    private LocalDateTime dataUltimaFotoControle;

    private String preferenciaSol;
    private String preferenciaUmidade;

    private LocalDateTime proximaFotoControle;
    private String estadoSaude;

    @Column(columnDefinition = "TEXT")
    private String recomendacaoClimatica;

    private Boolean alertaClimatico; // Novo campo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @jakarta.persistence.OneToMany(mappedBy = "planta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<PlantaHistorico> historico = new java.util.ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public java.util.List<PlantaHistorico> getHistorico() {
        return historico;
    }

    public void setHistorico(java.util.List<PlantaHistorico> historico) {
        this.historico = historico;
    }

    public Integer getFrequenciaRegaDias() {
        return frequenciaRegaDias;
    }

    public void setFrequenciaRegaDias(Integer frequenciaRegaDias) {
        this.frequenciaRegaDias = frequenciaRegaDias;
    }

    public LocalDate getDataUltimaRega() {
        return dataUltimaRega;
    }

    public void setDataUltimaRega(LocalDate dataUltimaRega) {
        this.dataUltimaRega = dataUltimaRega;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
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

    public LocalDate getProximaRega() {
        return proximaRega;
    }

    public void setProximaRega(LocalDate proximaRega) {
        this.proximaRega = proximaRega;
    }

    public String getRecomendacaoDiaria() {
        return recomendacaoDiaria;
    }

    public void setRecomendacaoDiaria(String recomendacaoDiaria) {
        this.recomendacaoDiaria = recomendacaoDiaria;
    }

    public boolean isAcaoDiariaRealizada() {
        return acaoDiariaRealizada;
    }

    public void setAcaoDiariaRealizada(boolean acaoDiariaRealizada) {
        this.acaoDiariaRealizada = acaoDiariaRealizada;
    }

    public LocalDateTime getDataUltimaFotoControle() {
        return dataUltimaFotoControle;
    }

    public void setDataUltimaFotoControle(LocalDateTime dataUltimaFotoControle) {
        this.dataUltimaFotoControle = dataUltimaFotoControle;
    }

    public String getPreferenciaSol() {
        return preferenciaSol;
    }

    public void setPreferenciaSol(String preferenciaSol) {
        this.preferenciaSol = preferenciaSol;
    }

    public String getPreferenciaUmidade() {
        return preferenciaUmidade;
    }

    public void setPreferenciaUmidade(String preferenciaUmidade) {
        this.preferenciaUmidade = preferenciaUmidade;
    }

    public String getRecomendacaoClimatica() {
        return recomendacaoClimatica;
    }

    public void setRecomendacaoClimatica(String recomendacaoClimatica) {
        this.recomendacaoClimatica = recomendacaoClimatica;
    }

    public LocalDateTime getProximaFotoControle() {
        return proximaFotoControle;
    }

    public void setProximaFotoControle(LocalDateTime proximaFotoControle) {
        this.proximaFotoControle = proximaFotoControle;
    }

    public String getEstadoSaude() {
        return estadoSaude;
    }

    public void setEstadoSaude(String estadoSaude) {
        this.estadoSaude = estadoSaude;
    }

    public Boolean getAlertaClimatico() {
        return alertaClimatico;
    }

    public void setAlertaClimatico(Boolean alertaClimatico) {
        this.alertaClimatico = alertaClimatico;
    }
}
