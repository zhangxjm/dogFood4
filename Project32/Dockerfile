FROM golang:1.21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git gcc musl-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest

RUN apk add --no-cache ca-certificates sqlite

WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/conf ./conf
COPY --from=builder /app/views ./views
COPY --from=builder /app/static ./static

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]
