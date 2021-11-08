const needle = require('needle')

// Command constants
const CMD_HEADER = [0xa5, 0x5b]
const CMD_CODE_LENGTH = 2
const CMD_DATA_LENGTH = 8
const CMD_LENGTH = CMD_HEADER.length + CMD_CODE_LENGTH + CMD_DATA_LENGTH + 1

// Used in calculating checksums.
const CHECKSUM_BASE = 0x100

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

const cmdEquals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

const api = {
	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms))
	},

	generateCommand(code, arg1 = 0, arg2 = 0) {
		const data = Array(CMD_DATA_LENGTH).fill(0)
		data[0] = arg1
		data[2] = arg2

		const cmd = [...CMD_HEADER, ...code, ...data]

		return [...cmd, getChecksum(cmd)].map((value) => value.toString(16).padStart(2, '0')).join(',')
	},

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

		if (cmdEquals(responseCommand, this.CMD_QUERY_ALL_PORTS)) {
			this.updateAllPortVariables(data)
		}

		if (cmdEquals(responseCommand, this.CMD_SET_BEEP)) {
			this.updateVariable('beep', param2 === 0x0f)
		}

		if (cmdEquals(responseCommand, this.CMD_QUERY_BEEP)) {
			this.updateVariable('beep', param3 === 0x00)
		}

		if (cmdEquals(responseCommand, this.CMD_SET_POWER)) {
			this.updateVariable('power', param2 === 0x0f)
		}

		if (cmdEquals(responseCommand, this.CMD_QUERY_POWER)) {
			this.updateVariable('power', param1 === 0x0f)
		}
	},

	async sendCommand({ path, cmd, method = 'get', timeout = 2000 }) {
		const query = new URLSearchParams()

		if (cmd) {
			query.append('cmd', `hex(${cmd})`)
		}
		query.append('_', Date.now())

		const url = `${this.URL_PROTOCOL}${this.config.ip}${this.URL_BASE}${path}?${query}`

		this.debug({ url })

		return await needle(method, url, { open_timeout: timeout, response_timeout: timeout }).then((res) => {
			return res.body
		})
	},

	async pingDevice() {
		if (this.config.ip) {
			try {
				await this.sendCommand({ path: this.URL_QUERY, method: 'head', timeout: 500 })
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
			this.queue.unshift({ cmd, arg1, arg2, queryCmd })
		} else {
			this.queue.push({ cmd, arg1, arg2, queryCmd })
		}
	},

	nextCommand() {
		return this.queue.length ? this.queue.shift() : {}
	},

	setBeep(enable = true) {
		this.addCommand({
			cmd: this.CMD_SET_BEEP,
			arg1: enable ? this.BEEP_ON : this.BEEP_OFF,
			priority: true,
			queryCmd: this.CMD_QUERY_BEEP,
		})
	},

	setPower(enable = true) {
		this.addCommand({
			cmd: this.CMD_SET_POWER,
			arg1: enable ? this.POWER_ON : this.POWER_OFF,
			priority: true,
			queryCMD: this.CMD_QUERY_POWER,
		})
	},

	setPort(inputPort = 0, outputPort = 0) {
		this.addCommand({
			cmd: this.CMD_CHANGE_PORT,
			arg1: inputPort,
			arg2: outputPort,
			priority: true,
			queryCmd: this.CMD_QUERY_ALL_PORTS,
		})
	},
}

module.exports = api
