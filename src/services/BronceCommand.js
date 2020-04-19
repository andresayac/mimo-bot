const phrases = require('../../utils/phrases');
const Service = require("../Service");

class BronceCommand extends Service {
  
  constructor() {
    super();
    this._command = "!bronce";
  }

  async execute({ command, params, context, client }) {
    const { from } = context;
    const randomNumber = Math.floor(Math.random() * phrases.length);
    const prhase = phrases[randomNumber];

    await client.sendText(from, prhase);
  }
}

module.exports = BronceCommand;
