const instance_skel = require('../../../instance_skel')

const configs = require('./configs')
const actions = require('./actions')
const constants = require('./constants')
const presets = require('./presets')
const variables = require('./variables')
const feedbacks = require('./feedbacks')
const api = require('./api')
const models = require('./models')

class HdmiMatrixInstance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config)

		Object.assign(this, {
			...configs,
			...actions,
			...constants,
			...presets,
			...variables,
			...feedbacks,
			...api,
		})

		this.config = config

		// instance state store
		this.state = {
			queue: null,
			retry: null,
			skip: 0,
			variables: {},
		}

		this.initConstants()
	}

	init() {
		this.state.model = models.filter(({ modelNo }) => modelNo === this.config.modelNo)[0]

		if (this.state.model) {
			this.initActions()
			this.initVariables()
			this.initFeedbacks()
			this.initPresets()
	
			this.status(this.STATUS_UNKNOWN, 'Connecting')
			this.startQueue()
		} else {
			this.status(this.STATUS_ERROR, `Model No. ${this.config.modelNo} not found`)
		}
	}

	updateConfig(config) {
		this.stopQueue()

		this.config = config
		this.init()
	}

	destroy() {
		this.stopQueue()
	}
}

module.exports = HdmiMatrixInstance
