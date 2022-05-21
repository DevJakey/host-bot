let randompass = () => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let pass = "";
    for (let x = 0; x < 10; x++) {
        let i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
}

module.exports = (userID, serverName) => {
    return {
        "name": serverName,
        "user": userID,
        "nest": 7,
        "egg": 20,
        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_17",
        "startup": `sh .local/lib/code-server-{{VERSION}}/bin/code-server`,
        "limits": {
            "memory": 1024,
            "swap": 0,
            "disk": 3072,
            "io": 500,
            "cpu": 0
        },
        "environment": {
            "PASSWORD": randompass(),
            "VERSION": "latest"
        },
        "feature_limits": {
            "databases": 0,
            "allocations": 1,
            "backups": 0
        },
        "deploy": {
            "locations": [ 1, 2 ],
            "dedicated_ip": false,
            "port_range": []
        },
        "start_on_completion": false,
        "oom_disabled": false
    }
}