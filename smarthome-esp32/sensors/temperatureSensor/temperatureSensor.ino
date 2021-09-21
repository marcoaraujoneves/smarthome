#define adcVoltageReference 5000.0
#define adcResolution 4096.0
#define sensorPin A0

void setup()
{
  Serial.begin(9600);
}

void loop()
{
  int adcValue = analogRead(sensorPin);
  float adcInMilliVolt = adcValue * (adcVoltageReference / adcResolution);
  float temperatureInCelcius = adcInMilliVolt / 10;

  Serial.print("Temperature: ");
  Serial.print(temperatureInCelcius);
  Serial.println("°C");

  delay(1000);
}
