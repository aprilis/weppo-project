#include <bits/stdc++.h>
#include "json.hpp" //z biblioteki https://github.com/nlohmann/json
using namespace std;
using json = nlohmann::json;

struct board {
    int tab[3][3];

    vector<vector<pair<int, int>>> lines;

    board() {
        for(int i = 0; i < 3; i++)
            for(int j = 0; j < 3; j++)
                tab[i][j] = -1;
        for(int i = 0; i < 3; i++) {
            lines.push_back({{i, 0}, {i, 1}, {i, 2}});
            lines.push_back({{0, i}, {1, i}, {2, i}});
        }
        lines.push_back({{0, 0}, {1, 1}, {2, 2}});
        lines.push_back({{2, 0}, {1, 1}, {0, 2}});
    }

    bool set(int x, int y, int val) {
        if(tab[x][y] != -1)
            return false;
        tab[x][y] = val;
        return true;
    }

    int checkLine() {
        for(auto l: lines) {
            vector<int> v;
            for(auto p: l)
                v.push_back(tab[p.first][p.second]);
            if(v[0] != -1 && v[1] == v[0] && v[2] == v[0])
                return v[0];
        }
        return -1;
    }

    char sign(int nr) {
        if(nr == -1) return '.';
        if(nr == 0) return 'X';
        if(nr == 1) return 'O';
        assert(false);
    }

    void write(FILE *f) {
        for(int i = 0; i < 3; i++) {
            for(int j = 0; j < 3; j++)
                fprintf(f, "%c", sign(tab[i][j]));
            fprintf(f, "\n");
        }
    }
};

void sendJson(const json &j) {
    cout << j << endl;
}

void update(const board &b, bool nextTurn) {
    sendJson({
        {"type", "update"},
        {"description", {
            {"board", b.tab}
        }},
        {"nextTurn", nextTurn}
    });
}

void finish(int loser) {
    sendJson({
        {"type", "finished"},
        {"results", { loser != 0 ? 1 : 2, loser != 1 ? 1 : 2 }}
    });
    exit(0);
}

void playerFailed(int nr, string reason) {
    sendJson({
        {"type", "player_failed"},
        {"player", nr},
        {"reason", reason}
    });
    finish(nr);
}

void myAssert(bool condition, int nr, string message) {
    if(!condition)
        playerFailed(nr, message);
}

bool inRange(int x, int a, int b) {
    return a <= x && x <= b;
}

int main(int argc, char *argv[]) {
    assert(argv[argc-1] == string("2"));
    FILE *inputs[2], *outputs[2];
    for(int i = 0; i < 2; i++) {
        outputs[i] = fdopen(2 * i + 3, "w");
        inputs[i] = fdopen(2 * i + 1 + 3, "r");
    }
    board b;
    update(b, false);
    int moves = 0;
    while(true) {
        for(int p = 0; p < 2; p++) {
            b.write(outputs[p]);
            fprintf(outputs[p], "END\n");
            fflush(outputs[p]);
            int x, y;
            char end[5];
            cerr << "reading" << endl;
            myAssert(fscanf(inputs[p], "%d %d", &x, &y) == 2,      p, "Invalid output1");
            myAssert(fscanf(inputs[p], "%4s", end) == 1,            p, "Invalid output2");
            myAssert(inRange(x, 0, 2) && inRange(y, 0, 2),          p, "Values are not in range [0, 2]");
            myAssert(end == string("END"),                          p, "Missing END token");
            myAssert(b.set(x, y, p),                                p, "Selected field that was not empty");
            cerr << "finished" << endl;
            update(b, p == 0);
            if(b.checkLine() == p)
                finish(1 - p);
            if(++moves == 9)
                finish(-1);
        }
    }
}
