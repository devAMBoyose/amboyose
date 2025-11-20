# === Build stage ===
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# copy Maven files
COPY pom.xml .
COPY src ./src

# build the jar
RUN mvn -B -DskipTests clean package

# === Run stage ===
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# copy jar from build stage
COPY --from=build /app/target/fx-converter-demo-0.0.1-SNAPSHOT.jar app.jar

# Render will set PORT env; we just expose it for docs
ENV PORT=8080
EXPOSE 8080

# run the app
ENTRYPOINT ["java","-jar","/app/app.jar"]
