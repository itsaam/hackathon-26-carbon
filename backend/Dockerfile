# Stage 1: build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

COPY pom.xml .
RUN apk add --no-cache maven && mvn dependency:go-offline -B

COPY src ./src
RUN mvn -DskipTests package -B

# Stage 2: run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/carbon-backend-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
