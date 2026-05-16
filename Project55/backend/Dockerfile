FROM registry.cn-hangzhou.aliyuncs.com/acs/maven:3-jdk-11 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM registry.cn-hangzhou.aliyuncs.com/acs/openjdk:11-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
