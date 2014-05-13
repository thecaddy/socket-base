// Core configuration for DozerJS
var config = {

  // Environment configuration
  env: {
    // Port to run over
    port: 8000
  },

  // Session secret
  secret: '5de5661ab3d401bcb266dff914',

  // CORS configuration
  cors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
    headers: 'Content-Type'
  },

  database: {
    config: {
      beast: {
        user: 'Beast',
        password: 'Yz0I9lriZ9nnW8gvYP1o',
        server: 'sql-1.diversesolutions.com',
        database: 'Beast'
      },
      rogue: {
        user: 'RogueUser',
        password: 'U92nNNjujuzOAblCB9oy',
        server: 'sql-1.diversesolutions.com',
        database: 'Rogue'
      }
    },
    model: {
      includeSchema: false,
      isCaseSensitive: false
    }
  },

};

module.exports = config;
