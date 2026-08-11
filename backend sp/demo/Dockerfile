# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy dependency definition and source code
COPY pom.xml .
COPY src ./src

# Build JAR package skipping tests
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy compiled executable JAR
COPY --from=build /app/target/*.jar app.jar

# Expose default application port
EXPOSE 8080

# Launch application
ENTRYPOINT ["java", "-jar", "app.jar"]
