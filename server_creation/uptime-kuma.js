module.exports = (userID, serverName, location) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 1,
        "egg": 56,
        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_14",
        "startup": `/usr/local/bin/node  /home/container/server/server.js --port={{SERVER_PORT}}`,
        "environment": {},
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": location,
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}