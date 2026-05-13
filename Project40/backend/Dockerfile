FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./ 2>/dev/null || true

RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -o main .

FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache sqlite-libs

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
