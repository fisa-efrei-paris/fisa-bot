module.exports = {
  apps : [{
    name       : "fisa-bot",
    script     : "./dist/src/index.js",
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}
