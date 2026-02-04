# The Codex - Initiales Brainstorming
*Datum: 2025-09-09*

Das hier ist das initiale Brainstorming zu unserem ersten Modul für unser MindForge-Projekt im Rahmen der Blooms Forge Initiative. 

Da zu diesem Zeitpunkt noch nichts davon definiert ist. Ganz kurz ein bisschen Kontext:

Wir wollen in den nächsten Monaten ein open source Projekt starten, das potenziell kommerzialisiert werden soll. Das Projekt wird sich mit dem Lernen, AI-gestütztem Lernen in der Schule beschäftigen.

Der Grundimpuls ist die Studie von Benjamin Bloom aus den 1980er Jahren, der sich damit beschäftigt hat, welchen Einfluss ein eins zu eins Tutoring in Kombination mit Mastery Learning auf den Lernerfolg hat im Vergleich zu klassischem Gruppenunterricht und Frontalunterricht. 

Diese Studie hat ergeben, dass das 1:1 Tutoring mit Mastery Learning eine Verschiebung des Lernerfolgs und bis zu zwei Standardabweichungen bewirkt.

Das heißt also eine signifikante Verbesserung der Leistung der Schüler. Benjamin Bloom hat als Problem natürlich definiert, dass das ein Skalierungsproblem ist, weil ich nicht für jeden Schüler einen menschlichen Lehrer habe.

Und hier kommen wir jetzt zum AI-Teil. Heutige generative KI ist in der Lage Lehrer dramatisch zu unterstützen und zu skalieren, und die Blooms Forge Initiative ist im Prinzip der Rahmen, wo wir versuchen, diesen Skalierungseffekt zu maximieren.

Also, Blooms Forge ist die Initiative und im Prinzip der potenzielle Name für die zu gründende Company. Der Produktname aktuell, der ist quasi der Rahmenname für die Produkte, die wir machen, ist daraus der Mind Forge. Das heißt, das ist die Sammlung aller Module und Dinge, die nachher entwickelt werden.

Im Rahmen dieses Mind Forge Projektes wollen wir nun ein erstes Modul schaffen, ein ganz einfaches. Das heißt, der Codex, "The Codex".

Hintergrund dieses Moduls ist die Beobachtung bei meinen eigenen Kindern, dass eine der Hauptprobleme bei der Vorbereitung auf Prüfungsklassenarbeiten oder überhaupt bei der Erarbeitung des Stoffes ist, dass die Kinder natürlich bis zu 15 Fächer pro Woche haben, das heißt, einen permanenten Context-Switch.

Und dass es deswegen unglaublich schwierig ist, sich zu erinnern, was heute in welchem Fach in der Schule gewesen ist. Noch schlimmer wird es, wenn ich frage, was gestern in der Schule war, und das überhaupt nicht mehr geht, was letzte Woche in der Schule war.

Das heißt, die Kinder müssen im Prinzip permanent nachblättern, was sie überhaupt gemacht haben, weil einfach die mentalen Rüstkosten so hoch sind, dass man diese vielen Fächer gar nicht im Kopf jonglieren kann. 

Und hier kommt jetzt unser erstes Modul ins Spiel. Was ich gerne machen möchte ist: Ich möchte eine erste Iteration machen, wo im Prinzip die Schüler täglich erfassen, was sie in welchem Unterricht gemacht haben, und das auf einer möglichst KI-gestützten Weise.

Das heißt, diese Erfassung – die eigentliche Applikation – wird nachher sowohl PC-basiert sein für die Hauptarbeiten, als auch App-gestützt für Mobile. Hier würde ich gerne im Mobile-Bereich anfangen und den Schülern die Möglichkeit geben, für jedes Fach, das gewesen ist heute am Tag, zu erfassen, was im Unterricht behandelt wurde. Entweder in Form von einer verbalen Aufzeichnung (per Spracherkennung) oder per Texteingabe, oder als Foto von Mitschrieben oder Foto von Schulbuchseiten etc.

Im Endeffekt geht es einfach darum, dass wir eine Abfrage machen, wo die Schüler für jedes Fach eines Tages nur in irgendeiner ganz kurzen Art und Weise mit wenig Minuten Aufwand protokollieren können, was sie gemacht haben. 

Dieser Codex, der dort entsteht, also dieses Backlog, dieses Journal, wird später einer der wichtigsten Elemente sein für die eigentlichen Anwendungen. Weil in dem Moment, wo ich einen Kontext darüber habe, was tatsächlich behandelt wurde, kann ich sehr konkret nachher KI-gestützt das Lernen unterstützen. Insbesondere auch, da wir ja noch Frontalunterricht und Gruppenunterricht haben bei der Vorbereitung auf Prüfungen.

Bei der Wiederholung von Stoff, der eventuell vergessen wurde. Dinge, die vor einem halben Jahr gemacht wurden. Wenn ich da sehe, es gibt Verständnisprobleme, kann ich auf diese Sachen wieder zurückgreifen. 

Das heißt, der Kodex ist im Prinzip die Wissensbasis.

In unserem ersten Modul, das wir jetzt anfangen wollen, gibt es noch keinerlei Anwendungen dazu. In unserem ersten Modul geht es darum, dass wir das erfassen wollen und dass ich den Schülern eine Möglichkeit geben möchte, sich wieder erinnern zu lassen, was in einem bestimmten Fach in welchem Zeitraum gemacht wurde. 

Eine wichtige konzeptionelle Sache, das ist jetzt ein bisschen technisch. Ich möchte, dass die ganze Anwendung auf Event Sourcing basiert, das heißt, ich möchte, dass User Interface und die Datenhaltung append-only machen, um sicherzustellen, dass ein potenzielles KI-Analyse-Tool auf historische Kontextinformationen und Zeitdaten zurückgreifen kann.

Das heißt, wann hat sich wie was verändert. Beim Codex ist das jetzt noch nicht so dramatisch wichtig, aber bei allen Dingen, wenn es um Leistungskurven geht, um Abfragen, Quizze, kommt der zeitliche Aspekt ganz stark ins Konzept mit rein.

Deswegen möchte ich im Prinzip hier ein Event Sourcing Ansatz fahren. 

Wo ich noch nicht ganz schlüssig bin, ist über den Text Stack. Eigentlich bin ich selber zu Hause im.Net Bereich. Allerdings habe ich das Gefühl, dass wir sehr stark mit Chasen Daten und mit nicht stark typisierten Daten arbeiten werden.

Gerade in den kommenden Modulen, die ich mir vorstelle, wird sehr viel dynamische Information gehalten werden, und die Vorteile der starken Typisierung fallen weg, wenn ich sehr viele Typenvarianten behandeln muss.

Deswegen wäre eine der ersten Entscheidungen, die wir treffen müssen, ob wir richtung starke Typisierung in.Net gehen wollen oder ein Node Chairs basiertes Backend bauen, das wahrscheinlich mit dem Frontend zusammenpassen würde. Ich geh momentan von einem React Frontend aus ohne serverseitiges Rendering (also kein NextJs) aus.

Eine andere Variante wäre, wenn wir einen extrem heftigen KI-Anteil überall produzieren werden, wäre Python natürlich eine natürliche Variante für das Backend. 

Last but not least, die Grundarchitektur soll sich einmal in Richtung auf eine serviceorientierte Architektur mit verschiedenen Modulen, die jeweils in Containern gehostet werden, hin etablieren.

Das heißt, ich möchte von Anfang an containerisieren. Wir haben zwar ein Mono-Repo und wir werden auch die erste Anwendung mehr oder weniger monolithisch bauen.

Aber die Grundidee ist, dass wir gerade die Dinge, die später asynchron laufen, in separaten Containern basieren können. Das Event Sourcing insbesondere in Verbindung mit CQRS bietet sich auch an für diese Art von Verteilung. 

Und dann haben wir noch das Problem der Datenhaltung, d.h. ich habe entweder eine relationelle Datenbank als Haupt-Backend-Store im Blick, oder aber tatsächlich eine NoSQL-Datenbank wie MongoDB.

Die erstere hätte den Vorteil, dass wir potentiell aggregierte Queries, wo sehr viel strukturierte Daten entstehen, leichter aggregieren können, d.h. Views bauen können.

Die MongoDB hat den Vorteil, dass wir da wir mit potenziell schwach typisierten Daten und einem Payload in dem Eventstore arbeiten, dass wir dort vermutlich mehr Flexibilität erreichen.

Eine aktuelle Spekulation ist, dass es auf beides rausläuft. Wir werden mit einem einer MongoDB starten und dann über das Event-Sourcing Projektionen bei Bedarf eine relationelle Datenbank erstellen. 

Okay, das soll es mal sein für das allererste Brainstorming.
Wir wollen jetzt eine Applikation bauen, die es über eine Handy-Applikation ermöglicht, den Schüler identifizieren zu können (Authentifizierung). Die Applikation soll rein im Browser laufen und überall in einer API mit dem Backend kommunizieren.
Wir wollen kein Server-Site-Rendering, kein Next.js und ähnliche Technologien, sondern ich möchte für die Zukunft die Möglichkeit haben, die API zu skripten und auf anderen Apps anzustoßen.
Das heißt, ich möchte eine klare Trennung zwischen Backend und Frontend haben. Also zwei Komponenten: Frontend und Backend.
Das Frontend ist rein Web-basiert mit einem passenden Framework dazu.
Was wir in der App machen wollen ist:
- Fotos machen und hochladen
- Dateien hochladen
- Text einzugeben
- Sprache einzugeben
Das Hauptinterface wird ein Chat-basiertes Interface sein.
Wir sehen davon ab, für diesen Teil ein klassisches UI zu bauen. Das wird ein reines Chat-UI.
Für die Abfrage, was alles hinterlegt ist, werden wir später ein zweites Frontend, etwas administratives, bauen.
Momentan möchte ich wirklich einen AI-first Ansatz gehen und schauen, wie weit wir da kommen.
Das heißt, auch der Chatbot kann mir sagen, was zu welchem Tag gespeichert ist und kann potenziell wieder Informationen löschen.
Ich möchte jetzt mal versuchen, ob wir von einem klassischen UI wegkommen.