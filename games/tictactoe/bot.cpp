#include <bits/stdc++.h>
using namespace std;

int main() {
    srand(time(0));
    while(true) {
        vector<pair<int, int>> empty;
        char s[5];
        for(int i = 0; i < 3; i++) {
            scanf("%s", s);
            for(int j = 0; j < 3; j++)
                if(s[j] == '.') empty.emplace_back(i, j);
        }
        scanf("%s", s);
        assert(s == string("END"));
        int k = rand() % empty.size();
        printf("%d %d\n", empty[k].first, empty[k].second);
        printf("END\n");
        fflush(stdout); //o tym nie mozna zapominac, odpowiednik w iostream to cout << flush
    }
}