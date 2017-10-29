# chat-server-assessment

A server for a chat room assessment

**only tested on node @ `v8.6.0` & `v6.7.0`**

## Install

```
git clone https://github.com/gwokae/chat-server-assessment.git
cd chat-server-assessment
npm i
```

## Start chat server

```
npm start
```

### Spcify settings

We only have `port` and `timeout` settings. These settins can configure via cli arguments.

```
npm start -- --port 6780 --timeout 10
```

## Tasks

* [X] init basic [WS](https://github.com/websockets/ws) support
* [X] init tests
* [X] init users db
* [X] init messages transmittion
* [X] implement inactivity behavior
* [X] implement disconnect behavior
* [X] implement avoid nickname duplication
* [ ] check data validity (???? item #5 in the spec)
* [X] graceful shutdown (on SIGINT or SIGTERM)

## Author

[Leonard Lin](https://github.com/gwokae)
