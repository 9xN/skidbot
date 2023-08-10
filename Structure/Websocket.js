const events = require("events");
const { WebSocket } = require("ws");
const fs = require("fs");
const constants = require("../Data/constants.json");

function toCamalCase(str) {
  return str
    .split("_")
    .map((value, id) => {
      value = value.toLocaleLowerCase();
      if (id === 0) return value;
      return value[0].toUpperCase() + value.substring(1);
    })
    .join("");
}

function parseGuild(_guild, _this) {
  const guild = JSON.parse(JSON.stringify(_guild));
  if (!guild) return guild;
  if (!guild.id) return guild;
  (() => {
    const channels = new Map();
    const categories = new Map();
    for (const channel of guild?.channels) {
      if (channel.type === 4) {
        categories.set(channel.id, parseCategory(channel, _this));
      } else {
        channels.set(channel.id, parseChannel(channel, _this));
      }
    }
    guild.channels = channels;
    guild.categories = categories;
  })();

  (() => {
    const roles = new Map();
    for (const role of guild.roles) roles.set(role.id, role);
    guild.roles = roles;
  })();

  (() => {
    const emojis = new Map();
    for (const emoji of guild.emojis) emojis.set(emoji.id, emoji);
    guild.emojis = emojis;
  })();

  (() => {
    const stickers = new Map();
    for (const sticker of guild.stickers) stickers.set(sticker.id, sticker);
    guild.stickers = stickers;
  })();

  return guild;
}
function parseCategory(_category, _this) {
  const category = JSON.parse(JSON.stringify(_category));

  category.guild = _this.guilds.get(category.guild_id);

  return category;
}

function parseChannel(_channel, _this) {
  const channel = JSON.parse(JSON.stringify(_channel));

  channel.isText = () => channel.type === 0;
  channel.isVoice = () => channel.type === 2;
  channel.isDM = () => channel.type === 1 || channel.type === 3;
  channel.isCategory = () => channel.type === 4;
  channel.isAnnouncement = () => channel.type === 5;
  channel.isAnnouncementThread = () => channel.type === 10;
  channel.isPublicThread = () => channel.type === 11;
  channel.isPrivateThread = () => channel.type === 12;
  channel.isStage = () => channel.type === 13;
  channel.isDirectory = () => channel.type === 14;
  channel.isForum = () => channel.type === 15;
  channel.send = (content, callback) => {
    _this.apiRequest(
      "POST",
      "channels/" + channel.id + "/messages",
      JSON.stringify({
        content,
        nonce: Date.now(),
        tts: false,
      }),
      callback
    );
  };

  channel.guild = _this.guilds.get(channel.guild_id);

  if (channel.isDM()) {
    const recipients = new Map();
    for (const recipient of channel.recipients)
      recipients.set(recipient.id, recipient);
    channel.recipients = recipients;
  }

  return channel;
}

function parseMessage(_message, _this) {
  const message = JSON.parse(JSON.stringify(_message));
  if (_this.cachedChannels.get(message.channel_id)) {
    message.channel = _this.cachedChannels?.get(message.channel_id);
  }
  if (_this.channels.get(message.channel_id)) {
    message.channel = _this.channels.get(message.channel_id);
  }
  if (_this.privateChannels.get(message.channel_id)) {
    message.channel = _this.privateChannels.get(message.channel_id);
  }
  message.delete = (callback) => {
    _this.apiRequest(
      "DELETE",
      "channels/" + message.channel.id + "/messages/" + message.id,
      null,
      null,
      callback
    );
  };
  message.client = _this;
  return message;
}
class Client {
  #debug = false;
  #props = false;
  #status = {
    status: "online",
    activities: [],
    afk: false,
  };
  #emitter;
  guilds;
  privateChannels;

  static create(props = {}, debug = false) {
    return new Client(props, debug);
  }

  constructor(props = {}, debug = false) {
    this.#debug = debug ? (...args) => console.log(...args) : () => false;
    this.#props = props;
    this.#emitter = new events();
    this.guilds = new Map();
    this.privateChannels = new Map();
    this.cachedChannels = new Map();
    this.cdnBase = constants.cdn;
    this.apiBase = constants.rest;
    this.fs = fs;
    this.statuses = new Map();
    this.channels = new Map();
    this.messages = new Map();
    this.deletedMessages = new Map();
    this.editedMessages = new Map();
    this.commands = new Map();
    this.commandAliases = new Map();
    this.commandCategories = new Array();
    // Setup
    this.on(
      "ready",
      ({
        user,
        session_id,
        analytics_token,
        guilds,
        private_channels,
        presences,
      }) => {
        this.user = user;
        this.session_id = session_id;
        this.analytics_token = analytics_token;

        for (const guild of guilds) {
          this.guilds.set(guild.id, parseGuild(guild, this));
          for (const channel of guild?.channels) {
            this.channels.set(channel.id, parseChannel(channel, this));
          }
        }
        for (const privateChannel of private_channels)
          this.privateChannels.set(
            privateChannel.id,
            parseChannel(privateChannel, this)
          );
        for (const presence of presences)
          this.statuses.set(presence.user.id, presence.status);
      }
    );
    // For on status change
    this.on("userSettingsUpdate", ({ status }) => {
      if (status) {
        this.user.status = status;
        this.#status.status = status;
      }
    });
    // Guilds
    this.on("guildDelete", ({ id }) => void this.guilds.delete(id));
    this.on(
      "guildCreate",
      (guild) => void this.guilds.set(guild.id, parseGuild(guild, this))
    );
    this.on(
      "guildUpdate",
      (guild) => void this.guilds.set(guild.id, parseGuild(guild, this))
    );
    // Channels
    this.on("channelUpdate", (channel) => {
      if (channel.guild_id)
        this.guilds
          .get(channel.guild_id)
          .channels.set(channel.id, parseChannel(channel, this));
      else this.privateChannels.set(channel.id, parseChannel(channel, this));
    });
    this.on("channelCreate", (channel) => {
      if (channel.guild_id)
        this.guilds
          .get(channel.guild_id)
          .channels.set(channel.id, parseChannel(channel, this));
      else this.privateChannels.set(channel.id, parseChannel(channel, this));
    });
    this.on("channelDelete", (channel) => {
      if (channel.guild_id)
        this.guilds.get(channel.guild_id).channels.delete(channel.id);
      else this.privateChannels.delete(channel.id);
    });
    // For dms
    this.on(
      "channelRecipientRemove",
      ({ user, channel_id }) =>
        void this.privateChannels.get(channel_id).recipients.delete(user.id)
    );
    this.on(
      "channelRecipientAdd",
      ({ user, channel_id }) =>
        void this.privateChannels.get(channel_id).recipients.set(user.id, user)
    );
    // For message caching
    // TODO make this work
    // this.on('messageCreate', (message) => void this.cachedChannels.get(message.channel_id).messages.set(message.id, message))
    // Presence Caching
    this.on(
      "presenceUpdate",
      (presence) => void this.statuses.set(presence.user.id, presence.status)
    );
    this.on(
      "messageCreate",
      (message) => void this.messages.set(message.id, message)
    );
    this.on(
      "messageDelete",
      (message) => void this.deletedMessages.set(message.id, message)
    );
  }
  // Emitter
  on(eventName, listener) {
    this.#emitter.on(eventName, listener);
    // console.log(typeof this.#emitter._events.ready?.[0])
    return () => this.off(eventName, listener);
  }
  once(eventName, listener) {
    this.#emitter.on(eventName, listener);
    return () => this.off(eventName, listener);
  }
  off(eventName, listener) {
    this.#emitter.off(eventName, listener);
  }
  // Send WS data
  send(data) {
    this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
  }
  // Destroy the ws
  destroy() {
    this.ws.destroy();
    this.token = null;
  }
  // Easily set the status
  setStatus(
    status = this.#status.status,
    activities = this.#status.activities,
    afk = this.#status.afk
  ) {
    if (!this.user) throw new Error("Must be ran after the ready event");

    this.#status.status = status;
    this.#status.activities = activities;
    this.#status.afk = afk;

    this.send({
      op: 3,
      d: {
        since: Date.now(),
        activities,
        status,
        afk,
      },
    });
  }
  getGuildMembers(guildId) {
    this.on("guildMembersChunk", (guildData) => {
      return guildData;
    });
    this.send({
      op: 8,
      d: {
        guild_id: guildId,
        query: "",
        limit: 0,
      },
    });
  }

  login(token) {
    this.token = token;
    this.ws = new WebSocket(constants.socket);
    const payload = { op: 1, d: 0 };

    this.ws.onopen = () => {
      this.ws.onmessage = (msg) => {
        const message = JSON.parse(String(msg.data));
        switch (message.op) {
          case 10:
            this.ws.send(
              JSON.stringify({
                op: 2,
                d: {
                  token: token,
                  properties: this.#props.properties ?? {},
                },
              })
            );
            setInterval(() => {
              payload.d++;
              this.ws.send(JSON.stringify(payload));
            }, message.d.heartbeat_interval);
            break;
          case 0:
            this.#emitter.emit(message.t, message);
            if (
              toCamalCase(message.t) === "messageCreate" ||
              toCamalCase(message.t) === "messageEdit" ||
              toCamalCase(message.t) === "messageDelete"
            ) {
              this.#emitter.emit(
                toCamalCase(message.t),
                parseMessage(message.d, this)
              );
              return;
            }
            this.#emitter.emit(toCamalCase(message.t), message.d);
            this.#debug(
              `Event ${message.t} / ${toCamalCase(message.t)} was ran`
            );
            break;
          case 1:
            payload.d++;
            this.ws.send(JSON.stringify(payload));
            break;
          default:
            break;
        }
      };
    };
    // console.log(this.ws)
  }
  httpRequest = async (method, url, headers, post, callback) => {
    fetch(url, {
      method,
      headers,
      body: post,
    }).then((data) => {
      data?.text().then((resolve) => {
        callback?.(JSON.parse(resolve));
      });
    });
  };

  apiRequest = (method, path, post, callback) => {
    this.httpRequest(
      method,
      this.apiBase + path,
      {
        "x-requested-with": "XMLHttpRequest",
        authorization: this.token,
        "content-type": post
          ? "application/json"
          : "application/x-www-form-urlencoded",
      },
      post,
      callback
    );
  };

  // needs to be updated to use fetch
  // cdnRequest = (path, filename, callback) => {
  //         this.request.head(this.cdnBase + path, (err, res, body) => {
  //         this.request(this.cdnBase + path).pipe(this.fs.createWriteStream(filename)).on('close', callback);
  //         });
  // };

  joinServer = (inviteCode, callback) => {
    this.apiRequest("POST", "invites/" + inviteCode, null, callback);
  };

  leaveServer = (serverId, callback) => {
    this.apiRequest(
      "DELETE",
      "users/@me/guilds/" + serverId,
      null,
      null,
      callback
    );
  };

  getServers = (callback) => {
    this.apiRequest("GET", "users/@me/guilds", null, callback);
  };

  getServerInfo = (channelId, callback) => {
    this.apiRequest("GET", "guilds/" + channelId, null, callback);
  };
  getChannels = (serverId, callback) => {
    this.apiRequest("GET", "guilds/" + serverId, +"/channels", null, callback);
  };

  sendMessage = (channelId, message, callback) => {
    this.apiRequest(
      "POST",
      "channels/" + channelId + "/messages",
      JSON.stringify({
        content: message,
        nonce: Date.now(),
        tts: false,
      }),
      null,
      callback
    );
  };

  deleteMessage = (channelId, messageId, callback) => {
    this.apiRequest(
      "DELETE",
      "channels/" + channelId + "/messages/" + messageId,
      null,
      callback
    );
  };

  getMessages = (channelId, amount, callback) => {
    this.apiRequest(
      "GET",
      "channels/" + channelId + "/messages?limit=" + amount,
      null,
      callback
    );
  };

  addReaction = (channelId, messageId, reaction, callback) => {
    this.apiRequest(
      "PUT",
      "channels/" +
        channelId +
        "/messages/" +
        messageId +
        "/reactions/" +
        reaction +
        "/@me",
      null,
      callback
    );
  };

  removeReaction = (channelId, messageId, reaction, callback) => {
    this.apiRequest(
      "DELETE",
      "channels/" +
        channelId +
        "/messages/" +
        messageId +
        "/reactions/" +
        reaction +
        "/@me",
      null,
      callback
    );
  };

  isTyping = (channelId, callback) => {
    this.apiRequest(
      "POST",
      "channels/" + channelId + "/typing",
      null,
      callback
    );
  };

  changeNickname = (serverId, nickname, callback) => {
    this.apiRequest(
      "PATCH",
      "guilds/" + serverId + "/members/@me/nick",
      JSON.stringify({
        nick: nickname,
      }),
      callback
    );
  };

  updateStatus = (status, callback) => {
    this.apiRequest(
      "PATCH",
      "users/@me/settings",
      JSON.stringify({
        status: status,
      }),
      callback
    );
  };

  updateUserSettings = (
    username,
    email,
    password,
    newPassword,
    avatarBase64,
    callback
  ) => {
    this.apiRequest(
      "PATCH",
      "users/@me",
      JSON.stringify({
        username: username,
        email: email,
        password: password,
        new_password: newPassword,
        avatar: avatarBase64,
        discriminator: null,
      }),
      callback
    );
  };

  createServer = (name, region, icon, callback) => {
    this.apiRequest(
      "POST",
      "guilds",
      JSON.stringify({
        name: name,
        region: region,
        icon: icon,
      }),
      callback
    );
  };

  deleteServer = (serverId, callback) => {
    this.apiRequest(
      "POST",
      "guilds/" + serverId + "/delete",
      JSON.stringify({}),
      callback
    );
  };

  createChannel = (serverId, name, parentId, type) => {
    this.apiRequest(
      "POST",
      "guilds/" + serverId + "/channels",
      JSON.stringify({
        name: name,
        parent_id: parentId,
        type: type,
        permission_overwrites: [],
      }),
      callback
    );
  };

  deleteChannel = (channelId, callback) => {
    this.apiRequest("DELETE", "channels/" + channelId, null, callback);
  };

  createRole = (serverId, callback) => {
    this.apiRequest(
      "POST",
      "guilds/" + serverId + "/roles",
      null,
      null,
      callback
    );
  };

  deleteRole = (serverId, roleId, callback) => {
    this.apiRequest(
      "DELETE",
      "guilds/" + serverId + "/roles/" + roleId,
      null,
      null,
      callback
    );
  };

  joinHypesquad = (houseNumber, callback) => {
    this.apiRequest(
      "POST",
      "hypesquad/online",
      JSON.stringify({
        house_id: houseNumber,
      }),
      callback
    );
  };

  createInvite = (channelId, callback) => {
    this.apiRequest(
      "POST",
      "channels/" + channelId + "/invites",
      JSON.stringify({
        max_age: 0,
        max_uses: 0,
        temporary: false,
      }),
      callback
    );
  };

  getUserRelationships = (callback) => {
    this.apiRequest("GET", "users/@me/relationships", null, callback);
  };

  getUserInfo = (callback) => {
    this.apiRequest("GET", "users/@me", null, callback);
  };
  // needs fixing of cdnRequest
  // getIcon = (userID, avatarEN, outputName, callback) => {
  //   this.cdnRequest('avatars/' + userID + '/' + avatarEN + '.png', outputName, callback);
  // };

  getUsersInfo = (userId, callback) => {
    this.apiRequest("GET", `users/${userId}`, null, callback);
  };
  getAssets(applicationId, callback) {
    this.apiRequest(
      "GET",
      "oauth2/applications/" + applicationId + "/assets",
      null,
      null,
      callback
    );
  }
}
module.exports = Client;
