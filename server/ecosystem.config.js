module.exports = {
  apps : [
      {
        name: "vectores",
        script: "./index.js",
        watch: false,
        instance_var: 'INSTANCE_ID',
        env: {
            "PORT": 3434,
            "NODE_ENV": "production"
        }
      }
  ]
}