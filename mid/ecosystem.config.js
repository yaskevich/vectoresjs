module.exports = {
  apps : [
      {
        name: "vector",
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