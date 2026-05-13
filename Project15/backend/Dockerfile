FROM golang:1.21

WORKDIR /app

ENV GOPROXY=https://goproxy.cn,direct

COPY . .

RUN go mod tidy && go build -o main .

EXPOSE 8080

CMD ["/app/main"]
