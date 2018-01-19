Jak działa `runGame`:

- argumenty: `game`, `bots`, `options`
  - `game`: obiekt zawierający pola `command` - polecenie (a właściwie ścieżka do programu), które ma wywołać zarządcę gry oraz `args` - lista argumentów, które chcemy przekazać do programu. Do listy argumentów dodane zostaną dwie wartości: ziarno, które program może użyć do losowania oraz liczba graczy
  - `bots`: lista obiektów opisujących, jak uruchomić boty w takim samym formacie jak dla `game` (tylko boty nie dostają tych dwóch dodatkowych argumentów)
  - `options`: obiekt zawierający (lub nie, wtedy brana jest wartość domyślna) 3 pola:
    - `timeLimit`: czas w milisekundach, jaki ma bot od momentu wysłania do niego opisu tury do momentu wysłania komend na serwer (domyślnie `1000`)
    - `messageTimeLimit`: maksymalny czas w milisekundach, jaki może upłynąć pomiędzy dwiema wiadomościami wysłanymi przez nadzorcę (o wiadomościach później). Służy on tylko do wykrywania i ubijania zawieszających się nadzorców. Domyślnie `10000`
    - `seed`: ziarno przekazane do nadzorcy (domyślnie `0`)
    
- funkcja tworzy sobie jakiś katalog znajdujący się w `data/games/`, w którym umieści pliki opisujące przebieg gry
- zwraca `Promise` na obiekt zawierający następujące pola:
  - `results`: tablica długości równej liczbie botów. I-ta komórka powinna mówić, które miejsce zajął i-ty bot (licząc od 1). Dopuszczalne są remisy
  - `inputs`: tablica długości równej liczbie botów, która zawiera ścieżki do plików z wejściem przekazanym z serwera do botów
  - `outputs`: j.w. tylko pliki zawierają wyjście wypisane przez boty
  - `errs`: j.w. tylko pliki zawierają tekst wypisany przez boty na `stderr` <- to trzeba jeszcze dopracować
  - `history`: zawiera ścieżkę do jsona, który opisuje przebieg gry. Json ma następujące pola:
    - `updates`: obiekt zawierający `turn` - numer tury i `description` - opis świata, który może być dowolny (zależny od gry). Może być kilka update'ów z tym samym numerem tury! To zależy od typu gry - kiedy gra jest taka, że wszyscy wykonują ruchy jednocześnie, zazwyczaj będziemy robić jeden update na turę, kiedy gracze robią ruchy na przemian, będzie kilka update'ów na turę (po każdym ruchu)
    - `fails`: lista faili botów (na przykład kiedy bot wypisał niepoprawne wyjście). Każdy wpis zawiera pola `player` (numer gracza), `reason` (wyjaśnienie błędu) i `turn` (numer tury). Fail oznacza natychmiastowe wypadnięcie bota z gry
    - `results`: wyniki gry, w takim formacie jak wcześniej
    - `initialInfo`: może zawierać cokolwiek, co gra uzna za potrzebne dla wizualizacji. Może też być nullem
    
- nadzorca gry musi dbać o 3 rzeczy:
  - wysyłanie informacji o grze do serwera. W tym celu wypisuje na standardowe wyjście json, który zawsze zawiera pole `type`. Pozostałe pola zależą od typu: Dostępne typy:
    - `player_failed` - wtedy wiadomość powinna też zawierać pola `player` i `reason` informujące o tym, który gracz przegrał i dlaczego
    - `finished` - informacja o końcu gry, wiadomość powinna zawierać pole `results` w takim formacie, jak wcześniej
    - `update` - przesłanie update'a. Zawiera pola: `nextTurn` - czy ten update zakończył turę (powinno być `true` dla update'a wysyłanego po ruchu ostatniego gracza), `description` - jakiś opis świata gry
    - `initial_info` - zawiera pole `description`. Może (ale nie musi) być wysłane raz na początku gry.
    - `keep_alive` - raczej nie będzie potrzebne. W przypadku, gdyby gra potrzebowała dużo czasu na obliczenia i nie chciała, żeby serwer ją ubił, może wysyłać co jakiś czas ten komunikat
    - W Node.JS zamiast wypisywać JSONa na standardowe wyjście, można wysłać odpowiedni obiekt przez funkcję `process.send`. W C++ warto skorzystać z biblioteki https://github.com/nlohmann/json (do działania wymaga tylko ściągnięcia jednego pliku [json.hpp](https://github.com/nlohmann/json/releases/download/v3.0.0/json.hpp))
  - wysyłanie informacji o świecie gry do botów. By wysłać informacje do bota o numerze `i` trzeba utworzyć strumień zapisujący do deskryptora pliku (ang. file descriptor) o numerze `2 * i + 3`. Jak nie wiecie, co to deskryptor pliku, to nic nie szkodzi. W C/C++, aby to zrobić, trzeba utworzyć na przykład ```FILE *output = fdopen(2 * nr + 3, "w")```. Wtedy można pisać do pliku `output` przez `fprintf`. W Pythonie na przykład trzeba użyć funkcji [os.fdopen](https://docs.python.org/2.7/library/os.html#os.fdopen), a w Node.JS odpowiedniej wersji [fs.createWriteStream](https://stackoverflow.com/questions/24582183/how-to-stream-to-from-a-file-descriptor-in-node). Wysłany opis może być dowolny (tu już raczej nie używamy JSONów), ale za każdym razem musi się zakończyć osobną linią zawierającą `END`. W C++ ważne jest, żeby po każdym wysłaniu wiadomości wykonać `fflush(output)`.
  - odbieranie wiadomości od botów. Tutaj jest analogicznie. Tworzymy strumień czytający z deskryptora pliku `2 * i + 4` (w C++ ```FILE *input = fdopen(2 * nr + 4, "r")```). Także każdy bot, po wysłaniu wszystkich informacji z danej tury, powinien wypisać jedną linię zawierającą słowo `END`.
  
  - boty po prostu działają w pętli (może być nawet nieskończona), w której na zmianę wczytują ze standardowego wejścia opis świata (zakończony linią `END`) i wypisują na wyjście swoje polecenia (też zakończone linią `END`). Boty też muszą pamiętać o ```fflush(stdout)```
