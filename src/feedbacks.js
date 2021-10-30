const { arrayOf } = require('./utils')

module.exports = {
	initFeedbacks() {
		const feedbacks = {}
		const outputPorts = arrayOf(this.state.model.videoOutputs, 1).map((index) => ({
			id: index,
			label: `Output ${String.fromCharCode(index + 64)}`,
		}))
		const inputPorts = arrayOf(this.state.model.videoInputs, 1).map((index) => ({ id: index, label: `Input ${index}` }))

		feedbacks.selectedOutput = {
			type: 'boolean',
			label: 'Selected Output',
			description: 'Set color based on Selected Output',
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Output Port',
					id: 'selectedOutput',
					choices: outputPorts,
					default: 1,
				},
			],
			callback: ({ options }) => {
				return this.state.variables.selectedOutput.value === options.selectedOutput
			},
		}

		feedbacks.outputSetting = {
			type: 'boolean',
			label: 'Output Port Setting',
			description: 'Set color based on current Output setting',
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 0),
			},
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
				const selectedOutputPort = outputPort === 0 ? this.state.variables.selectedOutput.value : outputPort
				const outputVariable = `output${String.fromCharCode(selectedOutputPort + 64)}`
				return this.state.variables[outputVariable].value === inputPort
			},
		}

		feedbacks.beep = {
			type: 'boolean',
			label: 'Beep Status',
			description: 'Set color based on beep status',
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Beep Status',
					id: 'beep',
					choices: [
						{ id: 1, label: 'On' },
						{ id: 0, label: 'Off' },
					],
					default: 1,
				},
			],
			callback: ({ options }) => {
				const feedback = options.beep === 1
				return this.state.variables.beep.value === feedback
			},
		}

		feedbacks.power = {
			type: 'boolean',
			label: 'Power Status',
			description: 'Set color based on power status',
			style: {
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Power Status',
					id: 'power',
					choices: [
						{ id: 1, label: 'On' },
						{ id: 0, label: 'Off' },
					],
					default: 1,
				},
			],
			callback: ({ options }) => {
				const feedback = options.power === 1
				return this.state.variables.power.value === feedback
			},
		}

		this.setFeedbackDefinitions(feedbacks)
	},
}
