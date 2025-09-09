Vielen Dank für die detaillierten Antworten. Basierend auf Ihren Entscheidungen ergibt sich folgende, geschärfte Spezifikation für den Prototyp von **MindForge: The Codex (Version 1.0)**.

---

### **Projektspezifikation: Prototyp V1 \- MindForge: The Codex**

Dieses Dokument fasst die technischen und funktionalen Entscheidungen für die erste Entwicklungsiteration zusammen. Das Ziel ist ein schneller, funktionaler Prototyp für den privaten Gebrauch, der die Kernhypothese der KI-gestützten Stofferfassung validiert.

#### **1\. Nutzererlebnis & Kernfunktionalität**

* **Interaktion und Onboarding:**  
  * Die Interaktion erfolgt ausschließlich über ein Chat-Interface.  
  * Es gibt keinen manuellen Einrichtungsprozess. Der KI-Tutor lernt den Stundenplan des Schülers implizit aus den täglichen Dialogen.  
  * Zu Beginn, ohne vorhandene Daten, fragt der Tutor offen, z.B. "Was gab es heute für Stunden?". Mit der Zeit wird er proaktiv die an einem Wochentag erwarteten Fächer ansprechen.  
* **Datenerfassung:**  
  * Die Eingabe von Lerninhalten ist multimodal möglich: per Texteingabe, Spracheingabe oder Foto-/Datei-Upload.  
* **Datenabfrage:**  
  * Die Abfrage erfolgt in natürlicher Sprache.  
  * Die Antworten werden vom LLM-Bot auf Basis einer Retrieval-Augmented Generation (RAG) generiert. Dabei greift der Bot auf im Hintergrund erstellte Zusammenfassungen ("Snippets") zu.  
  * Die Antworten enthalten keine Original-Inputs wie Bilder oder Audio-Dateien.  
* **Authentifizierung:**  
  * Die Authentifizierung erfolgt über einen OAuth-Flow. Google wird als initialer Provider implementiert.

#### **2\. Technologiestack & Architektur**

* **Frontend:** Es wird eine responsive, Mobile-First Web-Applikation mit **React** entwickelt. Auf serverseitiges Rendering (Next.js) oder native Frameworks (React Native) wird verzichtet, um eine klare API-Trennung zu gewährleisten.  
* **Backend:** Das Backend wird mit **Node.js** und dem **Express**\-Framework umgesetzt. Zukünftige, KI-spezifische Module können als separate Python-Services realisiert werden.  
* **Datenbank und Datenhaltung:**  
  * Als Datenbank wird **MongoDB** eingesetzt.  
  * Die Architektur basiert auf Event Sourcing. Es wird eine spezifische, "aggregateless" Implementierung ohne eine dedizierte Event-Store-Bibliothek angestrebt.  
* **Containerisierung:**  
  * Die Anwendung wird von Beginn an containerisiert. Für den Prototyp ist ein **Docker Compose**\-Setup ausreichend, das initial voraussichtlich nur einen Backend-Container umfassen wird.

#### **3\. Datenverarbeitung & KI**

* **KI-Tutor:** Der Chatbot ist ein **LLM-Bot**, der auf agentenähnlichen Workflows basiert, um Dialoge zu führen und Daten zu verarbeiten.  
* **Input-Verarbeitung:** Die Verarbeitung von Bild- und Sprachdaten erfolgt direkt über ein **multimodales Modell** eines externen Anbieters (z.B. OpenAI Vision). Es wird keine separate, selbst gehostete OCR- oder Speech-to-Text-Software implementiert.  
* **Datenaggregation (Kernprozess):**  
  * Anstelle einer einfachen Verschlagwortung wird ein Skript implementiert.  
  * Dieses Skript nimmt alle Inputs eines Faches für einen bestimmten Tag, berücksichtigt die bisherige Historie des Faches und lässt von einem LLM einen prägnanten **Plain-Text-Absatz** generieren, der den Inhalt des Tages zusammenfasst.  
  * Diese Zusammenfassungen sind die primäre Wissensbasis für die RAG-Funktion des Bots.

#### **4\. Abgrenzung des Prototyps (Scope)**

* **Definierter "Happy Path" für V1:**  
  1. Ein Schüler authentifiziert sich via Google (OAuth).  
  2. Der Chatbot fragt nach den heutigen Fächern.  
  3. Der Schüler lädt ein Foto seines Hefteintrags für Mathe hoch.  
  4. Das multimodale LLM extrahiert den Inhalt des Fotos.  
  5. Ein Hintergrundprozess generiert daraus eine textuelle Zusammenfassung für "Mathe" an diesem Tag und speichert sie in der Event-Datenbank.  
  6. Fragt der Schüler eine Woche später "Was haben wir letzte Woche in Mathe zum Thema X gemacht?", beantwortet der Bot die Frage mithilfe der generierten Zusammenfassungen.  
* **Explizit *außerhalb* des Scopes für V1:**  
  * Das Löschen oder Bearbeiten von Einträgen.  
  * Jegliche Gruppen- oder Kollaborationsfunktionen.  
  * Lehrer-Accounts.  
  * Komplexe, semantische Suchfunktionen.  
  * Alle aufbauenden Lernmodule wie Quizzes, Karteikarten etc..