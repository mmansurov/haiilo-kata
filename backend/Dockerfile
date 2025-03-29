# Build stage
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy Maven wrapper files first
COPY .mvn/ .mvn/
COPY mvnw mvnw.cmd ./
RUN chmod +x mvnw

# Copy pom files for dependency caching
COPY pom.xml .
COPY frontend/pom.xml frontend/
COPY backend/pom.xml backend/
RUN ./mvnw dependency:go-offline

# Copy the rest of the project
COPY . .

# Build the project
RUN ./mvnw clean install -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/backend/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
