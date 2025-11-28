# Step 1 — Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy all files
COPY . .

# Build the JAR
RUN mvn clean package -DskipTests

# Step 2 — Run stage
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/bambanking-demo-0.0.1-SNAPSHOT.jar app.jar

# Expose the port used by Render
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "app.jar"]
