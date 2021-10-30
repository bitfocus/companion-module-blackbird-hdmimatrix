const needle = require('needle')
const debug = require('debug')('blackbird:api')

// Command constants
const CMD_HEADER = [0xa5, 0x5b]
const CMD_CODE_LENGTH = 2
const CMD_DATA_LENGTH = 8
const CMD_LENGTH = CMD_HEADER.length + CMD_CODE_LENGTH + CMD_DATA_LENGTH + 1
const PAUSE_TIME = 100

// Beep
const CMD_SET_BEEP = [0x06, 0x01]
const CMD_QUERY_BEEP = [0x01, 0x0b]
const BEEP_ON = 0x0f
const BEEP_OFF = 0xf0

// Power
const CMD_SET_POWER = [0x08, 0x0b]
const CMD_QUERY_POWER = [0x08, 0x0c]
const CMD_REBOOT = [0x08, 0x0d] // TODO
const POWER_ON = 0x0f
const POWER_OFF = 0xf0

// Ports
const CMD_CHANGE_PORT = [0x02, 0x03]
const CMD_QUERY_ALL_PORTS = [0x02, 0x11]

// EDID
const CMD_SET_EDID = [0x03, 0x02] // TOD0
const CMD_SET_EDID_TO_ALL = [0x03, 0x01] // TODO
const CMD_COPY_EDID = [0x03, 0x04] // TOD0
const CMD_COPY_EDID_TO_ALL = [0x03, 0x03] // TOD0

// Used in calculating checksums.
const CHECKSUM_BASE = 0x100

// URL values
const URL_PROTOCOL = 'http://'
const URL_BASE = '/cgi-bin'
const URL_QUERY = '/query'
const URL_SUBMIT = '/submit'

const queue = []

const getChecksum = (cmdHex = []) => {
	let sum = 0
	for (let i = 0; i < cmdHex.length - 1; i++) {
		sum += cmdHex[i]
	}

	let checksum = cmdHex.length > 13 ? sum % CHECKSUM_BASE : CHECKSUM_BASE - (sum % CHECKSUM_BASE)
	if (checksum === CHECKSUM_BASE) {
		checksum = 0x00
	}

	return checksum
}

const parseResponse = (response) => {
	const regex = /^hex\((.*)\)$/
	const result = regex.exec(response)
	let data = []

	if (result) {
		data = result[1].split(',').map((hex) => parseInt(`0x${hex}`))
	}

	return data
}

const generateCommand = (code, arg1 = 0, arg2 = 0) => {
	const data = Array(CMD_DATA_LENGTH).fill(0)
	data[0] = arg1
	data[2] = arg2

	const cmd = [...CMD_HEADER, ...code, ...data]

	return [...cmd, getChecksum(cmd)].map((value) => value.toString(16).padStart(2, '0')).join(',')
}

const cmdEquals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const api = {
	verifyResponse(response) {
		const responseData = parseResponse(response)

		if (responseData.length !== CMD_LENGTH) {
			this.log('debug', `Error: Invalid response length (length=${responseData.length}, expected=${CMD_LENGTH})`)
		}

		const checksum = responseData.pop()
		const responseChecksum = getChecksum(responseData)
		if (responseChecksum !== checksum) {
			// this.log('debug', `Error: Invalid response checksum (checksum=${responseChecksum}, expected=${checksum})`)
		}
		return responseData
	},

	parseData(responseData) {
		const [, , resType, resIndex, ...data] = responseData
		const responseCommand = [resType, resIndex]
		const [param1, param2, param3] = data

		if (cmdEquals(responseCommand, CMD_QUERY_ALL_PORTS)) {
			this.updateAllPortVariables(data)
		}

		if (cmdEquals(responseCommand, CMD_SET_BEEP)) {
			this.updateVariable('beep', param2 === 0x0f)
		}

		if (cmdEquals(responseCommand, CMD_QUERY_BEEP)) {
			this.updateVariable('beep', param3 === 0x00)
		}

		if (cmdEquals(responseCommand, CMD_SET_POWER)) {
			this.updateVariable('power', param2 === 0x0f)
		}

		if (cmdEquals(responseCommand, CMD_QUERY_POWER)) {
			this.updateVariable('power', param1 === 0x0f)
		}
	},

	sendCommand({ path, cmd, method = 'get', timeout = 2000 }) {
		const query = new URLSearchParams()

		if (cmd) {
			query.append('cmd', `hex(${cmd})`)
		}
		query.append('_', Date.now())

		const url = `${URL_PROTOCOL}${this.config.ip}${URL_BASE}${path}?${query}`

		debug(url)
		return needle(method, url, { open_timeout: timeout, response_timeout: timeout })
	},

	async pingDevice() {
		if (this.config.ip) {
			try {
				await this.sendCommand({ path: URL_QUERY, method: 'head', timeout: 500 })
				return true
			} catch (error) {
				this.log('debug', `pingDevice: ${error}`)
				return false
			}
		}
		return false
	},

	addCommand({ cmd, arg1 = 0, arg2 = 0, priority = false, queryCmd }) {
		if (priority) {
			queue.unshift({ cmd, arg1, arg2, queryCmd })
		} else {
			queue.push({ cmd, arg1, arg2, queryCmd })
		}
	},

	nextCommand() {
		return queue.shift()
	},

	async startQueue() {
		let queueRunning = false

		if (!this.config.ip) {
			const error = 'Missing device IP address'
			this.log('error', error)
			this.status(this.STATUS_ERROR, error)
			return
		}

		if (this.state.queue) {
			this.log('debug', 'Polling queue already started')
			return
		}

		this.stopRetry()

		if (!(await this.pingDevice())) {
			const error = `HDMI Matrix is not responsive at IP ${this.config.ip}`
			if (this.currentState !==this.STATUS_ERROR && this.currentStatusMessage !== error) {
				this.log('error', error)
				this.status(this.STATUS_ERROR, error)
			}
			this.state.retry = setTimeout(() => {
				this.state.retry = null
				this.log('debug', `Attempting to reconnect to IP ${this.config.ip}`)
				this.startQueue()
			}, 10000)
			return
		}

		this.status(this.STATUS_OK)

		this.state.queue = setInterval(async () => {
			if (queueRunning) {
				this.log('debug', 'Polling queue already running')
				return
			}
			queueRunning = true

			if (queue.length === 0) {
				this.addCommand({ cmd: CMD_QUERY_ALL_PORTS })
				this.addCommand({ cmd: CMD_QUERY_BEEP })
				this.addCommand({ cmd: CMD_QUERY_POWER })
			}

			const { cmd, arg1, arg2, queryCmd } = this.nextCommand()

			try {
				await this.sendCommand({ path: URL_SUBMIT, cmd: generateCommand(cmd, arg1, arg2) })
				await sleep(PAUSE_TIME)

				if (queryCmd) {
					await this.sendCommand({ path: URL_SUBMIT, cmd: generateCommand(queryCmd) })
					await sleep(PAUSE_TIME)
				}

				const response = await this.sendCommand({ path: URL_QUERY }).then((res) => res.body)
				debug({ response })

				const data = this.verifyResponse(response)
				this.parseData(data)
			} catch (error) {
				this.log('error', error)
				this.status(this.STATUS_ERROR, error)
				this.stopQueue()
			}

			queueRunning = false
		}, this.config.interval)
	},

	stopQueue() {
		if (this.state.queue) {
			clearInterval(this.state.queue)
			this.state.queue = null
		}
		this.stopRetry()
	},

	stopRetry() {
		if (this.state.retry) {
			clearTimeout(this.state.retry)
			this.state.retry = null
		}
	},

	setBeep(enable = true) {
		this.addCommand({
			cmd: CMD_SET_BEEP,
			arg1: enable ? BEEP_ON : BEEP_OFF,
			priority: true,
			queryCmd: CMD_QUERY_BEEP,
		})
	},

	setPower(enable = true) {
		this.addCommand({
			cmd: CMD_SET_POWER,
			arg1: enable ? POWER_ON : POWER_OFF,
			priority: true,
			queryCMD: CMD_QUERY_POWER,
		})
	},

	setPort(inputPort = 0, outputPort = 0) {
		this.addCommand({
			cmd: CMD_CHANGE_PORT,
			arg1: inputPort,
			arg2: outputPort,
			priority: true,
			queryCmd: CMD_QUERY_ALL_PORTS,
		})
	},
}

module.exports = api
