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

		this.state = {
			queue: null,
			skip: 0,
			variables: {},
		}

		this.queue = []
		this.runQueue = false

		this.initConstants()
	}

	init() {
		this.connectToMatrix()
	}

	updateConfig(config) {
		this.stopQueue()

		this.config = config
		this.connectToMatrix()
	}

	async connectToMatrix() {
		if (this.config.ip === undefined) {
			this.status(this.STATUS_UNKNOWN, 'Missing Configuration')
			return
		}

		this.state.model = models.filter(({ modelNo }) => modelNo === this.config.modelNo)[0]

		if (this.state.model === undefined) {
			this.log('error', `Model No. ${this.config.modelNo} not found`)
			this.status(this.STATUS_UNKNOWN, 'Check Configuration')
			return
		}

		this.status(this.STATUS_UNKNOWN, 'Conecting...')

		if (await this.pingDevice({ retries: 5, timeout: 500 })) {
			this.initActions()
			this.initVariables()
			this.initFeedbacks()
			this.initPresets()

			this.status(this.STATUS_OK)

			this.runQueue = true
			this.processQueue()
			return
		}

		this.log('error', `Unable to connect to matrix via IP ${this.config.ip}`)
		this.status(this.STATUS_ERROR)
	}

	async processQueue() {
		this.state.timeout = null

		if (this.queue.length === 0) {
			this.addCommand({ cmd: this.CMD_QUERY_ALL_PORTS })
			this.addCommand({ cmd: this.CMD_QUERY_BEEP })
			this.addCommand({ cmd: this.CMD_QUERY_POWER })
		}

		const { cmd, arg1, arg2, queryCmd } = this.nextCommand()

		try {
			await this.sendCommand({ path: this.URL_SUBMIT, cmd: this.generateCommand(cmd, arg1, arg2) })
			await this.sleep(this.PAUSE_TIME)

			if (queryCmd) {
				await this.sendCommand({ path: this.URL_SUBMIT, cmd: this.generateCommand(queryCmd) })
				await this.sleep(this.PAUSE_TIME)
			}

			const response = await this.sendCommand({ path: this.URL_QUERY }).then(({ body }) => body)

			const data = this.verifyResponse(response)
			this.parseData(data)
		} catch (error) {
			this.log('warn', `${error}`)
		}

		if (this.runQueue) {
			this.state.timeout = setTimeout(() => {
				this.processQueue()
			}, this.config.interval)
		}
	}

	async restartQueue() {
		this.stopQueue()
		await this.sleep(this.PAUSE_TIME)
		this.processQueue()
	}

	stopQueue() {
		this.runQueue = false

		if (this.state.timeout) {
			clearTimeout(this.state.timeout)
			this.state.timeout = null
		}
	}

	destroy() {
		this.stopQueue()
	}
}

module.exports = HdmiMatrixInstance
