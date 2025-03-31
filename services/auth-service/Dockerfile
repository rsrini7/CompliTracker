FROM openjdk:17-slim

WORKDIR /app

# Add Spring Boot application
COPY target/*.jar app.jar

# Add Prometheus JMX exporter agent
ADD https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.17.2/jmx_prometheus_javaagent-0.17.2.jar /app/jmx_prometheus_javaagent.jar
COPY config.yml /app/config.yml

# Environment variables
ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE=docker

# Expose the application port
EXPOSE 8080

# Start the application with Prometheus JMX exporter
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -javaagent:/app/jmx_prometheus_javaagent.jar=9404:/app/config.yml -jar app.jar"]