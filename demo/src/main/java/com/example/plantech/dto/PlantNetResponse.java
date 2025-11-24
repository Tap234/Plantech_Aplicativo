package com.example.plantech.dto;

import java.util.List;

public class PlantNetResponse {
    private List<Result> results;

    public List<Result> getResults() { return results; }
    public void setResults(List<Result> results) { this.results = results; }

    public static class Result {
        private Double score;
        private Species species;

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Species getSpecies() { return species; }
        public void setSpecies(Species species) { this.species = species; }
    }

    public static class Species {
        private String scientificNameWithoutAuthor;
        private List<String> commonNames;

        public String getScientificNameWithoutAuthor() { return scientificNameWithoutAuthor; }
        public void setScientificNameWithoutAuthor(String scientificNameWithoutAuthor) { this.scientificNameWithoutAuthor = scientificNameWithoutAuthor; }
        public List<String> getCommonNames() { return commonNames; }
        public void setCommonNames(List<String> commonNames) { this.commonNames = commonNames; }
    }
}