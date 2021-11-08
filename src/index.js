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
			retry: null,
			skip: 0,
			variables: {},
		}

		this.queue = []
		this.queueRunning = false

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

		this.status(this.STATUS_UNKNOWN, 'Conecting...')

		if (this.state.model && (await this.pingDevice())) {
			this.initActions()
			this.initVariables()
			this.initFeedbacks()
			this.initPresets()
			this.startQueue()
			return
		}

		this.logError('error', `Model No. ${this.config.modelNo} not found`)
	}

	async startQueue() {
		this.queueRunning = false

		if (this.config.ip === undefined) {
			this.status(this.STATUS_UNKNOWN, 'Missing Config')
			return
		}

		if (this.state.queue) {
			this.log('debug', 'Polling queue already started')
			return
		}

		this.stopRetry()

		if (!(await this.pingDevice())) {
			const error = `HDMI Matrix is not responsive at IP ${this.config.ip}`

			if (this.currentState !== this.STATUS_ERROR && this.currentStatusMessage !== error) {
				this.logError(error)
			}

			this.startRetry()

			return
		}

		this.status(this.STATUS_OK)

		this.state.queue = setInterval(async () => {
			if (this.queueRunning) {
				return this.restartQueue()
			}
			if (this.queue.length === 0) {
				this.addCommand({ cmd: this.CMD_QUERY_ALL_PORTS })
				this.addCommand({ cmd: this.CMD_QUERY_BEEP })
				this.addCommand({ cmd: this.CMD_QUERY_POWER })
			}

			const { cmd, arg1, arg2, queryCmd } = this.nextCommand()

			if (cmd === undefined) {
				this.log('debug', 'Ignoring undefined command')
				return
			}

			this.queueRunning = true

			try {
				await this.sendCommand({ path: this.URL_SUBMIT, cmd: this.generateCommand(cmd, arg1, arg2) })
				await this.sleep(this.PAUSE_TIME)

				if (queryCmd) {
					await this.sendCommand({ path: this.URL_SUBMIT, cmd: this.generateCommand(queryCmd) })
					await this.sleep(this.PAUSE_TIME)
				}

				const response = await this.sendCommand({ path: this.URL_QUERY })

				this.parseData(this.verifyResponse(response))
			} catch (error) {
				this.logError(error)
				this.stopQueue()
			}

			this.queueRunning = false
		}, this.config.interval)
	}

	async restartQueue() {
		this.stopQueue()
		await this.sleep(this.PAUSE_TIME)
		this.startQueue()
	}

	stopQueue() {
		this.queueRunning = false

		if (this.state.queue) {
			clearInterval(this.state.queue)
			this.state.queue = null
		}

		this.stopRetry()
	}

	startRetry() {
		if (this.state.retry) {
			this.log('debug', `Attempting to retry, while another retry is ongoing. Bailing ...`)
			return
		}

		this.state.retry = setTimeout(() => {
			this.log('debug', `Attempting to reconnect to IP ${this.config.ip}`)
			this.startQueue()
		}, 10000)
	}

	stopRetry() {
		if (this.state.retry) {
			clearTimeout(this.state.retry)
			this.state.retry = null
		}
	}

	logError(message) {
		this.log('error', message)
		this.status(this.STATUS_ERROR, message)
	}

	destroy() {
		this.stopQueue()
	}
}

module.exports = HdmiMatrixInstance
