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

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name="plantas")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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

    public String getEspecieIdentificada() { return especieIdentificada; }
    public void setEspecieIdentificada(String especieIdentificada) { this.especieIdentificada = especieIdentificada; }

    public Double getProbabilidadeIdentificacao() { return probabilidadeIdentificacao; }
    public void setProbabilidadeIdentificacao(Double probabilidadeIdentificacao) { this.probabilidadeIdentificacao = probabilidadeIdentificacao; }
}
