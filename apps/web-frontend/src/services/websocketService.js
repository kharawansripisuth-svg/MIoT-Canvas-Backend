class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 3000
    this.listeners = new Map()
    this.isConnected = false
    this.clientId = null
    this.authToken = null
  }

  async fetchAuthToken() {
    try {
      const protocol = window.location.protocol
      const host = window.location.host
      const apiUrl = `${protocol}//${host}/api/websocket/token`
      
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch WebSocket authentication token')
      }
      
      const data = await response.json()
      this.authToken = data.token
      return this.authToken
    } catch (err) {
      console.error('Error fetching WebSocket auth token:', err)
      throw err
    }
  }

  async connect() {
    try {
      // Fetch authentication token first
      if (!this.authToken) {
        await this.fetchAuthToken()
      }

      return new Promise((resolve, reject) => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.host
        const wsUrl = `${protocol}//${host}/ws?token=${encodeURIComponent(this.authToken)}`

        console.log(`Connecting to WebSocket at ${protocol}//${host}/ws?token=***`)

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event)
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnected = false
          this.clientId = null
          this.stopHeartbeat()
          this.emit('disconnect', { code: event.code, reason: event.reason })
          
          // Clear auth token on authentication failure (code 1008 = policy violation)
          if (event.code === 1008) {
            this.authToken = null
          }
          
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }
      })
    } catch (err) {
      console.error('Error connecting to WebSocket:', err)
      throw err
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'connection':
          this.clientId = data.clientId
          this.emit('connected', data)
          break

        case 'measurement':
          this.emit('measurement', data)
          break

        case 'alert':
          this.emit('alert', data)
          break

        case 'pong':
          // Heartbeat response
          break

        default:
          this.emit('message', data)
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err)
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  subscribe(topics) {
    this.send({
      type: 'subscribe',
      topics: Array.isArray(topics) ? topics : [topics]
    })
  }

  unsubscribe(topics) {
    this.send({
      type: 'unsubscribe',
      topics: Array.isArray(topics) ? topics : [topics]
    })
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event, callback) {
    if (callback) {
      this.listeners.get(event)?.delete(callback)
    } else {
      this.listeners.delete(event)
    }
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (err) {
        console.error(`Error in WebSocket listener for ${event}:`, err)
      }
    })
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' })
    }, 25000)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      this.emit('maxReconnectAttempts')
      return
    }

    this.reconnectAttempts++
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    setTimeout(() => {
      this.connect().catch(() => {
        // Will trigger another reconnect attempt
      })
    }, this.reconnectDelay * Math.min(this.reconnectAttempts, 5))
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.clientId = null
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      clientId: this.clientId,
      readyState: this.ws?.readyState
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()
export default websocketService
