const roles = require('../data.json');
const { createRole } = require('./services');

(async () => {
  const promises = roles.map((role) => createRole(role));
  try {
    const results = await Promise.all(promises);
    results.map((item) => console.log(item.body));
  } catch (e) {
    console.log(e.response.body);
  }
})();
