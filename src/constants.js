module.exports = {
	initConstants() {
		this.defineConst('INTERVAL_MIN', 1000)
		this.defineConst('INTERVAL_DEFAULT', 1000)
		this.defineConst('INTERVAL_MAX', 5000)

		this.defineConst('URL_PROTOCOL', 'http://')
		this.defineConst('URL_BASE', '/cgi-bin')
		this.defineConst('URL_QUERY', '/query')
		this.defineConst('URL_SUBMIT', '/submit')
		this.defineConst('PAUSE_TIME', 100)

		this.defineConst('CMD_SET_BEEP', [0x06, 0x01])
		this.defineConst('CMD_QUERY_BEEP', [0x01, 0x0b])
		this.defineConst('BEEP_ON', 0x0f)
		this.defineConst('BEEP_OFF', 0xf0)

		this.defineConst('CMD_SET_POWER', [0x08, 0x0b])
		this.defineConst('CMD_QUERY_POWER', [0x08, 0x0c])
		this.defineConst('CMD_REBOOT', [0x08, 0x0d])
		this.defineConst('POWER_ON', 0x0f)
		this.defineConst('POWER_OFF', 0xf0)

		this.defineConst('CMD_CHANGE_PORT', [0x02, 0x03])
		this.defineConst('CMD_QUERY_ALL_PORTS', [0x02, 0x11])

		this.defineConst('CMD_SET_EDID', [0x03, 0x02])
		this.defineConst('CMD_SET_EDID_TO_ALL', [0x03, 0x01])
		this.defineConst('CMD_COPY_EDID', [0x03, 0x04])
		this.defineConst('CMD_COPY_EDID_TO_ALL', [0x03, 0x03])
	},
}
