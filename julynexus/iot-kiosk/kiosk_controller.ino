#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Initialize I2C LCD (Address 0x27 or 0x3F, 16 columns, 2 rows)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pin Definitions
const int PIR_PIN      = 2;  // Motion Sensor
const int BUTTON_PIN   = 3;  // Emergency Civic Report Button
const int GREEN_LED    = 4;  // Verified Status LED
const int RED_LED      = 5;  // Alert LED
const int BUZZER_PIN   = 6;  // Audio feedback

// System Variables
int pirState = LOW;
int buttonState = 0;
bool kioskActive = false;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  Serial.begin(9600);

  // Initialize LCD
  lcd.init();
  lcd.backlight();

  // Welcome Banner
  lcd.setCursor(0, 0);
  lcd.print("JulyNexus Kiosk");
  lcd.setCursor(0, 1);
  lcd.print("Spirit of July ");
  delay(2000);
  lcd.clear();
}

void loop() {
  pirState = digitalRead(PIR_PIN);
  buttonState = digitalRead(BUTTON_PIN);

  // Scenario 1: Citizen Approaches Kiosk
  if (pirState == HIGH) {
    if (!kioskActive) {
      kioskActive = true;
      digitalWrite(GREEN_LED, HIGH);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Welcome Citizen!");
      lcd.setCursor(0, 1);
      lcd.print("Tap Card / Tribute");

      // Welcome Tone
      tone(BUZZER_PIN, 1000, 200);
    }
  } else {
    if (kioskActive) {
      kioskActive = false;
      digitalWrite(GREEN_LED, LOW);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Spirit of July");
      lcd.setCursor(0, 1);
      lcd.print("Truth & Dignity");
    }
  }

  // Scenario 2: Offline Emergency/Civic Report Button Pressed
  if (buttonState == HIGH) {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, HIGH);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("OFFLINE REPORT!");
    lcd.setCursor(0, 1);
    lcd.print("Logged to Vault");

    // Alarm Tone
    tone(BUZZER_PIN, 2000, 500);
    delay(500);
    tone(BUZZER_PIN, 1500, 500);

    Serial.println("EVENT_LOGGED: Offline Civic Alert Registered at Kiosk #01");

    delay(2000);
    digitalWrite(RED_LED, LOW);
    if (kioskActive) digitalWrite(GREEN_LED, HIGH);
    lcd.clear();
  }

  delay(100); // Short stability delay
}