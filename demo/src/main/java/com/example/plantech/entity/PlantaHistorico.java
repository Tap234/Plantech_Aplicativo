package com.example.plantech.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "planta_historico")
public class PlantaHistorico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dataRegistro;
    private String fotoUrl;

    private String tipoAcao; // "FOTO_CONTROLE", "REGA", "ADUBACAO", "DIAGNOSTICO"

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 1000)
    private String condicaoTempo;

    @Column(columnDefinition = "TEXT")
    private String diagnosticoIA;

    @Column(columnDefinition = "TEXT")
    private String recomendacaoCurativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planta_id")
    @JsonBackReference
    private Planta planta;

    public PlantaHistorico() {
        this.dataRegistro = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDateTime dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public String getTipoAcao() {
        return tipoAcao;
    }

    public void setTipoAcao(String tipoAcao) {
        this.tipoAcao = tipoAcao;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCondicaoTempo() {
        return condicaoTempo;
    }

    public void setCondicaoTempo(String condicaoTempo) {
        this.condicaoTempo = condicaoTempo;
    }

    public String getDiagnosticoIA() {
        return diagnosticoIA;
    }

    public void setDiagnosticoIA(String diagnosticoIA) {
        this.diagnosticoIA = diagnosticoIA;
    }

    public String getRecomendacaoCurativa() {
        return recomendacaoCurativa;
    }

    public void setRecomendacaoCurativa(String recomendacaoCurativa) {
        this.recomendacaoCurativa = recomendacaoCurativa;
    }

    public Planta getPlanta() {
        return planta;
    }

    public void setPlanta(Planta planta) {
        this.planta = planta;
    }
}