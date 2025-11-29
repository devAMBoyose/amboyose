# =========================
# 1) Build stage
# =========================
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Set working directory
WORKDIR /app

# Copy Maven descriptor first (for better caching)
COPY pom.xml .

# Download dependencies (optional but speeds up rebuilds)
RUN mvn -q dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the application (no tests to speed up)
RUN mvn -q clean package -DskipTests

# =========================
# 2) Runtime stage
# =========================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose 8080 (Render will still route to the PORT env)
EXPOSE 8080

# Run the app; Spring Boot will bind to ${PORT} from application.properties
CMD ["java", "-jar", "app.jar"]
