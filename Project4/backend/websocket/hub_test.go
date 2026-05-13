package websocket

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewHub(t *testing.T) {
	hub := NewHub()

	assert.NotNil(t, hub)
	assert.NotNil(t, hub.broadcast)
	assert.NotNil(t, hub.register)
	assert.NotNil(t, hub.unregister)
	assert.NotNil(t, hub.clients)
	assert.Len(t, hub.clients, 0)
}

func TestBroadcast_MarshalError(t *testing.T) {
	hub := NewHub()

	hub.Broadcast(make(chan int))

	select {
	case <-hub.broadcast:
		t.Fatal("Should not send on marshal error")
	default:
	}
}

func TestBroadcast_Success(t *testing.T) {
	hub := NewHub()

	go func() {
		hub.Broadcast(map[string]string{"message": "hello"})
	}()

	select {
	case msg := <-hub.broadcast:
		var data map[string]string
		err := json.Unmarshal(msg, &data)
		assert.NoError(t, err)
		assert.Equal(t, "hello", data["message"])
	case <-time.After(1 * time.Second):
		t.Fatal("Timeout waiting for broadcast")
	}
}

func TestHub_ManualRegister(t *testing.T) {
	hub := NewHub()

	client := &Client{
		hub:  hub,
		send: make(chan []byte, 1),
	}

	hub.mu.Lock()
	hub.clients[client] = true
	hub.mu.Unlock()

	assert.Len(t, hub.clients, 1)
	assert.True(t, hub.clients[client])

	hub.mu.Lock()
	delete(hub.clients, client)
	hub.mu.Unlock()

	assert.Len(t, hub.clients, 0)
}

func TestHub_ManualBroadcast(t *testing.T) {
	hub := NewHub()

	client1 := &Client{hub: hub, send: make(chan []byte, 1)}
	client2 := &Client{hub: hub, send: make(chan []byte, 1)}

	hub.mu.Lock()
	hub.clients[client1] = true
	hub.clients[client2] = true
	hub.mu.Unlock()

	testMsg := []byte(`{"test":"message"}`)

	hub.mu.RLock()
	for client := range hub.clients {
		select {
		case client.send <- testMsg:
		default:
			close(client.send)
			delete(hub.clients, client)
		}
	}
	hub.mu.RUnlock()

	select {
	case msg := <-client1.send:
		assert.Equal(t, testMsg, msg)
	case <-time.After(1 * time.Second):
		t.Error("Client1 did not receive message")
	}

	select {
	case msg := <-client2.send:
		assert.Equal(t, testMsg, msg)
	case <-time.After(1 * time.Second):
		t.Error("Client2 did not receive message")
	}
}

func TestHub_BroadcastWithFullChannelDropsClient(t *testing.T) {
	hub := NewHub()

	client := &Client{hub: hub, send: make(chan []byte, 0)}

	hub.mu.Lock()
	hub.clients[client] = true
	hub.mu.Unlock()

	testMsg := []byte(`{"test":"should drop"}`)

	hub.mu.Lock()
	for c := range hub.clients {
		select {
		case c.send <- testMsg:
		default:
			close(c.send)
			delete(hub.clients, c)
		}
	}
	hub.mu.Unlock()

	assert.Len(t, hub.clients, 0)
}

func TestNewClient(t *testing.T) {
	hub := NewHub()

	client := &Client{
		hub:  hub,
		send: make(chan []byte, 256),
	}

	assert.Equal(t, hub, client.hub)
	assert.NotNil(t, client.send)
	assert.Nil(t, client.conn)
}
