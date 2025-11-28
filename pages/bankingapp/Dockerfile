# Use official Java 17 runtime
FROM eclipse-temurin:17-jdk-alpine

# Set working directory inside container
WORKDIR /app

# Copy built JAR from target (Render will run mvn package first)
COPY target/*.jar app.jar

# Expose Render's internal port (Spring Boot will bind automatically using ${PORT})
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
