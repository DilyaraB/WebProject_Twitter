const app = require("./src/app.js");

const port = 3000;
app.default.listen(port, () => {
  console.log(`Serveur actif sur le port ${port}`);
});

