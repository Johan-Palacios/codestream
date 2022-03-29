'use strict';

const EmailHandler = require('./emailHandler');

class TeamCreatedEmailHandler extends EmailHandler {

	async getSendOptions () {
		const options = await super.getSendOptions();
		options.to = { email: this.message.to, name: 'New Relic CodeStream' };
		options.from = { email: this.outboundEmailServer.config.email.senderEmail, name: 'New Relic CodeStream' };
		return options;
	}
	
	async renderEmail () {
		this.content = `Created by ${this.user.email}`;
		this.subject = `Team ${this.message.teamName} (company ${this.message.companyId} - "${this.message.companyName}") is now on CodeStream!`;
	}
}

module.exports = TeamCreatedEmailHandler;
