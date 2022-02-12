#include "wifiConnector.h"
#include "secrets.h"
// Firebase dependencies
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Sensor constants
#define adcVoltageReference 5000.0
#define adcResolution 4096.0
#define sensorPin A0

FirebaseData firebaseDataObject;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

enum STATES
{
  CONNECTING,
  CONNECTED,
  SUCCESS,
  FAILED,
  SCANNING,
  WAITING
};

enum STATES currentState;

bool connectionSuccess;

float getTemperature()
{
  int adcValue = analogRead(sensorPin);
  float adcInMilliVolt = adcValue * (adcVoltageReference / adcResolution);
  float temperatureInCelcius = adcInMilliVolt / 10;

  return temperatureInCelcius;
}

void signupToFirebase()
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

void processComponentWork()
{
  if (Firebase.ready() && signupOK)
  {
    float temperature = getTemperature();

    if (Firebase.RTDB.setFloat(&firebaseDataObject, "component/" + COMPONENT_ID + "/reads", temperature))
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
  else
  {
    signupToFirebase();
  }
}

void setup()
{
  Serial.begin(115200);

  getStoredCredentials();

  if (ssid != "" && password != "")
  {
    currentState = CONNECTING;
  }
  else
  {
    currentState = SCANNING;
  }
}

void loop()
{
  switch (currentState)
  {
  case CONNECTED:
    Serial.println("CONNECTED");

    processComponentWork();

    delay(10000);
    break;

  case SCANNING:
    Serial.println("SCANNING");

    getAvailableNetworks();

    currentState = WAITING;
    break;

  case WAITING:
    Serial.println("WAITING");

    if (BLEDevice::getInitialized() == false)
    {
      initBLE();
      delay(2000);
    }

    if (ssid != "" && password != "")
    {
      currentState = CONNECTING;
    }

    delay(5000);
    break;

  case CONNECTING:
    Serial.println("CONNECTING");

    connectionSuccess = connectToWiFi(ssid, password);

    currentState = connectionSuccess ? SUCCESS : FAILED;
    break;

  case FAILED:
    Serial.println("FAILED");

    ssid = "";
    password = "";
    connectionError = true;
    currentState = SCANNING;
    break;

  case SUCCESS:
    Serial.println("SUCCESS");

    saveCredentials();

    if (BLEDevice::getInitialized() == true)
    {
      finishBLE();
    }

    connectionError = false;
    currentState = CONNECTED;
    break;

  default:
    break;
  }
}
