import WebSocket from 'ws';

import { getJWTPayload } from '../common/utils';
import Comment from '../model/comment'
import Collect from '../model/collect'
import Hands from '../model/hands'

class WebSocketServer {
  constructor(config = {}) {
    const defaultConfig = {
      port: 4001,
      timeInterval: 5 * 1000,
      isAuth: true,
    };

    // 合并配置
    const finaConfig = { ...defaultConfig, ...config };
    this.wss = {};
    this.timeInterval = finaConfig.timeInterval;
    this.isAuth = finaConfig.isAuth;
    this.port = finaConfig.port;
    this.options = config.options || {};
    this.interval = {}
  }

  // 初始化websocket服务
  init() {
    this.wss = new WebSocket.Server({ port: this.port, ...this.options });

    this.wss.on('connection', (ws) => {
      ws.isAlive = true;

      // 心跳检测
      this.heartbeat()

      ws.on('message', (msg) => this.onMessage(ws, msg));

      ws.on('close', () => this.onClose(ws));
    });
  }

  // 接收信息
  onMessage(ws, msg) {
    const msgObj = JSON.parse(msg);
    const events = {
      auth: async () => {
        const payload = await getJWTPayload(msgObj.message);
        if (payload) {
          ws.isAuth = true;
          ws._id = payload._id;
          const total = await this.getAllMsg(ws._id)
          ws.send(
            JSON.stringify({
              event: 'message',
              message: total
            })
          );
        } else {
          ws.send(
            JSON.stringify({
              event: 'noauth',
              message: '鉴权失败',
            })
          );
        }
      },
      heartbeat: () => {
        if (msgObj.message === 'pong') {
          ws.isAlive = true;
        }
      },
      message: () => {
        // 未鉴权拦截
        if (!ws.isAuth && this.isAuth) {
          return;
        }
        // 消息广播
        this.wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client._id === ws._id) {
            this.send(msg);
          }
        });
      },
    };
    events[msgObj.event]();
  }

  // 获取用户未读消息
  async getAllMsg(uid, type = '') {
    const commentTotalMsg = await Comment.getTotalMsg(uid)
    const collectTotalMsg = await Collect.getTotalMsg(uid)
    const handsTotalMsg = await Hands.getTotalMsg(uid)
    return {
      comment: commentTotalMsg,
      collect: collectTotalMsg,
      hands: handsTotalMsg,
      total: commentTotalMsg + collectTotalMsg + handsTotalMsg,
      type
    }
  }

  // 点对点发送消息
  send(uid, msg) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client._id === uid) {
        client.send(msg);
      }
    });
  }

  // 广播系统消息
  broadcast() {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  // 心跳检测
  heartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate()
        }

        ws.isAlive = false
        ws.send(JSON.stringify({
          event: 'heartbeat',
          message: 'ping'
        }))
      })
    }, this.timeInterval)
  }

  // 断开连接
  onClose(ws) {
    
  }
}

export default WebSocketServer;
