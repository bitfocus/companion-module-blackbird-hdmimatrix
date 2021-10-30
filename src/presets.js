const { arrayOf } = require('./utils')

module.exports = {
	initPresets() {
		let presets = []

		// Set Outout ... Presets
		for (let outputPort = 1; outputPort <= this.state.model.videoOutputs; outputPort++) {
			presets = [
				...presets,
				...arrayOf(this.state.model.videoInputs, 1).map((inputPort) => ({
					category: `Set Output ${String.fromCharCode(outputPort + 64)}`,
					label: `Set Output ${String.fromCharCode(outputPort + 64)} to Input ${inputPort}`,
					bank: {
						style: 'text',
						text: `Out: ${String.fromCharCode(outputPort + 64)}\\nIn: ${inputPort}`,
						size: 18,
						color: this.rgb(255, 255, 255),
						bgcolor: this.rgb(0, 0, 0),
					},
					actions: [
						{
							action: 'setPort',
							options: { outputPort, inputPort },
						},
					],
					feedbacks: [
						{
							type: 'outputSetting',
							options: { outputPort, inputPort },
							style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
						},
					],
				})),
			]
		}

		presets = [
			...presets,

			// Select Outputs Presets
			...arrayOf(this.state.model.videoOutputs, 1).map((index) => ({
				category: 'Select Outputs',
				label: `Select Output ${String.fromCharCode(index + 64)}`,
				bank: {
					style: 'text',
					text: `Select\\n${String.fromCharCode(index + 64)}`,
					size: 24,
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'selectOutput',
						options: { outputPort: index },
					},
				],
				feedbacks: [
					{
						type: 'selectedOutput',
						options: { selectedOutput: index },
						style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
					},
				],
			})),

			// Set Selected Output Presets
			...arrayOf(this.state.model.videoInputs, 1).map((inputPort) => ({
				category: 'Set Selected Output',
				bank: {
					style: 'text',
					text: `Input\\n${inputPort}`,
					size: 24,
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'setPort',
						options: { outputPort: 0, inputPort },
					},
				],
				feedbacks: [
					{
						type: 'outputSetting',
						options: { outputPort: 0, inputPort },
						style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
					},
				],
			})),

			// Beep Presets
			{
				category: 'Beep',
				label: 'Beep On',
				bank: {
					style: 'text',
					text: 'Beep\\nON',
					size: 24,
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'setBeep',
						options: { beep: 1 },
					},
				],
				feedbacks: [
					{
						type: 'beep',
						options: { beep: 1 },
						style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
					},
				],
			},
			{
				category: 'Beep',
				label: 'Beep Off',
				bank: {
					style: 'text',
					text: 'Beep\\nOFF',
					size: 24,
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'setBeep',
						options: { beep: 0 },
					},
				],
				feedbacks: [
					{
						type: 'beep',
						options: { beep: 0 },
						style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
					},
				],
			},

			// Power Presets
			{
				category: 'Power',
				label: 'Power On',
				bank: {
					style: 'text',
					text: 'Power\\nON',
					size: 24,
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'setPower',
						options: { power: 1 },
					},
				],
				feedbacks: [
					{
						type: 'power',
						options: { power: 1 },
						style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
					},
				],
			},
			{
				category: 'Power',
				label: 'Power Off',
				bank: {
					style: 'text',
					text: 'Power\\nOFF',
					size: 24,
					color: this.rgb(255, 255, 255),
					bgcolor: this.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'setPower',
						options: { power: 0 },
					},
				],
				feedbacks: [
					{
						type: 'power',
						options: { power: 0 },
						style: { color: 0, bgcolor: this.rgb(255, 0, 0) },
					},
				],
			},
		]

		this.setPresetDefinitions(presets)
	},
}
