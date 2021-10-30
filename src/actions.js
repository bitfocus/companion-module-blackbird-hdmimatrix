const { arrayOf } = require('./utils')

module.exports = {
	initActions() {
		const actions = {}
		const outputPorts = arrayOf(this.state.model.videoOutputs, 1).map((index) => ({
			id: index,
			label: `Output ${String.fromCharCode(index + 64)}`,
		}))
		const inputPorts = arrayOf(this.state.model.videoInputs, 1).map((index) => ({ id: index, label: `Input ${index}` }))

		actions.selectOutput = {
			label: 'Select Output',
			options: [
				{
					type: 'dropdown',
					label: 'Output Port',
					id: 'outputPort',
					choices: outputPorts,
					default: 1,
				},
			],
			callback: ({ options }) => {
				this.updateVariable('selectedOutput', options.outputPort)
				this.checkFeedbacks()
			},
		}

		actions.setBeep = {
			label: 'Set Beep',
			options: [
				{
					type: 'dropdown',
					label: 'Beep Status',
					id: 'beep',
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
					],
					default: 0,
				},
			],
			callback: ({ options }) => {
				this.setBeep(options.beep === 1)
			},
		}

		actions.setPower = {
			label: 'Set Power',
			options: [
				{
					type: 'dropdown',
					label: 'Power Status',
					id: 'power',
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
					],
					default: 0,
				},
			],
			callback: ({ options }) => {
				this.setPower(options.power === 1)
			},
		}

		actions.setPort = {
			label: 'Set Port',
			options: [
				{
					type: 'dropdown',
					label: 'Output Port',
					id: 'outputPort',
					choices: [...outputPorts, { id: 0, label: 'Selected Output' }],
					default: 1,
				},
				{
					type: 'dropdown',
					label: 'Input Port',
					id: 'inputPort',
					choices: inputPorts,
					default: 1,
				},
			],
			callback: ({ options: { inputPort, outputPort } }) => {
				const selectedOutput = outputPort === 0 ? this.state.variables.selectedOutput.value : outputPort
				this.setPort(inputPort, selectedOutput)
			},
		}

		this.setActions(actions)
	},
}
