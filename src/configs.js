const models = require('./models')

module.exports = {
	config_fields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'Blackbird™ HDMI Matrix',
			},
			{
				type: 'textinput',
				id: 'ip',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP,
				default: this.DEFAULT_IP,
				required: true,
			},
			{
				type: 'dropdown',
				id: 'modelNo',
				width: 12,
				label: 'Model',
				default: models[0].modelNo,
				choices: models.map(({ modelNo, description }) => ({
					id: modelNo,
					label: description,
				})),
			},
			{
			    type: 'number',
			    id: 'interval',
			    label: `Polling interval in milliseconds (recommanded: ${this.INTERVAL_DEFAULT})`,
			    width: 9,
			    min: this.INTERVAL_MIN,
				max: this.INTERVAL_MAX,
			    default: this.INTERVAL_DEFAULT,
			    range: true,
			},
		]
	},
}
