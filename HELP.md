## Blackbird HDMI Matrix

Companion module to control Blackbird™ HDMI Matrix devices. Currently only supports the "Blackbird™ HDMI Matrix 8x8 4K 60Hz HDR" model. Support for other models can be added upon request. 

### Configuration

You will need the IP address of your HDMI Matrix device. The IP can be easily obtained via
the front panel of your device by pressing the "MENU" button, the use the down arrow until you reach "5. View IP", then press the right arrow to reveal the device's IP Address.

1. the Target IP (the device IP address)
2. the Model (only the "Blackbird™ HDMI Matrix 8x8 4K 60Hz HDR" model is supported at he moment).
3. Polling Interval in milliseconds (how often them module will poll the device)

### Actions

1. Select Output - Sets the internal `selectedOutput` variable to a specific output. Used with the "Set Port" action with "Selected Output" is specified for the "Output Port" - *Added v1.0.0*
2. Set Beep - Turns device beep ON/OFF - *Added v1.0.0*
3. Set Power - Powers device ON/OFF - *Added v1.0.0*
4. Set Port - Sets an "Output Port" to a specified "Input Port
 - *Added v1.0.0*

### Feedbacks

1. Selected Output - Set color based on Selected Output - *Added v1.0.0*
2. Output Port Setting - Set color based on current Output setting - *Added v1.0.0*
3. Beep Status - Set color based on beep status - *Added v1.0.0*
4. Power Status - Set color based on power status - *Added v1.0.0*

### Variables

1. `outputX` - Variables for every output, the value of which represents the current input - *Added v1.0.0*
2. `selectedOutput` - Output selected using the "Select Output" action - *Added v1.0.0*
3. `beep` - Device "beep" status - *Added v1.0.0*
4. `power` - Device "power" status - *Added v1.0.0*

### Presets

We've included presets in the following categories:

1. Set Output *X* to Input *Y* - *Added v1.0.0*
2. Select Outputs - *Added v1.0.0*
3. Set Selected Output to Input *Y* - *Added v1.0.0*
4. Beep On/Off - *Added v1.0.0*
5. Power On/Off - *Added v1.0.0*