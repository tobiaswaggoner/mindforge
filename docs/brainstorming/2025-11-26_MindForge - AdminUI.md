# Admin UI

Wir wollen gerne das Admin UI für unsere Anwendung designen. Alles, was aktuell im Repository im Frontend drin ist, ist Scaffolding, das heißt, das ist nicht relevant und keine Ausgangsbasis, sondern das wurde im Prinzip einfach als schneller Test generiert.

Was wir machen werden, ist, wir bleiben beim Framework. Wir haben Next.js, wir haben Tailwind und wir haben ShadCN.

Ich werde jetzt hier in diesem Dokument die grundsätzliche Funktionalität beschreiben, und ich möchte, dass du deinen besten UX-Designer-Hut aufsetzt und dir überlegst, wie wir dieses Administrationsfrontend gestalten können, sodass auch für die Backend-Administration ein professionelles, smoothes Arbeiten möglich ist. 

## Beschreibung

wir bewegen uns hier im Content-Bereich der Anwendung, wie du wahrscheinlich aus den diversen Dokumenten siehst. Es handelt sich um eine leere Anwendung, das heißt, wir wollen es unseren Anwendern ermöglichen, sich im Prinzip in jedem Themengebiet, das man in irgendeiner Form an einem PC lernen kann oder fünf vor einem PC lernen kann oder auch an einem Handy sich zu erarbeiten.

Dazu wollen wir den Content dieser Topics in ein strukturiertes Format bringen. Ich verliebe dazu noch einige Konzeptpapiere und ein Teil des Details, in dem wir jetzt arbeiten, ist im Prinzip ein Assessment Teil. 

Unsere erste Zielgruppe sind Schüler der Mittelstufe bis Oberstufe, das heißt, sagen wir neunte Klasse bis dreizehnte Klasse. 

Wir haben hierzu das Dungeons and Diplomas Frontend bereits gebaut, oder ist es im Bau? Das ist ein Spiel, ein Dungeon Crawler, der im Prinzip ein Stealth Assessment durchführt. Das heißt, um zu gewinnen, muss der Schüler viele Fragen beantworten, die ihm die Gegner stellen. Die kommen aus unserer Datenbank raus. Das Konzept wird später nochmal deutlich umfangreicher, aber die Grundlage, die wir jetzt erst mal brauchen, ist unsere Datenbank. 

Im Architecture-Folder in den Docs ist das Datenbankschema beschrieben.

Der Kern der Anwendung ist eine AI Content Pipeline. Das heißt, der große Bottleneck bei solchen Anwendungen der Vergangenheit war immer die Contentgenerierung und die Moderation und Review dieses Contents.

Wir wollen hier eine sehr effiziente AI Pipeline aufbauen, die uns am Ende des Tages sukzessive den Content erstellt. Und wir werden dann über die Spieler Feedbacks feintunen und im Prinzip das Feedback dann aufbereiten, aber die grundsätzliche Generierung soll AI basiert sein. 

Gleichzeitig möchte ich aber die Möglichkeit haben, jeden einzelnen Bestandteil des Contents über diese Oberfläche zu editieren.

Das heißt, wenn irgendwo etwas drin steht, was ich gerne umformulieren möchte, wenn ich also konkret darauf hingewiesen werde, möchte ich in einem UI im Prinzip nach dem Bestandteil suchen können und editieren können.

Oder ich möchte auch, wenn ich das partout machen möchte, von Hand etwas hinzufügen können und entfernen können. Deswegen haben wir hier diesen Editor im Frontend.

Das heißt, primäre Anwendung ist generieren, und sekundäre Anwendung ist manuell moderieren. Das sind die Fokus in diesem UI. 

Im Rahmen dieser Aufgabe wollen wir noch keinerlei echte Backend-Anbindungen bauen, auch wenn wir das Backend schon hier haben, zum Teil. Das soll ein reiner UI-Spike werden mit gemockten Daten. 

Ich beschreibe mal ein paar typische Flows.

Wir haben ja in unserem Schema bis jetzt, in unserem abgespeckten kleinen Schema, als oberen Bereich das Subject. Zum Beispiel ein Schulfach Mathematik, ich würde es eingrenzen auf Mathematik 9. Klasse oder vielleicht sogar Mathematik 9. Klasse Algebra oder sowas.

Ist egal, wie das Subject definiert ist, der obere ist im Moment das Subject. Das wird später im Rahmen unseres Knowledge State Theory Ansatzes noch deutlich ausgebaut, diese Content Verwaltung. 

Stand jetzt ist es das Subject. Zu diesem Subject sollen uns nun die KI-Fragen generieren. Diese Fragen sollen dann variiert werden. Das heißt, wir brauchen potenziell sehr viele Fragevarianten, um ein auswendig lernende Frage zu vermeiden. Und dann die entsprechenden Antworten dazu. 

Die Antworten werden nicht ganz zufällig generiert, sondern wir werden bestimmte Distraktoren auflisten. Das ist in erster Linie eine Prompting-Frage. 

Die Implementation, wie das gemacht wird, ist nicht Bestandteil des UIs.

Der Grundansatz ist der, dass wir im Prinzip das Subject haben und dieses Subject dann zunächst einmal in Topics auftrödeln mit Dingen, die zu wissen sind.

Das wird später im Sinne der Knowledge Space Theory das eigene Datenbank-Einträge werden. Stand jetzt haben wir das noch nicht. Das heißt, stand jetzt würde ich schlicht und ergreifend in der Beschreibung des Subjects diese Wissensgebiete auflisten. 

Und ich möchte jetzt im Prinzip über einen Button neue Fragen zu einem Wissensgebiet generieren können.

Das heißt, ich möchte im Prinzip im Hintergrund einen Job starten, der mir sagt: Hier ist das Subject, generiere mir bitte 30 neue Fragen dazu. Die KI wird im Hintergrund die Deduplizierung und alles übernehmen.

Das ist relevant für uns. Wir brauchen im Prinzip nur den Status und den Stand des Tasks, des Fragengenerierungstasks. 

Was wir haben werden ist, dass jeder generierte Content, egal ob das Fragen oder Antworten oder später andere Dinge sind, wird über eine Tracking-Tabelle mit dem Task verknüpft.

Das heißt, während der Task läuft und wenn der Task abgeschlossen ist, kann ich mir im Prinzip die Ergebnisse, sprich alle generierten, veränderten, gelöschen, gesponserten Inhalte, dann im Detail anzeigen.

Für jetzt generiert uns der Task vor allem Frage-Kategorien im ersten Durchlauf, und wenn er die generiert hat, kann ich dann für jede einzelne Fragenkategorie Varianten mit Antworten generieren.

Das heißt, wir haben zwei verschiedene Arten von Tasks. Am Ende des Tages will ich sie allerdings gleichzeitig spawnen. Die Job-Anfrage wird sein: Generiere mir zehn neue Fragen mit jeweils zehn Varianten und default sind vier Antworten dazu.

Das heißt, das ist ein Job, und wenn dieser Job läuft, will ich quasi eine Progress-Anzeige haben. Am Ende muss ich die Ergebnisse anschauen können und auch potenziell editieren können. 

Und dieses Editieren ist das zweite Teil des UIs. Das heißt, wir haben quasi diese Jobsteuerung, wo ich bestimmte Aufgaben für die Generierung von Content da kommt, später noch mehr dazu abschicken kann.

Das ist dann so eine Art Queue, wo man Fortschritt anschauen kann, und dann quasi die Ergebnisse jedes einzelnen Jobs anschauen kann. Es soll möglich sein, einen Job komplett zu reverten. Wir haben ja alle Daten in dem Delta drin.

Die technische Implementierung ist uninteressant für das Frontend, aber es gibt quasi einen Ablehnen und Akzeptieren Knopf. 

Und wenn man es ablehnt, werden schlicht und ergreifend alle Änderungen rückgängig gemacht, die Implementierung dazu erfolgt separat. 

Für das UI bedeutet das, dass wir das Editieren momentan von Subject, Frage, Kategorie, Fragen und Antworten in einem möglichst plausiblen, schönen UI machen wollen. Mit allen Datenfeldern, die aktuell definiert sind. 

Und ich stelle mir vor, dass man zum Beispiel einen großen Filter oben drauf setzt mit einer Suchfunktion. Eine der Filtermöglichkeiten ist es, dass wir auf einen bestimmten ChangeSet filtern. Das heißt, ein Generierungslauf.

Das heißt, wenn ein Task abgeschlossen ist, oder auch so lange er noch läuft, kann ich im Prinzip den ganz normalen Editor-Ansicht mir anschauen und kann mir im Prinzip alle Änderungen zu dieser Task-ID anschauen.

Und kann während der Task noch läuft, oder wenn abgeschlossen ist, kann ich da auch direkt editieren. Das Akzeptieren der Änderungen ist im Prinzip nur ein formaler Schritt, also wir machen keine temporären Dinge. Das heißt, die sind sofort in der Datenbank drin.

Aber das Reverten von neuem Content ist dann über die Tasksteuerung möglich. 

Zusätzlich möchte ich neben dem Generieren von komplett neuen Fragekategorien auch sagen können, generiere mir zu einer bestimmten Fragekategorie n neue Fragen mit Antworten. Das wäre quasi die Variante, ein Task mit einem etwas kleinerem Scope.

Und ich möchte auch sagen können, generiere mir komplett neue Antworten zu einer konkreten Fragevariante, wenn mir die Antworten nicht gefallen. 

Zu jeder dieser Tasks gibt es ein großes Freitextfeld, quasi ein Prompt. Das heißt, ich kann, wenn ich das möchte, der KI die nachher den Content generiert, beliebig umfangreiche Zusatzinformationen mitgeben.

Das heißt, es gibt ein großes Anweisungs-Prompt, aber ein einziges Textfeld. 

Also, TLDR:

Wir brauchen für diesen Bereich ein Task Management, wo ich steuern kann und die laufenden Tasks und historischen Tasks mir anschauen kann.

Wenn ich diese anschaue in der Liste, bekomme ich im Prinzip so eine Zusammenfassung.

Wenn ich die Ergebnisse dieses Tasks editieren will, dann springe ich auf die andere Ansicht, auf die Content Edit. Und habe quasi vorgegeben den Filter dieses Tasks so dass ich nur noch die Änderungen sehe, die im Rahmen dieses Tasks erstellt worden sind. 

In der Edit-Ansicht möchte ich quasi Subjects-Frage, Kategorien, Cluster, Fragevarianten und Antworten editieren können, mit all ihren Feldern in einer möglichst useable Variante.

Das heißt, ich möchte keinen dicken Tree oder sowas haben, sondern das soll wirklich intuitiv bedienbar sein.

Da müssen am meisten drüber brainstormen. 

Diese Editierungsseite muss die Möglichkeit haben, weitere Tasks zu starten.

Das heißt, wenn ich zum Beispiel ein Subject editiere, sollte quasi ein Button drauf sein, generiere neue Fragen.

Bei einer Frage kann ich sagen, generiere mir neue Varianten.

Bei einer Variante kann ich sagen, regeneriere mir die Antworten.

In jedem dieser Fälle möchte ich im Prinzip einen Text eingeben können.

Ich denke, dass wir das Starten eines solchen Tasks über einen modalen Dialog machen sollten.

Das heißt, es gibt einen gewissen Kontext, was er tun soll und das heißt, auf welches Item bezieht sich es?

Was für ein Typ von Task ist es? Mit einem Freitext unten drin und einem Go-Button, der dann im Prinzip den Task definiert. Task, Tasksteuerung und State ist noch nicht in der Datenbank definiert. Da sind wir jetzt momentan noch frei.

Wir implizieren ein plausibles Datenbankschema. Die Fragen etc., die sind bereits definiert. Da müssen wir uns an das Datenbankschema halten, was schon existiert. 

Wichtig: Wir implementieren hier einen UI Prototyp komplett ohne Backend-Anbindung. Es geht wirklich rein ums Design und die Usability.

Wir sollten den Fokus ganz klar darauf legen, eine sehr aufgeräumte, gut aussehende Admin-Oberfläche zu machen, mit modernen Effekten, Schatten und whatnot, was man so eine Anwendung rein macht.

Wir haben relativ viel Information, das heißt, die Informationen sollten relativ kompakt dargestellt werden, nicht zu viel White Space, aber natürlich auch nicht zu eng, alles auf dem Screen.

Also Fokus ist wirklich auf UX und auf Design. 

Von der Vorgehensweise her würde ich vorschlagen, dass wir uns zunächst einmal verbal ein grobes Layout und einen groben Plan machen und du dann die Implementierung übernimmst und ein schönes Frontend machst. 

Etwas umfassenderer Kontext zum geplanten späteren Umfang hier:

https://tobiaswaggoner.github.io/mindforge_work/05_REFERENCE_LIBRARY/Concepts/Knowledge%20Space%20Theory/#der-prozess-flow
https://tobiaswaggoner.github.io/mindforge_work/05_REFERENCE_LIBRARY/Concepts/2025-11-22%20Mindforge%20Content%20Ideas/
https://tobiaswaggoner.github.io/mindforge_work/05_REFERENCE_LIBRARY/Concepts/2025-11-22%20Lernkonzept-Ausbau_%20Motivation%20und%20Wissensaufbau/