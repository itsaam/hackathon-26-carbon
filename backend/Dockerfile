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

# OCR (Tesseract + FR language data) for DPE scan
# `tesseract-ocr-data-fra` provides the `fra` traineddata.
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-fra

COPY --from=builder /build/target/carbon-backend-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
