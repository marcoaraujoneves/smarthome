#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
// Firebase dependencies
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Firebase constants
#define API_KEY "ENTER_YOUR_DATA"
#define DATABASE_URL "ENTER_YOUR_DATA"
// Sensor constants
#define adcVoltageReference 5000.0
#define adcResolution 4096.0
#define sensorPin A0

Preferences preferences;

FirebaseData firebaseDataObject;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

bool connectToWiFi()
{
  preferences.begin("credentials", true);

  String WIFI_SSID = preferences.getString("WIFI_SSID", "");
  String WIFI_PASSWORD = preferences.getString("WIFI_PASSWORD", "");

  preferences.end();

  if (WIFI_SSID == "" || WIFI_PASSWORD == "")
  {
    return false;
  }
  else
  {
    WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
    Serial.println("Connecting to Wi-Fi ...");

    while (WiFi.status() != WL_CONNECTED)
    {
      delay(300);
    }

    Serial.println("Connected");
    return true;
  }
}

void savePasswordCredentials(String ssid, String password)
{
  preferences.begin("credentials", false);

  preferences.putString("WIFI_SSID", ssid);
  preferences.putString("WIFI_PASSWORD", password);

  preferences.end();

  delay(1000);
  connectToWiFi();
}

float getTemperature()
{
  int adcValue = analogRead(sensorPin);
  float adcInMilliVolt = adcValue * (adcVoltageReference / adcResolution);
  float temperatureInCelcius = adcInMilliVolt / 10;

  return temperatureInCelcius;
}

void setup()
{
  Serial.begin(115200);

  bool successfullyConnected = connectToWiFi();

  if (successfullyConnected)
  {
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    // Anonymous sign-in
    if (Firebase.signUp(&config, &auth, "", ""))
    {
      signupOK = true;
    }
    else
    {
      Serial.printf("%s\n", config.signer.signupError.message.c_str());
    }

    config.token_status_callback = tokenStatusCallback;

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
  }
}

void loop()
{
  if (Firebase.ready() && signupOK)
  {
    float temperature = getTemperature();

    if (Firebase.RTDB.setFloat(&firebaseDataObject, "test/temperature", temperature))
    {
      Serial.println("PASSED");
      Serial.println("PATH: " + firebaseDataObject.dataPath());
      Serial.println("TYPE: " + firebaseDataObject.dataType());
    }
    else
    {
      Serial.println("FAILED");
      Serial.println("REASON: " + firebaseDataObject.errorReason());
    }
  }

  delay(10000);
}
