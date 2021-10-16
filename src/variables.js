module.exports = {
	/**
	 * Replace with your variables
	 * see https://github.com/bitfocus/companion/wiki/Variables
	 * use this variable with $(instancename:sample_variable)
	 */
	initVariables() {
		const variableDefinitions = [
			{
				label: 'Sample Variable',
				name: 'sample_variable',
			},
		]

		this.setVariableDefinitions(variableDefinitions)

		// Set initial values
		self.setVariable('sample_variable', 'Default Value')
	},
}
