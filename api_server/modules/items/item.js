// provides the Item model for handling items

'use strict';

const CodeStreamModel = require(process.env.CS_API_TOP + '/lib/models/codestream_model');
const CodeStreamModelValidator = require(process.env.CS_API_TOP + '/lib/models/codestream_model_validator');
const ItemAttributes = require('./item_attributes');

class Item extends CodeStreamModel {

	getValidator () {
		return new CodeStreamModelValidator(ItemAttributes);
	}

	// called right before we save...
	async preSave (options) {
		// ensure all native IDs are lowercase
		this.lowerCase(this.attributes.teamId);
		if (!this.attributes.providerType) {
			this.lowerCase(this.attributes.streamId);
			this.lowerCase(this.attributes.postId);
		}
		this.lowerCase(this.attributes.markerIds);
		await super.preSave(options);
	}
}

module.exports = Item;
