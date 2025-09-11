
FROM maven:3.9-eclipse-temurin-24 AS build

WORKDIR /app

COPY demo/pom.xml ./demo/pom.xml
COPY demo/.mvn/ ./.mvn
COPY demo/mvnw .
COPY demo/mvnw.cmd .
RUN ./mvnw -f demo/pom.xml dependency:go-offline

COPY ./demo ./demo
RUN ./mvnw -f demo/pom.xml clean package -DskipTests

FROM eclipse-temurin:24-jre

WORKDIR /app

COPY --from=build /app/demo/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]