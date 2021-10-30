const { arrayOf } = require('./utils')

module.exports = {
	initVariables() {
		this.state.variables = {}

		arrayOf(this.state.model.videoOutputs, 1).forEach((index) => {
			const name = `output${String.fromCharCode(index + 64)}`
			const label = `Output ${String.fromCharCode(index + 64)}`
			this.state.variables[name] = { name, label, value: 0 }
		})

		this.state.variables.selectedOutput = {
			name: 'selectedOutput',
			label: 'Selected Output',
			value: 1,
			getValue: (value) => String.fromCharCode(value + 64),
			checkFeedback: () => this.checkFeedbacks('selectedOutput'),
		}

		this.state.variables.beep = {
			name: 'beep',
			label: 'Beep',
			value: false,
			getValue: (value) => (value ? 'ON' : 'OFF'),
			checkFeedback: () => this.checkFeedbacks('beep'),
		}

		this.state.variables.power = {
			name: 'power',
			label: 'Power',
			value: false,
			getValue: (value) => (value ? 'ON' : 'OFF'),
			checkFeedback: () => this.checkFeedbacks('power'),
		}

		this.setVariableDefinitions(
			Object.keys(this.state.variables).map((name) => ({
				label: this.state.variables[name].label,
				name: this.state.variables[name].name,
			}))
		)

		// Set initial values
		Object.keys(this.state.variables).forEach((name) => {
			const variable = this.state.variables[name]
			let value = variable.value

			if (typeof variable.getValue === 'function') {
				value = variable.getValue(value)
			}

			this.setVariable(name, value)
		})

		this.checkFeedbacks()
	},

	updateVariable(name, value) {
		const variable = this.state.variables[name]

		if (variable.value !== value) {
			variable.value = value

			if (typeof variable.getValue === 'function') {
				this.setVariable(name, variable.getValue(value))
			} else {
				this.setVariable(name, value)
			}

			if (typeof variable.checkFeedback === 'function') {
				variable.checkFeedback()
			}
		}
	},

	updatePortVariable(inputPort, outputPort) {
		this.updateVariable(`output${String.fromCharCode(outputPort + 64)}`, inputPort)
	},

	updateAllPortVariables(data = []) {
		const updated = data.filter((value, index) => {
			const name = `output${String.fromCharCode(index + 65)}`
			if (value !== this.state.variables[name].value) {
				this.updateVariable(name, value)
				return true
			}
			return false
		})

		if (updated.length) {
			this.checkFeedbacks()
		}

		return updated.length
	},
}
